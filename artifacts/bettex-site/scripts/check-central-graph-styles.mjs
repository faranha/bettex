import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

// Exercises the read-only graph locally. No operational buttons, API writes or stored data.
const url = process.env.CENTRAL_AUDIT_URL ??
  `https://${process.env.REPLIT_DEV_DOMAIN}/en/app/central`;
const nodes = ['bettex', 'predictions', 'btc', 'eth', 'sol', 'governance', 'risk', 'treasury', 'execution', 'reconciliation', 'records', 'capital', 'execrec', 'markets'];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
const failures = [];
let checks = 0;

async function audit(page, label) {
  const result = await page.locator('[data-testid="graph-inspector"]').evaluate(panel => {
    const body = panel.querySelector('.cg-dbody');
    const headerRect = panel.querySelector('.cg-dhead').getBoundingClientRect();
    const tabs = panel.querySelector('.cg-tabs');
    const tabsRect = tabs?.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const rgb = s => (s.match(/[\d.]+/g) ?? []).map(Number);
    const luminance = c => c.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
    const opaqueBg = el => {
      for (let p = el; p; p = p.parentElement) {
        const color = rgb(getComputedStyle(p).backgroundColor);
        if (color.length === 3 || color[3] >= .9) return color;
      }
      return [255, 255, 255];
    };
    const lowContrast = [];
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim()) continue;
      const el = node.parentElement;
      if (el.closest('svg,option,[hidden],button:disabled')) continue;
      const style = getComputedStyle(el);
      if (style.visibility !== 'visible' || style.display === 'none' || Number(style.opacity) < .5) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      if (!range.getClientRects().length) continue;
      const fg = rgb(style.color), bg = opaqueBg(el);
      const a = luminance(fg), b = luminance(bg);
      const contrast = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      const size = parseFloat(style.fontSize);
      const threshold = size >= 24 || size >= 18.66 && Number(style.fontWeight) >= 700 ? 3 : 4.5;
      if (contrast < threshold - .1) lowContrast.push({ text: node.textContent.trim().slice(0, 65), contrast: +contrast.toFixed(2), color: style.color, bg: bg.slice(0, 3) });
    }
    return {
      overflow: body.scrollWidth > body.clientWidth + 2,
      documentOverflow: document.documentElement.scrollWidth > innerWidth + 2,
      closeInside: panel.querySelector('[data-testid="button-inspector-close"]').getBoundingClientRect().right <= innerWidth + 1,
      tabsClipped: tabs ? [...tabs.querySelectorAll('button')].some(button => {
        const r = button.getBoundingClientRect();
        return r.top < tabsRect.top - 1 || r.bottom > tabsRect.bottom + 1;
      }) : false,
      panelsOverlap: bodyRect.top < (tabsRect?.bottom ?? headerRect.bottom) - 1 ||
        Boolean(tabsRect && tabsRect.top < headerRect.bottom - 1) ||
        bodyRect.bottom > panelRect.bottom + 1,
      bodyTooShort: body.clientHeight < 64,
      lowContrast,
    };
  });
  checks++;
  if (result.overflow || result.documentOverflow || !result.closeInside || result.tabsClipped || result.panelsOverlap || result.bodyTooShort || result.lowContrast.length) failures.push({ label, ...result });
}

try {
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: width === 320 ? 640 : 960 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('central-graph').waitFor();
    for (const id of nodes) {
      await page.getByTestId(`graph-node-${id}`).evaluate(el => el.click());
      await page.getByTestId('graph-inspector').waitFor();
      const tabs = page.locator('.cg-tabs > [role="tab"]');
      const n = await tabs.count();
      for (let i = 0; i < Math.max(1, n); i++) {
        if (n) await tabs.nth(i).click();
        await audit(page, `${width}/${id}/tab-${i}`);
        const innerTabs = page.locator('.cg-dbody [role="tablist"] > [role="tab"]');
        for (let j = 0; j < await innerTabs.count(); j++) {
          if (await innerTabs.nth(j).isDisabled()) continue;
          await innerTabs.nth(j).click();
          await audit(page, `${width}/${id}/tab-${i}/inner-${j}`);
        }
        const journey = page.locator('.cg-dbody').getByRole('button', { name: /view.*journey/i }).first();
        if (await journey.count()) {
          await journey.click();
          await page.getByTestId('alpha-journey').waitFor();
          await audit(page, `${width}/${id}/tab-${i}/journey`);
        }
      }
      await page.getByTestId('button-inspector-close').click();
      await assert.doesNotReject(() => page.getByTestId('graph-inspector').waitFor({ state: 'hidden' }));
    }
    const edges = page.locator('[data-testid^="graph-edge-"]');
    for (let i = 0; i < await edges.count(); i++) {
      const id = await edges.nth(i).getAttribute('data-testid');
      await edges.nth(i).evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      await page.getByTestId('graph-inspector').waitFor();
      await audit(page, `${width}/${id}`);
      await page.getByTestId('button-inspector-close').click();
    }
    await page.getByTestId('button-graph-immersive').click();
    assert.equal(await page.getByTestId('central-graph').evaluate(el => el.classList.contains('cg-imm')), true);
    await page.getByTestId('rail-capital').click();
    await audit(page, `${width}/immersive/capital`);
    await page.getByTestId('button-inspector-close').click();
    await page.getByTestId('button-graph-immersive').click();
    assert.deepEqual(errors, [], `${width}: browser errors`);
    await page.close();
  }
  console.log(JSON.stringify({ checks, failures }, null, 2));
  assert.deepEqual(failures, [], 'Graph inspector contrast, wrapping and viewport containment');
} finally {
  await browser.close();
}
