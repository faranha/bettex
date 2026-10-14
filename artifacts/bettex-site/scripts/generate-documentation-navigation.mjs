import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer, transformWithEsbuild } from 'vite';
import { chromium } from 'playwright-core';

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
    manifest[locale] = await page.evaluate(code => {
      const helpers = new Function(`${code};return {collectOutline,documentationChapters,documentationChapterNumber};`)();
      const { documentationChapters: chapters } = helpers;
      const outline = helpers.collectOutline(chapters, helpers.documentationChapterNumber);
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
    await page.close();
  }
  await writeFile(path.join(root, 'src/lib/documentation-outline.json'), JSON.stringify(manifest) + '\n');
  console.log('Generated localized documentation menu and anchor ownership without loading all chapters in the app.');
} finally {
  await browser.close();
  await server.close();
}
