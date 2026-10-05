import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const directory = await mkdtemp(path.join(tmpdir(), 'bettex-wallet-test-'));
const outfile = path.join(directory, 'vault.mjs');
await build({ entryPoints: ['src/components/account/wallet-vault.ts'], bundle: true,
  platform: 'node', format: 'esm', outfile });
const { generatePersonalWallets, reencryptVault, exportPersonalWallet } = await import(pathToFileURL(outfile).href);
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
