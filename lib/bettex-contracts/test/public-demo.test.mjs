import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { network } from 'hardhat';
import { BrowserProvider, ContractFactory, keccak256, toUtf8Bytes } from 'ethers';

const artifact = JSON.parse(readFileSync(new URL('../build/artifacts.json', import.meta.url))).contracts.BettexPublicDemo;
test('public demo registry records activity only for its operator; no custody or economic token', async () => {
  const connection = await network.create('local');
  const provider = new BrowserProvider(connection.provider);
  try {
    const owner = await provider.getSigner(0), outsider = await provider.getSigner(1);
    const registry = await new ContractFactory(artifact.abi, artifact.bytecode, owner).deploy();
    await registry.waitForDeployment();
    assert.equal(await registry.operator(), await owner.getAddress());
    assert.equal(await registry.APPLICATION(), keccak256(toUtf8Bytes('BETTEX_PUBLIC_DEMO_V1')));
    assert.equal(await registry.checkpoints(), 0n);
    await assert.rejects(registry.connect(outsider).checkpoint(keccak256(toUtf8Bytes('activity'))));
    await assert.rejects(registry.checkpoint(`0x${'0'.repeat(64)}`));
    const digest = keccak256(toUtf8Bytes('{"sessions":2,"movements":3}'));
    await (await registry.checkpoint(digest)).wait();
    assert.equal(await registry.checkpoints(), 1n);
    assert.equal(await registry.activityDigest(), digest);
    assert.ok(await registry.lastCheckpointAt() > 0n);
    assert.ok(!artifact.abi.some(entry => ['transfer', 'withdraw', 'mint'].includes(entry.name)));
  } finally { provider.destroy(); await connection.close(); }
});
test('public demo registry refuses an actual mainnet chain id', async () => {
  const connection = await network.create('forbidden');
  const provider = new BrowserProvider(connection.provider);
  try {
    await assert.rejects(new ContractFactory(artifact.abi, artifact.bytecode, await provider.getSigner()).deploy());
  } finally { provider.destroy(); await connection.close(); }
});
