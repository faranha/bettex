import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = (process.env.PITCH_RESEARCH_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN}`).replace(/\/$/, '');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/repl/tools/bin/chromium', args: ['--no-sandbox'] });
const ids = ['publico-mercado-slider', 'problema-slider', 'emprego-ia-slider', 'ambiente-externo-slider'];
const locales = { pt: '/pitch', en: '/en/pitch', es: '/es/pitch' };
let panelsChecked = 0;
try {
  for (const [locale, route] of Object.entries(locales)) for (const width of [320, 390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.addInitScript(value => localStorage.setItem('bettex.locale', value), locale);
      assert((await page.goto(`${base}${route}`))?.ok());
      await page.evaluate(() => document.fonts.ready);
      for (const id of ids) {
        const slider = page.locator(`#${id}`);
        const tabs = slider.locator('.pitch-slider__tab');
        const count = await tabs.count();
        assert(count >= 3, `${route} ${width}: ${id} has multiple slides`);
        for (let i = 0; i < count; i++) {
          await tabs.nth(i).click();
          const panel = slider.locator(`.pitch-slider__panel[data-slide-index="${i}"]`);
          await panel.waitFor({ state: 'visible' });
          await page.waitForTimeout(100);
          assert.equal(await slider.locator('.pitch-slider__panel:visible').count(), 1);
          assert.equal(await tabs.nth(i).getAttribute('aria-current'), 'true');
          const issues = await panel.evaluate(root => {
            const problems = [];
            const bounds = root.getBoundingClientRect();
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
              const node = walker.currentNode;
              if (!node.textContent.trim() || node.parentElement.closest('svg, [hidden], .sr-only, script, style')) continue;
              const range = document.createRange();
              range.selectNodeContents(node);
              for (const r of range.getClientRects()) {
                if (!r.width || !r.height) continue;
                if (r.left < bounds.left - 2 || r.right > bounds.right + 2)
                  problems.push(`Text outside slide: ${node.textContent.trim().slice(0, 70)}`);
              }
            }
            if (document.documentElement.scrollWidth > innerWidth + 1) problems.push('Page overflow');
            return [...new Set(problems)];
          });
          assert.deepEqual(issues, [], `${route} ${width}: ${id} slide ${i + 1}`);
          assert((await panel.textContent()).trim().length > 80, 'Substantive content, not empty frames');
          panelsChecked++;
        }
        await slider.focus();
        await slider.press('Home');
        assert.equal(await tabs.first().getAttribute('aria-current'), 'true');
        await slider.press('End');
        assert.equal(await tabs.last().getAttribute('aria-current'), 'true');
        await slider.press('ArrowLeft');
        assert.equal(await tabs.nth(count - 2).getAttribute('aria-current'), 'true');
        await slider.press('Home');
        const controls = slider.locator(width < 768 ? '.pitch-slider__foot' : '.pitch-slider__ctrl');
        assert(await controls.locator('button').first().isDisabled());
        await controls.locator('button').last().click();
        assert.equal(await tabs.nth(1).getAttribute('aria-current'), 'true');
        const expectedNext = { pt: 'Próximo', en: 'Next', es: 'Siguiente' }[locale];
        assert((await controls.locator('button').last().getAttribute('aria-label') ?? await controls.locator('button').last().innerText()).includes(expectedNext));
        if (width < 768) {
          await slider.locator('.pitch-slider__stage').evaluate(el => {
            for (const [type, key, point] of [
              ['touchstart', 'touches', { clientX: 270, clientY: 100 }],
              ['touchend', 'changedTouches', { clientX: 90, clientY: 110 }],
            ]) {
              const event = new Event(type, { bubbles: true });
              Object.defineProperty(event, key, { value: [point] });
              el.dispatchEvent(event);
            }
          });
          assert.equal(await tabs.nth(2).getAttribute('aria-current'), 'true', 'Horizontal swipe advances a slide');
        }
      }
      // Sources and their limitations remain beside the CNDL figures.
      await page.locator('#problema-slider .pitch-slider__tab').nth(1).click();
      assert(await page.locator('.pb-problem__source').isVisible());
      // Legacy economic-signal cards are now horizontal on desktop too.
      const signals = page.locator('.fu-signals');
      assert(await signals.evaluate(el => el.scrollWidth > el.clientWidth + 2));
      const dots = page.locator('.fu-nav-dots button');
      await dots.last().click();
      await page.waitForFunction(() => {
        const el = document.querySelector('.fu-signals');
        return el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      });
      assert.equal(await dots.last().getAttribute('aria-current'), 'true');
      await page.locator('#emprego-ia-slider .pitch-slider__tab').first().click();
      await page.evaluate(() => { location.hash = '#economia-agentica-dados'; });
      await page.waitForFunction(() => !document.querySelector('#economia-agentica-dados').closest('[data-slide-index]').hidden);
      assert.equal(await page.locator('#emprego-ia-slider .pitch-slider__tab').nth(1).getAttribute('aria-current'), 'true');
      assert(await page.locator('#economia-agentica-dados').isVisible());
      assert.deepEqual(errors, [], 'No browser exceptions');
      console.log(`PASS ${route} ${width}px: all slides, controls, sources and internal anchor`);
    } finally { await page.close(); }
  }
  console.log(`Pitch sliders: ${panelsChecked} panels checked across PT/EN/ES and phone/desktop.`);
} finally { await browser.close(); }
