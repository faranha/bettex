import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { GetDemoTreasuryStatementResponse } from "@workspace/api-zod";
import type { TreasuryStatementEntry, TreasuryStatementPage } from "@workspace/api-zod";
import type { EngineState } from "./demo-state";
import { appendHistory, type HistoryClient } from "../modules/audit/infrastructure/history-store";
import { STATEMENT_CATEGORIES, matchingStatementEntries, statementBalances,
  statementPeriod, statementUnits, treasuryStatementEntries, type StatementFilters } from "./treasury-statement";

const CASH_SUBJECT = "demo:treasury:cash";
const ACTIVITY_SUBJECT = "demo:treasury:scheduled";
const Entry = GetDemoTreasuryStatementResponse.shape.items.element;
/** Entry point for additional simulated investment/cash sources. Caller commits
 * its financial state and this journal in the SAME transaction. No public
 * mutation or user-supplied income is accepted by the statement read API. */
export async function recordTreasuryCashMovement(tx: HistoryClient, input: TreasuryStatementEntry) {
  const item = Entry.parse(input);
  if (!STATEMENT_CATEGORIES.includes(item.category as typeof STATEMENT_CATEGORIES[number])
    || !Number.isFinite(Date.parse(item.at)) || item.source !== "recorded_simulation"
    || statementUnits(item.amount) === 0n || item.principal !== null && statementUnits(item.principal) < 0n
    || item.income !== (item.category === "investment_income" || item.category === "investment_result")) {
    throw new Error("invalid_treasury_cash_record");
  }
  await appendHistory({ key: item.id, subject: CASH_SUBJECT, visibility: "admin", correlationId: item.reference,
    category: "financial", kind: item.category, state: "confirmed", actor: "system", environment: "simulation",
    source: "treasury_cash_source", occurredAt: new Date(item.at), asset: item.asset, data: { ...item } }, tx);
}

