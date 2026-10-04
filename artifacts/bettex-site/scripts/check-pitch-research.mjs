import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { research } from './pitch-research-expectations.mjs';

// Use the managed preview by default, or point at a running production preview:
// PITCH_RESEARCH_URL=https://host/base-path pnpm run check:pitch-research
// Chromium is supplied by Replit. Elsewhere set CHROMIUM_PATH explicitly.
const base = process.env.PITCH_RESEARCH_URL
  ?? (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null);
assert(base, 'Set PITCH_RESEARCH_URL to the running site URL (including its base path).');
const executablePath = process.env.CHROMIUM_PATH ?? '/repl/tools/bin/chromium';
assert(existsSync(executablePath), 'Chromium not found. Set CHROMIUM_PATH to an installed Chromium executable.');
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const normalize = text => text.replace(/\s+/g, ' ').trim();
// Narrow phone, common phones, both sides of the section breakpoints, desktop.
const widths = [320, 375, 390, 639, 640, 899, 900, 1440];
try {
  for (const [locale, expected] of Object.entries(research)) {
    for (const width of widths) {
      const label = `${expected.path} @ ${width}px`;
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      try {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const response = await page.goto(`${base.replace(/\/$/, '')}${expected.path}#problema`);
        assert(response?.ok(), `${label}: route failed`);
        await page.locator('#problema').waitFor({ state: 'visible' });
        await page.evaluate(() => document.fonts.ready);
        const section = page.locator('#problema');
        const text = async selector => normalize(await section.locator(selector).innerText());
        assert.equal(await text('h2'), expected.title, `${label}: heading`);
        assert.equal(await text('.pb-problem__summary'), expected.summary, `${label}: summary`);
        assert.equal(await text('.pb-problem__intro p:last-child'), expected.context, `${label}: survey context`);
        assert.equal(await section.locator('.pb-metric').count(), 3, `${label}: three metrics`);
        for (const [index, value] of ['74%', '31%', '43%'].entries()) {
          const card = section.locator('.pb-metric').nth(index);
          assert.equal(normalize(await card.locator('.pb-metric__value').innerText()), value, `${label}: percentage ${index}`);
          assert.equal(normalize(await card.locator('.pb-metric__group').innerText()).toLocaleLowerCase(locale), expected.groups[index].toLocaleLowerCase(locale), `${label}: denominator for ${value}`);
          assert.equal(normalize(await card.locator('.pb-metric__text').innerText()), expected.statements[index], `${label}: declared motivation for ${value}`);
        }
        assert.equal(await text('.pb-problem__source a'), expected.source, `${label}: source`);
        assert((await text('.pb-problem__source')).endsWith(expected.limitations), `${label}: methodology and limitations`);
        assert.equal(await text('.pb-problem__hyp p'), expected.hypothesis, `${label}: hypothesis, not proven demand`);
        assert.equal(await text('.pb-problem__doc'), expected.doc, `${label}: documentation label`);
        const doc = new URL(await section.locator('.pb-problem__doc').getAttribute('href'), page.url());
        assert(doc.pathname.endsWith(expected.docPath), `${label}: localized documentation destination`);
        assert.equal(doc.hash, '#documentacao-oportunidade', `${label}: documentation chapter`);
        const source = await section.locator('.pb-problem__source a').getAttribute('href');
        assert.equal(source, 'https://site.cndl.org.br/copa-do-mundo-vai-levar-992-milhoes-de-consumidores-as-compras-apontam-cndlspc-brasil/', `${label}: original research link`);

        // Audit every link in the Pitch, not just the research citations.
        const badLinks = await page.locator('.pitch a[href]').evaluateAll(links => links
          .filter(a => a.target !== '_blank' || !a.relList.contains('noopener') || !a.relList.contains('noreferrer'))
          .map(a => ({ text: a.textContent, href: a.getAttribute('href') })));
        assert.deepEqual(badLinks, [], `${label}: Pitch links must open safely in a new tab`);
        assert((await page.locator('.pitch a[href]').count()) > 0, `${label}: non-vacuous link audit`);

        const layout = await section.evaluate(root => {
          const problems = [];
          const rects = [];
          const tolerance = 2;
          const box = root.getBoundingClientRect();
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.textContent.trim() || node.parentElement.closest('svg')) continue;
            const parent = node.parentElement;
            const range = document.createRange();
            range.selectNodeContents(node);
            const text = node.textContent.trim().slice(0, 65);
            for (const r of range.getClientRects()) {
              if (!r.width || !r.height) continue;
              if (r.left < -tolerance || r.right > innerWidth + tolerance || r.top < box.top - tolerance || r.bottom > box.bottom + tolerance) {
                problems.push(`Text outside section/viewport: ${text}`);
              }
              for (let ancestor = parent; ancestor; ancestor = ancestor.parentElement) {
                const style = getComputedStyle(ancestor);
                if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0) {
                  problems.push(`Hidden text: ${text}`);
                }
                const a = ancestor.getBoundingClientRect();
                if (['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowX) && (r.left < a.left - tolerance || r.right > a.right + tolerance)) {
                  problems.push(`Horizontally clipped: ${text}`);
                }
                if (['hidden', 'clip'].includes(style.overflowY) && (r.top < a.top - tolerance || r.bottom > a.bottom + tolerance)) {
                  problems.push(`Vertically clipped: ${text}`);
                }
                if (ancestor === root) break;
              }
              rects.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom, node, text, heading: parent.closest('h2') });
            }
          }
          for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
              const a = rects[i], b = rects[j];
              if (a.node === b.node) continue;
              // Range boxes include font leading, not just painted glyphs.
              // Adjacent lines in a tight display heading may share that space.
              const verticalOverlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (a.heading && a.heading === b.heading && a.top !== b.top
                && verticalOverlap < Math.min(a.bottom - a.top, b.bottom - b.top) * .25) continue;
              if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > tolerance
                && verticalOverlap > tolerance) {
                problems.push(`Overlapping text: ${a.text} / ${b.text}`);
              }
            }
          }
          const cards = [...root.querySelectorAll('.pb-metric')].map(el => {
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
          });
          return { problems: [...new Set(problems)], cards };
        });
        assert.deepEqual(layout.problems, [], `${label}: text visibility, clipping and overlap`);
        const [first, second, third] = layout.cards;
        if (width < 640) {
          assert(Math.abs(first.x - second.x) < 2 && Math.abs(second.x - third.x) < 2, `${label}: one mobile column`);
          assert(first.bottom <= second.y + 2 && second.bottom <= third.y + 2, `${label}: separate stacked metrics`);
        } else {
          assert(first.right <= second.x + 2 && Math.abs(second.x - third.x) < 2, `${label}: total distinct from agreement breakdown`);
          assert(second.bottom <= third.y + 2, `${label}: motivations do not overlap`);
        }
        assert.deepEqual(errors, [], `${label}: browser runtime errors`);
        console.log(`PASS ${label}: research content, layout and all Pitch links`);
      } finally {
        await page.close();
      }
    }
  }
  console.log(`Pitch research: ${widths.length * 3} locale/viewport combinations passed.`);
} finally {
  await browser.close();
}