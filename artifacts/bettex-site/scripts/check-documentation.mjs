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
const tokenMaterials = materials.sections.find(section => section.title === 'Token, captação e queima').paragraphs.join(' ');
assert.match(tokenMaterials, /10 de dezembro de 2026/);
assert.match(tokenMaterials, /março de 2027/);
assert.match(tokenMaterials, /24 meses/);
assert.match(tokenMaterials, /11:4:3/);
assert.doesNotMatch(tokenMaterials, /65%|36 meses|13:4:3|650 milhões/);
for (const source of ['src/components/VestingChart.tsx', 'src/components/pitch/PitchTokenCharts.tsx']) {
  const chart = await read(source);
  assert.match(chart, /documentation-vesting/);
  assert.match(chart, /initialMintAllocation/);
  assert.match(chart, /[Nn]ão representa emissão executada/);
}
assert(!/piloto|MAU|5\.000 usuários|Capital do piloto/i.test(JSON.stringify(materials)), 'Downloads must not retain launch targets or projections.');
assert.equal(materials.pitchLink.href, 'https://bettex.ai/pitch#publico');
const chapters = await read('src/components/WhitepaperChapters.tsx');
const order = [...chapters.matchAll(/\{ id: '(documentacao-[\w-]+)', title:/g)].map(m => m[1]);
assert.equal(order.length, 14);
assert.equal(order[1], 'documentacao-entidade');
assert.equal(order[2], 'documentacao-adequacao-legal');
assert.match(chapters, /<LegalCompliance \/>/);
const legal = materials.sections.find(section => section.title === 'Adequação legal e jurídica');
assert.equal(legal?.paragraphs.length, 8, 'Legal policy is shared with documentation downloads.');
assert.match(legal.paragraphs.join(' '), /São exemplos condicionais/);
assert.match(legal.paragraphs.join(' '), /Investigação pendente, proibição ou falta de autorização necessária impede/);
assert.equal(order[order.indexOf('documentacao-riscos') + 1], 'documentacao-governanca');
for (const id of ['documentacao-servicos', 'documentacao-staking']) assert(order.includes(id));
const agents = await read('src/components/InvestmentAgents.tsx');
assert.equal([...agents.matchAll(/\{ id: '[^']+', name:/g)].length, 8);
for (const field of ['input:', 'analysis:', 'control:', 'example:', 'result:']) assert.equal(agents.split(field).length - 1, 8);
const obsolete = [
  /(?:até|teto de) cinco pessoas/i, /quatro posições (?:pagas|remuneradas)/i,
  /proposedMonthlySalaryUsd|payrollChargesRate|Sustentar a operação/i,
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
assert(chapters.indexOf('<VestingSchedule />') < chapters.indexOf('<SaleChannels />'), 'Vesting precedes public-sale channels.');
assert.match(await read('src/components/VestingSchedule.tsx'), /<h3 id="vesting-title"/);
assert(!await fs.access(new URL('../src/lib/entity-team.json', import.meta.url)).then(() => true, () => false));
for (const obsoleteFile of ['fee-projection-scenarios.json', 'service-fee-taxes.ts', 'operating-targets.json']) {
  assert(!await fs.access(new URL(`../src/lib/${obsoleteFile}`, import.meta.url)).then(() => true, () => false));
}
console.log('Documentation: chapter order, 8 agents, 10/55/20/15 allocations, 24-month integer vesting, isolated demo baseline and removal of obsolete rules verified.');