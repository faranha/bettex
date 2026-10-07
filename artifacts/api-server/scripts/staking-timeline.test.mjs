import { test } from "node:test";
import assert from "node:assert/strict";
import { createStakingTimeline, advanceStakingTimeline, stakingTimelineSnapshot, STAKING_TICK_MS } from "../src/modules/simulation/domain/staking-timeline.ts";
const now = Date.UTC(2026, 9, 7, 12);
const random = () => 0.5;

test("scenario opens at 16h with a complete 24h path, heavy losses and recovery", () => {
  const state = createStakingTimeline(now, random);
  assert.equal(state.elapsedMinutes, 960);
  assert.equal(state.tick, 160);
  assert.equal(state.points.length, 241);
  assert.equal(state.points[0].profitUsdc, 0);
  const low = state.points.find(p => p.elapsedMinutes === 240).profitUsdc;
  const recovery = state.points.find(p => p.elapsedMinutes === 960).profitUsdc;
  assert.ok(low < -6000);
  assert.ok(recovery > low && recovery < 0);
  assert.ok(state.points.at(-1).profitUsdc > 0);
  assert.equal(state.points.at(-1).elapsedMinutes, 1440);
});
test("ticks advance independently of browser reads, persist, and catch up after downtime", () => {
  const state = createStakingTimeline(now, random);
  assert.equal(advanceStakingTimeline(state, now + STAKING_TICK_MS - 1, random).tick, 160);
  const persisted = JSON.parse(JSON.stringify(state));
  const advanced = advanceStakingTimeline(persisted, now + STAKING_TICK_MS * 4, random);
  assert.equal(advanced.tick, 164);
  assert.equal(advanced.elapsedMinutes, 984);
  assert.equal(advanced.nextTickAt, now + STAKING_TICK_MS * 5);
  assert.deepEqual(advanced.points, state.points);
  assert.equal(advanceStakingTimeline(advanced, now + STAKING_TICK_MS * 4, random).tick, 164);
});
test("completed rounds stay visible for one tick and new rounds continue automatically", () => {
  let state = createStakingTimeline(now, random);
  state = advanceStakingTimeline(state, now + STAKING_TICK_MS * 80, random);
  assert.equal(state.elapsedMinutes, 1440);
  state = advanceStakingTimeline(state, now + STAKING_TICK_MS * 81, random);
  assert.equal(state.elapsedMinutes, 0);
  assert.equal(state.points.length, 241);
});
test("different random workloads produce different paths and schema-ready snapshots", () => {
  const a = createStakingTimeline(now, () => 0.1);
  const b = createStakingTimeline(now, () => 0.9);
  assert.notDeepEqual(a.points, b.points);
  const snapshot = stakingTimelineSnapshot(a);
  assert.equal(snapshot.source, "test_scenario");
  assert.equal(snapshot.nextTickAt, new Date(now + STAKING_TICK_MS).toISOString());
  assert.ok(snapshot.points.every(p => Number.isFinite(p.profitUsdc)));
});
