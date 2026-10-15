import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const temp = await mkdtemp(join(tmpdir(), 'bettex-packets-'));
try {
  const dir = resolve(import.meta.dirname, '../src/components/interface-demo');
  const names = ['central-packets', 'central-data', 'central-graph-model', 'central-audit-data', 'central-demo-prices', 'scene3d', 'central-journey', 'central-view'];
  await build({
    entryPoints: names.map(name => join(dir, `${name}.ts`)), outdir: temp,
    outExtension: { '.js': '.mjs' }, bundle: true, splitting: true,
    platform: 'node', format: 'esm', define: { 'import.meta.env.BASE_URL': '"/"' },
  });
  const [p, c, g, audit, prices, scene, journey, view] = await Promise.all(names.map(name => import(pathToFileURL(join(temp, `${name}.mjs`)))));
  for (const request of c.REQUESTS) {
    const trace = journey.requestJourney(request.id);
    assert(trace && trace.request.id === request.id);
    assert.equal(trace.packets.length, p.PACKETS.filter(packet => packet.requestId === request.id).length);
    assert.equal(new Set(trace.entries.map(entry => entry.id)).size, trace.entries.length, 'Journey entries are not duplicated');
    assert(trace.entries.every((entry, i) => !i || Date.parse(trace.entries[i - 1].at) <= Date.parse(entry.at)), 'One chronological projection');
    assert(trace.decisions.every(decision => decision.requestId === request.id));
    assert(trace.orders.every(order => order.requestId === request.id));
    assert(trace.positions.every(position => position.requestId === request.id));
    assert(trace.auditIds.every(id => audit.centralAuditEntries().some(entry => entry.id === id && entry.correlationId === request.id)));
    assert(trace.entries.every(entry => !entry.id.startsWith('demo-run-')), 'Generic monitoring is not proposal evidence');
    if (request.state === 'awaiting_decision') {
      assert.equal(trace.decisions.length, 0, 'Pending proposal never gets an invented decision');
      assert.equal(trace.orders.length, 0, 'Pending proposal never gets an invented order');
    }
  }
  const rejected = journey.requestJourney('demo-req-sol-001');
  assert(rejected.orders.every(order => order.state === 'cancelled' && order.fills.length === 0 && order.filled === '0'));
  assert.equal(rejected.positions.length, 0, 'Rejected SOL has no executed position');
  let context = view.readCentralView('');
  const ethPacket = p.PACKETS.find(packet => packet.requestId === 'demo-req-eth-000' && packet.source === 'governance');
  context = view.transitionCentralView(context, { type: 'packet', id: ethPacket.id });
  assert.equal(context.requestId, ethPacket.requestId, 'Graph clicks establish proposal context');
  context = view.transitionCentralView(context, { type: 'reports' });
  assert.equal(context.requestId, ethPacket.requestId);
  assert.equal(context.reportAgentId, 'governance');
  assert.equal(context.packetId, null);
  assert.equal(context.selection, null);
  assert(context.reportsOpen, 'Only reports overlay remains');
  assert.deepEqual(view.readCentralView(view.writeCentralView('?lang=es&section=agents', context)), context, 'Reports context survives reload');
  const reportSearch = new URLSearchParams(view.writeCentralView('?lang=es', context));
  assert.equal(reportSearch.get('lang'), 'es', 'Language selection is preserved');
  context = view.transitionCentralView(context, { type: 'request', id: ethPacket.requestId });
  assert.equal(context.reportsOpen, false);
  assert.equal(context.packetId, null);
  assert.equal(context.selection.id, 'predictions');
  const solPacket = p.PACKETS.find(packet => packet.requestId === 'demo-req-sol-001' && packet.exchange);
  context = view.transitionCentralView(context, { type: 'packet', id: solPacket.id });
  assert.equal(context.requestId, solPacket.requestId, 'Cross-request packet overrides stale proposal');
  assert.equal(context.selection, null);
  assert.equal(view.readCentralView(`?packet=${ethPacket.id}&request=${solPacket.requestId}`).requestId, ethPacket.requestId, 'Packet wins over conflicting URL request');
  context = view.transitionCentralView(context, { type: 'close' });
  assert.equal(context.packetId, null);
  assert.equal(context.requestId, solPacket.requestId, 'Closing retains proposal focus without reopening a second overlay');
  context = view.transitionCentralView(context, { type: 'clearRequest' });
  assert.equal(context.requestId, null);
  const ids = new Set(p.PACKETS.map(packet => packet.id));
  assert.equal(ids.size, p.PACKETS.length, 'Packet identity is unique');
  assert.equal(p.PACKETS.filter(p => !p.exchange).length, c.REQUESTS.length * 2 + c.DECISIONS.length * 2);
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
    if (packet.kind === 'decision' && !packet.exchange) {
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
    assert(!p.PACKETS.some(packet => packet.requestId === request.id && packet.kind === 'decision' && !packet.exchange), 'An opinion never turns a pending proposal into a decision');
  }
  for (const order of c.ORDERS) for (const fill of order.fills) {
    const entry = entries.find(item => item.id === fill.id);
    assert(entry && entry.correlationId === order.requestId);
    assert.equal(entry.data.quantityUnits, fill.shares);
    assert.equal(entry.data.decimals, 6, 'Audit quantity uses the same precision as graph fills');
    assert.equal(entry.data.feeUnits, fill.fees, 'Audit costs agree with packet details');
  }
  assert.equal(p.packetById('not-a-packet'), undefined);
  for (const cam of [
    { yaw: 0, pitch: 0, zoom: 1, px: 0, py: 0 },
    { yaw: 0.8, pitch: -0.35, zoom: 1.6, px: 50, py: -90 },
  ]) {
    const a = [-300, -120, 50], b = [200, 250, -40], control = scene.ctrlOf(a, b, 80);
    for (const t of [0.1, 0.4, 0.8]) {
      const center = scene.projectPoint(scene.bez(a, control, b, t), cam, 1000, 800);
      const outgoing = scene.railPoint(a, control, b, t, 1, cam, 1000, 800);
      const incoming = scene.railPoint(a, control, b, t, -1, cam, 1000, 800);
      assert(Math.abs(Math.hypot(outgoing.x - center.x, outgoing.y - center.y) - 7) < 1e-8, 'Lane stays 7px from track center at any camera angle');
      assert(Math.abs((outgoing.x + incoming.x) / 2 - center.x) < 1e-8);
      assert(Math.abs((outgoing.y + incoming.y) / 2 - center.y) < 1e-8);
      assert(Number.isFinite(outgoing.angle));
    }
  }
  assert(!g.GRAPH_NODES.some(n => ['s0', 's1', 's2'].includes(n.id)), 'Future market placeholders replaced, not activated');
  for (const agent of g.CONTROLS) {
    assert(g.GRAPH_NODES.some(n => n.id === agent));
    assert(g.tabsFor({ k: 'node', id: agent }).some(t => t.tab === 'consultations'));
    const queries = p.PACKETS.filter(packet => packet.exchange === 'query' && packet.target === agent);
    assert(queries.length > 0, `BETTEX consults ${agent}`);
    for (const query of queries) {
      assert.equal(query.source, 'bettex');
      const reply = p.PACKETS.find(packet => packet.replyToId === query.id);
      assert(reply && reply.exchange === 'opinion' && reply.source === agent && reply.target === 'bettex');
      assert(!reply.decisionId, 'Opinions are not BETTEX approvals');
      for (const packet of [query, reply]) assert(entries.some(e => e.id === packet.id && e.correlationId === query.requestId), 'Consultation has a correlated audit record');
      const decision = c.DECISIONS.find(d => d.requestId === query.requestId);
      if (decision && ['governance', 'risk', 'treasury'].includes(agent)) assert(Date.parse(reply.at) < Date.parse(decision.at), 'Pre-decision opinion precedes the decision');
      if (decision && ['execution', 'reconciliation'].includes(agent)) assert(Date.parse(query.at) > Date.parse(decision.at), 'Execution follow-up cannot precede selection');
    }
  }
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
