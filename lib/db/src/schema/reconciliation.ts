import { pgTable, text, integer, jsonb, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Observations belong to reconciliation, not the financial ledger.
export const testContractLinks = pgTable("test_contract_links", {
  accountId: text("account_id").primaryKey(),
  address: text("address").notNull(),
  chainId: integer("chain_id").notNull(),
  version: text("version").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const testContractEvents = pgTable("test_contract_events", {
  id: text("id").primaryKey(),
  chainId: integer("chain_id").notNull(),
  tokenAddress: text("token_address").notNull(),
  address: text("address").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  blockHash: text("block_hash").notNull(),
  blockNumber: integer("block_number").notNull(),
  logIndex: integer("log_index").notNull(),
  name: text("name").notNull(),
  values: jsonb("values").notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [unique().on(table.chainId, table.address, table.transactionHash, table.logIndex, table.blockHash)]);
export const insertTestContractLinkSchema = createInsertSchema(testContractLinks);
export const insertTestContractEventSchema = createInsertSchema(testContractEvents);
export type TestContractLinkRow = typeof testContractLinks.$inferSelect;
export type TestContractEventRow = typeof testContractEvents.$inferSelect;
