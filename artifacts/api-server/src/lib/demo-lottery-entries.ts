import type { DemoLotteryEntry, DemoLotteryEntryReceipt } from "@workspace/api-zod";
import type { AccountState, EngineState } from "./demo-state.ts";
import { createHash } from "node:crypto";
import { demoCycleStart } from "./demo-cycle-clock.ts";

export const LOTTERY_ENTRY_BETTEX = 1;
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
export const entryQuantity = (entry: DemoLotteryEntry) => entry.quantity ?? 1;
export function normalizeEntryReceipt(receipt: DemoLotteryEntryReceipt): DemoLotteryEntryReceipt {
  // Historical USDC purchases remain USDC facts; never reinterpret or reverse them.
  const paidAmount = receipt.paidAmount ?? receipt.paidUsdc;
  if (paidAmount === undefined || !Number.isFinite(paidAmount) || paidAmount <= 0) throw new Error("lottery_receipt_unavailable");
  return { ...receipt, paidAsset: receipt.paidAsset ?? "USDC", paidAmount };
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
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error("invalid_lottery_purchase");
  if (!engine.burnLottery || !engine.burnStory || account.profile.provider === "native") throw new Error("lottery_unavailable");
  const drawAt = new Date(engine.burnLottery.nextDrawAt).toISOString();
  const current = account.lotteryEntries?.drawAt === drawAt ? account.lotteryEntries : undefined;
  const existing = current?.receipts.find(r => r.requestId === requestId);
  if (existing) {
    if (existing.quantity !== quantity) throw new Error("invalid_lottery_purchase");
    return normalizeEntryReceipt(existing);
  }
  if (!hasLotteryStake(account, now) || !account.lotteryConsent?.participating ||
      !(Date.parse(account.lotteryConsent.confirmedAt) <= now)) throw new Error("lottery_participation_required");
  if (now >= engine.burnLottery.nextDrawAt) throw new Error("lottery_draw_closed");
  const cost = quantity * LOTTERY_ENTRY_BETTEX;
  if (account.bettex < cost) throw new Error("insufficient_balance");
  if (!Number.isSafeInteger((engine.burnLottery.nextNumber ?? 0) + quantity + 1)) throw new Error("lottery_number_space_unavailable");
  const state = ensureLotteryEntries(engine, account, now)!;
  account.bettex = money(account.bettex - cost);
  // Same exit rule as other BETTEX exits: cancel ALL previous unpaid weight.
  account.lots = account.bettex > 0 ? [{ amount: account.bettex, since: now }] : [];
  const at = new Date(now).toISOString();
  // Allocate a persisted contiguous range in O(1), not an array proportional
  // to quantity. Every number in the range is independently eligible to win.
  const first = (engine.burnLottery.nextNumber ?? 0) + 1;
  const last = first + quantity - 1;
  engine.burnLottery.nextNumber = last;
  const firstNumber = String(first).padStart(6, "0"), lastNumber = String(last).padStart(6, "0");
  const receipt: DemoLotteryEntryReceipt = { requestId, quantity, paidAsset: "BETTEX", paidAmount: cost,
    burnedBettex: cost, createdAt: at, firstNumber, lastNumber,
    numbers: quantity === 1 ? [firstNumber] : [firstNumber, lastNumber] };
  state.entries.push({ number: firstNumber, quantity, type: "paid", createdAt: at });
  state.receipts.push(receipt);
  const id = `LOTTERY-ENTRIES-${createHash("sha256").update(`${accountId}:${requestId}`).digest("hex")}`;
  const roundId = new Date(demoCycleStart(now)).toISOString().slice(0, 10);
  engine.burnStory.journal.push(
    { id: `${id}-01-receipt`, roundId, at, kind: "tokens_received", amountUsdc: 0, tokensBettex: cost, source: "modeled_demo" },
    { id: `${id}-02-burn`, roundId, at, kind: "tokens_burned", amountUsdc: 0, tokensBettex: cost, source: "modeled_demo" },
  );
  account.history.unshift({ id: requestId, kind: "withdraw", asset: "BETTEX", amount: cost, feeUsdc: 0,
    at, status: "confirmed", destination: "Burn Lottery", sourceWallet: "dollar" });
  return receipt;
}
