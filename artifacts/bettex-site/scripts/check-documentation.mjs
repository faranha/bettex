import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { transformWithEsbuild } from 'vite';

const read = p => fs.readFile(new URL(`../${p}`, import.meta.url), 'utf8');
const tokenSource = await transformWithEsbuild(await read('src/lib/tokenomics.ts'), 'token.ts', { loader: 'ts' });
const vestingSource = await transformWithEsbuild(await read('src/lib/vesting.ts'), 'vesting.ts', { loader: 'ts' });
const { vestingSchedule, documentationTokenomics } = await import(`data:text/javascript;base64,${Buffer.from(tokenSource.code + vestingSource.code.replace(/^import.*tokenomics.*;\s*$/m, 'const tokenomicsForVesting = documentationTokenomics;\n').replace(/\btokenomics\./g, 'tokenomicsForVesting.')).toString('base64')}`);
const totals = { publicSale: 0, team: 0, investors: 0, total: 0 };
assert.equal(vestingSchedule.length, 36);
for (const [i, row] of vestingSchedule.entries()) {
  assert.equal(row.month, i + 1);
  for (const key of Object.keys(totals)) { assert(Number.isInteger(row[key]) && row[key] > 0); totals[key] += row[key]; }
  assert.equal(row.publicSale + row.team + row.investors, row.total);
  assert.equal(row.publicSale * 4, row.team * 13);
  assert.equal(row.investors * 4, row.team * 3);
  assert.equal(row.publicSaleCumulative, totals.publicSale);
  assert.equal(row.teamCumulative, totals.team);
  assert.equal(row.investorsCumulative, totals.investors);
  assert.equal(row.cumulative, totals.total);
}
assert.deepEqual(totals, { publicSale: 650000000, team: 200000000, investors: 150000000, total: documentationTokenomics.maxSupply });
const commercialLink = await read('src/components/BusinessPlan.tsx');
assert.match(commercialLink, /pitch#publico/);
assert(!/business-plan\.json|DocFacts|<table|<h[234]|MAU/.test(commercialLink), 'Documentation contains only a Pitch link, not launch plans or forecasts.');
const materials = JSON.parse(await read('src/lib/documentation-materials.json'));
assert(!/piloto|MAU|5\.000 usuários|Capital do piloto/i.test(JSON.stringify(materials)), 'Downloads must not retain launch targets or projections.');
assert.equal(materials.pitchLink.href, 'https://bettex.ai/pitch#publico');
const chapters = await read('src/components/WhitepaperChapters.tsx');
const order = [...chapters.matchAll(/\{ id: '(documentacao-[\w-]+)', title:/g)].map(m => m[1]);
assert.equal(order.length, 13);
assert.equal(order[1], 'documentacao-entidade');
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
console.log('Documentation: chapter order, 8 agents, commercial plans restricted to the Pitch, 36-month integer vesting and removal of obsolete rules verified.');