import test from 'node:test';
import assert from 'node:assert/strict';
import type { DemoDashboard, NativeTestJourney } from '@workspace/api-client-react';
import { earningsStake } from './earnings-stake.ts';

const demo = (total: number, eligible: number) => ({
  profile: { authenticated: false }, balances: { bettex: total }, staking: { eligibleTokens: eligible },
}) as DemoDashboard;

test('earnings card distinguishes total balance from round-eligible BETTEX and late deposits', () => {
  assert.deepEqual(earningsStake(demo(1500, 1000)), { total: 1500, eligible: 1000, outside: 500, native: false });
  assert.deepEqual(earningsStake(demo(0, 0)), { total: 0, eligible: 0, outside: 0, native: false });
  assert.equal(earningsStake(demo(1500, 0)).outside, 1500);
  assert.equal(earningsStake(demo(1500, 1500)).outside, 0);
  assert.equal(earningsStake(demo(0, 1000)).eligible, null);
});

test('native card uses protocol eligibility and balance, never demo or stale quantities', () => {
  const d = { ...demo(99999, 99999), profile: { authenticated: true, provider: 'native' } } as DemoDashboard;
  const j = { participation: { balance: '1500000000000000000000', eligible: '1000000000000000000000' } } as NativeTestJourney;
  assert.deepEqual(earningsStake(d, j), { total: 1500, eligible: 1000, outside: 500, native: true });
  assert.deepEqual(earningsStake(d, j, true), { total: null, eligible: null, outside: null, native: true });
  assert.deepEqual(earningsStake(d), { total: null, eligible: null, outside: null, native: true });
});
