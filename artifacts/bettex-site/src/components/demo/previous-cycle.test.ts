import { test } from 'node:test';
import assert from 'node:assert/strict';
import { previousCycle } from './previous-cycle.ts';
type Input = Parameters<typeof previousCycle>[0];
function sample(): Input {
  return {
    staking: { cycleStartedAt: '2026-10-05T00:00:00Z' },
    rounds: [
      { id: '2026-10-03', endedAt: '2026-10-04T00:00:00Z', status: 'paid' },
      { id: '2026-10-04', endedAt: '2026-10-05T00:00:00Z', status: 'paid' },
    ],
    history: [
      { kind: 'distribution', asset: 'USDC', status: 'confirmed', at: '2026-10-04T00:00:00Z', amount: 100 },
      { kind: 'distribution', asset: 'USDC', status: 'confirmed', at: '2026-10-05T00:00:00+00:00', amount: 12.8 },
      { kind: 'distribution', asset: 'USDC', status: 'pending', at: '2026-10-05T00:00:00Z', amount: 999 },
      { kind: 'receive', asset: 'USDC', status: 'confirmed', at: '2026-10-05T00:00:00Z', amount: 50 },
    ],
  };
}
test('previous cycle shows only this account’s confirmed distribution at the latest boundary', () => {
  const value = previousCycle(sample());
  assert.equal(value?.round.id, '2026-10-04');
  assert.equal(value?.received, 12.8);
});
test('older rounds are not substituted for an absent previous cycle', () => {
  const d = sample();
  d.rounds.pop();
  assert.equal(previousCycle(d), null);
});
test('a paid project round does not invent a personal zero or payment from missing history', () => {
  const d = sample();
  d.history = [];
  assert.equal(previousCycle(d)?.received, null);
});
test('retained cycles explicitly show no distribution', () => {
  const d = sample();
  d.history = [];
  d.rounds[1].status = 'retained';
  assert.equal(previousCycle(d)?.received, 0);
});