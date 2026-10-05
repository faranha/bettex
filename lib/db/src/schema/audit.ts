import { pgTable, text, integer, boolean, jsonb, timestamp, bigserial, uniqueIndex, index } from "drizzle-orm/pg-core";

export const historyEvents = pgTable("history_events", {
  id: text("id").primaryKey(), sequence: bigserial("sequence", { mode: "bigint" }).notNull(),
  subject: text("subject").notNull(), visibility: text("visibility").notNull(),
  correlationId: text("correlation_id").notNull(), category: text("category").notNull(),
  kind: text("kind").notNull(), state: text("state").notNull(), actor: text("actor").notNull(),
  environment: text("environment").notNull(), chainId: integer("chain_id"), epoch: text("epoch"),
  asset: text("asset"), wallet: text("wallet"), transactionHash: text("transaction_hash"),
  blockHash: text("block_hash"), blockNumber: integer("block_number"), logIndex: integer("log_index"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true }),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
  reconstructed: boolean("reconstructed").notNull().default(false),
  source: text("source").notNull(), parentId: text("parent_id"), data: jsonb("data").notNull(),
}, t => [
  uniqueIndex("history_sequence_unique").on(t.sequence),
  index("history_subject_page").on(t.subject, t.occurredAt, t.id),
  index("history_correlation").on(t.subject, t.correlationId),
  index("history_parent").on(t.parentId),
]);
export const historyCoverage = pgTable("history_coverage", {
  id: text("id").primaryKey(), startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
});
