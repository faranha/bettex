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
const widths = process.env.PITCH_RESEARCH_WIDTHS?.split(',').map(Number) ?? [320, 375, 390, 639, 640, 899, 900, 1440];
const selectedResearch = Object.entries(research).filter(([locale]) =>
  !process.env.PITCH_RESEARCH_LOCALE || locale === process.env.PITCH_RESEARCH_LOCALE);
try {
  for (const [locale, expected] of selectedResearch) {
    for (const width of widths) {
      const label = `${expected.path} @ ${width}px`;
      const page = await browser.newPage({ locale: locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-ES', viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      try {
        // First-time visitors intentionally enter English. Exercise a selected locale.
        await page.addInitScript(value => localStorage.setItem('bettex.locale', value), locale);
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.setDefaultTimeout(15000);
        const response = await page.goto(`${base.replace(/\/$/, '')}${expected.path}#problema`, { waitUntil: 'domcontentloaded' });
        assert(response?.ok(), `${label}: route failed`);
        await page.locator('#problema').waitFor({ state: 'visible' });
        await page.evaluate(() => document.fonts.ready);
        const section = page.locator('#problema');
        await page.locator('#problema-slider .pitch-slider__tab').nth(1).click();
        const text = async selector => normalize(await section.locator(selector).innerText());
        const titles = { pt: 'Uma geração com o futuro em jogo.', en: 'A generation with its future at stake.', es: 'Una generación con su futuro en juego.' };
        assert.equal(await text('#problema-t'), titles[locale], `${label}: approved heading`);
        assert((await text('.chero__summary')).length > 100, `${label}: substantive approved summary`);
        assert((await text('.pb-problem__intro p:last-child')).length > 100, `${label}: economic thesis present`);
        assert.equal(await section.locator('.pb-metric').count(), 3, `${label}: three metrics`);
        for (const [index, value] of ['74%', '31%', '43%'].entries()) {
          const card = section.locator('.pb-metric').nth(index);
          assert.equal(normalize(await card.locator('.pb-metric__value').innerText()), value, `${label}: percentage ${index}`);
          assert.equal(normalize(await card.locator('.pb-metric__group').innerText()).toLocaleLowerCase(locale), expected.groups[index].toLocaleLowerCase(locale), `${label}: denominator for ${value}`);
          assert.equal(normalize(await card.locator('.pb-metric__text').innerText()), expected.statements[index], `${label}: declared motivation for ${value}`);
        }
        assert.equal(await text('.pb-problem__source a'), expected.source, `${label}: source`);
        const source = await text('.pb-problem__source');
        assert(source.includes('600') && source.includes('27') && source.includes('2026') &&
          source.includes('18') &&
          ['74%', '31%', '43%'].every(value => source.includes(value)), `${label}: sample, territory, fieldwork and percentages`);
        const dates = { pt: ['27 de abril', '5 de maio'], en: ['April 27', 'May 5'], es: ['27 de abril', '5 de mayo'] };
        assert(dates[locale].every(date => source.includes(date)), `${label}: exact fieldwork period`);
        const limitations = { pt: 'Esse recorte não representa toda a população brasileira, retorno de apostas ou demanda medida pela BETTEX.',
          en: 'This sample does not represent the entire Brazilian population, betting returns or measured BETTEX demand.',
          es: 'Este recorte no representa a toda la población brasileña, rendimientos de apuestas ni demanda medida de BETTEX.' };
        assert(source.endsWith(limitations[locale]), `${label}: explicit research limitations`);
        assert((await text('.pb-problem__hyp p')).includes('BETTEX'), `${label}: founder proposition present`);
        assert.equal(await text('.pb-problem__doc'), expected.doc, `${label}: documentation label`);
        const doc = new URL(await section.locator('.pb-problem__doc').getAttribute('href'), page.url());
        assert(doc.pathname.endsWith(expected.docPath), `${label}: localized documentation destination`);
        assert.equal(doc.hash, '#documentacao-oportunidade', `${label}: documentation chapter`);
        const sourceHref = await section.locator('.pb-problem__source a').getAttribute('href');
        assert.equal(sourceHref, 'https://site.cndl.org.br/copa-do-mundo-vai-levar-992-milhoes-de-consumidores-as-compras-apontam-cndlspc-brasil/', `${label}: original research link`);

        // External sources open safely. Same-origin pages and chapter anchors
        // are normal navigation, not external research citations.
        const badLinks = await page.locator('.pitch a[href]').evaluateAll(links => links
          .filter(a => new URL(a.href).origin !== location.origin)
          .filter(a => a.target !== '_blank' || !a.relList.contains('noopener') || !a.relList.contains('noreferrer'))
          .map(a => ({ text: a.textContent, href: a.getAttribute('href') })));
        assert.deepEqual(badLinks, [], `${label}: external Pitch links open safely in a new tab`);
        assert((await page.locator('.pitch a[href]').evaluateAll(links => links.filter(a => new URL(a.href).origin !== location.origin).length)) > 0, `${label}: non-vacuous external link audit`);

        // Horizontal cards intentionally keep inactive slides outside the viewport.
        // Verify each one after selecting it, rather than weakening the text audit.
        for (const track of await section.locator('.mobile-data-carousel__track').all()) {
          if (!await track.evaluate(el => el.scrollWidth > el.clientWidth + 2)) continue;
          const carousel = track.locator('..');
          const cards = track.locator(':scope > *');
          for (let i = 0; i < await cards.count(); i++) {
            await carousel.locator('.mobile-data-carousel__dots button').nth(i).click();
            await page.waitForFunction(({ id, index }) => {
              const el = document.getElementById(id)?.querySelector('.mobile-data-carousel__track');
              if (!el) return false;
              const rect = el.children[index].getBoundingClientRect();
              const bounds = el.getBoundingClientRect();
              return rect.left >= bounds.left - 2 && rect.right <= bounds.right + 2;
            }, { id: await carousel.getAttribute('id'), index: i });
            const clipped = await cards.nth(i).evaluate(card => {
              const bounds = card.getBoundingClientRect();
              const problems = [];
              const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
              while (walker.nextNode()) {
                const node = walker.currentNode;
                if (!node.textContent.trim() || node.parentElement.closest('svg')) continue;
                const range = document.createRange();
                range.selectNodeContents(node);
                for (const rect of range.getClientRects()) {
                  if (rect.left < bounds.left - 2 || rect.right > bounds.right + 2)
                    problems.push(node.textContent.trim().slice(0, 65));
                }
              }
              return [...new Set(problems)];
            });
            assert.deepEqual(clipped, [], `${label}: carousel card ${i + 1} is readable when selected`);
          }
          await carousel.locator('.mobile-data-carousel__dots button').first().click();
          await track.evaluate(el => el.scrollTo({ left: 0, behavior: 'instant' }));
        }
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
            if (parent.closest('.pitch-slider__panel[hidden]')) continue;
            if (parent.closest('.pitch-slider__nav, .pitch-slider__foot')) continue;
            const track = parent.closest('.mobile-data-carousel__track');
            const card = parent.closest('.mobile-data-carousel__track > *');
            if (track && card && track.scrollWidth > track.clientWidth + tolerance) {
              const bounds = track.getBoundingClientRect();
              const rect = card.getBoundingClientRect();
              // Other slides were independently checked using the carousel controls.
              if (rect.left < bounds.left - tolerance || rect.right > bounds.right + tolerance) continue;
            }
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
  console.log(`Pitch research: ${widths.length * selectedResearch.length} locale/viewport combinations passed.`);
} finally {
  await browser.close();
}