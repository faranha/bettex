import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { earningsHistory, walletEarningsSummary } from './wallet-earnings-model.ts';
import type { DemoDashboard } from '@workspace/api-client-react';

const sample = (): DemoDashboard => JSON.parse(readFileSync(new URL('../interface-demo/fixture.json', import.meta.url), 'utf8')).dashboard;
const close = (a: number, b: number) => assert(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test('historical periods count completed rounds and never duplicate snapshot and ledger credits', () => {
  const d = sample(); const h = earningsHistory(d);
  assert.equal(h.yesterday.recordedUsdc, d.rounds[0].participationSnapshot!.receivedUsdc);
  assert(h.yesterday.complete);
  assert.equal(h.week.coveredDays, 7);
  assert(h.week.complete);
  close(h.week.recordedUsdc!, d.rounds.reduce((sum, r) => sum + r.participationSnapshot!.receivedUsdc, 0));
  assert.equal(h.month.coveredDays, 7);
  assert.equal(h.month.complete, false);
  assert.equal(h.month.recordedUsdc, h.week.recordedUsdc, '30 days shows only recorded subtotal, never 7-day extrapolation');
});
test('missing data is unknown; retained round is a known zero', () => {
  const d = sample(); d.history = []; d.rounds = [d.rounds[0]];
  d.rounds[0].participationSnapshot = undefined;
  assert.equal(earningsHistory(d).yesterday.recordedUsdc, null);
  d.rounds[0].status = 'retained';
  assert.equal(earningsHistory(d).yesterday.recordedUsdc, 0);
  assert(earningsHistory(d).yesterday.complete);
});
test('ledger fallback excludes unconfirmed and non-distribution entries', () => {
  const d = sample(); d.rounds = [];
  const credit = d.history.find(h => h.kind === 'distribution')!;
  d.history = [credit, { ...credit }, { ...credit, id: 'pending', status: 'pending', amount: 1000 }, { ...credit, id: 'swap', kind: 'swap', amount: 1000 }];
  assert.equal(earningsHistory(d).yesterday.recordedUsdc, credit.amount);
});
test('native profiles never reuse visual-demo history or forecast', () => {
  const d = sample(); d.profile.authenticated = true; d.profile.provider = 'native';
  const summary = walletEarningsSummary(d);
  assert.equal(summary.projectedUsdc, null);
  assert.equal(summary.dailyReturnPercent, null);
  assert.equal(summary.projected30DaysPercent, null);
  assert.equal(summary.history.week.recordedUsdc, null);
});
test('daily percentage uses eligible principal; monthly assumes unchanged payouts without compounding', () => {
  const d = sample();
  d.staking.chartScenario = {
    roundStartedAt: d.staking.cycleStartedAt, elapsedMinutes: 0, tick: 0,
    nextTickAt: d.serverNow, tickIntervalMs: 60_000, minutesPerTick: 1,
    points: [{ elapsedMinutes: 0, profitUsdc: d.treasury.cycleResultUsdc }, { elapsedMinutes: 1440, profitUsdc: 10_000 }],
  } as NonNullable<DemoDashboard['staking']['chartScenario']>;
  const summary = walletEarningsSummary(d);
  assert(summary.projectedUsdc !== null);
  close(summary.dailyReturnPercent!, summary.projectedUsdc / (d.staking.eligibleTokens * d.balances.bettexUsdc) * 100);
  close(summary.projected30DaysPercent!, summary.dailyReturnPercent! * 30);
  close(summary.projected30DaysUsdc!, summary.projectedUsdc * 30);
  d.staking.eligibleTokens = 0;
  assert.equal(walletEarningsSummary(d).dailyReturnPercent, null, 'No divide by zero');
});
