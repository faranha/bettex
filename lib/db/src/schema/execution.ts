import { pgTable, text, integer, jsonb, timestamp, unique } from "drizzle-orm/pg-core";

export const testJourneyOperations = pgTable("test_journey_operations", {
  id: text("id").primaryKey(), accountId: text("account_id").notNull(),
  epoch: text("epoch").notNull(), kind: text("kind").notNull(),
  quantity: text("quantity").notNull(), principal: text("principal").notNull(),
  fee: text("fee").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const testJourneyStages = pgTable("test_journey_stages", {
  id: text("id").primaryKey(), operationId: text("operation_id").notNull(),
  epoch: text("epoch").notNull(), name: text("name").notNull(), state: text("state").notNull(),
  sender: text("sender").notNull(), nonce: integer("nonce").notNull(),
  draft: jsonb("draft").notNull(), transactionHash: text("transaction_hash"),
  executor: text("executor"), startBlock: integer("start_block").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [unique().on(t.epoch, t.sender, t.nonce)]);
