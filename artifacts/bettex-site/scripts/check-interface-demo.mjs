import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const temp = await mkdtemp(join(tmpdir(), 'bettex-demo-check-'));
try {
  const file = join(temp, 'runtime.mjs');
  await build({ entryPoints: [resolve(import.meta.dirname, '../src/components/interface-demo/runtime.ts')],
    outfile: file, bundle: true, platform: 'node', format: 'esm' });
  const runtime = await import(pathToFileURL(file).href);
  let forwarded = 0, notices = 0;
  globalThis.window = {
    location: { href: 'https://demo.example/en/app', pathname: '/en/app' },
    fetch: async () => { forwarded++; return new Response('asset'); },
    dispatchEvent: () => { notices++; },
  };
  runtime.installVisualDemoTransport();
  for (const path of ['/app', '/en/app', '/es/app', '/app/central', '/app/wallets', '/app/treasury', '/app/account', '/demo', '/sign-in', '/sign-up']) {
    window.location.pathname = path;
    const d = await (await window.fetch('/api/demo/dashboard')).json();
    assert.equal(d.profile.accountId, 'interface-demo');
    assert.equal(d.profile.authenticated, false);
    assert.ok(d.lottery?.eligible, 'Lottery must be present on the first render in every locale');
    assert.equal(d.lottery.ownActiveNumbers, 1);
    assert.ok(d.treasury.cycleResultUsdc > 0);
    assert.doesNotMatch(JSON.stringify(d), /0x[0-9a-f]{40,}/i, 'Fixtures cannot contain usable-looking blockchain addresses or transaction hashes');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      for (const url of ['/api/demo/movements', '/objects/upload', 'https://rpc.example/']) {
        assert.equal((await window.fetch(url, { method })).status, 403);
      }
    }
    assert.equal((await window.fetch('/api/agents/trading')).status, 410);
    for (const url of ['/api/demo/testnet', '/api/account/wallets', '/rpc', 'https://rpc.example/']) {
      assert.equal((await window.fetch(url)).status, 410);
    }
  }
  assert.equal(forwarded, 0, 'No API, upload or RPC request may reach the network');
  assert.equal(notices, 120);
  const original = runtime.visualDashboard();
  original.balances.usdc = 0;
  assert.ok(runtime.visualDashboard().balances.usdc > 0, 'Views must receive independent immutable examples');
  console.log('Visual demo: 10 routes, mock records/addresses, stable lottery, 120 mutations blocked, operational GET/RPC reads blocked, zero network requests.');
} finally { await rm(temp, { recursive: true, force: true }); }
