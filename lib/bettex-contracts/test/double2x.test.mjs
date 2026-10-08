import test from 'node:test';
import assert from 'node:assert/strict';
import { network } from 'hardhat';
import { BrowserProvider, ContractFactory, MaxUint256, id, zeroPadValue, toBeHex } from 'ethers';
import { compileContracts } from '../scripts/compile.mjs';
const artifacts = await compileContracts();
const deploy = async (name, signer, args = []) => {
  const a = artifacts[name], c = await new ContractFactory(a.abi, a.bytecode, signer).deploy(...args);
  await c.waitForDeployment(); return c;
};
async function fixture(t) {
  const connection = await network.create('local');
  const provider = new BrowserProvider(connection.provider, undefined, { cacheTimeout: -1 });
  t.after(async () => { provider.destroy(); await connection.close(); });
  const operator = await provider.getSigner(0), attacker = await provider.getSigner(1);
  const treasury = await operator.getAddress(), oracleProvider = await attacker.getAddress();
  const token = await deploy('Double2XTestUSDC', operator, [treasury]);
  const entropy = await deploy('DoubleEntropyFixture', operator);
  const game = await deploy('BettexDouble2X', operator, [token.target, treasury, entropy.target, oracleProvider]);
  await (await token.approve(game.target, MaxUint256)).wait();
  return { provider, operator, attacker, treasury, oracleProvider, token, entropy, game };
}
test('public-game contract pays exactly 2x and reserves funds before randomness', async t => {
  const f = await fixture(t), player = id('winner'), request = id('red-win'), stake = 3_680_000n;
  const before = await f.token.balanceOf(f.treasury);
  await (await f.game.play(player, request, stake, 0, { value: 1 })).wait();
  assert.equal(await f.token.balanceOf(f.game.target), stake * 2n);
  assert.equal(await f.game.rewardBalance(player), 0n);
  await (await f.entropy.resolve(1, f.oracleProvider, zeroPadValue(toBeHex(0), 32))).wait();
  assert.equal((await f.game.plays(request)).status, 2n);
  assert.equal(await f.game.rewardBalance(player), stake * 2n);
  assert.equal(await f.token.balanceOf(f.treasury), before - stake * 2n);
});
test('loss sends the escrow to treasury, and duplicate request cannot place another bet', async t => {
  const f = await fixture(t), player = id('loser'), request = id('black-loss'), stake = 10_000_000n;
  const before = await f.token.balanceOf(f.treasury);
  await (await f.game.play(player, request, stake, 1, { value: 1 })).wait();
  await (await f.game.play(player, request, stake, 1, { value: 1 })).wait();
  assert.equal(await f.entropy.sequence(), 1n);
  await (await f.entropy.resolve(1, f.oracleProvider, zeroPadValue(toBeHex(0), 32))).wait();
  assert.equal((await f.game.plays(request)).status, 3n);
  assert.equal(await f.game.rewardBalance(player), 0n);
  assert.equal(await f.token.balanceOf(f.treasury), before);
  assert.equal(await f.token.balanceOf(f.game.target), 0n);
  await assert.rejects(f.game.play(player, request, stake + 1n, 1, { value: 1 }));
});
test('rolling 24-hour limit, repeated doubling, oracle authentication and both fair color outcomes', async t => {
  const f = await fixture(t), player = id('repeat');
  const stake = 1_000_000n;
  const first = await (await f.game.play(player, id('first'), stake, 1, { value: 1 })).wait();
  await assert.rejects(f.game.connect(f.attacker)._entropyCallback(1, f.oracleProvider, zeroPadValue(toBeHex(1), 32)));
  await assert.rejects(f.entropy.resolve(1, f.treasury, zeroPadValue(toBeHex(1), 32)));
  await (await f.entropy.resolve(1, f.oracleProvider, zeroPadValue(toBeHex(1), 32))).wait();
  assert.equal(await f.game.rewardBalance(player), stake * 2n);
  const firstBlock = await f.provider.getBlock(first.blockNumber);
  await f.provider.send('evm_setNextBlockTimestamp', [firstBlock.timestamp + 86399]);
  await f.provider.send('evm_mine', []);
  await assert.rejects(f.game.play.staticCall(player, id('too-soon'), stake * 2n, 0, { value: 1 }));
  await f.provider.send('evm_setNextBlockTimestamp', [firstBlock.timestamp + 86400]);
  await f.provider.send('evm_mine', []);
  await (await f.game.play(player, id('next'), stake * 2n, 0, { value: 1 })).wait();
  await (await f.entropy.resolve(2, f.oracleProvider, zeroPadValue(toBeHex(2), 32))).wait();
  assert.equal(await f.game.rewardBalance(player), stake * 4n);
  await assert.rejects(f.entropy.resolve(2, f.oracleProvider, zeroPadValue(toBeHex(3), 32)));
  await assert.rejects(f.game.connect(f.attacker).play(id('intruder'), id('unauthorized'), stake, 0, { value: 1 }));
});
