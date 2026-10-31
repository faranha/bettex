import { pgTable,text,jsonb,integer,bigint,timestamp,primaryKey,check } from "drizzle-orm/pg-core";
import {sql} from "drizzle-orm";
export const treasuryGovernanceControl=pgTable("treasury_governance_control",{
  epoch:text("epoch").primaryKey(),asset:text("asset").notNull(),treasury:text("treasury").notNull(),policy:jsonb("policy").notNull(),
});
export const treasuryGovernanceVersions=pgTable("treasury_governance_versions",{
  epoch:text("epoch").notNull(),version:integer("version").notNull(),policy:jsonb("policy").notNull(),
  createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
},t=>[primaryKey({columns:[t.epoch,t.version]})]);
export const treasuryGovernanceProposals=pgTable("treasury_governance_proposals",{
  id:text("id").primaryKey(),epoch:text("epoch").notNull(),proposal:jsonb("proposal").notNull(),
  createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
  updatedAt:timestamp("updated_at",{withTimezone:true}).notNull().defaultNow(),
});
export const treasuryAllocationReservations=pgTable("treasury_allocation_reservations",{
  id:text("id").primaryKey(),epoch:text("epoch").notNull(),units:text("units").notNull(),state:text("state").notNull(),
  day:bigint("day",{mode:"number"}).notNull(),createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
},t=>[check("treasury_allocation_units",sql`${t.units} ~ '^[1-9][0-9]*$'`),
  check("treasury_allocation_state",sql`${t.state} IN ('held','spent','released')`)]);
