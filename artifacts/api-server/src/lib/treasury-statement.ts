import type { TreasuryStatementEntry, TreasuryStatementBalance } from "@workspace/api-zod";

export const STATEMENT_CATEGORIES = ["investment_result", "execution_cost", "distribution", "buyback_funding",
  "buyback_purchase", "token_purchase", "token_burn", "lottery_purchase", "investment_income", "capital_received",
  "investment_funding", "principal_return", "transfer", "withdrawal"] as const;
export type StatementCategory = typeof STATEMENT_CATEGORIES[number];
export type StatementFilters = {
  from: string; to: string; asset: "all" | "USDC" | "BETTEX"; account: "all" | "treasury" | "buyback";
  category: string; direction: "all" | "in" | "out"; search: string; page: number;
  asOf?: string; snapshot?: string; locale: "pt" | "en" | "es";
};
export function statementUnits(value: unknown): bigint {
  const s = String(value);
  if (!/^-?\d+(?:\.\d{1,6})?$/.test(s)) throw new Error("invalid_statement_amount");
  const [whole, fraction = ""] = s.replace(/^-/, "").split(".");
  return BigInt(`${whole}${fraction.padEnd(6, "0")}`) * (s.startsWith("-") ? -1n : 1n);
}
export function statementDecimal(value: bigint): string {
  const n = value < 0n ? -value : value;
  return `${value < 0n ? "-" : ""}${n / 1_000_000n}.${String(n % 1_000_000n).padStart(6, "0")}`;
}
const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)
  && Number.isFinite(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
/** Calendar-day filters are in São Paulo, not the browser's timezone. */
export function statementPeriod(from: string, to: string) {
  if (!validDate(from) || !validDate(to)) throw new Error("invalid_statement_filters");
  const start = Date.parse(`${from}T00:00:00-03:00`), end = Date.parse(`${to}T00:00:00-03:00`) + 86400000;
  if (end <= start || end - start > 31 * 86400000) throw new Error("invalid_statement_filters");
  return { start, end };
}
export function statementFilters(query: Record<string, unknown>): StatementFilters {
  const get = (key: string, fallback = "") => {
    if (query[key] !== undefined && typeof query[key] !== "string") throw new Error("invalid_statement_filters");
    return String(query[key] ?? fallback);
  };
  const from = get("from"), to = get("to"); statementPeriod(from, to);
  const asset = get("asset", "all"), account = get("account", "all"), category = get("category", "all");
  const direction = get("direction", "all"), search = get("search").trim(), page = Number(get("page", "1"));
  const asOf = get("asOf") || undefined, snapshot = get("snapshot") || undefined, locale = get("locale", "en");
  if (!["all", "USDC", "BETTEX"].includes(asset) || !["all", "treasury", "buyback"].includes(account)
    || category !== "all" && !STATEMENT_CATEGORIES.includes(category as StatementCategory)
    || !["all", "in", "out"].includes(direction) || search.length > 100
    || !Number.isInteger(page) || page < 1 || page > 100000
    || snapshot !== undefined && !/^\d{1,20}$/.test(snapshot)
    || asOf !== undefined && (!Number.isFinite(Date.parse(asOf)) || Date.parse(asOf) > Date.now() + 1000)
    || !["pt", "en", "es"].includes(locale)) throw new Error("invalid_statement_filters");
  return { from, to, asset, account, category, direction, search, page, asOf, snapshot, locale } as StatementFilters;
}
type Activity = { id: string; at: string; kind: string; agent?: string | null; market?: string | null;
  capitalUsdc?: string | number | null; grossUsdc?: string | number | null; costUsdc?: string | number | null };
type ClosedRound = { id: string; endedAt: string; stakingUsdc: number; buybackUsdc: number };
type BurnRecord = { id: string; at: string; roundId: string; kind: string; amountUsdc: number; tokensBettex: number };
export function treasuryStatementEntries(activity: Activity[], rounds: ClosedRound[], burn: BurnRecord[]): TreasuryStatementEntry[] {
  const result: TreasuryStatementEntry[] = [];
  const add = (id: string, at: string, account: "treasury" | "buyback", asset: "USDC" | "BETTEX",
    amount: bigint, category: StatementCategory, reference: string, counterparty: string,
    source: TreasuryStatementEntry["source"], internal = false, income = false, principal: string | null = null) => {
    if (amount !== 0n) result.push({ id, at, account, asset, amount: statementDecimal(amount), category,
      reference, counterparty, source, internal, income, principal, status: "recorded" });
  };
  for (const p of activity) {
    if (p.kind !== "position_closed") continue; // Operator revenue is never Treasury income.
    // Only the recorded result and execution cost. Capital is a reference, NOT
    // an invented funding/return transfer with a made-up transaction timestamp.
    const principal = p.capitalUsdc == null ? null : statementDecimal(statementUnits(p.capitalUsdc));
    const counterparty = [p.agent, p.market].filter(Boolean).join(" · ");
    if (p.grossUsdc != null) add(`${p.id}:result`, p.at, "treasury", "USDC", statementUnits(p.grossUsdc),
      "investment_result", p.id, counterparty, "modeled_settlement", false, true, principal);
    if (p.costUsdc != null) add(`${p.id}:cost`, p.at, "treasury", "USDC", -statementUnits(p.costUsdc),
      "execution_cost", p.id, counterparty, "modeled_settlement");
  }
  for (const r of rounds) {
    add(`${r.id}:distribution`, r.endedAt, "treasury", "USDC", -statementUnits(r.stakingUsdc),
      "distribution", r.id, "participation", "modeled_demo");
    add(`${r.id}:buyback-funding`, r.endedAt, "treasury", "USDC", -statementUnits(r.buybackUsdc),
      "buyback_funding", r.id, "buyback", "modeled_demo", true);
  }
  for (const b of burn) {
    if (b.kind === "wallet_funded") add(`${b.id}:USDC`, b.at, "buyback", "USDC", statementUnits(b.amountUsdc),
      "buyback_funding", b.roundId, "treasury", "modeled_demo", true);
    if (b.kind === "tokens_purchased") {
      const category = b.id.startsWith("DEMO-LOTTERY-") ? "lottery_purchase" : "buyback_purchase";
      add(`${b.id}:USDC`, b.at, "buyback", "USDC", -statementUnits(b.amountUsdc),
        category, b.roundId, category === "lottery_purchase" ? "participation" : "market", "modeled_demo");
      add(`${b.id}:BETTEX`, b.at, "buyback", "BETTEX", statementUnits(b.tokensBettex),
        "token_purchase", b.roundId, "market", "modeled_demo");
    }
    if (b.kind === "tokens_burned") add(`${b.id}:BETTEX`, b.at, "buyback", "BETTEX", -statementUnits(b.tokensBettex),
      "token_burn", b.roundId, "burn", "modeled_demo");
  }
  return result;
}
export function matchingStatementEntries(entries: TreasuryStatementEntry[], f: StatementFilters) {
  const { start, end } = statementPeriod(f.from, f.to), ceiling = f.asOf ? Date.parse(f.asOf) : Infinity;
  const search = f.search.toLocaleLowerCase();
  return entries.filter(e => {
    const at = Date.parse(e.at), amount = statementUnits(e.amount);
    return at >= start && at < end && at <= ceiling
      && (f.asset === "all" || e.asset === f.asset) && (f.account === "all" || e.account === f.account)
      && (f.category === "all" || e.category === f.category)
      && (f.direction === "all" || (f.direction === "in" ? amount > 0n : amount < 0n))
      && (!search || `${e.id} ${e.reference} ${e.counterparty}`.toLocaleLowerCase().includes(search));
  }).sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id));
}
export function statementBalances(entries: TreasuryStatementEntry[], f: StatementFilters,
  opening: Map<string, bigint>, expectedClosing = new Map<string, bigint>()): TreasuryStatementBalance[] {
  const { start, end } = statementPeriod(f.from, f.to), ceiling = Math.min(end - 1, Date.parse(f.asOf!));
  return (["treasury:USDC", "buyback:USDC", "buyback:BETTEX"] as const)
    .filter(key => (f.account === "all" || key.startsWith(f.account + ":")) && (f.asset === "all" || key.endsWith(":" + f.asset)))
    .map(key => {
      const [account, asset] = key.split(":") as [TreasuryStatementBalance["account"], TreasuryStatementBalance["asset"]];
      const rows = entries.filter(e => e.account === account && e.asset === asset && Date.parse(e.at) >= start && Date.parse(e.at) <= ceiling);
      const sum = (selected: TreasuryStatementEntry[]) => selected.reduce((n, e) => n + statementUnits(e.amount), 0n);
      const inflows = sum(rows.filter(e => statementUnits(e.amount) > 0n));
      const outflows = -sum(rows.filter(e => statementUnits(e.amount) < 0n));
      const initial = opening.get(key), closing = initial === undefined ? undefined : initial + inflows - outflows;
      return { account, asset, opening: initial === undefined ? null : statementDecimal(initial),
        closing: closing === undefined ? null : statementDecimal(closing), inflows: statementDecimal(inflows),
        outflows: statementDecimal(outflows), income: statementDecimal(sum(rows.filter(e => e.income || e.category === "execution_cost"))),
        otherIncome: rows.some(e => e.category === "investment_income") ? statementDecimal(sum(rows.filter(e => e.category === "investment_income"))) : null,
        reconciled: closing !== undefined && expectedClosing.get(key) === closing };
    });
}
