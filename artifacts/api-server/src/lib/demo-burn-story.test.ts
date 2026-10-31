import test from "node:test";
import assert from "node:assert/strict";
import { advanceDemoBurnStory, demoBurnSnapshot } from "./demo-burn-story.ts";
import type { EngineState } from "./demo-state.ts";

const end = Date.parse("2026-10-07T19:00:00Z");
const frame = () => ({
  scheduledStory: 1, rounds: [
    { id: "positive", endedAt: new Date(end).toISOString(), status: "paid", buybackUsdc: 362.5, source: "seeded_demo" },
    { id: "loss", endedAt: new Date(end).toISOString(), status: "retained", buybackUsdc: 0, source: "seeded_demo" },
  ],
} as unknown as EngineState);

test("funding, wallet holdings and completed burns remain distinct, with integer tokens and cash dust", () => {
  const engine = frame();
  advanceDemoBurnStory(engine, end);
  let b = demoBurnSnapshot(engine, end)!;
  assert.equal(b.walletUsdc, 362.5);
  assert.equal(b.walletBettex, 0);
  assert.equal(b.totalBurnedBettex, 0);
  assert.equal(b.entries.length, 1);
  advanceDemoBurnStory(engine, end + 48 * 3_600_000);
  b = demoBurnSnapshot(engine, end)!;
  assert.equal(b.walletUsdc, .02);
  assert.equal(b.walletBettex, 9062);
  assert.equal(b.totalBurnedBettex, 0, "a purchase is not a burn");
  advanceDemoBurnStory(engine, end + 48 * 3_600_000 + 600_000);
  b = demoBurnSnapshot(engine, end)!;
  assert.equal(b.walletBettex, 0);
  assert.equal(b.totalBurnedBettex, 9062);
  assert.equal(b.address, null);
  assert.ok(b.entries.every(e => e.source === "modeled_demo"));
});

test("repeated reads, JSON restart and trimmed round views never repeat or reset burns", () => {
  const engine = frame(), now = end + 3 * 86_400_000;
  advanceDemoBurnStory(engine, now);
  const expected = demoBurnSnapshot(engine, now);
  const restarted = JSON.parse(JSON.stringify(engine)) as EngineState;
  restarted.rounds = [];
  advanceDemoBurnStory(restarted, now);
  advanceDemoBurnStory(restarted, now);
  assert.deepEqual(demoBurnSnapshot(restarted, now), expected);
  assert.equal(restarted.burnStory!.journal.length, 3);
});

test("unscheduled/native-like engines do not invent a modeled burn summary", () => {
  const engine = frame();
  delete engine.scheduledStory;
  advanceDemoBurnStory(engine, end + 3 * 86_400_000);
  assert.equal(demoBurnSnapshot(engine, end), undefined);
});
