import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');
const materials = JSON.parse(read('src/lib/documentation-materials.json'));
const growth = JSON.parse(read('src/lib/growth-strategy.json'));
const chapters = read('src/components/WhitepaperChapters.tsx');
const funding = read('src/components/BusinessPlan.tsx');
const pitch = read('src/pages/pitch.tsx');
const games = read('src/components/DocumentationGames.tsx');
const pitchGames = read('src/components/pitch/PitchProductResources.tsx');
const staking = read('src/components/StakingDistribution.tsx');

for (const path of [
  'src/components/WhitepaperChapters.tsx',
  'src/components/DocumentationGovernance.tsx',
  'src/components/SaleChannels.tsx',
  'src/components/architecture/BettexArchitecture.tsx',
  'src/components/docs-diagrams/DocSchematics.tsx',
]) {
  assert.doesNotMatch(read(path), /Aportes de investidores têm livre alocação|Aportes de investidores e vendas pessoais do fundador têm livre destinação|aportes vinculados aos 15% dos investidores têm livre alocação|Aportes de livre alocação|split dos aportes dos investidores/i, `${path}: obsolete funding rule`);
}
assert.match(growth.launch.angelFundingUse, /100%/);
assert.match(funding, /g\.launch\.angelFundingUse/);
assert.match(pitch, /g\.launch\.angelFundingUse/);
assert.match(chapters, /growthStrategy\.launch\.angelFundingUse/);
assert.match(funding, /id="documentacao-financiamento-fundacao"/);
assert.match(pitch, /hash="documentacao-financiamento-fundacao"/);
assert.doesNotMatch(JSON.stringify(materials), /100 mil|50 mil|livre aloca|5\.000 usuários|1\.000 MAU/i);
assert.match(JSON.stringify(materials), /Aportes-anjo destinam 100%/);

assert.match(chapters, /<DocumentationGames \/>/);
assert.match(pitch, /<PitchProductResources \/>/);
for (const id of ['documentacao-loteria', 'documentacao-double-2x']) {
  assert.ok(games.includes(`id="${id}"`));
  assert.ok(pitchGames.includes(`/documentacao#${id}`));
}
assert.match(games, /todo BETTEX pago é queimado/);
assert.match(games, /cancela todos os créditos de staking anteriores ainda não pagos/);
assert.match(games, /Uma jogada a cada 24 horas corridas/);
assert.match(games, /RTP de 100%.*não garantia/);
assert.match(games, /nunca créditos de staking pendentes/);
assert.match(staking, /não pools de staking independentes/);
assert.match(staking, /não uma conversão da meia-noite UTC/);
assert.match(pitch, /O ALFA apresenta a interface com dados ilustrativos/);
assert.doesNotMatch(pitch, /O ALFA está previsto.*primeiros agentes/);

const text = materials.sections.flatMap(section => section.paragraphs).join('\n');
for (const label of ['Burn Lottery:', 'Double 2X:', '24 horas corridas', 'sem dinheiro real']) {
  assert.ok(text.includes(label), `Downloads must include ${label}`);
}
const roundRules = read('src/lib/distribution-round-policy.ts');
assert.match(roundRules, /não autorizam novos envios da rodada encerrada/);
assert.match(roundRules, /Recursos incertos não são considerados recuperados/);
console.log('Documentation/Pitch update: financing, cross-links, game rules, clock distinction, visual-demo status and download coverage verified.');
