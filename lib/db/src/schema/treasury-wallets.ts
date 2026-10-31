import { pgTable, text, jsonb, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const treasuryTestWallets = pgTable("treasury_test_wallets", {
  purpose: text("purpose").primaryKey(),
  id: text("id").notNull().unique(),
  address: text("address").notNull().unique(),
  keyEnvelope: jsonb("key_envelope").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [check("treasury_test_wallets_purpose_check", sql`${table.purpose} IN ('operational','reserve','buyback','crypto_agent')`)]);
export const insertTreasuryTestWalletSchema = createInsertSchema(treasuryTestWallets);
export type TreasuryTestWalletRecord = typeof treasuryTestWallets.$inferSelect;
