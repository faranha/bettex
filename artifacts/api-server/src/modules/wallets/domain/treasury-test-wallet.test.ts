import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createDecipheriv, createHash } from "node:crypto";
import { Wallet, getAddress } from "ethers";
import { TREASURY_WALLET_PURPOSES, createTreasuryTestWallet, sealTreasuryTestKey } from "./treasury-test-wallet.ts";

const secret = "test-fixture-only-not-an-application-secret";
test("Treasury and Crypto agent roles get distinct valid addresses and encrypted envelopes", () => {
  const rows = TREASURY_WALLET_PURPOSES.map(p => createTreasuryTestWallet(p, secret));
  assert.equal(new Set(rows.map(r => r.address)).size, 4);
  assert.ok(rows.every(r => getAddress(r.address) === r.address));
  assert.ok(rows.every(r => !Object.hasOwn(r, "privateKey") && r.keyEnvelope.ciphertext.length > 0));
});

test("authenticated encryption recovers the key but refuses another wallet identity", () => {
  const wallet = Wallet.createRandom();
  const envelope = sealTreasuryTestKey(wallet.privateKey, "reserve", wallet.address, secret);
  const key = createHash("sha256").update("bettex:treasury-test-vault:v1\0").update(secret).digest();
  const open = (purpose: string) => {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(envelope.iv, "base64"));
    decipher.setAAD(Buffer.from(`${purpose}:${wallet.address.toLowerCase()}`));
    decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, "base64")), decipher.final()]).toString("utf8");
  };
  assert.ok(open("reserve") === wallet.privateKey);
  assert.throws(() => open("buyback"));
  assert.ok(!JSON.stringify(envelope).includes(wallet.privateKey));
});
test("missing encryption configuration fails rather than generating unprotected keys", () => {
  assert.throws(() => createTreasuryTestWallet("reserve", ""));
});
