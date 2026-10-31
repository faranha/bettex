import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import type { localRoundPlan } from "../domain/local-round";

export type RoundPlan = ReturnType<typeof localRoundPlan>;
export type RoundRow = { id: string; epoch: string; starts_at: string; ends_at: string;
  snapshot_block: number | null; snapshot_hash: string | null; plan: RoundPlan | null;
  buyback_state: string; buyback_hash: string | null };
export type PayoutRow = { account_id: string; wallet: string; units: string; operation_id: string;
  state: string; transaction_hash: string | null };
export const localRoundStore = {
  async initialize() {
    if (process.env.NODE_ENV !== "development") throw new Error("test_environment_required");
    await db.execute(sql`CREATE TABLE IF NOT EXISTS local_test_rounds (
      id text PRIMARY KEY, epoch text NOT NULL, starts_at bigint NOT NULL, ends_at bigint NOT NULL,
      snapshot_block integer, snapshot_hash text, plan jsonb, UNIQUE(epoch,starts_at))`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS local_test_payouts (
      round_id text NOT NULL REFERENCES local_test_rounds(id), account_id text NOT NULL REFERENCES test_accounts(id),
      wallet text NOT NULL, units text NOT NULL CHECK(units ~ '^[0-9]+$'), operation_id text NOT NULL UNIQUE,
      state text NOT NULL DEFAULT 'pending', transaction_hash text, PRIMARY KEY(round_id,account_id))`);
    await db.execute(sql`ALTER TABLE local_test_rounds ADD COLUMN IF NOT EXISTS buyback_state text NOT NULL DEFAULT 'not_started'`);
    await db.execute(sql`ALTER TABLE local_test_rounds ADD COLUMN IF NOT EXISTS buyback_hash text`);
  },
  async round(id: string, epoch: string, start: number) {
    await db.execute(sql`INSERT INTO local_test_rounds(id,epoch,starts_at,ends_at)
      VALUES(${id},${epoch},${start},${start + 86400}) ON CONFLICT DO NOTHING`);
    return (await db.execute(sql`SELECT * FROM local_test_rounds WHERE id=${id}`)).rows[0] as unknown as RoundRow;
  },
  async plan(round: RoundRow, plan: RoundPlan, block: number, hash: string) {
    await db.transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${round.id}))`);
      const [current] = (await tx.execute(sql`SELECT plan FROM local_test_rounds WHERE id=${round.id} FOR UPDATE`)).rows;
      if (current?.plan) return;
      await tx.execute(sql`UPDATE local_test_rounds SET plan=${JSON.stringify(plan)}::jsonb,
        snapshot_block=${block},snapshot_hash=${hash} WHERE id=${round.id}`);
      for (const row of plan.payments) {
        await tx.execute(sql`INSERT INTO local_test_payouts(round_id,account_id,wallet,units,operation_id)
          VALUES(${round.id},${row.accountId},${row.wallet},${row.units},${`${round.id}:${row.accountId}`})`);
      }
    });
  },
  async payouts(id: string) {
    return (await db.execute(sql`SELECT * FROM local_test_payouts WHERE round_id=${id} ORDER BY account_id`)).rows as unknown as PayoutRow[];
  },
  async older(epoch: string, before: number) {
    return (await db.execute(sql`SELECT r.* FROM local_test_rounds r WHERE epoch=${epoch} AND ends_at<=${before}
      AND (EXISTS(SELECT 1 FROM local_test_payouts p WHERE p.round_id=r.id AND p.state NOT IN('paid','cancelled','expired','failed'))
        OR buyback_state IN('sending','sent','uncertain','reconciliation_required'))
      ORDER BY starts_at LIMIT 100`)).rows as unknown as RoundRow[];
  },
  async obligations(epoch: string, exceptRound: string) {
    const rows = (await db.execute(sql`SELECT p.units FROM local_test_payouts p
      JOIN local_test_rounds r ON p.round_id=r.id
      WHERE r.epoch=${epoch} AND r.id<>${exceptRound} AND p.state NOT IN('paid','cancelled','expired','failed')`)).rows;
    const buybacks = (await db.execute(sql`SELECT plan->>'buyback' units FROM local_test_rounds
      WHERE epoch=${epoch} AND id<>${exceptRound} AND plan IS NOT NULL AND buyback_state<>'paid'`)).rows;
    return String([...rows,...buybacks].reduce((sum, row) => sum + BigInt(String(row.units ?? "0")), 0n));
  },
  async buyback(id: string, state: string, hash: string | null) {
    await db.execute(sql`UPDATE local_test_rounds SET buyback_state=${state},buyback_hash=${hash} WHERE id=${id}`);
  },
  /** Aggregate only: personal beneficiary identities never enter the governance snapshot. */
  async summary(epoch:string) {
    const rounds=(await db.execute(sql`SELECT plan,buyback_state FROM local_test_rounds WHERE epoch=${epoch} AND plan IS NOT NULL`)).rows;
    const payments=(await db.execute(sql`SELECT p.units,p.state FROM local_test_payouts p
      JOIN local_test_rounds r ON r.id=p.round_id WHERE r.epoch=${epoch}`)).rows;
    const sum=(rows:{units:unknown}[])=>String(rows.reduce((n,r)=>n+BigInt(String(r.units)),0n));
    const plans=rounds.map(r=>({buybackState:String(r.buyback_state),plan:r.plan as RoundPlan}));
    return {resultNature:"synthetic_test_model_not_external_profit" as const,rounds:rounds.length,
      modeledResultUnits:String(plans.reduce((n,r)=>n+BigInt(r.plan.result),0n)),
      modeledRetainedUnits:String(plans.reduce((n,r)=>n+BigInt(r.plan.retained),0n)),
      paidUnits:sum(payments.filter(p=>p.state==="paid") as {units:unknown}[]),
      pendingUnits:sum(payments.filter(p=>!["paid","cancelled","expired"].includes(String(p.state))) as {units:unknown}[]),
      cancelledOrExpiredUnits:sum(payments.filter(p=>["cancelled","expired"].includes(String(p.state))) as {units:unknown}[]),
      buybackPaidUnits:String(plans.filter(r=>r.buybackState==="paid").reduce((n,r)=>n+BigInt(r.plan.buyback),0n)),
      buybackPendingUnits:String(plans.filter(r=>r.buybackState!=="paid").reduce((n,r)=>n+BigInt(r.plan.buyback),0n))};
  },
  async state(id: string, account: string, state: string, hash: string | null) {
    await db.execute(sql`UPDATE local_test_payouts SET state=${state}, transaction_hash=${hash}
      WHERE round_id=${id} AND account_id=${account}`);
  },
};
