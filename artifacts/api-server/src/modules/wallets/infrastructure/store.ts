import { db } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { computeAddress, getAddress } from "ethers";
import { personalTestWallets, personalTestWalletNetworks, personalTestVaults } from "../../../../../../lib/db/src/schema/wallets";
import { AccountFailure } from "../../accounts";
import { validPersonalWalletSet, type PersonalWalletDescriptor } from "../domain/personal-wallet";

type WalletConnection = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
/** Explicitly accepted development association; never enabled by account creation. */
export async function associateLocalTestNetwork(walletIds: string[]) {
  await db.insert(personalTestWalletNetworks).values(walletIds.map(walletId => ({ walletId, environment: "local-development", chainId: 31337 }))).onConflictDoNothing();
}
export async function ensureWalletsSchema() {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS personal_test_wallets (
    id text PRIMARY KEY, account_id text NOT NULL REFERENCES test_accounts(id), purpose text NOT NULL,
    address text NOT NULL UNIQUE, public_key text NOT NULL,
    UNIQUE(account_id, purpose)
  )`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS personal_test_wallet_networks (
    wallet_id text NOT NULL REFERENCES personal_test_wallets(id), environment text NOT NULL,
    chain_id integer NOT NULL, PRIMARY KEY(wallet_id, environment, chain_id)
  )`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS personal_test_vaults (
    account_id text PRIMARY KEY REFERENCES test_accounts(id), envelope jsonb NOT NULL
  )`);
}
export function validatePublicWallets(wallets: PersonalWalletDescriptor[]) {
  if (!validPersonalWalletSet(wallets)) throw new AccountFailure("invalid_wallets");
  try {
    for (const wallet of wallets) {
      if (getAddress(wallet.address) !== wallet.address || computeAddress(wallet.publicKey) !== wallet.address) {
        throw new AccountFailure("invalid_wallets");
      }
    }
  } catch { throw new AccountFailure("invalid_wallets"); }
}
export function walletsStore(connection: WalletConnection = db) {
  return {
    async localAccountIds() {
      const rows = await connection.selectDistinct({ accountId: personalTestWallets.accountId }).from(personalTestWallets)
        .innerJoin(personalTestWalletNetworks, eq(personalTestWalletNetworks.walletId, personalTestWallets.id))
        .where(eq(personalTestWalletNetworks.chainId, 31337));
      return rows.map(row => row.accountId);
    },
    async provision(accountId: string, wallets: PersonalWalletDescriptor[], envelope: unknown) {
      validatePublicWallets(wallets);
      await connection.insert(personalTestWallets).values(wallets.map(({ chainIds: _, ...w }) => ({ ...w, accountId })));
      await connection.insert(personalTestWalletNetworks).values(wallets.flatMap(w =>
        w.chainIds.map(chainId => ({ walletId: w.id, environment: "public-testnet", chainId }))));
      await connection.insert(personalTestVaults).values({ accountId, envelope });
    },
    async read(accountId: string) {
      const rows = await connection.select().from(personalTestWallets).where(eq(personalTestWallets.accountId, accountId));
      const wallets: PersonalWalletDescriptor[] = [];
      for (const row of rows) {
        const networks = await connection.select().from(personalTestWalletNetworks).where(eq(personalTestWalletNetworks.walletId, row.id));
        wallets.push({ id: row.id, purpose: row.purpose as PersonalWalletDescriptor["purpose"],
          address: row.address, publicKey: row.publicKey, chainIds: networks.map(n => n.chainId) });
      }
      const vault = (await connection.select().from(personalTestVaults).where(eq(personalTestVaults.accountId, accountId)))[0];
      if (!validPersonalWalletSet(wallets, true) || !vault) throw new AccountFailure("wallets_unavailable", 503);
      return { wallets, vault: vault.envelope };
    },
    async replaceEnvelope(accountId: string, envelope: unknown) {
      const result = await connection.update(personalTestVaults).set({ envelope }).where(eq(personalTestVaults.accountId, accountId))
        .returning({ accountId: personalTestVaults.accountId });
      if (!result.length) throw new AccountFailure("wallets_unavailable", 503);
    },
  };
}
