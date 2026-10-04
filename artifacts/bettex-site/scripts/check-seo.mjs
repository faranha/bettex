import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { createSiteServer } from './serve.mjs';
import { routes, seo, canonicalPath } from './seo.mjs';

// Check actual HTTP responses from the production static server, not the
// development SPA shell or metadata that only appears after JavaScript runs.
const root = path.resolve(import.meta.dirname, '..');
const server = createSiteServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const failures = [];
const capture = (html, pattern) => html.match(pattern)?.[1];
try {
  for (const [route, record] of Object.entries(routes)) {
    try {
      const response = await fetch(`${origin}${route}`);
      assert.equal(response.status, 200, `${route}: HTTP status`);
      const html = await response.text();
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${route}: exactly one H1 in initial HTML`);
      const title = capture(html, /<title>([^<]+)<\/title>/);
      const description = capture(html, /name="description" content="([^"]+)"/);
      assert.ok(title?.length >= 20 && title.length <= 75, `${route}: descriptive title`);
      assert.ok(description?.length >= 100 && description.length <= 180, `${route}: description length`);
      const canonical = capture(html, /rel="canonical" href="([^"]+)"/);
      assert.equal(canonical, `${seo.origin}${canonicalPath(route)}`, `${route}: canonical`);
      assert.ok(html.includes(`lang="${record.language === 'pt' ? 'pt-BR' : record.language}"`));
      assert.equal(capture(html, /name="robots" content="([^"]+)"/), record.index ? 'index, follow' : 'noindex, follow');
      const alternates = [...html.matchAll(/rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
      assert.equal(alternates.length, 4, `${route}: all language alternatives`);
      for (const alternate of alternates) assert.ok(alternate[2].startsWith(seo.origin + '/') && alternate[2].endsWith('/'));
      assert.equal(capture(html, /property="og:url" content="([^"]+)"/), canonical);
      const image = capture(html, /property="og:image" content="([^"]+)"/);
      assert.ok(image?.startsWith(seo.origin));
      const imagePath = new URL(image).pathname;
      await access(path.join(root, 'dist/public', imagePath));
      const imageResponse = await fetch(origin + imagePath);
      assert.equal(imageResponse.status, 200);
      assert.ok(imageResponse.headers.get('content-type')?.startsWith('image/'));
      const schema = JSON.parse(capture(html, /id="site-jsonld" type="application\/ld\+json">([\s\S]+?)<\/script>/));
      assert.equal(schema.url, canonical);
      assert.equal(schema['@type'], 'WebPage');
      for (const img of html.matchAll(/<img\b[^>]*>/g)) assert.ok(/\balt=/.test(img[0]), `${route}: image alt attribute`);
      console.log(`SEO OK: ${route} — initial HTML, H1, metadata, canonical, languages, social image and schema`);
    } catch (error) { failures.push(error.message); }
  }
  const robots = await (await fetch(origin + '/robots.txt')).text();
  assert.ok(robots.startsWith('User-agent:') && robots.includes(`Sitemap: ${seo.origin}/sitemap.xml`));
  const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
  assert.ok(sitemap.startsWith('<?xml'));
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 9);
  assert.ok(!sitemap.includes('/demo'));
  const missing = await fetch(origin + '/pagina-inexistente');
  assert.equal(missing.status, 404, 'Unknown routes must return a real 404');
  assert.ok((await missing.text()).includes('noindex, follow'));
  assert.ok(!(await readFile(path.join(root, 'dist/public/index.html'), 'utf8')).includes('<div id="root"></div>'));
} finally {
  await new Promise(resolve => server.close(resolve));
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`SEO audit passed: ${Object.keys(routes).length} localized pages, robots.txt, sitemap and true 404.`);