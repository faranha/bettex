import { sql } from "drizzle-orm";
import { getAddress } from "ethers";
import { db, treasuryTestWallets } from "@workspace/db";
import { GetDemoTreasuryWalletsResponse } from "@workspace/api-zod";
import { TREASURY_WALLET_PURPOSES } from "../domain/treasury-test-wallet";
import { createTreasuryTestWallet } from "./treasury-test-vault";

let schema: Promise<unknown> | undefined;
function ensureSchema() {
  return schema ??= db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('bettex:treasury-test-wallets'))`);
    await tx.execute(sql`CREATE TABLE IF NOT EXISTS treasury_test_wallets (
      purpose text PRIMARY KEY CHECK (purpose IN ('operational','reserve','buyback','crypto_agent')),
      id text NOT NULL UNIQUE, address text NOT NULL UNIQUE,
      key_envelope jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
    )`);
    // Extend the existing role constraint without replacing rows or encrypted keys.
    await tx.execute(sql`ALTER TABLE treasury_test_wallets DROP CONSTRAINT IF EXISTS treasury_test_wallets_purpose_check`);
    await tx.execute(sql`ALTER TABLE treasury_test_wallets ADD CONSTRAINT treasury_test_wallets_purpose_check
      CHECK (purpose IN ('operational','reserve','buyback','crypto_agent'))`);
  }).catch(error => { schema = undefined; throw error; });
}

/** One community-owned test set, not one set per visitor. Provisioning never
 * mutates demo capital or makes an RPC/signing/funding call. Read only public columns. */
export async function treasuryTestWalletPage() {
  await ensureSchema();
  return db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('bettex:treasury-test-wallets'))`);
    const read = async () => (await tx.execute(sql`SELECT id,purpose,address,created_at FROM treasury_test_wallets`)).rows;
    let rows = await read();
    for (const purpose of TREASURY_WALLET_PURPOSES) {
      if (!rows.some(row => row.purpose === purpose)) {
        const record = createTreasuryTestWallet(purpose, process.env.SESSION_SECRET ?? "");
        await tx.insert(treasuryTestWallets).values(record);
      }
    }
    rows = await read();
    if (rows.length !== TREASURY_WALLET_PURPOSES.length || new Set(rows.map(row => row.address)).size !== TREASURY_WALLET_PURPOSES.length) throw new Error("treasury_wallet_set_invalid");
    const wallets = TREASURY_WALLET_PURPOSES.map(purpose => {
      const row = rows.find(row => row.purpose === purpose)!;
      return { id: String(row.id), purpose, address: getAddress(String(row.address)), createdAt: new Date(String(row.created_at)).toISOString() };
    });
    return GetDemoTreasuryWalletsResponse.parse({
      wallets, chainId: 421614, network: "arbitrum_sepolia",
      financialOperations: "simulation", source: "assigned_test_wallets",
    });
  });
}
