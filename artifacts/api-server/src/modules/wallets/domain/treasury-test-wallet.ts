import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { Wallet } from "ethers";

export const TREASURY_WALLET_PURPOSES = ["operational", "reserve", "buyback", "crypto_agent"] as const;
export type TreasuryWalletPurpose = typeof TREASURY_WALLET_PURPOSES[number];
export type TestKeyEnvelope = { version: 1; iv: string; tag: string; ciphertext: string };

/** Existing app secret is used only by server runtime, never returned or logged.
 * Domain separation and AAD bind each encrypted test key to its public identity.
 * This does not authorize signing or receiving real funds. */
export function sealTreasuryTestKey(privateKey: string, purpose: TreasuryWalletPurpose, address: string, secret: string): TestKeyEnvelope {
  if (!secret || secret.length < 16) throw new Error("treasury_wallet_encryption_unavailable");
  const key = createHash("sha256").update("bettex:treasury-test-vault:v1\0").update(secret).digest();
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(`${purpose}:${address.toLowerCase()}`));
  const ciphertext = Buffer.concat([cipher.update(privateKey, "utf8"), cipher.final()]);
  return { version: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") };
}

export function createTreasuryTestWallet(purpose: TreasuryWalletPurpose, secret: string) {
  if (!secret || secret.length < 16) throw new Error("treasury_wallet_encryption_unavailable");
  const wallet = Wallet.createRandom();
  return {
    id: `treasury-test-${purpose}`, purpose, address: wallet.address,
    keyEnvelope: sealTreasuryTestKey(wallet.privateKey, purpose, wallet.address, secret),
  };
}
