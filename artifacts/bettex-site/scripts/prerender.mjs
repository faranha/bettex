import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import { discovery, routes, withMetadata, htmlFile } from './seo.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'dist/public');
const template = await readFile(path.join(output, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) {
  throw new Error('Prerender needs a fresh Vite build with an empty root. Run the full build; do not reuse already prerendered index.html.');
}
// SSR must match the public client build, not Vite's default development-mode demo.
const server = await createServer({ configFile: path.join(root, 'vite.config.ts'), mode: 'production',
  define: { 'import.meta.env.PROD': true, 'import.meta.env.DEV': false },
  server: { middlewareMode: true }, appType: 'custom' });
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  const base = process.env.BASE_PATH.replace(/\/$/, '');
  for (const [route, page] of Object.entries(routes)) {
    const body = render(`${base}${route}`);
    if (!body.includes('<h1')) throw new Error(`Prerender failed: no H1 for ${route}`);
    if (/^\/(?:(?:en|es)\/)?app(?:\/|$)/.test(route) &&
      (!body.includes('demo-root') || body.includes('site-footer') || !body.includes('data-testid="app-header"') || body.includes('data-testid="text-greeting-name"') || body.includes('data-testid="reset-demo-session"'))) {
      throw new Error(`Demo SSR must render only a loading shell, never a visitor's account or session controls: ${route}`);
    }
    const directory = path.join(output, route === '/' ? '' : route.slice(1));
    await mkdir(directory, { recursive: true });
    const html = withMetadata(template, route).replace(/<html([^>]*)lang="[^"]*"/, `<html$1lang="${page.language === 'pt' ? 'pt-BR' : page.language}"`).replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    await writeFile(path.join(directory, 'index.html'), html);
    if (route !== '/') await writeFile(path.join(output, htmlFile(route)), html);
    console.log(`Prerendered ${route}: ${body.length} HTML characters`);
  }
  const files = discovery();
  const missing = withMetadata(template, '/404').replace('<div id="root"></div>', `<div id="root">${render(`${base}/404`)}</div>`);
  await writeFile(path.join(output, '404.html'), missing);
  await writeFile(path.join(output, 'robots.txt'), files.robots);
  await writeFile(path.join(output, 'sitemap.xml'), files.sitemap);
} finally {
  await server.close();
}