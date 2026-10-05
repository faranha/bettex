import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const result = await build({ entryPoints: ['src/middlewares/http-security.ts'],
  absWorkingDir: new URL('..', import.meta.url).pathname, bundle: true,
  platform: 'node', format: 'cjs', write: false });
const mod = { exports: {} };
new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, mod, mod.exports);
const { allowedOrigin, requestBoundary, safeHttpError } = mod.exports;
const trusted = 'https://bettex.ai';

function request(method, origin, type = 'application/json', path = '/api/demo/movements') {
  const res = { headers: {}, statusCode: 200, set(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } };
  let passed = false;
  requestBoundary({ method, originalUrl: path,
    get: key => key === 'origin' ? origin : undefined, is: expected => type === expected }, res, () => { passed = true; });
  return { res, passed };
}
test('origins cannot be extended by a forged Host, HTTP scheme, suffix or arbitrary local port', () => {
  const env = { NODE_ENV: 'production', REPLIT_DEV_DOMAIN: 'preview.replit.dev' };
  assert.equal(allowedOrigin(trusted, env), true);
  for (const value of ['http://bettex.ai', 'https://bettex.ai.evil.test', 'https://bettex.ai:444',
    'https://preview.replit.dev', 'http://localhost:25336', 'null', 'https://bettex.ai/path']) {
    assert.equal(allowedOrigin(value, env), false);
  }
});
test('all reads reject foreign origins; JSON, forms and missing origins cannot mutate accounts', () => {
  for (const method of ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']) {
    assert.equal(request(method, 'https://evil.test').res.statusCode, 403);
  }
  assert.equal(request('POST', undefined).res.statusCode, 403);
  assert.equal(request('POST', trusted, 'application/x-www-form-urlencoded').res.statusCode, 403);
  assert.equal(request('POST', trusted, 'text/plain').res.statusCode, 403);
  assert.equal(request('POST', trusted).passed, true);
  assert.equal(request('GET', undefined).passed, true);
});
test('Clerk proxy preserves its form protocol but still rejects foreign origins', () => {
  assert.equal(request('POST', trusted, 'application/x-www-form-urlencoded', '/api/__clerk/v1/client').passed, true);
  assert.equal(request('POST', 'https://evil.test', 'application/x-www-form-urlencoded', '/api/__clerk/v1/client').passed, false);
});
test('parser and unexpected errors never return passwords, SQL or stack details', () => {
  for (const [type, status] of [['entity.parse.failed', 400], ['entity.too.large', 413], ['sql_failure', 500]]) {
    let response;
    const res = { status(code) { assert.equal(code, status); return this; }, json(body) { response = body; } };
    safeHttpError({ type, message: 'sensitive-password-sql-parameter' }, {}, res, () => {});
    assert.equal(JSON.stringify(response).includes('sensitive-password'), false);
  }
});
test('financial pause stops new operations without blocking login or reconciliation reads', () => {
  const prior = process.env.BETTEX_EXECUTION_PAUSED;
  process.env.BETTEX_EXECUTION_PAUSED = 'true';
  try {
    for (const endpoint of ['/api/demo/movements', '/api/account/execution', '/api/test-account/journey',
      '/api/demo/movements/', '/API/DEMO/MOVEMENTS', '/api/account/execution?source=fixture']) {
      assert.equal(request('POST', trusted, 'application/json', endpoint).res.statusCode, 503);
      assert.equal(request('GET', undefined, '', endpoint).passed, true);
    }
    assert.equal(request('POST', trusted, 'application/json', '/api/account/commands').passed, true);
  } finally {
    if (prior === undefined) delete process.env.BETTEX_EXECUTION_PAUSED;
    else process.env.BETTEX_EXECUTION_PAUSED = prior;
  }
});
test('both executor adapters check pause before broadcasting or using unlocked local signers', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/modules/wallets/infrastructure/journey-chain.ts', import.meta.url), 'utf8');
  for (const method of ['sendOperator', 'sendSigned']) {
    const body = source.slice(source.indexOf(`async ${method}(`));
    assert.ok(body.indexOf('BETTEX_EXECUTION_PAUSED') < body.indexOf(method === 'sendOperator' ? 'provider.send(' : 'provider.broadcastTransaction('));
  }
});
