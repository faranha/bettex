import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { historyEvents, historyCoverage } from "../../../../../../lib/db/src/schema/audit";
import { safeHistoryData, type HistoryInput } from "../domain/history";

export type HistoryClient = Pick<typeof db, "insert" | "execute">;
let ready: Promise<void> | undefined;
export function ensureHistorySchema() {
  return ready ??= (async () => {
    if (process.env.NODE_ENV !== "production") {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS history_events (
        id text PRIMARY KEY, sequence bigserial NOT NULL UNIQUE, subject text NOT NULL, visibility text NOT NULL,
        correlation_id text NOT NULL, category text NOT NULL, kind text NOT NULL, state text NOT NULL, actor text NOT NULL,
        environment text NOT NULL, chain_id integer, epoch text, asset text, wallet text, transaction_hash text,
        block_hash text, block_number integer, log_index integer, occurred_at timestamptz NOT NULL,
        requested_at timestamptz, processed_at timestamptz NOT NULL DEFAULT now(), reconstructed boolean NOT NULL DEFAULT false,
        source text NOT NULL, parent_id text, data jsonb NOT NULL
      )`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS history_subject_page ON history_events(subject,occurred_at DESC,id DESC)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS history_correlation ON history_events(subject,correlation_id)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS history_parent ON history_events(parent_id)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS history_coverage(id text PRIMARY KEY,started_at timestamptz NOT NULL DEFAULT now())`);
      await db.execute(sql`CREATE OR REPLACE FUNCTION history_reject_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN RAISE EXCEPTION 'history_append_only'; END; $$`);
      await db.execute(sql`DROP TRIGGER IF EXISTS history_append_only ON history_events`);
      await db.execute(sql`CREATE TRIGGER history_append_only BEFORE UPDATE OR DELETE ON history_events FOR EACH ROW EXECUTE FUNCTION history_reject_mutation()`);
    }
    await db.insert(historyCoverage).values({ id: "recording-start" }).onConflictDoNothing();
  })().catch(error => { ready = undefined; throw error; });
}
export function historyId(key: string) { return createHash("sha256").update(key).digest("hex"); }
export async function historyTransparency() {
  return (await db.execute(sql`SELECT environment,chain_id AS "chainId",
    COALESCE(SUM((data->>'amountUnits')::numeric),0)::text AS "capitalUnits",6 AS decimals,
    COUNT(DISTINCT correlation_id)::text AS "operationCount"
    FROM history_events WHERE visibility='admin' AND kind='treasury_principal' AND state='confirmed'
    AND NOT EXISTS(SELECT 1 FROM history_events corrections WHERE corrections.parent_id=history_events.id AND corrections.kind='reversal')
    GROUP BY environment,chain_id ORDER BY environment,chain_id`)).rows;
}
export async function appendHistory(event: HistoryInput, client: HistoryClient = db) {
  const { key, data, ...fields } = event;
  await client.insert(historyEvents).values({ ...fields, id: historyId(key),
    visibility: event.visibility ?? "private", occurredAt: event.occurredAt ?? new Date(),
    reconstructed: event.reconstructed ?? false, data: safeHistoryData(data) }).onConflictDoNothing();
}
export type HistoryFilters = {
  view?: string; environment?: string; category?: string; state?: string; asset?: string; chainId?: number;
  wallet?: string; from?: string; to?: string; kind?: string; correlationId?: string; cursor?: string; limit?: number;
};
export async function historyPage(subject: string, f: HistoryFilters, admin = false, relatedSubject?: string) {
  const limit = Math.max(1, Math.min(50, f.limit ?? 20));
  const fingerprint = historyId(JSON.stringify([subject, relatedSubject, admin, { ...f, cursor: undefined, limit: undefined }]));
  const ceiling = (await db.execute(sql`SELECT COALESCE(MAX(sequence),0)::text AS ceiling FROM history_events`)).rows[0]!.ceiling as string;
  let snapshot = ceiling, lastAt: string | undefined, lastId: string | undefined;
  if (f.cursor) {
    try {
      const c = JSON.parse(Buffer.from(f.cursor, "base64url").toString());
      if (c.fingerprint !== fingerprint || !/^\d+$/.test(c.snapshot) || !/^[a-f0-9]{64}$/.test(c.id) || !Number.isFinite(Date.parse(c.at))) throw new Error();
      snapshot = c.snapshot; lastAt = c.at; lastId = c.id;
    } catch { throw new Error("invalid_cursor"); }
  }
  const predicates = [admin ? sql`visibility='admin'` : sql`(subject=${subject} OR subject=${relatedSubject ?? subject}) AND visibility='private' AND category<>'technical'`,
    sql`sequence<=${snapshot}::bigint`];
  if (lastAt) predicates.push(sql`(occurred_at,id)<(${lastAt}::timestamptz,${lastId})`);
  const stateExpression = sql`CASE WHEN EXISTS(SELECT 1 FROM history_events corrections WHERE corrections.parent_id=history_events.id AND corrections.kind IN ('reversal','execution_correction','participation_correction')) THEN 'reversed' ELSE state END`;
  if (f.state) predicates.push(sql`${stateExpression}=${f.state}`);
  for (const [key, column] of [["environment","environment"],["category","category"],["asset","asset"],["kind","kind"]] as const) {
    if (key === "kind" && f.kind === "wallet_backup") predicates.push(sql`(kind='wallet_backup' OR
      (kind IN('private_export_authorized','private_export_result') AND EXISTS(
        SELECT 1 FROM history_events a WHERE a.correlation_id=history_events.correlation_id
        AND a.subject=history_events.subject AND a.kind='private_export_authorized'
        AND a.data->>'action' IN('encrypted-backup','encrypted-json'))))`);
    else if (f[key]) predicates.push(sql`${sql.raw(column)}=${f[key]}`);
  }
  if (f.wallet) predicates.push(sql`(lower(wallet)=lower(${f.wallet}) OR lower(data->>'targetWallet')=lower(${f.wallet})
    OR lower(data->>'from')=lower(${f.wallet}) OR lower(data->>'to')=lower(${f.wallet}))`);
  if (f.chainId !== undefined) predicates.push(sql`chain_id=${f.chainId}`);
  if (f.correlationId) predicates.push(sql`correlation_id=${f.correlationId}`);
  for (const [key, comparator] of [["from", ">="], ["to", "<="]] as const) if (f[key]) {
    if (!Number.isFinite(Date.parse(f[key]!))) throw new Error("invalid_period");
    predicates.push(sql`occurred_at ${sql.raw(comparator)} ${f[key]}::timestamptz`);
  }
  if (f.view === "swapping") predicates.push(sql`(kind IN ('purchase','swap','approve','quote_requested') OR
    (kind IN ('financial_requested','execution_requested','execution_transition') AND data->>'operationKind' IN ('purchase','swap'))) AND category<>'technical'`);
  if (f.view === "staking") predicates.push(sql`kind LIKE 'participation_%'`);
  if (f.view === "distributions") predicates.push(sql`kind LIKE 'distribution_%'`);
  if (f.view === "activity") predicates.push(sql`category='activity'`);
  const result = await db.execute(sql`SELECT id,correlation_id AS "correlationId",category,kind,
    CASE WHEN EXISTS(SELECT 1 FROM history_events corrections WHERE corrections.parent_id=history_events.id AND corrections.kind IN ('reversal','execution_correction','participation_correction')) THEN 'reversed' ELSE state END AS state,actor,environment,
    chain_id AS "chainId",asset,wallet,transaction_hash AS "transactionHash",block_hash AS "blockHash",
    block_number AS "blockNumber",log_index AS "logIndex",occurred_at AS "occurredAt",
    requested_at AS "requestedAt",processed_at AS "processedAt",(reconstructed OR (source IN ('blockchain_receipt','blockchain_gas_receipt')
      AND occurred_at<(SELECT started_at FROM history_coverage WHERE id='recording-start'))) AS reconstructed,source,parent_id AS "parentId",data
    FROM history_events WHERE ${sql.join(predicates, sql` AND `)} ORDER BY occurred_at DESC,id DESC LIMIT ${limit + 1}`);
  const more = result.rows.length > limit, items = result.rows.slice(0, limit), last = items.at(-1);
  const coverage = (await db.execute(sql`SELECT started_at FROM history_coverage WHERE id='recording-start'`)).rows[0]!;
  return { items, nextCursor: more && last ? Buffer.from(JSON.stringify({ fingerprint, snapshot,
    at: String(last.occurredAt), id: last.id })).toString("base64url") : null,
    completeFrom: new Date(String(coverage.started_at)).toISOString(),
    limitations: subject.startsWith("demo:") ? ["prior_login_consent_unknown", "reconstructed_entries", "demo_simulated"]
      : ["prior_login_consent_unknown", "reconstructed_entries", "local_chain_only"],
    timezone: "America/Sao_Paulo" };
}
export async function historyDetail(subject: string, correlationId: string, admin = false) {
  return (await db.execute(sql`SELECT id,correlation_id AS "correlationId",category,kind,
    CASE WHEN EXISTS(SELECT 1 FROM history_events corrections WHERE corrections.parent_id=history_events.id AND corrections.kind IN ('reversal','execution_correction','participation_correction')) THEN 'reversed' ELSE state END AS state,actor,environment,
    chain_id AS "chainId",asset,wallet,transaction_hash AS "transactionHash",block_hash AS "blockHash",
    block_number AS "blockNumber",log_index AS "logIndex",occurred_at AS "occurredAt",requested_at AS "requestedAt",
    processed_at AS "processedAt",(reconstructed OR (source IN ('blockchain_receipt','blockchain_gas_receipt')
      AND occurred_at<(SELECT started_at FROM history_coverage WHERE id='recording-start'))) AS reconstructed,source,parent_id AS "parentId",data FROM history_events
    WHERE correlation_id=${correlationId} AND ${admin ? sql`visibility='admin'` : sql`subject=${subject} AND visibility='private' AND category<>'technical'`}
    ORDER BY occurred_at,id LIMIT 200`)).rows;
}
