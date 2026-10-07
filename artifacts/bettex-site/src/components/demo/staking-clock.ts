import type { StakingTimeline } from './staking-model.ts';

const DAY = 86400000;
/** Treasury progress uses the recorded interval, never the visitor's arrival time. */
export function roundIntervalReading(startedAt: string, endsAt: string, now: number) {
  const start = Date.parse(startedAt);
  const end = Date.parse(endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(now) || end <= start) {
    return { remainingMs: null, progress: null };
  }
  return {
    remainingMs: Math.max(0, end - now),
    progress: Math.min(1, Math.max(0, (now - start) / (end - start))),
  };
}

/** The round deadline is authoritative; chart ticks never accelerate or pause time. */
export function stakingClockReading(nextCycleAt: string | null, timeline: StakingTimeline | null, now: number) {
  const end = nextCycleAt ? Date.parse(nextCycleAt) : NaN;
  const remainingMs = Number.isFinite(end) && Number.isFinite(now) ? Math.max(0, end - now) : null;
  const elapsedMs = remainingMs === null ? null : Math.min(DAY, Math.max(0, DAY - remainingMs));
  const next = timeline ? Date.parse(timeline.nextTickAt) : NaN;
  const tickLeftMs = Number.isFinite(next) ? Math.max(0, next - now) : null;
  return { remainingMs, elapsedMs, tickLeftMs, progress: elapsedMs === null ? 0 : elapsedMs / DAY };
}

export type RoundClockAnchor = { serverAt: number; monotonicAt: number; lastReading: number };
export function roundServerTime(anchor: RoundClockAnchor, monotonicNow: number) {
  return anchor.serverAt + Math.max(0, monotonicNow - anchor.monotonicAt);
}
/** Delayed, cached or out-of-order responses must never rewind a running clock. */
export function syncRoundClock(anchor: RoundClockAnchor | null, reading: number, monotonicNow: number): RoundClockAnchor {
  if (!anchor) return { serverAt: reading, monotonicAt: monotonicNow, lastReading: reading };
  if (reading <= anchor.lastReading) return anchor;
  return { serverAt: Math.max(reading, roundServerTime(anchor, monotonicNow)), monotonicAt: monotonicNow, lastReading: reading };
}
