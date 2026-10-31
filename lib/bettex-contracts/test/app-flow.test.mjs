import test from 'node:test';
import assert from 'node:assert/strict';
import { network } from 'hardhat';
import { BrowserProvider, Contract, ContractFactory } from 'ethers';
import { build } from 'esbuild';
import { compileContracts } from '../scripts/compile.mjs';

const artifacts = await compileContracts();
async function bundle(file) {
  const output = await build({ entryPoints: [file], bundle: true, platform: 'node', format: 'esm', write: false });
  return import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
}
const { createTestContractReader, matchesContractRuntime } = await bundle('../../artifacts/api-server/src/modules/reconciliation/infrastructure/chain-reader.ts');
const { purchaseTestTokens } = await bundle('../../artifacts/bettex-site/src/components/demo/test-contract-purchase.ts');
const { testContractObservation } = await bundle('../../artifacts/api-server/src/modules/reconciliation/application/test-contracts.ts');
const usdcAddress = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d';
const governorAddress = '0x000000000000000000000000000000000000bEEF';
const wait = async tx => (await tx).wait();
async function deploy(name, signer, args = []) {
  const a = artifacts[name];
  const c = await new ContractFactory(a.abi, a.bytecode, signer).deploy(...args);
  await c.waitForDeployment(); return c;
}

test('application flow uses actual ephemeral EVM receipts; no public RPC, keys or funds', async t => {
  const local = await network.create('local');
  const localProvider = new BrowserProvider(local.provider, undefined, { cacheTimeout: -1 });
  const localGovernor = await deploy('LocalTestGovernor', await localProvider.getSigner());
  const governorCode = await localProvider.getCode(await localGovernor.getAddress());
  const simulatedSepolia = await network.create('sepoliaGuard');
  const provider = new BrowserProvider(simulatedSepolia.provider, undefined, { cacheTimeout: -1 });
  t.after(async () => { provider.destroy(); localProvider.destroy(); await local.close(); await simulatedSepolia.close(); });
  const actors = await Promise.all(Array.from({ length: 7 }, (_, i) => provider.getSigner(i)));
  const addresses = await Promise.all(actors.map(a => a.getAddress()));
  // Test harness state injection is impossible against the official public RPC.
  await simulatedSepolia.provider.request({ method: 'hardhat_setCode', params: [usdcAddress, artifacts.MockUSDC.runtime] });
  await simulatedSepolia.provider.request({ method: 'hardhat_setCode', params: [governorAddress, governorCode] });
  const start = (await provider.getBlock('latest')).timestamp + 200;
  const first = new Date(start * 1000);
  const times = Array.from({ length: 36 }, (_, i) => {
    const month = first.getUTCMonth() + i;
    const day = Math.min(first.getUTCDate(), new Date(Date.UTC(first.getUTCFullYear(), month + 1, 0)).getUTCDate());
    return Date.UTC(first.getUTCFullYear(), month, day, first.getUTCHours(), first.getUTCMinutes(), first.getUTCSeconds()) / 1000;
  });
  const token = await deploy('BettexTestToken', actors[0], [
    addresses[4], addresses[5], addresses[2], addresses[3], governorAddress, usdcAddress, 50_000, times,
  ]);
  const tokenAddress = await token.getAddress();
  const sale = new Contract(await token.publicSale(), artifacts.BettexPrimarySale.abi, actors[0]);
  const governor = new Contract(governorAddress, artifacts.LocalTestGovernor.abi, actors[0]);
  const stablecoin = new Contract(usdcAddress, artifacts.MockUSDC.abi, actors[0]);
  await wait(stablecoin.mint(addresses[1], 100_000_000));
  await wait(governor.execute(await sale.getAddress(), sale.interface.encodeFunctionData('authorizeBuyer', [addresses[1], addresses[6]])));
  await simulatedSepolia.provider.request({ method: 'evm_setNextBlockTimestamp', params: [times[0]] });
  await simulatedSepolia.provider.request({ method: 'evm_mine', params: [] });
  await wait(governor.execute(await sale.getAddress(), sale.interface.encodeFunctionData('unpause')));
  const reader = createTestContractReader(provider);
  const before = await reader.read(tokenAddress);
  assert.equal(before.state.chainId, 421614);
  assert.equal(before.state.configured, true);
  assert.equal(before.state.totalSupply, String(1_000_000_000n * 10n ** 18n));
  assert.equal(matchesContractRuntime(await provider.getCode(tokenAddress), 'BettexTestToken'), true);
  await assert.rejects(reader.read(usdcAddress));
  await assert.rejects(createTestContractReader(localProvider).read(tokenAddress));
  const bindings = new Map(), evidence = new Map();
  const store = {
    async addressFor(id) { return bindings.get(id) ?? null; },
    async link(id, address) { bindings.set(id, address); },
    async record(o) { for (const e of o.events) evidence.set(`${e.transactionHash}:${e.logIndex}:${e.blockHash}`, e); },
  };
  const observer = testContractObservation(store, reader);
  assert.equal((await observer.get('other-account')).configured, false);
  await observer.register('test-actor', tokenAddress);
  const size = evidence.size;
  await observer.get('test-actor');
  assert.equal(evidence.size, size);
  const memory = new Map();
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { locks: { request: async (_key, fn) => fn() } } });
  globalThis.localStorage = { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k) };
  globalThis.fetch = async () => new Response(JSON.stringify((await reader.read(tokenAddress)).state), { status: 200, headers: { 'content-type': 'application/json' } });
  let wrongNetwork = true, denyNextPurchase = false, submissions = 0;
  globalThis.window = { ethereum: { async request({ method, params }) {
    if (method === 'eth_chainId' && wrongNetwork) return '0xa4b1'; // Mainnet must abort before approval.
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [addresses[1]];
    if (method === 'eth_sendTransaction') {
      submissions++;
      const isPurchase = params?.[0]?.to?.toLowerCase() === sale.target.toLowerCase();
      const result = await simulatedSepolia.provider.request({ method, params });
      if (isPurchase && denyNextPurchase) { denyNextPurchase = false; throw new Error('simulated lost response after actual EVM execution'); }
      return result;
    }
    return simulatedSepolia.provider.request({ method, params });
  } } };
  await assert.rejects(purchaseTestTokens('test-actor', addresses[6], '10', () => {}), /wrong_network/);
  assert.equal(submissions, 0);
  wrongNetwork = false;
  denyNextPurchase = true;
  await assert.rejects(purchaseTestTokens('test-actor', addresses[6], '10', () => {}));
  const sent = submissions;
  assert.equal(await token.balanceOf(addresses[6]), 10n * 10n ** 18n);
  assert.equal(await stablecoin.balanceOf(addresses[2]), 500_000n);
  assert.equal(await stablecoin.balanceOf(addresses[3]), 2_500_000n);
  // Lost response is reconciled by the retained operation ID, never another payment.
  await purchaseTestTokens('test-actor', addresses[6], '10', () => {});
  assert.equal(submissions, sent);
  assert.equal(await sale.sold(), 10n * 10n ** 18n);
  assert.equal(memory.size, 0);
  const confirmed = await observer.get('test-actor');
  assert.equal(confirmed.events.filter(e => e.name === 'PrimaryPurchase').length, 1);
  assert.ok(confirmed.blockHash && confirmed.events[0].transactionHash);
});
