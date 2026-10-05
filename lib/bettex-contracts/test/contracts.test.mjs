import test from 'node:test';
import assert from 'node:assert/strict';
import { network } from 'hardhat';
import { BrowserProvider, Contract, ContractFactory, MaxUint256, id } from 'ethers';
import { build } from 'esbuild';
import { compileContracts } from '../scripts/compile.mjs';

const artifacts = await compileContracts();
// Read the actual current application schedule, not a hand-copied fixture.
const compiledSchedule = await build({
  entryPoints: ['../../artifacts/bettex-site/src/lib/vesting.ts'],
  bundle: true, platform: 'node', format: 'esm', write: false,
});
const { vestingSchedule } = await import(`data:text/javascript;base64,${Buffer.from(compiledSchedule.outputFiles[0].text).toString('base64')}`);
const unit = 10n ** 18n;
const supply = 1_000_000_000n * unit;
const price = 50_000n; // LOCAL hypothetical 0.05 USDC; not an approved product price.
const fee = 2_500_000n;
const wait = async tx => (await tx).wait();
const deploy = async (name, signer, args = []) => {
  const artifact = artifacts[name];
  const contract = await new ContractFactory(artifact.abi, artifact.bytecode, signer).deploy(...args);
  await contract.waitForDeployment();
  return contract;
};
const monthlyTimes = start => Array.from({ length: 36 }, (_, i) => {
  const source = new Date(start * 1000);
  const year = source.getUTCFullYear(), month = source.getUTCMonth() + i;
  const day = Math.min(source.getUTCDate(), new Date(Date.UTC(year, month + 1, 0)).getUTCDate());
  return Math.floor(Date.UTC(year, month, day, source.getUTCHours(), source.getUTCMinutes(), source.getUTCSeconds()) / 1000);
});
async function fixture(t, name = 'local', asset = 'MockUSDC') {
  const connection = await network.create(name);
  const provider = new BrowserProvider(connection.provider, undefined, { cacheTimeout: -1 });
  const actors = await Promise.all(Array.from({ length: 7 }, (_, i) => provider.getSigner(i)));
  const addresses = await Promise.all(actors.map(s => s.getAddress()));
  t.after(async () => { provider.destroy(); await connection.close(); });
  const latest = await provider.getBlock('latest');
  const times = monthlyTimes(latest.timestamp + 60);
  const at = async timestamp => {
    await connection.provider.request({ method: 'evm_setNextBlockTimestamp', params: [timestamp] });
    await connection.provider.request({ method: 'evm_mine', params: [] });
  };
  if (name !== 'local') return { actors, addresses, times, at, provider, connection };
  const usdc = await deploy(asset, actors[0]);
  const args = [addresses[4], addresses[5], addresses[2], addresses[3], addresses[0], await usdc.getAddress(), price, times];
  const token = await deploy('BettexTestToken', actors[0], args);
  const sale = new Contract(await token.publicSale(), artifacts.BettexPrimarySale.abi, actors[0]);
  const founder = new Contract(await token.founderVault(), artifacts.BettexAllocationVault.abi, actors[0]);
  const investor = new Contract(await token.investorVault(), artifacts.BettexAllocationVault.abi, actors[0]);
  await wait(sale.authorizeBuyer(addresses[1], addresses[1]));
  await wait(sale.authorizeBuyer(addresses[6], addresses[6]));
  await wait(usdc.mint(addresses[1], 1_000_000n * 1_000_000n));
  await wait(usdc.connect(actors[1]).approve(await sale.getAddress(), MaxUint256));
  return { actors, addresses, times, at, provider, connection, usdc, token, sale, founder, investor, args };
}
async function openSale(f) { await f.at(f.times[0]); await wait(f.sale.unpause()); }

