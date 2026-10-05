import { randomUUID } from "node:crypto";
import type { DemoDashboard, DemoMovement, DemoMovementInput, DemoOperation, DemoEvent, DemoRound } from "@workspace/api-zod";
import { createProposalOperation, progressOrchestration, orchestratorBudget, TERMINAL } from "./orchestrator.ts";

export const DAY = 86_400_000;
export const roundMoney = (value: number) => Math.round(value * 1e6) / 1e6;
export const utcStart = (now: number) => Math.floor(now / DAY) * DAY;
const iso = (now: number) => new Date(now).toISOString();
const communityWeight = 8_000_000 * 86_400;
export type AccountState = {
  profile: DemoDashboard["profile"];
  usdc: number; bettex: number; receivedYield: number;
  lots: { amount: number; since: number }[];
  history: DemoMovement[];
};
export type EngineState = {
  tickAt: number; sequence: number; dayAt: number;
  price: number; brl: number;
  operations: DemoOperation[]; events: DemoEvent[];
  treasury: DemoDashboard["treasury"];
  rounds: DemoRound[];
};
export function seedAccount(now: number): AccountState {
  const start = now - 14 * 3_600_000;
  return {
    profile: { name: "Alex", email: "alex@example.com", accountId: `BX-${randomUUID().slice(0, 8).toUpperCase()}`, memberSince: iso(now - 45 * DAY) },
    usdc: 1280.5, bettex: 12500, receivedYield: 80.5,
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
      { id: iso(utcStart(now) - DAY).slice(0, 10), endedAt: iso(utcStart(now)), status: "paid", eligibleUsdc: 1840, treasuryUsdc: 920, stakingUsdc: 460, buybackUsdc: 460 },
      { id: iso(utcStart(now) - 2 * DAY).slice(0, 10), endedAt: iso(utcStart(now) - DAY), status: "retained", eligibleUsdc: 0, treasuryUsdc: 0, stakingUsdc: 0, buybackUsdc: 0 },
    ],
  };
}
function event(engine: EngineState, now: number, fromAgent: string, toAgent: string, kind: DemoEvent["kind"], reference: string) {
  engine.events.unshift({ id: randomUUID(), at: iso(now), fromAgent, toAgent, kind, reference });
  engine.events = engine.events.slice(0, 40);
}
export function accountWeight(account: AccountState, start: number, end: number) {
  return account.lots.reduce((sum, lot) => sum + lot.amount * Math.max(0, end - Math.max(start, lot.since)) / 1000, 0);
}
// Each missed UTC round is closed once. Idle days have no invented returns.
export function closeCycles(engine: EngineState, accounts: AccountState[], now: number) {
  while (engine.dayAt < utcStart(now)) {
    const end = engine.dayAt + DAY;
    const weights = accounts.map(account => accountWeight(account, engine.dayAt, end));
    const total = communityWeight + weights.reduce((a, b) => a + b, 0);
    const eligible = Math.max(0, roundMoney(engine.treasury.cycleResultUsdc));
    const reservesPass = engine.treasury.assetsUsdc - engine.treasury.committedUsdc >= engine.treasury.reserveUsdc;
    const pays = eligible > 0 && reservesPass && total > 0;
    const staking = pays ? roundMoney(eligible * 0.25) : 0;
    const id = iso(engine.dayAt).slice(0, 10);
    for (const [index, account] of accounts.entries()) {
      const net = Math.floor(staking * weights[index]! / total * 1e6) / 1e6;
      if (net > 0) {
        account.usdc = roundMoney(account.usdc + net);
        account.receivedYield = roundMoney(account.receivedYield + net);
        account.history.unshift({ id: `ROUND-${id}-${account.profile.accountId}`, kind: "distribution", asset: "USDC", amount: net, feeUsdc: 0, at: iso(end), status: "confirmed", destination: "" });
      }
    }
    engine.rounds.unshift({ id, endedAt: iso(end), status: pays ? "paid" : "retained", eligibleUsdc: eligible, treasuryUsdc: pays ? eligible * .5 : eligible, stakingUsdc: staking, buybackUsdc: pays ? eligible * .25 : 0 });
    engine.rounds = engine.rounds.slice(0, 14);
    event(engine, end, "treasury", "orchestrator", "cycle_closed", id);
    engine.dayAt = end;
    engine.treasury.cycleResultUsdc = 0;
  }
}
// The clock is wall time. This script emulates signals, risk, execution and
// reconciliation; it never talks to an exchange, wallet or payment processor.
export function tickEngine(engine: EngineState, now: number) {
  if (now - engine.tickAt < 6000) return;
  engine.tickAt = now;
  engine.sequence++;
  engine.price = roundMoney(.04 * (1 + .012 * Math.sin(engine.sequence / 7)));
  engine.brl = roundMoney(5.25 + .015 * Math.sin(engine.sequence / 13));
  progressOrchestration(engine, now, (from, to, kind, id) => event(engine, now, from, to, kind, id));
  const activeCount = engine.operations.filter(op => !TERMINAL.has(op.status) && op.status !== "awaiting_data").length;
  if ((engine.sequence % 3 === 0 && activeCount < 4) || activeCount === 0) {
    const agents: DemoOperation["agent"][] = ["predictions", "crypto", "sports", "bonus"];
    const agent = agents[engine.sequence % 4]!;
    const id = `OP-${engine.sequence + 3}`;
    engine.operations.unshift(createProposalOperation(id, agent, [120, 180, 250, 90][engine.sequence % 4]!, now, engine.sequence % 7 === 0));
    event(engine, now, agent, "orchestrator", "signal", id);
  }
  // Never discard a pending item or reserved position to trim the recent feed.
  const pending = engine.operations.filter(op => !TERMINAL.has(op.status));
  engine.operations = [...pending, ...engine.operations.filter(op => TERMINAL.has(op.status)).slice(0, Math.max(0, 12 - pending.length))];
  engine.treasury.committedUsdc = orchestratorBudget(engine).reservedUsdc;
}
export class DemoInputError extends Error {}
export function submitMovement(account: AccountState, engine: EngineState, input: DemoMovementInput, now: number) {
  const { kind, amount, asset } = input;
  if (!["receive", "onramp", "swap", "withdraw", "send"].includes(kind) || !["USDC", "BETTEX"].includes(asset) ||
    (["onramp", "withdraw"].includes(kind) && asset !== "USDC") || !Number.isFinite(amount) || amount < .000001 || amount > 100000 ||
    !Number.isFinite(engine.price) || engine.price <= 0) throw new DemoInputError("invalid_movement");
  if ((kind === "send" || kind === "withdraw") && !input.destination?.trim()) throw new DemoInputError("invalid_movement");
  const sourceUsdc = asset === "BETTEX" ? amount * engine.price : amount;
  const fee = kind === "receive" ? 0 : roundMoney(sourceUsdc * (kind === "onramp" ? .002 : kind === "swap" ? .001 : .0005));
  const reverseSwap = kind === "swap" && asset === "BETTEX";
  const outputAsset = kind === "swap" ? (reverseSwap ? "USDC" : "BETTEX") : asset;
  // A sale pays its fee from USD proceeds, not from an unrelated USD balance.
  const outputAmount = kind === "swap" ? roundMoney(reverseSwap ? sourceUsdc - fee : amount / engine.price) : kind === "onramp" ? roundMoney(amount - fee) : amount;
  if (outputAmount <= 0) throw new DemoInputError("invalid_movement");
  const debit = kind === "swap" || kind === "withdraw" || kind === "send";
  const usdcCost = debit && !reverseSwap ? roundMoney(asset === "USDC" ? amount + fee : fee) : 0;
  const tokenCost = debit && asset === "BETTEX" ? amount : 0;
  if (account.usdc < usdcCost || account.bettex < tokenCost) throw new DemoInputError("insufficient_balance");
  account.usdc = roundMoney(account.usdc - usdcCost);
  if (kind === "withdraw") account.receivedYield = Math.max(0, roundMoney(account.receivedYield - usdcCost));
  if (tokenCost > 0) {
    account.bettex = roundMoney(account.bettex - tokenCost);
    // Any exit cancels all prior unpaid weight, including the remaining balance.
    account.lots = account.bettex > 0 ? [{ amount: account.bettex, since: now }] : [];
  }
  // Conversion output is locked now, in either direction, not on settlement.
  account.history.unshift({ id: input.requestId, kind, asset: outputAsset, amount: outputAmount, feeUsdc: fee, at: iso(now), status: "pending", destination: input.destination?.trim() ?? "", ...(kind === "swap" ? { sourceAsset: asset, sourceAmount: amount } : {}) });
}
export function settleMovements(account: AccountState, now: number) {
  for (const movement of account.history) {
    if (movement.status !== "pending" || now - Date.parse(movement.at) < 6000) continue;
    if (["receive", "onramp", "swap"].includes(movement.kind)) {
      if (movement.asset === "BETTEX") {
        account.bettex = roundMoney(account.bettex + movement.amount);
        account.lots.push({ amount: movement.amount, since: now });
      } else account.usdc = roundMoney(account.usdc + movement.amount);
    }
    movement.status = "confirmed";
  }
  // A display-history limit must never discard commands still awaiting settlement.
  let completed = 0;
  account.history = account.history.filter(movement => movement.status === "pending" || ++completed <= 100);
}
export function dashboard(account: AccountState, engine: EngineState, now: number, allAccounts: AccountState[] = [account]): DemoDashboard {
  const weight = accountWeight(account, engine.dayAt, now);
  const totalWeight = communityWeight + allAccounts.reduce((sum, item) => sum + accountWeight(item, engine.dayAt, now), 0);
  const estimate = Math.max(0, engine.treasury.cycleResultUsdc) * .25 * weight / totalWeight;
  return {
    serverNow: iso(now), profile: account.profile,
    balances: { usdc: account.usdc, bettex: account.bettex, receivedYield: account.receivedYield, brlPerUsdc: engine.brl, bettexUsdc: engine.price, updatedAt: iso(engine.tickAt) },
    staking: { eligibleTokens: account.bettex, since: account.lots.length ? iso(Math.min(...account.lots.map(lot => lot.since))) : null, weightTokenSeconds: weight, sharePercent: totalWeight > 0 ? 100 * weight / totalWeight : 0, cycleStartedAt: iso(engine.dayAt), nextCycleAt: iso(engine.dayAt + DAY), estimatedUsdc: roundMoney(estimate), status: account.bettex > 0 ? "active" : "inactive" },
    operations: engine.operations, events: engine.events, history: account.history, treasury: engine.treasury, rounds: engine.rounds,
    orchestratorBudget: orchestratorBudget(engine),
  };
}