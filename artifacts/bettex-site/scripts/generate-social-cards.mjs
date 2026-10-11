// Generates the 12 community social cards from public/social-preview.html.
// Usage: node scripts/generate-social-cards.mjs   (needs chromium + magick on PATH)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'public/social');
const html = 'file://' + path.join(root, 'public/social-preview.html');
const chromePath = execFileSync('bash', ['-lc', 'command -v chromium'], { encoding: 'utf8' }).trim();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bettex-cards-'));
const names = { home: 'home', pitch: 'pitch', documentation: 'documentation', demo: 'demo' };
const browser = await chromium.launch({ executablePath: chromePath, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [p, base] of Object.entries(names)) {
    for (const lang of ['pt', 'en', 'es']) {
      await page.goto(`${html}?page=${p}&lang=${lang}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const ok = await page.evaluate(() => ['800 40px "Bricolage Grotesque"', '600 20px "DM Sans"', '700 15px "Space Mono"'].every((f) => document.fonts.check(f) && [...document.fonts].some((x) => f.includes(x.family.replace(/"/g, '')) && x.status === 'loaded')));
      if (!ok) throw new Error('Brand fonts failed to load (network needed); refusing to render with fallback fonts.');
      const png = path.join(tmp, `${base}-${lang}.png`);
      await page.screenshot({ path: png });
      const file = path.join(out, `${base}-community${lang === 'pt' ? '' : '-' + lang}.jpg`);
      execFileSync('magick', [png, '-strip', '-sampling-factor', '4:2:0', '-quality', '86', '-interlace', 'none', file]);
    }
  }
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log('Generated 12 cards in public/social');
