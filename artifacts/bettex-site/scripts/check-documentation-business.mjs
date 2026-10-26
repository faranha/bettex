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
    '/': '932f7f366ef659dd88577d233a525adfbbe61cbb25a54a3e3d114f7cc35926d6',
    '/pitch': 'a56c3056fdabf590c6904734871d0b5c179e2393f41f596d0e3fe4f0eaf1edac',
    '/en/': 'a7047c97bd29432ec23e4362a054952a2eb32bb436f4f1ebdf2a22419aaf4833',
    '/en/pitch': '4fdb002712983615a779316b33e0c4608badcb69f9635d92c3ff6bbc6402706a',
    '/es/': 'e6b162cb6b0baf33f299d3d7581b04703ddea4c1a71909676cc20ce249cfb96b',
    '/es/pitch': '958feb0114f8bfe7ddd4fa73161198ddd2ba54c385603fd3f3bd2a08a1091484',
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
