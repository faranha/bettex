import assert from 'node:assert/strict';
import './check-pitch-hero-backgrounds.mjs';
import { chromium } from 'playwright-core';

const base = process.env.PITCH_RESEARCH_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN}`;
const widths = process.env.PITCH_OPENING_WIDTHS?.split(',').map(Number) ?? [320, 390, 1440];
const locales = [['pt', '/pitch'], ['en', '/en/pitch'], ['es', '/es/pitch']]
  .filter(([locale]) => !process.env.PITCH_OPENING_LOCALE || locale === process.env.PITCH_OPENING_LOCALE);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/repl/tools/bin/chromium', args: ['--no-sandbox'],
});
try {
  for (const [locale, path] of locales) {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      try {
        await page.addInitScript(value => localStorage.setItem('bettex.locale', value), locale);
        await page.goto(`${base.replace(/\/$/, '')}${path}`, { waitUntil: 'domcontentloaded' });
        await page.locator('.cover__copy > p').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        const layout = await page.locator('.cover__copy').evaluate(root => {
          const nodes = [...root.children].filter(el => ['P', 'H1', 'SPAN', 'DIV'].includes(el.tagName));
          const boxes = nodes.map(el => ({ text: el.textContent.trim(), r: el.getBoundingClientRect() }));
          const problems = [];
          for (const { text, r } of boxes) {
            if (!r.width || !r.height) problems.push(`Invisible: ${text.slice(0, 50)}`);
            if (r.left < -2 || r.right > innerWidth + 2) problems.push(`Clipped: ${text.slice(0, 50)}`);
          }
          for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i].r, b = boxes[j].r;
            if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2)
              problems.push(`Overlap: ${boxes[i].text.slice(0, 35)} / ${boxes[j].text.slice(0, 35)}`);
          }
          const title = root.querySelector(':scope > h1');
          const firstParagraph = root.querySelector(':scope > p');
          return {
            problems, paragraphs: root.querySelectorAll(':scope > p').length,
            titleFirst: title.getBoundingClientRect().top < firstParagraph.getBoundingClientRect().top,
            competingCallouts: root.querySelectorAll('.cover__market').length,
          };
        });
        assert.equal(layout.paragraphs, 2, 'Only concise support and visual-demo status belong to the opening');
        assert.ok(layout.titleFirst, 'No audience or market paragraph above the hero H1');
        assert.equal(layout.competingCallouts, 0, 'No competing market callout boxes in the hero');
        assert.equal(await page.locator('.cover--hero .phg').count(), 1, 'Person and orchestrator graph remain in the hero');
        assert.deepEqual(layout.problems, [], `${path} ${width}px`);
        console.log(`PASS ${path} ${width}px: complete opening, no hidden, clipped or overlapping blocks`);
      } finally { await page.close(); }
    }
  }
} finally { await browser.close(); }
