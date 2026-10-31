import { pgTable, text, integer, boolean, timestamp, customType } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

// Profile pictures live in the same Postgres database as the demo accounts that
// reference them (no external object storage). One row per uploaded picture.
export const profileAvatars = pgTable("profile_avatars", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  data: bytea("data").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export type ProfileAvatarRow = typeof profileAvatars.$inferSelect;
