import type { AccountState, EngineState } from "./demo-state.ts";
import { DemoInputError, roundMoney, DAY } from "./demo-state.ts";
import type { Double2xPlay } from "@workspace/api-zod";
import { treasuryRoundSnapshot } from "./treasury-round.ts";

export type Double2xState = { plays: Double2xPlay[] };
export type Double2xInput = { requestId: string; color: "red" | "black"; confirmed: boolean; expectedStakeUsdc: number; executionMode?: "testnet" | "simulation" };
// Server-owned: clients cannot select a cheaper execution mode.
export function double2xExecutionMode(reason: string, provider?: string) {
  return reason === "test_gas_unavailable" && provider !== "native" ? "simulation" as const : "testnet" as const;
}
export function reserveDouble2x(account: AccountState, engine: EngineState, input: Double2xInput, now: number) {
  if (!input.confirmed) throw new DemoInputError("double2x_confirmation_required");
  if (account.profile.provider === "native") throw new DemoInputError("double2x_native_account_unavailable");
  const state = account.double2x ??= { plays: [] };
  const existing = state.plays.find(p => p.id === input.requestId);
  if (existing) {
    if (existing.color !== input.color || Math.round(existing.stakeUsdc * 1e6) !== Math.round(input.expectedStakeUsdc * 1e6)) throw new DemoInputError("double2x_request_conflict");
    return existing;
  }
  if (state.plays.some(p => p.status === "pending")) throw new DemoInputError("double2x_pending");
  if (state.plays.some(p => p.status !== "refunded" && Date.parse(p.nextPlayAt) > now)) throw new DemoInputError("double2x_daily_limit");
  const stake = roundMoney(account.receivedYield);
  if (!(stake > 0)) throw new DemoInputError("double2x_no_earnings");
  if (!Number.isSafeInteger(Math.round(stake * 1e6)) || Math.round(stake * 1e6) !== Math.round(input.expectedStakeUsdc * 1e6)) throw new DemoInputError("double2x_balance_changed");
  if (treasuryRoundSnapshot(engine, now).availableUsdc - (engine.double2xReservedUsdc ?? 0) < stake) throw new DemoInputError("double2x_treasury_unavailable");
  const play: Double2xPlay = { id: input.requestId, executionMode: input.executionMode ?? "testnet", color: input.color, stakeUsdc: stake,
    payoutUsdc: 0, status: "pending", requestedAt: new Date(now).toISOString(), nextPlayAt: new Date(now + DAY).toISOString() };
  account.receivedYield = roundMoney(account.receivedYield - stake);
  engine.double2xReservedUsdc = roundMoney((engine.double2xReservedUsdc ?? 0) + stake);
  state.plays.unshift(play);
  return play;
}
export function finishDouble2x(account: AccountState, engine: EngineState, id: string, result: "red" | "black" | "refunded", at: number) {
  const play = account.double2x?.plays.find(p => p.id === id);
  if (!play || play.status !== "pending") return null;
  engine.double2xReservedUsdc = Math.max(0, roundMoney((engine.double2xReservedUsdc ?? 0) - play.stakeUsdc));
  play.status = result === "refunded" ? "refunded" : result === play.color ? "won" : "lost";
  if (result !== "refunded") play.result = result;
  play.payoutUsdc = play.status === "won" ? roundMoney(play.stakeUsdc * 2) : play.status === "refunded" ? play.stakeUsdc : 0;
  play.settledAt = new Date(at).toISOString();
  account.receivedYield = roundMoney(account.receivedYield + play.payoutUsdc);
  const cash = play.status === "won" ? -play.stakeUsdc : play.status === "lost" ? play.stakeUsdc : 0;
  engine.treasury.assetsUsdc = roundMoney(engine.treasury.assetsUsdc + cash);
  if (engine.treasuryTracking) engine.treasuryTracking.liquidityCashDelta = roundMoney((engine.treasuryTracking.liquidityCashDelta ?? 0) + cash);
  return play;
}
