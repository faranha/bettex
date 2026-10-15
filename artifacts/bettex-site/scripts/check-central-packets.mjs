import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const temp = await mkdtemp(join(tmpdir(), 'bettex-packets-'));
try {
  const dir = resolve(import.meta.dirname, '../src/components/interface-demo');
  const names = ['central-packets', 'central-data', 'central-graph-model', 'central-audit-data', 'central-demo-prices'];
  await build({
    entryPoints: names.map(name => join(dir, `${name}.ts`)), outdir: temp,
    outExtension: { '.js': '.mjs' }, bundle: true, splitting: true,
    platform: 'node', format: 'esm', define: { 'import.meta.env.BASE_URL': '"/"' },
  });
  const [p, c, g, audit, prices] = await Promise.all(names.map(name => import(pathToFileURL(join(temp, `${name}.mjs`)))));
  const ids = new Set(p.PACKETS.map(packet => packet.id));
  assert.equal(ids.size, p.PACKETS.length, 'Packet identity is unique');
  assert.equal(p.PACKETS.length, c.REQUESTS.length * 2 + c.DECISIONS.length * 2);
  const before = JSON.stringify({ requests: c.REQUESTS, decisions: c.DECISIONS, orders: c.ORDERS, positions: c.POSITIONS, capital: c.CAPITAL });
  const entries = audit.centralAuditEntries();
  for (const packet of p.PACKETS) {
    const request = c.REQUESTS.find(r => r.id === packet.requestId);
    assert(request, `Existing request: ${packet.id}`);
    assert(g.GRAPH_NODES.some(n => n.id === packet.source));
    assert(g.GRAPH_NODES.some(n => n.id === packet.target));
    const edge = g.GRAPH_EDGES.find(e => e.id === packet.edgeId);
    assert(edge && !edge.planned, 'No packet in an unavailable sector');
    assert.deepEqual(new Set([edge.a, edge.b]), new Set([packet.source, packet.target]));
    assert(Number.isFinite(Date.parse(packet.at)));
    for (const value of [packet.title, packet.summary, ...packet.payload.flatMap(item => [item.label, item.value])]) {
      if (Array.isArray(value)) assert(value.length === 3 && value.every(v => typeof v === 'string' && v.length), 'PT/EN/ES complete');
    }
    assert(entries.some(entry => entry.correlationId === packet.requestId), 'Existing audit destination');
    if (packet.replyToId) {
      const original = p.packetById(packet.replyToId);
      assert(original && original.requestId === packet.requestId, 'No response crosses conversations');
      assert(Date.parse(original.at) <= Date.parse(packet.at), 'Response follows its source');
    }
    if (packet.kind === 'decision') {
      const decision = c.DECISIONS.find(d => d.id === packet.decisionId);
      assert(decision && decision.requestId === request.id, 'No invented decision');
      assert.deepEqual(packet.summary, decision.reason);
    }
    const conversation = p.packetConversation(packet);
    assert(conversation.length >= 2 && conversation.every(item => item.requestId === request.id));
    assert.deepEqual(conversation.map(item => Date.parse(item.at)), conversation.map(item => Date.parse(item.at)).sort((a, b) => a - b));
    for (const elapsed of [0, 4000, 12000, 24000, 31999, 32000, 99999, -10, NaN]) {
      const progress = p.packetProgress(packet, elapsed);
      assert(progress >= 0 && progress <= 1 && Number.isFinite(progress));
      assert.equal(progress, p.packetProgress(packet, elapsed + (elapsed >= 0 ? p.PACKET_REPLAY_MS : 0)) || 0, 'Replay is repeatable');
    }
    const staticPosition = p.packetProgress(packet, 0, true);
    assert(staticPosition > 0 && staticPosition < 1);
    assert.equal(staticPosition, p.packetProgress(packet, 20000, true), 'Reduced motion is static');
  }
  for (const asset of ['btc', 'eth', 'sol']) {
    assert(p.PACKETS.some(packet => packet.source === asset && packet.target === 'predictions'));
    assert(p.PACKETS.some(packet => packet.source === 'predictions' && packet.target === asset && packet.kind === 'decision'));
  }
  for (const request of c.REQUESTS.filter(r => !c.DECISIONS.some(d => d.requestId === r.id))) {
    assert(!p.PACKETS.some(packet => packet.requestId === request.id && packet.kind === 'decision'), 'Awaiting a decision remains awaiting');
  }
  for (const order of c.ORDERS) for (const fill of order.fills) {
    const entry = entries.find(item => item.id === fill.id);
    assert(entry && entry.correlationId === order.requestId);
    assert.equal(entry.data.quantityUnits, fill.shares);
    assert.equal(entry.data.decimals, 6, 'Audit quantity uses the same precision as graph fills');
    assert.equal(entry.data.feeUnits, fill.fees, 'Audit costs agree with packet details');
  }
  assert.equal(p.packetById('not-a-packet'), undefined);
  let visibleTotal = 0;
  for (let elapsed = 0; elapsed < p.PACKET_REPLAY_MS; elapsed += 100) {
    const visible = p.PACKETS.filter(packet => {
      const t = p.packetProgress(packet, elapsed);
      return t > 0.04 && t < 0.96;
    });
    assert(visible.some(packet => packet.kind === 'analysis'), 'Analysis continues throughout the replay');
    assert(visible.some(packet => packet.kind === 'decision'), 'Replies continue throughout the replay');
    visibleTotal += visible.length;
  }
  assert(visibleTotal / (p.PACKET_REPLAY_MS / 100) >= 7, 'Denser traffic without speeding up clickable messages');
  for (const [asset, initial] of [['btc', 53.5], ['eth', 50], ['sol', 51.5]]) {
    assert.equal(prices.demoPriceAt(asset, 0).cents, initial);
    const directions = new Set();
    for (let step = 1; step <= prices.DEMO_PRICE_PERIOD * 3; step++) {
      const current = prices.demoPriceAt(asset, step);
      const previous = prices.demoPriceAt(asset, step - 1);
      assert(current.cents > 0 && current.cents < 100);
      assert.notEqual(current.cents, previous.cents, 'Every visible tick changes the price');
      assert(Math.abs(current.cents - previous.cents) <= 0.5, 'Small changes, not arbitrary jumps');
      assert.deepEqual(current, prices.demoPriceAt(asset, step + prices.DEMO_PRICE_PERIOD));
      assert.equal(current.direction, current.cents > previous.cents ? 'up' : 'down');
      directions.add(current.direction);
    }
    assert.deepEqual(directions, new Set(['up', 'down']), 'Both rises and falls');
  }
  assert.equal(prices.demoPriceAt('bettex', 0), undefined, 'Only BTC/ETH/SOL receive demo prices');
  assert.equal(JSON.stringify({ requests: c.REQUESTS, decisions: c.DECISIONS, orders: c.ORDERS, positions: c.POSITIONS, capital: c.CAPITAL }), before, 'Replay never changes financial samples');
  const source = await readFile(join(dir, 'central-packets.ts'), 'utf8');
  assert.doesNotMatch(source, /\b(fetch|WebSocket|localStorage|setInterval)\s*[(.]/, 'Local read-only projection, not a runtime');
  console.log(`PASS: ${p.PACKETS.length} packets, both directions for BTC/ETH/SOL, correlated histories, causal replies, 3 locales, static reduced motion, changing demo prices, no financial mutations.`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
