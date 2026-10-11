import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const temp = await mkdtemp(join(tmpdir(), 'bettex-project-'));
try {
  const dir = resolve(import.meta.dirname, '../src/components/interface-demo');
  const names = ['demo-project-model', 'central-data', 'central-graph-model', 'history-demo-data', 'central-audit-data'];
  await build({ entryPoints: names.map(n => join(dir, `${n}.ts`)), outdir: temp, outExtension: { '.js': '.mjs' },
    bundle: true, splitting: true, platform: 'node', format: 'esm', define: { 'import.meta.env.BASE_URL': '"/"' } });
  const [p, c, g, h, a] = await Promise.all(names.map(n => import(pathToFileURL(join(temp, `${n}.mjs`)))));
  const d = p.projectSnapshot, r = d.treasury.currentRound;
  const crypto = r.agentAllocations.find(a => a.agent === 'crypto');
  const money = n => String(Math.round(n * 1e6));
  for (const [field, value] of Object.entries({ total: r.assetsUsdc, allocated: r.workingUsdc, reserved: r.committedUsdc,
    available: r.availableUsdc, reserve: r.reserveUsdc, pool: r.poolUsdc, agentAllocated: crypto.allocatedUsdc,
    agentCommitted: crypto.committedUsdc, agentAvailable: crypto.availableUsdc })) assert.equal(c.CAPITAL[field], money(value), field);
  assert.equal(r.assetsUsdc, r.reserveUsdc + r.poolUsdc + r.workingUsdc, 'Pool is not counted twice');
  assert.equal(r.workingUsdc, r.committedUsdc + r.availableUsdc);
  const open = c.POSITIONS.filter(p => p.state !== 'settled' && p.state !== 'closed');
  const orderReserve = c.ORDERS.reduce((s, o) => s + BigInt(o.reserved), 0n);
  assert.equal(orderReserve, BigInt(c.CAPITAL.orderReserved));
  assert.equal(open.reduce((s, p) => s + BigInt(p.cost), orderReserve), BigInt(c.CAPITAL.agentCommitted));
  assert.equal(c.CAPITAL.exposure.reduce((s, e) => s + BigInt(e.units), orderReserve), BigInt(c.CAPITAL.agentCommitted));
  assert.equal(BigInt(c.CAPITAL.agentAvailable) + BigInt(c.CAPITAL.agentCommitted), BigInt(c.CAPITAL.agentAllocated));
  const requests = new Map(c.REQUESTS.map(r => [r.id, r]));
  const decisions = new Map(c.DECISIONS.map(d => [d.id, d]));
  const orders = new Map(c.ORDERS.map(o => [o.id, o]));
  for (const decision of decisions.values()) assert.ok(requests.has(decision.requestId), 'Every decision has a request');
  for (const order of orders.values()) {
    assert.ok(requests.has(order.requestId));
    assert.equal(order.fills.reduce((s, f) => s + BigInt(f.shares), 0n), BigInt(order.filled), 'Fills equal filled quantity');
    assert.ok(BigInt(order.filled) <= BigInt(order.qty));
    if (order.state === 'filled') assert.equal(order.filled, order.qty);
    if (order.fills.length) {
      assert.ok(!['rejected', 'expired'].includes(requests.get(order.requestId).state), 'No fills for rejected/expired requests');
      assert.ok(c.DECISIONS.some(d => d.requestId === order.requestId && d.state === 'selected'), 'Fill follows selection');
    }
  }
  for (const position of c.POSITIONS) {
    assert.ok(requests.has(position.requestId));
    const order = c.ORDERS.find(o => o.requestId === position.requestId);
    assert.ok(order);
    assert.equal(position.qty, order.filled);
    assert.equal(order.fills.reduce((s, f) => s + BigInt(f.cash), 0n), BigInt(position.cost));
    assert.deepEqual(position.event, requests.get(position.requestId).market);
  }
  assert.equal(Object.values(p.PROJECT_RULES.allocations).reduce((s, n) => s + n), 100);
  assert.equal(Object.values(p.PROJECT_RULES.profit).reduce((s, n) => s + n), 100);
  assert.deepEqual(Object.values(p.PROJECT_RULES.profit), [50, 25, 25]);
  assert.equal(p.PROJECT_RULES.launchNetwork, null);
  assert.equal(p.PROJECT_RULES.serviceFees, 0);
  assert.equal(new Set(g.NODES.map(n => n.id)).size, g.NODES.length);
  assert.equal(new Set(g.EDGES.map(e => e.id)).size, g.EDGES.length);
  const reached = new Set(['bettex']);
  for (let i = 0; i < g.NODES.length; i++) for (const e of g.EDGES) {
    assert.ok(g.hasNode(e.a) && g.hasNode(e.b), 'No dangling edge');
    if (reached.has(e.a) || reached.has(e.b)) { reached.add(e.a); reached.add(e.b); }
    for (const text of Object.values(g.edgeText(e))) assert.ok(text.length === 3 && text.every(s => s.trim()));
  }
  assert.equal(reached.size, g.NODES.length, 'Every panel retains its documented reading connections');
  assert.deepEqual(g.GRAPH_NODES.map(n => n.id).sort(), ['bettex', 'btc', 'eth', 'predictions', 's0', 's1', 's2', 'sol']);
  for (const node of g.NODES) {
    assert.equal(g.isGraphNode(node.id), ['core', 'agent', 'spec', 'soon'].includes(node.kind), 'Controls and business topics stay outside; Crypto subagents stay in the graph');
    assert.equal(g.isGraphSelection({ k: 'node', id: node.id }), g.isGraphNode(node.id));
  }
  for (const edge of g.GRAPH_EDGES) {
    assert.ok(g.isGraphNode(edge.a) && g.isGraphNode(edge.b), 'Every scene edge connects agents only');
    if (g.nodeOf(edge.a).kind === 'soon' || g.nodeOf(edge.b).kind === 'soon') assert.equal(edge.planned, true);
  }
  assert.equal(g.isGraphSelection({ k: 'edge', id: 'tokenomics-treasury' }), false);
  assert.deepEqual([...g.graphRoute({ k: 'node', id: 'tokenomics' }).nodes], []);
  assert.equal(g.CHAPTERS.length, 6);
  assert.equal(new Set(p.PROJECT_TOPICS.map(t => t.chapter)).size, 6);
  const doc = await readFile(join(dir, '../WhitepaperChapters.tsx'), 'utf8');
  for (const topic of p.PROJECT_TOPICS) {
    assert.ok(g.hasNode(topic.id));
    assert.ok(doc.includes(`id: '${topic.chapter}'`), 'Existing documentation anchor');
    assert.ok(g.chaptersFor({ k: 'node', id: topic.id }).includes(topic.chapter));
    for (const text of [topic.title, topic.summary, ...topic.rules]) assert.ok(text.length === 3 && text.every(s => s.trim()));
  }
  for (const n of g.NODES) {
    const sel = { k: 'node', id: n.id };
    assert.deepEqual(g.parseSel(`?${g.selQuery(sel)}`), n.kind === 'soon' ? null : sel);
    if (n.kind !== 'soon') assert.ok(g.tabsFor(sel).length > 0);
  }
  for (const e of g.EDGES) assert.deepEqual(g.parseSel(`?edge=${e.id}`), { k: 'edge', id: e.id });
  assert.equal(g.parseSel('?node=unknown'), null);
  assert.equal(g.parseSel('?edge=unknown'), null);
  assert.equal(g.docHref('documentacao-emissao', 'en'), '/en/documentation#documentacao-emissao');
  assert.equal(g.docHref('documentacao-emissao', 'es'), '/es/documentacion#documentacao-emissao');
  const journal = a.centralAuditEntries();
  const ids = new Set(journal.map(e => e.id));
  assert.equal(ids.size, journal.length);
  for (const e of journal) {
    assert.ok(requests.has(e.correlationId));
    assert.ok(e.parentId == null || ids.has(e.parentId), 'Every journal parent exists');
    assert.equal(e.environment, 'simulation');
    assert.equal(e.asset, null, 'Didactic entries are not cash movements');
    assert.equal(e.data.graphDemoRecord, true);
    assert.equal(e.transactionHash, null);
  }
  for (const req of c.REQUESTS) {
    const page = h.historyPage(h.historyEntries(d), new URLSearchParams({ view: 'general', correlationId: req.id, limit: '50' }));
    assert.ok(page.items.length >= 2);
    assert.ok(page.items.every(e => e.correlationId === req.id));
  }
  console.log(`Demo project: ${g.NODES.length} connected nodes, ${g.EDGES.length} meaningful edges, 6 documentation chapters, ${journal.length} correlated records; shared capital, lifecycle states, currencies and read-only provenance verified.`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
