import { appendHistory, type HistoryClient } from "./history-store";
import { decimalUnits } from "../domain/history";
import { sql } from "drizzle-orm";
import { historyId } from "./history-store";
type Movement = { id: string; kind: string; status: string; asset: string; amount: number; feeUsdc: number; at: string; sourceAsset?: string; sourceAmount?: number };
export async function recordDemoMovements(client: HistoryClient, accountId: string, before: Movement[], after: Movement[], price?: string, requestId?: string | string[], eventTime?: number) {
  const subject = `demo:${accountId}`;
  for (const movement of after) {
    const old = before.find(m => m.id === movement.id);
    if (old?.status === movement.status) continue;
    const reconstructed = !old && !(Array.isArray(requestId) ? requestId.includes(movement.id) : movement.id === requestId);
    const correlationId = `demo:${accountId}:${movement.id}`;
    const units = decimalUnits(String(movement.amount), movement.asset === "USDC" ? 6 : 18);
    const request = movement.status === "pending";
    const prior = !request ? (await client.execute(sql`SELECT data FROM history_events WHERE id=${historyId(`${correlationId}:pending`)}`)).rows[0]?.data as Record<string, unknown> | undefined : undefined;
    const data = { ...prior, operationKind: movement.kind, amountUnits: units, decimals: movement.asset === "USDC" ? "6" : "18",
      receivedAsset: movement.asset, receivedUnits: units, receivedDecimals: movement.asset === "USDC" ? "6" : "18",
      feeUnits: decimalUnits(String(movement.feeUsdc), 6), mechanism: "simulation",
      ...(movement.sourceAsset && movement.sourceAmount !== undefined ? {
        paidAsset: movement.sourceAsset, paidUnits: decimalUnits(String(movement.sourceAmount), movement.sourceAsset === "USDC" ? 6 : 18),
        paidDecimals: movement.sourceAsset === "USDC" ? "6" : "18",
      } : {}),
       ...(price && (request || movement.id === requestId) ? { priceUnits: decimalUnits(price, 6), priceDecimals: "6", priceUnit: "USDC/BETTEX" } : {}),
    };
    await appendHistory({ key: `${correlationId}:${movement.status}`, subject, correlationId,
      category: request ? "activity" : "financial", actor: movement.kind === "distribution" ? "system" : reconstructed ? "system" : "user",
      kind: request ? "financial_requested" : movement.kind === "distribution" ? "distribution_paid" : movement.kind === "receive" ? "external_deposit" : movement.kind,
      state: request ? "pending" : "confirmed", asset: movement.asset, environment: "simulation",
      source: reconstructed ? "demo_json_recovered_or_seeded" : "demo_engine", reconstructed,
      occurredAt: reconstructed || request ? new Date(movement.at) : new Date(eventTime ?? Date.now()),
      requestedAt: reconstructed || movement.kind === "distribution" ? undefined : new Date(movement.at), data }, client);
    if (!request && movement.asset === "BETTEX" && !["withdraw", "send"].includes(movement.kind) && !reconstructed) {
      await appendHistory({ key: `${correlationId}:participation`, subject, correlationId, category: "automatic", actor: "system",
        kind: ["withdraw", "send"].includes(movement.kind) ? "participation_exit" : "participation_entry",
        occurredAt: new Date(eventTime ?? Date.now()),
        state: "confirmed", asset: "BETTEX", environment: "simulation", source: "demo_engine",
        data: { quantityUnits: units, decimals: "18", mechanism: "wallet_balance", ruleVersion: "demo-model-v1", trigger: movement.id } }, client);
    }
  }
}
export async function recordDemoAutomations(client: HistoryClient, events: { id: string; at: string; fromAgent: string; toAgent: string; kind: string; reference: string }[]) {
  for (const event of events) await appendHistory({ key: `demo:auto:${event.id}`, subject: "treasury:simulation",
    visibility: "admin", correlationId: `demo:auto:${event.reference}`, category: "automatic", actor: "agent",
    kind: "agent_processing", state: event.kind, environment: "simulation", occurredAt: new Date(event.at),
    source: "demo_engine", data: { trigger: event.kind, fromAgent: event.fromAgent, target: event.toAgent,
      ruleVersion: "demo-orchestrator-v1", result: event.kind } }, client);
}
export async function recordDemoRound(client: HistoryClient, accountId: string, periodId: string, endedAt: string,
  pool: string, weight: string, amount: string, paid: boolean, movementId: string) {
  const correlationId = `demo:${accountId}:${movementId}`;
  await appendHistory({ key: `${correlationId}:calculated`, subject: `demo:${accountId}`, correlationId,
    category: "automatic", actor: "system", kind: "distribution_calculated", state: paid ? "calculated" : "suspended",
    environment: "simulation", source: "demo_engine", asset: "USDC", occurredAt: new Date(endedAt),
    data: { periodId, poolUnits: decimalUnits(pool, 6), weightUnits: decimalUnits(weight, 18),
      weightDecimals: "18", amountUnits: decimalUnits(amount, 6), decimals: "6", ruleVersion: "demo-model-v1",
      trigger: "daily_cycle_close", paid: paid ? "true" : "false", reason: paid ? "existing_automatic_policy" : "no_positive_result_or_reserve_guard" } }, client);
}
type Operation = { id: string; status: string; agent: string; capitalUsdc: number; pnlUsdc: number; updatedAt: string; proposal?: { feesUsdc: number } };
export async function recordDemoPools(client: HistoryClient, cycle: { id: string; endedAt: string; status: string; treasuryUsdc: number; stakingUsdc: number; buybackUsdc: number }) {
  for (const [kind, amount, state] of [
    ["treasury_retention", cycle.treasuryUsdc, "confirmed"],
    ["treasury_distribution_pool", cycle.stakingUsdc, cycle.status === "paid" ? "available" : "suspended"],
    ["buyback_reserve", cycle.buybackUsdc, "reserved"],
  ] as const) await appendHistory({ key: `demo:pool:${cycle.id}:${kind}`, subject: "treasury:simulation", visibility: "admin",
    correlationId: `demo:period:${cycle.id}`, category: "financial", kind, state, actor: "system", environment: "simulation",
    asset: "USDC", source: "demo_engine", occurredAt: new Date(cycle.endedAt),
    data: { amountUnits: decimalUnits(String(amount), 6), decimals: "6", periodId: cycle.id,
      ruleVersion: "demo-model-v1", capitalInflow: "false", mechanism: "simulation", trigger: "daily_cycle_close" } }, client);
}
export async function recordDemoTreasury(client: HistoryClient, before: Operation[], after: Operation[]) {
  for (const op of after) {
    const old = before.find(o => o.id === op.id);
    if (!old || old.status === op.status || !["approved", "open", "closed"].includes(op.status)) continue;
    const capital = decimalUnits(String(op.capitalUsdc), 6), gross = decimalUnits(String(op.pnlUsdc), 6);
    const cost = decimalUnits(String(op.proposal?.feesUsdc ?? 0.12), 6);
    const result = String(BigInt(gross) - BigInt(cost));
    await appendHistory({ key: `demo:treasury:${op.id}:${op.status}`, subject: "treasury:simulation", visibility: "admin",
      correlationId: `demo:auto:${op.id}`, category: op.status === "approved" ? "automatic" : "financial",
      kind: op.status === "approved" ? "treasury_reservation" : op.status === "closed" ? "treasury_return" : "treasury_allocation",
      actor: "agent", state: op.status, asset: "USDC", environment: "simulation", source: "demo_engine", occurredAt: new Date(op.updatedAt),
      data: { amountUnits: op.status === "closed" ? String(BigInt(capital) + BigInt(result)) : capital, decimals: "6",
        resultUnits: result, grossResultUnits: gross, costUnits: cost, capitalUnits: capital, trigger: `${op.id}:${old.status}`, target: op.agent,
        ruleVersion: "demo-orchestrator-v1", capitalInflow: "false" } }, client);
    if (op.status === "closed") await appendHistory({ key: `demo:treasury:${op.id}:cost`, subject: "treasury:simulation", visibility: "admin",
      correlationId: `demo:auto:${op.id}`, category: "financial", kind: "treasury_cost", actor: "system", state: "confirmed",
      asset: "USDC", environment: "simulation", source: "demo_engine", occurredAt: new Date(op.updatedAt),
      data: { amountUnits: cost, decimals: "6", capitalInflow: "false", includedInNetResult: "true" } }, client);
  }
}
