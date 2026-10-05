import { build } from "esbuild";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(new URL("../../../lib/db/package.json", import.meta.url));
const built = await build({
  stdin: { contents: `export {historyPage,historyDetail,appendHistory,ensureHistorySchema,historyTransparency} from "./src/modules/audit/infrastructure/history-store"; export {recordDemoMovements,recordDemoPools,recordDemoTreasury} from "./src/modules/audit/infrastructure/demo-recorder"; export {historyQuery} from "./src/modules/audit/transport/history-filters"; export {accountsStore} from "./src/modules/accounts/infrastructure/store"; export {canReadTreasuryHistory} from "./src/modules/accounts/infrastructure/history-permission"; export {db,pool} from "@workspace/db";`,
    resolveDir: new URL("..", import.meta.url).pathname },
  bundle: true, platform: "node", format: "cjs", write: false, external: ["pg"], logLevel: "silent",
});
const mod = { exports: {} };
new Function("require", "module", "exports", built.outputFiles[0].text)(require, mod, mod.exports);
const { historyPage, historyDetail, appendHistory, ensureHistorySchema, historyTransparency, historyQuery, accountsStore, canReadTreasuryHistory,
  recordDemoMovements, recordDemoPools, recordDemoTreasury, db, pool } = mod.exports;
const { sql } = require("drizzle-orm");
try {
  await ensureHistorySchema();
  const dates = historyQuery.parse({ from: "2026-10-05T08:50:00.000Z", to: "2026-10-05T08:53:00.000Z" });
  assert.ok(dates.from instanceof Date);
  assert.equal(dates.from.toISOString(), "2026-10-05T08:50:00.000Z");
  assert.equal(historyQuery.safeParse({ from: "not-a-date" }).success, false);
  assert.equal(historyQuery.safeParse({ from: "2026-02-30T00:00:00Z" }).success, false);
  assert.equal(historyQuery.safeParse({ from: "2026-10-06T00:00:00Z", to: "2026-10-05T00:00:00Z" }).success, false);
  const subject = `verification:${crypto.randomUUID()}`;
  const at = new Date("2026-10-05T08:51:48.000Z");
  for (let i = 0; i < 7; i++) await appendHistory({ key: `${subject}:${i}`, subject, correlationId: subject,
    category: "activity", kind: "pagination_verification", state: "confirmed", actor: "system",
    environment: "account_test", source: "verification", occurredAt: at, data: { marker: String(i) } });
  const first = await historyPage(subject, { limit: 2 });
  assert.equal(first.items.length, 2); assert.ok(first.nextCursor);
  await appendHistory({ key: `${subject}:later`, subject, correlationId: subject, category: "activity",
    kind: "pagination_verification", state: "confirmed", actor: "system", environment: "account_test", source: "verification", occurredAt: at });
  const ids = first.items.map(r => r.id); let cursor = first.nextCursor;
  while (cursor) {
    const page = await historyPage(subject, { limit: 2, cursor });
    ids.push(...page.items.map(r => r.id)); cursor = page.nextCursor;
  }
  assert.equal(ids.length, 7); assert.equal(new Set(ids).size, 7);
  assert.equal((await historyPage(subject, { limit: 50 })).items.length, 8);
  assert.equal((await historyPage(subject, { from: dates.from.toISOString(), to: dates.to.toISOString() })).items.length, 8);
  assert.equal((await historyPage(subject, { from: "2026-10-05T10:00:00.000Z" })).items.length, 0);
  assert.equal((await historyPage("another-subject", { correlationId: subject })).items.length, 0);
  await assert.rejects(historyPage("another-subject", { limit: 2, cursor: first.nextCursor }));
  await assert.rejects(db.execute(sql`UPDATE history_events SET state='failed' WHERE id=${ids[0]}`));
  await appendHistory({ key: `${subject}:correction`, subject, correlationId: subject, category: "automatic",
    kind: "execution_correction", state: "reversed", actor: "system", environment: "account_test", source: "verification", parentId: ids[0] });
  assert.equal((await historyPage(subject, { state: "reversed" })).items.filter(row => row.id === ids[0]).length, 1);
  assert.equal((await historyDetail(subject, subject)).find(row => row.id === ids[0]).state, "reversed");
  const aggregates = await historyTransparency();
  assert.ok(aggregates.every(row => !("subject" in row) && !("wallet" in row) && !("email" in row)));
  const captured = [];
  const sink = { insert: () => ({ values: value => ({ onConflictDoNothing: () => { captured.push(value); } }) }),
    execute: async () => ({ rows: [] }) };
  await recordDemoMovements(sink, "verification", [], [{ id: "immediate-swap", kind: "swap", status: "confirmed", asset: "BETTEX",
    amount: 100, feeUsdc: 0.12, at: at.toISOString(), sourceAsset: "USDC", sourceAmount: 18.75 }], "0.1875", "immediate-swap", at.getTime());
  assert.equal(captured[0].data.priceUnits, "187500"); assert.equal(captured[0].reconstructed, false);
  const base = { id: "verification-operation", agent: "BTEX", capitalUsdc: 20, pnlUsdc: 0.5, updatedAt: at.toISOString(), proposal: { feesUsdc: 0.12 } };
  await recordDemoTreasury(sink, [{ ...base, status: "open" }], [{ ...base, status: "closed" }]);
  assert.equal(captured.find(row => row.kind === "treasury_return").data.amountUnits, "20380000");
  assert.equal(captured.find(row => row.kind === "treasury_cost").data.amountUnits, "120000");
  await recordDemoPools(sink, { id: "verification-period", endedAt: at.toISOString(), status: "paid", treasuryUsdc: 50, stakingUsdc: 25, buybackUsdc: 25 });
  assert.equal(captured.filter(row => ["treasury_retention", "treasury_distribution_pool", "buyback_reserve"].includes(row.kind)).length, 3);
  assert.ok(captured.filter(row => row.visibility === "admin").every(row => row.data.capitalInflow === "false"));
  console.log("PASS adapter-only (no fake financial database writes): immediate swap price preserved, net return excludes cost, three period pools; correction projection agrees in list and detail.");
  console.log("PASS: HTTP date decoding and reversed/invalid periods, exact period includes 8 matching rows, raw PostgreSQL timestamps, 7 tied-date records across pages, snapshot excludes new insert, owner/cursor isolation, append-only trigger, public aggregation privacy.");
  if (process.env.VERIFY_HISTORY_HTTP === "1") {
    const id = `history-acl-${crypto.randomUUID()}`;
    try {
      await db.execute(sql`INSERT INTO test_accounts(id,registration_id,email,display_name,password_hash,notice_version,accepted_at)
        VALUES(${id},${id},${`${id}@example.invalid`},'Synthetic ACL verification','disabled-test-fixture','verification',now())`);
      const session = await accountsStore().newSession(id);
      const headers = { Cookie: `bettex_test_session=${session.token}` };
      const url = `https://${process.env.REPLIT_DEV_DOMAIN}/api/test-account/history/admin`;
      assert.equal((await fetch(url, { headers })).status, 403);
      await canReadTreasuryHistory(id); // Initialize default-deny permission storage.
      await db.execute(sql`INSERT INTO test_account_permissions(account_id,permission) VALUES(${id},'treasury_history')`);
      const response = await fetch(url, { headers });
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.ok(Array.isArray(body.items) && body.items.length > 0);
      assert.ok(body.items.every(row => !("email" in row.data) && !("password" in row.data)));
      const ranged = await fetch(`${url}?kind=treasury_principal&from=2026-10-05T08%3A50%3A00.000Z&to=2026-10-05T08%3A53%3A00.000Z`, { headers });
      assert.equal(ranged.status, 200);
      assert.ok((await ranged.json()).items.some(row => row.kind === "treasury_principal"));
      await db.execute(sql`DELETE FROM test_account_permissions WHERE account_id=${id}`);
      assert.equal((await fetch(url, { headers })).status, 403);
      const changes = await db.execute(sql`SELECT data FROM history_events WHERE subject=${`native:${id}`} AND kind='admin_permission_changed' ORDER BY sequence`);
      assert.deepEqual(changes.rows.map(row => row.data.change), ["INSERT", "DELETE"]);
      console.log("PASS HTTP: default-deny 403, persisted grant 200, exact purchase-period filter 200 with matching principal, revoked permission 403. Synthetic privilege/session removed.");
    } finally {
      await db.execute(sql`DELETE FROM test_account_permissions WHERE account_id=${id}`);
      await db.execute(sql`DELETE FROM test_account_sessions WHERE account_id=${id}`);
      await db.execute(sql`DELETE FROM test_accounts WHERE id=${id}`);
    }
  }
} catch (error) {
  console.error("History integration failed:", error?.code ?? error?.message ?? "unknown"); process.exitCode = 1;
} finally { await pool.end(); }