test('local execution chain is explicit; genesis preserves supply and three locked allocations', async t => {
  const f = await fixture(t);
  assert.equal((await f.provider.getNetwork()).chainId, 31337n);
  assert.equal(await f.token.totalSupply(), supply);
  for (const address of f.addresses) assert.equal(await f.token.balanceOf(address), 0n);
  assert.equal(await f.token.balanceOf(await f.sale.getAddress()), 650_000_000n * unit);
  assert.equal(await f.token.balanceOf(await f.founder.getAddress()), 200_000_000n * unit);
  assert.equal(await f.token.balanceOf(await f.investor.getAddress()), 150_000_000n * unit);
  assert.equal(await f.sale.paused(), true);
  const functions = artifacts.BettexTestToken.abi.filter(x => x.type === 'function').map(x => x.name);
  for (const forbidden of ['mint', 'upgradeTo', 'pause', 'setSchedule', 'setOwner']) assert.equal(functions.includes(forbidden), false);
});
test('Arbitrum mainnet deployments are rejected, including the local mock asset', async t => {
  const f = await fixture(t, 'forbidden');
  assert.equal((await f.provider.getNetwork()).chainId, 42161n);
  await assert.rejects(deploy('MockUSDC', f.actors[0]));
  await assert.rejects(deploy('BettexTestToken', f.actors[0], [
    f.addresses[4], f.addresses[5], f.addresses[2], f.addresses[3], f.addresses[0], f.addresses[6], price, f.times,
  ]));
});
test('Sepolia constructor cannot use an arbitrary local USDC or an EOA administrator', async t => {
  const f = await fixture(t, 'sepoliaGuard');
  assert.equal((await f.provider.getNetwork()).chainId, 421614n);
  await assert.rejects(deploy('MockUSDC', f.actors[0]));
  await assert.rejects(deploy('BettexTestToken', f.actors[0], [
    f.addresses[4], f.addresses[5], f.addresses[2], f.addresses[3], f.addresses[0], f.addresses[6], price, f.times,
  ]));
});
test('before opening, there is no released allocation or sale', async t => {
  const f = await fixture(t);
  assert.equal(await f.sale.currentMonth(), 0n);
  assert.equal(await f.founder.releasable(), 0n);
  await assert.rejects(f.founder.release());
  await wait(f.sale.unpause());
  await assert.rejects(f.sale.connect(f.actors[1]).buy(1n, price + fee, id('too-early')));
});
test('all 36 monthly releases exactly match the existing documented schedule', async t => {
  const f = await fixture(t);
  for (let i = 0; i < 36; ++i) {
    await f.at(f.times[i]);
    const row = vestingSchedule[i];
    assert.equal(await f.sale.currentMonth(), BigInt(i + 1));
    assert.equal(await f.sale.releasedGroups() * 13n * unit, BigInt(row.publicSaleCumulative) * unit);
    await wait(f.founder.release());
    await wait(f.investor.release());
    assert.equal(await f.token.balanceOf(f.addresses[4]), BigInt(row.teamCumulative) * unit);
    assert.equal(await f.token.balanceOf(f.addresses[5]), BigInt(row.investorsCumulative) * unit);
    assert.equal(await f.founder.releasable(), 0n);
    assert.equal(await f.investor.releasable(), 0n);
  }
  assert.equal(await f.token.balanceOf(f.addresses[4]), 200_000_000n * unit);
  assert.equal(await f.token.balanceOf(f.addresses[5]), 150_000_000n * unit);
  assert.equal(await f.token.balanceOf(await f.founder.getAddress()), 0n);
  assert.equal(await f.token.balanceOf(await f.investor.getAddress()), 0n);
  assert.equal(await f.token.totalSupply(), supply);
});
test('just-before-month boundaries and catch-up are deterministic and never duplicate release', async t => {
  const f = await fixture(t);
  await f.at(f.times[5] - 5);
  assert.equal(await f.founder.currentMonth(), 5n);
  const receipt = await wait(f.founder.connect(f.actors[6]).release());
  assert.equal(receipt.status, 1);
  assert.equal(await f.token.balanceOf(f.addresses[4]), BigInt(vestingSchedule[4].teamCumulative) * unit);
  await assert.rejects(f.founder.release());
  await f.at(f.times[5]);
  await wait(f.founder.release());
  assert.equal(await f.token.balanceOf(f.addresses[4]), BigInt(vestingSchedule[5].teamCumulative) * unit);
});
test('app purchase atomically delivers released tokens and routes 100% principal plus separate USDC fee', async t => {
  const f = await fixture(t); await openSale(f);
  const before = await f.usdc.balanceOf(f.addresses[1]);
  const receipt = await wait(f.sale.connect(f.actors[1]).buy(100n, 100n * price + fee, id('purchase')));
  assert.equal(receipt.status, 1);
  assert.equal(await f.usdc.balanceOf(f.addresses[2]), 100n * price);
  assert.equal(await f.usdc.balanceOf(f.addresses[3]), fee);
  assert.equal(before - await f.usdc.balanceOf(f.addresses[1]), 100n * price + fee);
  assert.equal(await f.token.balanceOf(f.addresses[1]), 100n * unit);
  assert.equal(await f.token.totalSupply(), supply);
  const events = receipt.logs.filter(log => log.address.toLowerCase() === (f.sale.target).toLowerCase()).map(log => f.sale.interface.parseLog(log));
  assert.equal(events.filter(e => e.name === 'PrimaryPurchase').length, 1);
  assert.equal(events[0].args.principalUsdc, 100n * price);
  assert.equal(events[0].args.feeUsdc, fee);
});
test('retry rejects same buyer/operation and cannot charge or deliver twice', async t => {
  const f = await fixture(t); await openSale(f);
  const op = id('unique-operation');
  await wait(f.sale.connect(f.actors[1]).buy(10n, 10n * price + fee, op));
  await assert.rejects(f.sale.connect(f.actors[1]).buy(10n, 10n * price + fee, op));
  assert.equal(await f.usdc.balanceOf(f.addresses[2]), 10n * price);
  assert.equal(await f.usdc.balanceOf(f.addresses[3]), fee);
  assert.equal(await f.sale.sold(), 10n * unit);
});
test('payment failure rolls back principal, token inventory and operation ID, allowing a safe retry', async t => {
  const f = await fixture(t); await openSale(f);
  const op = id('rollback');
  await wait(f.usdc.setBlocked(f.addresses[3], true));
  await assert.rejects(f.sale.connect(f.actors[1]).buy(10n, 10n * price + fee, op));
  assert.equal(await f.usdc.balanceOf(f.addresses[2]), 0n);
  assert.equal(await f.token.balanceOf(f.addresses[1]), 0n);
  assert.equal(await f.sale.sold(), 0n);
  assert.equal(await f.sale.processed(f.addresses[1], op), false);
  await wait(f.usdc.setBlocked(f.addresses[3], false));
  await wait(f.sale.connect(f.actors[1]).buy(10n, 10n * price + fee, op));
  assert.equal(await f.usdc.balanceOf(f.addresses[3]), fee);
});
test('unreleased inventory, zero quantity and insufficient spending ceiling are rejected', async t => {
  const f = await fixture(t); await openSale(f);
  const maximumAvailable = await f.sale.releasedGroups() * 13n;
  await assert.rejects(f.sale.connect(f.actors[1]).buy(maximumAvailable + 1n, MaxUint256, id('excess')));
  await assert.rejects(f.sale.connect(f.actors[1]).buy(0n, MaxUint256, id('zero')));
  await assert.rejects(f.sale.connect(f.actors[1]).buy(1n, price + fee - 1n, id('ceiling')));
  assert.equal(await f.sale.sold(), 0n);
});
test('only administrator controls sale pause; ownership handoff needs acceptance', async t => {
  const f = await fixture(t); await openSale(f);
  await assert.rejects(f.sale.connect(f.actors[1]).pause());
  await wait(f.sale.pause());
  await assert.rejects(f.sale.connect(f.actors[1]).buy(1n, price + fee, id('paused')));
  await wait(f.sale.transferOwnership(f.addresses[6]));
  assert.equal(await f.sale.owner(), f.addresses[0]);
  await assert.rejects(f.sale.connect(f.actors[1]).acceptOwnership());
  await wait(f.sale.connect(f.actors[6]).acceptOwnership());
  assert.equal(await f.sale.owner(), f.addresses[6]);
  await assert.rejects(f.sale.unpause());
  await wait(f.sale.connect(f.actors[6]).unpause());
  await assert.rejects(f.sale.connect(f.actors[6]).renounceOwnership());
});
test('a callback during USDC payment cannot reenter, consume inventory or create a second fee', async t => {
  const f = await fixture(t, 'local', 'ReentrantMockUSDC'); await openSale(f);
  await wait(f.usdc.setTarget(await f.sale.getAddress()));
  await wait(f.sale.connect(f.actors[1]).buy(10n, 10n * price + fee, id('guarded-callback')));
  assert.equal(await f.usdc.attempted(), true);
  assert.equal(await f.usdc.reentryBlocked(), true);
  assert.equal(await f.sale.sold(), 10n * unit);
  assert.equal(await f.usdc.balanceOf(f.addresses[2]), 10n * price);
  assert.equal(await f.usdc.balanceOf(f.addresses[3]), fee);
});
test('operation IDs are buyer-scoped: another buyer cannot occupy or replay the first buyer intent', async t => {
  const f = await fixture(t); await openSale(f);
  const op = id('buyer-scoped');
  await wait(f.usdc.mint(f.addresses[6], 100n * price + fee));
  await wait(f.usdc.connect(f.actors[6]).approve(await f.sale.getAddress(), MaxUint256));
  await wait(f.sale.connect(f.actors[6]).buy(10n, 10n * price + fee, op));
  await wait(f.sale.connect(f.actors[1]).buy(10n, 10n * price + fee, op));
  assert.equal(await f.sale.sold(), 20n * unit);
  assert.equal(await f.usdc.balanceOf(f.addresses[3]), 2n * fee);
  assert.equal(await f.sale.processed(f.addresses[1], op), true);
  assert.equal(await f.sale.processed(f.addresses[6], op), true);
});
test('direct channel requires BOTH administration and exact revocable buyer authorization; no app fee', async t => {
  const f = await fixture(t); await openSale(f);
  const op = id('broker');
  await assert.rejects(f.sale.sellDirect(f.addresses[1], 20n, 20n * price, op));
  await wait(f.sale.connect(f.actors[1]).authorizeDirect(20n, 20n * price, op));
  await assert.rejects(f.sale.connect(f.actors[6]).sellDirect(f.addresses[1], 20n, 20n * price, op));
  await assert.rejects(f.sale.sellDirect(f.addresses[1], 21n, 21n * price, op));
  await wait(f.sale.connect(f.actors[1]).revokeDirect(op));
  await assert.rejects(f.sale.sellDirect(f.addresses[1], 20n, 20n * price, op));
  await wait(f.sale.connect(f.actors[1]).authorizeDirect(20n, 20n * price, op));
  await wait(f.sale.sellDirect(f.addresses[1], 20n, 20n * price, op));
  assert.equal(await f.usdc.balanceOf(f.addresses[2]), 20n * price);
  assert.equal(await f.usdc.balanceOf(f.addresses[3]), 0n);
  assert.equal(await f.token.balanceOf(f.addresses[1]), 20n * unit);
  assert.equal(await f.sale.directIntent(f.addresses[1], op), '0x' + '0'.repeat(64));
});
test('personal transfers remain free outside app and burning permanently reduces supply', async t => {
  const f = await fixture(t); await openSale(f);
  await wait(f.sale.connect(f.actors[1]).buy(100n, 100n * price + fee, id('free-transfer')));
  await wait(f.sale.pause());
  await wait(f.token.connect(f.actors[1]).transfer(f.addresses[6], 10n * unit));
  assert.equal(await f.token.balanceOf(f.addresses[6]), 10n * unit);
  assert.equal(await f.usdc.balanceOf(f.addresses[3]), fee);
  await assert.rejects(f.token.connect(f.actors[0]).burnFrom(f.addresses[1], 1n * unit));
  await wait(f.token.connect(f.actors[1]).burn(5n * unit));
  assert.equal(await f.token.totalSupply(), supply - 5n * unit);
});
test('constructor rejects redirected allocations, invalid calendar and identical treasury/fee wallets', async t => {
  const f = await fixture(t);
  const invalidDestinations = [...f.args]; invalidDestinations[1] = invalidDestinations[0];
  await assert.rejects(deploy('BettexTestToken', f.actors[0], invalidDestinations));
  const invalidTreasury = [...f.args]; invalidTreasury[3] = invalidTreasury[2];
  await assert.rejects(deploy('BettexTestToken', f.actors[0], invalidTreasury));
  const invalidSchedule = [...f.args]; invalidSchedule[7] = [...f.times]; invalidSchedule[7][2] = f.times[1];
  await assert.rejects(deploy('BettexTestToken', f.actors[0], invalidSchedule));
  const zeroPrice = [...f.args]; zeroPrice[6] = 0n;
  await assert.rejects(deploy('BettexTestToken', f.actors[0], zeroPrice));
  const pastSchedule = [...f.args];
  pastSchedule[7] = monthlyTimes((await f.provider.getBlock('latest')).timestamp - 365 * 86400);
  await assert.rejects(deploy('BettexTestToken', f.actors[0], pastSchedule));
});
test('closed pool rejects unregistered/revoked payers and unauthorized recipient changes', async t => {
  const f = await fixture(t); await openSale(f);
  await wait(f.sale.revokeBuyer(f.addresses[1]));
  await assert.rejects(f.sale.connect(f.actors[1]).buy(10n, 10n * price + fee, id('revoked')));
  await assert.rejects(f.sale.connect(f.actors[1]).authorizeBuyer(f.addresses[1], f.addresses[1]));
  await wait(f.sale.authorizeBuyer(f.addresses[1], f.addresses[6]));
  await assert.rejects(f.sale.connect(f.actors[1]).buyTo(f.addresses[1], 10n, 10n * price + fee, id('wrong-destination')));
  assert.equal(await f.sale.sold(), 0n);
});
test('two-wallet purchase debits USDC payer and delivers BETTEX only to the approved recipient', async t => {
  const f = await fixture(t); await openSale(f);
  await wait(f.sale.authorizeBuyer(f.addresses[1], f.addresses[6]));
  const before = await f.usdc.balanceOf(f.addresses[1]);
  const receipt = await wait(f.sale.connect(f.actors[1]).buyTo(f.addresses[6], 10n, 10n * price + fee, id('two-wallets')));
  assert.equal(receipt.status, 1);
  assert.equal(before - await f.usdc.balanceOf(f.addresses[1]), 10n * price + fee);
  assert.equal(await f.token.balanceOf(f.addresses[1]), 0n);
  assert.equal(await f.token.balanceOf(f.addresses[6]), 10n * unit);
  const snapshot = await f.sale.inventory();
  assert.equal(snapshot.total, 650_000_000n * unit);
  assert.equal(snapshot.locked + snapshot.released, snapshot.total);
  assert.equal(snapshot.soldUnits, 10n * unit);
  assert.equal(snapshot.available + snapshot.soldUnits, snapshot.released);
  const purchase = receipt.logs.map(log => { try { return f.sale.interface.parseLog(log); } catch { return null; } }).find(e => e?.name === 'PrimaryPurchase');
  assert.equal(purchase.args.recipient, f.addresses[6]);
});
