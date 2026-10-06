import { test } from "node:test";
import assert from "node:assert/strict";
import { seedAccount, seedEngine, tickEngine, submitMovement, settleMovements, closeCycles, dashboard, accountWeight, DAY, utcStart } from "../src/lib/demo-state.ts";
const now = Date.UTC(2026, 9, 5, 10, 0, 0);
const input = (kind, amount, asset = "USDC") => ({ requestId: "67ea8cd5-8780-468a-8444-aa07c2d74bba", kind, amount, asset, destination: "0x0000000000000000000000000000000000000001" });

test("closed-round stake snapshots explain payments, stay frozen and remain account-scoped", () => {
  const a = seedAccount(now), b = seedAccount(now), engine = seedEngine(now);
  b.bettex = 25000; b.lots = [{ amount: 25000, since: engine.dayAt }];
  engine.treasury.cycleResultUsdc = 1000;
  const end = engine.dayAt + DAY;
  closeCycles(engine, [a, b], end);
  const own = dashboard(a, engine, end, [a, b]).rounds[0];
  const other = dashboard(b, engine, end, [a, b]).rounds[0];
  assert.equal(own.source, "calculated_simulation");
  assert.equal(own.participationSnapshot.ownEligibleTokens, 12500);
  assert.equal(other.participationSnapshot.ownEligibleTokens, 25000);
  assert.equal(own.participationSnapshot.totalEligibleTokens, 8037500);
  const s = own.participationSnapshot;
  assert.equal(s.receivedUsdc, Math.floor(own.stakingUsdc * s.ownTokenSeconds / s.totalTokenSeconds * 1e6) / 1e6);
  assert.equal(s.payoutSharePercent, 100 * s.ownTokenSeconds / s.totalTokenSeconds);
  const saved = JSON.stringify(s), balance = a.usdc;
  a.bettex = 7;
  assert.equal(JSON.stringify(dashboard(a, engine, end, [a, b]).rounds[0].participationSnapshot), saved);
  closeCycles(engine, [a, b], end);
  assert.equal(a.usdc, balance);
});

test("preloaded demo payments have no fabricated historical stake snapshot", () => {
  const a = seedAccount(now), engine = seedEngine(now);
  const d = dashboard(a, engine, now);
  assert.equal(a.history[0].amount, 12.8);
  assert.equal(d.rounds[0].source, "seeded_demo");
  assert.equal(d.rounds[0].participationSnapshot, undefined);
});

test("staking reports eligible-token totals and allocation without conflating payout weights", () => {
  const a = seedAccount(now), b = seedAccount(now), engine = seedEngine(now);
  engine.treasury.cycleResultUsdc = 1000;
  const snapshot = dashboard(a, engine, now, [a, b]);
  const total = 8_000_000 + a.bettex + b.bettex;
  assert.equal(snapshot.staking.totalEligibleTokens, total);
  assert.equal(snapshot.staking.tokenSharePercent, 100 * a.bettex / total);
  assert.equal(snapshot.staking.poolAllocationUsdc, 250);
  assert.equal(snapshot.staking.estimatedUsdc, Math.round(250 * snapshot.staking.sharePercent / 100 * 1e6) / 1e6);
  engine.treasury.cycleResultUsdc = -100;
  const loss = dashboard(a, engine, now, [a, b]);
  assert.equal(loss.staking.poolAllocationUsdc, 0);
  assert.equal(loss.staking.estimatedUsdc, 0);
  assert.equal(loss.treasury.cycleResultUsdc, -100);
});

test("history retention never drops pending credits and settlement does not credit twice", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  const initial = account.usdc;
  for (let i = 0; i < 125; i++) {
    settleMovements(account, now);
    submitMovement(account, engine, { ...input("receive", 1), requestId: `pending-${i}` }, now);
  }
  settleMovements(account, now + 5999);
  assert.equal(account.history.filter(m => m.status === "pending").length, 125);
  assert.equal(account.usdc, initial);
  settleMovements(account, now + 6000);
  assert.equal(account.usdc, initial + 125);
  assert.equal(account.history.some(m => m.status === "pending"), false);
  assert.equal(account.history.length, 100);
  settleMovements(account, now + 12000);
  assert.equal(account.usdc, initial + 125);
});

