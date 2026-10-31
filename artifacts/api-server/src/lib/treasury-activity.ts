import { randomInt } from "node:crypto";
import type { DemoTreasuryActivityItem } from "@workspace/api-zod";
import type { EngineState } from "./demo-state.ts";
import { ensureTreasuryTracking } from "./treasury-round.ts";

/** Persistable wire shape; generated Zod uses Date only after validation. */
export type TreasuryActivityItem = Omit<DemoTreasuryActivityItem, "at"> & { at: string };
const money = (n: number) => Math.round(n * 1e6) / 1e6;
const random = () => randomInt(0, 2147483647) / 2147483647;
const iso = (n: number) => new Date(n).toISOString();
const empty = { agent: null, market: null, capitalUsdc: null, grossUsdc: null, costUsdc: null, netUsdc: null, feeKind: null, feeUsdc: null };
export function queueTreasuryActivity(engine: EngineState, item: TreasuryActivityItem) {
  (engine.pendingTreasuryActivity ??= []).push(item);
}

/**
 * Explicit modeled baseline, not reconstructed exchange evidence. Preserve the
 * existing simulated net result/assets; explain the generated detail by source.
 * Initialize once per round, persist atomically with its append-only journal.
 */
export function ensureTreasuryScenario(engine: EngineState, now: number, rng = random) {
  const t = ensureTreasuryTracking(engine, now);
  if (t.scenarioReady) return;
  const roundId = iso(engine.dayAt).slice(0, 10);
  const elapsed = Math.max(1, now - engine.dayAt);
  const count = Math.max(240, Math.min(5000, t.closed || Math.floor(elapsed / 180000)));
  const weights = Array.from({ length: count }, () => .5 + rng());
  const costTotal = t.executionCosts > 0 ? t.executionCosts : money(weights.reduce((n, w) => n + w * .4, 0));
  const weightTotal = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(() => (rng() - .5) * 40);
  const adjustment = (engine.treasury.cycleResultUsdc - raw.reduce((a, b) => a + b, 0)) / count;
  let usedNet = 0, usedCosts = 0;
  queueTreasuryActivity(engine, { ...empty, id: `OPEN-${roundId}`, at: iso(engine.dayAt),
    kind: "checkpoint", source: "recorded_checkpoint",
    capitalUsdc: money(engine.treasury.assetsUsdc - engine.treasury.cycleResultUsdc) });
  const agents = ["crypto", "predictions", "sports", "bonus"];
  const markets = ["BTC/USDC", "ETH/USDC", "SOL/USDC", "BTC-68000-USD", "Aurora FC × Horizonte FC", "USDC"];
  for (let i = 0; i < count; i++) {
    const last = i === count - 1;
    const cost = last ? money(costTotal - usedCosts) : money(costTotal * weights[i]! / weightTotal);
    const net = last ? money(engine.treasury.cycleResultUsdc - usedNet) : money(raw[i]! + adjustment);
    usedCosts = money(usedCosts + cost); usedNet = money(usedNet + net);
    const agent = agents[Math.floor(rng() * agents.length)]!;
    const market = agent === "crypto" ? markets[Math.floor(rng() * 3)]! : markets[agent === "predictions" ? 3 : agent === "sports" ? 4 : 5]!;
    queueTreasuryActivity(engine, { ...empty, id: `MODEL-${roundId}-${String(i + 1).padStart(5, "0")}`,
      at: iso(engine.dayAt + Math.floor(elapsed * (i + 1) / (count + 1))),
      kind: "position_closed", source: "modeled_baseline", agent, market,
      capitalUsdc: money(Math.max(Math.abs(net) + cost, cost / .002, 50)),
      grossUsdc: money(net + cost), costUsdc: cost, netUsdc: net });
  }
  for (const kind of ["onramp", "swap", "withdraw", "send"] as const) {
    const fees = Array.from({ length: 30 }, () => money(.05 + rng() * 4));
    const target = t.fees[kind] || money(fees.reduce((a, b) => a + b, 0));
    const total = fees.reduce((a, b) => a + b, 0);
    let used = 0;
    fees.forEach((v, i) => {
      const fee = i === fees.length - 1 ? money(target - used) : money(target * v / total);
      used = money(used + fee);
      queueTreasuryActivity(engine, { ...empty, id: `MODEL-FEE-${roundId}-${kind}-${i}`,
        at: iso(engine.dayAt + Math.floor(elapsed * (i + 1) / 31)), kind: "operator_fee",
        source: "modeled_baseline", feeKind: kind, feeUsdc: fee });
    });
    t.fees[kind] = target;
  }
  t.closed = count; t.executionCosts = costTotal; t.openingAssets = money(engine.treasury.assetsUsdc - engine.treasury.cycleResultUsdc);
  t.complete = true; t.since = engine.dayAt; t.scenarioReady = true;
  t.nextCommunityFeeAt = now + 30000 + Math.floor(rng() * 60000);
}

export function advanceTreasuryCommunity(engine: EngineState, now: number, rng = random) {
  const t = ensureTreasuryTracking(engine, now);
  if (!t.scenarioReady || now < (t.nextCommunityFeeAt ?? now)) return;
  const kind = (["onramp", "swap", "withdraw", "send"] as const)[Math.floor(rng() * 4)]!;
  const fee = money(.05 + rng() * 4);
  t.fees[kind] = money(t.fees[kind] + fee);
  queueTreasuryActivity(engine, { ...empty, id: `COMMUNITY-${engine.dayAt}-${now}`,
    at: iso(now), kind: "operator_fee", source: "emulated", feeKind: kind, feeUsdc: fee });
  t.nextCommunityFeeAt = now + 30000 + Math.floor(rng() * 60000);
}
