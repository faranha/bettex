import type { DemoOperation, DemoOrchestratorBudget, DemoProposal } from "@workspace/api-zod";
import type { EngineState } from "./demo-state";

const money = (n: number) => Math.round(n * 1e6) / 1e6;
const iso = (n: number) => new Date(n).toISOString();
export const TERMINAL = new Set(["closed", "rejected", "expired", "cancelled", "failed"]);
export const RESERVED = new Set(["approved", "validated", "executing", "open", "result", "reconciling"]);

// Illustrative ALFA parameters, not an approved policy for real trading.
export function orchestratorBudget(engine: EngineState): DemoOrchestratorBudget {
  const workingUsdc = Math.max(0, engine.treasury.assetsUsdc - engine.treasury.reserveUsdc);
  const reservedUsdc = money(engine.operations.filter(o => RESERVED.has(o.status)).reduce((n, o) => n + o.capitalUsdc, 0));
  return { workingUsdc, reservedUsdc, availableUsdc: Math.max(0, money(workingUsdc - reservedUsdc)),
    perOperationLimitUsdc: workingUsdc * .1, perAgentLimitUsdc: workingUsdc * .4,
    perOperationPercent: 10, perAgentPercent: 40 };
}
export function proposalScore(op: DemoOperation) {
  const p = op.proposal;
  return p && [p.expectedNetUsdc, p.maxLossUsdc, p.durationHours].every(Number.isFinite) && p.maxLossUsdc > 0 && p.durationHours > 0 ? p.expectedNetUsdc / p.maxLossUsdc / p.durationHours : 0;
}
export function eligibility(op: DemoOperation, engine: EngineState, now: number): NonNullable<DemoOperation["assessment"]>["reason"] | null {
  const p = op.proposal;
  if (!p) return "missing_data";
  if (!Number.isFinite(Date.parse(p.validUntil)) || !Number.isFinite(Date.parse(p.generatedAt)) ||
      !Number.isFinite(op.capitalUsdc) || op.capitalUsdc <= 0 ||
      ![p.durationHours, p.expectedNetUsdc, p.maxLossUsdc, p.feesUsdc].every(Number.isFinite) ||
      p.durationHours <= 0 || p.maxLossUsdc <= 0 || p.maxLossUsdc > op.capitalUsdc || p.feesUsdc < 0 ||
      p.source !== "emulated" || !Array.isArray(p.legs) || !p.legs.length || p.legs.some(l =>
        ![l.amountUsdc, l.priceUsdc, l.quantity].every(Number.isFinite) || l.amountUsdc <= 0 ||
        l.priceUsdc <= 0 || l.quantity <= 0 || Math.abs(l.quantity * l.priceUsdc - l.amountUsdc) > .0001) ||
      Math.abs(p.legs.reduce((n, l) => n + l.amountUsdc, 0) + p.feesUsdc - op.capitalUsdc) > .0001) return "invalid_proposal";
  if (Date.parse(p.validUntil) <= now) return "expired_quote";
  if (p.expectedNetUsdc <= 0) return "non_positive_estimate";
  const b = orchestratorBudget(engine);
  if (op.capitalUsdc > b.perOperationLimitUsdc) return "allocation_limit";
  const exposure = engine.operations.filter(o => o.id !== op.id && o.agent === op.agent && RESERVED.has(o.status)).reduce((n, o) => n + o.capitalUsdc, 0);
  if (exposure + op.capitalUsdc > b.perAgentLimitUsdc) return "exposure_limit";
  if (op.capitalUsdc > b.availableUsdc) return "awaiting_budget";
  return null;
}

export function createProposalOperation(id: string, agent: DemoOperation["agent"], capital: number, now: number, unfavorable = false): DemoOperation {
  const fees = money(capital * .002), notional = capital - fees;
  const base = { source: "emulated" as const, generatedAt: iso(now), validUntil: iso(now + 10 * 60_000),
    maxLossUsdc: capital, feesUsdc: fees };
  let proposal: DemoProposal;
  if (agent === "crypto") {
    const price = 65000, target = unfavorable ? 64200 : 65800, quantity = notional / price;
    proposal = { ...base, type: "spot_buy", durationHours: 8, targetPriceUsdc: target,
      expectedNetUsdc: money(quantity * target - capital),
      legs: [{ instrument: "BTC/USDC", action: "buy_spot", selection: "asset", venue: "crypto_demo", amountUsdc: notional, priceUsdc: price, quantity }] };
  } else if (agent === "sports") {
    const prices = [.44, .28, unfavorable ? .30 : .26], quantity = notional / prices.reduce((n, p) => n + p, 0);
    proposal = { ...base, type: "sports_coverage", homeTeam: "Aurora FC", awayTeam: "Horizonte FC",
      eventAt: iso(now + 3 * 3600_000), durationHours: 3, expectedNetUsdc: money(quantity - capital),
      legs: prices.map((price, i) => ({ instrument: "Aurora FC × Horizonte FC", action: "buy_yes",
        selection: (["home", "draw", "away"] as const)[i]!, venue: "polymarket_demo",
        amountUsdc: money(quantity * price), priceUsdc: price, quantity })) };
  } else if (agent === "predictions") {
    const price = .47, target = unfavorable ? .45 : .49, quantity = notional / price;
    proposal = { ...base, type: "prediction_buy", durationHours: 12, targetPriceUsdc: target,
      expectedNetUsdc: money(quantity * target - capital),
      legs: [{ instrument: "BTC-68000-USD", action: "buy_yes", selection: "yes", venue: "polymarket_demo", amountUsdc: notional, priceUsdc: price, quantity }] };
  } else {
    proposal = { ...base, type: "bonus_qualifying", durationHours: 24, expectedNetUsdc: unfavorable ? -fees : money(notional * .03 - fees),
      legs: [{ instrument: "USDC", action: "qualify_bonus", selection: "bonus", venue: "bonus_demo", amountUsdc: notional, priceUsdc: 1, quantity: notional }] };
  }
  return { id, agent, market: agent === "crypto" ? "BTC/USDC" : agent === "sports" ? "Aurora FC × Horizonte FC" : agent === "predictions" ? "BTC-68000-USD" : "USDC",
    status: "queued", capitalUsdc: capital, pnlUsdc: 0, updatedAt: iso(now), proposal };
}