test("scripts use real time, finish operations, and continue after a prepared sequence", () => {
  const engine = seedEngine(now);
  tickEngine(engine, now + 5000);
  assert.equal(engine.sequence, 0);
  for (let i = 1; i <= 120; i++) tickEngine(engine, now + i * 6000);
  assert.equal(engine.sequence, 120);
  assert.ok(engine.operations.some(op => op.status === "closed"));
  assert.ok(engine.events.some(event => event.kind === "reconciliation"));
  assert.ok(engine.operations.some(op => op.status === "rejected") || engine.events.some(event => event.kind === "rejected"));
  assert.notEqual(engine.treasury.cycleResultUsdc, 1860);
  assert.ok(engine.operations.length <= 12 && engine.events.length <= 40);
});
test("incoming funds confirm once after wall-time delay and on-ramp charges one fee", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  const original = account.usdc;
  submitMovement(account, engine, input("onramp", 100), now);
  assert.equal(account.usdc, original);
  settleMovements(account, now + 5999);
  assert.equal(account.usdc, original);
  settleMovements(account, now + 6000);
  assert.equal(account.usdc, original + 99.8);
  settleMovements(account, now + 12000);
  assert.equal(account.usdc, original + 99.8);
});
test("swap debits now, fixes its rate, and enters staking only on confirmation", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  const original = account.bettex;
  submitMovement(account, engine, input("swap", 100), now);
  assert.equal(account.usdc, 1180.4);
  assert.equal(account.bettex, original);
  engine.price = .1;
  settleMovements(account, now + 6000);
  assert.equal(account.bettex, original + 2500);
  assert.equal(account.lots.at(-1).since, now + 6000);
});
test("a partial BETTEX exit resets all prior unpaid weight", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  assert.ok(accountWeight(account, engine.dayAt, now) > 0);
  submitMovement(account, engine, input("send", 500, "BETTEX"), now);
  assert.equal(account.bettex, 12000);
  assert.equal(accountWeight(account, engine.dayAt, now), 0);
  assert.equal(account.lots.length, 1);
});
test("USDC yield withdrawal does not reset BETTEX staking", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  const lots = structuredClone(account.lots);
  submitMovement(account, engine, input("withdraw", 20), now);
  assert.equal(account.receivedYield, 60.49);
  assert.deepEqual(account.lots, lots);
});
test("invalid amounts, yield and balances never create a personal movement", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  assert.throws(() => submitMovement(account, engine, input("withdraw", 2000), now), /insufficient_balance/);
  assert.throws(() => submitMovement(account, engine, input("swap", 2000), now), /insufficient_balance/);
  assert.throws(() => submitMovement(account, engine, input("onramp", 1, "BETTEX"), now), /invalid_movement/);
  assert.equal(account.history.length, 5);
});
test("UTC cycles pay once, never carry loss or restore an old retained result", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  const before = account.receivedYield;
  const midnight = utcStart(now) + DAY;
  closeCycles(engine, [account], midnight);
  assert.ok(account.receivedYield > before);
  const paid = account.receivedYield;
  closeCycles(engine, [account], midnight + 1000);
  assert.equal(account.receivedYield, paid);
  engine.treasury.cycleResultUsdc = -50;
  closeCycles(engine, [account], midnight + DAY);
  assert.equal(account.receivedYield, paid);
  assert.equal(engine.treasury.cycleResultUsdc, 0);
  assert.equal(engine.rounds[0].status, "retained");
  engine.treasury.cycleResultUsdc = 100;
  closeCycles(engine, [account], midnight + 2 * DAY);
  assert.equal(engine.rounds[0].eligibleUsdc, 100);
});
test("snapshot exposes next UTC cycle, real server time and BRL exchange rates", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  const snap = dashboard(account, engine, now);
  assert.equal(Date.parse(snap.serverNow), now);
  assert.equal(Date.parse(snap.staking.nextCycleAt), utcStart(now) + DAY);
  assert.equal(snap.staking.eligibleTokens, account.bettex);
  assert.ok(snap.staking.sharePercent > 0 && snap.staking.sharePercent <= 100);
  assert.ok(snap.balances.brlPerUsdc > 0 && snap.balances.bettexUsdc > 0);
});
test("current cycle share includes other participants and never promises a payout", () => {
  const account = seedAccount(now), other = seedAccount(now), engine = seedEngine(now);
  const alone = dashboard(account, engine, now, [account]).staking.sharePercent;
  const joined = dashboard(account, engine, now, [account, other]).staking.sharePercent;
  assert.ok(joined > 0 && joined < alone);
  engine.treasury.cycleResultUsdc = -100;
  const loss = dashboard(account, engine, now, [account, other]);
  assert.equal(loss.staking.sharePercent, joined);
  assert.equal(loss.staking.estimatedUsdc, 0);
  account.bettex = 0; account.lots = [];
  assert.equal(dashboard(account, engine, now, [account, other]).staking.sharePercent, 0);
});
test("BETTEX sale locks net USDC proceeds, resets staking and needs no USD fee balance", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  account.usdc = 0;
  const tokens = account.bettex;
  submitMovement(account, engine, input("swap", 500, "BETTEX"), now);
  assert.equal(account.bettex, tokens - 500);
  assert.equal(accountWeight(account, engine.dayAt, now), 0);
  assert.equal(account.usdc, 0);
  assert.equal(account.history[0].sourceAsset, "BETTEX");
  assert.equal(account.history[0].sourceAmount, 500);
  assert.equal(account.history[0].asset, "USDC");
  assert.equal(account.history[0].feeUsdc, .02);
  assert.equal(account.history[0].amount, 19.98);
  engine.price = .2;
  settleMovements(account, now + 6000);
  assert.equal(account.usdc, 19.98);
  settleMovements(account, now + 12000);
  assert.equal(account.usdc, 19.98);
});
test("USD withdrawal can withdraw principal, requires a destination and keeps staking", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  const lots = structuredClone(account.lots);
  const before = structuredClone(account);
  assert.throws(() => submitMovement(account, engine, { ...input("withdraw", 100), destination: "" }, now), /invalid_movement/);
  assert.deepEqual(account, before);
  submitMovement(account, engine, input("withdraw", 100), now);
  assert.equal(account.usdc, 1180.45);
  assert.equal(account.receivedYield, 0);
  assert.deepEqual(account.lots, lots);
  settleMovements(account, now + 6000);
  assert.equal(account.usdc, 1180.45);
  assert.equal(account.history[0].status, "confirmed");
});
test("incoming BETTEX and incoming USDC settle separately and do not double-credit", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  const tokenStart = account.bettex, usdStart = account.usdc;
  submitMovement(account, engine, input("receive", 100, "BETTEX"), now);
  submitMovement(account, engine, { ...input("receive", 25), requestId: "separate-incoming-usdc" }, now);
  assert.equal(account.bettex, tokenStart);
  settleMovements(account, now + 6000);
  assert.equal(account.bettex, tokenStart + 100);
  assert.equal(account.usdc, usdStart + 25);
  assert.equal(account.lots.at(-1).since, now + 6000);
  settleMovements(account, now + 12000);
  assert.equal(account.bettex, tokenStart + 100);
  assert.equal(account.usdc, usdStart + 25);
});
test("BETTEX transfer fee uses dollar value and debits only the correct currencies", () => {
  const account = seedAccount(now), engine = seedEngine(now);
  submitMovement(account, engine, input("send", 500, "BETTEX"), now);
  assert.equal(account.bettex, 12000);
  assert.equal(account.usdc, 1280.49);
  assert.equal(account.history[0].feeUsdc, .01);
});