import type { PersonalTestWallet, WalletVaultEnvelope } from '@workspace/api-client-react';
import { demoTabToken } from '@/lib/demo-tab-session';

export type LocalWalletVault = {
  owner: string;
  registrationId: string;
  wallets: PersonalTestWallet[];
  vault: WalletVaultEnvelope;
};

export async function localWalletOwner(accountId: string) {
  const token = await demoTabToken();
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${accountId}:${token}`));
  return Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('');
}

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('bettex-protected-wallets', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('vaults', { keyPath: 'owner' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('wallet_storage_unavailable'));
    request.onblocked = () => reject(new Error('wallet_storage_unavailable'));
  });
}

export async function readLocalWalletVault(owner: string): Promise<LocalWalletVault | undefined> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('vaults', 'readonly').objectStore('vaults').get(owner);
      request.onsuccess = () => {
        const value = request.result as LocalWalletVault | undefined;
        if (value && (value.owner !== owner || value.vault?.registrationId !== value.registrationId ||
          value.vault?.version !== 1 || typeof value.vault.ciphertext !== 'string' ||
          !Array.isArray(value.wallets) || value.wallets.length !== 2 ||
          !value.wallets.every(w => w && typeof w.id === 'string' && w.id.length > 0 &&
            ['deposits', 'bettex'].includes(w.purpose) && /^0x[0-9a-f]{40}$/i.test(w.address) &&
            /^0x04[0-9a-f]{128}$/i.test(w.publicKey)) ||
          new Set(value.wallets.map(w => w.purpose)).size !== 2 ||
          new Set(value.wallets.map(w => w.id)).size !== 2 ||
          new Set(value.wallets.map(w => w.address.toLowerCase())).size !== 2)) {
          reject(new Error('wallet_storage_invalid'));
        } else resolve(value);
      };
      request.onerror = () => reject(new Error('wallet_storage_unavailable'));
    });
  } finally { db.close(); }
}

/** Insert-only: never replace existing keys, even if setup races in two views. */
export async function saveNewLocalWalletVault(value: LocalWalletVault) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('vaults', 'readwrite');
      tx.objectStore('vaults').add(value);
      tx.oncomplete = () => resolve();
      tx.onabort = tx.onerror = () => reject(new Error('wallet_storage_write_failed'));
    });
  } finally { db.close(); }
}
