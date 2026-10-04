import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';

// Geometry checks complement visual review; clipped carousels and scrollable
// tables deliberately retain their own horizontal scrolling.
const base = process.env.AUDIT_URL ?? 'http://127.0.0.1:80';
const widths = [320, 360, 390, 430, 768, 1024, 1440];
const routes = ['/', '/pitch', '/documentacao', '/demo'];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/repl/tools/bin/chromium', args: ['--no-sandbox'] });
const results = [];
const errors = [];
const page = await browser.newPage({ reducedMotion: 'reduce' });
page.on('pageerror', error => errors.push({ route: page.url(), message: error.message }));
async function inspect(route, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 3000))]));
  // Load deferred media and reveal scroll-triggered sections before measuring.
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 800) {
      scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 15));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(150);
  const result = await page.evaluate(() => {
    const visible = el => !!el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
    const identify = el => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}.${String(el.className).slice(0, 100)}`;
    const outliers = [...document.querySelectorAll('main *')].filter(el => {
      if (!visible(el) || el.closest('svg')) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || (r.left >= -1 && r.right <= innerWidth + 1)) return false;
      for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(parent).overflowX)) return false;
      }
      return true;
    }).slice(0, 20).map(el => ({ element: identify(el), text: el.textContent.trim().slice(0, 90), bounds: [Math.round(el.getBoundingClientRect().left), Math.round(el.getBoundingClientRect().right)] }));
    const smallTargets = [...document.querySelectorAll('header button, header a, nav button, nav select, footer a')].filter(el => {
      if (!visible(el)) return false;
      const r = el.getBoundingClientRect();
      return r.height < 36 || r.width < 24;
    }).map(el => ({ element: identify(el), text: el.textContent.trim().slice(0, 50), height: Math.round(el.getBoundingClientRect().height) })).slice(0, 15);
    return {
      pageOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      outliers, smallTargets,
      h1: [...document.querySelectorAll('h1')].map(el => el.textContent.trim()),
      brokenImages: [...document.images].filter(img => visible(img) && img.complete && !img.naturalWidth).map(img => img.getAttribute('src')),
      imagesWithoutAlt: [...document.images].filter(img => !img.hasAttribute('alt')).length,
      title: document.title,
    };
  });
  results.push({ route, width, ...result });
  console.log(JSON.stringify(results.at(-1)));
}
try {
  for (const route of routes) for (const width of widths) await inspect(route, width);
  for (const route of ['/en/', '/es/', '/en/pitch', '/es/pitch', '/en/documentation', '/es/documentacion', '/en/demo', '/es/demo']) await inspect(route, 360);
  await page.goto(`${base}/documentacao`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const chapters = await page.locator('.whitepaper__chapter').evaluateAll(nodes => nodes.map(el => el.id));
  for (const chapter of chapters) for (const width of [360, 768]) await inspect(`/documentacao#${chapter}`, width);
} finally {
  await browser.close();
}
await mkdir('/tmp/bettex-audit', { recursive: true });
await writeFile('/tmp/bettex-audit/responsive.json', JSON.stringify({ results, errors }, null, 2));
const failures = results.filter(r => r.pageOverflow > 1 || r.outliers.length || r.brokenImages.length || r.imagesWithoutAlt || r.h1.length !== 1);
console.log(`Responsive audit: ${results.length} views; ${failures.length} geometry/image/heading failures; ${errors.length} runtime errors.`);
if (!process.argv.includes('--report') && (failures.length || errors.length)) process.exitCode = 1;