export async function treasuryStatement(f: StatementFilters): Promise<{ page: TreasuryStatementPage; entries: TreasuryStatementEntry[] }> {
  return db.transaction(async tx => {
    await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ`);
    const { start, end } = statementPeriod(f.from, f.to);
    const asOf = new Date(Math.min(f.asOf ? Date.parse(f.asOf) : Date.now(), Date.now())).toISOString();
    const upper = Math.min(end - 1, Date.parse(asOf));
    const ceiling = String((await tx.execute(sql`SELECT COALESCE(MAX(sequence),0)::text n FROM history_events
      WHERE subject IN (${ACTIVITY_SUBJECT},${CASH_SUBJECT}) AND environment='simulation'`)).rows[0]!.n);
    const snapshot = f.snapshot && BigInt(f.snapshot) < BigInt(ceiling) ? f.snapshot : ceiling;
    const sequence = sql`sequence<=${snapshot}::bigint AND environment='simulation'`;
    const checkpoint = (await tx.execute(sql`SELECT occurred_at,data FROM history_events
      WHERE subject=${ACTIVITY_SUBJECT} AND ${sequence} AND kind='checkpoint' AND occurred_at<=${new Date(start)}
      ORDER BY occurred_at DESC,id DESC LIMIT 1`)).rows[0];
    const checkpointAt = checkpoint ? new Date(String(checkpoint.occurred_at)).getTime() : start;
    const lower = Math.min(start, checkpointAt);
    const rows = (await tx.execute(sql`SELECT data,subject FROM history_events WHERE ${sequence}
      AND subject IN (${ACTIVITY_SUBJECT},${CASH_SUBJECT}) AND occurred_at>=${new Date(lower)} AND occurred_at<=${new Date(upper)}
      ORDER BY occurred_at,id`)).rows;
    const activity = rows.filter(r => r.subject === ACTIVITY_SUBJECT).map(r => r.data as Parameters<typeof treasuryStatementEntries>[0][number]);
    const cash = rows.filter(r => r.subject === CASH_SUBJECT).map(r => Entry.parse(r.data));
    const rounds = (await tx.execute(sql`SELECT payload FROM demo_round_archive
      WHERE ended_at>=${new Date(lower)} AND ended_at<=${new Date(upper)}`)).rows
      .map(r => r.payload as Parameters<typeof treasuryStatementEntries>[1][number]);
    const engineRow = (await tx.execute(sql`SELECT state FROM demo_engine WHERE id='main'`)).rows[0];
    const engine = engineRow?.state as EngineState | undefined;
    const burn = engine?.burnStory?.journal ?? [];
    const entries = [...treasuryStatementEntries(activity, rounds, burn), ...cash]
      .filter(e => Date.parse(e.at) <= upper);
    // Global burn journal is immutable and retained independently of round pages.
    // Do not expose account identifiers from lottery participant records.
    const opening = new Map<string, bigint>();
    if (checkpoint) {
      const data = checkpoint.data as { capitalUsdc: string };
      const delta = entries.filter(e => e.account === "treasury" && e.asset === "USDC"
        && Date.parse(e.at) > checkpointAt && Date.parse(e.at) < start)
        .reduce((n, e) => n + statementUnits(e.amount), 0n);
      opening.set("treasury:USDC", statementUnits(data.capitalUsdc) + delta);
    }
    for (const asset of ["USDC", "BETTEX"] as const) {
      if (engine?.burnStory) opening.set(`buyback:${asset}`, entries.filter(e => e.account === "buyback"
        && e.asset === asset && Date.parse(e.at) < start).reduce((n, e) => n + statementUnits(e.amount), 0n));
    }
    const expectedClosing = new Map<string, bigint>();
    if (engine && engine.tickAt <= upper && engine.tickAt >= start) {
      expectedClosing.set("treasury:USDC", statementUnits(engine.treasury.assetsUsdc));
      for (const asset of ["USDC", "BETTEX"] as const) {
        const value = burn.reduce((n, e) => {
          if (asset === "USDC") return n + (e.kind === "wallet_funded" ? statementUnits(e.amountUsdc)
            : e.kind === "tokens_purchased" ? -statementUnits(e.amountUsdc) : 0n);
          return n + (e.kind === "tokens_purchased" || e.kind === "tokens_received" ? statementUnits(e.tokensBettex)
            : e.kind === "tokens_burned" ? -statementUnits(e.tokensBettex) : 0n);
        }, 0n);
        expectedClosing.set(`buyback:${asset}`, value);
      }
    }
    const frozen = { ...f, asOf }, matched = matchingStatementEntries(entries, frozen);
    const pageSize = 20, totalPages = Math.max(1, Math.ceil(matched.length / pageSize));
    const page = Math.min(f.page, totalPages);
    const result: TreasuryStatementPage = {
      items: matched.slice((page - 1) * pageSize, page * pageSize),
      balances: statementBalances(entries, frozen, opening, expectedClosing), page, pageSize,
      total: matched.length, totalPages, from: f.from, to: f.to, asOf, snapshot,
      coverage: "partial", missingSources: ["funding_timestamps", "other_investments", "native_transactions"], source: "simulation",
    };
    return { page: GetDemoTreasuryStatementResponse.parse(result), entries: matched };
  });
}

const HEADERS = {
  en: ["ID", "Date (São Paulo)", "Account", "Asset", "Signed amount", "Category", "Reference", "Counterparty",
    "Source", "Internal transfer", "Income", "Principal (reference only)", "Status"],
  pt: ["ID", "Data (São Paulo)", "Conta", "Ativo", "Valor com sinal", "Categoria", "Referência", "Contraparte",
    "Origem", "Transferência interna", "Rendimento", "Principal (apenas referência)", "Status"],
  es: ["ID", "Fecha (São Paulo)", "Cuenta", "Activo", "Importe con signo", "Categoría", "Referencia", "Contraparte",
    "Origen", "Transferencia interna", "Rendimiento", "Principal (solo referencia)", "Estado"],
};
/** CSV is the entire filtered dataset, exact units, quoted and formula-safe.
 * Stable machine category/source codes intentionally remain untranslated. */
export function treasuryStatementCsv(entries: TreasuryStatementEntry[], locale: StatementFilters["locale"]) {
  const cell = (value: unknown, numeric = false) => {
    let s = String(value ?? "");
    if (!numeric && /^[\s]*[=+@\-\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = [HEADERS[locale].map(v => cell(v)).join(",")];
  for (const e of entries) {
    const date = new Date(Date.parse(e.at) - 3 * 3600000).toISOString().replace("Z", "-03:00");
    rows.push([e.id, date, e.account, e.asset, e.amount, e.category, e.reference, e.counterparty, e.source,
      e.internal ? "true" : "false", e.income ? "true" : "false", e.principal, e.status]
      .map((v, i) => cell(v, i === 4 || i === 11)).join(","));
  }
  return "\uFEFF" + rows.join("\r\n") + "\r\n";
}
