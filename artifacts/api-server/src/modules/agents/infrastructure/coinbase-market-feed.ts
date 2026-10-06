import type { MarketLiveAsset, MarketLiveSnapshot, MarketPricePoint } from "@workspace/api-zod";

const SOURCE = "https://api.exchange.coinbase.com/products/";
const REFRESH = 15_000;
const DAY = 86_400_000;
const PRODUCTS = [
  { symbol: "BTC", name: "Bitcoin", product: "BTC-USD" },
  { symbol: "ETH", name: "Ethereum", product: "ETH-USD" },
  { symbol: "SOL", name: "Solana", product: "SOL-USD" },
] as const;
type History = { points: MarketPricePoint[]; at: number };

function decimal(value: unknown): string {
  if (typeof value !== "string" || value.length > 80 || !/^\d+(?:\.\d+)?$/.test(value) ||
      !Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 1e12) {
    throw new Error("invalid_market_price");
  }
  return value;
}

/** Public observations only: no credentials, account data, orders or execution ports. */
export function createMarketFeed(fetcher: typeof fetch = fetch, clock: () => number = Date.now) {
  const quotes = new Map<string, MarketLiveAsset>();
  const histories = new Map<string, History>();
  let lastAttempt = -Infinity;
  let inflight: Promise<void> | null = null;

  async function json(path: string): Promise<unknown> {
    const response = await fetcher(SOURCE + path, { signal: AbortSignal.timeout(5_000),
      headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("market_source_unavailable");
    return response.json();
  }

  async function history(product: string): Promise<History> {
    const previous = histories.get(product);
    if (previous && clock() - previous.at < 60_000) return previous;
    const now = clock();
    const data = await json(`${product}/candles?granularity=300&start=${encodeURIComponent(new Date(now - DAY).toISOString())}&end=${encodeURIComponent(new Date(now).toISOString())}`);
    if (!Array.isArray(data)) throw new Error("invalid_market_history");
    const unique = new Map<number, MarketPricePoint>();
    for (const row of data.slice(0, 300)) {
      if (!Array.isArray(row) || row.length < 6 || !row.every(x => typeof x === "number" && Number.isFinite(x))) continue;
      const [seconds, low, high, open, close, volume] = row as number[];
      const time = seconds! * 1000;
      if (time < now - DAY || time > now || !Number.isInteger(seconds) ||
          low! <= 0 || high! < low! || open! < low! || open! > high! ||
          close! < low! || close! > high! || volume! < 0 || close! > 1e12) continue;
      unique.set(time, { time, value: close! });
    }
    const points = [...unique.values()].sort((a, b) => a.time - b.time);
    if (points.length < 2 || now - points.at(-1)!.time > 600_000) throw new Error("stale_market_history");
    const result = { points, at: clock() };
    histories.set(product, result);
    return result;
  }

  async function refresh() {
    await Promise.all(PRODUCTS.map(async definition => {
      const previous = quotes.get(definition.symbol);
      const [ticker, stats, candles] = await Promise.allSettled([
        json(`${definition.product}/ticker`), json(`${definition.product}/stats`), history(definition.product),
      ]);
      let price: string | null = null, tradeAt: string | null = null, observedAt: string | null = null;
      let change24h: number | null = null, high24h: string | null = null, low24h: string | null = null;
      let status: MarketLiveAsset["status"] = "unavailable";
      let validTicker = false;
      try {
        if (ticker.status !== "fulfilled" || !ticker.value || typeof ticker.value !== "object") throw new Error("unavailable");
        const value = ticker.value as Record<string, unknown>;
        price = decimal(value.price);
        const at = typeof value.time === "string" ? Date.parse(value.time) : NaN;
        if (!Number.isFinite(at) || at > clock() + 30_000) throw new Error("invalid_market_time");
        tradeAt = new Date(at).toISOString();
        observedAt = new Date(clock()).toISOString();
        status = clock() - at <= 120_000 ? "live" : "stale";
        validTicker = true;
      } catch {
        price = previous?.price ?? null;
        tradeAt = previous?.tradeAt ?? null;
        observedAt = previous?.observedAt ?? null;
        status = price === null ? "unavailable" : "stale";
      }
      if (price !== null && validTicker) {
        try {
          if (stats.status !== "fulfilled" || !stats.value || typeof stats.value !== "object") throw new Error("unavailable");
          const value = stats.value as Record<string, unknown>;
          const open = Number(decimal(value.open));
          const high = decimal(value.high), low = decimal(value.low);
          const change = (Number(price) - open) / open * 100;
          if (Number(low) > Number(high) || !Number.isFinite(change)) throw new Error("invalid_market_stats");
          high24h = high; low24h = low; change24h = change;
        } catch { /* Keep absent statistics explicit rather than fabricating values. */ }
      }
      const storedHistory = candles.status === "fulfilled" ? candles.value : histories.get(definition.product);
      quotes.set(definition.symbol, { ...definition, currency: "USD", status, price, change24h, high24h, low24h,
        observedAt, tradeAt, historyStatus: candles.status === "fulfilled" ? "available" : storedHistory ? "stale" : "unavailable",
        history: storedHistory?.points ?? [] });
    }));
  }

  return {
    async snapshot(): Promise<MarketLiveSnapshot> {
      if (!inflight && clock() - lastAttempt >= REFRESH) {
        lastAttempt = clock();
        inflight = refresh().finally(() => { inflight = null; });
      }
      if (inflight) await inflight;
      const now = clock();
      return { generatedAt: new Date(now).toISOString(), source: "Coinbase Exchange",
        sourceUrl: "https://www.coinbase.com/advanced-trade/spot", refreshIntervalMs: REFRESH,
        assets: PRODUCTS.map(definition => {
          const quote = quotes.get(definition.symbol)!;
          const stale = !quote.tradeAt || now - Date.parse(quote.tradeAt) > 120_000 ||
            !quote.observedAt || now - Date.parse(quote.observedAt) > 45_000;
          const latest = quote.history.at(-1);
          return { ...quote, status: quote.status === "live" && stale ? "stale" : quote.status,
            historyStatus: quote.historyStatus === "available" && (!latest || now - latest.time > 600_000) ? "stale" : quote.historyStatus,
            history: quote.history.map(point => ({ ...point })) };
        }) };
    },
  };
}
