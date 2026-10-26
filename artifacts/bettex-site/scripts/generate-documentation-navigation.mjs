import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer, transformWithEsbuild } from 'vite';
import { chromium } from 'playwright-core';
import { assertDocumentationProductScope } from './documentation-product-scope.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(root, '../../generated-artifacts/documentation-audits');
const server = await createServer({ configFile: path.join(root, 'vite.config.ts'), mode: 'production', server: { middlewareMode: true } });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/repl/tools/bin/chromium', args: ['--no-sandbox'] });
const manifest = {};
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  const helpers = await transformWithEsbuild(await readFile(path.join(root, 'src/components/whitepaperOutline.ts'), 'utf8'), 'outline.ts', { loader: 'ts' });
  const structure = await transformWithEsbuild(await readFile(path.join(root, 'src/lib/documentation-structure.ts'), 'utf8'), 'structure.ts', { loader: 'ts' });
  const code = structure.code.replace(/\bexport\s+/g, '') + helpers.code.replace(/\bexport\s+/g, '');
  await mkdir(output, { recursive: true });
  for (const [locale, route] of [['pt', '/documentacao'], ['en', '/en/documentation'], ['es', '/es/documentacion']]) {
    const html = render(route, { fullDocumentation: true });
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    await page.setContent(`<div id="root">${html}</div>`, { waitUntil: 'domcontentloaded' });
    const productScope = await page.evaluate(() => {
      const documentBody = document.querySelector('#documentacao');
      return {
        text: documentBody?.textContent ?? '',
        ids: [...(documentBody?.querySelectorAll('[id]') ?? [])].map(element => element.id),
      };
    });
    assertDocumentationProductScope({ ...productScope, locale });
    await page.addStyleTag({ content: await readFile(path.join(root, 'src/components/WhitepaperSection.css'), 'utf8') });
    manifest[locale] = await page.evaluate(code => {
      const helpers = new Function(`${code};return {collectOutline,documentationChapters,documentationChapterNumber,documentationParentId};`)();
      const { documentationChapters: chapters } = helpers;
      const outline = helpers.collectOutline(chapters, helpers.documentationChapterNumber, helpers.documentationParentId);
      const economics = ['documentacao-emissao', 'documentacao-staking', 'documentacao-feature-recompra'];
      const features = document.querySelector('#documentation-reading-group-3');
      const tokenomics = document.querySelector('#documentation-reading-group-4');
      if (!features || !tokenomics || !tokenomics.querySelector('#documentacao-tokenomics')) {
        throw new Error('Features and Tokenomics need separate main-section openings');
      }
      for (const id of economics) {
        if (features.querySelector(`#${id}`) || !tokenomics.querySelector(`#${id}`)) {
          throw new Error(`Economic content must belong exclusively to Tokenomics: ${id}`);
        }
      }
      if (features.querySelectorAll('[data-testid="documentation-features-introduction"] li').length !== 5 ||
          tokenomics.querySelectorAll('[data-testid="documentation-tokenomics-introduction"] li').length !== 3) {
        throw new Error('Features and Tokenomics introductions must describe only their own topics');
      }
      const numbers = new Map([['3', 'documentation-reading-group-2']]);
      for (const chapter of outline) {
        for (const item of [chapter, ...chapter.items]) {
          if (numbers.has(item.number)) throw new Error(`Duplicate documentation number ${item.number}: ${numbers.get(item.number)} / ${item.id}`);
          const parentNumber = item.number.split('.').slice(0, -1).join('.');
          if (parentNumber && !numbers.has(parentNumber)) throw new Error(`Missing numbering parent ${parentNumber} for ${item.id}`);
          if (item !== chapter && !item.number.startsWith(`${chapter.number}.`)) throw new Error(`Topic outside its chapter: ${item.id}`);
          if (item === chapter && chapter.id.startsWith('documentacao-especialista-') &&
            numbers.get(parentNumber) !== 'documentacao-especializacoes-cripto') {
            throw new Error(`Specialist must belong to the explicit specializations group, not a baseline or reference: ${chapter.id}`);
          }
          const heading = item === chapter
            ? document.getElementById(`title-${item.id}`)
            : document.querySelector(`[data-outline-number="${item.number}"]`);
          if (heading?.getAttribute('data-documentation-heading-depth') !== String(item.number.split('.').length)) {
            throw new Error(`Visual depth differs from numbering depth: ${item.id}`);
          }
          numbers.set(item.number, item.id);
        }
      }
      // The audit page was SSR-rendered using the previous navigation catalog.
      // Update only this offline fixture to the freshly collected hierarchy.
      outline.forEach(chapter => {
        const marker = document.getElementById(`title-${chapter.id}`)?.querySelector('.whitepaper__heading-number');
        if (marker) marker.textContent = chapter.number;
      });
      const targets = {};
      document.querySelectorAll('[id]').forEach(element => {
        const owner = element.closest('article.whitepaper__chapter');
        const index = chapters.findIndex(chapter => chapter.id === owner?.id);
        if (index >= 0) targets[element.id] = { group: chapters[index].group, index };
        else if (element.closest('#documentacao-features')) targets[element.id] = { group: 3, index: chapters.findIndex(chapter => chapter.id === 'documentacao-features') };
         else {
           const group = element.closest('[data-documentation-reading-group]')?.getAttribute('data-documentation-reading-group');
           if (group !== undefined && group !== null) targets[element.id] = {
             group: Number(group), index: chapters.findIndex(chapter => chapter.group === Number(group)),
           };
         }
      });
      return { outline, targets };
    }, code);
    await writeFile(path.join(output, `${locale}.html`), await page.content());
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => {
        const sizes = new Map();
        document.querySelectorAll('.whitepaper__content [data-documentation-heading-depth]').forEach(heading => {
          const depth = Number(heading.getAttribute('data-documentation-heading-depth'));
          const size = parseFloat(getComputedStyle(heading).fontSize);
          if (sizes.has(depth) && Math.abs(sizes.get(depth) - size) > .1) {
            throw new Error(`Same numeric depth has different font sizes: ${heading.id || heading.textContent.slice(0, 60)}`);
          }
          sizes.set(depth, size);
        });
        const levels = [...sizes.entries()].sort((a, b) => a[0] - b[0]);
        for (let i = 1; i < levels.length; i++) {
          if (levels[i][0] <= 5 && levels[i][1] >= levels[i - 1][1]) {
            throw new Error(`Nested heading is not smaller: depth ${levels[i][0]}`);
          }
        }
      });
    }
    await page.close();
  }
  await writeFile(path.join(root, 'src/lib/documentation-outline.json'), JSON.stringify(manifest) + '\n');
  console.log('Generated localized documentation menu and anchor ownership without loading all chapters in the app.');
} finally {
  await browser.close();
  await server.close();
}
