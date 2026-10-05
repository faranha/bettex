import { bigint, integer, jsonb, pgTable, text, timestamp, unique, primaryKey, check, type AnyPgColumn } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { testAccounts } from "./accounts";
export const localTestRounds = pgTable("local_test_rounds", {
  id:text("id").primaryKey(), epoch:text("epoch").notNull(), startsAt:bigint("starts_at",{mode:"number"}).notNull(),
  endsAt:bigint("ends_at",{mode:"number"}).notNull(), snapshotBlock:integer("snapshot_block"), snapshotHash:text("snapshot_hash"),
  plan:jsonb("plan"), buybackState:text("buyback_state").notNull().default("not_started"), buybackHash:text("buyback_hash"),
}, t=>[unique().on(t.epoch,t.startsAt)]);
export const localTestPayouts = pgTable("local_test_payouts", {
  roundId:text("round_id").notNull().references(()=>localTestRounds.id),
  accountId:text("account_id").notNull().references(()=>testAccounts.id),wallet:text("wallet").notNull(),
  units:text("units").notNull(),operationId:text("operation_id").notNull().unique(),state:text("state").notNull().default("pending"),
  transactionHash:text("transaction_hash"),
},t=>[primaryKey({columns:[t.roundId,t.accountId]}),check("local_test_payouts_units_exact",sql`${t.units} ~ '^[0-9]+$'`)]);
export const localChainJournal = pgTable("local_chain_journal", {
  id:text("id").primaryKey(), epoch:text("epoch").notNull(),asset:text("asset").notNull(),decimals:integer("decimals").notNull(),
  transactionHash:text("transaction_hash").notNull(),blockNumber:integer("block_number").notNull(),blockHash:text("block_hash").notNull(),
  logIndex:integer("log_index").notNull(),eventTime:bigint("event_time",{mode:"number"}).notNull(),legs:jsonb("legs").notNull(),
  reverses:text("reverses").references(():AnyPgColumn=>localChainJournal.id),createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
});
