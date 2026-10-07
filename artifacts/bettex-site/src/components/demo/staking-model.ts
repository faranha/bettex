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

export type StakingChartSample = { at: number; profit: number | null; allocated: number | null; forecast?: number | null };
export type StakingTimeline = {
  elapsedMinutes: number; tick: number; nextTickAt: string; tickIntervalMs: number;
  minutesPerTick: number; projectedOwnUsdc: number | null;
};
export function scenarioStakingView(d: DemoDashboard) {
  const scenario = d.staking.chartScenario;
  if (!scenario || (d.profile.authenticated && d.profile.provider === 'native')) return null;
  const start = Date.parse(scenario.roundStartedAt);
  const current = scenario.points.find(p => p.elapsedMinutes === scenario.elapsedMinutes);
  const last = scenario.points.at(-1);
  if (!Number.isFinite(start) || !current || !last || !Number.isFinite(current.profitUsdc) || !Number.isFinite(last.profitUsdc)) return null;
  // A chart is not a separate source of financial truth. Reject an old,
  // independent scenario instead of replacing treasury and account values.
  if (scenario.roundStartedAt !== d.staking.cycleStartedAt
    || new Date(start + 86400000).toISOString() !== new Date(d.staking.nextCycleAt).toISOString()
    || current.profitUsdc !== d.treasury.cycleResultUsdc) return null;
  const weightPercent = finite(d.staking.sharePercent);
  const weight = weightPercent === null ? null : Math.min(1, Math.max(0, weightPercent / 100));
  const view = demoStakingView(d);
  const points: StakingChartSample[] = scenario.points.map(p => ({
    at: start + p.elapsedMinutes * 60000,
    profit: p.elapsedMinutes <= scenario.elapsedMinutes ? p.profitUsdc : null,
    allocated: p.elapsedMinutes <= scenario.elapsedMinutes ? Math.max(0, p.profitUsdc) * 0.25 : null,
    forecast: p.elapsedMinutes >= scenario.elapsedMinutes ? p.profitUsdc : null,
  }));
  const timeline: StakingTimeline = {
    elapsedMinutes: scenario.elapsedMinutes, tick: scenario.tick, nextTickAt: scenario.nextTickAt,
    tickIntervalMs: scenario.tickIntervalMs, minutesPerTick: scenario.minutesPerTick,
    projectedOwnUsdc: weight === null ? null : Math.max(0, last.profitUsdc) * 0.25 * weight,
  };
  return { view, points, timeline };
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
