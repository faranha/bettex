import { test } from "node:test";
import assert from "node:assert/strict";
import { seedEngine, seedAccount, submitMovement, settleMovements, closeCycles, dashboard, DAY } from "../src/lib/demo-state.ts";
import { ensureTreasuryTracking, treasuryRoundSnapshot } from "../src/lib/treasury-round.ts";
import { progressOrchestration } from "../src/lib/orchestrator.ts";
const now = Date.UTC(2026, 9, 6, 10);
const move = (id, kind, amount, asset = "USDC") => ({
  requestId: id, kind, amount, asset, destination: "0x0000000000000000000000000000000000000001",
});
test("assets contain reserve and working capital; commitments are inside working capital", () => {
  const engine = seedEngine(now), round = treasuryRoundSnapshot(engine, now);
  assert.equal(round.assetsUsdc, round.reserveUsdc + round.workingUsdc);
  assert.equal(round.workingUsdc, round.committedUsdc + round.availableUsdc);
  assert.equal(round.assetsUsdc, round.reserveUsdc + round.committedUsdc + round.availableUsdc);
  engine.treasury.assetsUsdc = 60001;
  engine.operations[0].capitalUsdc = 500;
  assert.ok(treasuryRoundSnapshot(engine, now).availableUsdc < 0);
});
test("current realized result is round net, never accumulated realized or open indications", () => {
  const engine = seedEngine(now);
  engine.treasury.realizedUsdc = 9999; engine.treasury.cycleResultUsdc = -25;
  const round = treasuryRoundSnapshot(engine, now);
  assert.equal(round.realizedNetUsdc, -25);
  assert.notEqual(round.realizedNetUsdc, engine.treasury.realizedUsdc);
  assert.equal(round.targetNetUsdc, null);
  assert.ok(round.expectedCommittedNetUsdc > 0);
  assert.equal(round.unrealizedUsdc, engine.operations[0].pnlUsdc);
});
test("operator fee receipts book once on confirmation, exclude seed credits and never inflate treasury profit", () => {
  const engine = seedEngine(now), account = seedAccount(now);
  ensureTreasuryTracking(engine, now);
  const assets = engine.treasury.assetsUsdc, net = engine.treasury.cycleResultUsdc;
  settleMovements(account, now, engine);
  assert.equal(treasuryRoundSnapshot(engine, now).feesCollectedUsdc, 0);
  submitMovement(account, engine, move("SWAP", "swap", 100), now);
  settleMovements(account, now + 5999, engine);
  assert.equal(treasuryRoundSnapshot(engine, now).feesCollectedUsdc, 0);
  settleMovements(account, now + 6000, engine);
  const round = treasuryRoundSnapshot(engine, now + 6000);
  assert.equal(round.feesCollectedUsdc, .1); assert.equal(round.feeBreakdown.swap, .1);
  assert.equal(round.feesOwner, "operating_company");
  assert.equal(engine.treasury.assetsUsdc, assets); assert.equal(engine.treasury.cycleResultUsdc, net);
  settleMovements(account, now + 12000, engine);
  assert.equal(treasuryRoundSnapshot(engine, now).feesCollectedUsdc, .1);
});
test("each supported wallet fee type contributes its confirmed amount, not requested totals", () => {
  const engine = seedEngine(now), account = seedAccount(now);
  for (const [id, kind, amount, asset] of [
    ["ADD", "onramp", 100, "USDC"], ["OUT", "withdraw", 20, "USDC"], ["SEND", "send", 500, "BETTEX"],
  ]) submitMovement(account, engine, move(id, kind, amount, asset), now);
  settleMovements(account, now + 6000, engine);
  const r = treasuryRoundSnapshot(engine, now + 6000);
  assert.deepEqual(r.feeBreakdown, { onramp: .2, swap: 0, withdraw: .01, send: .01 });
  assert.equal(r.feesCollectedUsdc, .22);
});
test("closing snapshots freeze balances and fees; new rounds reset counters without resetting holdings", () => {
  const engine = seedEngine(now), account = seedAccount(now);
  ensureTreasuryTracking(engine, now);
  submitMovement(account, engine, move("FEE", "swap", 100), now);
  settleMovements(account, now + 6000, engine);
  const end = engine.dayAt + DAY;
  closeCycles(engine, [account], end);
  const saved = JSON.stringify(engine.rounds[0].treasurySnapshot);
  assert.equal(engine.rounds[0].treasurySnapshot.feesCollectedUsdc, .1);
  assert.equal(engine.rounds[0].treasurySnapshot.coverage, "partial");
  const current = treasuryRoundSnapshot(engine, end);
  assert.equal(current.realizedNetUsdc, 0); assert.equal(current.feesCollectedUsdc, 0);
  assert.equal(current.executionCostsUsdc, 0); assert.equal(current.closedOperations, 0);
  assert.equal(current.coverage, "complete"); assert.equal(current.openingAssetsUsdc, engine.treasury.assetsUsdc);
  engine.treasury.assetsUsdc += 7;
  submitMovement(account, engine, move("NEXT", "swap", 20), end);
  settleMovements(account, end + 6000, engine);
  assert.equal(JSON.stringify(engine.rounds[0].treasurySnapshot), saved);
  assert.equal(treasuryRoundSnapshot(engine, end + 6000).feesCollectedUsdc, .02);
});
test("legacy history remains explicitly unrecorded, not backfilled with current balances", () => {
  const engine = seedEngine(now);
  assert.ok(engine.rounds.every(r => r.treasurySnapshot === undefined));
  const round = treasuryRoundSnapshot(engine, now);
  assert.equal(round.coverage, "partial"); assert.equal(round.executionCostsUsdc, null);
  assert.equal(round.openingAssetsUsdc, null); assert.equal(round.closedOperations, null);
});
test("settled execution costs accumulate once and snapshots carry current-round results", () => {
  const engine = seedEngine(now);
  ensureTreasuryTracking(engine, engine.dayAt, true);
  const op = engine.operations[0];
  op.status = "reconciling"; op.updatedAt = new Date(now - 10000).toISOString(); op.pnlUsdc = 5;
  const cost = op.proposal.feesUsdc, before = engine.treasury.cycleResultUsdc;
  progressOrchestration(engine, now, () => {});
  assert.equal(op.status, "closed");
  const round = treasuryRoundSnapshot(engine, now);
  assert.equal(round.executionCostsUsdc, cost); assert.equal(round.closedOperations, 1);
  assert.equal(round.realizedNetUsdc, Math.round((before + 5 - cost) * 1e6) / 1e6);
  progressOrchestration(engine, now + 6000, () => {});
  assert.equal(treasuryRoundSnapshot(engine, now).closedOperations, 1);
  assert.ok(dashboard(seedAccount(now), engine, now).treasury.currentRound);
});
