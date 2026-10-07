import { pgTable, text, jsonb, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const demoRoundArchive = pgTable("demo_round_archive", {
  id: text("id").primaryKey(),
  endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
  payload: jsonb("payload").notNull(),
}, table => [index("demo_round_archive_order").on(table.endedAt.desc(), table.id.desc())]);

export const demoRoundParticipationArchive = pgTable("demo_round_participation_archive", {
  accountId: text("account_id").notNull(),
  roundId: text("round_id").notNull(),
  payload: jsonb("payload").notNull(),
}, table => [primaryKey({ columns: [table.accountId, table.roundId] })]);

export const insertDemoRoundArchiveSchema = createInsertSchema(demoRoundArchive);
export const insertDemoRoundParticipationArchiveSchema = createInsertSchema(demoRoundParticipationArchive);
export type DemoRoundArchiveRow = typeof demoRoundArchive.$inferSelect;
export type DemoRoundParticipationArchiveRow = typeof demoRoundParticipationArchive.$inferSelect;
