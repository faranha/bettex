/** Label-only demo ticker. Never used for public quotes, orders or accounting. */
export const DEMO_PRICE_TICK_MS = 2800;
const WAVE = [0, 3, 1, 5, 4, 0, -2, 1, -1, -4, -2, -5, -3, 0, 2, 1, 4, 6, 3, 5, 2, -1, 1, -2];
export const DEMO_PRICE_PERIOD = WAVE.length;
const ASSETS = {
  btc: { base: 535, offset: 0 },
  eth: { base: 500, offset: 8 },
  sol: { base: 515, offset: 16 },
} as const;

export function demoPriceAt(asset: string, step: number): { cents: number; direction: 'up' | 'down' | 'flat' } | undefined {
  if (!Object.hasOwn(ASSETS, asset)) return undefined;
  const { base, offset } = ASSETS[asset as keyof typeof ASSETS];
  const tick = Number.isFinite(step) ? Math.max(0, Math.floor(step)) : 0;
  const current = WAVE[(tick + offset) % WAVE.length];
  const previous = WAVE[((tick ? tick - 1 : tick) + offset) % WAVE.length];
  return {
    cents: (base + current - WAVE[offset]) / 10,
    direction: current > previous ? 'up' : current < previous ? 'down' : 'flat',
  };
}
