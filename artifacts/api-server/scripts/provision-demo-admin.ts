/**
 * Development-only provisioning through the app's normal registration flow.
 * Credentials arrive through stdin, never source files, arguments or logs.
 */
import { eq, sql } from "drizzle-orm";
import { db, pool, demoAccounts, demoEngine } from "@workspace/db";
import { generatePersonalWallets } from "../../bettex-site/src/components/account/wallet-vault";
import { accountsStore } from "../src/modules/accounts/infrastructure/store";
import type { AccountState } from "../src/lib/demo-state";
import { appendHistory, historyId } from "../src/modules/audit/infrastructure/history-store";
import { decimalUnits } from "../src/modules/audit";

async function provision(input: { email: string; displayName: string; password: string }) {
  if (process.env.NODE_ENV !== "development") throw new Error("development_required");
  const domain = process.env.BETTEX_DEV_DOMAIN ?? process.env.REPLIT_DEV_DOMAIN;
  if (!domain) throw new Error("development_domain_required");
  let account = await accountsStore().byEmail(input.email.trim().toLowerCase());
  let sessionCookie = "";
  if (!account) {
    const material = await generatePersonalWallets(input.password);
    const response = await fetch(`https://${domain}/api/account/commands`, {
      method: "POST", headers: { "Content-Type": "application/json", Origin: `https://${domain}` },
      body: JSON.stringify({ action: "signup", ...input, accepted: true,
        noticeVersion: "personal-wallets-no-recovery-2026-10-05", ...material }),
    });
    if (!response.ok) throw new Error("registration_failed");
    sessionCookie = response.headers.getSetCookie().find(value => /^bettex_test_session=[a-f0-9]{64};/.test(value))?.split(";")[0] ?? "";
    account = await accountsStore().byEmail(input.email.trim().toLowerCase());
  } else {
    const response = await fetch(`https://${domain}/api/account/commands`, {
      method: "POST", headers: { "Content-Type": "application/json", Origin: `https://${domain}` },
      body: JSON.stringify({ action: "signin", email: input.email, password: input.password }),
    });
    if (!response.ok) throw new Error("authentication_failed");
    sessionCookie = response.headers.getSetCookie().find(value => /^bettex_test_session=[a-f0-9]{64};/.test(value))?.split(";")[0] ?? "";
  }
  if (!account || !sessionCookie) throw new Error("account_missing");
  const readDashboard = async () => {
    const response = await fetch(`https://${domain}/api/demo/dashboard`, { headers: { Cookie: sessionCookie } });
    if (!response.ok) throw new Error("dashboard_unavailable");
    return response.json() as Promise<{ profile: { accountId: string }; balances: { bettex: number; usdc: number } }>;
  };
  if ((await readDashboard()).profile.accountId !== account.id) throw new Error("identity_mismatch");
  const id = `native:${account.id}`;
  const correlationId = `demo:${id}:opening-balances`;
  const key = `${correlationId}:USDC`;
  await db.transaction(async tx => {
    // Same lock order as the demo engine; no lost updates or double credit.
    await tx.select().from(demoEngine).where(eq(demoEngine.id, "main")).for("update");
    const [row] = await tx.select().from(demoAccounts).where(eq(demoAccounts.id, id)).for("update");
    await tx.execute(sql`INSERT INTO test_account_permissions(account_id,permission)
      VALUES(${account!.id},'treasury_history') ON CONFLICT DO NOTHING`);
    const prior = await tx.execute(sql`SELECT 1 FROM history_events WHERE id=${historyId(key)}`);
    if (prior.rows.length) return;
    const state = row!.state as AccountState;
    const now = new Date();
    state.usdc += 10000; state.bettex += 1000000;
    state.lots.push({ amount: 1000000, since: now.getTime() });
    for (const [asset, amount, decimals] of [["USDC", "10000", 6], ["BETTEX", "1000000", 18]] as const) {
      await appendHistory({ key: `${correlationId}:${asset}`, correlationId, subject: `demo:${id}`,
        category: "financial", kind: "deposit", state: "confirmed", actor: "admin",
        environment: "simulation", source: "demo_admin_opening", asset, occurredAt: now,
        data: { amountUnits: decimalUnits(amount, decimals), decimals: String(decimals),
          mechanism: "simulation", reason: "admin_demo_opening_balance", realMoney: false } }, tx);
    }
    await appendHistory({ key: `${correlationId}:participation`, correlationId, subject: `demo:${id}`,
      category: "automatic", kind: "participation_entry", state: "confirmed", actor: "system",
      environment: "simulation", source: "demo_admin_opening", asset: "BETTEX", occurredAt: now,
      data: { quantityUnits: decimalUnits("1000000", 18), eligibleUnits: decimalUnits(String(state.bettex), 18),
        decimals: "18", mechanism: "simulation", transferRequired: false } }, tx);
    await tx.update(demoAccounts).set({ state, updatedAt: now }).where(eq(demoAccounts.id, id));
  });
  const dashboard = await readDashboard();
  console.log(JSON.stringify({ provisioned: true, admin: true, walletsGenerated: 2,
    bettex: dashboard!.balances.bettex, usdc: dashboard!.balances.usdc, simulated: true }));
}

async function main() {
  try {
    let raw = "";
    for await (const chunk of process.stdin) raw += chunk;
    await provision(JSON.parse(raw));
    raw = "";
  } catch {
    console.error("Could not prepare administrative account; no secret registered.");
    process.exitCode = 1;
  } finally { await pool.end(); }
}
void main();
