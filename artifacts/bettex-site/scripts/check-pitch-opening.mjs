import assert from 'node:assert/strict';
import './check-pitch-hero-backgrounds.mjs';
import { chromium } from 'playwright-core';

const base = process.env.PITCH_RESEARCH_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN}`;
const widths = process.env.PITCH_OPENING_WIDTHS?.split(',').map(Number) ?? [320, 390, 1440];
const locales = [['pt', '/pitch'], ['en', '/en/pitch'], ['es', '/es/pitch']]
  .filter(([locale]) => !process.env.PITCH_OPENING_LOCALE || locale === process.env.PITCH_OPENING_LOCALE);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'],
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
        assert.equal(layout.paragraphs, 2, 'Opening keeps market opportunity and visual-demo status below the headline');
        assert.ok(layout.titleFirst, 'No audience or market paragraph may appear above the hero H1, including after restoring an older hero');
        assert.equal(layout.competingCallouts, 1, 'Only the market block below the H1 remains');
        const image = page.locator('#visao .cover__project img');
        assert.equal(await image.count(), 1, 'One approved human-and-AI rescue scene appears in the opening hero');
        assert.match(await image.getAttribute('src'), /pitch-hero-ai-rescue\.webp$/);
        await image.evaluate(img => img.decode());
        assert.ok(await image.evaluate(img => img.complete && img.naturalWidth > 0), 'The complete AI rescue artwork loads');
        const framing = await page.locator('#visao .cover__project').evaluate(figure => {
          const container = figure.closest('#visao');
          const hero = container.getBoundingClientRect();
          const border = parseFloat(getComputedStyle(container).borderBottomWidth) || 0;
          const bounds = figure.getBoundingClientRect();
          const style = getComputedStyle(figure);
          const img = figure.querySelector('img');
          const imageBounds = img.getBoundingClientRect();
          return {
            width: bounds.width, height: bounds.height,
            floorGap: Math.abs(bounds.bottom - (hero.bottom - border)),
            mask: style.maskImage, overflow: style.overflow,
            insideHero: imageBounds.left >= hero.left && imageBounds.right <= hero.right &&
              imageBounds.top >= hero.top && imageBounds.bottom <= hero.bottom,
            completeAspect: Math.abs(imageBounds.width / imageBounds.height - img.naturalWidth / img.naturalHeight) < .01,
          };
        });
        assert.ok(framing.width >= Math.min(width - 48, 280), 'The rescue scene remains large enough to read without extending the hero for a standing portrait');
        assert.equal(framing.mask, 'none', 'Do not fade or mask the character');
        assert.equal(framing.overflow, 'visible', 'Do not crop the character container');
        assert.ok(framing.insideHero && framing.completeAspect, 'Show the entire artwork inside the hero without cuts or distortion');
        assert.ok(framing.floorGap <= 2, `Character must reach the hero floor rather than ending with a floating torso cut: ${JSON.stringify(framing)}`);
        assert.deepEqual(layout.problems, [], `${path} ${width}px`);
        console.log(`PASS ${path} ${width}px: complete opening, no hidden, clipped or overlapping blocks`);
      } finally { await page.close(); }
    }
  }
} finally { await browser.close(); }
