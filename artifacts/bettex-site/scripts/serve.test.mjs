import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { request } from 'node:http';
import { createSiteServer } from './serve.mjs';
import { routes, seo, canonicalPath } from './seo.mjs';

const server = createSiteServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
after(() => new Promise(resolve => server.close(resolve)));
function get(url, headers = {}, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port: server.address().port, path: url, headers, method }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('legacy domain permanently redirects with path and complete query intact', async () => {
  for (const url of ['/', '/pitch/', '/en/documentation/?utm_source=telegram&ref=a%2Fb', '/robots.txt', '//example.org/x']) {
    const res = await get(url, { Host: 'bettex.replit.app' });
    assert.equal(res.status, 301);
    assert.equal(res.headers.location, 'https://bettex.ai' + url);
    assert.equal(new URL(res.headers.location).hostname, 'bettex.ai');
  }
});
test('proxy-forwarded legacy host redirects, including uppercase and port', async () => {
  const res = await get('/es/pitch/?a=1', { Host: 'internal', 'X-Forwarded-Host': 'BETTEX.REPLIT.APP:443, internal' });
  assert.equal(res.status, 301);
  assert.equal(res.headers.location, 'https://bettex.ai/es/pitch/?a=1');
});
test('legacy direct host cannot be masked by a different forwarded host', async () => {
  const res = await get('/en/pitch/?ref=legacy', { Host: 'bettex.replit.app', 'X-Forwarded-Host': 'bettex.ai' });
  assert.equal(res.status, 301);
  assert.equal(res.headers.location, 'https://bettex.ai/en/pitch/?ref=legacy');
  assert.equal(res.headers['cache-control'], 'no-store');
  assert.equal(res.body, '');
});
test('official, development and unrelated hosts do not redirect', async () => {
  for (const host of ['bettex.ai', 'localhost', 'preview.replit.dev', 'bettex.replit.app.attacker.test']) {
    assert.equal((await get('/', { Host: host })).status, 200);
  }
  assert.equal((await get('/', { Host: 'internal', 'X-Forwarded-Host': 'bettex.ai' })).status, 200);
});
test('every localized route serves its prerendered HTML and canonical', async () => {
  for (const route of Object.keys(routes)) {
    const res = await get(canonicalPath(route), { Host: 'bettex.ai' });
    assert.equal(res.status, 200, route);
    assert.ok(res.body.includes(`rel="canonical" href="${seo.origin}${canonicalPath(route)}"`), route);
    assert.equal((res.body.match(/<h1\b/g) ?? []).length, 1, route);
    assert.equal(res.headers['cache-control'], 'no-cache');
  }
});
test('directory redirects preserve query and do not loop', async () => {
  const res = await get('/pitch?utm_source=x');
  assert.equal(res.status, 301);
  assert.equal(res.headers.location, '/pitch/?utm_source=x');
  assert.equal((await get(res.headers.location)).status, 200);
});
test('static assets, discovery files, byte ranges and HEAD work', async () => {
  assert.ok((await get('/robots.txt')).body.includes('https://bettex.ai/sitemap.xml'));
  assert.ok((await get('/sitemap.xml')).body.includes('<urlset'));
  const res = await get('/bettex-mark.svg', { Range: 'bytes=0-9' });
  assert.equal(res.status, 206);
  assert.equal(res.headers['content-type'], 'image/svg+xml');
  assert.equal(res.headers['content-length'], '10');
  assert.equal((await get('/bettex-mark.svg', { Range: 'bytes=999999999-' })).status, 416);
  const head = await get('/pitch/', {}, 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
});
test('unknown pages return real noindex 404, malformed paths and traversal are rejected', async () => {
  const missing = await get('/missing-page');
  assert.equal(missing.status, 404);
  assert.ok(missing.body.includes('noindex, follow'));
  assert.equal((await get('/%ZZ')).status, 400);
  assert.equal((await get('/..%2F..%2Fpackage.json')).status, 400);
  assert.equal((await get('/', {}, 'POST')).status, 405);
});