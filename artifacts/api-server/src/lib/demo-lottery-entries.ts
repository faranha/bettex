import type { DemoLotteryEntry, DemoLotteryEntryReceipt } from "@workspace/api-zod";
import type { AccountState, EngineState } from "./demo-state.ts";
import { createHash } from "node:crypto";
import { quoteDemoSwap, executeDemoSwap } from "./demo-swap-pool.ts";
import { demoCycleStart } from "./demo-cycle-clock.ts";

export const LOTTERY_ENTRY_USDC = 1;
export const LOTTERY_ENTRY_LIMIT = 1000;
export type LotteryEntries = { drawAt: string; entries: DemoLotteryEntry[]; receipts: DemoLotteryEntryReceipt[] };
const money = (n: number) => Math.round(n * 1e6) / 1e6;

export function hasLotteryStake(account: AccountState, at: number) {
  return account.profile.provider !== "native" && account.bettex > 0 &&
    account.lots.some(lot => lot.amount > 0 && lot.since <= at);
}
function nextNumber(engine: EngineState) {
  const state = engine.burnLottery!;
  const number = (state.nextNumber ?? 0) + 1;
  if (!Number.isSafeInteger(number)) throw new Error("lottery_entry_limit");
  state.nextNumber = number;
  return String(number).padStart(6, "0");
}

/** A free number is assigned to every staked wallet; consent controls activation. */
export function ensureLotteryEntries(engine: EngineState, account: AccountState, now: number) {
  if (!engine.burnLottery || account.profile.provider === "native") return;
  const drawAt = new Date(engine.burnLottery.nextDrawAt).toISOString();
  if (account.lotteryEntries?.drawAt !== drawAt) account.lotteryEntries = { drawAt, entries: [], receipts: [] };
  const state = account.lotteryEntries;
  if (hasLotteryStake(account, now) && !state.entries.some(e => e.type === "free")) {
    state.entries.unshift({ number: nextNumber(engine), type: "free", createdAt: new Date(now).toISOString() });
  }
  return state;
}

/** Pure simulated accounting; the caller persists all effects atomically under the engine lock. */
export function buyLotteryEntries(engine: EngineState, account: AccountState, quantity: number, requestId: string, now: number, accountId: string) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) throw new Error("invalid_lottery_purchase");
  if (!engine.burnLottery || !engine.burnStory || account.profile.provider === "native") throw new Error("lottery_unavailable");
  const drawAt = new Date(engine.burnLottery.nextDrawAt).toISOString();
  const current = account.lotteryEntries?.drawAt === drawAt ? account.lotteryEntries : undefined;
  const existing = current?.receipts.find(r => r.requestId === requestId);
  if (existing) {
    if (existing.quantity !== quantity) throw new Error("invalid_lottery_purchase");
    return existing;
  }
  if (!hasLotteryStake(account, now) || !account.lotteryConsent?.participating) throw new Error("lottery_participation_required");
  if (now >= engine.burnLottery.nextDrawAt) throw new Error("lottery_draw_closed");
  if ((current?.entries.filter(e => e.type === "paid").length ?? 0) + quantity > LOTTERY_ENTRY_LIMIT ||
      !Number.isSafeInteger((engine.burnLottery.nextNumber ?? 0) + quantity + 1)) throw new Error("lottery_entry_limit");
  const cost = quantity * LOTTERY_ENTRY_USDC;
  if (account.usdc < cost) throw new Error("insufficient_balance");
  if (!engine.swapPool) throw new Error("pool_liquidity_unavailable");
  // No operator fee: the full USDC payment buys pool inventory, immediately burned.
  const quote = quoteDemoSwap(engine.swapPool, "USDC", cost, 0);
  const state = ensureLotteryEntries(engine, account, now)!;
  executeDemoSwap(engine.swapPool, quote, now);
  account.usdc = money(account.usdc - cost);
  engine.treasury.assetsUsdc = money(engine.treasury.assetsUsdc + cost);
  engine.price = engine.swapPool.spotPriceUsdc;
  const at = new Date(now).toISOString();
  const entries = Array.from({ length: quantity }, () => ({ number: nextNumber(engine), type: "paid" as const, createdAt: at }));
  const receipt: DemoLotteryEntryReceipt = { requestId, quantity, paidUsdc: cost, burnedBettex: quote.amountOut, createdAt: at, numbers: entries.map(e => e.number) };
  state.entries.push(...entries);
  state.receipts.push(receipt);
  const id = `LOTTERY-ENTRIES-${createHash("sha256").update(`${accountId}:${requestId}`).digest("hex")}`;
  const roundId = new Date(demoCycleStart(now)).toISOString().slice(0, 10);
  engine.burnStory.journal.push(
    { id: `${id}-01-funding`, roundId, at, kind: "wallet_funded", amountUsdc: cost, tokensBettex: 0, source: "modeled_demo" },
    { id: `${id}-02-purchase`, roundId, at, kind: "tokens_purchased", amountUsdc: cost, tokensBettex: quote.amountOut, source: "modeled_demo" },
    { id: `${id}-03-burn`, roundId, at, kind: "tokens_burned", amountUsdc: 0, tokensBettex: quote.amountOut, source: "modeled_demo" },
  );
  account.history.unshift({ id: requestId, kind: "withdraw", asset: "USDC", amount: cost, feeUsdc: 0,
    at, status: "confirmed", destination: "Burn Lottery", sourceWallet: "dollar" });
  return receipt;
}
