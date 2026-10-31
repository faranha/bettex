import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import type { DemoRound, DemoRoundArchivePage } from "@workspace/api-zod";
import type { HistoryClient } from "../modules/audit/infrastructure/history-store";
import type { AccountState, EngineState } from "./demo-state";

let schema: Promise<void> | undefined;
export function ensureRoundArchiveSchema() {
  return schema ??= (async () => {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS demo_round_archive (
      id text PRIMARY KEY, ended_at timestamptz NOT NULL, payload jsonb NOT NULL)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS demo_round_archive_order ON demo_round_archive (ended_at DESC, id DESC)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS demo_round_participation_archive (
      account_id text NOT NULL, round_id text NOT NULL, payload jsonb NOT NULL,
      PRIMARY KEY(account_id, round_id))`);
  })().catch(error => { schema = undefined; throw error; });
}

/** Archive before trimming hot state, in the transaction that closes the round. */
export async function archiveRounds(tx: HistoryClient, engine: EngineState) {
  if (!engine.rounds.length) return;
  for (let i = 0; i < engine.rounds.length; i += 500) {
    const values = engine.rounds.slice(i, i + 500).map(({ participationSnapshot: _, ...round }) =>
      sql`(${round.id}, ${round.endedAt}::timestamptz, ${JSON.stringify(round)}::jsonb)`);
    await tx.execute(sql`INSERT INTO demo_round_archive (id, ended_at, payload)
      VALUES ${sql.join(values, sql`, `)} ON CONFLICT (id) DO NOTHING`);
  }
}

export async function archiveParticipation(tx: HistoryClient, accountId: string, account: AccountState) {
  const entries = Object.entries(account.roundParticipation ?? {});
  for (let i = 0; i < entries.length; i += 500) {
    const values = entries.slice(i, i + 500).map(([id, snapshot]) =>
      sql`(${accountId}, ${id}, ${JSON.stringify(snapshot)}::jsonb)`);
    await tx.execute(sql`INSERT INTO demo_round_participation_archive (account_id, round_id, payload)
      VALUES ${sql.join(values, sql`, `)} ON CONFLICT (account_id, round_id) DO NOTHING`);
  }
  account.roundParticipation = Object.fromEntries(entries.sort(([a], [b]) => b.localeCompare(a)).slice(0, 14));
}

export async function roundArchivePage(accountId: string, page: number, pageSize: number, round?: string): Promise<DemoRoundArchivePage> {
  return db.transaction(async tx => {
    // One consistent view even when a new round closes between count and page queries.
    await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ`);
    const total = Number((await tx.execute(sql`SELECT count(*)::int AS total FROM demo_round_archive`)).rows[0]!.total);
    const actualPage = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
    const fields = sql`r.payload, p.payload AS participation`;
    const joined = sql`demo_round_archive r LEFT JOIN demo_round_participation_archive p
      ON p.round_id = r.id AND p.account_id = ${accountId}`;
    const hydrate = (row: Record<string, unknown>): DemoRound => {
      const value = row.payload as DemoRound;
      const participation = row.participation as DemoRound["participationSnapshot"];
      return { ...value, participationSnapshot: participation?.endedAt === value.endedAt ? participation : undefined };
    };
    const rows = (await tx.execute(sql`SELECT ${fields} FROM ${joined}
      ORDER BY r.ended_at DESC, r.id DESC LIMIT ${pageSize} OFFSET ${(actualPage - 1) * pageSize}`)).rows;
    const selected = round ? (await tx.execute(sql`SELECT ${fields} FROM ${joined} WHERE r.id=${round}`)).rows[0] : undefined;
    return { items: rows.map(hydrate), page: actualPage, pageSize, total, selected: selected ? hydrate(selected) : null };
  });
}
