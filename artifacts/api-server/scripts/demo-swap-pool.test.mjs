import { test } from "node:test";
import assert from "node:assert/strict";
import { createDemoSwapPool, quoteDemoSwap, executeDemoSwap } from "../src/lib/demo-swap-pool.ts";
import { seedAccount, seedEngine, ensureDemoSwapPool, submitMovement, settleMovements, dashboard } from "../src/lib/demo-state.ts";
import { ensureScheduledStory, advanceScheduledStory } from "../src/lib/scheduled-demo-story.ts";
const now = Date.UTC(2026, 9, 7, 17);
const movement = (asset, amount, extra = {}) => ({ kind: "swap", requestId: "pool-test", asset, amount, ...extra });
const k = p => BigInt(Math.round(p.reserveUsdc * 1e6)) * BigInt(Math.round(p.reserveBettex * 1e6));

test("integer constant-product quotes conserve reserves in both directions and expose impact", () => {
  const p = createDemoSwapPool(180000, now), initial = k(p);
  const buy = quoteDemoSwap(p, "USDC", 100, 2.5);
  assert.equal(buy.amountOut, 2490.03984);
  assert.ok(buy.priceImpactPercent > 0 && buy.executionPriceUsdc > .04);
  executeDemoSwap(p, buy, now);
  assert.equal(p.reserveUsdc, 25100);
  assert.ok(k(p) >= initial && p.spotPriceUsdc > .04);
  const beforeSale = k(p);
  const sell = quoteDemoSwap(p, "BETTEX", buy.amountOut, 2.5);
  assert.ok(sell.amountOut < 100 && sell.assetOut === "USDC");
  executeDemoSwap(p, sell, now);
  assert.ok(k(p) >= beforeSale);
  assert.equal(p.swapCount, 2);
  assert.throws(() => executeDemoSwap(p, sell, now), /pool_quote_changed/);
});

test("failed minimum-output and balance checks cannot mutate reserves or balances", () => {
  const e = seedEngine(now), a = seedAccount(now);
  ensureDemoSwapPool(e, now);
  const before = structuredClone({ e, a });
  assert.throws(() => submitMovement(a, e, movement("USDC", 100, { minimumOutputAmount: 3000 }), now), /pool_quote_changed/);
  assert.deepEqual({ e, a }, before);
  assert.throws(() => submitMovement(a, e, movement("USDC", 100000), now), /insufficient_balance/);
  assert.deepEqual({ e, a }, before);
  assert.throws(() => quoteDemoSwap(e.swapPool, "BETTEX", .1, 2.5), /swap_amount_below_fee/);
});

test("pool cash is counted once, excluded from agent budgets, and not distributed as profit", () => {
  const e = seedEngine(now), a = seedAccount(now);
  ensureScheduledStory(e, now);
  ensureDemoSwapPool(e, now);
  const before = dashboard(a, e, now), profit = e.treasury.cycleResultUsdc;
  submitMovement(a, e, movement("USDC", 100), now);
  const after = dashboard(a, e, now), r = after.treasury.currentRound;
  assert.equal(after.treasury.assetsUsdc, before.treasury.assetsUsdc + 100);
  assert.equal(after.treasury.cycleResultUsdc, profit);
  assert.equal(r.poolUsdc, 25100);
  assert.equal(r.operationalWalletUsdc + r.reserveUsdc + r.agentAllocations[0].allocatedUsdc + r.poolUsdc, r.assetsUsdc);
  assert.equal(after.orchestratorBudget.workingUsdc, before.orchestratorBudget.workingUsdc);
  const price = e.price, cash = e.treasury.assetsUsdc;
  advanceScheduledStory(e, now);
  assert.equal(e.price, price);
  assert.equal(e.treasury.assetsUsdc, cash);
  const pending = a.history[0].amount;
  settleMovements(a, now + 6000, e);
  assert.equal(a.bettex, 12500 + pending);
  const snapshot = structuredClone({ e, a });
  settleMovements(a, now + 12000, e);
  assert.deepEqual({ e, a }, snapshot);
});
