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
    '/': 'b696046d5ceb847c3b2d3f1be0a5770ad11b88a61c33192e3ac7b8552a76d71d',
    '/pitch': 'fad767460a10646e85909fa1248ae41b89e10c9d4433f110e0854cbee4067b13',
    '/en/': '07269eae425b1f3306ad50f478dff39907efaaaa81e6fcc155ccb41393b2e6c2',
    '/en/pitch': 'a122155f9a59a98c7d2a37fa9bda44cdc7c2283c1fed3fc10bf266e425ad5beb',
    '/es/': 'e194fc350c4e03eac533cc12696bb490c8a5de7c2e022edc3b6cfc38bad5ca7c',
    '/es/pitch': 'e466a2f3bbe375b404dbb31a550cd3ca28e65c1bd170f475a90a79fce5e6310c',
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
