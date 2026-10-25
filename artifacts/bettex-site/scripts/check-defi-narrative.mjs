import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const read = path => fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const components = [
  'TokenHolderRights', 'EntityOrganisation', 'EntityMultisig',
  'DocumentationGovernance', 'WhitepaperChapters', 'ProfitAccounting',
  'ReservePolicy', 'DistributionSettlement', 'DistributionCorrections',
  'StakingDistribution', 'BuybackPolicy', 'AuthorizedOperationCosts',
  'ServiceFees', 'ServiceFeeTaxes', 'SaleChannels', 'RoadmapSection',
  'FundSecurity', 'pitch/PitchProductResources',
  'architecture/BettexArchitecture', 'docs-diagrams/DocSchematics',
  'pitch/LaunchSimulation', 'pitch/FounderLaunchFunnel',
];
const paths = [
  ...components.map(name => `src/components/${name}.tsx`),
  'src/lib/documentation-copy.ts', 'src/lib/documentation-materials.json',
  'src/lib/business-plan.json', 'src/lib/growth-strategy.json',
  'src/lib/site-seo.json',
  'src/App.tsx', 'src/components/WhitepaperSection.tsx',
  'src/pages/pitch.tsx',
];
// Match obsolete assertions, not statements rejecting the corporate model
// or third-party companies cited in market research.
const corporate = /empresa privada a constituir|Entidade em etapa posterior|A entidade será avaliada|(?:constituição|formalização).{0,100}(?:etapa posterior|prioridades imediatas|curto prazo)/i;
const fiscal = /\b(?:tributos?|tributação|tributári[oa]s?|impostos?|fiscal|fiscais)\b/i;
const residualCorporate = /A entidade define|patrimônio consolidado da entidade|despesa da entidade|despesas institucionais|chaves institucionais|atos institucionais|Resumo da entidade|receita da empresa|sustentabilidade operacional/i;
const problems = [];
for (const path of paths) {
  const source = await read(path);
  for (const [pattern, reason] of [
    [corporate, 'retired corporate model'],
    [fiscal, 'retired fiscal distribution narrative'],
    [residualCorporate, 'residual corporate presentation'],
    [/\bretenções\b/i, 'retired withholding assumption'],
    [/href="#documentacao-tributos"/, 'retired tax link'],
  ]) {
    if (pattern.test(source)) problems.push(`${path}: ${reason} (${source.match(pattern)?.[0]})`);
  }
}
assert.equal(problems.length, 0, problems.join('\n'));
await assert.rejects(fs.access(new URL('../src/components/DistributionTaxes.tsx', import.meta.url)));
const rights = await read('src/components/TokenHolderRights.tsx');
assert.match(rights, /DeFi/);
assert.match(rights, /DEX/);
assert.match(rights, /fundador e o time/);
assert.match(rights, /independente e autônomo/);
assert.match(rights, /objetivo futuro, não uma capacidade já disponível/);
const copy = await read('src/lib/documentation-copy.ts');
assert.match(copy, /comunidade aberta|A colaboração é aberta/);
assert.match(copy, /A colaboração é aberta/);
const implicitConcept = /\u0061\u006c\u0074\u0072\u0075(?:\u00ed|\u0069|\u0069\u0301)?\u0073(?:\u0074|\u006d)/i;
for (const path of paths) assert.doesNotMatch(await read(path), implicitConcept, 'Community motivation must remain implicit');
assert.doesNotMatch(await read('src/lib/locales/translations.json'), implicitConcept, 'The concept must not be named in any language');
assert.match(copy, /sem salários e sem taxas de serviço/);
assert.match(copy, /Token da comunidade BETTEX/);
assert.doesNotMatch(copy, /token permite participar dos resultados/);
assert.match(await read('src/lib/business-plan.json'), /token da comunidade, não uma ação de empresa ou fundação/);
const seo = JSON.parse(await read('src/lib/site-seo.json'));
for (const [route, page] of Object.entries(seo.pages)) {
  if (route !== '/') assert.match(page.description, /comunidade/);
}
// The SEO revision leads with community and purpose; the visible hero remains
// unchanged. Keep the technology/trading identity without restoring earnings-led metadata.
assert.match(seo.pages['/'].title, /Comunidade DeFi/);
assert.match(seo.pages['/'].title, /trading com inteligência artificial/);
const app = await read('src/App.tsx');
const comparison = await read('src/components/pitch/EconomicComparisonRows.ts');
assert.match(comparison, /Sem taxas de serviço da BETTEX/);
assert.doesNotMatch(comparison, /Tarifa fixa de serviço/);
const pitch = await read('src/pages/pitch.tsx');
assert.doesNotMatch(pitch, /A decisão de cobrar ou não por serviços/);
assert.doesNotMatch(pitch, /<Sec id="recursos"|<PitchRisks/, 'Costs and risks is no longer a standalone Pitch chapter');
assert.doesNotMatch(pitch, /trading em mercados de apostas esportivas|<PitchDeFAIVision|<PitchProductResources|<SolutionParticipationFlow/);
assert.ok(pitch.includes('IA em cripto.'));
assert.match(pitch, /O demo apresenta a interface com dados ilustrativos, sem dinheiro real ou execução de operações/);
assert.match(await read('src/components/pitch/MarketOpportunity.tsx'), /Público potencial não é uma base de compradores validada/);
const pitchNarrative = await read('src/components/pitch/PitchNarrative.tsx');
assert.match(pitchNarrative, /O usuário participa dos resultados da operação em cripto coordenada pelo agente central BETTEX, com vários subagentes/);
assert.doesNotMatch(pitch + pitchNarrative, /\bBTX\b/, 'The public agent name is always BETTEX');
const pitchNav = await read('src/components/pitch/PitchSectionNav.tsx');
const pitchSections = ['visao', 'publico-pitch', 'problema', 'solucao', 'estrategia', 'tokenomics', 'publico', 'pitch-roadmap'];
assert.deepEqual([...pitchNav.matchAll(/\{ id: '([^']+)', label:/g)].map(match => match[1]), pitchSections, 'Pitch menu follows the approved reading order');
const introStart = pitch.indexOf('<section id="visao"');
const audienceStart = pitch.indexOf('<AudienceSection />');
const problemStart = pitch.indexOf('<Sec id="problema"');
const solutionStart = pitch.indexOf('<Sec id="solucao"');
assert.ok(introStart > 0 && introStart < audienceStart && audienceStart < problemStart && problemStart < solutionStart, 'Introduction, audience, problem and solution follow the approved order');
assert.match(pitch.slice(introStart, audienceStart), /Nossa tese: transformar apostadores em investidores/);
assert.doesNotMatch(pitch, /<Sec id="tese"|<PitchThesis/);
assert.match(pitchNav, /id: 'visao', label: 'Início'/);
assert.ok(pitch.slice(problemStart, solutionStart).includes('<EmploymentIncomeProblem />'), 'Employment and income belong to the problem chapter');
assert.doesNotMatch(pitchNav, /label: 'Produto'|label: 'Público e oportunidade'/);
assert.match(pitchNarrative, /Esses padrões orientam a seleção dos ativos e os momentos de entrada e saída/);
assert.doesNotMatch(pitchNarrative, /O ativo inicial está a definir|Um único agente de IA/);
assert.doesNotMatch(await read('src/components/RoadmapSection.tsx'), /Ativo inicial a definir/);
const projectModel = await read('src/components/ProjectModelSection.tsx');
assert.match(projectModel, /Nossa IA/);
assert.match(projectModel, /padrões de manipulação do mercado/);
assert.doesNotMatch(projectModel, /BETTEX e subagentes|O agente central BETTEX coordena/);
assert.match(pitchNarrative, /sem lucro, sem distribuição/);
assert.match(pitchNarrative, /O agente opera com a tesouraria, nunca com os tokens dos usuários/);
assert.match(pitchNarrative, /Nenhum retorno é garantido/);
assert.match(pitchNarrative, /A BETTEX faz a compra e a venda de BETTEX para o usuário e a conversão entre cripto e reais/);
assert.match(pitchNarrative, /On-ramp: entrada de reais e conversão para cripto/);
assert.match(pitchNarrative, /Off-ramp: conversão de cripto para reais para receber no Pix/);
assert.match(pitchNarrative, /As taxas são debitadas dos ganhos diários do participante/);
assert.match(pitchNarrative, /Ganhos diários − taxas das operações = valor líquido a receber no Pix/);
assert.doesNotMatch(pitch, /No ALFA, apenas custos externos de rede/);
assert.match(pitchNarrative, /O mint inicial forma a base da tesouraria/);
assert.doesNotMatch(pitchNarrative, /Investidores-anjo|Angel investors|Inversores ángel/);
assert.doesNotMatch(pitch, /aporte anjo|angel contribution|aporte ángel|angelFundingUse/);
assert.match(app, /Chega de apostar\./);
assert.match(app, /Comece a investir\./);
assert.ok(app.includes('Nosso agente IA opera em cripto, você recebe no Pix.'));
assert.ok(!app.includes('Chegou a hora de ganhar. A gente opera em cripto. Você recebe em reais.'));
assert.ok(!app.includes('Você não precisa saber operar nem negociar cripto.'));
assert.ok(!app.includes('A IA faz as operações. Você participa dos lucros com o token BETTEX.'));
assert.ok(app.includes('Ganhe até 1% por dia de lucro.'));
assert.doesNotMatch(app, /Um agente de IA que opera em mercados de iGaming/);
const homeOperation = await read('src/components/HomeRevisionSections.tsx');
assert.match(app, /<RoadmapSection variant="home"/);
assert.match(pitch, /<RoadmapSection id="pitch-roadmap" variant="home"/);
assert.doesNotMatch(app, /HomeOperationSection/);
assert.doesNotMatch(homeOperation, /HomeParticipationLogic|hr-op-title|diagram-home-flow/);
assert.match(app, /<HomeEarningsSection/);
assert.ok(app.indexOf('<HomeEarningsSection') < app.indexOf('<ProjectModelSection'), 'Daily benefit must be the first content section after the hero technology strip');
assert.ok(homeOperation.includes('Receba sua parte dos lucros no Pix. Você não precisa saber operar cripto.'));
assert.ok(homeOperation.includes('Você decide quando vender e sair.'));
assert.doesNotMatch(await read('src/components/HomeSectionNav.tsx'), /Como opera/);
assert.doesNotMatch(app, /NewEconomySection/);
assert.doesNotMatch(await read('src/components/HomeSectionNav.tsx'), /nova-economia/);
assert.match(app, /<span>Quero participar<\/span>/);
assert.doesNotMatch(await read('src/components/hero/HeroBenefit.tsx'), /NewsClipping|jogo de futebol/);
assert.doesNotMatch(app, /HumanStorySection/);
assert.doesNotMatch(await read('src/components/HomeSectionNav.tsx'), /Por que BETTEX/);
assert.doesNotMatch(app, /Comunidade aberta\.|Tecnologia com IA\./);
const whitepaper = await read('src/components/WhitepaperSection.tsx');
assert.doesNotMatch(whitepaper.match(/whitepaper__hero-lede[^>]*>([^<]+)/)?.[1] ?? '', /distribuição de resultados/);
assert.match(whitepaper, /intelligenceCopy\.hero/);
assert.match(await read('src/lib/documentation-intelligence.ts'), /Esta é uma visão em desenvolvimento, não um sistema concluído nem garantia de retorno/);
assert.match(await read('src/lib/documentation-intelligence.ts'), /O agente BETTEX é a inteligência de orquestração/);
const social = await read('scripts/restore-home-social.mjs');
assert.match(social, /generate-social-cards\.mjs/);
const socialTemplate = `${await read('public/social-preview.html')}\n${await read('public/social-preview.js')}`;
assert.match(socialTemplate, /Comunidade aberta/);
assert.match(socialTemplate, /Demonstração visual, sem transações reais/);
assert.doesNotMatch(socialTemplate, /Seja o dono do jogo\. Participe dos resultados da IA\.|USE IA CONTRA|OUT 2026|JAN 2027/);
assert.match(copy, /50% tesouraria, 25% participantes e 25% recompra/);
assert.match(copy, /24 meses/);
assert.match(copy, /Quem entra durante uma rodada espera a próxima/);
assert.match(copy, /Qualquer saída de BETTEX, mesmo parcial, cancela os créditos anteriores ainda não pagos/);
assert.match(await read('src/lib/documentation-aliases.ts'), /'documentacao-tributos': 'documentacao-staking'/);
console.log('DeFi narrative: no corporate formation or fiscal distribution model; DEX, future autonomous AI, legacy links and essential economics preserved.');
