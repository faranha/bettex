/** Executes the real TS models with isolated JSON fixtures; no dependencies added. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const dir = path.resolve(__dirname, '../artifacts/bettex-site/src/lib');
const json = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
function load(name, overrides = {}, cache = new Map()) {
  const filename = path.join(dir, name);
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(dir);
  cache.set(filename, mod);
  const normalRequire = mod.require.bind(mod);
  mod.require = dependency => {
    const basename = dependency.replace(/^\.\//, '');
    if (Object.hasOwn(overrides, basename)) return structuredClone(overrides[basename]);
    if (dependency.startsWith('./') && fs.existsSync(path.join(dir, basename + '.ts'))) {
      return load(basename + '.ts', overrides, cache);
    }
    return normalRequire(dependency);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, filename);
  return mod.exports;
}
const { businessPlan: p, businessMonths: months, supportCapacity } = load('business-plan.ts');
assert.equal(p.fixed, 42000);
assert.equal(p.contribution, 2.1);
assert.equal(p.breakEvenOperations, 20000);
assert.equal(p.firstBreakEvenMonth, 9);
assert.equal(p.operatingFunding, 411450);
assert.equal(p.yearRevenue, 373750);
assert.equal(p.yearCashResult, -235050);
assert.equal(supportCapacity(24000).humanHours, 48);
assert.equal(supportCapacity(30001).overCapacity, true);
assert.equal(months.reduce((s, m) => s + m.purchases, 0), 29900);
for (const m of months) {
  assert.equal(m.purchases + m.withdrawals + m.transfers, m.operations);
  assert.equal(m.minimumEligibleProfit * 0.25, m.requestedWithdrawals);
}
const { operatingTarget } = load('operating-targets.ts');
assert.equal(operatingTarget(50000).operations, p.breakEvenOperations);
assert.equal(operatingTarget(75000).operations, 30000);
assert.equal(operatingTarget(50000, .15).operations, 21539);
assert.equal(operatingTarget(50000, .15, .1).operations, 24706);
assert.throws(() => operatingTarget(50000, 3));
assert.throws(() => operatingTarget(50000, 0, .9));
assert.throws(() => operatingTarget(NaN));
// Changing the base variable cost must not silently shrink the actual fixed costs.
const higherVariable = json('business-plan.json');
higherVariable.variableCostPerOperationUsd = .3;
const changed = { 'business-plan.json': higherVariable };
assert.equal(load('business-plan.ts', changed).businessPlan.breakEvenOperations, 21539);
assert.equal(load('operating-targets.ts', changed).operatingTarget(50000).operations, 21539);
assert.equal(load('business-plan.ts', changed).businessPlan.firstBreakEvenMonth, 10);
const higherSalary = json('entity-team.json');
higherSalary.positions.find(p => p.id === 'dev').proposedMonthlySalaryUsd = 8000;
const salaryChanged = { 'entity-team.json': higherSalary };
assert.equal(load('operating-targets.ts', salaryChanged).operatingTarget(50000).operations,
  load('business-plan.ts', salaryChanged).businessPlan.breakEvenOperations);
const allPurchases = json('business-plan.json');
allPurchases.mix.purchaseShare = 1;
allPurchases.mix.withdrawalShare = 0;
assert.equal(load('business-plan.ts', { 'business-plan.json': allPurchases }).businessMonths[8].purchases, 20000);
for (const change of [
  a => { a.mix.purchaseShare = -.1; },
  a => { a.mix.purchaseShare = .8; },
  a => { a.mix.purchaseTicketUsdc = -100; },
  a => { a.months[8].monthlyActiveUsers = 0; },
  a => { a.months[8].operations = 1.5; },
  a => { a.support.automatedResolutionShare = 1.1; },
  a => { a.support.humanMinutesPerTicket = 0; },
  a => { a.revenueTaxProvisionRate = 1; },
  a => { a.variableCostPerOperationUsd = 3; },
  a => { a.reserveMonths = -1; },
  a => { a.growth.testPaidCacUsd = 0; },
]) {
  const a = json('business-plan.json');
  change(a);
  assert.throws(() => load('business-plan.ts', { 'business-plan.json': a }));
}
for (const change of [
  t => { t.positions[0].proposedMonthlySalaryUsd = 1; },
  t => { t.positions[1].proposedMonthlySalaryUsd = 0; },
  t => { t.positions[1].id = 'founder'; },
  t => { t.positions.push(t.positions[1]); },
]) {
  const t = json('entity-team.json');
  change(t);
  assert.throws(() => load('business-plan.ts', { 'entity-team.json': t }));
}
const { feeProjections } = load('fee-projections.ts');
assert.equal(feeProjections[0].annualFees, 1165000);
assert.equal(feeProjections[0].yearEndRecurringMonthlyFees, 152500);
assert.equal(feeProjections[0].netWithdrawalPerOperation, .5);
const tokenomics = load('tokenomics.ts').tokenomics;
assert.equal(tokenomics.publicSaleAllocation + tokenomics.teamAllocation + tokenomics.investorAllocation,
  tokenomics.maxSupply);
assert.equal(tokenomics.vestingMonths, 36);
console.log('PASS: actual models, base/shock comparisons, changed salaries/costs, invalid inputs, fees and token allocation.');