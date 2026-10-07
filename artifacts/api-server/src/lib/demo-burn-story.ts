import type { DemoBurnEntry, DemoBurnSummary } from "@workspace/api-zod";
import type { EngineState } from "./demo-state.ts";

const PRICE_UNITS = 40_000; // Authored demo quote: 0.04 USDC per integer BETTEX.
const PURCHASE_DELAY = 48 * 3_600_000;
const BURN_DELAY = 10 * 60_000;
const units = (value: number) => Math.round(value * 1_000_000);
const usdc = (value: number) => value / 1_000_000;
export type DemoBurnState = {
  allocations: { roundId: string; endedAt: string; budgetUnits: number }[];
  journal: DemoBurnEntry[];
};

/** Prepared demo events only; never authorizes an order, signs, or touches chain supply.
 * The 48h/10m delays are narrative fixtures, not treasury governance parameters.
 * Persist the journal with the engine so trimming round views never resets totals.
 */
export function advanceDemoBurnStory(engine: EngineState, now: number) {
  if (!engine.scheduledStory) return;
  const state = engine.burnStory ??= { allocations: [], journal: [] };
  for (const round of engine.rounds) {
    if (round.status !== "paid" || !(round.buybackUsdc > 0) ||
        !["seeded_demo", "calculated_simulation"].includes(round.source ?? "")) continue;
    const endedAt = Date.parse(round.endedAt);
    if (!Number.isFinite(endedAt) || endedAt > now || !Number.isFinite(round.buybackUsdc)) continue;
    if (!state.allocations.some(a => a.roundId === round.id)) {
      state.allocations.push({ roundId: round.id, endedAt: round.endedAt, budgetUnits: units(round.buybackUsdc) });
    }
  }
  const recorded = new Set(state.journal.map(e => e.id));
  for (const allocation of state.allocations) {
    const end = Date.parse(allocation.endedAt);
    const tokens = Math.floor(allocation.budgetUnits / PRICE_UNITS);
    const stages = [
      { kind: "wallet_funded" as const, at: end, amountUsdc: usdc(allocation.budgetUnits), tokensBettex: 0 },
      { kind: "tokens_purchased" as const, at: end + PURCHASE_DELAY, amountUsdc: usdc(tokens * PRICE_UNITS), tokensBettex: tokens },
      { kind: "tokens_burned" as const, at: end + PURCHASE_DELAY + BURN_DELAY, amountUsdc: 0, tokensBettex: tokens },
    ];
    for (const stage of stages) {
      // Once lottery is enabled, no future authored purchase competes for its cash.
      // Existing purchases still complete their separate pending burn.
      if (engine.burnLottery && (stage.kind === "tokens_purchased" ||
          stage.kind === "tokens_burned" && !recorded.has(`DEMO-BURN-${allocation.roundId}-tokens_purchased`))) continue;
      const id = `DEMO-BURN-${allocation.roundId}-${stage.kind}`;
      if (stage.at > now || recorded.has(id) || (stage.kind !== "wallet_funded" && tokens === 0)) continue;
      state.journal.push({ ...stage, id, roundId: allocation.roundId, at: new Date(stage.at).toISOString(), source: "modeled_demo" });
      recorded.add(id);
    }
  }
  state.journal.sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
}

export function demoBurnSnapshot(engine: EngineState, now: number): DemoBurnSummary | undefined {
  if (!engine.scheduledStory || !engine.burnStory) return undefined;
  let cash = 0, held = 0, burned = 0;
  for (const entry of engine.burnStory.journal) {
    if (entry.kind === "wallet_funded") cash += units(entry.amountUsdc);
    if (entry.kind === "tokens_purchased") { cash -= units(entry.amountUsdc); held += units(entry.tokensBettex); }
    if (entry.kind === "tokens_burned") { held -= units(entry.tokensBettex); burned += units(entry.tokensBettex); }
  }
  if (cash < 0 || held < 0) throw new Error("Demo buyback-and-burn journal does not reconcile");
  return {
    source: "modeled_demo", walletId: "DEMO-BUYBACK-BURN", address: null,
    walletUsdc: usdc(cash), walletBettex: usdc(held), totalBurnedBettex: usdc(burned),
    referencePriceUsdc: usdc(PRICE_UNITS), updatedAt: new Date(now).toISOString(),
    entries: [...engine.burnStory.journal].reverse(),
  };
}
