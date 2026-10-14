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
  const { DocumentationLinkedTerms } = await server.ssrLoadModule('/src/components/DocumentationLinkedTerms.tsx');
  const { setLocale, setTranslationPath } = await server.ssrLoadModule('/src/lib/i18n.ts');
  for (const language of ['pt', 'en', 'es']) {
    setLocale(language);
    setTranslationPath({ pt: '/documentacao', en: '/en/documentation', es: '/es/documentacion' }[language]);
    const unsupportedTermLinks = renderToStaticMarkup(createElement(DocumentationLinkedTerms, { text: 'ALFA · demo · prova de conceito · proof of concept · prueba de concepto · BETTEX · agente · agent · blockchain · contratos inteligentes · smart contracts · segurança · security · seguridad · mandatos · mandates · tesouraria · treasury · tesorería · inteligência artificial · artificial intelligence · inteligencia artificial · esportes · sports · deportes · surebet · iGaming · cripto · crypto · predictions · previsões · predicciones · tokens' }));
    assert.doesNotMatch(unsupportedTermLinks, /<a\b/, `${language}: generic terms and words without their own section must remain unlinked`);
    const basicTermLinks = renderToStaticMarkup(createElement(DocumentationLinkedTerms, { text: 'DeFi para DeFi AI (DeFAI), DEX e DEX' }));
    assert.equal((basicTermLinks.match(/<a\b/g) ?? []).length, 3, `${language}: only the three distinct, matching basic definitions should link`);
    const marketLabel = renderToStaticMarkup(createElement(DocumentationLinkedTerms, { text: 'predictions' }));
    assert.doesNotMatch(marketLabel, /<a\b/, `${language}: the market label must remain plain text`);
    if (language === 'es') assert.equal(marketLabel, 'predicciones', 'es: unlinking a term must preserve its translation');
    const preciseTermLinks = renderToStaticMarkup(createElement(DocumentationLinkedTerms, { text: 'blockchain · contratos inteligentes · smart contracts · DeFi' }));
    assert.equal((preciseTermLinks.match(/<a\b/g) ?? []).length, 1, `${language}: terms without their own entry must not link to DeFi`);
    assert.match(preciseTermLinks, /href="#documentacao-conceito-defi"[^>]*><strong\b[^>]*>DeFi<\/strong><\/a>/, `${language}: DeFi must retain its own definition link`);
    assert.doesNotMatch(read('src/components/WhitepaperSection.tsx'), /DocumentationRelatedTopics|data-documentation-related-section/, 'Documentation must not render related-reading blocks');
    const html = chapters.map((_, index) => renderToStaticMarkup(createElement(ChapterContent, { index }))).join('');
    const { WhitepaperSection } = await server.ssrLoadModule('/src/components/WhitepaperSection.tsx');
    const { DocumentationRenderContext } = await server.ssrLoadModule('/src/components/DocumentationRenderContext.ts');
    const { documentationChapterNumber } = await server.ssrLoadModule('/src/lib/documentation-structure.ts');
    const reader = renderToStaticMarkup(createElement(DocumentationRenderContext.Provider, { value: true }, createElement(WhitepaperSection)));
    for (const [index, chapter] of chapters.entries()) {
      if (!documentationChapterNumber(index).includes('.')) continue;
      assert.ok(reader.includes(`data-documentation-section-toggle="${chapter.id}" aria-expanded="false" aria-controls="${chapter.id}-body"`), `${language}: ${chapter.id} needs a closed, accessible chapter control`);
      assert.ok(reader.includes(`id="${chapter.id}-body" data-documentation-chapter-body="true" hidden=""`), `${language}: ${chapter.id} must start collapsed, including before hydration`);
    }
    const { orderGroups } = await server.ssrLoadModule('/src/lib/documentation-order-standard.ts');
    const conceptIndex = html.indexOf('id="documentacao-estrutura-ordem"');
    const contractIndex = html.indexOf('id="documentacao-contrato-ordem"');
    const selectionIndex = html.indexOf('id="documentacao-selecao-ordens"');
    const integrityIndex = html.indexOf('id="documentacao-integridade-pedido"');
    assert.ok(conceptIndex >= 0 && conceptIndex < contractIndex && contractIndex < integrityIndex, `${language}: explain and specify orders before authorization integrity`);
    assert.ok(conceptIndex < selectionIndex && selectionIndex < contractIndex, `${language}: selection criteria must follow the order concept and precede its technical contract`);
    assert.ok(html.includes('href="#documentacao-selecao-ordens"'), `${language}: the BETTEX agent must link to order-selection criteria`);
    assert.ok(html.includes('href="#documentacao-contrato-ordem"'), `${language}: missing concept-to-contract link`);
    for (const field of orderGroups.flatMap(group => group.fields)) assert.ok(html.includes(`>${field.path}</code>`), `${language}: missing rendered order field ${field.path}`);
    const proseParagraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(match => match[1].replace(/<[^>]*>/g, ''));
    assert.doesNotMatch(proseParagraphs.join('\n'), /\btodo a rodada\b|\btodo la ronda\b/, `${language}: round terminology must preserve gender agreement`);
    const continuationChecks = {
      pt: ['casas de apostas serão ampliadas futuramente', 'registradas abertamente, incluindo vendas de BETTEX', 'A trilha pública contém horários', 'API de trading e o CLOB permitem'],
      en: ['betting houses will be expanded in the future', 'recorded openly, including BETTEX sales', 'The public trail contains verifiable times', 'Trading API and CLOB allow'],
      es: ['casas de apuestas serán ampliadas', 'son registradas abiertamente, incluyendo ventas de BETTEX', 'El rastro público contiene horarios', 'API de trading y el CLOB permiten'],
    }[language];
    for (const continuation of continuationChecks) assert.ok(proseParagraphs.some(paragraph => paragraph.includes(continuation)), `${language}: broken inline prose continuation: ${continuation}`);
    const connectionsIntroduction = html.match(/<p\b[^>]*data-testid="documentation-market-connections-introduction"[^>]*>([\s\S]*?)<\/p>/);
    assert.ok(connectionsIntroduction, `${language}: market connections need their direct explanation`);
    assert.doesNotMatch(connectionsIntroduction[1], /desenho|drawing|design\s+[78]|diagram|diseño/i, `${language}: explain the flow without referring to drawings`);
    assert.ok(connectionsIntroduction[1].includes('BETTEX'), `${language}: the central selection agent must remain explicit`);
    const candidateLabel = { pt: ' (caso utilizada)', en: ' (if used)', es: ' (si se utiliza)' }[language];
    for (const technology of ['Allora', 'Starknet', 'Arbitrum One', 'Polymarket', 'Robinhood', 'Safe / OpenZeppelin']) {
      assert.ok(html.includes(`data-documentation-technology-condition="${technology}">${candidateLabel}</span>`), `${language}: named candidate ${technology} must retain its adoption condition`);
    }
    const inferencePrefix = { pt: 'Caso utilizada, ', en: 'If used, ', es: 'Si se utiliza, ' }[language];
    assert.ok(html.includes(`data-documentation-technology-condition="Allora">${inferencePrefix}</span>`), `${language}: Allora diagram caption must not imply confirmed adoption`);
    const agentIntroduction = html.indexOf('data-testid="documentation-concepts-documentacao-agentes"');
    const agentIllustration = html.indexOf('data-testid="documentation-orchestration-illustration"');
    const intelligenceContent = html.indexOf('id="documentacao-inteligencia"', agentIntroduction);
    assert.ok(agentIntroduction >= 0 && agentIllustration > agentIntroduction && intelligenceContent > agentIllustration, `${language}: illustration must follow the BETTEX agent introduction`);
    assert.equal((html.match(/src="[^"]*\/technology\/bettex-orchestration\.webp"/g) ?? []).length, 1, `${language}: exactly one orchestration illustration expected`);
    const technology = html.match(/<section\b[^>]*id="documentacao-tecnologia-introducao"[^>]*>([\s\S]*?)<\/section>/);
    assert.ok(technology, `${language}: technology introduction missing`);
    const technologyTitle = { pt: 'Tecnologia', en: 'Technology', es: 'Tecnología' }[language];
    assert.match(technology[1], new RegExp(`<h2\\b[^>]*>${technologyTitle}</h2>`), `${language}: technology needs a visible H2`);
    for (const name of ['Starknet', 'Arbitrum One', 'USDC', 'Allora']) assert.ok(technology[1].includes(name), `${language}: ${name} missing from technology introduction`);
    const theoreticalStatus = {
      pt: ['Toda esta documentação é teórica', 'antes do lançamento da versão ALFA'],
      en: ['All of this documentation is theoretical', 'before the ALFA version launches'],
      es: ['Toda esta documentación es teórica', 'antes del lanzamiento de la versión ALFA'],
    }[language];
    for (const marker of theoreticalStatus) assert.ok(technology[1].includes(marker), `${language}: theoretical/pre-ALFA status missing`);
    const technologyPosition = html.indexOf('id="documentacao-tecnologia-introducao"');
    assert.ok(technologyPosition > html.indexOf('id="documentacao-inteligencia-bettex"') && technologyPosition < html.indexOf('data-testid="documentation-agent-research-cycle"'), `${language}: technology must close the agent introduction before numbered subsections`);
    const overview = html.match(/<div\b[^>]*id="schematic-overview"[^>]*>([\s\S]*?)<\/div>/);
    assert.ok(overview, `${language}: general overview missing`);
    assert.equal((overview[1].match(/<dt\b/g) ?? []).length, 6, `${language}: overview must retain its four original entries and list trading and support subagents`);
    assert.match(overview[1], /BTC.*ETH.*SOL/, `${language}: crypto subagents missing from overview`);
    const supportRoles = { pt: 'Risco, tesouraria e governança', en: 'Risk, treasury and governance', es: 'Riesgo, tesorería y gobernanza' }[language];
    assert.ok(overview[1].includes(supportRoles), `${language}: risk, treasury and governance missing from overview`);
    const terminologyTitle = { pt: 'Terminologia Básica', en: 'Basic Terminology', es: 'Terminología Básica' }[language];
    assert.match(html, new RegExp(`<h2\\b[^>]*>${terminologyTitle}</h2>`), `${language}: basic terminology needs a visible H2`);
    const agenticVision = html.match(/<section\b[^>]*id="documentacao-visao-agentica"[^>]*>([\s\S]*?)<\/section>/);
    assert.ok(agenticVision, `${language}: agentic vision section missing`);
    const agenticTitle = { pt: 'Visão agêntica', en: 'Agentic vision', es: 'Visión agéntica' }[language];
    assert.match(agenticVision[1], new RegExp(`<h2\\b[^>]*>${agenticTitle}</h2>`), `${language}: agentic vision needs a visible H2`);
    assert.match(agenticVision[1], /src="[^"]*\/pitch-hero-ai-rescue\.webp"/, `${language}: agentic vision must use the approved Pitch hero illustration`);
    assert.match(agenticVision[1], /loading="lazy"/, `${language}: below-the-fold illustration must not preload the image`);
    const researchCycles = [...html.matchAll(/<section\b[^>]*data-testid="documentation-agent-research-cycle"[^>]*>([\s\S]*?)<\/section>/g)];
    assert.equal(researchCycles.length, 1, `${language}: research context, feedback and learning must share one subsection`);
    const researchCycle = researchCycles[0][1];
    assert.equal((researchCycle.match(/class="whitepaper__subhead"/g) ?? []).length, 1, `${language}: research cycle must have one visible subsection heading`);
    assert.match(researchCycle, /class="whitepaper__prose".*?<ol\b[^>]*>.*?<\/ol>.*?class="whitepaper__prose".*?class="agent-intel__note"/s, `${language}: keep context, feedback, learning and closing research note in order`);
    const marketFlowStart = html.indexOf('data-documentation-figure-topic="7"');
    const marketFlowEnd = html.indexOf('data-documentation-figure-topic="8"', marketFlowStart);
    assert.ok(marketFlowStart >= 0 && marketFlowEnd > marketFlowStart, `${language}: market connections and opportunity diagrams must remain present`);
    const marketFlow = html.slice(marketFlowStart, marketFlowEnd);
    assert.equal((marketFlow.match(/class="whitepaper__subhead"/g) ?? []).length, 1, `${language}: connectors and market connections must share one subsection`);
    assert.ok(marketFlow.indexOf('id="documentacao-ciclo-agentes"') > marketFlow.indexOf('id="figure-bettex-agents-t"'), `${language}: connector explanation belongs below the combined heading`);
    assert.ok(marketFlow.indexOf('data-testid="diagram-bettex-flow-7"') > marketFlow.indexOf('id="documentacao-ciclo-agentes"'), `${language}: explain the connector cycle before its diagram`);
    const orchestrationReference = html.match(/<details\b[^>]*id="documentacao-referencia-agentes"[^>]*>([\s\S]*?)<\/details>/);
    assert.ok(orchestrationReference, `${language}: orchestration technical reference missing`);
    const mapIntroPosition = orchestrationReference[1].indexOf('id="documentacao-mapa-arquitetura"');
    const technicalBodyPosition = orchestrationReference[1].indexOf('id="documentacao-arquitetura"');
    assert.ok(mapIntroPosition >= 0 && technicalBodyPosition > mapIntroPosition, `${language}: system map must introduce the technical reference`);
    assert.match(orchestrationReference[1], /id="documentacao-mapa-arquitetura"[^>]*data-documentation-opening/, `${language}: system map is introductory content, not a separate subsection`);
    assert.doesNotMatch(html, /contribuição por serviços|service contribution|contribución por servicios/i, `${language}: discarded operating-funding proposal`);
    for (const id of [...ids, 'documentacao-governanca-detalhe', 'documentacao-entidade-multisig', 'documentacao-versao-politica']) {
      assert(html.includes(`id="${id}"`), `${language}: unreachable ${id}`);
    }
    const renderedIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(renderedIds.length, new Set(renderedIds).size, `${language}: duplicate rendered anchors: ${renderedIds.filter((id, index) => renderedIds.indexOf(id) !== index).join(', ')}`);
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
