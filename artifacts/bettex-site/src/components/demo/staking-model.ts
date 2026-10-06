import type { DemoDashboard, NativeTestJourney } from '@workspace/api-client-react';
import { tokenUnits } from './personal-native.ts';

export type StakingView = {
  source: 'demo' | 'native';
  myTokens: number | null;
  totalTokens: number | null;
  sharePercent: number | null;
  payoutWeightPercent: number | null;
  cycleProfitUsdc: number | null;
  roundAllocationUsdc: number | null;
  estimatedOwnUsdc: number | null;
  cycleStartedAt: string | null;
  nextCycleAt: string | null;
  readingAt: string | null;
  active: boolean;
  stale: boolean;
};
const finite = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const quantity = (value: string | null): number | null => {
  if (value === null) return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= Number.MAX_SAFE_INTEGER ? number : null;
};

export function demoStakingView(d: DemoDashboard): StakingView {
  return {
    source: 'demo',
    myTokens: finite(d.staking.eligibleTokens),
    totalTokens: finite(d.staking.totalEligibleTokens),
    sharePercent: finite(d.staking.tokenSharePercent),
    payoutWeightPercent: finite(d.staking.sharePercent),
    cycleProfitUsdc: finite(d.treasury.cycleResultUsdc),
    roundAllocationUsdc: finite(d.staking.poolAllocationUsdc),
    estimatedOwnUsdc: finite(d.staking.estimatedUsdc),
    cycleStartedAt: d.staking.cycleStartedAt,
    nextCycleAt: d.staking.nextCycleAt,
    readingAt: d.serverNow,
    active: d.staking.status === 'active',
    stale: false,
  };
}

export function nativeStakingView(j?: NativeTestJourney, stale = false): StakingView {
  const p = j?.participation;
  return {
    source: 'native',
    myTokens: quantity(tokenUnits(p?.eligible)),
    // The native protocol does not report these aggregates. Never substitute demo figures.
    totalTokens: null, sharePercent: null, payoutWeightPercent: null,
    cycleProfitUsdc: null, roundAllocationUsdc: null,
    estimatedOwnUsdc: null,
    cycleStartedAt: p ? new Date(p.roundStart * 1000).toISOString() : null,
    nextCycleAt: p ? new Date(p.roundEnd * 1000).toISOString() : null,
    readingAt: j?.updatedAt ?? null,
    active: !!p && /^\d+$/.test(p.eligible) && BigInt(p.eligible) > 0n,
    stale,
  };
}
