import { createHash, randomInt } from "node:crypto";
import type { DemoLottery, DemoLotteryDraw, DemoLotteryPurchase } from "@workspace/api-zod";
import type { AccountState, EngineState } from "./demo-state.ts";
import { demoCycleStart, DEMO_DAY } from "./demo-cycle-clock.ts";
import { demoBurnSnapshot } from "./demo-burn-story.ts";
import { ensureLotteryEntries, hasLotteryStake, LOTTERY_ENTRY_USDC } from "./demo-lottery-entries.ts";

const SCALE = 1_000_000;
const units = (n: number) => Math.round(n * SCALE);
const value = (n: number) => n / SCALE;
type Purchase = Omit<DemoLotteryPurchase, "isOwn"> & { accountId: string };
type Draw = Omit<DemoLotteryDraw, "purchases"> & { purchases: Purchase[] };
export type DemoLotteryState = { nextDrawAt: number; draws: Draw[]; nextNumber?: number };

export function ensureDemoLottery(engine: EngineState, now: number) {
  if (!engine.scheduledStory) return;
  const midpoint = demoCycleStart(now) + DEMO_DAY / 2;
  // Start prospectively: old demo balances and history are not retroactively sold.
  engine.burnLottery ??= { nextDrawAt: midpoint > now ? midpoint : midpoint + DEMO_DAY, draws: [] };
}

function eligible(account: AccountState, at: number) {
  return hasLotteryStake(account, at);
}
function entered(account: AccountState, at: number) {
  return eligible(account, at) && account.lotteryConsent?.participating === true &&
    Date.parse(account.lotteryConsent.confirmedAt) <= at;
}

/** Called under the shared engine/account transaction lock. Never signs or submits an order. */
export function advanceDemoLottery(engine: EngineState, accounts: AccountState[], now: number, pick = randomInt) {
  ensureDemoLottery(engine, now);
  const state = engine.burnLottery;
  if (!state || !engine.burnStory || !Number.isFinite(engine.price) || engine.price <= 0) return;
  const priceUnits = units(engine.price) * 2;
  if (!Number.isSafeInteger(priceUnits) || priceUnits <= 0) return;
  while (state.nextDrawAt <= now) {
    const at = state.nextDrawAt;
    const id = `DEMO-LOTTERY-${new Date(at).toISOString()}`;
    if (state.draws.some(draw => draw.id === id)) { state.nextDrawAt += DEMO_DAY; continue; }
    let cash = units(demoBurnSnapshot(engine, now)!.walletUsdc);
    const budget = cash;
    for (const account of accounts) ensureLotteryEntries(engine, account, at);
    const candidates = accounts.filter(account => entered(account, at)).map(account => ({
      account, entries: account.lotteryEntries!.entries.filter(entry => Date.parse(entry.createdAt) <= at),
    })).filter(candidate => candidate.entries.length > 0);
    const purchases: Purchase[] = [];
    while (cash > 0 && candidates.length) {
      // Each number has equal weight. A winning wallet is removed after its sale.
      const totalEntries = candidates.reduce((n, candidate) => n + candidate.entries.length, 0);
      let ticketIndex = pick(totalEntries);
      let candidateIndex = 0;
      while (ticketIndex >= candidates[candidateIndex]!.entries.length) ticketIndex -= candidates[candidateIndex++]!.entries.length;
      const { account, entries } = candidates.splice(candidateIndex, 1)[0]!;
      const winningNumber = entries[ticketIndex]!.number;
      const affordable = Number(BigInt(cash) * BigInt(SCALE) / BigInt(priceUnits));
      const tokenUnits = Math.min(units(account.bettex), affordable);
      if (tokenUnits <= 0) break;
      // Round the USDC payment up to the smallest unit, never beyond the budget.
      const payment = Number((BigInt(tokenUnits) * BigInt(priceUnits) + BigInt(SCALE - 1)) / BigInt(SCALE));
      if (payment > cash) throw new Error("Lottery purchase exceeds its USDC budget");
      const tokens = value(tokenUnits), paid = value(payment);
      const accountId = account.profile.accountId;
      const label = createHash("sha256").update(accountId).digest("hex").slice(0, 8).toUpperCase();
      const purchaseId = `${id}-${label}`;
      purchases.push({ accountId, walletLabel: `DEMO-${label}`, tokensBettex: tokens, paidUsdc: paid, winningNumber });
      account.bettex = value(units(account.bettex) - tokenUnits);
      account.usdc = value(units(account.usdc) + payment);
      // Any BETTEX exit resets ALL prior unpaid weight, also for remaining tokens.
      account.lots = account.bettex > 0 ? [{ amount: account.bettex, since: now }] : [];
      account.history.unshift({
        id: purchaseId, kind: "swap", asset: "USDC", amount: paid, feeUsdc: 0,
        at: new Date(now).toISOString(), status: "confirmed", destination: "Burn Lottery",
        sourceWallet: "dollar", sourceAsset: "BETTEX", sourceAmount: tokens,
      });
      const roundId = new Date(demoCycleStart(at)).toISOString().slice(0, 10);
      engine.burnStory.journal.push(
        { id: `${purchaseId}-01-purchase`, roundId, at: new Date(now).toISOString(), kind: "tokens_purchased", amountUsdc: paid, tokensBettex: tokens, source: "modeled_demo" },
        { id: `${purchaseId}-02-burn`, roundId, at: new Date(now).toISOString(), kind: "tokens_burned", amountUsdc: 0, tokensBettex: tokens, source: "modeled_demo" },
      );
      cash -= payment;
    }
    state.draws.push({
      id, scheduledAt: new Date(at).toISOString(), executedAt: new Date(now).toISOString(),
      status: purchases.length ? "executed" : budget === 0 ? "no_budget" : "no_participants",
      budgetUsdc: value(budget), spentUsdc: value(budget - cash), remainingUsdc: value(cash),
      referencePriceUsdc: value(priceUnits / 2), purchasePriceUsdc: value(priceUnits), purchases,
    });
    state.nextDrawAt += DEMO_DAY;
  }
}

export function demoLotterySnapshot(engine: EngineState, account: AccountState, accounts: AccountState[], now: number): DemoLottery | undefined {
  if (account.profile.provider === "native" || !engine.burnLottery) return undefined;
  return {
    source: "modeled_demo", nextDrawAt: new Date(engine.burnLottery.nextDrawAt).toISOString(),
    purchasePriceUsdc: value(units(engine.price) * 2),
    participating: !!account.lotteryConsent?.participating, eligible: eligible(account, now),
    participants: accounts.filter(a => entered(a, now)).length,
    entryPriceUsdc: LOTTERY_ENTRY_USDC,
    entries: account.lotteryEntries?.drawAt === new Date(engine.burnLottery.nextDrawAt).toISOString() ? account.lotteryEntries.entries : [],
    entryReceipts: account.lotteryEntries?.drawAt === new Date(engine.burnLottery.nextDrawAt).toISOString() ? account.lotteryEntries.receipts : [],
    draws: [...engine.burnLottery.draws].reverse().map(({ purchases, ...draw }) => ({
      ...draw, purchases: purchases.map(({ accountId, ...purchase }) => ({
        ...purchase, isOwn: accountId === account.profile.accountId,
      })),
    })),
  };
}
