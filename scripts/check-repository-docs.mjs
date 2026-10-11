import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const documents = [
  'docs/README.md', 'docs/project-status.md', 'docs/project-history.md',
  'docs/demo/README.md', 'docs/demo/data-and-audit.md',
  'docs/testnets/README.md', 'docs/testing.md', 'docs/github-finalization.md',
  'docs/decisions/README.md', 'docs/decisions/0017-visual-demo-safety.md',
  'docs/decisions/0018-github-verification-profiles.md',
];
let links = 0;
for (const file of documents) {
  const text = await readFile(path.join(root, file), 'utf8');
  for (const [, target] of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    const resolved = path.resolve(root, path.dirname(file), target.split('#')[0]);
    assert.ok(resolved.startsWith(root), `${file}: link outside repository`);
    await access(resolved);
    links++;
  }
}
const rules = JSON.parse(await readFile(path.join(root, 'docs/architecture-rules.json'), 'utf8'));
for (const [file, owner] of Object.entries(rules.legacyOwnership ?? {})) {
  assert.ok(Object.hasOwn(rules.dependencies, owner), `${file}: unknown context`);
  await access(path.join(root, file));
}
const status = await readFile(path.join(root, 'docs/project-status.md'), 'utf8');
assert.match(status, /exclusivamente visual/);
assert.match(status, /sem rede de lançamento escolhida/);
assert.match(await readFile(path.join(root, 'docs/demo/data-and-audit.md'), 'utf8'), /não é reconciliação independente/);
console.log(`Repository docs: ${documents.length} managed guides, ${links} local links, explicit legacy ownership and product limits.`);
