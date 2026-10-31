import type { DemoBurnEntry, DemoBurnSummary } from '@workspace/api-client-react';

export type BurnTotals = {
  fundedUsdc: number;
  spentUsdc: number;
  purchasedBettex: number;
  receivedBettex: number;
  burnedBettex: number;
  eventCount: number;
  burnCount: number;
};

const total = (rows: DemoBurnEntry[], kind: DemoBurnEntry['kind'], field: 'amountUsdc' | 'tokensBettex') =>
  rows.filter(e => e.kind === kind).reduce((sum, e) => sum + Math.round(e[field] * 1_000_000), 0) / 1_000_000;

export function burnTotals(rows: DemoBurnEntry[]): BurnTotals {
  return {
    fundedUsdc: total(rows, 'wallet_funded', 'amountUsdc'),
    spentUsdc: total(rows, 'tokens_purchased', 'amountUsdc'),
    purchasedBettex: total(rows, 'tokens_purchased', 'tokensBettex'),
    receivedBettex: total(rows, 'tokens_received', 'tokensBettex'),
    burnedBettex: total(rows, 'tokens_burned', 'tokensBettex'),
    eventCount: rows.length,
    burnCount: rows.filter(e => e.kind === 'tokens_burned').length,
  };
}

export function burnAnalytics(b: DemoBurnSummary, roundId?: string) {
  const ordered = [...b.entries].sort((a, c) => Date.parse(a.at) - Date.parse(c.at) || a.id.localeCompare(c.id));
  const all = burnTotals(ordered);
  const current = roundId ? burnTotals(ordered.filter(e => e.roundId === roundId)) : null;
  const roundIds = [...new Set(ordered.map(e => e.roundId))];
  const rounds = roundIds.map(id => ({ roundId: id, ...burnTotals(ordered.filter(e => e.roundId === id)) }));
  // Preserve an opening balance if the journal ever covers only part of the lifetime total.
  const openingBurned = Math.max(0, Math.round((b.totalBurnedBettex - all.burnedBettex) * 1_000_000)) / 1_000_000;
  let burnedUnits = Math.round(openingBurned * 1_000_000);
  const byTime = new Map<number, { at: number; burnedBettex: number }>();
  for (const entry of ordered) {
    if (entry.kind === 'tokens_burned') burnedUnits += Math.round(entry.tokensBettex * 1_000_000);
    const at = Date.parse(entry.at);
    if (Number.isFinite(at)) byTime.set(at, { at, burnedBettex: burnedUnits / 1_000_000 });
  }
  const timeline = [...byTime.values()];
  const latestBurn = ordered.filter(e => e.kind === 'tokens_burned').at(-1) ?? null;
  return { all, current, rounds, timeline, openingBurned, latestBurn };
}
