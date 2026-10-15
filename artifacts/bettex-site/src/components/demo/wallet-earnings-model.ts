import type { DemoDashboard } from '@workspace/api-client-react';
import { scenarioStakingView } from './staking-model.ts';

const DAY = 86_400_000;
export type HistoryWindow = {
  days: number;
  coveredDays: number;
  recordedUsdc: number | null;
  complete: boolean;
};
type HistorySource = Pick<DemoDashboard, 'rounds' | 'history' | 'staking' | 'serverNow'>;
const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** Completed 16:00–16:00 São Paulo rounds, not the ongoing day's projection.
 * Snapshot credits and ledger credits describe the same payment, not two gains.
 * An absent day is unknown, never a zero or an extrapolated historical gain. */
export function earningsHistory(d: HistorySource) {
  const end = Date.parse(d.staking.cycleStartedAt);
  const now = Date.parse(d.serverNow);
  const payments = new Map<number, number>();
  const ledger = new Map<number, number>();
  const seen = new Set<string>();
  for (const h of d.history) {
    if (h.kind !== 'distribution' || h.asset !== 'USDC' || h.status !== 'confirmed'
      || !finite(h.amount) || h.amount < 0 || seen.has(h.id)) continue;
    seen.add(h.id);
    const at = Date.parse(h.at);
    if (Number.isFinite(at) && at <= now) ledger.set(at, (ledger.get(at) ?? 0) + h.amount);
  }
  for (const r of d.rounds) {
    const at = Date.parse(r.endedAt);
    if (!Number.isFinite(at) || at > now || payments.has(at)) continue;
    const received = r.participationSnapshot?.receivedUsdc;
    if (finite(received) && received >= 0) payments.set(at, received);
    else if (ledger.has(at)) payments.set(at, ledger.get(at)!);
    else if (r.status === 'retained') payments.set(at, 0);
  }
  // A confirmed distribution still counts when its round snapshot is missing.
  for (const [at, amount] of ledger) if (!payments.has(at)) payments.set(at, amount);
  function window(days: number): HistoryWindow {
    const known = new Map<number, number>();
    if (Number.isFinite(end) && Number.isFinite(now) && end <= now) {
      for (const [at, amount] of payments) {
        if (at > end - days * DAY && at <= end) {
          const roundDay = Math.floor((end - at) / DAY);
          known.set(roundDay, (known.get(roundDay) ?? 0) + amount);
        }
      }
    }
    return {
      days, coveredDays: known.size,
      recordedUsdc: known.size ? Math.round([...known.values()].reduce((a, b) => a + b, 0) * 1e6) / 1e6 : null,
      complete: known.size === days,
    };
  }
  return { yesterday: window(1), week: window(7), month: window(30) };
}

export function walletEarningsSummary(d: DemoDashboard) {
  const native = d.profile.authenticated && d.profile.provider === 'native';
  const projected = native ? null : scenarioStakingView(d)?.timeline.projectedOwnUsdc ?? null;
  const rawPrincipal = finite(d.staking.eligibleTokens) && finite(d.balances.bettexUsdc)
    && d.staking.eligibleTokens > 0 && d.balances.bettexUsdc > 0
    ? d.staking.eligibleTokens * d.balances.bettexUsdc : null;
  const principal = finite(rawPrincipal) ? rawPrincipal : null;
  const projectedUsdc = finite(projected) && projected >= 0 ? projected : null;
  const dailyReturnPercent = projectedUsdc !== null && principal !== null ? projectedUsdc / principal * 100 : null;
  const empty = (days: number): HistoryWindow => ({ days, coveredDays: 0, recordedUsdc: null, complete: false });
  return {
    projectedUsdc, eligiblePrincipalUsdc: native ? null : principal,
    dailyReturnPercent,
    // Payouts are USDC; no automatic reinvestment into eligible BETTEX.
    projected30DaysUsdc: projectedUsdc === null ? null : projectedUsdc * 30,
    projected30DaysPercent: dailyReturnPercent === null ? null : dailyReturnPercent * 30,
    history: native ? { yesterday: empty(1), week: empty(7), month: empty(30) } : earningsHistory(d),
  };
}
