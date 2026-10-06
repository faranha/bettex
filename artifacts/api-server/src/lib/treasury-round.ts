import type { DemoTreasuryRound, DemoMovement, DemoOperation } from "@workspace/api-zod";
import type { EngineState } from "./demo-state.ts";
import { RESERVED } from "./orchestrator.ts";

const DAY = 86400000;
const money = (v: number) => Math.round(v * 1e6) / 1e6;
export type TreasuryTracking = {
  dayAt: number; since: number; complete: boolean; openingAssets: number | null;
  fees: DemoTreasuryRound["feeBreakdown"]; executionCosts: number; closed: number;
};
export function ensureTreasuryTracking(engine: EngineState, now: number, complete = false) {
  if (engine.treasuryTracking?.dayAt === engine.dayAt) return engine.treasuryTracking;
  engine.treasuryTracking = {
    dayAt: engine.dayAt, since: now, complete,
    openingAssets: complete ? engine.treasury.assetsUsdc : null,
    fees: { onramp: 0, swap: 0, withdraw: 0, send: 0 }, executionCosts: 0, closed: 0,
  };
  return engine.treasuryTracking;
}
export function recordTreasurySettlement(engine: EngineState, op: DemoOperation, now: number) {
  const tracking = ensureTreasuryTracking(engine, now);
  tracking.closed++;
  tracking.executionCosts = money(tracking.executionCosts + (op.proposal?.feesUsdc ?? .12));
}
export function recordOperatorFee(engine: EngineState, movement: DemoMovement, now: number) {
  if (!(movement.kind in { onramp: 1, swap: 1, withdraw: 1, send: 1 }) || !Number.isFinite(movement.feeUsdc) || movement.feeUsdc <= 0) return;
  const tracking = ensureTreasuryTracking(engine, now);
  const key = movement.kind as keyof TreasuryTracking["fees"];
  tracking.fees[key] = money(tracking.fees[key] + movement.feeUsdc);
  // Fees belong to the operating company. Do not inflate treasury assets or eligible profit.
}
export function treasuryRoundSnapshot(engine: EngineState, now: number): DemoTreasuryRound {
  const tracking = ensureTreasuryTracking(engine, now);
  const committed = engine.operations.filter(o => RESERVED.has(o.status));
  const committedUsdc = money(committed.reduce((sum, o) => sum + o.capitalUsdc, 0));
  const workingUsdc = money(engine.treasury.assetsUsdc - engine.treasury.reserveUsdc);
  const recorded = tracking.since < engine.dayAt + DAY;
  return {
    id: new Date(engine.dayAt).toISOString().slice(0, 10),
    startedAt: new Date(engine.dayAt).toISOString(), endsAt: new Date(engine.dayAt + DAY).toISOString(),
    assetsUsdc: engine.treasury.assetsUsdc, reserveUsdc: engine.treasury.reserveUsdc,
    workingUsdc, committedUsdc, availableUsdc: money(workingUsdc - committedUsdc),
    realizedNetUsdc: engine.treasury.cycleResultUsdc,
    unrealizedUsdc: money(committed.filter(o => ["open","result","reconciling"].includes(o.status)).reduce((sum, o) => sum + o.pnlUsdc, 0)),
    expectedCommittedNetUsdc: money(committed.reduce((sum, o) => sum + (o.proposal?.expectedNetUsdc ?? 0), 0)),
    targetNetUsdc: null,
    feesCollectedUsdc: recorded ? money(Object.values(tracking.fees).reduce((sum, value) => sum + value, 0)) : null,
    feeTrackingSince: recorded ? new Date(tracking.since).toISOString() : null,
    feeBreakdown: { ...tracking.fees },
    executionCostsUsdc: tracking.complete ? tracking.executionCosts : null,
    closedOperations: tracking.complete ? tracking.closed : null,
    openingAssetsUsdc: tracking.openingAssets, coverage: tracking.complete ? "complete" : "partial",
    feesOwner: "operating_company",
  };
}
