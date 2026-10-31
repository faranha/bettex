import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const canonical = JSON.parse(readFileSync(new URL('./fixtures/documentation-synthesis-baseline.json', import.meta.url))).canonicalPublicPages;
assert.equal(canonical.approved, true);
const base = (process.env.PUBLIC_NAVIGATION_URL ?? `https://${process.env.REPLIT_DEV_DOMAIN}`).replace(/\/$/, '');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
let anchorsChecked = 0;
let scenario = 0;

async function settled(page) {
  await page.evaluate(async () => {
    let previous = window.scrollY;
    let stable = 0;
    for (let i = 0; i < 120 && stable < 8; i++) {
      await new Promise(resolve => requestAnimationFrame(resolve));
      const current = window.scrollY;
      stable = Math.abs(current - previous) < 0.5 ? stable + 1 : 0;
      previous = current;
    }
  });
}

async function dismissDevelopmentBanner(page) {
  const close = page.locator('#replit-dev-banner .banner-close');
  if (await close.count()) await close.click();
}

async function togglePageMenu(page) {
  // Real pointer input: Playwright's scrollIntoView on a sticky child can reset the document scroll.
  await page.waitForFunction(() => {
    const button = document.querySelector('[data-testid="public-menu-toggle"]');
    if (!button) return false;
    const rect = button.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return hit && button.contains(hit) && getComputedStyle(document.body).pointerEvents !== 'none';
  }, undefined, { timeout: 3000 }).catch(async error => {
    const details = await page.evaluate(() => {
      const button = document.querySelector('[data-testid="public-menu-toggle"]');
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return { hash: location.hash, scroll: scrollY, rect: rect.toJSON(), hit: hit?.outerHTML.slice(0, 700), bodyPointer: getComputedStyle(document.body).pointerEvents };
    });
    throw new Error(`Page menu blocked: ${JSON.stringify(details)}`, { cause: error });
  });
  const bounds = await page.getByTestId('public-menu-toggle').boundingBox();
  const expanded = await page.getByTestId('public-menu-toggle').getAttribute('aria-expanded');
  assert(bounds && bounds.y >= 0 && bounds.y + bounds.height <= 900, 'Page-menu button is visible without scrolling');
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.waitForFunction(value => document.querySelector('[data-testid="public-menu-toggle"]')?.getAttribute('aria-expanded') === value, expanded === 'true' ? 'false' : 'true');
}

