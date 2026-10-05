import { pgTable, text, integer, jsonb, primaryKey, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { testAccounts } from "./accounts";

export const personalTestWallets = pgTable("personal_test_wallets", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull().references(() => testAccounts.id),
  purpose: text("purpose").notNull(),
  address: text("address").notNull().unique(),
  publicKey: text("public_key").notNull(),
}, table => [unique().on(table.accountId, table.purpose)]);
export const personalTestWalletNetworks = pgTable("personal_test_wallet_networks", {
  walletId: text("wallet_id").notNull().references(() => personalTestWallets.id),
  environment: text("environment").notNull(),
  chainId: integer("chain_id").notNull(),
}, table => [primaryKey({ columns: [table.walletId, table.environment, table.chainId] })]);
export const personalTestVaults = pgTable("personal_test_vaults", {
  accountId: text("account_id").primaryKey().references(() => testAccounts.id),
  envelope: jsonb("envelope").notNull(),
});
export const insertPersonalTestWalletSchema = createInsertSchema(personalTestWallets);
export type PersonalTestWalletRow = typeof personalTestWallets.$inferSelect;
