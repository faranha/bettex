import { build } from "esbuild";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";

// A private schema, including its own engine and account rows, never the live demo.
const requireDb = createRequire(new URL("../../../lib/db/package.json", import.meta.url));
const requireApi = createRequire(new URL("../package.json", import.meta.url));
const { Pool } = requireDb("pg");
const admin = new Pool({ connectionString: process.env.DATABASE_URL });
const schema = `lottery_fixture_${randomUUID().replaceAll("-", "")}`;
let fixturePool;
try {
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const isolated = new URL(process.env.DATABASE_URL);
  isolated.searchParams.set("options", `-csearch_path=${schema},pg_catalog`);
  process.env.DATABASE_URL = isolated.toString();
  process.env.NODE_ENV = "development";
  const built = await build({
    stdin: { contents: 'export {loadDashboard} from "./src/lib/demo-store"; export {db,pool} from "@workspace/db";',
      resolveDir: new URL("..", import.meta.url).pathname },
    bundle: true, platform: "node", format: "cjs", write: false,
    external: ["pg", "express", "cors", "pino", "pino-http", "@clerk/express", "@clerk/shared/keys", "http-proxy-middleware"],
    logLevel: "silent",
  });
  const mod = { exports: {} };
  new Function("require", "module", "exports", built.outputFiles[0].text)(name => name === "pg" ? requireDb(name) : requireApi(name), mod, mod.exports);
  const { loadDashboard, pool } = mod.exports;
  fixturePool = pool;
  assert.equal((await pool.query("SELECT current_schema() AS schema")).rows[0].schema, schema);
  await pool.query(`
    CREATE TABLE demo_accounts (id text PRIMARY KEY, clerk_user_id text UNIQUE, state jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
    CREATE TABLE demo_engine (id text PRIMARY KEY, state jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
    CREATE TABLE demo_commands (account_id text NOT NULL REFERENCES demo_accounts(id), request_id text NOT NULL, input jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(account_id,request_id));
  `);
  const identity = { browserId: `lottery-fixture-${randomUUID()}` };
  let accountId;
  const load = command => loadDashboard(identity, command, id => { accountId = id; });
  const account = async () => (await pool.query("SELECT state FROM demo_accounts WHERE id=$1", [accountId])).rows[0].state;
  const initial = await load();
  assert.equal(initial.lottery.entries.length, 1);
  assert.equal(initial.lottery.entries[0].type, "free");
  assert.equal(initial.lottery.participating, false);
  const joined = await load({ lottery: { participating: true, confirmed: true } });
  const before = await account();
  const order = { requestId: randomUUID(), quantity: 2, confirmed: true, drawAt: joined.lottery.nextDrawAt };
  const [first, replay] = await Promise.all([load({ lotteryEntries: order }), load({ lotteryEntries: order })]);
  assert.deepEqual(first.lottery.purchaseResult, replay.lottery.purchaseResult);
  assert.equal(first.lottery.purchaseResult.numbers.length, 2);
  const after = await account();
  assert.equal(after.usdc, before.usdc - 2);
  assert.equal(after.bettex, before.bettex);
  assert.deepEqual(after.lots, before.lots);
  assert.equal(after.receivedYield, before.receivedYield);
  assert.equal(after.lotteryEntries.entries.length, 3);
  const reloaded = await load();
  assert.deepEqual(reloaded.lottery.entries, first.lottery.entries);
  const saved = await pool.query("SELECT input FROM demo_commands WHERE account_id=$1 AND request_id=$2", [accountId, order.requestId]);
  assert.equal(saved.rows.length, 1);
  assert.deepEqual(saved.rows[0].input.receipt.numbers, first.lottery.purchaseResult.numbers);
  const audit = await pool.query("SELECT kind,data FROM history_events WHERE correlation_id=$1", [`demo:${accountId}:${order.requestId}`]);
  assert.equal(audit.rows.filter(row => row.kind === "lottery_entries_purchased").length, 1);
  assert.equal(audit.rows.filter(row => row.kind === "withdraw").length, 1);
  const receipt = audit.rows.find(row => row.kind === "lottery_entries_purchased").data;
  assert.equal(receipt.paidUnits, "2000000"); assert.equal(receipt.feeUnits, "0");
  assert.equal(receipt.stakingPreserved, "true"); assert.equal(receipt.allProceedsBurned, "true");
  for (const bad of [
    { ...order, quantity: 3 },
    { ...order, requestId: randomUUID(), drawAt: "1970-01-01T00:00:00.000Z" },
    { ...order, requestId: randomUUID(), confirmed: false },
  ]) {
    const old = await account();
    await assert.rejects(() => load({ lotteryEntries: bad }));
    assert.deepEqual(await account(), old, "a rejected purchase rolls back all account effects");
  }
  // Recovery must return the original receipt even after current-round numbers expire.
  const engine = (await pool.query("SELECT state FROM demo_engine WHERE id='main'")).rows[0].state;
  engine.burnLottery.nextDrawAt += 86400000;
  await pool.query("UPDATE demo_engine SET state=$1 WHERE id='main'", [engine]);
  const recovered = await load({ lotteryEntries: order });
  assert.deepEqual(recovered.lottery.purchaseResult, first.lottery.purchaseResult);
  assert.equal((await account()).usdc, after.usdc);
  await assert.rejects(() => loadDashboard({ nativeAccountId: `native-fixture-${randomUUID()}`, name: "Fixture", email: "", memberSince: new Date().toISOString() },
    { lotteryEntries: { ...order, requestId: randomUUID() } }), /lottery_unavailable/);
  console.log("PASS lottery database: concurrent retries charge once, persisted numbers, unchanged staking, zero fees, linked history, rollback, post-round receipt recovery, native rejection.");
} finally {
  await fixturePool?.end();
  await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await admin.end();
}
