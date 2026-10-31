/** Bounded read-only public-data probe. No credentials, signing, accounts or orders. */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SCALE = 1_000_000n;
export function units(raw) {
  if (typeof raw !== 'string' || !/^(0|[1-9]\d{0,24})(\.\d{1,6})?$/.test(raw))
    throw new Error('unsupported_decimal');
  const [a, b = ''] = raw.split('.');
  return BigInt(a) * SCALE + BigInt(b.padEnd(6, '0'));
}
const ceil = (a, b) => (a + b - 1n) / b;

/** Price impact for explicitly requested gross shares, NOT a complete funded order quote. */
export function analyzeBook(book, tokenId, quantity, now = Date.now()) {
  if (book.asset_id !== tokenId || typeof book.hash !== 'string' || !book.hash ||
      !Array.isArray(book.asks) || !Array.isArray(book.bids) ||
      !/^\d{10,16}$/.test(String(book.timestamp))) throw new Error('invalid_book_identity');
  const timestamp = Number(book.timestamp);
  if (!Number.isSafeInteger(timestamp) || now - timestamp > 60_000 || timestamp > now + 5000)
    throw new Error('stale_or_future_book');
  const qty = units(quantity);
  if (!qty) throw new Error('positive_quantity_required');
  const levels = side => side.map(l => ({ p: units(l.price), q: units(l.size) }));
  const asks = levels(book.asks), bids = levels(book.bids);
  if (asks.length > 10000 || bids.length > 10000 ||
      [...asks, ...bids].some(l => !l.p || l.p >= SCALE || !l.q))
    throw new Error('invalid_or_unbounded_levels');
  asks.sort((a, b) => a.p < b.p ? -1 : a.p > b.p ? 1 : 0);
  bids.sort((a, b) => a.p > b.p ? -1 : a.p < b.p ? 1 : 0);
  if (!asks.length) throw new Error('no_ask_liquidity');
  if (bids[0] && bids[0].p > asks[0].p) throw new Error('crossed_book');
  let left = qty, weighted = 0n, used = 0;
  for (const l of asks) {
    if (!left) break;
    const fill = left < l.q ? left : l.q;
    weighted += l.p * fill; left -= fill; used++;
  }
  if (left) throw new Error('insufficient_observed_depth');
  const subtotal = ceil(weighted, SCALE);
  return {
    kind: 'book_only_research', tokenId, bookHash: book.hash,
    producedAt: new Date(timestamp).toISOString(), requestedGrossSharesUnits: qty.toString(),
    bestAskUnits: asks[0].p.toString(), bestBidUnits: bids[0]?.p.toString() ?? null,
    spreadUnits: bids[0] ? (asks[0].p - bids[0].p).toString() : null,
    averageAskUnits: ceil(weighted, qty).toString(), grossSubtotalUnits: subtotal.toString(),
    priceImpactUnits: (subtotal - ceil(qty * asks[0].p, SCALE)).toString(),
    observedAskSharesUnits: asks.reduce((sum, l) => sum + l.q, 0n).toString(), levelsUsed: used,
    completeExecutableQuote: false, authorized: false,
    missing: ['attested_fee_formula_and_denomination', 'collateral_and_network_attestation',
              'conversion_and_network_costs', 'mandate_and_order_size_approval'],
  };
}

async function get(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`public_http_${r.status}`);
  const body = await r.text();
  if (body.length > 2_000_000) throw new Error('oversized_response');
  const data = JSON.parse(body);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid_response');
  return data;
}
async function main() {
  const args = process.argv.slice(2);
  const arg = key => args[args.indexOf(key) + 1];
  const asset = arg('--asset'), shares = arg('--shares');
  if (!args.includes('--asset') || !['btc', 'eth', 'sol'].includes(asset) ||
      !args.includes('--shares') || !shares || !units(shares)) throw new Error('asset_and_research_shares_required');
  const searches = { btc: 'Bitcoin', eth: 'Ethereum', sol: 'Solana' };
  const matches = { btc: /\b(bitcoin|btc)\b/i, eth: /\b(ethereum|eth)\b/i, sol: /\b(solana|sol)\b/i };
  const url = `https://gamma-api.polymarket.com/public-search?q=${searches[asset]}&events_status=active&limit_per_type=3`;
  const data = await get(url);
  if (!Array.isArray(data.events)) throw new Error('invalid_search');
  const candidates = data.events.flatMap(e => Array.isArray(e.markets) ? e.markets : []);
  const market = candidates.find(m => m.active === true && m.closed === false && m.enableOrderBook === true &&
    typeof m.question === 'string' && matches[asset].test(m.question) && Date.parse(m.endDate) > Date.now());
  if (!market) throw new Error('no_supported_open_market');
  const tokens = typeof market.clobTokenIds === 'string' ? JSON.parse(market.clobTokenIds) : market.clobTokenIds;
  const token = tokens?.[0];
  if (typeof token !== 'string' || !/^\d{1,100}$/.test(token)) throw new Error('unsupported_token_identity');
  const bookUrl = `https://clob.polymarket.com/book?token_id=${token}`;
  const book = await get(bookUrl);
  const report = { asset, collectedAt: new Date().toISOString(), marketId: String(market.id),
    question: market.question, sources: [url, bookUrl], analysis: analyzeBook(book, token, shares),
    feeParameters: null, feeSourceStatus: 'unavailable' };
  if (typeof market.conditionId === 'string' && /^0x[0-9a-fA-F]{64}$/.test(market.conditionId)) {
    const feeUrl = `https://clob.polymarket.com/clob-markets/${market.conditionId}`;
    try {
      const fee = await get(feeUrl);
      if (!Array.isArray(fee.t) || !fee.t.some(t => t.t === token)) throw new Error('fee_market_mismatch');
      report.sources.push(feeUrl);
      report.feeParameters = { curve: fee.fd ?? null, makerBaseBps: fee.mbf ?? null,
                              takerBaseBps: fee.tbf ?? null, minimumSize: fee.mos ?? null, tickSize: fee.mts ?? null };
      report.feeSourceStatus = 'observed_not_attested_for_execution';
    } catch { /* Explicit absence, never zero fees. */ }
  }
  const json = JSON.stringify(report, null, 2);
  if (args.includes('--out')) await writeFile(arg('--out'), json + '\n');
  console.log(json);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(async error => {
    const reason = error instanceof Error && /^[a-z_0-9]{1,80}$/.test(error.message)
      ? error.message : 'public_probe_unavailable_or_incompatible';
    const report = JSON.stringify({ status: 'blocked', reason,
      completeExecutableQuote: false, authorized: false });
    const index = process.argv.indexOf('--out');
    if (index >= 0 && process.argv[index + 1]) {
      try { await writeFile(process.argv[index + 1], report + '\n'); } catch { /* No false saved status. */ }
    }
    console.log(report);
    process.exitCode = 2;
  });
}
