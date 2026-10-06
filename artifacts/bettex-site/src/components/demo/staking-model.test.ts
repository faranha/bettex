import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { DemoDashboard, NativeTestJourney } from '@workspace/api-client-react';
import { demoStakingView, nativeStakingView } from './staking-model.ts';

test('token ownership share, time-weighted payout share and generated profit stay distinct', () => {
  const d = {
    serverNow: '2026-10-06T18:00:00Z',
    staking: { eligibleTokens: 12500, totalEligibleTokens: 8012500, tokenSharePercent: 12500 / 8012500 * 100,
      sharePercent: 0.09, poolAllocationUsdc: 250, estimatedUsdc: 0.225, status: 'active',
      cycleStartedAt: '2026-10-06T00:00:00Z', nextCycleAt: '2026-10-07T00:00:00Z' },
    treasury: { cycleResultUsdc: 1000 },
  } as DemoDashboard;
  const view = demoStakingView(d);
  assert.equal(view.myTokens, 12500);
  assert.equal(view.totalTokens, 8012500);
  assert.equal(view.sharePercent, 12500 / 8012500 * 100);
  assert.equal(view.payoutWeightPercent, 0.09);
  assert.equal(view.cycleProfitUsdc, 1000);
  assert.equal(view.roundAllocationUsdc, 250);
  assert.notEqual(view.estimatedOwnUsdc, view.roundAllocationUsdc);
});

test('missing native pool figures never become simulated figures or zeros', () => {
  const missing = nativeStakingView();
  assert.equal(missing.myTokens, null);
  assert.equal(missing.totalTokens, null);
  assert.equal(missing.sharePercent, null);
  assert.equal(missing.cycleProfitUsdc, null);
  assert.equal(missing.roundAllocationUsdc, null);
  const native = nativeStakingView({
    updatedAt: '2026-10-06T18:00:00Z',
    participation: { eligible: '12500000000000000000000', roundStart: 1791244800, roundEnd: 1791331200 },
  } as NativeTestJourney, true);
  assert.equal(native.myTokens, 12500);
  assert.equal(native.source, 'native');
  assert.equal(native.active, true);
  assert.equal(native.stale, true);
  assert.equal(native.totalTokens, null);
  assert.equal(native.roundAllocationUsdc, null);
});

test('staking is a full-width section integrated in dashboard and all wallet views', () => {
  const read = (file: string) => readFileSync(new URL(file, import.meta.url), 'utf8');
  assert.match(read('../../pages/demo.tsx'), /<StakingCorridor d=\{d\}/);
  assert.match(read('./DemoAccountPanel.tsx'), /tab === 'wallets'.*<StakingCorridor d=\{d\}/);
  assert.match(read('../account/AccountSheet.tsx'), /walletContent=\{<StakingCorridor d=\{d\}/);
  assert.match(read('./StakingCorridor.tsx'), /staking-corridor/);
  assert.doesNotMatch(read('./StakingCorridor.tsx'), /position:\s*fixed|w-\[3[0-9][0-9]px\]/);
});
