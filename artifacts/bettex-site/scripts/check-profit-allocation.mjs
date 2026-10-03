import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { transformWithEsbuild } from 'vite';

const read = relative => fs.readFile(new URL(relative, import.meta.url), 'utf8');
const policy = await transformWithEsbuild(await read('../src/lib/profit-allocation-policy.ts'), 'policy.ts', { loader: 'ts' });
const simulation = await transformWithEsbuild(await read('../src/lib/distribution-tax-illustration.ts'), 'simulation.ts', { loader: 'ts' });
const moduleSource = policy.code + simulation.code.replace(/^import.*profit-allocation-policy.*;\s*$/m, '');
const { calculateTaxIllustration, profitAllocation } = await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
assert.deepEqual(profitAllocation, { treasury: 0.5, staking: 0.25, buyback: 0.25 });
const input = { resultAfterCosts: 5000, entityTaxes: 1000, beneficiaryWithholding: 125, distributionConditionsMet: true };
const paid = calculateTaxIllustration(input);
assert.equal(paid.status, 'ready');
assert.equal(paid.treasury, 2000);
assert.equal(paid.buyback, 1000);
assert.equal(paid.stakingGross, 1000);
assert.equal(paid.stakingNet, 875);
assert.equal(paid.treasury + paid.buyback + paid.stakingNet + paid.beneficiaryWithholding, paid.eligibleProfit);
const blocked = calculateTaxIllustration({ ...input, distributionConditionsMet: false, beneficiaryWithholding: 0 });
assert.equal(blocked.treasury, 4000);
assert.equal(blocked.buyback, 0);
assert.equal(blocked.stakingGross, 0);
for (const resultAfterCosts of [0, -500]) {
  const empty = calculateTaxIllustration({ ...input, resultAfterCosts, entityTaxes: 0, beneficiaryWithholding: 0 });
  assert.equal(empty.treasury + empty.buyback + empty.stakingGross, 0);
}
assert.equal(calculateTaxIllustration({ ...input, entityTaxes: null }).status, 'pending');
assert.equal(calculateTaxIllustration({ ...input, resultAfterCosts: NaN }).status, 'invalid');
assert.equal(calculateTaxIllustration({ ...input, beneficiaryWithholding: 1001 }).status, 'invalid');
const example = [
  [1000, 100500, 250],
  [-500, 100000, 250],
  [500, 100250, 375],
  [200, 100350, 425],
];
let operating = 100000, wallet = 0, stakers = 0;
for (const [profit, expectedOperating, expectedWallet] of example) {
  operating += profit;
  if (profit > 0) {
    operating -= profit * 0.5;
    wallet += profit * 0.25;
    stakers += profit * 0.25;
  }
  assert.equal(operating, expectedOperating);
  assert.equal(wallet, expectedWallet);
}
assert.equal(stakers, 425);
assert.equal(operating + wallet, 100775);
const current = JSON.parse(await read('../src/lib/locales/source.json'));
for (const text of current) {
  const oldSplit = /\b75\s*%\s*\/\s*25\s*%|\bsplit\s+75\/25|75\s*%.{0,45}(?:tesouraria|retid)|tesouraria.{0,20}75\s*%/i;
  assert.ok(!oldSplit.test(text), `Obsolete allocation: ${text}`);
}
console.log('Profit allocation: 50/25/25, blocked/zero/negative rounds, tax deductions and segregated accounting example verified.');