import test from 'node:test';
import assert from 'node:assert/strict';
import { network } from 'hardhat';
import { BrowserProvider, Contract, ContractFactory, id } from 'ethers';
import { compileContracts } from '../scripts/compile.mjs';

const artifacts = await compileContracts();
const wait = async tx => (await tx).wait();
async function fixture(t) {
  const connection = await network.create('local');
  const provider = new BrowserProvider(connection.provider, undefined, { cacheTimeout: -1 });
  t.after(async () => { provider.destroy(); await connection.close(); });
  const actors = await Promise.all(Array.from({ length: 7 }, (_, i) => provider.getSigner(i)));
  const addresses = await Promise.all(actors.map(s => s.getAddress()));
  const deploy = async (name, args = []) => {
    const a = artifacts[name];
    const c = await new ContractFactory(a.abi, a.bytecode, actors[0]).deploy(...args);
    await c.waitForDeployment(); return c;
  };
  const usdc = await deploy('MockUSDC');
  const start = (await provider.getBlock('latest')).timestamp + 60;
  const date = new Date(start * 1000);
  const times = Array.from({ length: 36 }, (_, i) => Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + i, 1) / 1000 + 86400 * 28);
  // Calendar validation needs first release in the future and a clamped day.
  for (let i = 0; i < 36; i++) {
    const month = date.getUTCMonth() + i;
    const day = Math.min(date.getUTCDate(), new Date(Date.UTC(date.getUTCFullYear(), month + 1, 0)).getUTCDate());
    times[i] = Date.UTC(date.getUTCFullYear(), month, day, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()) / 1000;
  }
  const token = await deploy('BettexGuardedTestToken', [addresses[4], addresses[5], addresses[2],
    addresses[3], addresses[0], await usdc.getAddress(), 50_000, times]);
  const sale = new Contract(await token.publicSale(), artifacts.BettexPrimarySale.abi, actors[0]);
  await wait(sale.authorizeBuyer(addresses[1], addresses[6]));
  await wait(usdc.mint(addresses[1], 50_000_000));
  await wait(usdc.connect(actors[1]).approve(await sale.getAddress(), 50_000_000));
  await wait(sale.unpause());
  await connection.provider.request({ method: 'evm_setNextBlockTimestamp', params: [times[0]] });
  await connection.provider.request({ method: 'evm_mine', params: [] });
  await wait(sale.connect(actors[1]).buyTo(addresses[6], 10, 3_000_000, id('purchase')));
  const service = await deploy('BettexTestWalletService', [await token.getAddress(), await usdc.getAddress(), await sale.getAddress(), addresses[3]]);
  const guard = await deploy('BettexTestDistributionGuard', [await token.getAddress(), await usdc.getAddress(), addresses[2], addresses[0]]);
  return { connection, provider, actors, addresses, usdc, token, service, guard };
}
test('USDC withdrawal delivers exact amount and fee once, with no treasury revenue', async t => {
  const f = await fixture(t), service = await f.service.getAddress(), payer = f.actors[1];
  const before = await f.usdc.balanceOf(f.addresses[1]);
  const treasuryBefore = await f.usdc.balanceOf(f.addresses[2]);
  const operatingBefore = await f.usdc.balanceOf(f.addresses[3]);
  await wait(f.usdc.connect(payer).approve(service, 3_500_000));
  await wait(f.service.connect(payer).withdraw(await f.usdc.getAddress(), f.addresses[4], 1_000_000, id('withdraw-usdc')));
  assert.equal(await f.usdc.balanceOf(f.addresses[4]), 1_000_000n);
  assert.equal(await f.usdc.balanceOf(f.addresses[1]), before - 3_500_000n);
  assert.equal(await f.usdc.balanceOf(f.addresses[3]), operatingBefore + 2_500_000n);
  assert.equal(await f.usdc.balanceOf(f.addresses[2]), treasuryBefore);
  assert.equal(await f.usdc.allowance(f.addresses[1], service), 0n);
  await assert.rejects(wait(f.service.connect(payer).withdraw(await f.usdc.getAddress(), f.addresses[4], 1_000_000, id('withdraw-usdc'))));
});
test('BETTEX transfer requires the bound holder approval and charges only USDC', async t => {
  const f = await fixture(t), service = await f.service.getAddress();
  await wait(f.usdc.connect(f.actors[1]).approve(service, 2_500_000));
  const operating = await f.usdc.balanceOf(f.addresses[3]);
  await assert.rejects(wait(f.service.connect(f.actors[1]).withdraw(await f.token.getAddress(), f.addresses[4], 1n * 10n ** 18n, id('send-token'))));
  assert.equal(await f.usdc.balanceOf(f.addresses[3]), operating, 'failed delivery rolls back fee');
  assert.equal(await f.service.completed(id('send-token')), false);
  await wait(f.token.connect(f.actors[6]).approve(service, 1n * 10n ** 18n));
  await wait(f.service.connect(f.actors[1]).withdraw(await f.token.getAddress(), f.addresses[4], 1n * 10n ** 18n, id('send-token')));
  assert.equal(await f.token.balanceOf(f.addresses[6]), 9n * 10n ** 18n);
  assert.equal(await f.token.exitNonce(f.addresses[6]), 1n);
  assert.equal(await f.usdc.balanceOf(f.addresses[3]), operating + 2_500_000n);
  await assert.rejects(wait(f.service.connect(f.actors[5]).withdraw(await f.token.getAddress(), f.addresses[4], 1, id('unauthorized'))));
});
test('failed USDC delivery rolls back fee, allowance consumption and identifier', async t => {
  const f = await fixture(t);
  await wait(f.usdc.connect(f.actors[1]).approve(await f.service.getAddress(), 3_500_000));
  await wait(f.usdc.setBlocked(f.addresses[4], true));
  const before = await f.usdc.balanceOf(f.addresses[1]);
  await assert.rejects(wait(f.service.connect(f.actors[1]).withdraw(await f.usdc.getAddress(), f.addresses[4], 1_000_000, id('blocked'))));
  assert.equal(await f.usdc.balanceOf(f.addresses[1]), before);
  assert.equal(await f.service.completed(id('blocked')), false);
  assert.equal(await f.usdc.allowance(f.addresses[1], await f.service.getAddress()), 3_500_000n);
});
test('atomic guard rejects outflow after snapshot even if tokens return before payout', async t => {
  const f = await fixture(t);
  const start = Math.floor((await f.provider.getBlock('latest')).timestamp / 86400) * 86400;
  await wait(f.usdc.mint(f.addresses[2], 1_000_000));
  const treasuryBefore = await f.usdc.balanceOf(f.addresses[2]);
  await wait(f.usdc.connect(f.actors[2]).approve(await f.guard.getAddress(), 1_000_000));
  await wait(f.guard.authorizeRound(start, 250_000));
  await wait(f.token.connect(f.actors[6]).transfer(f.addresses[4], 1n));
  await wait(f.token.connect(f.actors[4]).transfer(f.addresses[6], 1n));
  await assert.rejects(wait(f.guard.pay(id('invalidated'), start, f.addresses[6], f.addresses[1], 0, 250_000)));
  assert.equal(await f.guard.spent(start), 0n);
  assert.equal(await f.guard.used(id('invalidated')), false);
  assert.equal(await f.usdc.balanceOf(f.addresses[2]), treasuryBefore);
});
test('guard enforces round expiry, independent operator, budget and single payout', async t => {
  const f = await fixture(t);
  const start = Math.floor((await f.provider.getBlock('latest')).timestamp / 86400) * 86400;
  await wait(f.usdc.mint(f.addresses[2], 1_000_000));
  await wait(f.usdc.connect(f.actors[2]).approve(await f.guard.getAddress(), 1_000_000));
  await wait(f.guard.authorizeRound(start, 250_000));
  await assert.rejects(wait(f.guard.connect(f.actors[1]).pay(id('unauthorized'), start, f.addresses[6], f.addresses[1], 0, 1)));
  await wait(f.guard.pay(id('valid'), start, f.addresses[6], f.addresses[1], 0, 200_000));
  await assert.rejects(wait(f.guard.pay(id('valid'), start, f.addresses[6], f.addresses[1], 0, 200_000)));
  await assert.rejects(wait(f.guard.pay(id('excess'), start, f.addresses[6], f.addresses[1], 0, 50_001)));
  await f.connection.provider.request({ method: 'evm_setNextBlockTimestamp', params: [start + 86400] });
  await f.connection.provider.request({ method: 'evm_mine', params: [] });
  await assert.rejects(wait(f.guard.pay(id('expired'), start, f.addresses[6], f.addresses[1], 0, 50_000)));
});
