import { test } from "node:test";
import assert from "node:assert/strict";
import { seedEngine, seedAccount, closeCycles, dashboard, submitMovement, settleMovements } from "../src/lib/demo-state.ts";
import { ensureScheduledStory, advanceScheduledStory, storyOpeningAssets, storyFinalNet, scheduledStakingTimeline, storyNetAt } from "../src/lib/scheduled-demo-story.ts";
import { prepareScheduledAccount } from "../src/lib/scheduled-demo-account.ts";
import { DEMO_DAY, demoCycleStart, demoCycleId, demoCycleFromId } from "../src/lib/demo-cycle-clock.ts";

const start = Date.UTC(2026, 9, 7, 19), money = n => Math.round(n * 1e6) / 1e6;
const story = now => { const e = seedEngine(now); ensureScheduledStory(e, now); return e; };
test("staking has one truthful sample per minute without creating extra settlements", () => {
  for (const minute of [0, 1, 6, 61, 1439, 1440]) {
    const now = start + minute * 60000;
    const e = story(Math.min(now, start + DEMO_DAY - 1));
    const before = JSON.stringify(e);
    const chart = scheduledStakingTimeline(e, now);
    assert.equal(chart.points.length, 1441);
    assert.deepEqual(chart.points.map(p => p.elapsedMinutes), Array.from({ length: 1441 }, (_, i) => i));
    assert.equal(chart.elapsedMinutes, minute);
    assert.equal(chart.tickIntervalMs, 60000);
    assert.equal(chart.minutesPerTick, 1);
    assert.equal(Date.parse(chart.nextTickAt), start + (minute + 1) * 60000);
    assert.equal(chart.points[minute].profitUsdc, e.treasury.cycleResultUsdc);
    assert.equal(chart.points[3].profitUsdc, minute === 3 ? e.treasury.cycleResultUsdc : storyNetAt(start, start + 3 * 60000));
    assert.equal(chart.points[2].profitUsdc, chart.points[3].profitUsdc, "a flat minute does not invent profit");
    assert.equal(JSON.stringify(e), before, "chart reads do not mutate the ledger");
  }
});
test("demo cycles open at 16 Sao Paulo, not midnight, and close exactly 24 hours later", () => {
  assert.equal(demoCycleStart(start - 1), start - DEMO_DAY);
  assert.equal(demoCycleStart(start), start);
  assert.equal(demoCycleStart(start + DEMO_DAY - 1), start);
  assert.equal(demoCycleStart(start + DEMO_DAY), start + DEMO_DAY);
  assert.equal(demoCycleFromId(demoCycleId(start)), start);
  assert.equal(new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", hourCycle: "h23" }).format(start), "16");
});
test("seven fixed past cycles contain complete frozen stories with reconciled journals", () => {
  const e = story(start + 5 * 3600000);
  assert.equal(e.rounds.length, 7);
  for (const r of e.rounds) {
    const p = r.treasurySnapshot;
    assert.equal(p.closedOperations, 720);
    assert.equal(p.coverage, "complete");
    assert.equal(Date.parse(p.endsAt) - Date.parse(p.startedAt), DEMO_DAY);
    assert.equal(p.assetsUsdc, money(p.openingAssetsUsdc + p.realizedNetUsdc));
    const rows = e.pendingTreasuryActivity.filter(row => demoCycleId(demoCycleStart(Date.parse(row.at))) === r.id);
    assert.equal(rows.filter(row => row.kind === "position_closed").length, 720);
    assert.equal(money(rows.reduce((n, row) => n + (row.netUsdc ?? 0), 0)), p.realizedNetUsdc);
    assert.equal(money(rows.reduce((n, row) => n + (row.costUsdc ?? 0), 0)), p.executionCostsUsdc);
    assert.equal(money(rows.reduce((n, row) => n + (row.feeUsdc ?? 0), 0)), p.feesCollectedUsdc);
    assert.equal(r.stakingUsdc, p.realizedNetUsdc > 0 ? p.realizedNetUsdc * .25 : 0);
  }
  const saved = JSON.stringify(e.rounds);
  advanceScheduledStory(e, start + 10 * 3600000);
  assert.equal(JSON.stringify(e.rounds), saved);
});
test("restarts, request frequency and skipped hours cannot change the prescribed story", () => {
  const direct = story(start + 10 * 3600000), stepped = story(start);
  for (let i = 1; i <= 10 * 60; i++) advanceScheduledStory(stepped, start + i * 60000);
  assert.deepEqual(stepped.treasury, direct.treasury);
  assert.deepEqual(stepped.treasuryTracking, direct.treasuryTracking);
  assert.deepEqual(stepped.operations, direct.operations);
  assert.deepEqual(stepped.events, direct.events);
  assert.deepEqual([...stepped.pendingTreasuryActivity].sort((a,b)=>a.id.localeCompare(b.id)), [...direct.pendingTreasuryActivity].sort((a,b)=>a.id.localeCompare(b.id)));
  const restarted = structuredClone(direct), count = restarted.pendingTreasuryActivity.length;
  ensureScheduledStory(restarted, start + 10 * 3600000);
  advanceScheduledStory(restarted, start + 10 * 3600000);
  assert.equal(restarted.pendingTreasuryActivity.length, count);
});
test("staking chart, treasury, positions and current timeline share the same results and clock", () => {
  const now = start + 11 * 3600000 + 34567, e = story(now), a = seedAccount(now), d = dashboard(a, e, now);
  const chart = d.staking.chartScenario;
  assert.equal(chart.roundStartedAt, d.staking.cycleStartedAt);
  assert.equal(d.staking.cycleStartedAt, d.treasury.currentRound.startedAt);
  assert.equal(chart.points.find(p => p.elapsedMinutes === chart.elapsedMinutes).profitUsdc, d.treasury.currentRound.realizedNetUsdc);
  assert.equal(chart.tickIntervalMs, chart.minutesPerTick * 60000);
  assert.equal(chart.points.at(-1).profitUsdc, storyFinalNet(start));
  assert.equal(d.staking.nextCycleAt, new Date(start + DEMO_DAY).toISOString());
  const rows = e.pendingTreasuryActivity.filter(p => p.kind === "position_closed" && Date.parse(p.at) >= start);
  assert.equal(money(rows.reduce((n,p)=>n+p.netUsdc,0)), d.treasury.currentRound.realizedNetUsdc);
  assert.equal(rows.length, d.treasury.currentRound.closedOperations);
});
test("boundary catches up, pays eligible demo users once, and preserves past snapshots", () => {
  const e = story(start + 3600000), a = seedAccount(start);
  prepareScheduledAccount(a, start);
  const before = a.receivedYield, dollars = a.usdc;
  closeCycles(e, [a], start + DEMO_DAY);
  const r = e.rounds[0], frozen = JSON.stringify(r);
  assert.equal(r.treasurySnapshot.closedOperations, 720);
  assert.equal(r.treasurySnapshot.realizedNetUsdc, storyFinalNet(start));
  assert.equal(e.treasury.assetsUsdc, storyOpeningAssets(start + DEMO_DAY));
  assert.equal(a.usdc, dollars);
  assert.ok(a.receivedYield > before);
  const balance = a.receivedYield;
  closeCycles(e, [a], start + DEMO_DAY);
  assert.equal(a.receivedYield, balance);
  advanceScheduledStory(e, start + DEMO_DAY + 3600000);
  assert.equal(JSON.stringify(e.rounds[0]), frozen);
  assert.equal(e.dayAt, start + DEMO_DAY);
});
test("fresh wallet story reconciles and changing scenarios does not reset existing user balances", () => {
  const a = seedAccount(start);
  prepareScheduledAccount(a, start);
  let usdc = 0, tokens = 0, yieldTotal = 0;
  for (const m of [...a.history].reverse()) {
    if (m.kind === "swap") { usdc -= m.sourceAmount + m.feeUsdc; tokens += m.amount; }
    else if (m.kind === "withdraw") { usdc -= m.amount + m.feeUsdc; }
    else if (m.kind === "distribution") yieldTotal += m.amount;
    else { usdc += m.kind === "onramp" ? m.amount - m.feeUsdc : m.amount; }
  }
  assert.equal(money(usdc), a.usdc);
  assert.equal(tokens, a.bettex);
  assert.equal(money(yieldTotal), a.receivedYield);
  const preserved = JSON.stringify(a);
  const e = seedEngine(start); ensureScheduledStory(e, start);
  assert.equal(JSON.stringify(a), preserved);
});
test("manual transfers remain interactive and their fees stay outside scripted investment profit", () => {
  const e = story(start + 3600000), a = seedAccount(start), assets = e.treasury.assetsUsdc, net = e.treasury.cycleResultUsdc;
  submitMovement(a, e, { requestId: "manual", kind: "swap", asset: "USDC", amount: 10 }, start + 3600000);
  settleMovements(a, start + 3606000, e);
  assert.equal(e.treasury.assetsUsdc, assets + 10); assert.equal(e.treasury.cycleResultUsdc, net);
  const feeBefore = e.treasuryTracking.fees.swap;
  advanceScheduledStory(e, start + 3606000);
  assert.equal(e.treasuryTracking.fees.swap, feeBefore);
  assert.equal(a.history.find(p=>p.id==="manual").status, "confirmed");
});
test("loss cycles retain the result without payouts or token deductions; clock rollback never duplicates costs", () => {
  const lossStart = start - 2 * DEMO_DAY, e = story(lossStart + 3600000), a = seedAccount(lossStart);
  prepareScheduledAccount(a, lossStart);
  const costs = e.treasuryTracking.executionCosts, rows = e.pendingTreasuryActivity.length;
  advanceScheduledStory(e, lossStart + 3500000);
  assert.equal(e.treasuryTracking.executionCosts, costs);
  assert.equal(e.pendingTreasuryActivity.length, rows);
  const balance = a.usdc, tokens = a.bettex;
  closeCycles(e, [a], lossStart + DEMO_DAY);
  assert.equal(e.rounds[0].status, "retained");
  assert.equal(a.usdc, balance); assert.equal(a.bettex, tokens);
  assert.equal(e.treasury.cycleResultUsdc, 0);
});
