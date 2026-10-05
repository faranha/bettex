/** Browser-only personal key handling. No providers, RPC calls or server signing. */
import { Wallet, Interface } from 'ethers';
import type { PersonalTestWallet, WalletVaultEnvelope, NativeTestTransaction } from '@workspace/api-client-react';

type SecretWallet = { id: string; privateKey: string };
const rounds = 600000;
const encoder = new TextEncoder();
const encode64 = (bytes: Uint8Array) => btoa(Array.from(bytes, n => String.fromCharCode(n)).join(''));
function decode64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function aad(registrationId: string) {
  return encoder.encode(`BETTEX.personal-vault.v1:${registrationId}`);
}
async function derive(password: string, salt: Uint8Array<ArrayBuffer>) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: rounds, hash: 'SHA-256' }, material,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function seal(secrets: SecretWallet[], password: string, registrationId: string): Promise<WalletVaultEnvelope> {
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = encoder.encode(JSON.stringify(secrets));
  try {
    const key = await derive(password, salt);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad(registrationId) }, key, plain);
    return { version: 1, iterations: rounds, salt: encode64(salt), iv: encode64(iv),
      ciphertext: encode64(new Uint8Array(encrypted)), registrationId };
  } finally { plain.fill(0); }
}
async function open(vault: WalletVaultEnvelope, password: string, wallets: PersonalTestWallet[]): Promise<SecretWallet[]> {
  if (vault.version !== 1 || vault.iterations !== rounds || decode64(vault.iv).length !== 12
    || decode64(vault.salt).length !== 32 || wallets.length !== 2) throw new Error('vault_invalid');
  let plain: Uint8Array | undefined;
  try {
    const key = await derive(password, decode64(vault.salt));
    plain = new Uint8Array(await crypto.subtle.decrypt({
      name: 'AES-GCM', iv: decode64(vault.iv), additionalData: aad(vault.registrationId),
    }, key, decode64(vault.ciphertext)));
    const secrets: SecretWallet[] = JSON.parse(new TextDecoder().decode(plain));
    if (!Array.isArray(secrets) || secrets.length !== wallets.length) throw new Error('vault_invalid');
    for (const publicWallet of wallets) {
      const secret = secrets.find(w => w.id === publicWallet.id);
      if (!secret || !/^0x[0-9a-f]{64}$/i.test(secret.privateKey)) throw new Error('vault_invalid');
      const wallet = new Wallet(secret.privateKey);
      if (wallet.address !== publicWallet.address || wallet.signingKey.publicKey !== publicWallet.publicKey) {
        throw new Error('vault_invalid');
      }
    }
    return secrets;
  } catch { throw new Error('vault_unlock_failed'); }
  finally { plain?.fill(0); }
}
export async function generatePersonalWallets(password: string) {
  if (!crypto?.subtle) throw new Error('secure_browser_required');
  const registrationId = crypto.randomUUID();
  const wallets: PersonalTestWallet[] = [];
  const secrets: SecretWallet[] = [];
  for (const purpose of ['deposits', 'bettex'] as const) {
    const wallet = Wallet.createRandom();
    const id = crypto.randomUUID();
    wallets.push({ id, purpose, address: wallet.address, publicKey: wallet.signingKey.publicKey, chainIds: [421614] });
    // Only the independent private key is retained, not the temporary mnemonic.
    secrets.push({ id, privateKey: wallet.privateKey });
  }
  try {
    return { registrationId, wallets, vault: await seal(secrets, password, registrationId) };
  } finally { secrets.splice(0); }
}
export async function reencryptVault(vault: WalletVaultEnvelope, wallets: PersonalTestWallet[], current: string, next: string) {
  const secrets = await open(vault, current, wallets);
  try { return await seal(secrets, next, vault.registrationId); }
  finally { secrets.splice(0); }
}
export type PrivateWalletAction = 'reveal' | 'copy' | 'private-download' | 'encrypted-backup';
export async function exportPersonalWallet(vault: WalletVaultEnvelope, wallets: PersonalTestWallet[],
  password: string, walletId: string, action: PrivateWalletAction, signal?: AbortSignal): Promise<string | null> {
  const secrets = await open(vault, password, wallets);
  try {
    if (signal?.aborted) throw new Error('operation_cancelled');
    const secret = secrets.find(w => w.id === walletId);
    if (!secret) throw new Error('vault_invalid');
    if (action === 'reveal') return secret.privateKey;
    if (action === 'copy') {
      await navigator.clipboard.writeText(secret.privateKey);
      return null;
    }
    const wallet = new Wallet(secret.privateKey);
    // Standard Ethereum JSON Keystore V3. Encryption stays in this browser.
    const content = action === 'encrypted-backup' ? await wallet.encrypt(password) : secret.privateKey;
    if (signal?.aborted) throw new Error('operation_cancelled');
    downloadFile(content, `bettex-${wallet.address}-${action === 'encrypted-backup' ? 'encrypted.json' : 'private.txt'}`,
      action === 'encrypted-backup' ? 'application/json' : 'text/plain');
    return null;
  } finally { secrets.splice(0); }
}
export function downloadFile(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Exact-purpose signing only. Never returns private material to callers/server. */
export async function signPersonalTestPurchase(vault: WalletVaultEnvelope, wallets: PersonalTestWallet[],
  password: string, draft: NativeTestTransaction, intent: {
    stage: 'approve' | 'buy'; sale: string; usdc: string; quantity: string; total: string; operationId: string;
  }): Promise<string> {
  const deposit = wallets.find(w => w.purpose === 'deposits');
  const holder = wallets.find(w => w.purpose === 'bettex');
  if (!deposit || !holder || draft.chainId !== 31337 || BigInt(draft.value) !== 0n
    || BigInt(draft.gasLimit) > 1_000_000n || BigInt(draft.gasPrice) * BigInt(draft.gasLimit) > 3_000_000_000_000_000n) {
    throw new Error('transaction_mismatch');
  }
  const erc = new Interface(['function approve(address,uint256) returns(bool)']);
  const sale = new Interface(['function buyTo(address,uint256,uint256,bytes32)']);
  if (intent.stage === 'approve') {
    const parsed = erc.parseTransaction({ data: draft.data });
    if (draft.to.toLowerCase() !== intent.usdc.toLowerCase() || !parsed
      || String(parsed.args[0]).toLowerCase() !== intent.sale.toLowerCase()
      || String(parsed.args[1]) !== intent.total) throw new Error('transaction_mismatch');
  } else {
    const parsed = sale.parseTransaction({ data: draft.data });
    if (draft.to.toLowerCase() !== intent.sale.toLowerCase() || !parsed
      || String(parsed.args[0]).toLowerCase() !== holder.address.toLowerCase()
      || String(parsed.args[1]) !== intent.quantity || String(parsed.args[2]) !== intent.total
      || String(parsed.args[3]) !== intent.operationId) throw new Error('transaction_mismatch');
  }
  const secrets = await open(vault, password, wallets);
  try {
    const secret = secrets.find(w => w.id === deposit.id);
    if (!secret) throw new Error('vault_invalid');
    const signer = new Wallet(secret.privateKey);
    return await signer.signTransaction({ ...draft, type: 0 });
  } finally { secrets.splice(0); }
}
