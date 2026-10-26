import './check-defi-narrative.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { transformWithEsbuild } from 'vite';

const read = p => fs.readFile(new URL(`../${p}`, import.meta.url), 'utf8');
const tokenSource = await transformWithEsbuild(await read('src/lib/tokenomics.ts'), 'token.ts', { loader: 'ts' });
const vestingSource = await transformWithEsbuild(await read('src/lib/documentation-vesting.ts'), 'vesting.ts', { loader: 'ts' });
const { documentationVestingSchedule: vestingSchedule, documentationTokenomics, tokenomics: demoTokenomics } = await import(`data:text/javascript;base64,${Buffer.from(tokenSource.code + vestingSource.code.replace(/^import.*tokenomics.*;\s*$/m, 'const tokenomicsForVesting = documentationTokenomics;\n').replace(/\btokenomics\./g, 'tokenomicsForVesting.')).toString('base64')}`);
const totals = { community: 0, team: 0, investors: 0, total: 0 };
assert.equal(vestingSchedule.length, 24);
assert.equal(documentationTokenomics.initialMintAllocation + documentationTokenomics.vestingTotal, documentationTokenomics.maxSupply);
assert.equal(demoTokenomics.vestingMonths, 36, 'Visual demo baseline must remain isolated.');
assert.equal(demoTokenomics.publicSaleAllocation, 650000000);
assert.match(await read('src/lib/vesting.ts'), /import \{ tokenomics \}/);
for (const [i, row] of vestingSchedule.entries()) {
  assert.equal(row.month, i + 1);
  for (const key of Object.keys(totals)) { assert(Number.isInteger(row[key]) && row[key] > 0); totals[key] += row[key]; }
  assert.equal(row.community + row.team + row.investors, row.total);
  assert.equal(row.community * 4, row.team * 11);
  assert.equal(row.investors * 4, row.team * 3);
  assert.equal(row.communityCumulative, totals.community);
  assert.equal(row.teamCumulative, totals.team);
  assert.equal(row.investorsCumulative, totals.investors);
  assert.equal(row.cumulative, totals.total);
}
assert.deepEqual(totals, { community: 550000000, team: 200000000, investors: 150000000, total: documentationTokenomics.vestingTotal });
const commercialLink = await read('src/components/BusinessPlan.tsx');
assert.match(commercialLink, /pitch#publico/);
assert(!/business-plan\.json|DocFacts|<table|MAU|100\.000|50\.000/.test(commercialLink), 'Documentation explains funding sources without duplicating launch forecasts.');
assert.match(commercialLink, /id="documentacao-financiamento-fundacao"/, 'The Pitch financing link must have a documentation destination.');
assert.match(commercialLink, /g\.launch\.angelFundingUse/, 'Pitch and documentation use the same approved angel-funding copy.');
const materials = JSON.parse(await read('src/lib/documentation-materials.json'));
const tokenMaterials = materials.sections.flatMap(section => section.paragraphs).join(' ');
assert.doesNotMatch(tokenMaterials, /10 de dezembro de 2026/);
assert.match(tokenMaterials, /março de 2027/);
assert.match(tokenMaterials, /junho de 2027/);
assert.match(tokenMaterials, /24 meses/);
// Integer allocation proportions are proved above for every vesting row;
// the short public document need not repeat the technical 11:4:3 formula.
assert.doesNotMatch(tokenMaterials, /65%|36 meses|13:4:3|650 milhões/);
for (const source of ['src/components/VestingChart.tsx', 'src/components/pitch/PitchTokenCharts.tsx']) {
  const chart = await read(source);
  const dataRenderer = source.endsWith('/VestingChart.tsx') ? await read('src/components/VestingPlot.tsx') : chart;
  assert.match(dataRenderer, /documentation-vesting/);
  assert.match(dataRenderer, /initialMintAllocation/);
  assert.match(chart, /[Nn]ão representa emissão executada/);
}
assert(!/piloto|MAU|5\.000 usuários|Capital do piloto/i.test(JSON.stringify(materials)), 'Downloads must not retain launch targets or projections.');
assert.equal(materials.pitchLink.href, 'https://bettex.ai/pitch#publico');
const chapters = await read('src/components/WhitepaperChapters.tsx');
const publicCopy = await read('src/lib/documentation-copy.ts');
assert.match(publicCopy, /Starknet e Arbitrum One são alternativas/);
assert.match(publicCopy, /planejamento e captação de grants/);
assert.match(publicCopy, /rede de lançamento ainda não foi escolhida/);
assert.doesNotMatch(publicCopy + chapters, /A rede de referência do token é a Arbitrum|Arbitrum One é a rede de referência do token/);
assert.match(chapters, /contratos Solidity e endereços EVM não são transferidos automaticamente/);
const brands = await read('src/components/technology/TechnologyNetworks.tsx');
assert.match(brands, /technologies\/starknet\.svg/);
assert.match(brands, /alt="Starknet"/);
assert.match(brands, /label = 'Parceiros'/);
assert.match(brands, /alt="Allora"/);
assert.doesNotMatch(brands, /alt="Arbitrum"/);
assert.match(brands, /ethereum = false/, 'The optional homepage Ethereum logo must remain off by default');
assert.match(brands, /\{ethereum && <li>/, 'Ethereum must remain an explicit opt-in, not an assumed network choice');
assert.match(await read('src/App.tsx'), /<TechnologyNetworks label="Tecnologias"/);
assert.match(tokenMaterials, /Starknet e Arbitrum One são alternativas/);
const networkCosts = await read('src/components/ServiceFees.tsx');
assert.doesNotMatch(publicCopy + networkCosts, /contribuição por serviços|receita operacional|sustentabilidade operacional|sustentar o serviço pela tesouraria/i, 'Public documentation leaves operating funding open.');
assert.doesNotMatch(networkCosts, /<h[34]|ServiceFeeTaxes/, 'Network costs have one topic heading, without duplicated revenue subsections.');
assert.match(networkCosts, /não cobra taxas de serviço/);
assert.match(networkCosts, /custos externos da rede, que não são receita da comunidade/);
assert.match(networkCosts, /não cobra taxas de serviço/);
// The opening is explicitly demo/POC; economic mechanisms keep their baseline rules.
assert.match(await read('src/components/WhitepaperSection.tsx'), /DEMO \/ POC/);
assert.match(await read('src/components/WhitepaperSection.tsx'), /ALFA será documentada após consultar a comunidade e testar a receptividade do demo/);
for (const path of ['src/components/ServiceFees.tsx', 'src/components/DocumentationGames.tsx', 'src/components/DocumentationGovernance.tsx', 'src/components/StakingDistribution.tsx']) {
  assert.doesNotMatch(await read(path), /\bdemo\b|interface de demonstração|interfaz de demostración/i, `${path}: documentation must describe the final vision, not the demo`);
}
assert.match(publicCopy, /50% tesouraria, 25% participantes e 25% recompra/);
assert.match(publicCopy, /24 meses/);
assert.match(publicCopy, /Quem entra durante uma rodada espera a próxima/);
assert.match(publicCopy, /Qualquer saída de BETTEX, mesmo parcial, cancela os créditos anteriores ainda não pagos/);
const structure = await read('src/lib/documentation-structure.ts');
const principalList = structure.match(/export const documentationChapters = \[([\s\S]*?)\] as const/);
assert(principalList, 'The principal chapter list must be identifiable independently of legacy references.');
const order = [...principalList[1].matchAll(/\{ id: '(documentacao-[\w-]+)', title:/g)].map(m => m[1]);
assert.equal(order.length, 24, 'Tokenomics is its own main section, separate from Features, within seven responsibility groups.');
assert.ok(order.includes('documentacao-tokenomics'));
assert.equal(new Set(order).size, order.length, 'No duplicate chapter IDs.');
for (const id of ['documentacao-agentes', 'documentacao-subagente-risco', 'documentacao-subagente-tesouraria', 'documentacao-subagente-governanca', 'documentacao-subagente-cripto', 'documentacao-especialista-btc', 'documentacao-especialista-eth', 'documentacao-especialista-sol', 'documentacao-carteira-bettex', 'documentacao-carteira-usdc', 'documentacao-acesso']) assert(order.includes(id), id);
assert.equal(order.at(-1), 'documentacao-roadmap');
assert.equal(order[0], 'documentacao-como-funciona');
assert(!order.includes('documentacao-entidade'), 'An institutional company chapter is no longer a product requirement.');
for (const id of ['documentacao-emissao', 'documentacao-staking']) assert(order.includes(id));
assert.match(tokenMaterials, /DeFi/);
assert.match(tokenMaterials, /autoriza|territóri|licença/i, 'Short downloads must retain legal-release conditions.');
assert.match(tokenMaterials, /risco|perda|desvaloriza/i, 'Risks may be consolidated, not removed.');
assert.doesNotMatch(tokenMaterials, /formalização.*(?:prevista|prioridade)|liderança da empresa BETTEX|empresa a constituir/i);
const agents = await read('src/components/InvestmentAgents.tsx');
assert.match(agents, /BETTEX|agente|agent/i, 'Public agent presentation remains available.');
const obsolete = [
  /(?:até|teto de) cinco pessoas/i, /quatro posições (?:pagas|remuneradas)/i,
  /proposedMonthlySalaryUsd|payrollChargesRate|title:\s*['"]Sustentar a operação['"]/i,
  /Mercado grande não é demanda comprovada/i, /(?:equilíbrio|break.?even).{0,30}mês 9/i,
  /destino dos tokens recomprados pendente|queima não aprovada/i,
  /reserva defensiva mínima inicial de 50%/i,
  /50% para a tesouraria e 50% para capital/i,
];
const files = ['WhitepaperChapters', 'EntityOrganisation', 'BusinessPlan', 'DocumentationGovernance', 'EntityMultisig', 'InvestmentAgents', 'BuybackPolicy', 'ReservePolicy', 'InvestmentRiskBase', 'ServiceFees', 'ServiceFeeTaxes', 'FundSecurity'];
for (const file of files) {
  const text = await read(`src/components/${file}.tsx`);
  for (const pattern of obsolete) assert(!pattern.test(text), `${file}: obsolete ${pattern}`);
}
for (const file of ['src/components/architecture/BettexArchitecture.tsx', 'src/components/docs-diagrams/DocSchematics.tsx']) {
  const text = await read(file);
  for (const pattern of obsolete) assert(!pattern.test(text), `${file}: obsolete ${pattern}`);
  assert.match(text, /burn|queima permanente/i);
}
assert(!chapters.includes('ServiceFeeIllustration'));
assert(!chapters.includes('<VestingSchedule />') || !chapters.includes('<SaleChannels />') || chapters.indexOf('<VestingSchedule />') < chapters.indexOf('<SaleChannels />'), 'Where both detailed components are displayed, vesting precedes channels.');
assert.match(await read('src/components/VestingSchedule.tsx'), /<h3 id="vesting-title"/);
assert(!await fs.access(new URL('../src/lib/entity-team.json', import.meta.url)).then(() => true, () => false));
for (const obsoleteFile of ['fee-projection-scenarios.json', 'service-fee-taxes.ts', 'operating-targets.json']) {
  assert(!await fs.access(new URL(`../src/lib/${obsoleteFile}`, import.meta.url)).then(() => true, () => false));
}
console.log('Documentation: actor-owned demo/POC baseline, deterministic features, legal/risk conditions, 10/55/20/15 allocations, 24-month vesting and isolated visual demo verified.');