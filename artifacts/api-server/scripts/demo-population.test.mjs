import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
const result = await build({ stdin: { contents: `
export {demoTradingSnapshot,demoTradingJourneys} from "./src/lib/demo-trading-presentation";
export {populateDemoHistory} from "./src/lib/demo-history-population";
export {seedAccount,seedEngine,dashboard} from "./src/lib/demo-state";
export {ensureScheduledStory,storyPosition} from "./src/lib/scheduled-demo-story";
export {prepareScheduledAccount} from "./src/lib/scheduled-demo-account";`, resolveDir: new URL("..", import.meta.url).pathname },
  bundle: true, platform: "node", format: "cjs", write: false, logLevel: "silent" });
const mod = { exports: {} };
new Function("require", "module", "exports", result.outputFiles[0].text)(createRequire(import.meta.url), mod, mod.exports);
const { seedAccount, seedEngine, dashboard, ensureScheduledStory, prepareScheduledAccount,
  demoTradingSnapshot, demoTradingJourneys, populateDemoHistory, storyPosition } = mod.exports;
const start = Date.UTC(2026, 9, 7, 19);
function scenario(minute = 900) {
  const now = start + minute * 60000, e = seedEngine(now), a = seedAccount(now);
  ensureScheduledStory(e, now); prepareScheduledAccount(a, now);
  return { a, e, d: dashboard(a, e, now) };
}
test("every trading view and BTC/ETH/SOL filter has linked data and deterministic pagination", () => {
  const { d } = scenario(), frozen = JSON.stringify(d);
  for (const view of ["opportunities", "decisions", "orders", "positions", "closed"]) {
    const p = demoTradingSnapshot(d, { view, state: "", limit: 15 });
    const rows = view === "closed" ? p.positions : p[view];
    assert.ok(rows.length > 0, view);
    for (const asset of ["btc", "eth", "sol"]) {
      const f = demoTradingSnapshot(d, { view, asset, state: "", limit: 15 });
      if(view !== "positions") assert.ok(f.page.total > 0, `${view}/${asset}`);
    }
    if(p.page.nextCursor) {
      const cursor = JSON.parse(Buffer.from(p.page.nextCursor, "base64url").toString());
      const next = demoTradingSnapshot(d, { view, state: "", limit: 15, cursor });
      assert.notDeepEqual(next[view === "closed" ? "positions" : view], rows);
    }
  }
  assert.equal(JSON.stringify(d), frozen);
});
test("journeys identify their authored source, never claim real inference, and preserve references", () => {
  const { d } = scenario();
  for (const j of demoTradingJourneys(d)) {
    const o = j.opportunity.opportunity;
    assert.equal(o.origin.nature, "internal_fixture");
    assert.equal(j.decisions[0].opportunityId, o.id);
    assert.equal(j.orders[0].decisionId, j.decisions[0].id);
    for(const p of j.positions) {
      assert.equal(p.orderId, j.orders[0].id);
      assert.ok(p.valuations.length);
    }
    assert.ok(j.events.every(e => e.at <= d.serverNow));
    for(const key of ["model","costs","liquidity","estimatedReturn","uncertainty","capitalUnits","potentialLossUnits"])
      assert.notEqual(o[key].kind, "missing");
  }
});
test("closed P&L and fees equal the source ledger; approved orders do not acquire phantom fills", () => {
  for (const minute of [0, 1, 900, 1439]) {
    const { d } = scenario(minute);
    for(const j of demoTradingJourneys(d)) {
      const p = j.positions[0], id = j.opportunity.opportunity.origin.snapshotId;
      if(p?.state === "closed") {
        const cycle = Date.parse(id.slice(7,17) + "T19:00:00Z"), index = Number(id.split("-").at(-1)) - 1;
        const row = storyPosition(cycle, index);
        assert.equal(p.realizedUnits, String(Math.round(row.netUsdc * 1e6)));
        assert.equal(p.entryFeesUnits, String(Math.round(row.costUsdc * 1e6)));
      }
      if(j.orders[0].state === "pending") {
        assert.deepEqual(j.orders[0].fills, []); assert.deepEqual(j.positions, []);
      }
    }
  }
});
test("history enrichment is net-zero, idempotent, preserves old transactions and excludes native accounts", () => {
  const { a } = scenario(), before = structuredClone(a);
  populateDemoHistory(a);
  assert.equal(a.usdc, before.usdc); assert.equal(a.bettex, before.bettex); assert.equal(a.receivedYield, before.receivedYield);
  assert.equal(a.history.length, before.history.length + 14);
  for(const row of before.history) assert.deepEqual(a.history.find(m=>m.id===row.id), row);
  const added = a.history.filter(m=>m.id.startsWith("SCRIPT-POPULATE"));
  assert.equal(added.reduce((n,m)=>n+(["onramp","receive"].includes(m.kind)?m.amount:-m.amount-m.feeUsdc),0), 0);
  const after = JSON.stringify(a); populateDemoHistory(a); assert.equal(JSON.stringify(a),after);
  const native = structuredClone(before); native.profile.provider = "native"; populateDemoHistory(native);
  assert.deepEqual(native.history, before.history);
});
test("capital reconciles reservations, positions and the separate reserve, and excludes native inference", () => {
  for(const minute of [0, 1, 900, 1439]) {
    const { d, a, e } = scenario(minute), p = demoTradingSnapshot(d, {view:"positions",state:"",limit:15});
    assert.equal(BigInt(p.capital.cashUnits), BigInt(p.capital.availableUnits) + BigInt(p.capital.reservedUnits) +
      BigInt(p.capital.committedUnits) + BigInt(p.policy.defensiveUnits));
    assert.equal(p.capital.exposure.reduce((n,e)=>n+BigInt(e.units),0n), BigInt(p.capital.committedUnits));
    d.profile.provider = "native";
    assert.throws(()=>demoTradingJourneys(d), /scheduled_demo_required/);
    a.profile.provider = "native";
    assert.equal(dashboard(a,e,Date.parse(d.serverNow)).treasury.currentRound.targetNetUsdc, null);
  }
});
