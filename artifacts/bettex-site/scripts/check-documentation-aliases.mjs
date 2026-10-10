import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { transformWithEsbuild } from 'vite';

const root = new URL('../', import.meta.url);
const input = await fs.readFile(new URL('src/lib/documentation-aliases.ts', root), 'utf8');
const compiled = await transformWithEsbuild(input, 'aliases.ts', { loader: 'ts' });
const { documentationAliases, resolveDocumentationId } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled.code).toString('base64')}`
);
const existing = new Set();
globalThis.document = { getElementById: id => existing.has(id) ? { id } : null };
assert.equal(resolveDocumentationId('documentacao-staking'), 'documentacao-staking');
assert.equal(resolveDocumentationId('an-unrecognized-hash'), 'an-unrecognized-hash');
for (const [oldId, newId] of Object.entries(documentationAliases)) {
  assert.notEqual(oldId, newId, `Unnecessary self-alias: ${oldId}`);
  assert.equal(resolveDocumentationId(oldId), newId);
  assert.equal(documentationAliases[newId], undefined, `Alias must not depend on another alias: ${oldId}`);
}
for (const oldId of [
  'documentacao-entidade', 'documentacao-financiamento-fundacao',
  'documentacao-formalizacao', 'documentacao-missao',
]) assert(documentationAliases[oldId], `Published destination must remain compatible: ${oldId}`);
existing.add('documentacao-entidade');
assert.equal(resolveDocumentationId('documentacao-entidade'), 'documentacao-entidade', 'A retained actual destination takes precedence over its alias.');

console.log(`Documentation aliases: ${Object.keys(documentationAliases).length} stable mappings, no chains, unknown/canonical hashes preserved.`);
