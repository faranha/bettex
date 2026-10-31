import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  configFile: new URL('../vite.config.ts', import.meta.url).pathname,
  server: { middlewareMode: true }, appType: 'custom',
});
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  for (const locale of ['', '/en', '/es']) {
    for (const [path, id] of [['/app', 'home-agent-trading'], ['/app/central', 'central-agent-trading']]) {
      const html = render(`${locale}${path}`);
      assert.match(html, new RegExp(`id="${id}-tab-crypto"[^>]*aria-selected="true"`));
      for (const agent of ['sports', 'predictions', 'casino']) {
        assert.match(html, new RegExp(`id="${id}-tab-${agent}"[^>]*aria-selected="false"[^>]*disabled=""`));
      }
      assert.ok(html.includes(`${id}-panel-crypto`));
      assert.ok(html.includes('BTC') && html.includes('ETH') && html.includes('SOL'));
      assert.ok(!html.includes('Cobertura Sports autorizada'));
      assert.ok(!html.includes('Surebet: Time A x Time B'));
    }
  }
  console.log('Agent trading: Crypto selected and three upcoming agents disabled on home and AI Center in PT/EN/ES.');
} finally { await server.close(); }
