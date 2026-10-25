import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = (process.env.AUDIT_URL ?? 'http://127.0.0.1:80').replace(/\/$/, '');
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/repl/tools/bin/chromium',
  args: ['--no-sandbox'],
});
const errors = [];
try {
  for (const [locale, route, explanation] of [
    ['pt-BR', '/', 'Sem lucro, não há distribuição.'],
    ['en-US', '/en/', 'No profit, no distribution.'],
    ['es-ES', '/es/', 'Sin beneficio, no hay distribución.'],
  ]) {
    for (const width of [320, 390, 1280]) {
      const context = await browser.newContext({
        locale, viewport: { width, height: 900 }, reducedMotion: 'reduce', hasTouch: true,
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(`${locale}/${width}: ${error.message}`));
      await page.goto(`${base}${route}#mercados`, { waitUntil: 'domcontentloaded' });
      const section = page.locator('#mercados');
      const carousel = page.getByTestId('carousel-earnings');
      const first = page.getByTestId('slide-earnings-1');
      const second = page.getByTestId('slide-earnings-2');
      const third = page.getByTestId('slide-earnings-3');
      const prev = page.getByTestId('button-earnings-prev');
      const next = page.getByTestId('button-earnings-next');
      const chooseFirst = page.getByTestId('button-earnings-slide-1');
      const chooseSecond = page.getByTestId('button-earnings-slide-2');
      const chooseThird = page.getByTestId('button-earnings-slide-3');
      await first.waitFor({ state: 'visible' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await carousel.getAttribute('data-active-slide'), '1');
      assert.equal(await prev.isDisabled(), false);
      assert.ok((await next.innerText()).includes({ 'pt-BR': 'Rendimentos', 'en-US': 'Earnings', 'es-ES': 'Rendimientos' }[locale]));
      if (width < 900) {
        const gap = await carousel.evaluate(el =>
          el.querySelector('.ew-ctrl').getBoundingClientRect().top
          - el.querySelector('[data-active="true"] .ew-grid').getBoundingClientRect().bottom);
        assert.ok(gap >= 0 && gap <= 32, `Controls should be close to the wallet, not after a blank panel (${gap}px)`);
      }
      assert.equal(await first.locator('.ew-bot, [data-testid="link-earnings-participation"]').count(), 0, 'The circled CTA and notice below the wallet must stay removed');
      assert.equal(await second.evaluate(el => el.inert), true);
      assert.equal(await third.evaluate(el => el.inert), true);
      assert.equal(await first.getAttribute('aria-label'), '1 / 3');
      const baseline = await carousel.evaluate(el => ({
        height: el.querySelector('.ew-track').getBoundingClientRect().height,
        control: el.querySelector('.ew-ctrl').getBoundingClientRect().top - el.getBoundingClientRect().top,
        controlHeight: el.querySelector('.ew-ctrl').getBoundingClientRect().height,
      }));
      const assertStable = async () => {
        const current = await carousel.evaluate(el => ({
          height: el.querySelector('.ew-track').getBoundingClientRect().height,
          control: el.querySelector('.ew-ctrl').getBoundingClientRect().top - el.getBoundingClientRect().top,
          controlHeight: el.querySelector('.ew-ctrl').getBoundingClientRect().height,
          fits: [...el.querySelectorAll('.ew-slide[data-active="true"] h3, .ew-slide[data-active="true"] p, .ew-slide[data-active="true"] .ew-chart, .ew-slide[data-active="true"] .ew-free-art')].every(node => {
            const rect = node.getBoundingClientRect();
            const panel = el.querySelector('.ew-track').getBoundingClientRect();
            return rect.top >= panel.top - 1 && rect.bottom <= panel.bottom + 1;
          }),
        }));
        assert.ok(Math.abs(current.height - baseline.height) < 2, 'All slides must match the 1% slide height');
        assert.ok(Math.abs(current.control - baseline.control) < 2, 'Navigation must not move between slides');
        assert.ok(Math.abs(current.controlHeight - baseline.controlHeight) < 2, 'Destination labels must not resize navigation');
        assert.equal(current.fits, true, 'Copy, chart and illustration fit without clipping');
      };

      await next.click();
      await second.waitFor({ state: 'visible' });
      assert.equal(await carousel.getAttribute('data-active-slide'), '2');
      assert.equal(await next.isDisabled(), false);
      assert.equal(await chooseSecond.getAttribute('aria-current'), 'true');
      assert.equal(await first.evaluate(el => el.inert), true);
      assert.ok((await second.textContent()).includes(explanation));
      assert.ok((await second.textContent()).includes('BETTEX'));
      assert.ok((await page.getByTestId('text-earnings-illustrative').textContent()).length > 40);
      const labels = page.locator('[data-testid="chart-earnings-returns"] .recharts-label-list text');
      await labels.first().waitFor({ state: 'visible' });
      await assertStable();
      const expected = [1, 0.5, 0.2, 0, 1].map(value =>
        `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`);
      assert.deepEqual(await labels.allTextContents(), expected);
      assert.equal(await page.locator('[data-testid="chart-earnings-returns"] .recharts-reference-line').count(), 0, 'No dotted 1% line or limit annotation');
      // Hidden-slide fonts can load on first reveal; compare the shared grid
      // cells, not a pre-font-load snapshot of the whole section.
      const heights = await carousel.locator('.ew-slide').evaluateAll(slides =>
        slides.map(slide => slide.getBoundingClientRect().height));
      assert.equal(heights.length, 3);
      assert.ok(heights.every(height => Math.abs(height - heights[0]) < 2), 'All slides share the same height');
      assert.equal(await second.evaluate(el =>
        [...el.querySelectorAll('.ew-card, .ew-chart, h3, p')].every(node => {
          const rect = node.getBoundingClientRect();
          return rect.left >= 0 && rect.right <= innerWidth + 1;
        })), true, 'Slide text and chart must fit the viewport');
      await chooseSecond.focus();
      await page.keyboard.press('ArrowLeft');
      await first.waitFor({ state: 'visible' });
      await page.keyboard.press('ArrowRight');
      await second.waitFor({ state: 'visible' });
      await page.keyboard.press('ArrowRight');
      await third.waitFor({ state: 'visible' });
      await assertStable();
      assert.equal(await carousel.getAttribute('data-active-slide'), '3');
      assert.equal(await third.getAttribute('aria-label'), '3 / 3');
      assert.equal(await next.isDisabled(), false);
      assert.equal(await chooseThird.getAttribute('aria-current'), 'true');
      assert.equal(await second.evaluate(el => el.inert), true);
      await page.getByTestId('illustration-earnings-freedom').waitFor({ state: 'visible' });
      const freedomCopy = (await third.textContent()).toLowerCase();
      const marketPrice = { 'pt-BR': 'preço de mercado', 'en-US': 'market price', 'es-ES': 'precio de mercado' }[locale];
      assert.ok(freedomCopy.includes(marketPrice), 'Explain sale at market price');
      assert.ok(/corretoras|exchanges/.test(freedomCopy), 'Include external exchanges, not just the app');
      assert.ok(freedomCopy.includes('bettex'));
      assert.equal(await third.evaluate(el =>
        [...el.querySelectorAll('svg, h3, p')].every(node => {
          const rect = node.getBoundingClientRect();
          return rect.left >= 0 && rect.right <= innerWidth + 1;
        })), true, 'Third-slide copy and illustration must fit the viewport');
      if (locale === 'pt-BR') {
        const file = `/tmp/bettex-earnings-freedom-${width}.png`;
        await section.screenshot({ path: file });
        console.log(`Screenshot: ${file}`);
      }
      await next.click();
      await first.waitFor({ state: 'visible' });
      await prev.click();
      await third.waitFor({ state: 'visible' });
      await prev.click();
      await second.waitFor({ state: 'visible' });
      await chooseFirst.click();
      await first.waitFor({ state: 'visible' });
      // Exercise the pointer swipe handler independently of native scroll.
      await section.locator('.ew-track').evaluate(track => {
        track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 300, pointerType: 'touch' }));
        track.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 100, pointerType: 'touch' }));
      });
      await second.waitFor({ state: 'visible' });
      await next.click();
      await third.waitFor({ state: 'visible' });
      await chooseFirst.click();
      await first.waitFor({ state: 'visible' });
      await chooseThird.click();
      await third.waitFor({ state: 'visible' });
      await chooseFirst.click();
      await first.waitFor({ state: 'visible' });
      assert.equal(await carousel.getAttribute('data-active-slide'), '1');
      console.log(`OK ${locale} ${width}px: three slides, arrows, selectors, keyboard, swipe, chart, market-exit copy and layout`);
      await context.close();
    }
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
} finally {
  await browser.close();
}
