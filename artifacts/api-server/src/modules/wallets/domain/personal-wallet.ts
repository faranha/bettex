export interface PersonalWalletDescriptor {
  id: string;
  purpose: "deposits" | "bettex";
  address: string;
  publicKey: string;
  chainIds: number[];
}
export const PERSONAL_TEST_CHAIN_ID = 421614;
export function validPersonalWalletSet(wallets: PersonalWalletDescriptor[], allowAcceptedLocal = false) {
  return wallets.length === 2
    && new Set(wallets.map(w => w.id)).size === 2
    && new Set(wallets.map(w => w.address.toLowerCase())).size === 2
    && new Set(wallets.map(w => w.publicKey.toLowerCase())).size === 2
    && new Set(wallets.map(w => w.purpose)).size === 2
    && wallets.every(w => ["deposits", "bettex"].includes(w.purpose)
      && (w.chainIds.length === 1 && w.chainIds[0] === PERSONAL_TEST_CHAIN_ID
        || allowAcceptedLocal && w.chainIds.length === 2 && w.chainIds.includes(PERSONAL_TEST_CHAIN_ID) && w.chainIds.includes(31337)));
}
