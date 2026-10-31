import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

// Scan every controlled source line, including translations and historical code.
// Keep the underlying concept unnamed even in the regression checker itself.
const implicit = /\u0061\u006c\u0074\u0072\u0075(?:\u00ed|\u0069|\u0069\u0301)?\u0073(?:\u0074|\u006d)/i;
const root = path.resolve(import.meta.dirname, '../../..');
let count = 0;
async function scan(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git', '.cache'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await scan(file);
    else if (/\.(tsx?|jsx?|mjs|json|css|md|py|sol|cairo|svg|html)$/.test(entry.name)) {
      const text = await fs.readFile(file, 'utf8');
      assert.ok(!implicit.test(text), `${path.relative(root, file)}: the community motivation must remain implicit`);
      count++;
    }
  }
}
for (const directory of ['artifacts/bettex-site/src', 'artifacts/bettex-site/scripts', 'artifacts/api-server/src', 'lib', 'docs']) {
  await scan(path.join(root, directory));
}
for (const file of ['README.md', 'PROJECT.md']) {
  assert.ok(!implicit.test(await fs.readFile(path.join(root, file), 'utf8')), file);
  count++;
}
console.log(`Community wording: ${count} controlled text/code files scanned, no explicit label for the underlying concept.`);
