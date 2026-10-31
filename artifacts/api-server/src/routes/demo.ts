import express, { Router, type Request, type Response } from "express";
import { quoteDemoSwap } from "../lib/demo-swap-pool";
import { TRANSACTION_FEE_USDC } from "../lib/earnings-wallet";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { CreateDemoMovementBody, UpdateDemoProfileBody, GetDemoDashboardResponse, RequestDemoProfileAvatarBody, RequestDemoProfileAvatarResponse, UpdateDemoLotteryParticipationBody } from "@workspace/api-zod";
import { loadDashboard, ClaimedBrowserAccountError } from "../lib/demo-store";
import { verifiedAccount, updateAccountName } from "../lib/account-identity";
import { DemoInputError } from "../lib/demo-state";
import { BuyDemoLotteryEntriesBody } from "@workspace/api-zod";
import { historyPage } from "../modules/audit/infrastructure/history-store";
import { PreviewHistoryDistributionBody } from "@workspace/api-zod";
import { historyQuery } from "../modules/audit/transport/history-filters";
import { canReadTreasuryHistory } from "../modules/accounts/infrastructure/history-permission";
import { CommandSimulationBody, GetSimulationResponse } from "@workspace/api-zod";
import { simulationSnapshot, mutateSimulation } from "../modules/simulation/infrastructure/scenario-store";
import { permittedOrigin } from "./test-accounts";
import { demoTabIdentity } from "../modules/simulation/infrastructure/demo-tab-session";
import { AVATAR_LIMIT, AVATAR_TYPES, createAvatarUpload, storeAvatarUpload, ProfileAvatarError, validateProfileAvatar, serveProfileAvatar, validAvatarId, removeProfileAvatar } from "../lib/profile-avatar";
import { GetDemoRoundArchiveQueryParams, GetDemoRoundArchiveResponse } from "@workspace/api-zod";
import { roundArchivePage } from "../lib/round-archive-store";
import { statementFilters } from "../lib/treasury-statement";
import { treasuryStatement, treasuryStatementCsv } from "../lib/treasury-statement-store";
import { treasuryTestWalletPage } from "../modules/wallets/infrastructure/treasury-test-wallet-store";
import { PlayDemoDouble2xBody } from "@workspace/api-zod";
import { doubleSnapshot, reconcileDouble, settleSimulatedDouble, startDouble2xWorker } from "../lib/double2x-store";

