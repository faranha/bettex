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
// Portable JPEG SOF inspection: CI does not need ImageMagick merely to audit
// already generated sharing images.
function jpegDimensions(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'JPEG signature');
  let offset = 2;
  while (offset < bytes.length) {
    assert.equal(bytes[offset++], 0xff, 'JPEG marker');
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0x01 || marker >= 0xd0 && marker <= 0xd8) continue;
    assert.ok(marker !== 0xd9 && marker !== 0xda, 'JPEG needs a frame header');
    const length = bytes.readUInt16BE(offset);
    assert.ok(length >= 2 && offset + length <= bytes.length, 'JPEG segment');
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return `${bytes.readUInt16BE(offset + 5)}x${bytes.readUInt16BE(offset + 3)}`;
    }
    offset += length;
  }
  throw new Error('JPEG frame dimensions missing');
}
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
  for (const [route, record] of Object.entries(routes)) {
    const html = await (await fetch(origin + canonicalPath(route))).text();
    const image = capture(html, /property="og:image" content="([^"]+)"/);
    assert.equal(capture(html, /property="og:image:secure_url" content="([^"]+)"/), image, route);
    assert.equal((html.match(/property="og:locale:alternate"/g) ?? []).length, 2, route);
    assert.equal(capture(html, /property="og:image:width" content="([^"]+)"/), '1200', route);
    assert.equal(capture(html, /property="og:image:height" content="([^"]+)"/), '630', route);
    const imagePath = new URL(image).pathname;
    assert.equal(jpegDimensions(await readFile(path.join(root, 'public', imagePath))), '1200x630', route);
    const imageResponse = await fetch(origin + imagePath);
    assert.equal(imageResponse.status, 200, imagePath);
    assert.match(imageResponse.headers.get('content-type'), /image\/jpeg/, imagePath);
    const schema = JSON.parse(capture(html, /<script id="site-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/));
    assert.equal(schema.primaryImageOfPage.url, image, route);
    assert.equal(schema.name, capture(html, /<title>([^<]+)<\/title>/).replaceAll('&amp;', '&'), route);
    if (record.index) {
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1, route);
      for (const [img] of html.matchAll(/<img\b[^>]*>/g)) assert.match(img, /\balt="/, `${route}: image needs an alt attribute`);
    }
    if (record.page === '/' || record.page === '/pitch') {
      for (const [img] of html.matchAll(/<img\b[^>]*>/g)) {
        assert.match(img, /\bwidth="[1-9]\d*"/, `${route}: image needs intrinsic width`);
        assert.match(img, /\bheight="[1-9]\d*"/, `${route}: image needs intrinsic height`);
      }
    }
    if (record.page === '/pitch') {
      const missionName = { pt: 'Nossa Missão', en: 'Our Mission', es: 'Nuestra misión' }[record.language];
      assert.ok(capture(html, /<title>([^<]+)<\/title>/).startsWith(missionName), `${route}: title must match Our Mission navigation`);
      assert.match(html, /<h2[^>]*id="publico-pitch-t"/, `${route}: audience must not introduce another H1`);
    }
  }
  // Deep links shared with investors must carry the demo's own initial
  // metadata, even before any browser JavaScript runs.
  for (const [prefix, paths] of [
    ['', ['central', 'tesouraria', 'historico']],
    ['/en', ['central', 'treasury', 'history']],
    ['/es', ['central', 'tesoreria', 'historial']],
  ]) for (const slug of paths) {
    const route = `${prefix}/app/${slug}`;
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.match(response.headers.get('x-robots-tag'), /noindex/, route);
    assert.equal(capture(html, /rel="canonical" href="([^"]+)"/), `${seo.origin}${route}/`, route);
    assert.equal(capture(html, /property="og:url" content="([^"]+)"/), `${seo.origin}${route}/`, route);
    assert.match(capture(html, /property="og:image" content="([^"]+)"/), /\/social\/demo-community(?:-(?:en|es))?\.jpg$/, route);
    const structured = JSON.parse(capture(html, /<script id="site-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/));
    assert.equal(structured.url, `${seo.origin}${route}/`, route);
    console.log(`Demo sharing OK: ${route} — correct initial head, noindex and social image`);
  }
  const robots = await (await fetch(origin + '/robots.txt')).text();
  assert.ok(robots.startsWith('User-agent:') && robots.includes(`Sitemap: ${seo.origin}/sitemap.xml`));
  const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
  assert.ok(sitemap.startsWith('<?xml'));
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 9);
  for (const [, entry] of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = capture(entry, /<loc>([^<]+)<\/loc>/);
    const alternates = [...entry.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)];
    assert.deepEqual(alternates.map(([, language]) => language), ['pt-BR', 'en', 'es', 'x-default'], loc);
    assert.equal(alternates[3][2], alternates[0][2], `${loc}: default language matches HTML`);
    for (const [, , href] of alternates) {
      const response = await fetch(origin + new URL(href).pathname, { redirect: 'manual' });
      assert.equal(response.status, 200, `${loc}: alternate is a final URL`);
      const html = await response.text();
      assert.equal(capture(html, /rel="canonical" href="([^"]+)"/), href, `${loc}: alternate is canonical`);
      assert.match(html, /name="robots" content="index, follow"/, `${loc}: alternate is indexable`);
    }
  }
  assert.ok(!sitemap.includes('/demo'));
  assert.ok(!sitemap.includes('/app'));
  const missing = await fetch(origin + '/pagina-inexistente');
  assert.equal(missing.status, 404, 'Unknown routes must return a real 404');
  assert.ok((await missing.text()).includes('noindex, follow'));
  assert.ok(!(await readFile(path.join(root, 'dist/public/index.html'), 'utf8')).includes('<div id="root"></div>'));
} finally {
  await new Promise(resolve => server.close(resolve));
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`SEO audit passed: ${Object.keys(routes).length} localized pages, robots.txt, sitemap and true 404.`);