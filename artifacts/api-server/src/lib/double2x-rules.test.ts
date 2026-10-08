import test from "node:test";
import assert from "node:assert/strict";
import { seedAccount, seedEngine, DAY } from "./demo-state.ts";
import { double2xExecutionMode, reserveDouble2x, finishDouble2x } from "./double2x-rules.ts";
const now = 1791540000000;
test("only missing test gas selects simulation, never native wallets or other failures", () => {
  assert.equal(double2xExecutionMode("test_gas_unavailable", "demo"), "simulation");
  assert.equal(double2xExecutionMode("test_gas_unavailable", "native"), "testnet");
  for (const reason of ["ready", "testnet_unavailable", "deploying", "treasury_unavailable"]) {
    assert.equal(double2xExecutionMode(reason, "demo"), "testnet");
  }
});
const input = { requestId: "4c333b77-55af-431b-9f26-69653da31b40", color: "red" as const, confirmed: true, expectedStakeUsdc: 3.68 };
function fixture() {
  const account = seedAccount(now), engine = seedEngine(now);
  account.receivedYield = 3.68;
  return { account, engine };
}
test("only received earnings reserved, no fee, idempotency and pending lock", () => {
  const { account, engine } = fixture(), dollar = account.usdc, tokens = account.bettex;
  const p = reserveDouble2x(account, engine, input, now);
  assert.equal(p.stakeUsdc, 3.68); assert.equal(account.receivedYield, 0);
  assert.equal(account.usdc, dollar); assert.equal(account.bettex, tokens);
  assert.equal(reserveDouble2x(account, engine, input, now), p);
  assert.equal(engine.double2xReservedUsdc, 3.68);
  assert.throws(() => reserveDouble2x(account, engine, { ...input, color: "black" }, now));
  assert.throws(() => reserveDouble2x(account, engine, { ...input, requestId: "other" }, now));
});
test("win doubles stake, preserves later earnings, and debits treasury exactly once", () => {
  const { account, engine } = fixture(), before = engine.treasury.assetsUsdc;
  reserveDouble2x(account, engine, input, now); account.receivedYield = .82;
  finishDouble2x(account, engine, input.requestId, "red", now + 15000);
  assert.equal(account.receivedYield, 8.18); assert.equal(engine.treasury.assetsUsdc, before - 3.68);
  assert.equal(engine.double2xReservedUsdc, 0);
  assert.equal(finishDouble2x(account, engine, input.requestId, "black", now + 16000), null);
  assert.equal(account.receivedYield, 8.18);
  assert.throws(() => reserveDouble2x(account, engine, { ...input, requestId: "next" }, now + DAY - 1));
  reserveDouble2x(account, engine, { ...input, requestId: "next", expectedStakeUsdc: 8.18 }, now + DAY);
  assert.equal(account.double2x!.plays[0]!.stakeUsdc, 8.18);
});
test("loss credits treasury, refund restores stake without imposing cooldown", () => {
  const { account, engine } = fixture(), before = engine.treasury.assetsUsdc;
  reserveDouble2x(account, engine, input, now);
  finishDouble2x(account, engine, input.requestId, "black", now + 1000);
  assert.equal(account.receivedYield, 0); assert.equal(engine.treasury.assetsUsdc, before + 3.68);
  assert.equal(account.double2x!.plays[0]!.status, "lost");
  const f = fixture();
  reserveDouble2x(f.account, f.engine, input, now);
  finishDouble2x(f.account, f.engine, input.requestId, "refunded", now + 1000);
  assert.equal(f.account.receivedYield, 3.68);
  reserveDouble2x(f.account, f.engine, { ...input, requestId: "retry" }, now + 1001);
});
test("confirmation, empty earnings and insolvent treasury fail without debiting", () => {
  const { account, engine } = fixture();
  assert.throws(() => reserveDouble2x(account, engine, { ...input, confirmed: false }, now));
  engine.treasury.assetsUsdc = 0;
  assert.throws(() => reserveDouble2x(account, engine, input, now));
  assert.equal(account.receivedYield, 3.68);
  account.receivedYield = 0;
  assert.throws(() => reserveDouble2x(account, engine, input, now));
});
test("a payout arriving after confirmation cannot increase the played amount", () => {
  const { account, engine } = fixture();
  account.receivedYield = 4.5;
  assert.throws(() => reserveDouble2x(account, engine, input, now), /double2x_balance_changed/);
  assert.equal(account.receivedYield, 4.5);
  assert.equal(account.double2x?.plays.length, 0);
});
test("simulated plays preserve identity, accounting, cooldown and contain no transaction evidence", () => {
  for (const result of ["red", "black"] as const) {
    const { account, engine } = fixture(), treasury = engine.treasury.assetsUsdc;
    const command = { ...input, executionMode: "simulation" as const };
    const p = reserveDouble2x(account, engine, command, now);
    assert.equal(p.executionMode, "simulation");
    assert.equal(reserveDouble2x(account, engine, { ...command, executionMode: "testnet" }, now), p);
    finishDouble2x(account, engine, p.id, result, now + 1);
    assert.equal(account.receivedYield, result === "red" ? 7.36 : 0);
    assert.equal(engine.treasury.assetsUsdc, treasury + (result === "red" ? -3.68 : 3.68));
    assert.equal(engine.double2xReservedUsdc, 0);
    assert.equal(p.requestHash, undefined); assert.equal(p.settlementHash, undefined);
    assert.equal(finishDouble2x(account, engine, p.id, result, now + 2), null);
    assert.throws(() => reserveDouble2x(account, engine, { ...command, requestId: "second" }, now + 3), /double2x_daily_limit/);
  }
});
test("simulation never reserves native balances and never changes an existing legacy play's mode", () => {
  const native = fixture();
  native.account.profile.provider = "native";
  assert.throws(() => reserveDouble2x(native.account, native.engine, { ...input, executionMode: "simulation" }, now), /native_account_unavailable/);
  assert.equal(native.account.receivedYield, 3.68);
  assert.equal(native.engine.double2xReservedUsdc ?? 0, 0);
  const legacy = fixture();
  const p = reserveDouble2x(legacy.account, legacy.engine, input, now);
  delete p.executionMode;
  assert.equal(reserveDouble2x(legacy.account, legacy.engine, { ...input, executionMode: "simulation" }, now), p);
  assert.equal(p.executionMode, undefined);
});
