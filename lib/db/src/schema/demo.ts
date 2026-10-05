import { pgTable, text, jsonb, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const demoAccounts = pgTable("demo_accounts", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id").unique(),
  state: jsonb("state").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const demoEngine = pgTable("demo_engine", {
  id: text("id").primaryKey(),
  state: jsonb("state").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const demoCommands = pgTable("demo_commands", {
  accountId: text("account_id").notNull().references(() => demoAccounts.id),
  requestId: text("request_id").notNull(),
  input: jsonb("input").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [primaryKey({ columns: [table.accountId, table.requestId] })]);
export const insertDemoAccountSchema = createInsertSchema(demoAccounts);
export const insertDemoEngineSchema = createInsertSchema(demoEngine);
export const insertDemoCommandSchema = createInsertSchema(demoCommands);
export type DemoAccountRow = typeof demoAccounts.$inferSelect;