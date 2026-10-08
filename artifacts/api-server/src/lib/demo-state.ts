import { randomUUID, randomInt } from "node:crypto";
import { generateNickname } from "../modules/accounts/domain/nickname.ts";
import { stakingTimelineSnapshot, type StakingTimelineState } from "../modules/simulation/domain/staking-timeline.ts";
import type { DemoDashboard, DemoMovement, DemoMovementInput, DemoOperation, DemoEvent, DemoRound } from "@workspace/api-zod";
import type { TreasuryActivityItem } from "./treasury-activity.ts";
import { createProposalOperation, progressOrchestration, orchestratorBudget, TERMINAL } from "./orchestrator.ts";
import { treasuryRoundSnapshot, ensureTreasuryTracking, recordOperatorFee, type TreasuryTracking } from "./treasury-round.ts";
import { demoCycleStart } from "./demo-cycle-clock.ts";
import { advanceScheduledStory, scheduledStakingTimeline } from "./scheduled-demo-story.ts";
import { separateEarningsWallet, TRANSACTION_FEE_USDC } from "./earnings-wallet.ts";
import { demoBurnSnapshot, type DemoBurnState } from "./demo-burn-story.ts";
import { demoLotterySnapshot, type DemoLotteryState } from "./demo-lottery.ts";
import { createDemoSwapPool, quoteDemoSwap, executeDemoSwap } from "./demo-swap-pool.ts";
import { demoAmmContract } from "./demo-amm-contract.ts";

