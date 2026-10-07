/** Current-round allocation, separate from cash accumulated in the burn wallet. */
export function lotteryRoundBalance(realizedNetUsdc: number | null | undefined): number | null {
  if (realizedNetUsdc == null || !Number.isFinite(realizedNetUsdc)) return null;
  return Math.round(Math.max(0, realizedNetUsdc) * 0.25 * 1_000_000) / 1_000_000;
}