export function progressOrchestration(engine: EngineState, now: number,
  emit: (from: string, to: string, kind: "risk_check" | "approved" | "order" | "result" | "rejected" | "reconciliation", id: string) => void) {
  const before = new Map(engine.operations.map(o => [o.id, o.status]));
  const assess = (op: DemoOperation, reason: NonNullable<DemoOperation["assessment"]>["reason"], peers: string[] = []) => {
    op.assessment = { reason, score: proposalScore(op), comparedWith: peers,
      availableUsdc: orchestratorBudget(engine).availableUsdc, evaluatedAt: iso(now) };
  };
  const set = (op: DemoOperation, status: DemoOperation["status"]) => { op.status = status; op.updatedAt = iso(now); };
  for (const op of engine.operations) {
    if (TERMINAL.has(op.status)) continue;
    if (["queued", "analyzing", "awaiting_data", "comparing", "awaiting_budget", "approved", "validated"].includes(op.status) &&
        op.proposal && Date.parse(op.proposal.validUntil) <= now) {
      assess(op, "expired_quote"); set(op, "expired"); emit("orchestrator", op.agent, "rejected", op.id); continue;
    }
    if (op.status === "queued") set(op, "analyzing");
    else if (op.status === "analyzing" || op.status === "awaiting_data") {
      const reason = eligibility(op, engine, now);
      assess(op, reason ?? "comparison");
      if (reason === "missing_data") set(op, "awaiting_data");
      else if (reason === "awaiting_budget") set(op, "awaiting_budget");
      else if (reason === "exposure_limit") set(op, "awaiting_budget");
      else if (reason) { set(op, reason === "expired_quote" ? "expired" : "rejected"); emit("orchestrator", op.agent, "rejected", op.id); }
      else { set(op, "comparing"); emit("risk", "orchestrator", "risk_check", op.id); }
    } else if (op.status === "awaiting_budget") {
      if (eligibility(op, engine, now) === null) set(op, "comparing");
    } else if (op.status === "approved" || op.status === "validated") {
      set(op, "executing"); emit(op.agent, "orchestrator", "order", op.id);
    } else if (op.status === "executing") set(op, "open");
    else if (op.status === "open") {
      op.pnlUsdc = money(op.capitalUsdc * .013 * Math.sin(engine.sequence / 2));
      set(op, "result"); emit(op.agent, "orchestrator", "result", op.id);
    } else if (op.status === "result") set(op, "reconciling");
    else if (op.status === "reconciling") {
      const net = money(op.pnlUsdc - (op.proposal?.feesUsdc ?? .12));
      engine.treasury.assetsUsdc = money(engine.treasury.assetsUsdc + net);
      engine.treasury.realizedUsdc = money(engine.treasury.realizedUsdc + net);
      engine.treasury.cycleResultUsdc = money(engine.treasury.cycleResultUsdc + net);
      set(op, "closed"); emit(op.agent, "treasury", "reconciliation", op.id);
    }
  }
  // Only proposals already comparing before this tick can win. One reservation
  // per tick, with budget recalculated from all outstanding reservations.
  const candidates = engine.operations.filter(o => o.status === "comparing" && before.get(o.id) === "comparing")
    .sort((a, b) => proposalScore(b) - proposalScore(a) ||
      Date.parse(a.proposal!.validUntil) - Date.parse(b.proposal!.validUntil) ||
      Date.parse(a.proposal!.generatedAt) - Date.parse(b.proposal!.generatedAt) || a.id.localeCompare(b.id));
  let chosen = false;
  for (const op of candidates) {
    const reason = eligibility(op, engine, now);
    assess(op, reason ?? (chosen ? "comparison" : "selected_score"), candidates.filter(c => c.id !== op.id).map(c => c.id));
    if (reason === "awaiting_budget" || reason === "exposure_limit") set(op, "awaiting_budget");
    else if (reason) { set(op, reason === "expired_quote" ? "expired" : reason === "missing_data" ? "awaiting_data" : "rejected"); emit("orchestrator", op.agent, "rejected", op.id); }
    else if (!chosen) { set(op, "approved"); chosen = true; emit("orchestrator", op.agent, "approved", op.id); }
  }
  engine.treasury.committedUsdc = orchestratorBudget(engine).reservedUsdc;
}