import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const testAccounts = pgTable("test_accounts", {
  id: text("id").primaryKey(),
  registrationId: text("registration_id").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  noticeVersion: text("notice_version").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull(),
  revision: integer("revision").notNull().default(1),
});
export const testSessions = pgTable("test_account_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  accountId: text("account_id").notNull().references(() => testAccounts.id),
  csrf: text("csrf").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
export const testAuthLimits = pgTable("test_auth_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
export const insertTestAccountSchema = createInsertSchema(testAccounts);
export type TestAccountRow = typeof testAccounts.$inferSelect;
