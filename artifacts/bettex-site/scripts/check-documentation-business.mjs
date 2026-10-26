import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { createServer } from 'vite';
import { businessIntelligence, businessRules, businessTranslations } from '../src/lib/documentation-business.ts';

const root = path.resolve(import.meta.dirname, '..');
const before = 'ca4b002ff44a345ecd34f9872cecc87036284df5';
const structure = 'artifacts/bettex-site/src/lib/documentation-structure.ts';
assert.equal(
  await readFile(path.join(root, 'src/lib/documentation-structure.ts'), 'utf8'),
  execFileSync('git', ['show', `${before}:${structure}`], { cwd: root, encoding: 'utf8' }),
  'Keep the existing chapters, hierarchy, group numbering and specialist relationships',
);
// No visual asset is replaced as a side effect of the editorial revision.
const images = execFileSync('git', ['diff', '--name-only', before, '--', 'artifacts/bettex-site/public'], { cwd: root, encoding: 'utf8' })
  .split('\n').filter(file => /\.(?:png|webp|jpe?g|svg|gif)$/i.test(file));
assert.deepEqual(images, [], 'Preserve the original images');
for (const [source, entry] of Object.entries(businessTranslations)) {
  for (const language of ['pt', 'en', 'es']) assert.ok(entry[language]?.trim(), `${language}: ${source}`);
}
assert.match(businessRules.cap[0], /cada participante.*1%.*valor elegível/);
assert.match(businessRules.openEconomics[0], /ainda precisam ser definidos/i);
assert.match(businessIntelligence.agP2[0], /Não há quantidade fixa/);
assert.match(businessIntelligence.agP1[0], /somente em cripto/);
assert.match(businessIntelligence.baseline[0], /não algoritmos obrigatórios/);

const server = await createServer({
  configFile: path.join(root, 'vite.config.ts'), mode: 'production',
  define: { 'import.meta.env.PROD': true, 'import.meta.env.DEV': false },
  server: { middlewareMode: true }, appType: 'custom',
});
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  const { documentationChapters } = await server.ssrLoadModule('/src/lib/documentation-structure.ts');
  for (const route of ['/documentacao', '/en/documentation', '/es/documentacion']) {
    const html = render(route, { fullDocumentation: true });
    const focus = html.match(/<ul[^>]*data-documentation-market-focus[^>]*>[\s\S]*?<\/ul>/)?.[0];
    assert.ok(focus, `${route}: crypto focus must remain visible in the original hero`);
    assert.equal((focus.match(/<li\b/g) ?? []).length, 4, route);
    assert.doesNotMatch(focus, /Surebet|iGaming|Predictions|Previsões|Previsiones/);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, route);
    for (const chapter of documentationChapters) assert.ok(html.includes(`id="${chapter.id}"`), `${route}: ${chapter.id}`);
    for (const rule of ['cap', 'openEconomics', 'retired', 'specialist', 'proportional']) {
      assert.ok(html.includes(`data-business-rule="${rule}"`), `${route}: ${rule}`);
    }
    assert.ok(html.includes('data-testid="documentation-training-protocol"'), route);
    assert.doesNotMatch(html, /Missing (?:pt|en|es) translation:/, route);
  }
  const protectedPages = {
    '/': '70c29d896e1c82790286678eada5f1652c75f948dfb0699052eca6fceea74e7b',
    '/pitch': '0ec5fea30da01a43984f96b4f56407f0de9942a7f248910a8bf5860ea95e9552',
    '/en/': '15717be8ea9471e294ac13bac7b2cee25786deffc1287777d6620574cd7de2ef',
    '/en/pitch': 'e18d9c38e50e8e3c7f3af5bf56d7514844be237b9ef818cffc9e9b47d9163da8',
    '/es/': 'e26eb0d1256eb225ce8d63ddc1608436c20da88fc3636b28868ac97997688557',
    '/es/pitch': '8f040b752244a0656073a159a560b4d012a4db85898e123b24a0b640c1340b80',
  };
  for (const [route, expected] of Object.entries(protectedPages)) {
    const main = render(route).match(/<main\b[\s\S]*?<\/main>/)?.[0];
    assert.ok(main, route);
    const actual = createHash('sha256').update(main).digest('hex');
    assert.equal(actual, expected, `${route}: approved public page must remain unchanged`);
  }
  console.log('Current documentation: 24 chapters, unchanged hierarchy and images, PT/EN/ES, individual cap, open definitions, AI development, and six protected public-page renders verified.');
} finally {
  await server.close();
}
