import test from 'node:test';
import assert from 'node:assert/strict';
import { stakingClockReading, syncRoundClock, roundServerTime, roundIntervalReading } from './staking-clock.ts';
import type { StakingTimeline } from './staking-model.ts';

const start = Date.UTC(2026, 9, 7, 12);
const end = new Date(start + 8 * 3600000).toISOString();
const timeline: StakingTimeline = { elapsedMinutes: 960, tick: 160, nextTickAt: new Date(start + 6000).toISOString(),
  tickIntervalMs: 6000, minutesPerTick: 6, projectedOwnUsdc: 0.4 };

test('treasury countdown and progress use the same recorded 24-hour interval', () => {
  const opening = new Date(start).toISOString();
  const closing = new Date(start + 86400000).toISOString();
  assert.deepEqual(roundIntervalReading(opening, closing, start), { remainingMs: 86400000, progress: 0 });
  assert.deepEqual(roundIntervalReading(opening, closing, start + 43200000), { remainingMs: 43200000, progress: 0.5 });
  const before = roundIntervalReading(opening, closing, start + 1000);
  const after = roundIntervalReading(opening, closing, start + 2000);
  assert.equal(before.remainingMs! - after.remainingMs!, 1000);
  assert.ok(after.progress! > before.progress!);
  assert.deepEqual(roundIntervalReading(opening, closing, start + 86400000), { remainingMs: 0, progress: 1 });
  assert.deepEqual(roundIntervalReading(opening, closing, start + 90000000), { remainingMs: 0, progress: 1 });
});
test('treasury progress respects actual bounds, including shorter rounds and unavailable timestamps', () => {
  const opening = new Date(start).toISOString();
  const closing = new Date(start + 3600000).toISOString();
  assert.equal(roundIntervalReading(opening, closing, start + 1800000).progress, 0.5);
  assert.equal(roundIntervalReading(opening, closing, start - 1000).progress, 0);
  for (const [s, e, n] of [['invalid', closing, start], [opening, 'invalid', start], [opening, opening, start], [closing, opening, start], [opening, closing, NaN]] as const) {
    assert.deepEqual(roundIntervalReading(s, e, n), { remainingMs: null, progress: null });
  }
});

test('even accelerated chart fixtures count one real second per second, without a tick-boundary freeze', () => {
  const opening = stakingClockReading(end, timeline, start);
  for (const milliseconds of [100, 1000, 6000, 60000, 3600000]) {
    const moving = stakingClockReading(end, timeline, start + milliseconds);
    assert.equal(moving.remainingMs, opening.remainingMs! - milliseconds);
    assert.ok(moving.progress > opening.progress);
  }
});
test('changing chart ticks, intervals and elapsed minutes never changes the round countdown', () => {
  const now = start + 6100;
  const before = stakingClockReading(end, timeline, now);
  const next = { ...timeline, elapsedMinutes: 966, tick: 161, nextTickAt: new Date(start + 12000).toISOString() };
  assert.equal(stakingClockReading(end, next, now).remainingMs, before.remainingMs);
  assert.equal(stakingClockReading(end, { ...next, elapsedMinutes: 1440 }, now).remainingMs, before.remainingMs);
});
test('native and demo use actual deadlines, clamp completed rounds and do not invent missing deadlines', () => {
  const short = new Date(start + 8000).toISOString();
  assert.equal(stakingClockReading(short, null, start + 1000).remainingMs, 7000);
  assert.equal(stakingClockReading(short, null, start + 10000).remainingMs, 0);
  assert.equal(stakingClockReading(null, null, start).remainingMs, null);
  assert.equal(stakingClockReading('invalid', timeline, start).remainingMs, null);
  assert.equal(stakingClockReading(null, timeline, start).remainingMs, null);
});
test('scheduled minute boundaries do not pause a real 24-hour clock while waiting for fresh chart data', () => {
  const scheduled = { ...timeline, minutesPerTick: 1, tickIntervalMs: 60000, nextTickAt: new Date(start + 60000).toISOString() };
  assert.equal(stakingClockReading(end, scheduled, start + 62000).remainingMs, 8 * 3600000 - 62000);
  assert.equal(stakingClockReading(end, scheduled, start + 62000).tickLeftMs, 0);
});
test('server sync never rewinds on cached, delayed or out-of-order readings', () => {
  const anchor = syncRoundClock(null, start, 100);
  assert.equal(roundServerTime(anchor, 1100), start + 1000);
  assert.equal(syncRoundClock(anchor, start, 2100), anchor);
  assert.equal(syncRoundClock(anchor, start - 1000, 2100), anchor);
  const delayed = syncRoundClock(anchor, start + 1500, 2100);
  assert.equal(roundServerTime(delayed, 2100), start + 2000);
  assert.equal(roundServerTime(delayed, 3100), start + 3000);
  const fresh = syncRoundClock(delayed, start + 8000, 4100);
  assert.equal(roundServerTime(fresh, 4100), start + 8000);
  assert.equal(roundServerTime(fresh, 5100), start + 9000);
});
