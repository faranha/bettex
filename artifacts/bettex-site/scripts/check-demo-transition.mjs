import assert from 'node:assert/strict';
import path from 'node:path';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '..');
const server = await createServer({
  configFile: path.join(root, 'vite.config.ts'), mode: 'production',
  define: { 'import.meta.env.PROD': true, 'import.meta.env.DEV': false },
  server: { middlewareMode: true }, appType: 'custom',
});
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  for (const route of ['/app', '/app/central', '/sign-in', '/en/app', '/en/app/treasury', '/es/app', '/es/app/historial']) {
    const html = render(route);
    assert.ok(html.includes('data-testid="button-demo-alex"'), `${route}: explicit demo login in initial HTML`);
    assert.ok(!html.includes('data-testid="app-shell"'), `${route}: no signed-in flash before login`);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, route);
    assert.doesNotMatch(html, /card-agent-(?:sports|predictions|igaming)|o próximo agente|the next agent/i);
  }
  const data = await server.ssrLoadModule('/src/components/interface-demo/central-data.ts');
  for (const request of data.REQUESTS) {
    for (const title of request.market) assert.doesNotMatch(title, /above|acima|sobre US\$|8 horas|8 hours/i);
    assert.ok(request.sources.every(source => source.kind === 'demo'), request.id);
    assert.ok(Number(request.price) > 1, `${request.id}: spot asset price, not event probability`);
    for (const text of request.uncertainty) assert.ok(text.length > 30);
  }
  for (const order of data.ORDERS) {
    const request = data.REQUESTS.find(item => item.id === order.requestId);
    assert.ok(request, order.id);
    for (const fill of order.fills) {
      const cash = Number(fill.cash) / 1e6;
      const implied = Number(fill.shares) / 1e6 * Number(fill.price);
      assert.ok(Math.abs(cash - implied) < .02, `${fill.id}: quantity/spot price reconcile with illustrative cash`);
    }
  }
  const { visualDashboard } = await server.ssrLoadModule('/src/components/interface-demo/runtime.ts');
  const dashboard = visualDashboard();
  const referenceCap = dashboard.staking.eligibleTokens * dashboard.balances.bettexUsdc * .01;
  // This checks the displayed example, not a normative USDC valuation policy.
  assert.ok(dashboard.staking.estimatedUsdc <= referenceCap);
  for (const movement of dashboard.history.filter(item => item.kind === 'distribution')) {
    assert.ok(movement.amount <= referenceCap, `${movement.id}: illustrative daily participant return`);
  }
  assert.ok(dashboard.history.every(item => item.feeUsdc === 0), 'No BETTEX service fees');
  console.log('Demo transition: seven signed-out SSR routes, PT/EN/ES entry, crypto spot records and cash links, zero service fees and illustrative participant cap verified.');
} finally {
  await server.close();
}
