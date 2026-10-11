import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';

// Compile the real CURRENT app, not the preserved operational router. This
// fixture opens only an ephemeral HTTP port and never enables a runtime.
const requireApi = createRequire(new URL('../package.json', import.meta.url));
const source = await readFile(new URL('../src/app.ts', import.meta.url), 'utf8');
assert.doesNotMatch(source, /from\s+["']\.\/routes(?:\/index)?["']/);
const compiled = await build({
  stdin: { contents: 'export { default as app } from "./src/app";', resolveDir: new URL('..', import.meta.url).pathname },
  bundle: true, platform: 'node', format: 'cjs', write: false, logLevel: 'silent',
  external: ['express', 'cors', 'pino', 'pino-http', 'pg', '@clerk/express'],
});
const mod = { exports: {} };
new Function('require', 'module', 'exports', compiled.outputFiles[0].text)(requireApi, mod, mod.exports);
const server = mod.exports.app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
try {
  assert.equal((await fetch(`${origin}/api/healthz`)).status, 200);
  const session = await fetch(`${origin}/api/account/session`);
  assert.deepEqual(await session.json(), { account: null });
  for (const path of ['/demo/dashboard', '/test-account/history', '/native-journey', '/treasury/history', '/agents/trading']) {
    const read = await fetch(`${origin}/api${path}`);
    assert.equal(read.status, 410, path);
    assert.equal((await read.json()).error, 'not_available_in_interface_demo');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const blocked = await fetch(`${origin}/api${path}`, {
        method, headers: { 'Content-Type': 'application/json' },
        body: '{"fixture":true}',
      });
      assert.equal(blocked.status, 403, `${method} ${path}`);
      assert.equal((await blocked.json()).error, 'interface_demo_only');
    }
  }
  assert.equal((await fetch(`${origin}/api/native-journey`, { method: 'OPTIONS' })).status, 204);
  console.log('Current API: health/session only; operational reads blocked and all 20 mutation requests denied.');
} finally {
  await new Promise(resolve => server.close(resolve));
}
