import { db } from "@workspace/db";
import { testJourneyOperations as operations, testJourneyStages as stages } from "../../../../../../lib/db/src/schema/execution";
import { and, eq, sql } from "drizzle-orm";

export const journeyStore = {
  recorder: undefined as undefined | ((client: unknown, event: { accountId: string; correlationId: string; kind: string; state: string; data: Record<string, string>; key: string }) => Promise<void>),
  async initialize() {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS test_journey_operations (
      id text PRIMARY KEY, account_id text NOT NULL, epoch text NOT NULL, kind text NOT NULL,
      quantity text NOT NULL, principal text NOT NULL, fee text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS test_journey_stages (
      id text PRIMARY KEY, operation_id text NOT NULL, epoch text NOT NULL, name text NOT NULL, state text NOT NULL,
      sender text NOT NULL, nonce integer NOT NULL, draft jsonb NOT NULL, transaction_hash text,
      executor text, start_block integer NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE(epoch,sender,nonce)
    )`);
  },
  async create(accountId: string, epoch: string, id: string, kind: string, quantity = "0", principal = "0", fee = "0") {
    await db.transaction(async tx => {
      const inserted = await tx.insert(operations).values({ id, accountId, epoch, kind, quantity, principal, fee }).onConflictDoNothing().returning();
      if (inserted.length) await this.recorder?.(tx, { accountId, correlationId: id, kind: "execution_requested",
        state: "requested", key: `intent:${id}`, data: { operationKind: kind, quantity, principalUnits: principal, feeUnits: fee, epoch } });
    });
    const [row] = await db.select().from(operations).where(and(eq(operations.id, id), eq(operations.accountId, accountId), eq(operations.epoch, epoch)));
    if (!row || row.quantity !== quantity || row.kind !== kind) throw new Error("operation_conflict");
    return row;
  },
  async owned(accountId: string, epoch: string, id: string) {
    const [row] = await db.select().from(operations).where(and(eq(operations.id, id), eq(operations.accountId, accountId), eq(operations.epoch, epoch)));
    if (!row) throw new Error("operation_not_found");
    return row;
  },
  async list(accountId: string, epoch: string) {
    const rows = await db.select().from(operations).where(eq(operations.accountId, accountId));
    const active = rows.filter(row => row.epoch === epoch);
    return { archivedCount: rows.length - active.length, operations: await Promise.all(active.map(async row => ({
      ...row, stages: await db.select().from(stages).where(eq(stages.operationId, row.id)),
    }))) };
  },
  async stage(operationId: string, name: string) {
    return (await db.select().from(stages).where(eq(stages.id, `${operationId}:${name}`)))[0];
  },
  async plan(operationId: string, epoch: string, name: string, sender: string, chainNonce: number,
    startBlock: number, draft: Record<string, string | number>) {
    return db.transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`${epoch}:${sender}`}))`);
      const id = `${operationId}:${name}`;
      const [old] = await tx.select().from(stages).where(eq(stages.id, id));
      if (old) return old;
      const used = await tx.select({ nonce: stages.nonce }).from(stages).where(and(eq(stages.epoch, epoch), eq(stages.sender, sender)));
      const nonce = Math.max(chainNonce, ...used.map(row => row.nonce + 1));
      const [row] = await tx.insert(stages).values({ id, operationId, epoch, name, sender, nonce,
        startBlock, draft: { ...draft, nonce }, state: "requested" }).returning();
      return row!;
    });
  },
  async arm(id: string, executor: string, hash?: string) {
    return db.transaction(async tx => {
      const rows = await tx.update(stages).set({ state: "sending", executor, transactionHash: hash ?? null, updatedAt: new Date() })
        .where(and(eq(stages.id, id), eq(stages.state, "requested"))).returning();
      const row = rows[0];
      if (row) {
        const [op] = await tx.select().from(operations).where(eq(operations.id, row.operationId));
        await this.recorder?.(tx, { accountId: op!.accountId, correlationId: op!.id, kind: "execution_transition", state: "sending",
          key: `stage:${id}:sending`, data: { stage: row.name, epoch: row.epoch, operationKind: op!.kind } });
      }
      return row ?? null;
    }); // Journal and reservation commit BEFORE external side effects.
  },
  /** Release an operational draft never armed. Audit is immutable; projection is disposable. */
  async cancelUnsentDistribution(id: string) {
    await db.transaction(async tx => {
      const [row] = await tx.select().from(stages).where(eq(stages.id, id)).for("update");
      if (!row || row.state !== "requested" || row.name !== "distribution") return;
      const [op] = await tx.select().from(operations).where(eq(operations.id, row.operationId));
      if (op?.kind !== "distribution") throw new Error("invalid_cancellation");
      await this.recorder?.(tx, { accountId: op.accountId, correlationId: op.id,
        kind: "execution_transition", state: "cancelled", key: `stage:${id}:cancelled`,
        data: { stage: row.name, epoch: row.epoch, operationKind: op.kind, reason: "unsent_round_right_cancelled" } });
      await tx.delete(stages).where(and(eq(stages.id, id), eq(stages.state, "requested")));
    });
  },
  async state(id: string, state: string, hash?: string) {
    await db.transaction(async tx => {
      const [old] = await tx.select().from(stages).where(eq(stages.id, id)).for("update");
      if (!old || old.state === state && (!hash || hash === old.transactionHash)) return;
      const now = new Date();
      await tx.update(stages).set({ state, ...(hash ? { transactionHash: hash } : {}), updatedAt: now }).where(eq(stages.id, id));
      const [op] = await tx.select().from(operations).where(eq(operations.id, old.operationId));
      await this.recorder?.(tx, { accountId: op!.accountId, correlationId: op!.id, kind: "execution_transition", state,
        key: `stage:${id}:${now.toISOString()}:${old.state}:${state}`, data: { stage: old.name, previousState: old.state, epoch: old.epoch, operationKind: op!.kind,
          ...(hash ? { transactionHash: hash } : {}) } });
    });
  },
};
