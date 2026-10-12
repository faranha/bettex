import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const policy = JSON.parse(read('src/lib/documentation-consistency.json'));
const translations = JSON.parse(read('src/lib/locales/translations.json'));
const areas = new Set(['settlement', 'economics', 'games', 'identity']);
const ids = new Set();
for (const section of policy.sections) {
  assert(areas.has(section.area));
  assert(!ids.has(section.id), `Duplicate policy section ${section.id}`);
  ids.add(section.id);
  for (const text of [section.title, ...section.paragraphs]) {
    assert(text.trim());
    for (const language of ['en', 'es']) assert(translations[text]?.[language]?.trim(), `${language}: ${text}`);
  }
}
const materials = JSON.parse(read('src/lib/documentation-materials.json'));
assert.doesNotMatch(JSON.stringify(materials), /Taxas de serviço separadas vão ao caixa operacional/);
assert.doesNotMatch(read('src/components/WhitepaperChapters.tsx'), /a participação começa no horário do saldo BETTEX final confirmado|sem KYC nem documentos de identificação/);
assert.doesNotMatch(read('src/components/DistributionSettlement.tsx'), /tarifa de saque USDC posterior/);
assert.match(read('src/lib/documentation-copy.ts'), /"dlDoc": "resumo das regras e administração"/);
// Recovery example: capital loss is not offset against another round's profit.
const operational = 100 - 20 + 10 - 10 * .25 - 10 * .25;
assert.equal(operational, 85);
assert.equal(operational + 10 * .25, 87.5);

const server = await createServer({
  root, configFile: path.join(root, 'vite.config.ts'),
  server: { middlewareMode: true }, appType: 'custom',
});
try {
  const { ChapterContent, chapters } = await server.ssrLoadModule('/src/components/WhitepaperChapters.tsx');
  const { setLocale } = await server.ssrLoadModule('/src/lib/i18n.ts');
  for (const language of ['pt', 'en', 'es']) {
    setLocale(language);
    const html = chapters.map((_, index) => renderToStaticMarkup(createElement(ChapterContent, { index }))).join('');
    for (const id of [...ids, 'documentacao-governanca-detalhe', 'documentacao-entidade-multisig', 'documentacao-versao-politica']) {
      assert(html.includes(`id="${id}"`), `${language}: unreachable ${id}`);
    }
    const renderedIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(renderedIds.length, new Set(renderedIds).size, `${language}: duplicate rendered anchors`);
    const suffix = language === 'pt' ? '' : `-${language}`;
    const summary = read(`public/downloads/bettex-documentacao${suffix}.md`);
    for (const section of policy.sections) {
      const localize = text => language === 'pt' ? text : translations[text][language];
      assert(summary.includes(localize(section.title)), `${language}: summary title drift`);
      for (const paragraph of section.paragraphs) assert(summary.includes(localize(paragraph)), `${language}: summary policy drift`);
      assert(html.includes(localize(section.title)), `${language}: untranslated rendered heading`);
    }
    assert(!summary.includes('Taxas de serviço separadas vão ao caixa operacional'));
    assert(summary.includes(language === 'pt' ? 'Resumo das regras e administração.' : translations['Resumo das regras e administração. Os capítulos, desenhos e referências técnicas completos estão na documentação do site. Este arquivo não comprova implantação ou operação financeira.'][language]));
  }
} finally {
  await server.close();
}
console.log('Documentation consistency: reachable governance, unique anchors, PT/EN/ES policies and downloads, recovery arithmetic and removed contradictions verified.');
