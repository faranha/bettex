import { test } from "node:test";
import assert from "node:assert/strict";
import { seedAccount, seedEngine, submitMovement, settleMovements, closeCycles } from "../src/lib/demo-state.ts";
import { separateEarningsWallet } from "../src/lib/earnings-wallet.ts";

const now = Date.UTC(2026, 9, 7, 19), address = "0x1111111111111111111111111111111111111111";
const account = () => ({ ...seedAccount(now), usdc: 100, receivedYield: 20, bettex: 1000, earningsSeparated: 1, history: [] });
const input = (kind, asset = "USDC", extra = {}) => ({ requestId: `${kind}-${asset}`, kind, asset, amount: 10, destination: address, ...extra });
test("legacy earnings split is idempotent and never increases the total", () => {
  const a = { ...seedAccount(now), earningsSeparated: undefined, usdc: 1280.5 }, total = a.usdc, saved = JSON.stringify(a.history);
  separateEarningsWallet(a);
  assert.equal(a.usdc + a.receivedYield, total);
  const after = JSON.stringify(a);
  separateEarningsWallet(a); assert.equal(JSON.stringify(a), after);
  assert.equal(JSON.stringify(a.history), saved);
  const overspent = { ...seedAccount(now), earningsSeparated: undefined, usdc: 2, receivedYield: 80 };
  separateEarningsWallet(overspent); assert.equal(overspent.usdc, 0); assert.equal(overspent.receivedYield, 2);
});
test("USDC and BETTEX deposits are free, including legacy onramp deposits", () => {
  for (const [kind, asset] of [["receive", "USDC"], ["receive", "BETTEX"], ["onramp", "USDC"]]) {
    const a = account(), e = seedEngine(now), old = a[asset === "USDC" ? "usdc" : "bettex"];
    submitMovement(a, e, input(kind, asset), now);
    assert.equal(a.history[0].feeUsdc, 0);
    settleMovements(a, now + 6000, e);
    assert.equal(a[asset === "USDC" ? "usdc" : "bettex"], old + 10);
    assert.equal(a.receivedYield, 20);
  }
});
test("withdrawals and both conversions charge exactly 2.50 regardless of amount", () => {
  for (const [kind, asset, amount] of [["withdraw", "USDC", 1], ["send", "BETTEX", 100], ["swap", "USDC", 25], ["swap", "BETTEX", 100]]) {
    const a = account(), e = seedEngine(now);
    submitMovement(a, e, input(kind, asset, { amount }), now);
    assert.equal(a.history[0].feeUsdc, 2.5); assert.equal(a.receivedYield, 20);
    const before = JSON.stringify(a);
    settleMovements(a, now + 6000, e);
    assert.equal(a.history[0].status, "confirmed");
    const settled = JSON.stringify(a), fees = JSON.stringify(e.treasuryTracking.fees);
    settleMovements(a, now + 12000, e);
    assert.equal(JSON.stringify(a), settled); assert.equal(JSON.stringify(e.treasuryTracking.fees), fees);
    assert.notEqual(settled, before);
  }
});
test("earnings transfer debits earnings only, credits dollars once, and books operator revenue only", () => {
  const a = account(), e = seedEngine(now), assets = e.treasury.assetsUsdc;
  submitMovement(a, e, input("transfer", "USDC", { sourceWallet: "earnings", destination: undefined }), now);
  assert.equal(a.history[0].destination, "dollar");
  assert.equal(a.receivedYield, 7.5); assert.equal(a.usdc, 100);
  settleMovements(a, now + 6000, e);
  assert.equal(a.usdc, 110); assert.equal(a.receivedYield, 7.5);
  assert.equal(e.treasuryTracking.fees.transfer, 2.5); assert.equal(e.treasury.assetsUsdc, assets);
  settleMovements(a, now + 12000, e); assert.equal(a.usdc, 110); assert.equal(e.treasuryTracking.fees.transfer, 2.5);
});
test("earnings cannot be withdrawn to an external wallet even with a valid address", () => {
  const a = account(), e = seedEngine(now);
  const before = JSON.stringify(a);
  assert.throws(() => submitMovement(a, e, input("withdraw", "USDC", { sourceWallet: "earnings" }), now), /invalid_movement/);
  assert.equal(JSON.stringify(a), before);
  assert.equal(a.history.length, 0);
});
test("earnings cannot accept deposits, convert tokens, or overdraw amount plus fee", () => {
  for (const kind of ["receive", "onramp", "swap", "send", "withdraw"]) assert.throws(() => submitMovement(account(), seedEngine(now), input(kind, "USDC", { sourceWallet: "earnings" }), now), /invalid_movement/);
  assert.throws(() => submitMovement(account(), seedEngine(now), input("transfer"), now), /invalid_movement/);
  assert.throws(() => submitMovement(account(), seedEngine(now), input("transfer", "USDC", { sourceWallet: "earnings", amount: 18 }), now), /insufficient_balance/);
  assert.throws(() => submitMovement(account(), seedEngine(now), input("send", "BETTEX", { amount: 1001 }), now), /insufficient_balance/);
  assert.throws(() => submitMovement(account(), seedEngine(now), input("swap", "BETTEX", { amount: 50 }), now), /swap_amount_below_fee/);
});
test("new cycle distributions credit the earnings wallet, never dollars", () => {
  const a = account(), e = seedEngine(now);
  e.dayAt = now - 86400000; e.treasury.cycleResultUsdc = 1000;
  const dollars = a.usdc, earnings = a.receivedYield;
  closeCycles(e, [a], now); assert.equal(a.usdc, dollars); assert.ok(a.receivedYield >= earnings);
});