const router = Router();
startDouble2xWorker();
const cookieName = "bettex_demo";
const requests = new Map<string, { count: number; reset: number }>();
router.use("/demo", (req, res, next) => {
  const tab = req.headers["x-bettex-demo-session"];
  if (tab !== undefined && (typeof tab !== "string" || !/^[a-f0-9]{64}$/.test(tab))) {
    res.status(400).json({ error: "invalid_demo_tab_session" }); return;
  }
  if(process.env.NODE_ENV==="production" && !tab){
    res.status(403).json({error:"app_in_development"});return;
  }
  if (req.method !== "GET" && req.headers["sec-fetch-site"] === "cross-site") {
    res.status(403).json({ error: "invalid_movement" }); return;
  }
  if (req.method !== "GET" && (!permittedOrigin(req) || !req.is("application/json"))) {
    res.status(403).json({ error: "origin_not_allowed" }); return;
  }
  const now = Date.now();
  // Background polling must not consume the budget for account mutations.
  const read = req.method === "GET";
  const key = `${read ? "read" : "write"}:${req.ip ?? req.socket.remoteAddress ?? "unknown"}`;
  if (requests.size > 5000) for (const [id, entry] of requests) if (entry.reset < now) requests.delete(id);
  const entry = requests.get(key);
  if (entry && entry.reset > now) {
    if (++entry.count > (read ? 300 : 90)) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((entry.reset - now) / 1000))));
      res.status(429).json({ error: "rate_limited" }); return;
    }
  } else requests.set(key, { count: 1, reset: now + 60000 });
  res.set("Cache-Control", "no-store");
  next();
});
router.get("/demo/double2x", async (req, res) => {
  try {
    if (!await userDashboard(req, res)) return;
    const id = String(res.locals.demoHistorySubject).slice(5);
    await settleSimulatedDouble(id);
    void reconcileDouble(id).catch(() => req.log.warn({ code: "double2x_pending" }, "Double 2X settlement will retry"));
    res.json(await doubleSnapshot(id));
  } catch (e) { errorResponse(req, res, e); }
});
router.post("/demo/double2x", async (req, res) => {
  try {
    const parsed = PlayDemoDouble2xBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "invalid_double2x_play" }); return; }
    if (!await userDashboard(req, res)) return;
    const id = String(res.locals.demoHistorySubject).slice(5);
    const before = await doubleSnapshot(id);
    // A retry is safe even when the original reservation already used the funds.
    const duplicate = before.plays.find(p => p.id === parsed.data.requestId);
    if (!duplicate && !before.canPlay) {
      res.status(409).json({ error: before.pending ? "double2x_pending" : before.nextPlayAt && Date.parse(before.nextPlayAt) > Date.now()
        ? "double2x_daily_limit" : before.balanceUsdc <= 0 ? "double2x_no_earnings" : `double2x_${before.reason}` }); return;
    }
    if (!await userDashboard(req, res, { double2x: { ...parsed.data, executionMode: before.executionMode ?? "testnet" } })) return;
    await settleSimulatedDouble(id);
    void reconcileDouble(id).catch(() => req.log.warn({ code: "double2x_pending" }, "Double 2X settlement will retry"));
    res.json(await doubleSnapshot(id));
  } catch (e) { errorResponse(req, res, e); }
});
router.get("/demo/swap-quote", async (req, res) => {
  try {
    const snapshot = await userDashboard(req, res);
    if (!snapshot?.treasury.swapPool) { res.status(400).json({ error: "pool_liquidity_unavailable" }); return; }
    const quote = quoteDemoSwap(snapshot.treasury.swapPool, String(req.query.asset), Number(req.query.amount), TRANSACTION_FEE_USDC);
    res.json(quote);
  } catch (error) {
    if (error instanceof Error && ["invalid_movement", "pool_liquidity_unavailable", "swap_amount_below_fee"].includes(error.message)) {
      res.status(400).json({ error: error.message }); return;
    }
    throw error;
  }
});
function accountId(req: Request, res: Response, rotate = false, authenticated = false) {
  const tab = demoTabIdentity(req.headers["x-bettex-demo-session"], authenticated);
  if (tab) return tab;
  const raw = req.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const token = !rotate && raw && /^[a-f0-9]{64}$/.test(raw) ? raw : randomBytes(32).toString("hex");
  if (token !== raw) res.cookie(cookieName, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" || req.secure || req.headers["x-forwarded-proto"] === "https",
    maxAge: 365 * 86400000, path: "/api/demo",
  });
  return createHash("sha256").update(token).digest("hex");
}
async function userDashboard(req: Request, res: Response, command?: Parameters<typeof loadDashboard>[1]) {
  // Public demos never inherit real account permissions or balances.
  const user = process.env.NODE_ENV === "production" ? undefined : await verifiedAccount(req);
  res.locals.nativeHistorySubject = user?.nativeAccountId ? `native:${user.nativeAccountId}` : undefined;
  res.locals.nativeAccountId = user?.nativeAccountId;
  const browserId = accountId(req, res, false, !!user);
  res.locals.demoBrowserId = browserId;
  try {
    const result = await loadDashboard({ browserId, ...user, tabScoped: !!req.headers["x-bettex-demo-session"] }, command, id => { res.locals.demoHistorySubject = `demo:${id}`; });
    if (result) result.profile.canViewTreasuryHistory = !!user?.nativeAccountId && await canReadTreasuryHistory(user.nativeAccountId);
    return result;
  } catch (error) {
    if (!(error instanceof ClaimedBrowserAccountError)) throw error;
    const freshId = accountId(req, res, true);
    res.locals.demoBrowserId = freshId;
    if (command) {
      res.status(403).json({ error: "authentication_required" });
      return undefined;
    }
    return loadDashboard({ browserId: freshId }, undefined, id => { res.locals.demoHistorySubject = `demo:${id}`; });
  }
}
function errorResponse(req: Request, res: Response, error: unknown) {
  if (error instanceof ProfileAvatarError) { res.status(400).json({ error: "invalid_avatar" }); return; }
  if (error instanceof DemoInputError) { res.status(400).json({ error: error.message }); return; }
  if (error instanceof Error && ["email_verification_required", "account_unavailable"].includes(error.message)) {
    res.status(403).json({ error: error.message }); return;
  }
   req.log.error({ code: "engine_unavailable" }, "Demo request failed");
  res.status(503).json({ error: "engine_unavailable" });
}
router.get("/demo/dashboard", async (req, res) => {
  try {
    res.json(GetDemoDashboardResponse.parse(await userDashboard(req, res)));
  } catch (error) { errorResponse(req, res, error); }
});
router.post("/demo/lottery/participation", async (req, res) => {
  if (!permittedOrigin(req) || !req.is("application/json")) { res.status(403).json({ error: "origin_not_allowed" }); return; }
  const parsed = UpdateDemoLotteryParticipationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid_lottery_participation" }); return; }
  try {
    res.json(GetDemoDashboardResponse.parse(await userDashboard(req, res, { lottery: parsed.data })));
  } catch (error) { errorResponse(req, res, error); }
});
router.post("/demo/lottery/entries", async (req, res) => {
  if (!permittedOrigin(req) || !req.is("application/json")) { res.status(403).json({ error: "origin_not_allowed" }); return; }
  const parsed = BuyDemoLotteryEntriesBody.safeParse(req.body);
  if (!parsed.success || Object.keys(req.body).some(key => !["requestId", "quantity", "paymentAsset", "confirmed", "drawAt"].includes(key))) {
    res.status(400).json({ error: "invalid_lottery_purchase" }); return;
  }
  try { res.json(GetDemoDashboardResponse.parse(await userDashboard(req, res, { lotteryEntries: parsed.data }))); }
  catch (error) { errorResponse(req, res, error); }
});
// This namespace only runs the pure emulated scenario engine. It grants no native account rights.
router.all("/demo/simulation", async (req, res) => {
  res.set("Cache-Control", "private, no-store");
  try {
    if (!["GET", "POST"].includes(req.method)) { res.sendStatus(405); return; }
    await userDashboard(req, res);
    if (!res.locals.demoHistorySubject) { res.status(403).json({ code: "session_unavailable" }); return; }
    const owner = `browser-simulation:${res.locals.demoHistorySubject}`;
    const csrf = createHash("sha256").update(`simulation-csrf:${res.locals.demoBrowserId}`).digest("hex");
    let id = typeof req.query.runId === "string" ? req.query.runId : undefined;
    if (req.method === "POST") {
      if (!permittedOrigin(req) || !req.is("application/json")) { res.status(403).json({ code: "origin_not_allowed" }); return; }
      const parsed = CommandSimulationBody.safeParse(req.body);
      if (!parsed.success) { res.status(400).json({ code: "invalid_simulation_command" }); return; }
      const a = Buffer.from(parsed.data.csrf), b = Buffer.from(csrf);
      if (a.length !== b.length || !timingSafeEqual(a, b)) { res.status(403).json({ code: "csrf_invalid" }); return; }
      const { csrf: unused, ...terms } = parsed.data;
      const hash = createHash("sha256").update(JSON.stringify(terms)).digest("hex");
      id = await mutateSimulation(owner, terms, hash, `sim:${randomUUID()}`);
    }
    const offset = Number(req.query.offset ?? 0);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1000000) { res.status(400).json({ code: "invalid_offset" }); return; }
    const state = await simulationSnapshot(owner, id, typeof req.query.kind === "string" ? req.query.kind : undefined, offset);
    res.json({ ...GetSimulationResponse.parse(state), run: state.run, csrf });
  } catch (error) {
    const code = error instanceof Error ? error.message : "simulation_unavailable";
    const known = ["simulation_not_found", "simulation_run_required", "simulation_revision_changed", "simulation_idempotency_conflict", "simulation_paused", "invalid_amount", "unknown_simulation_action"];
    res.status(code === "simulation_not_found" ? 404 : known.includes(code) ? 409 : 503).json({ code: known.includes(code) ? code : "simulation_unavailable" });
  }
});
router.get("/demo/treasury/wallets", async (req, res) => {
  try {
    const dashboard = await userDashboard(req, res);
    if (!dashboard || res.headersSent) return;
    if (dashboard.profile.provider === "native") {
      res.status(409).json({ code: "simulated_treasury_wallets_only" }); return;
    }
    res.json(await treasuryTestWalletPage());
  } catch {
    // Never include vault material or crypto-library exception inputs in logs.
    req.log.error({ code: "treasury_test_wallets_unavailable" }, "Test Treasury wallets unavailable");
    res.status(503).json({ code: "treasury_test_wallets_unavailable" });
  }
});
for (const exportCsv of [false, true]) router.get(`/demo/treasury/statement${exportCsv ? "/export" : ""}`, async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const filters = statementFilters(req.query);
    await userDashboard(req, res);
    const result = await treasuryStatement(filters);
    if (exportCsv) {
      res.set("Content-Disposition", `attachment; filename="treasury-${filters.from}-${filters.to}.csv"`);
      res.type("text/csv").send(treasuryStatementCsv(result.entries, filters.locale));
    } else res.json(result.page);
  } catch (error) {
    if (error instanceof Error && error.message === "invalid_statement_filters") {
      res.status(400).json({ code: "invalid_statement_filters" }); return;
    }
    errorResponse(req, res, error);
  }
});
router.get("/demo/treasury/activity", async (req, res) => {
  const roundId = String(req.query.roundId ?? ""), view = String(req.query.view ?? "history");
  const page = Number(req.query.page ?? 1), pageSize = Number(req.query.pageSize ?? 20);
  const snapshot = req.query.snapshot === undefined ? undefined : String(req.query.snapshot);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(roundId) || !Number.isFinite(Date.parse(`${roundId}T00:00:00Z`))
    || new Date(`${roundId}T00:00:00Z`).toISOString().slice(0, 10) !== roundId
    || !["closed", "fees", "history"].includes(view) || !Number.isInteger(page) || page < 1 || page > 100000
    || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50 || snapshot !== undefined && !/^\d{1,20}$/.test(snapshot)) {
    res.status(400).json({ code: "invalid_filters" }); return;
  }
  res.set("Cache-Control", "no-store");
  try {
    await userDashboard(req, res);
    const { treasuryActivityPage } = await import("../lib/treasury-activity-store");
    res.json(await treasuryActivityPage(roundId, view as "closed" | "fees" | "history", page, pageSize, snapshot));
  } catch (error) { errorResponse(req, res, error); }
});
router.get("/demo/rounds", async (req, res) => {
  try {
    const input = GetDemoRoundArchiveQueryParams.safeParse(req.query);
    if (!input.success) { res.status(400).json({ error: "invalid_pagination" }); return; }
    const dashboard = await userDashboard(req, res);
    if (!dashboard || dashboard.profile.provider === "native") {
      res.status(403).json({ error: "unavailable_in_native_protocol" }); return;
    }
    const subject = String(res.locals.demoHistorySubject).replace(/^demo:/, "");
    res.json(GetDemoRoundArchiveResponse.parse(await roundArchivePage(subject, input.data.page ?? 1, input.data.pageSize ?? 10, input.data.round)));
  } catch (error) { errorResponse(req, res, error); }
});
router.get("/demo/history", async (req, res) => {
  try {
    const filters = historyQuery.safeParse(req.query);
    if (!filters.success) { res.status(400).json({ code: "invalid_filters" }); return; }
    await userDashboard(req, res);
    const admin = filters.data.view === "treasury";
    if (admin && (!res.locals.nativeAccountId || !await canReadTreasuryHistory(res.locals.nativeAccountId))) { res.status(403).json({ code: "permission_required" }); return; }
    res.json(await historyPage(res.locals.demoHistorySubject, { ...filters.data,
      from: filters.data.from?.toISOString(), to: filters.data.to?.toISOString() }, admin, res.locals.nativeHistorySubject));
  } catch (e) {
    if (e instanceof Error && ["invalid_cursor", "invalid_period"].includes(e.message)) { res.status(400).json({ code: "invalid_filters" }); return; }
    errorResponse(req, res, e);
  }
});
router.post("/demo/history/distribution-preview", async (req, res) => {
  if (process.env.NODE_ENV === "production") { res.status(403).json({ code: "test_environment_required" }); return; }
  const input = PreviewHistoryDistributionBody.safeParse(req.body);
  if (!input.success) { res.status(400).json({ code: "invalid_input" }); return; }
  try { await userDashboard(req, res, { distributionPreview: input.data.requestId }); res.json({ recorded: true }); }
  catch (e) { errorResponse(req, res, e); }
});
router.post("/demo/movements", async (req, res) => {
  const input = CreateDemoMovementBody.safeParse(req.body);
  if (!input.success) { res.status(400).json({ error: "invalid_movement" }); return; }
  try {
    const result = await userDashboard(req, res, { movement: input.data });
    if (result) res.json(GetDemoDashboardResponse.parse(result));
  } catch (error) { errorResponse(req, res, error); }
});
router.post("/demo/profile/avatar/upload-url", async (req, res) => {
  const input = RequestDemoProfileAvatarBody.safeParse(req.body);
  if (!input.success) { res.status(400).json({ error: "invalid_avatar" }); return; }
  try {
    // Identity is resolved from the native/Clerk session or the isolated demo credential,
    // never from a client-provided owner/account id.
    await userDashboard(req, res);
    if (!res.locals.demoHistorySubject) { res.status(403).json({ error: "authentication_required" }); return; }
    const { uploadURL, objectPath } = createAvatarUpload();
    const result = await userDashboard(req, res, { avatarUpload: { ...input.data, objectPath, expiresAt: Date.now() + 15 * 60_000 } });
    if (result) res.json(RequestDemoProfileAvatarResponse.parse({ uploadURL, objectPath }));
  } catch (error) { errorResponse(req, res, error); }
});
router.put("/demo/profile/avatar/upload/:id", express.raw({ type: [...AVATAR_TYPES], limit: AVATAR_LIMIT }), async (req, res) => {
  try {
    await storeAvatarUpload(req.params.id, req.headers["content-type"], req.body);
    res.sendStatus(200);
  } catch (error) { errorResponse(req, res, error); }
});
router.get("/profile-pictures/:id", async (req, res) => {
  if (!validAvatarId(req.params.id)) { res.sendStatus(404); return; }
  try { await serveProfileAvatar(req.params.id, res); }
  catch { if (!res.headersSent) res.sendStatus(404); }
});
router.patch("/demo/profile", async (req, res) => {
  const input = UpdateDemoProfileBody.safeParse(req.body);
  if (!input.success || input.data.name.trim().length < 2 || (input.data.nickname !== undefined && !input.data.nickname.trim())) { res.status(400).json({ error: "invalid_profile" }); return; }
  try {
    let previousAvatar: string | null | undefined;
    if (input.data.avatarPath !== undefined) {
      const current = await userDashboard(req, res);
      if (!current || !res.locals.demoHistorySubject) return;
      previousAvatar = current.profile.avatarPath;
      if (input.data.avatarPath !== null) await validateProfileAvatar(res.locals.demoHistorySubject, input.data.avatarPath);
    }
    if (process.env.NODE_ENV !== "production" && input.data.email === undefined && input.data.nickname === undefined && input.data.avatarPath === undefined) await updateAccountName(req, input.data.name);
    const result = await userDashboard(req, res, input.data);
    if (result) {
      res.json(GetDemoDashboardResponse.parse(result));
      if (previousAvatar && previousAvatar !== input.data.avatarPath) {
        void removeProfileAvatar(previousAvatar, res.locals.demoHistorySubject).catch(() => {
          req.log.warn({ code: "avatar_cleanup_failed" }, "Previous profile picture cleanup failed");
        });
      }
    }
  } catch (error) { errorResponse(req, res, error); }
});
export default router;