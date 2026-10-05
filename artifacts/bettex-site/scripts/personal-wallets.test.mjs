import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Interface, Transaction } from 'ethers';

const directory = await mkdtemp(path.join(tmpdir(), 'bettex-wallet-test-'));
const outfile = path.join(directory, 'vault.mjs');
await build({ entryPoints: ['src/components/account/wallet-vault.ts'], bundle: true,
  platform: 'node', format: 'esm', outfile });
const { generatePersonalWallets, reencryptVault, exportPersonalWallet, signPersonalTestWithdrawal } = await import(pathToFileURL(outfile).href);
const password = 'test-only-password-long';
const secondPassword = 'test-only-changed-password';
const first = await generatePersonalWallets(password);
const second = await generatePersonalWallets(password);
test.after(async () => { await rm(directory, { recursive: true, force: true }); });

test('two purposes use distinct random addresses and public keys', () => {
  assert.equal(first.wallets.length, 2);
  assert.notEqual(first.wallets[0].address, first.wallets[1].address);
  assert.notEqual(first.wallets[0].publicKey, first.wallets[1].publicKey);
  assert.notEqual(first.wallets[0].address, second.wallets[0].address);
  assert.deepEqual(first.wallets.map(w => w.chainIds), [[421614], [421614]]);
});
test('serialized signup contains only public metadata and authenticated ciphertext', () => {
  const serialized = JSON.stringify(first);
  assert.equal(serialized.includes('privateKey'), false);
  assert.equal(serialized.includes('mnemonic'), false);
  assert.equal(serialized.includes(password), false);
  assert.equal(Buffer.from(first.vault.salt, 'base64').length, 32);
  assert.equal(Buffer.from(first.vault.iv, 'base64').length, 12);
});
test('incorrect password cannot unlock wallet', async () => {
  await assert.rejects(exportPersonalWallet(first.vault, first.wallets, 'wrong-password', first.wallets[0].id, 'reveal'),
    { message: 'vault_unlock_failed' });
});
test('ciphertext tampering is rejected without disclosing private material', async () => {
  const bytes = Buffer.from(first.vault.ciphertext, 'base64');
  bytes[0] ^= 1;
  await assert.rejects(exportPersonalWallet({ ...first.vault, ciphertext: bytes.toString('base64') },
    first.wallets, password, first.wallets[0].id, 'reveal'), { message: 'vault_unlock_failed' });
});
test('vault cannot be transplanted to a different registration or public wallet', async () => {
  await assert.rejects(exportPersonalWallet({ ...first.vault, registrationId: second.registrationId },
    first.wallets, password, first.wallets[0].id, 'reveal'), { message: 'vault_unlock_failed' });
  await assert.rejects(exportPersonalWallet(first.vault, second.wallets, password, second.wallets[0].id, 'reveal'),
    { message: 'vault_unlock_failed' });
});
test('changing password preserves both keys and addresses and rejects old password', async () => {
  const next = await reencryptVault(first.vault, first.wallets, password, secondPassword);
  assert.notEqual(next.iv, first.vault.iv);
  assert.notEqual(next.salt, first.vault.salt);
  for (const wallet of first.wallets) {
    const original = await exportPersonalWallet(first.vault, first.wallets, password, wallet.id, 'reveal');
    const changed = await exportPersonalWallet(next, first.wallets, secondPassword, wallet.id, 'reveal');
    // Only compare in memory; neither assertions nor test output print keys.
    assert.ok(original === changed, 'same private material');
  }
  await assert.rejects(exportPersonalWallet(next, first.wallets, password, first.wallets[0].id, 'reveal'),
    { message: 'vault_unlock_failed' });
});
const erc = new Interface(['function approve(address,uint256) returns(bool)']);
const service = new Interface(['function withdraw(address,address,uint256,bytes32)']);
const intent = { asset: 'BETTEX', destination: '0x' + '1'.repeat(40), units: '1000000000000000000',
  executor: '0x' + '2'.repeat(40), deposit: first.wallets[0].address, holder: first.wallets[1].address,
  usdc: '0x' + '3'.repeat(40), token: '0x' + '4'.repeat(40), fee: '2500000', operationId: '0x' + 'a'.repeat(64) };
const sign = (draft, expected) => signPersonalTestWithdrawal(first.vault, first.wallets, password, draft, expected);
const approval = (token, amount) => ({ chainId: 31337, nonce: 0, value: '0', gasLimit: '120000',
  gasPrice: '1000000000', to: token, data: erc.encodeFunctionData('approve', [intent.executor, amount]) });
test('restricted withdrawal approvals use the correct personal wallet and exact spending limits', async () => {
  const holder = Transaction.from(await sign(approval(intent.token, intent.units), { ...intent, stage: 'approve-bettex-withdraw' }));
  const deposit = Transaction.from(await sign(approval(intent.usdc, intent.fee), { ...intent, stage: 'approve-usdc-withdraw' }));
  assert.equal(holder.from, intent.holder);
  assert.equal(deposit.from, intent.deposit);
  assert.equal(holder.chainId, 31337n);
});
test('withdrawal signing rejects public chains, inflated approvals, changed wallet/fee or excessive gas', async () => {
  const draft = approval(intent.usdc, intent.fee), expected = { ...intent, stage: 'approve-usdc-withdraw' };
  for (const changed of [{ ...draft, chainId: 421614 }, { ...draft, chainId: 42161 },
    { ...draft, gasLimit: '1000001' }, { ...draft, gasPrice: '3000000000000' },
    approval(intent.usdc, '2500001')]) await assert.rejects(sign(changed, expected), /transaction_mismatch/);
  for (const changed of [{ ...expected, fee: '2500001' }, { ...expected, deposit: second.wallets[0].address }]) {
    await assert.rejects(sign(draft, changed), /transaction_mismatch/);
  }
});
test('final withdrawal signature binds exact asset, amount, recipient and immutable identifier', async () => {
  const expected = { ...intent, stage: 'withdraw' };
  const draft = { ...approval(intent.usdc, intent.fee), to: intent.executor,
    data: service.encodeFunctionData('withdraw', [intent.token, intent.destination, intent.units, intent.operationId]) };
  assert.equal(Transaction.from(await sign(draft, expected)).from, intent.deposit);
  for (const changed of [{ ...expected, destination: '0x' + 'b'.repeat(40) },
    { ...expected, units: '2' }, { ...expected, operationId: '0x' + 'c'.repeat(64) }]) {
    await assert.rejects(sign(draft, changed), /transaction_mismatch/);
  }
});
