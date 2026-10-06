/** Device-encrypted personal wallets. No separate wallet password or server key custody. */
import { Wallet } from 'ethers';
import type { PersonalTestWallet } from '@workspace/api-client-react';
import { localWalletOwner, readLocalWalletVault } from './local-wallet-store';

type DeviceWallets = {
  owner: string;
  wallets: PersonalTestWallet[];
  key: CryptoKey;
  iv: Uint8Array<ArrayBuffer>;
  ciphertext: ArrayBuffer;
};

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('bettex-device-wallets', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('wallets', { keyPath: 'owner' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = request.onblocked = () => reject(new Error('wallet_storage_unavailable'));
  });
}

async function read(owner: string): Promise<DeviceWallets | undefined> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('wallets').objectStore('wallets').get(owner);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('wallet_storage_unavailable'));
    });
  } finally { db.close(); }
}

const pending = new Map<string, Promise<PersonalTestWallet[]>>();

/** Existing password-protected wallets always take precedence; never replace their keys. */
export async function accountDeviceWallets(accountId: string): Promise<PersonalTestWallet[]> {
  const owner = await localWalletOwner(accountId);
  const previous = await readLocalWalletVault(owner);
  if (previous) return previous.wallets;
  const running = pending.get(owner);
  if (running) return running;
  const operation = createOrRead(owner);
  pending.set(owner, operation);
  try { return await operation; } finally { pending.delete(owner); }
}

async function createOrRead(owner: string): Promise<PersonalTestWallet[]> {
  const existing = await read(owner);
  if (existing) return existing.wallets;
  const wallets: PersonalTestWallet[] = [];
  const secrets: { id: string; privateKey: string }[] = [];
  for (const purpose of ['deposits', 'bettex'] as const) {
    const wallet = Wallet.createRandom();
    const id = crypto.randomUUID();
    wallets.push({ id, purpose, address: wallet.address, publicKey: wallet.signingKey.publicKey, chainIds: [421614] });
    secrets.push({ id, privateKey: wallet.privateKey });
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(secrets));
  let ciphertext: ArrayBuffer;
  try {
    ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(owner) }, key, plain);
  } finally { plain.fill(0); secrets.splice(0); }
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('wallets', 'readwrite');
      tx.objectStore('wallets').add({ owner, wallets, key, iv, ciphertext } satisfies DeviceWallets);
      tx.oncomplete = () => resolve();
      tx.onabort = tx.onerror = () => reject(new Error('wallet_storage_write_failed'));
    });
    return wallets;
  } catch (error) {
    // Another view may have won the insert. Read it rather than replacing its keys.
    const winner = await read(owner);
    if (winner) return winner.wallets;
    throw error;
  } finally { db.close(); }
}

export async function revealDeviceWallet(accountId: string, walletId: string): Promise<string> {
  const owner = await localWalletOwner(accountId);
  if (await readLocalWalletVault(owner)) throw new Error('existing_wallet_password_required');
  const record = await read(owner);
  const wallet = record?.wallets.find(w => w.id === walletId);
  if (!record || record.owner !== owner || !wallet) throw new Error('wallet_unavailable');
  const plain = new Uint8Array(await crypto.subtle.decrypt({
    name: 'AES-GCM', iv: record.iv, additionalData: new TextEncoder().encode(owner),
  }, record.key, record.ciphertext));
  try {
    const secrets: { id: string; privateKey: string }[] = JSON.parse(new TextDecoder().decode(plain));
    const secret = secrets.find(w => w.id === walletId);
    if (!secret) throw new Error('wallet_invalid');
    const signer = new Wallet(secret.privateKey);
    if (signer.address !== wallet.address || signer.signingKey.publicKey !== wallet.publicKey) throw new Error('wallet_invalid');
    return secret.privateKey;
  } finally { plain.fill(0); }
}
