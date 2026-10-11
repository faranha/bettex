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
assert.match(copy, /50% tesouraria, 25% participantes e 25% recompra/);
assert.match(copy, /24 meses/);
assert.match(copy, /Quem entra durante uma rodada espera a próxima/);
assert.match(copy, /Qualquer saída de BETTEX, mesmo parcial, cancela os créditos anteriores ainda não pagos/);
assert.match(await read('src/lib/documentation-aliases.ts'), /'documentacao-tributos': 'documentacao-staking'/);
console.log('DeFi narrative: no corporate formation or fiscal distribution model; DEX, future autonomous AI, legacy links and essential economics preserved.');
