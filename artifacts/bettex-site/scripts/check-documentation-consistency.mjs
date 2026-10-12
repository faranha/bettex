import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const policy = JSON.parse(read('src/lib/documentation-consistency.json'));
const translations = {
  ...JSON.parse(read('src/lib/locales/translations.json')),
  ...JSON.parse(read('src/lib/locales/documentation-synthesis.json')),
};
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
assert.doesNotMatch(read('src/components/DistributionSettlement.tsx'), /contribuição operacional|alternativa em avaliação|não são restaurados por nova entrada ou confirmação tardia/);
for (const file of ['src/components/SaleChannels.tsx', 'src/components/architecture/BettexArchitecture.tsx']) {
  assert.doesNotMatch(read(file), /contribuição operacional|contribuição por serviços/);
}
assert.doesNotMatch(read('src/components/WhitepaperChapters.tsx'), /contribuição por serviços|Todo BETTEX disponível na carteira oficial (?:passa a participar|participa)/);
assert.doesNotMatch(read('src/components/TokenHolderRights.tsx'), /Em eventual encerramento, os créditos/);
assert.doesNotMatch(read('src/components/VestingSchedule.tsx'), /O vesting começa em março de 2027/);
assert.doesNotMatch(read('src/lib/documentation-copy.ts'), /A oferta total é de 1 bilhão|Todo BETTEX disponível na carteira oficial participa/);
assert.match(read('src/lib/documentation-copy.ts'), /Teto de emissão: 1 bilhão de BETTEX/);
// Risk parameters live in the controls chapter, not a second set of agent examples.
assert.doesNotMatch(read('src/components/InvestmentAgents.tsx').replace('25% do resultado elegível', ''), /example:|control:|[0-9]+(?:[.,][0-9]+)?%|Exemplo de aceitação e rejeição/);
assert.match(read('src/components/InvestmentAgents.tsx'), /href="#documentacao-controles"/);
for (const file of ['src/components/interface-demo/CentralCapital.tsx', 'src/components/interface-demo/CentralBettex.tsx']) {
  assert.doesNotMatch(read(file), /POLICY\.(?:maxOrder|maxPortfolio|maxCorrelated)/, `${file}: obsolete illustrative risk ceilings`);
}
assert.doesNotMatch(read('src/components/demo/TreasurySwapPool.tsx'), /contribuição por serviços|service contribution|contribución por servicios/i);
assert.doesNotMatch(read('src/components/EntityMultisig.tsx'), /societário|Dividendos/);
assert.doesNotMatch(read('src/components/FundSecurity.tsx'), /preservar créditos/);
assert.doesNotMatch(JSON.stringify(materials), /O preço pertence ao vendedor/);
assert.match(read('src/lib/documentation-copy.ts'), /"dlDoc": "resumo das regras e administração"/);
// Keep the original worked ledger instead of adding another recovery example.
assert.match(read('src/components/ProfitAccounting.tsx'), /patrimônio consolidado é 100\.775/);

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
    assert.doesNotMatch(html, /contribuição por serviços|service contribution|contribución por servicios/i, `${language}: discarded operating-funding proposal`);
    for (const id of [...ids, 'documentacao-governanca-detalhe', 'documentacao-entidade-multisig', 'documentacao-versao-politica']) {
      assert(html.includes(`id="${id}"`), `${language}: unreachable ${id}`);
    }
    const renderedIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(renderedIds.length, new Set(renderedIds).size, `${language}: duplicate rendered anchors`);
    const suffix = language === 'pt' ? '' : `-${language}`;
    const summary = read(`public/downloads/bettex-documentacao${suffix}.md`);
    for (const section of policy.sections) {
      const localize = text => language === 'pt' ? translations[text]?.pt ?? text : translations[text][language];
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
console.log('Documentation consistency: reachable governance, unique anchors, PT/EN/ES policies and downloads, original worked ledger and removed contradictions verified.');
