import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const base = process.env.AUDIT_URL ?? 'http://localhost:80';
const routes = ['/documentacao', '/en/documentation', '/es/documentacion'];
// Charts must exist in the production HTML, not wait for JS, a visible chapter,
// or a browser's ResizeObserver to create the first image.
for (const route of routes) {
  const html = await readFile(new URL(`../dist/public${route}/index.html`, import.meta.url), 'utf8');
  assert.equal((html.match(/class="whitepaper__vesting-plot"/g) ?? []).length, 2, route);
  assert.equal((html.match(/data-vesting-month=/g) ?? []).length, 24, route);
  assert.equal((html.match(/data-vesting-series=/g) ?? []).length, 4, route);
}
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/repl/tools/bin/chromium', args: ['--no-sandbox'] });
try {
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Navigate from the first chapter, then reveal vesting: this covers charts
    // in a chapter that started hidden, not just direct hash entry.
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => { location.hash = 'documentacao-vesting'; });
    const selector = page.getByTestId('vesting-month-selector');
    await selector.waitFor({ state: 'visible' });
    assert.equal(await page.locator('.whitepaper__vesting-desktop').isVisible(), false);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      assert(await page.locator('#documentacao-vesting').evaluate(el => el.getBoundingClientRect().right <= innerWidth + 1));
      for (const chart of await page.locator('.whitepaper__vesting-plot').all()) {
        assert(await chart.isVisible());
        assert(await chart.locator('path, rect').count() >= 4);
      }
    }
    const slider = selector.locator('input');
    await slider.focus();
    await slider.press('End');
    await page.waitForTimeout(80);
    assert.equal(await slider.inputValue(), '24');
    assert.match(await selector.innerText(), /900[.,]000[.,]000/);
    assert.equal(await selector.locator('button').last().isDisabled(), true);
    await selector.locator('button').first().click();
    assert.equal(await slider.inputValue(), '23');
    await slider.focus();
    await slider.press('Home');
    assert.equal(await slider.inputValue(), '1');
    assert.equal(await selector.locator('button').first().isDisabled(), true);
    await selector.locator('button').last().click();
    assert.equal(await slider.inputValue(), '2');
    assert.match(await selector.innerText(), /74[.,]999[.,]988/);
    await page.setViewportSize({ width: 1280, height: 900 });
    assert.equal(await selector.isVisible(), false);
    assert.equal(await page.locator('.whitepaper__vesting-desktop').isVisible(), true);
    assert.equal(await page.locator('.whitepaper__vesting-desktop tbody tr').count(), 24);
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`${route}: pre-rendered charts, compact mobile slider, exact month values and desktop table verified`);
  }
} finally {
  await browser.close();
}
