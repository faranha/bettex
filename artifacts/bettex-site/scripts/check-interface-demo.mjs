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
  const routes = ['/app', '/en/app', '/es/app', '/app/central', '/app/wallets', '/app/treasury', '/app/account', '/demo', '/sign-in', '/sign-up',
    '/app/history', '/en/app/history', '/es/app/history', '/en/app/treasury', '/es/app/treasury',
    '/demo/history', '/en/demo/history', '/es/demo/history', '/demo/treasury', '/en/demo/treasury', '/es/demo/treasury'];
  const mutationTargets = ['/api/demo/movements', '/objects/upload', 'https://rpc.example/',
    '/api/demo/history', '/api/demo/treasury/statement', '/api/treasury/history'];
  for (const path of routes) {
    window.location.pathname = path;
    const d = await (await window.fetch('/api/demo/dashboard')).json();
    assert.equal(d.profile.accountId, 'interface-demo');
    assert.equal(d.profile.authenticated, false);
    assert.ok(d.lottery?.eligible, 'Lottery must be present on the first render in every locale');
    assert.equal(d.lottery.ownActiveNumbers, 1);
    assert.ok(d.treasury.cycleResultUsdc > 0);
    assert.doesNotMatch(JSON.stringify(d), /0x[0-9a-f]{40,}/i, 'Fixtures cannot contain usable-looking blockchain addresses or transaction hashes');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      for (const url of mutationTargets) {
        assert.equal((await window.fetch(url, { method })).status, 403);
      }
    }
    assert.equal((await window.fetch('/api/agents/trading')).status, 410);
    for (const url of ['/api/demo/history?view=general', '/api/demo/rounds', '/api/demo/treasury/activity?roundId=2026-10-08&view=history']) {
      const r = await window.fetch(url);
      assert.equal(r.status, 200, `${url} must be answered locally`);
      assert.ok(Array.isArray((await r.json()).items));
    }
    const history = await (await window.fetch('/api/demo/history?view=general')).json();
    assert.ok(history.items.length > 0, 'The complete History remains available in demo mode');
    for (const entry of history.items) {
      assert.equal(entry.source, 'illustrative_example');
      assert.equal(entry.environment, 'simulation');
      assert.equal(entry.chainId, null);
      assert.equal(entry.transactionHash, null);
    }
    const lot = await (await window.fetch('/api/demo/dashboard')).json();
    assert.deepEqual(lot.lottery.draws, [], 'No lottery results may be invented');
    for (const url of ['/api/demo/treasury/statement', '/api/demo/treasury/wallets', '/api/demo/history/distribution-preview', '/api/demo/double2x']) {
      assert.equal((await window.fetch(url)).status, 410, `${url} stays blocked`);
    }
    for (const url of ['/api/demo/testnet', '/api/account/wallets', '/rpc', 'https://rpc.example/']) {
      assert.equal((await window.fetch(url)).status, 410);
    }
  }
  assert.equal(forwarded, 0, 'No API, upload or RPC request may reach the network');
  const blockedMutations = routes.length * mutationTargets.length * 4;
  assert.equal(notices, blockedMutations);
  const original = runtime.visualDashboard();
  original.balances.usdc = 0;
  assert.ok(runtime.visualDashboard().balances.usdc > 0, 'Views must receive independent immutable examples');
  console.log(`Visual demo: ${routes.length} routes including Treasury/History in PT/EN/ES and legacy routes, mock records/addresses, stable lottery, ${blockedMutations} mutations blocked, only local read-only History endpoints answered, other operational GET/RPC reads blocked, zero network requests.`);
} finally { await rm(temp, { recursive: true, force: true }); }
