import type { DemoOperation, DemoRound } from "@workspace/api-zod";
import type { EngineState } from "./demo-state.ts";
import type { TreasuryActivityItem } from "./treasury-activity.ts";
import { createProposalOperation, RESERVED } from "./orchestrator.ts";
import { ensureTreasuryTracking, treasuryRoundSnapshot } from "./treasury-round.ts";
import { DEMO_DAY, demoCycleStart, demoCycleId } from "./demo-cycle-clock.ts";
import { advanceDemoBurnStory } from "./demo-burn-story.ts";

const money = (n: number) => Math.round(n * 1e6) / 1e6;
const iso = (n: number) => new Date(n).toISOString();
const EPOCH = Date.UTC(2026, 9, 1, 19);
const RESULTS = [1840, -920, 2360, 1450, -610, 2100, 1680] as const;
// A recorded opening result keeps this authored demo positive through its
// worst 6,200-USDC drawdown. It is not real trading or a guaranteed return.
const OPENING_PROFIT = 7000;
const OPENING_COST = 200;
const STEP = 120_000;
const COUNT = DEMO_DAY / STEP;
const EMPTY = { agent: null, market: null, capitalUsdc: null, grossUsdc: null, costUsdc: null, netUsdc: null, feeKind: null, feeUsdc: null };
const ordinal = (start: number) => Math.floor((start - EPOCH) / DEMO_DAY);
const retained = (net: number) => net > 0 ? net * .5 : net;
function underlyingFinalNet(start: number) {
  return RESULTS[((ordinal(start) % RESULTS.length) + RESULTS.length) % RESULTS.length]!;
}
export function storyFinalNet(start: number) {
  return OPENING_PROFIT + underlyingFinalNet(start);
}
export function storyOpeningAssets(start: number) {
  const days = ordinal(start), weeks = Math.floor(days / RESULTS.length);
  const remainder = days - weeks * RESULTS.length;
  return money(240000 + weeks * RESULTS.reduce((s, n) => s + retained(OPENING_PROFIT + n), 0)
    + RESULTS.slice(0, remainder).reduce((s, n) => s + retained(OPENING_PROFIT + n), 0));
}
/** Authored narrative: early drawdown, recovery, then the day's fixed outcome. */
function authoredProfit(start: number, minutes: number) {
  const result = underlyingFinalNet(start);
  const anchors = [[0, 0], [240, -6200], [480, -4800], [720, -1800], [960, result * .25], [1200, result * .6], [1440, result]];
  const right = anchors.findIndex(p => p[0]! >= minutes);
  const b = anchors[right < 0 ? anchors.length - 1 : right]!, a = anchors[Math.max(0, right - 1)]!;
  return money(a[0] === b[0] ? b[1]! : a[1]! + (b[1]! - a[1]!) * (minutes - a[0]!) / (b[0]! - a[0]!));
}
const closedCount = (start: number, now: number) => Math.max(0, Math.min(COUNT, Math.floor((now - start) / STEP) + (now >= start + DEMO_DAY - 1000 ? 1 : 0)));
export function storyNetAt(start: number, now: number) {
  return OPENING_PROFIT + authoredProfit(start, closedCount(start, now) * 2);
}
export function storyPosition(start: number, index: number): TreasuryActivityItem {
  const agent = (["crypto", "predictions", "sports", "bonus"] as const)[index % 4]!;
  const capital = [220, 180, 260, 140][index % 4]!;
  const cost = money(capital * .002);
  const net = money(authoredProfit(start, (index + 1) * 2) - authoredProfit(start, index * 2));
  return { ...EMPTY, id: `SCRIPT-${demoCycleId(start)}-${String(index + 1).padStart(5, "0")}`,
    at: iso(Math.min(start + (index + 1) * STEP, start + DEMO_DAY - 1000)), kind: "position_closed", source: "modeled_baseline",
    agent, market: agent === "crypto" ? `${["BTC", "ETH", "SOL"][Math.floor(index / 4) % 3]}/USDC`
      : agent === "predictions" ? "BTC-68000-USD" : agent === "sports" ? "Aurora FC × Horizonte FC" : "USDC",
    capitalUsdc: capital, grossUsdc: money(net + cost), costUsdc: cost, netUsdc: net };
}
function storyFee(start: number, index: number): TreasuryActivityItem {
  return { ...EMPTY, id: `SCRIPT-FEE-${demoCycleId(start)}-${index}`, at: iso(start + (index + 1) * 900_000 - 1000),
     kind: "operator_fee", source: "modeled_baseline", feeKind: (["transfer", "swap", "withdraw", "send"] as const)[index % 4]!,
     feeUsdc: 2.5 };
}
function frame(start: number): EngineState {
  return { scheduledStory: 1, tickAt: start, sequence: 0, dayAt: start, price: .04, brl: 5.25, operations: [], events: [], rounds: [],
    treasury: { assetsUsdc: storyOpeningAssets(start), reserveUsdc: 60000, committedUsdc: 0, realizedUsdc: 0, cycleResultUsdc: 0 } };
}
/** Materialize due events, not random ticks. Repeated reads/restarts are idempotent. */
export function advanceScheduledStory(engine: EngineState, now: number) {
  now = Math.max(now, engine.tickAt);
  const start = engine.dayAt, t = ensureTreasuryTracking(engine, now, true);
  if (!t.scenarioReady) {
    t.openingAssets = engine.treasury.assetsUsdc; t.complete = true; t.since = start; t.scenarioReady = true;
    (engine.pendingTreasuryActivity ??= []).push({ ...EMPTY, id: `SCRIPT-OPEN-${demoCycleId(start)}`,
      at: iso(start), kind: "checkpoint", source: "modeled_baseline", capitalUsdc: t.openingAssets });
  }
  const count = closedCount(start, now), items = engine.pendingTreasuryActivity ??= [];
  // Append once, including to an already-running demo. Existing positions,
  // settled rounds, user balances and immutable receipts are not rewritten.
  if (!t.positiveDemoOpening) {
    items.push({ ...EMPTY, id: `SCRIPT-POSITIVE-OPEN-${demoCycleId(start)}`,
      at: iso(start), kind: "position_closed", source: "modeled_baseline",
      agent: "crypto", market: "DEMO/USDC", capitalUsdc: 100000,
      grossUsdc: OPENING_PROFIT + OPENING_COST, costUsdc: OPENING_COST, netUsdc: OPENING_PROFIT });
    t.executionCosts = money(t.executionCosts + OPENING_COST);
    t.positiveDemoOpening = true;
  }
  for (let i = t.closed; i < count; i++) {
    const p = storyPosition(start, i); items.push(p);
    t.executionCosts = money(t.executionCosts + p.costUsdc!);
  }
  t.closed = count;
  const feeCount = Math.max(0, Math.min(96, Math.floor((now - start + 1000) / 900000)));
  for (let i = t.scriptedFeeCount ?? 0; i < feeCount; i++) {
    const fee = storyFee(start, i); items.push(fee);
    t.fees[fee.feeKind!] = money((t.fees[fee.feeKind!] ?? 0) + fee.feeUsdc!);
  }
  t.scriptedFeeCount = feeCount;
  engine.treasury.cycleResultUsdc = storyNetAt(start, now);
  engine.treasury.assetsUsdc = money(t.openingAssets! + engine.treasury.cycleResultUsdc + (t.liquidityCashDelta ?? 0));
  engine.treasury.realizedUsdc = money(engine.rounds.reduce((s, r) => s + (r.treasurySnapshot?.realizedNetUsdc ?? 0), 0) + engine.treasury.cycleResultUsdc);
  engine.tickAt = now;
  // Pool quotes follow persisted reserves; the legacy scenario uses a fixed reference.
  engine.price = engine.swapPool ? engine.swapPool.reserveUsdc / engine.swapPool.reserveBettex : .04; engine.brl = 5.25;
  const ops: DemoOperation[] = [];
  for (let i = Math.max(0, count - 12); i < Math.min(COUNT, count + 6); i++) {
    const row = storyPosition(start, i), close = Date.parse(row.at), open = Math.max(start, close - 600000);
    if (open > now) continue;
    const fraction = Math.min(1, Math.max(0, (now - open) / (close - open)));
    const op = createProposalOperation(row.id, row.agent as DemoOperation["agent"], row.capitalUsdc!, open);
    op.market = row.market!;
    op.status = close <= now ? "closed" : fraction < .1 ? "approved" : fraction < .2 ? "executing" : close - now <= 30000 ? "reconciling" : "open";
    op.updatedAt = iso(Math.min(now, close));
    op.pnlUsdc = money(row.grossUsdc! * fraction);
    op.proposal!.durationHours = (close - open) / 3600000;
    op.proposal!.validUntil = iso(close + 60000);
    if (op.agent === "sports") op.proposal!.eventAt = iso(close);
    if (op.agent === "crypto") {
      const price = row.market!.startsWith("BTC") ? 65000 : row.market!.startsWith("ETH") ? 2600 : 155;
      const leg = op.proposal!.legs[0]!; leg.instrument = row.market!; leg.priceUsdc = price; leg.quantity = leg.amountUsdc / price;
      op.proposal!.targetPriceUsdc = price * 1.012;
      op.proposal!.expectedNetUsdc = money(leg.quantity * op.proposal!.targetPriceUsdc - op.capitalUsdc);
    }
    ops.unshift(op);
  }
  engine.operations = ops;
  engine.treasury.committedUsdc = money(ops.filter(o => RESERVED.has(o.status)).reduce((s, o) => s + o.capitalUsdc, 0));
  engine.events = ops.flatMap(o => {
    const open = Date.parse(o.proposal!.generatedAt), close = Date.parse(storyPosition(start, Number(o.id.split("-").at(-1)) - 1).at);
    return ([["signal", open], ["risk_check", open + 1000], ["approved", open + 2000], ["order", open + 10000],
      ["result", close], ["reconciliation", close]] as const).filter(([, at]) => at <= now).map(([kind, at]) => ({
      id: `SCRIPT-EVENT-${o.id}-${kind}`, at: iso(at), fromAgent: kind === "approved" ? "orchestrator" : o.agent,
      toAgent: kind === "approved" ? o.agent : "orchestrator", kind, reference: o.id,
    }));
  }).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40);
  advanceDemoBurnStory(engine, now);
}
/** Replace only the automated demo story, retaining customer states and old journals. */
export function ensureScheduledStory(engine: EngineState, now: number) {
  if (engine.scheduledStory === 1) return;
  engine.legacyRounds = structuredClone(engine.rounds);
  const start = demoCycleStart(now), next = frame(start);
  next.pendingTreasuryActivity = [];
  for (let ago = 7; ago >= 1; ago--) {
    const past = frame(start - ago * DEMO_DAY);
    advanceScheduledStory(past, past.dayAt + DEMO_DAY - 1);
    const net = past.treasury.cycleResultUsdc, pays = net > 0;
    const round: DemoRound = { id: demoCycleId(past.dayAt), endedAt: iso(past.dayAt + DEMO_DAY),
      status: pays ? "paid" : "retained", eligibleUsdc: Math.max(0, net), treasuryUsdc: pays ? net * .5 : 0,
      stakingUsdc: pays ? net * .25 : 0, buybackUsdc: pays ? net * .25 : 0, source: "seeded_demo",
      treasurySnapshot: treasuryRoundSnapshot(past, past.dayAt + DEMO_DAY - 1) };
    next.rounds.unshift(round);
    next.pendingTreasuryActivity.push(...past.pendingTreasuryActivity!);
  }
  advanceScheduledStory(next, now);
  Object.assign(engine, next);
  engine.treasuryTracking = next.treasuryTracking;
}
/** Chart values come from exactly the same scheduled position ledger. */
export function scheduledStakingTimeline(engine: EngineState, now: number) {
  const start = engine.dayAt, elapsedMinutes = Math.min(1440, Math.max(0, Math.floor((now - start) / 60000)));
  // Sampling cadence is independent of the two-minute settlement cadence:
  // every minute is present, including flat minutes without a settlement.
  const minutes = Array.from({ length: 1441 }, (_, i) => i);
  return { source: "test_scenario" as const, roundStartedAt: iso(start), nextTickAt: iso(start + (elapsedMinutes + 1) * 60000),
    elapsedMinutes, tick: Math.floor(elapsedMinutes), tickIntervalMs: 60000, minutesPerTick: 1,
    points: minutes.map(minute => ({ elapsedMinutes: minute, profitUsdc: minute === elapsedMinutes ? engine.treasury.cycleResultUsdc :
      minute === 0 ? 0 : storyNetAt(start, start + minute * 60000) })) };
}