try {
  for (const locale of ['pt', 'en', 'es']) for (const kind of ['home', 'pitch']) for (const width of [390, 1440]) {
    if (scenario++ < Number(process.env.PUBLIC_NAVIGATION_FROM ?? 0)) continue;
    const prefix = locale === 'pt' ? '' : `/${locale}`;
    const route = kind === 'home' ? `${prefix}/` : `${prefix}/pitch`;
    const ids = canonical[kind === 'home' ? 'homeAnchors' : 'pitchAnchors'];
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.addInitScript(value => localStorage.setItem('bettex.locale', value), locale);
      assert((await page.goto(`${base}${route}`))?.ok(), `Route unavailable: ${route}`);
      await dismissDevelopmentBanner(page);
      await page.waitForFunction(kind => document.documentElement.style.getPropertyValue(`--${kind}-sticky-h`), kind);
      await page.evaluate(() => document.fonts.ready);
      const nav = page.getByTestId(`${kind}-section-nav`);
      const targets = await nav.locator('.pitch-subnav-links a').evaluateAll(links => links.map(link => link.getAttribute('href')));
      assert.deepEqual(targets, ids.map(id => `#${id}`), `${route}: canonical submenu order`);
      for (const id of ids) assert.equal(await page.locator(`[id="${id}"]`).count(), 1, `${route}: unique target ${id}`);
      const header = page.locator('header.site-header');
      const pageMenu = width < 1280 ? page.getByTestId('public-mobile-menu') : header.locator('.site-main-nav');
      if (width < 1280) await togglePageMenu(page);
      const mainTargets = await pageMenu.locator('a.site-page-link').evaluateAll(links => links.map(link => ({
        path: new URL(link.href).pathname, target: link.getAttribute('target'), active: link.getAttribute('aria-current'),
      })));
      assert.deepEqual(mainTargets.map(link => link.path), [`${prefix}/`, `${prefix}/pitch`, `${prefix}/${{ pt: 'documentacao', en: 'documentation', es: 'documentacion' }[locale]}`, `${prefix}/app`], `${route}: page menu preserves language and order`);
      assert(mainTargets.every(link => !link.target || link.target === '_self'), 'Internal pages open in the same tab');
      assert.equal(mainTargets.filter(link => link.active === 'page').length, 1, `${route}: single active page`);
      if (width < 1280) await togglePageMenu(page);
      const journey = [...ids.slice(1), ids[0]];
      for (const id of journey) {
        const index = ids.indexOf(id);
        if (width < 1280) {
          await page.getByTestId(`${kind}-section-select`).click();
          await page.getByRole('option').nth(index).click();
        } else await page.getByTestId(`${kind}-nav-${id}`).click();
        await settled(page);
        const state = await page.evaluate(({ id, kind }) => {
          const header = document.querySelector('header.site-header');
          const nav = document.querySelector(`[data-testid="${kind}-section-nav"]`);
          const target = document.getElementById(id);
          const heading = [...target.querySelectorAll('h1,h2,h3')].find(element => {
            const rect = element.getBoundingClientRect();
            return rect.width > 2 && rect.height > 2;
          });
          return {
            hash: location.hash,
            top: target.getBoundingClientRect().top,
            headingTop: (heading ?? target).getBoundingClientRect().top,
            height: header.firstElementChild.getBoundingClientRect().height + nav.getBoundingClientRect().height,
            active: nav.querySelector('a[aria-current="location"]')?.getAttribute('href'),
            overflow: document.documentElement.scrollWidth > innerWidth + 2,
          };
        }, { id, kind });
        assert.equal(state.hash, `#${id}`);
        assert.equal(state.active, `#${id}`, `${route} ${width}: selected section ${id}`);
        assert(state.headingTop >= state.height - 4, `${route} ${width}: ${id} title hidden under header (${state.headingTop} < ${state.height})`);
        assert(state.headingTop < 850, `${route} ${width}: ${id} title outside the viewport`);
        assert(state.top <= state.height + 28, `${route} ${width}: ${id} misaligned (${state.top} > ${state.height})`);
        assert.equal(state.overflow, false, `${route} ${width}: horizontal page overflow`);
        if (width < 1280) {
          const describe = () => ({
            hash: location.hash, scroll: scrollY,
            headerTop: document.querySelector('header.site-header').getBoundingClientRect().top,
            headerPosition: getComputedStyle(document.querySelector('header.site-header')).position,
            focus: document.activeElement?.tagName,
          });
          const before = await page.evaluate(describe);
          await togglePageMenu(page);
          const during = await page.evaluate(describe);
          await togglePageMenu(page);
          await settled(page);
          const after = await page.evaluate(describe);
          assert.equal(after.hash, before.hash, 'Opening the page menu preserves the anchor');
          assert(Math.abs(after.scroll - before.scroll) <= 2, `${route} ${id}: page menu moved position: ${JSON.stringify({ before, during, after })}`);
          assert.equal(await nav.locator('a[aria-current="location"]').getAttribute('href'), `#${id}`);
        }
        anchorsChecked++;
      }
      await page.reload();
      await dismissDevelopmentBanner(page);
      await page.waitForFunction(kind => document.documentElement.style.getPropertyValue(`--${kind}-sticky-h`), kind);
      await page.evaluate(() => document.fonts.ready);
      await settled(page);
      assert.equal(new URL(page.url()).hash, `#${journey.at(-1)}`, 'Direct fragment survives reload');
      assert.equal(await nav.locator('a[aria-current="location"]').getAttribute('href'), `#${journey.at(-1)}`);
      if (width < 1280) await togglePageMenu(page);
      await pageMenu.locator('a.site-page-link').nth(kind === 'home' ? 1 : 0).click();
      const otherRoute = kind === 'home' ? `${prefix}/pitch` : `${prefix}/`;
      await page.waitForURL(url => url.pathname === otherRoute);
      assert.equal(await page.getByTestId(`${kind === 'home' ? 'pitch' : 'home'}-section-nav`).count(), 1, 'Page switch replaces the submenu');
      assert.deepEqual(errors, [], `${route}: no browser exceptions`);
      console.log(`PASS ${route} ${width}px: main menu, ${ids.length} anchors, active section and direct fragment`);
    } finally { await page.close(); }
  }
  console.log(`Canonical public navigation: ${anchorsChecked} anchor journeys passed across homepage/Pitch, PT/EN/ES and phone/desktop.`);
} finally { await browser.close(); }
