import { Router } from "express";
import { GetDemoPolymarketResponse } from "@workspace/api-zod";
import { localizeMarketTitles, type MarketLocale } from "../lib/polymarket-titles";

type Asset = "BTC" | "ETH" | "SOL";
type Market = { asset: Asset; id: string; question: string; url: string; yesPrice: number; noPrice: number; volume24h: number; liquidity: number };
type Feed = { source: string; fetchedAt: string; markets: Market[]; errors: { asset: Asset; message: string }[] };
const router = Router();
let cached: { until: number; data: Feed } | null = null;
let pending: Promise<Feed> | null = null;
let failedUntil = 0;
const record = (v: unknown): Record<string, unknown> => typeof v === "object" && v !== null ? v as Record<string, unknown> : {};
const array = (v: unknown): unknown[] => {
  try { const a = typeof v === "string" ? JSON.parse(v) : v; return Array.isArray(a) ? a : []; } catch { return []; }
};
const amount = (v: unknown) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0; };

async function quotes(asset: Asset, query: string): Promise<Market[]> {
  const url = new URL("https://gamma-api.polymarket.com/public-search");
  url.search = new URLSearchParams({ q: query, limit_per_type: "6", events_status: "active" }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`source_http_${response.status}`);
  const data = record(await response.json()); const result: Market[] = [];
  for (const rawEvent of array(data.events)) {
    const event = record(rawEvent);
    if (event.closed === true || typeof event.slug !== "string") continue;
    for (const rawMarket of array(event.markets)) {
      const m = record(rawMarket);
      if (m.closed !== false || m.active !== true || typeof m.question !== "string") continue;
      const relevance = asset === "BTC" ? /\b(bitcoin|btc)\b/i : asset === "ETH" ? /\b(ethereum|ether|eth)\b/i : /\b(solana|sol)\b/i;
      if (!relevance.test(`${String(event.title ?? "")} ${m.question}`)) continue;
      const outcomes = array(m.outcomes); const prices = array(m.outcomePrices).map(Number);
      const yes = outcomes.indexOf("Yes"); const no = outcomes.indexOf("No");
      if (yes < 0 || no < 0 || !prices.every(Number.isFinite) || !(prices[yes] > 0 && prices[yes] < 1) || !(prices[no] > 0 && prices[no] < 1)) continue;
      if (!/^[a-z0-9-]+$/.test(event.slug)) continue;
      result.push({ asset, id: String(m.id), question: m.question, url: `https://polymarket.com/event/${event.slug}`,
        yesPrice: prices[yes], noPrice: prices[no], volume24h: amount(m.volume24hr), liquidity: amount(m.liquidityNum ?? m.liquidity) });
    }
  }
  const unique = [...new Map(result.map(m => [m.id, m])).values()];
  return unique.filter(m => m.liquidity >= 250).sort((a, b) => Math.abs(a.yesPrice - .5) - Math.abs(b.yesPrice - .5) || b.liquidity - a.liquidity).slice(0, 6);
}
async function load(): Promise<Feed> {
  const assets: [Asset, string][] = [["BTC", "Bitcoin"], ["ETH", "Ethereum"], ["SOL", "Solana"]];
  const data: Feed = { source: "Polymarket Gamma", fetchedAt: new Date().toISOString(), markets: [], errors: [] };
  await Promise.all(assets.map(async ([asset, query]) => {
    try {
      const markets = await quotes(asset, query);
      data.markets.push(...markets);
      if (!markets.length) data.errors.push({ asset, message: "no_open_binary_markets" });
    } catch { data.errors.push({ asset, message: "public_source_unavailable" }); }
  }));
  if (!data.markets.length) throw new Error("public_source_unavailable");
  return data;
}
// The only new demo capability is unsigned public GET data. No accounts, workers, database or CLOB orders.
router.get("/demo/polymarket", async (req, res) => {
  const locale = (req.query.locale ?? 'en') as MarketLocale;
  if (!['pt', 'en', 'es'].includes(locale)) return res.status(400).json({ error: 'invalid_locale' });
  const localized = async (data: Feed) => {
    const titles = await localizeMarketTitles(data.markets.map(m => m.question), locale);
    return GetDemoPolymarketResponse.parse({ ...data, markets: data.markets.map((m, i) => ({ ...m, question: titles[i] })) });
  };
  if (cached && cached.until > Date.now()) {
    try { return res.json(await localized(cached.data)); }
    catch { return res.status(503).json({ error: 'polymarket_translation_unavailable' }); }
  }
  if (failedUntil > Date.now()) return res.status(503).json({ error: "polymarket_unavailable" });
  try {
    pending ??= load();
    const data = await pending;
    cached = { data, until: Date.now() + 60000 };
    res.setHeader("Cache-Control", "public, max-age=30");
    try { return res.json(await localized(data)); }
    catch { return res.status(503).json({ error: 'polymarket_translation_unavailable' }); }
  } catch {
    failedUntil = Date.now() + 15000;
    return res.status(503).json({ error: "polymarket_unavailable" });
  } finally { pending = null; }
});
export default router;
