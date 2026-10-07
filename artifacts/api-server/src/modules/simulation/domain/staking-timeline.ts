export const STAKING_TICK_MS = 6000;
export const STAKING_MINUTES_PER_TICK = 6;
export const STAKING_DAY_MINUTES = 1440;
export type StakingTimelinePoint = { elapsedMinutes: number; profitUsdc: number };
export type StakingTimelineState = {
  roundStartedAt: number;
  lastTickAt: number;
  nextTickAt: number;
  elapsedMinutes: number;
  tick: number;
  points: StakingTimelinePoint[];
};
type RandomSource = () => number;
const money = (n: number) => Math.round(n * 100) / 100;

/** A randomized chart-only scenario. It never creates ledger credits or trades. */
export function createStakingTimeline(now: number, random: RandomSource, initialMinutes = 960): StakingTimelineState {
  const anchors = [
    [0, 0], [240, -6000 - random() * 1800], [480, -4900 - random() * 700],
    [720, -2100 - random() * 800], [960, -500 - random() * 600],
    [1200, 250 + random() * 600], [1440, 1200 + random() * 1400],
  ];
  const points: StakingTimelinePoint[] = [];
  for (let minute = 0; minute <= STAKING_DAY_MINUTES; minute += STAKING_MINUTES_PER_TICK) {
    const right = anchors.findIndex(a => a[0]! >= minute);
    const b = anchors[Math.max(0, right)]!;
    const a = anchors[Math.max(0, right - 1)]!;
    const fraction = a[0] === b[0] ? 0 : (minute - a[0]!) / (b[0]! - a[0]!);
    const noise = minute === a[0] || minute === b[0] ? 0 : (random() - 0.5) * 220;
    points.push({ elapsedMinutes: minute, profitUsdc: money(a[1]! + fraction * (b[1]! - a[1]!) + noise) });
  }
  return { roundStartedAt: now - initialMinutes * 60000, lastTickAt: now,
    nextTickAt: now + STAKING_TICK_MS, elapsedMinutes: initialMinutes,
    tick: initialMinutes / STAKING_MINUTES_PER_TICK, points };
}

/** Catch up by elapsed wall-clock ticks, including when no browser is open. */
export function advanceStakingTimeline(state: StakingTimelineState, now: number, random: RandomSource): StakingTimelineState {
  const steps = Math.max(0, Math.floor((now - state.lastTickAt) / STAKING_TICK_MS));
  if (!steps) return state;
  const finalTick = STAKING_DAY_MINUTES / STAKING_MINUTES_PER_TICK;
  const ticks = state.tick + steps;
  const lastTickAt = state.lastTickAt + steps * STAKING_TICK_MS;
  if (ticks > finalTick) {
    const next = createStakingTimeline(lastTickAt, random, (ticks % (finalTick + 1)) * STAKING_MINUTES_PER_TICK);
    return next;
  }
  state.tick = ticks;
  state.elapsedMinutes = ticks * STAKING_MINUTES_PER_TICK;
  state.lastTickAt = lastTickAt;
  state.nextTickAt = lastTickAt + STAKING_TICK_MS;
  return state;
}

export function stakingTimelineSnapshot(state: StakingTimelineState) {
  return { source: "test_scenario" as const, roundStartedAt: new Date(state.roundStartedAt).toISOString(),
    nextTickAt: new Date(state.nextTickAt).toISOString(), elapsedMinutes: state.elapsedMinutes, tick: state.tick,
    tickIntervalMs: STAKING_TICK_MS, minutesPerTick: STAKING_MINUTES_PER_TICK, points: state.points };
}