export const DAY = 86_400_000;
export const roundMoney = (value: number) => Math.round(value * 1e6) / 1e6;
export const utcStart = (now: number) => Math.floor(now / DAY) * DAY;
const iso = (now: number) => new Date(now).toISOString();
const communityTokens = 8_000_000;
const communityWeight = communityTokens * 86_400;
export type AccountState = {
  double2x?: import("./double2x-rules.ts").Double2xState;
  lotteryEntries?: import("./demo-lottery-entries.ts").LotteryEntries;
  lotteryConsent?: { participating: boolean; confirmedAt: string };
  scriptedAccount?: 1;
  demoHistoryPopulated?: 1;
  earningsSeparated?: 1;
  stakingTimeline?: StakingTimelineState;
  profile: DemoDashboard["profile"];
  avatarUpload?: { objectPath: string; expiresAt: number; size: number; contentType: string };
  usdc: number; bettex: number; receivedYield: number;
  lots: { amount: number; since: number }[];
  history: DemoMovement[];
  roundParticipation?: Record<string, NonNullable<DemoDashboard["rounds"][number]["participationSnapshot"]>>;
};
export type EngineState = {
  double2xReservedUsdc?: number;
  swapPool?: NonNullable<DemoDashboard["treasury"]["swapPool"]>;
  burnLottery?: DemoLotteryState;
  burnStory?: DemoBurnState;
  scheduledStory?: 1;
  legacyRounds?: DemoRound[];
  pendingTreasuryActivity?: TreasuryActivityItem[];
  treasuryTracking?: TreasuryTracking;
  tickAt: number; sequence: number; dayAt: number;
  price: number; brl: number;
  operations: DemoOperation[]; events: DemoEvent[];
  treasury: DemoDashboard["treasury"];
  rounds: DemoRound[];
};
export function seedAccount(now: number): AccountState {
  const start = Math.min(now - 14 * 3_600_000, utcStart(now));
  return {
    profile: { name: "Alex", nickname: generateNickname(randomUUID()), email: "alex@example.com", accountId: `BX-${randomUUID().slice(0, 8).toUpperCase()}`, memberSince: iso(now - 45 * DAY) },
    usdc: 1200, bettex: 12500, receivedYield: 80.5, earningsSeparated: 1,
    lots: [{ amount: 12500, since: start }],
    history: [
      { id: randomUUID(), kind: "distribution", asset: "USDC", amount: 12.8, feeUsdc: 0, at: iso(utcStart(now)), status: "confirmed", destination: "" },
      { id: randomUUID(), kind: "swap", asset: "BETTEX", amount: 12500, feeUsdc: 1, at: iso(start), status: "confirmed", destination: "" },
      { id: randomUUID(), kind: "onramp", asset: "USDC", amount: 1000, feeUsdc: 2, at: iso(now - 2 * DAY), status: "confirmed", destination: "" },
      { id: randomUUID(), kind: "withdraw", asset: "USDC", amount: 25, feeUsdc: 0.05, at: iso(now - 3 * DAY), status: "confirmed", destination: "PIX" },
      { id: randomUUID(), kind: "receive", asset: "USDC", amount: 800, feeUsdc: 0, at: iso(now - 5 * DAY), status: "confirmed", destination: "" },
    ],
  };
}
export function seedEngine(now: number): EngineState {
  return {
    tickAt: now, sequence: 0, dayAt: utcStart(now), price: 0.04, brl: 5.25,
    operations: [
      { ...createProposalOperation("OP-001", "crypto", 250, now), status: "open", pnlUsdc: 1.4 },
      { ...createProposalOperation("OP-002", "predictions", 180, now), status: "approved" },
      createProposalOperation("OP-003", "sports", 120, now),
    ],
    events: [
      { id: randomUUID(), at: iso(now), fromAgent: "orchestrator", toAgent: "crypto", kind: "approved", reference: "OP-001" },
      { id: randomUUID(), at: iso(now - 4000), fromAgent: "risk", toAgent: "orchestrator", kind: "risk_check", reference: "OP-002" },
      { id: randomUUID(), at: iso(now - 8000), fromAgent: "sports", toAgent: "orchestrator", kind: "signal", reference: "OP-003" },
    ],
    treasury: { assetsUsdc: 240000, reserveUsdc: 60000, committedUsdc: 430, realizedUsdc: 1860, cycleResultUsdc: 1860 },
    rounds: [
      { id: iso(utcStart(now) - DAY).slice(0, 10), endedAt: iso(utcStart(now)), status: "paid", eligibleUsdc: 1840, treasuryUsdc: 920, stakingUsdc: 460, buybackUsdc: 460, source: "seeded_demo" },
      { id: iso(utcStart(now) - 2 * DAY).slice(0, 10), endedAt: iso(utcStart(now) - DAY), status: "retained", eligibleUsdc: 0, treasuryUsdc: 0, stakingUsdc: 0, buybackUsdc: 0, source: "seeded_demo" },
    ],
  };
}
function event(engine: EngineState, now: number, fromAgent: string, toAgent: string, kind: DemoEvent["kind"], reference: string) {
  engine.events.unshift({ id: randomUUID(), at: iso(now), fromAgent, toAgent, kind, reference });
  engine.events = engine.events.slice(0, 40);
}
export function accountEligibleTokens(account: AccountState, start: number) {
  // Settlement time, not submission time, determines which round an entry joins.
  // An exit resets every lot's timestamp, cancelling all unpaid participation.
  const opening = account.lots.reduce((sum, lot) => sum + (lot.since <= start ? lot.amount : 0), 0);
  return Math.max(0, Math.min(account.bettex, opening));
}
export function accountWeight(account: AccountState, start: number, end: number) {
  return accountEligibleTokens(account, start) * Math.max(0, end - start) / 1000;
}
// Close each missed round once. The scheduled demo replays its authored events;
// the legacy isolated test engine does not invent returns for idle days.
export function closeCycles(engine: EngineState, accounts: AccountState[], now: number) {
  while (engine.dayAt < (engine.scheduledStory ? demoCycleStart(now) : utcStart(now))) {
    const end = engine.dayAt + DAY;
    if (engine.scheduledStory) advanceScheduledStory(engine, end - 1);
    const weights = accounts.map(account => accountWeight(account, engine.dayAt, end));
    const total = communityWeight + weights.reduce((a, b) => a + b, 0);
    const eligible = Math.max(0, roundMoney(engine.treasury.cycleResultUsdc));
    const reservesPass = engine.treasury.assetsUsdc - (engine.swapPool?.reserveUsdc ?? 0) - engine.treasury.committedUsdc >= engine.treasury.reserveUsdc;
    const pays = eligible > 0 && reservesPass && total > 0;
    const staking = pays ? roundMoney(eligible * 0.25) : 0;
    const id = iso(engine.dayAt).slice(0, 10);
    const totalEligibleTokens = communityTokens + accounts.reduce((sum, account) => sum + accountEligibleTokens(account, engine.dayAt), 0);
    for (const [index, account] of accounts.entries()) {
      const net = Math.floor(staking * weights[index]! / total * 1e6) / 1e6;
      account.roundParticipation ??= {};
      account.roundParticipation[id] = {
        ownEligibleTokens: accountEligibleTokens(account, engine.dayAt), totalEligibleTokens,
        ownTokenSeconds: weights[index]!, totalTokenSeconds: total,
        payoutSharePercent: total > 0 ? 100 * weights[index]! / total : 0,
        receivedUsdc: net, startedAt: iso(engine.dayAt), endedAt: iso(end),
      };
      if (net > 0) {
        separateEarningsWallet(account);
        account.receivedYield = roundMoney(account.receivedYield + net);
        account.history.unshift({ id: `${engine.scheduledStory ? "SCRIPT-" : ""}ROUND-${id}-${account.profile.accountId}`, kind: "distribution", asset: "USDC", amount: net, feeUsdc: 0, at: iso(end), status: "confirmed", destination: "" });
      }
    }
    const treasurySnapshot = treasuryRoundSnapshot(engine, now);
    engine.rounds.unshift({ id, endedAt: iso(end), status: pays ? "paid" : "retained", eligibleUsdc: eligible, treasuryUsdc: pays ? eligible * .5 : eligible, stakingUsdc: staking, buybackUsdc: pays ? eligible * .25 : 0, source: "calculated_simulation", treasurySnapshot });
    event(engine, end, "treasury", "orchestrator", "cycle_closed", id);
    engine.dayAt = end;
    if (engine.scheduledStory) engine.treasury.assetsUsdc = roundMoney(engine.treasury.assetsUsdc - staking - (pays ? eligible * .25 : 0));
    engine.treasury.cycleResultUsdc = 0;
    ensureTreasuryTracking(engine, end, true);
  }
}
// The clock is wall time. This script emulates signals, risk, execution and
// reconciliation; it never talks to an exchange, wallet or payment processor.
export function tickEngine(engine: EngineState, now: number) {
  if (now - engine.tickAt < 6000) return;
  engine.tickAt = now;
  engine.sequence++;
  engine.price = engine.swapPool ? engine.swapPool.reserveUsdc / engine.swapPool.reserveBettex : roundMoney(Math.max(.035, Math.min(.045, engine.price * (1 + (randomInt(0, 20001) / 10000 - 1) * .0008))));
  engine.brl = roundMoney(Math.max(5, Math.min(5.6, engine.brl + (randomInt(0, 20001) / 10000 - 1) * .004)));
  progressOrchestration(engine, now, (from, to, kind, id) => event(engine, now, from, to, kind, id));
  const activeCount = engine.operations.filter(op => !TERMINAL.has(op.status) && op.status !== "awaiting_data").length;
  if ((engine.sequence % 3 === 0 && activeCount < 4) || activeCount === 0) {
    const agents: DemoOperation["agent"][] = ["predictions", "crypto", "sports", "bonus"];
    const agent = agents[randomInt(0, agents.length)]!;
    const id = `OP-${engine.sequence + 3}`;
    engine.operations.unshift(createProposalOperation(id, agent, randomInt(75, 301), now, randomInt(0, 8) === 0));
    event(engine, now, agent, "orchestrator", "signal", id);
  }
  // Never discard a pending item or reserved position to trim the recent feed.
  const pending = engine.operations.filter(op => !TERMINAL.has(op.status));
  engine.operations = [...pending, ...engine.operations.filter(op => TERMINAL.has(op.status)).slice(0, Math.max(0, 12 - pending.length))];
  engine.treasury.committedUsdc = orchestratorBudget(engine).reservedUsdc;
}
export class DemoInputError extends Error {}
export function ensureDemoSwapPool(engine: EngineState, now: number) {
  const available = engine.treasury.assetsUsdc - engine.treasury.reserveUsdc - engine.treasury.committedUsdc;
  if (!engine.swapPool && available < .000001) return undefined;
  engine.swapPool ??= createDemoSwapPool(available, now);
  // Upgrade legacy JSON metadata without resetting liquidity, counts or history.
  engine.swapPool.contract = { ...demoAmmContract.descriptor };
  engine.price = engine.swapPool.reserveUsdc / engine.swapPool.reserveBettex;
  return engine.swapPool;
}
export function submitMovement(account: AccountState, engine: EngineState, input: DemoMovementInput, now: number) {
  separateEarningsWallet(account);
  const { kind, amount, asset } = input;
  const earnings = input.sourceWallet === "earnings";
  if ((earnings && (asset !== "USDC" || kind !== "transfer")) || (kind === "transfer" && !earnings)) throw new DemoInputError("invalid_movement");
  if (!["receive", "onramp", "swap", "withdraw", "send", "transfer"].includes(kind) || !["USDC", "BETTEX"].includes(asset) ||
    (["onramp", "withdraw"].includes(kind) && asset !== "USDC") || !Number.isFinite(amount) || amount < .000001 || amount > 100000 || roundMoney(amount) !== amount ||
    !Number.isFinite(engine.price) || engine.price <= 0) throw new DemoInputError("invalid_movement");
  if ((kind === "send" || kind === "withdraw") &&
    (!/^0x[0-9a-fA-F]{40}$/.test(input.destination?.trim() ?? "") || /^0x0{40}$/i.test(input.destination?.trim() ?? ""))) {
    throw new DemoInputError("invalid_movement");
  }
  const fee = ["receive", "onramp"].includes(kind) ? 0 : TRANSACTION_FEE_USDC;
  const reverseSwap = kind === "swap" && asset === "BETTEX";
  let swapQuote;
  if (kind === "swap") {
    try {
      const pool = ensureDemoSwapPool(engine, now);
      if (!pool) throw new DemoInputError("pool_liquidity_unavailable");
      swapQuote = quoteDemoSwap(pool, asset, amount, fee);
    }
    catch (error) { throw new DemoInputError(error instanceof Error ? error.message : "invalid_movement"); }
    if (input.minimumOutputAmount !== undefined && (!Number.isFinite(input.minimumOutputAmount) || input.minimumOutputAmount <= 0 || swapQuote.amountOut < input.minimumOutputAmount)) throw new DemoInputError("pool_quote_changed");
  }
  const outputAsset = kind === "swap" ? (reverseSwap ? "USDC" : "BETTEX") : asset;
  // A sale pays its fee from USD proceeds, not from an unrelated USD balance.
  const outputAmount = swapQuote ? swapQuote.amountOut : kind === "onramp" ? roundMoney(amount - fee) : amount;
  if (outputAmount <= 0) throw new DemoInputError("invalid_movement");
  const debit = kind === "swap" || kind === "withdraw" || kind === "send" || kind === "transfer";
  const usdcCost = debit && !reverseSwap ? roundMoney(asset === "USDC" ? amount + fee : fee) : 0;
  const tokenCost = debit && asset === "BETTEX" ? amount : 0;
  if ((earnings ? account.receivedYield : account.usdc) < usdcCost || account.bettex < tokenCost) throw new DemoInputError("insufficient_balance");
  if (swapQuote) {
    const delta = executeDemoSwap(engine.swapPool!, swapQuote, now);
    engine.treasury.assetsUsdc = roundMoney(engine.treasury.assetsUsdc + delta);
    const tracking = ensureTreasuryTracking(engine, now);
    tracking.liquidityCashDelta = roundMoney((tracking.liquidityCashDelta ?? 0) + delta);
    engine.price = engine.swapPool!.spotPriceUsdc;
  }
  if (earnings) account.receivedYield = roundMoney(account.receivedYield - usdcCost);
  else account.usdc = roundMoney(account.usdc - usdcCost);
  if (tokenCost > 0) {
    account.bettex = roundMoney(account.bettex - tokenCost);
    // Any exit cancels all prior unpaid weight, including the remaining balance.
    account.lots = account.bettex > 0 ? [{ amount: account.bettex, since: now }] : [];
  }
  // Conversion output is locked now, in either direction, not on settlement.
  account.history.unshift({ id: input.requestId, kind, asset: outputAsset, amount: outputAmount, feeUsdc: fee, at: iso(now), status: "pending", destination: kind === "transfer" ? "dollar" : input.destination?.trim() ?? "", sourceWallet: earnings ? "earnings" : "dollar", ...(kind === "swap" ? { sourceAsset: asset, sourceAmount: amount } : {}) });
}
export function settleMovements(account: AccountState, now: number, engine?: EngineState) {
  for (const movement of account.history) {
    if (movement.status !== "pending" || now - Date.parse(movement.at) < 6000) continue;
    if (["receive", "onramp", "swap", "transfer"].includes(movement.kind)) {
      if (movement.asset === "BETTEX") {
        account.bettex = roundMoney(account.bettex + movement.amount);
        account.lots.push({ amount: movement.amount, since: now });
      } else account.usdc = roundMoney(account.usdc + movement.amount);
    }
    movement.status = "confirmed";
    if (engine) recordOperatorFee(engine, movement, now);
  }
  // A display-history limit must never discard commands still awaiting settlement.
  let completed = 0;
  account.history = account.history.filter(movement => movement.status === "pending" || ++completed <= 100);
}
export function dashboard(account: AccountState, engine: EngineState, now: number, allAccounts: AccountState[] = [account]): DemoDashboard {
  const weight = accountWeight(account, engine.dayAt, now);
  const assessedCommunityWeight = engine.scheduledStory ? communityTokens * Math.max(0, Math.min(DAY, now - engine.dayAt)) / 1000 : communityWeight;
  const totalWeight = assessedCommunityWeight + allAccounts.reduce((sum, item) => sum + accountWeight(item, engine.dayAt, now), 0);
  const eligibleTokens = accountEligibleTokens(account, engine.dayAt);
  const totalEligibleTokens = communityTokens + allAccounts.reduce((sum, item) => sum + accountEligibleTokens(item, engine.dayAt), 0);
  const tokenSharePercent = totalEligibleTokens > 0 ? 100 * eligibleTokens / totalEligibleTokens : 0;
  const poolAllocationUsdc = roundMoney(Math.max(0, engine.treasury.cycleResultUsdc) * .25);
  const estimate = Math.max(0, engine.treasury.cycleResultUsdc) * .25 * weight / totalWeight;
  const currentRound = treasuryRoundSnapshot(engine, now);
  if (account.profile.provider === "native") currentRound.targetNetUsdc = null;
  return {
    serverNow: iso(now), profile: account.profile,
    lottery: demoLotterySnapshot(engine, account, allAccounts, now),
    balances: { usdc: account.usdc, bettex: account.bettex, receivedYield: account.receivedYield, brlPerUsdc: engine.brl, bettexUsdc: engine.price, updatedAt: iso(engine.tickAt) },
    staking: { chartScenario: engine.scheduledStory && !(account.profile.authenticated && account.profile.provider === "native") ? scheduledStakingTimeline(engine, now) : account.stakingTimeline ? stakingTimelineSnapshot(account.stakingTimeline) : null, eligibleTokens, totalEligibleTokens, tokenSharePercent, poolAllocationUsdc, since: account.lots.length ? iso(Math.min(...account.lots.map(lot => lot.since))) : null, weightTokenSeconds: weight, sharePercent: totalWeight > 0 ? 100 * weight / totalWeight : 0, cycleStartedAt: iso(engine.dayAt), nextCycleAt: iso(engine.dayAt + DAY), estimatedUsdc: roundMoney(estimate), status: eligibleTokens > 0 ? "active" : "inactive" },
    operations: engine.operations, events: engine.events, history: account.history, treasury: { ...engine.treasury, swapPool: engine.swapPool, burn: account.profile.provider === "native" ? undefined : demoBurnSnapshot(engine, now), currentRound }, rounds: engine.rounds.map(round => ({ ...round, participationSnapshot: (round.source === "calculated_simulation" || account.scriptedAccount && round.source === "seeded_demo") && account.roundParticipation?.[round.id]?.endedAt === round.endedAt ? account.roundParticipation[round.id] : undefined })),
    orchestratorBudget: orchestratorBudget(engine),
  };
}