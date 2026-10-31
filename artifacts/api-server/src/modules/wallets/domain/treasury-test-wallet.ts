export const TREASURY_WALLET_PURPOSES = ["operational", "reserve", "buyback", "crypto_agent"] as const;
export type TreasuryWalletPurpose = typeof TREASURY_WALLET_PURPOSES[number];
export type TestKeyEnvelope = { version: 1; iv: string; tag: string; ciphertext: string };
