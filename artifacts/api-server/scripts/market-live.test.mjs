import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";

const compiled = await build({ stdin: {
  contents: 'export {createMarketFeed} from "./src/modules/agents/infrastructure/coinbase-market-feed";',
  resolveDir: new URL("..", import.meta.url).pathname,
}, bundle: true, write: false, platform: "node", format: "cjs", logLevel: "silent" });
const mod = { exports: {} };
new Function("require", "module", "exports", compiled.outputFiles[0].text)(createRequire(import.meta.url), mod, mod.exports);
const { createMarketFeed } = mod.exports;

function fixture() {
  let now = Date.UTC(2026, 9, 6, 7), calls = 0, failure = false, badTicker = false, badHistory = false, price = "105";
  const fetcher = async input => {
    calls++;
    if (failure) throw new Error("synthetic_network_failure");
    const url = new URL(input);
    const data = url.pathname.endsWith("/ticker")
      ? { price: badTicker ? "-1" : price, time: new Date(now - 1000).toISOString() }
      : url.pathname.endsWith("/stats") ? { open: "100", high: "110", low: "90" }
        : badHistory ? [] : [
          [(now - 300000) / 1000, 90, 110, 100, 102, 10],
          [(now - 600000) / 1000, 90, 110, 100, 100, 10],
          [now / 1000 + 300, 90, 110, 100, 109, 10], // Future data is excluded.
          [(now - 900000) / 1000, 100, 90, 100, 99, 10], // Invalid OHLC.
        ];
    return new Response(JSON.stringify(data), { status: 200 });
  };
  return { feed: createMarketFeed(fetcher, () => now),
    advance: ms => { now += ms; }, fail: value => { failure = value; },
    invalidTicker: () => { badTicker = true; }, invalidHistory: () => { badHistory = true; },
    price: value => { price = value; }, calls: () => calls };
}

test("actual source prices, signed 24h change and ordered raw closes; no future or invalid candles", async () => {
  const f = fixture(), snapshot = await f.feed.snapshot();
  assert.deepEqual(snapshot.assets.map(x => x.symbol), ["BTC", "ETH", "SOL"]);
  for (const asset of snapshot.assets) {
    assert.equal(asset.status, "live");
    assert.equal(asset.price, "105"); assert.equal(asset.change24h, 5);
    assert.deepEqual(asset.history.map(x => x.value), [100, 102]);
    assert.ok(asset.history[0].time < asset.history[1].time);
    assert.ok(asset.tradeAt && asset.observedAt);
  }
});
test("single-flight and TTL prevent request amplification; price refresh does not refetch cached candles", async () => {
  const f = fixture();
  await Promise.all([f.feed.snapshot(), f.feed.snapshot(), f.feed.snapshot()]);
  assert.equal(f.calls(), 9);
  await f.feed.snapshot(); assert.equal(f.calls(), 9);
  f.advance(15000); f.price("95");
  const next = await f.feed.snapshot();
  assert.equal(f.calls(), 15);
  assert.equal(next.assets[0].price, "95"); assert.equal(next.assets[0].change24h, -5);
});
test("network failure preserves original values and timestamps, marks stale, then recovers", async () => {
  const f = fixture(), before = await f.feed.snapshot();
  f.fail(true); f.advance(15000);
  const failed = await f.feed.snapshot();
  assert.equal(failed.assets[0].status, "stale");
  assert.equal(failed.assets[0].price, before.assets[0].price);
  assert.equal(failed.assets[0].observedAt, before.assets[0].observedAt);
  assert.equal(failed.assets[0].change24h, null);
  f.fail(false); f.advance(15000); f.price("106");
  const recovered = await f.feed.snapshot();
  assert.equal(recovered.assets[0].status, "live"); assert.equal(recovered.assets[0].price, "106");
  assert.notEqual(recovered.assets[0].observedAt, before.assets[0].observedAt);
});
test("cold source failure has no fabricated prices or history", async () => {
  const f = fixture(); f.fail(true);
  const data = await f.feed.snapshot();
  assert.ok(data.assets.every(x => x.status === "unavailable" && x.price === null && x.history.length === 0));
});
test("malformed ticker and unavailable history are explicit independent states", async () => {
  const f = fixture(); f.invalidTicker();
  const badPrice = await f.feed.snapshot();
  assert.ok(badPrice.assets.every(x => x.price === null && x.status === "unavailable" && x.change24h === null));
  const g = fixture(); g.invalidHistory();
  const badChart = await g.feed.snapshot();
  assert.ok(badChart.assets.every(x => x.status === "live" && x.historyStatus === "unavailable" && x.history.length === 0));
});
test("failed history refresh keeps old points marked stale without fabricating replacements", async () => {
  const f = fixture(), before = await f.feed.snapshot();
  f.advance(60000); f.invalidHistory();
  const after = await f.feed.snapshot();
  assert.equal(after.assets[0].status, "live");
  assert.equal(after.assets[0].historyStatus, "stale");
  assert.deepEqual(after.assets[0].history, before.assets[0].history);
});
