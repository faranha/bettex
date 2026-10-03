// AST extraction cannot see resolved labels such as prefix + market name.
import { createServer } from 'vite';
import { writeFile } from 'node:fs/promises';
import { routes } from './seo.mjs';
const server = await createServer({ configFile: 'vite.config.ts', server: { middlewareMode: true }, appType: 'custom' });
try {
  const entry = await server.ssrLoadModule('/src/entry-server.tsx');
  entry.setTranslationAudit(true);
  const observed = new Set();
  for (const [path, page] of Object.entries(routes)) {
    if (page.language !== 'pt') continue;
    entry.observedMessages.clear();
    entry.render(path);
    for (const key of entry.observedMessages) observed.add(key);
  }
  for (const path of Object.keys(routes)) entry.render(path);
  const keys = [...new Set([...observed, ...entry.missingMessages])].sort();
  await writeFile('src/lib/locales/runtime-source.json', JSON.stringify(keys, null, 2) + '\n');
  console.log(JSON.stringify({ observed: keys.length, missing: [...entry.missingMessages] }, null, 2));
} finally { await server.close(); }