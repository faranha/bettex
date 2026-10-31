import { appendHistory, ensureHistorySchema, historyDetail } from "../modules/audit/infrastructure/history-store";
/**
 * Composition root for the development-only account workflow.
 * Coordinates the two owned stores in one transaction; never signs transactions.
 */
import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { TestAccountCommandBody } from "@workspace/api-zod";
import { AccountFailure, checkedName, checkedPassword, normalizedEmail, NO_RECOVERY_NOTICE_VERSION, registerPersonalTestAccount, canUsePersonalTestAccounts } from "../modules/accounts";
import { accountsStore, ensureAccountsSchema, limitAuthAttempts } from "../modules/accounts/infrastructure/store";
import { digest, passwordHash, passwordMatches, requirePassword } from "../modules/accounts/infrastructure/security";
import { walletsStore, ensureWalletsSchema, validatePublicWallets } from "../modules/wallets/infrastructure/store";
import { canReadTreasuryHistory } from "../modules/accounts/infrastructure/history-permission";
import { allowedOrigin } from "../middlewares/http-security";

const router = Router();
const cookieName = "bettex_test_session";
export const testAccountsEnabled = (mode = process.env.NODE_ENV) => canUsePersonalTestAccounts(mode);
let ready: Promise<void> | undefined;
const initialize = () => ready ??= ensureAccountsSchema().then(ensureWalletsSchema).catch(error => { ready = undefined; throw error; });
export function token(req: Request) {
  return req.headers.cookie?.split(";").map(c => c.trim()).find(c => c.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) ?? "";
}
function setSession(req: Request, res: Response, value: string) {
  res.clearCookie(cookieName, { path: "/api/test-account" });
  res.cookie(cookieName, value, { httpOnly: true, sameSite: "strict",
    secure: req.secure || req.get("x-forwarded-proto") === "https",
    path: "/api", maxAge: 60 * 60 * 1000 });
}
export function permittedOrigin(req: Request) {
  return allowedOrigin(req.get("origin"));
}
function validateEnvelope(envelope: { salt: string; iv: string; ciphertext: string; registrationId: string }, registrationId: string) {
  const base64 = /^[A-Za-z0-9+/]+={0,2}$/;
  if (envelope.registrationId !== registrationId || !base64.test(envelope.salt)
    || !base64.test(envelope.iv) || !base64.test(envelope.ciphertext)
    || Buffer.from(envelope.salt, "base64").length !== 32 || Buffer.from(envelope.iv, "base64").length !== 12) {
    throw new AccountFailure("invalid_vault");
  }
}
async function snapshot(sessionToken: string) {
  const session = await accountsStore().session(sessionToken);
  const account = session && await accountsStore().byId(session.accountId);
  if (!account || !session) return { enabled: true, account: null, wallets: [], vault: null, csrf: "", isAdmin: false };
  const material = await walletsStore().read(account.id);
  return { enabled: true, account: { id: account.id, displayName: account.displayName,
    email: account.email, emailVerified: false, revision: account.revision,
    acceptedAt: account.acceptedAt.toISOString(), noticeVersion: account.noticeVersion }, ...material, csrf: session.csrf,
    isAdmin: await canReadTreasuryHistory(account.id) };
}
function failure(res: Response, error: unknown, req: Request) {
  if (error instanceof AccountFailure) return res.status(error.status).json({ code: error.code });
  // Database errors may contain parameters. Never serialize them or request bodies.
  req.log.error({ code: "test_account_storage_failure" }, "Test account operation failed");
  return res.status(503).json({ code: "service_unavailable" });
}
router.use(["/account", "/test-account"], (req, res, next) => {
  res.set("Cache-Control", "no-store, private");
  res.set("Pragma", "no-cache");
  if (!testAccountsEnabled()) {
    if (req.method === "GET" && req.path === "/session") res.json({ enabled: false, account: null, wallets: [], vault: null, csrf: "" });
    else res.status(403).json({ code: "test_environment_required" });
    return;
  }
  next();
});
router.get(["/account/session", "/test-account/session"], async (req, res) => {
  try { await initialize(); res.json(await snapshot(token(req))); }
  catch (error) { failure(res, error, req); }
});
router.post(["/account/commands", "/test-account/commands"], async (req, res) => {
  let auditAccount: string | undefined;
  const correlationId = randomUUID();
  const activity = (accountId: string, kind: string, state = "confirmed", data: Record<string, unknown> = {}, key: string = correlationId) =>
    ({ key: `account:${key}:${kind}:${state}`, subject: `native:${accountId}`, correlationId: key,
      category: "activity" as const, kind, state, actor: "user" as const, environment: "account_test" as const,
      source: "accounts", data });
  try {
    await ensureHistorySchema();
    if (!permittedOrigin(req) || !req.is("application/json")) throw new AccountFailure("origin_not_allowed", 403);
    await initialize();
    const parsed = TestAccountCommandBody.strict().safeParse(req.body);
    if (!parsed.success) throw new AccountFailure("invalid_input");
    const body = parsed.data;
    // IP is not taken from an arbitrary client-supplied body/header.
    const source = req.ip ?? req.socket.remoteAddress ?? "unknown";
    await limitAuthAttempts(`global:${source}`, 200);
    const currentToken = token(req);
    let resultToken = currentToken;
    if (body.action === "signup") {
      const email = normalizedEmail(body.email), name = checkedName(body.displayName);
      const password = checkedPassword(body.password, true);
      if (!body.accepted || body.noticeVersion !== NO_RECOVERY_NOTICE_VERSION || !body.registrationId || !body.wallets || !body.vault) {
        throw new AccountFailure("consent_required");
      }
      validateEnvelope(body.vault, body.registrationId);
      validatePublicWallets(body.wallets);
      await limitAuthAttempts(`signup:${source}`, 15);
      const hash = await passwordHash(password);
      resultToken = await db.transaction(async transaction => {
        const accounts = accountsStore(transaction), wallets = walletsStore(transaction);
        // Serialize email/registration races across processes, not only this server.
        const { sql } = await import("drizzle-orm");
        await transaction.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`signup:${email}`}))`);
        const existed = await accounts.byEmail(email);
        const registered = await registerPersonalTestAccount({ email, displayName: name, password, passwordHash: hash,
          registrationId: body.registrationId!, accepted: body.accepted!, noticeVersion: body.noticeVersion! }, {
          ...accounts, verifyPassword: requirePassword, nextId: randomUUID, now: () => new Date(),
          provisionPersonalWallets: id => wallets.provision(id, body.wallets!, body.vault),
          assertOriginalWallets: async id => {
            const original = await wallets.read(id);
            if (digest(JSON.stringify(original.wallets.map(w => w.address).sort()))
              !== digest(JSON.stringify(body.wallets!.map(w => w.address).sort()))) {
              throw new AccountFailure("registration_conflict", 409);
            }
          },
        });
        const registeredAccount = await accounts.byEmail(email);
        auditAccount = registeredAccount!.id;
        if (!existed) {
          await appendHistory(activity(auditAccount, "account_created", "confirmed", {}, `signup:${auditAccount}`), transaction);
          await appendHistory(activity(auditAccount, "consent_accepted", "confirmed", { noticeVersion: body.noticeVersion! }, `signup:${auditAccount}`), transaction);
          await appendHistory(activity(auditAccount, "wallets_created", "confirmed", { network: "421614", walletCount: "2" }, `signup:${auditAccount}`), transaction);
        }
        return registered;
      });
      setSession(req, res, resultToken);
    } else if (body.action === "signin") {
      const email = normalizedEmail(body.email), password = checkedPassword(body.password);
      await limitAuthAttempts(`signin:${source}:${email}`, 10);
      const account = await accountsStore().byEmail(email);
      auditAccount = account?.id;
      // Equal-cost KDF for absent users; no account-existence response.
      const candidate = account?.passwordHash ?? `scrypt:131072:8:1:${"0".repeat(64)}:${"0".repeat(64)}`;
      const matches = await passwordMatches(password, candidate);
      if (!account || !matches) throw new AccountFailure("invalid_credentials", 401);
      resultToken = await db.transaction(async tx => {
        const next = await accountsStore(tx).newSession(account.id);
        await appendHistory(activity(account.id, "login"), tx);
        return next.token;
      });
      setSession(req, res, resultToken);
    } else {
      const session = await accountsStore().session(currentToken);
      if (!session) throw new AccountFailure("session_required", 401);
      const supplied = Buffer.from(body.csrf ?? "");
      const expected = Buffer.from(session.csrf);
      if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
        throw new AccountFailure("session_required", 403);
      }
      const account = await accountsStore().byId(session.accountId);
      if (!account) throw new AccountFailure("session_required", 401);
      auditAccount = account.id;
      if (body.action === "signout") {
        await db.transaction(async tx => {
          await accountsStore(tx).revoke(currentToken);
          await appendHistory(activity(account.id, "logout"), tx);
        });
        res.clearCookie(cookieName, { path: "/api/test-account" });
        res.clearCookie(cookieName, { path: "/api" });
        resultToken = "";
      } else if (body.action === "name") {
        await db.transaction(async tx => {
          await accountsStore(tx).update(account.id, { displayName: checkedName(body.displayName) });
          await appendHistory(activity(account.id, "profile_changed", "confirmed", { field: "name" }), tx);
        });
      } else if (body.action === "private-result") {
        if (!body.requestId || !body.resultState) throw new AccountFailure("invalid_input", 400);
        const trace = `backup:${body.requestId}`;
        const authorized = await historyDetail(`native:${account.id}`, trace);
        if (!authorized.some(e => e.kind === "private_export_authorized")) throw new AccountFailure("invalid_input", 403);
        await appendHistory(activity(account.id, "private_export_result", body.resultState,
          { evidence: "browser_report", fileSavedConfirmed: "false" }, trace));
      } else {
        await limitAuthAttempts(`private:${source}:${account.id}`, 30);
        await requirePassword(checkedPassword(body.password), account.passwordHash);
        if (body.action === "private-request") {
          if (!body.requestId || !body.walletId || !body.privateAction) throw new AccountFailure("invalid_input", 400);
          const material = await walletsStore().read(account.id);
          const own = material.wallets.find(w => w.id === body.walletId);
          if (!own) throw new AccountFailure("invalid_input", 403);
          await appendHistory(activity(account.id, "private_export_authorized", "authorized",
            { action: body.privateAction, walletPurpose: own.purpose }, `backup:${body.requestId}`));
        } else if (body.action === "reauth") {
          await appendHistory(activity(account.id, "private_authorization", "authorized"));
        }
        if (body.action === "email") {
          const email = normalizedEmail(body.email);
          const other = await accountsStore().byEmail(email);
          if (other && other.id !== account.id) throw new AccountFailure("email_in_use", 409);
          await db.transaction(async tx => {
            await accountsStore(tx).update(account.id, { email }, account.revision);
            await appendHistory(activity(account.id, "profile_changed", "confirmed", { field: "email" }), tx);
          });
        } else if (body.action === "password") {
          const password = checkedPassword(body.newPassword, true);
          if (!body.vault || body.revision !== account.revision) throw new AccountFailure("stale_revision", 409);
          validateEnvelope(body.vault, account.registrationId);
          const hash = await passwordHash(password);
          resultToken = await db.transaction(async transaction => {
            const accounts = accountsStore(transaction);
            await accounts.update(account.id, { passwordHash: hash, revision: account.revision + 1 }, account.revision);
            await walletsStore(transaction).replaceEnvelope(account.id, body.vault);
            await accounts.revokeAll(account.id);
            await appendHistory(activity(account.id, "password_changed"), transaction);
            return (await accounts.newSession(account.id)).token;
          });
          setSession(req, res, resultToken);
        }
      }
    }
    res.json(await snapshot(resultToken));
  } catch (error) {
    if (auditAccount) {
      const code = error instanceof AccountFailure ? error.message : "operation_failed";
      await appendHistory(activity(auditAccount, "account_attempt", "failed", { reason: code }))
        .catch(() => req.log.warn({ code: "audit_unavailable" }, "Failed attempt could not be recorded"));
    }
    failure(res, error, req);
  }
});
export default router;
