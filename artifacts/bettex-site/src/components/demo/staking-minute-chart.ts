export type MinuteSample = { at: number; profit: number | null; allocated: number | null; forecast?: number | null };
export type MinuteRow = { minute: number; at: number; profit: number | null; allocated: number | null; forecast: number | null };
export type MinuteView = '1h' | '6h' | '24h';
export type HourRow = {
  minute: number; at: number; fromAt: number; toAt: number;
  profit: number; partial: boolean;
};
const SPAN: Record<MinuteView, number> = { '1h': 60, '6h': 360, '24h': 1440 };
const fin = (n: unknown): number | null => typeof n === 'number' && Number.isFinite(n) ? n : null;

/** Window in elapsed minutes, clipped to 0..1440. Roughly 75% past, 25% future. */
export function minuteWindow(view: MinuteView, elapsed: number | null, total = 1440): [number, number] {
  const span = Math.min(SPAN[view], total);
  if (span >= total) return [0, total];
  const e = elapsed === null || !Number.isFinite(elapsed) ? 0 : elapsed;
  const start = Math.max(0, Math.min(total - span, Math.round(e - span * 0.75)));
  return [start, start + span];
}

/** One row per source minute; no aggregation, no invented values, null gaps kept. */
export function minuteRows(points: MinuteSample[], t0: number, [lo, hi]: [number, number]): MinuteRow[] {
  const rows = new Map<number, MinuteRow>();
  for (const p of points) {
    if (!Number.isFinite(p.at)) continue;
    const minute = Math.floor((p.at - t0) / 60000);
    if (minute < lo || minute > hi) continue;
    rows.set(minute, { minute, at: t0 + minute * 60000, profit: fin(p.profit), allocated: fin(p.allocated), forecast: fin(p.forecast) });
  }
  return [...rows.values()].sort((a, b) => a.minute - b.minute);
}

export const barColor = (v: number | null) => v === null ? 'transparent' : v > 0 ? '#0E7C6B' : v < 0 ? '#C44B45' : '#9AA3B2';
export const fmtClock = (at: number, locale: string) => new Intl.DateTimeFormat(locale, { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(at);

/** Whole cycle-hours ending at the current hour; future estimates are excluded. */
export function hourlyWindow(view: MinuteView, elapsed: number): [number, number] {
  const end = Math.min(1440, Math.max(60, Math.ceil(elapsed / 60) * 60));
  return [Math.max(0, end - SPAN[view]), end];
}

/** Differences of observed cumulative endpoints, never differences of forecasts.
 * Missing hour boundaries produce explicitly partial intervals, not invented zeros.
 */
export function hourlyRows(points: MinuteSample[], t0: number, [lo, hi]: [number, number]): HourRow[] {
  const observed = minuteRows(points, t0, [0, 1440]).filter(p => p.profit !== null);
  const result: HourRow[] = [];
  for (let start = lo; start < hi; start += 60) {
    const end = Math.min(start + 60, 1440);
    const samples = observed.filter(p => p.minute >= start && p.minute <= end);
    const first = samples[0], last = samples.at(-1);
    if (!first || !last || first.minute === last.minute) continue;
    result.push({
      minute: start, at: t0 + start * 60000, fromAt: first.at, toAt: last.at,
      profit: Math.round((last.profit! - first.profit!) * 1e6) / 1e6,
      partial: first.minute !== start || last.minute !== end,
    });
  }
  return result;
}
