import { pgTable, text, primaryKey } from "drizzle-orm/pg-core";
import { testAccounts } from "./accounts";
export const testAccountPermissions = pgTable("test_account_permissions", {
  accountId: text("account_id").notNull().references(() => testAccounts.id),
  permission: text("permission").notNull(),
}, t => [primaryKey({ columns: [t.accountId, t.permission] })]);
