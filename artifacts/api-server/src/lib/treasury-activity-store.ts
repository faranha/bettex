import { sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import { db } from "@workspace/db";
import { historyEvents } from "../../../../lib/db/src/schema/audit";
import { safeHistoryData } from "../modules/audit/domain/history";
import type { HistoryClient } from "../modules/audit/infrastructure/history-store";
import type { EngineState } from "./demo-state";
import type { DemoTreasuryActivityItem, DemoTreasuryActivityPage } from "@workspace/api-zod";
import { demoCycleStart, demoCycleId, demoCycleFromId } from "./demo-cycle-clock";

const SUBJECT = "demo:treasury:activity";
const SCHEDULED_SUBJECT = "demo:treasury:scheduled";
const numeric = ["capitalUsdc", "grossUsdc", "costUsdc", "netUsdc", "feeUsdc"] as const;
export async function flushTreasuryActivity(tx: HistoryClient, engine: EngineState) {
  const items = engine.pendingTreasuryActivity ?? [];
  if (!items.length) return;
  const subject = engine.scheduledStory ? SCHEDULED_SUBJECT : SUBJECT;
  const values = items.map(item => {
    const roundId = engine.scheduledStory ? demoCycleId(demoCycleStart(Date.parse(item.at))) : new Date(item.at).toISOString().slice(0, 10);
    const data = Object.fromEntries(Object.entries({ ...item, roundId }).map(([k, v]) => [k, typeof v === "number" ? String(v) : v]));
    return { id: createHash("sha256").update(`${subject}:${item.id}`).digest("hex"),
      subject, visibility: "admin", correlationId: item.id,
      category: "financial", kind: item.kind, state: "confirmed", actor: "system",
      environment: "simulation", source: "demo_engine", occurredAt: new Date(item.at),
      reconstructed: item.source === "modeled_baseline", data: safeHistoryData(data) };
  });
  // Chunk under PostgreSQL's parameter limit; commit the ledger and engine once.
  for (let i = 0; i < values.length; i += 500) await tx.insert(historyEvents).values(values.slice(i, i + 500)).onConflictDoNothing();
  engine.pendingTreasuryActivity = [];
}

export async function treasuryActivityPage(roundId: string, view: "closed" | "fees" | "history", page: number, pageSize: number, requestedSnapshot?: string): Promise<DemoTreasuryActivityPage> {
  const start = new Date(demoCycleFromId(roundId)), end = new Date(start.getTime() + 86400000);
  const base = sql`subject=${SCHEDULED_SUBJECT} AND environment='simulation' AND occurred_at>=${start} AND occurred_at<${end}`;
  const ceiling = String((await db.execute(sql`SELECT COALESCE(MAX(sequence),0)::text AS ceiling FROM history_events WHERE ${base}`)).rows[0]!.ceiling);
  const snapshot = requestedSnapshot && BigInt(requestedSnapshot) < BigInt(ceiling) ? requestedSnapshot : ceiling;
  const kind = view === "closed" ? sql`AND kind='position_closed'` : view === "fees" ? sql`AND kind='operator_fee'` : sql``;
  const where = sql`${base} AND sequence<=${snapshot}::bigint ${kind}`;
  const total = Number((await db.execute(sql`SELECT count(*)::text AS total FROM history_events WHERE ${where}`)).rows[0]!.total);
  const rows = (await db.execute(sql`SELECT data FROM history_events WHERE ${where} ORDER BY occurred_at DESC,id DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`)).rows;
  const items = rows.map(row => {
    const data = row.data as Record<string, unknown>;
    return { ...data, at: new Date(String(data.at)),
      ...Object.fromEntries(numeric.map(k => [k, data[k] == null ? null : Number(data[k])])) } as unknown as DemoTreasuryActivityItem;
  });
  return { roundId, items, total, totalPages: Math.max(1, Math.ceil(total / pageSize)), page, pageSize, snapshot, source: "emulated" };
}
