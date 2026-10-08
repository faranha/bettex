import type { DemoDashboard, NativeTestJourney } from '@workspace/api-client-react';
import { tokenUnits } from './personal-native.ts';

const amount = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER ? value : null;
const nativeAmount = (raw: string | null | undefined): number | null => {
  const value = tokenUnits(raw);
  return value === null ? null : amount(Number(value));
};

/** Native participation must never be substituted with the demo wallet balance. */
export function earningsStake(d: DemoDashboard, journey?: NativeTestJourney, stale = false) {
  const native = d.profile.authenticated && d.profile.provider === 'native';
  const total = native ? (stale ? null : nativeAmount(journey?.participation?.balance)) : amount(d.balances.bettex);
  const eligible = native ? (stale ? null : nativeAmount(journey?.participation?.eligible)) : amount(d.staking.eligibleTokens);
  const outside = total === null || eligible === null || eligible > total ? null : Math.max(0, total - eligible);
  return { total, eligible: outside === null ? null : eligible, outside, native };
}
