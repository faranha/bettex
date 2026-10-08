import test from 'node:test';
import assert from 'node:assert/strict';
import { burnAnalytics } from './burn-analytics.ts';

const entry = (id: string, roundId: string, kind: 'wallet_funded' | 'tokens_purchased' | 'tokens_received' | 'tokens_burned', amountUsdc: number, tokensBettex: number, at: string) =>
  ({ id, roundId, kind, amountUsdc, tokensBettex, at, source: 'modeled_demo' as const });
const entries = [
  entry('a', 'r1', 'wallet_funded', 10, 0, '2026-10-07T12:00:00Z'),
  entry('b', 'r1', 'tokens_purchased', 8, 100, '2026-10-07T13:00:00Z'),
  entry('c', 'r1', 'tokens_burned', 0, 100, '2026-10-07T14:00:00Z'),
  entry('d', 'r2', 'wallet_funded', 5, 0, '2026-10-08T12:00:00Z'),
  entry('e', 'r2', 'tokens_received', 0, 25, '2026-10-08T13:00:00Z'),
  entry('f', 'r2', 'tokens_burned', 0, 25, '2026-10-08T13:00:00Z'),
];
const summary = { source: 'modeled_demo' as const, walletId: 'demo', address: null, walletUsdc: 7, walletBettex: 0, totalBurnedBettex: 125, referencePriceUsdc: 0.04, updatedAt: '2026-10-08T14:00:00Z', entries };

test('round totals are separate from lifetime totals and wallet balances', () => {
  const a = burnAnalytics(summary, 'r2');
  assert.equal(a.all.burnedBettex, 125);
  assert.equal(a.current?.burnedBettex, 25);
  assert.equal(a.current?.purchasedBettex, 0);
  assert.equal(a.current?.receivedBettex, 25);
  assert.equal(a.all.fundedUsdc, 15);
  assert.equal(a.all.spentUsdc, 8);
  assert.equal(a.rounds.length, 2);
});
test('timeline is chronological, cumulative, and groups simultaneous events', () => {
  const a = burnAnalytics({ ...summary, entries: [...entries].reverse() });
  assert.deepEqual(a.timeline.map(p => p.burnedBettex), [0, 0, 100, 100, 125]);
  assert.equal(a.latestBurn?.id, 'f');
});
test('no round is unknown, a round without recorded events has zero activity', () => {
  assert.equal(burnAnalytics(summary).current, null);
  assert.equal(burnAnalytics(summary, 'r3').current?.eventCount, 0);
  assert.equal(burnAnalytics(summary, 'r3').current?.burnedBettex, 0);
});
test('partial history preserves the opening cumulative amount without fake events', () => {
  const a = burnAnalytics({ ...summary, totalBurnedBettex: 150 });
  assert.equal(a.openingBurned, 25);
  assert.equal(a.timeline.at(-1)?.burnedBettex, 150);
});
test('micro-unit aggregation avoids floating point drift', () => {
  const a = burnAnalytics({ ...summary, totalBurnedBettex: 0.3, entries: [
    entry('x', 'r1', 'tokens_burned', 0, 0.1, '2026-10-08T12:00:00Z'),
    entry('y', 'r1', 'tokens_burned', 0, 0.2, '2026-10-08T13:00:00Z'),
  ] }, 'r1');
  assert.equal(a.current?.burnedBettex, 0.3);
  assert.equal(a.timeline.at(-1)?.burnedBettex, 0.3);
});
