import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = process.env.AUDIT_URL ?? 'http://localhost:80';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
try {
  for (const route of ['/documentacao', '/en/documentation', '/es/documentacion']) {
    const page = await browser.newPage({ locale: 'pt-BR', viewport: { width: 360, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}${route}#documentacao-agentes`, { waitUntil: 'networkidle' });
    for (const [id, count] of [['documentacao-agentes', 9], ['documentacao-entidade-multisig', 5]]) {
      await page.evaluate(id => {
        location.hash = id;
        // Closed reference panels can still report table geometry. Audit their
        // real, expanded content instead of mistaking it for visible layout.
        document.querySelectorAll('details').forEach(element => { element.open = true; });
      }, id);
      await page.waitForTimeout(150);
      const carousel = page.locator('.whitepaper__table-carousel').filter({ visible: true });
      for (const width of [320, 390, 768]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(await carousel.locator('tbody tr').count(), count);
        assert(await carousel.evaluate(element => element.clientHeight < 850));
        assert(await carousel.evaluate(element => element.getBoundingClientRect().right <= innerWidth + 1));
        assert.equal(await carousel.locator('tbody td:not([data-label])').count(), 0);
      }
      await page.setViewportSize({ width: 390, height: 900 });
      for (let i = 1; i < count; i++) {
        await carousel.locator('button').last().click();
        await page.waitForTimeout(60);
      }
      assert.equal(await carousel.locator('.whitepaper__table-nav span').innerText(), `${count} / ${count}`);
      assert(await carousel.locator('button').last().isDisabled());
      await carousel.locator('button').first().click();
      await page.waitForTimeout(60);
      assert.equal(await carousel.locator('.whitepaper__table-nav span').innerText(), `${count - 1} / ${count}`);
      await page.setViewportSize({ width: 1440, height: 900 });
      assert.equal(await carousel.locator('.whitepaper__table-nav').isVisible(), false);
      assert.equal(await carousel.locator('tbody').evaluate(element => getComputedStyle(element).display), 'table-row-group');
      await page.emulateMedia({ media: 'print' });
      assert.equal(await carousel.locator('thead').evaluate(element => getComputedStyle(element).clipPath), 'none');
      assert.equal(await carousel.locator('tbody tr').count(), count);
      await page.emulateMedia({ media: 'screen' });
      await page.setViewportSize({ width: 360, height: 900 });
    }
    await page.evaluate(() => {
      location.hash = 'apuracao-exemplo';
      document.querySelectorAll('details').forEach(element => { element.open = true; });
    });
    await page.waitForTimeout(150);
    const comparison = page.locator('.whitepaper__comparison-scroll');
    assert.equal(await comparison.locator('tbody tr').count(), 8);
    assert(await comparison.evaluate(element => element.clientHeight < 850));
    assert(await comparison.locator('tbody tr > th').first().evaluate(element => element.clientWidth <= 180));
    assert.equal(await comparison.locator('thead').evaluate(element => getComputedStyle(element).display), 'table-header-group');
    assert(await comparison.evaluate(element => element.scrollWidth > element.clientWidth));
    await comparison.evaluate(element => { element.scrollLeft = element.scrollWidth; });
    assert(await comparison.evaluate(element => element.scrollLeft > 0));
    assert(await comparison.evaluate(element => element.getBoundingClientRect().right <= innerWidth + 1));
    await page.emulateMedia({ media: 'print' });
    assert.equal(await comparison.evaluate(element => getComputedStyle(element).overflowX), 'visible');
    assert.deepEqual(errors, []);
    console.log(`${route}: mobile cards and all records navigable; desktop/print tables complete; financial comparison compact with headers`);
    await page.close();
  }
} finally {
  await browser.close();
}
