import test from "node:test";
import assert from "node:assert/strict";
import { advanceDemoLottery, demoLotterySnapshot, ensureDemoLottery } from "./demo-lottery.ts";
import { advanceDemoBurnStory, demoBurnSnapshot } from "./demo-burn-story.ts";
import type { AccountState, EngineState } from "./demo-state.ts";
import { buyLotteryEntries, ensureLotteryEntries } from "./demo-lottery-entries.ts";

const opening = Date.parse("2026-10-07T19:00:00Z"), drawAt = opening + 43_200_000;
function frame(cash = 10) {
  const engine = {
    scheduledStory: 1, price: .04, rounds: [],
    burnStory: { allocations: [], journal: [{ id: "fund", roundId: "seed", at: new Date(opening).toISOString(),
      kind: "wallet_funded", amountUsdc: cash, tokensBettex: 0, source: "modeled_demo" }] },
  } as unknown as EngineState;
  ensureDemoLottery(engine, opening);
  return engine;
}
function wallet(id: string, tokens: number, opted = true) {
  return { profile: { accountId: id, provider: "anonymous" }, bettex: tokens, usdc: 0,
    lots: [{ amount: tokens, since: opening }], history: [],
    lotteryConsent: { participating: opted, confirmedAt: new Date(opening).toISOString() },
  } as unknown as AccountState;
}
test("lottery share counts every paid-range number and the free number, not wallets or array rows", () => {
  const engine = frame(), a = wallet("share-a", 5000), b = wallet("share-b", 20);
  buyLotteryEntries(engine, a, 1001, "share-order", opening, "share-a");
  ensureLotteryEntries(engine, b, opening);
  b.lotteryEntries!.entries.push({ number: "legacy", type: "paid", createdAt: new Date(opening).toISOString() });
  const snapshot = demoLotterySnapshot(engine, a, [a, b], opening)!;
  assert.equal(snapshot.ownActiveNumbers, 1002);
  assert.equal(snapshot.totalActiveNumbers, 1004);
  assert.equal(snapshot.numberSharePercent, 1002 / 1004 * 100);
  assert.equal(a.lotteryEntries!.entries.length, 2);
  b.lotteryConsent!.participating = false;
  assert.equal(demoLotterySnapshot(engine, a, [a, b], opening)!.numberSharePercent, 100);
  assert.equal(demoLotterySnapshot(engine, a, [], opening)!.numberSharePercent, 100);
});
test("inactive, unstaked, future-consent and native wallets contribute no active lottery share", () => {
  const engine = frame(), a = wallet("inactive-a", 100, false), b = wallet("active-b", 100);
  const native = wallet("native", 100); native.profile.provider = "native";
  const late = wallet("late", 100); late.lotteryConsent!.confirmedAt = new Date(opening + 1).toISOString();
  const empty = wallet("empty", 0);
  const snapshot = demoLotterySnapshot(engine, a, [a, b, native, late, empty], opening)!;
  assert.equal(snapshot.ownActiveNumbers, 0);
  assert.equal(snapshot.totalActiveNumbers, 1);
  assert.equal(snapshot.numberSharePercent, 0);
  assert.equal(demoLotterySnapshot(engine, native, [a, b, native], opening), undefined);
  b.bettex = 0; b.lots = [];
  assert.equal(demoLotterySnapshot(engine, a, [a, b, native, late, empty], opening)!.totalActiveNumbers, 0);
  assert.equal(demoLotterySnapshot(engine, a, [], opening)!.numberSharePercent, 0);
});
test("share excludes expired or future paid numbers and counts the guaranteed free number for legacy eligible wallets", () => {
  const engine = frame(), a = wallet("legacy-a", 100), b = wallet("future-b", 100);
  a.lotteryEntries = { drawAt: new Date(drawAt - 86_400_000).toISOString(), receipts: [],
    entries: [{ number: "old", quantity: 90000, type: "paid", createdAt: new Date(opening - 1).toISOString() }] };
  ensureLotteryEntries(engine, b, opening);
  b.lotteryEntries!.entries.push({ number: "future", quantity: 90000, type: "paid", createdAt: new Date(opening + 1).toISOString() });
  const before = structuredClone({ engine, a, b });
  const snapshot = demoLotterySnapshot(engine, a, [a, b], opening)!;
  assert.equal(snapshot.ownActiveNumbers, 1);
  assert.equal(snapshot.totalActiveNumbers, 2);
  assert.equal(snapshot.numberSharePercent, 50);
  assert.deepEqual({ engine, a, b }, before, "displaying share never allocates numbers or changes financial state");
});
test("daily draw is at the real staking midpoint, 04h Sao Paulo; initial rollout never backfills sales", () => {
  const engine = frame();
  assert.equal(new Date(engine.burnLottery!.nextDrawAt).toISOString(), "2026-10-08T07:00:00.000Z");
  const later = frame(); delete later.burnLottery;
  ensureDemoLottery(later, drawAt + 1);
  assert.equal(later.burnLottery!.nextDrawAt, drawAt + 86_400_000);
  const a = wallet("a", 200);
  advanceDemoLottery(engine, [a], drawAt - 1, () => 0);
  assert.equal(a.bettex, 200);
  assert.equal(engine.burnLottery!.draws.length, 0);
});
test("multiple opted-in wallets sell until USDC is exhausted, with partial final purchase at 2x market", () => {
  const engine = frame(), a = wallet("a", 100), b = wallet("b", 200);
  advanceDemoLottery(engine, [a, b], drawAt, () => 0);
  assert.equal(a.bettex, 0); assert.equal(a.usdc, 8);
  assert.equal(b.bettex, 175); assert.equal(b.usdc, 2);
  assert.deepEqual(b.lots, [{ amount: 175, since: drawAt }]);
  const d = engine.burnLottery!.draws[0]!;
  assert.equal(d.purchases.length, 2); assert.equal(d.purchasePriceUsdc, .08);
  assert.equal(d.spentUsdc, 10); assert.equal(d.remainingUsdc, 0);
  const burn = demoBurnSnapshot(engine, drawAt)!;
  assert.equal(burn.walletUsdc, 0); assert.equal(burn.walletBettex, 0);
  assert.equal(burn.totalBurnedBettex, 125);
  assert.equal(a.history[0]!.status, "confirmed");
  assert.equal(engine.burnLottery!.nextDrawAt, drawAt + 86_400_000);
});
test("unconfirmed, opted-out, unstaked, late consent and native wallets are excluded", () => {
  const engine = frame();
  const out = wallet("out", 100, false), native = wallet("native", 100), late = wallet("late", 100), noStake = wallet("none", 100);
  native.profile.provider = "native"; noStake.lots = [];
  late.lotteryConsent!.confirmedAt = new Date(drawAt + 1).toISOString();
  const none = wallet("unconfirmed", 100); delete none.lotteryConsent;
  advanceDemoLottery(engine, [out, native, late, noStake, none], drawAt + 2, () => 0);
  assert.equal(demoBurnSnapshot(engine, drawAt)!.walletUsdc, 10);
  assert.equal(engine.burnLottery!.draws[0]!.status, "no_participants");
  assert.equal(demoLotterySnapshot(engine, native, [], drawAt), undefined);
  assert.equal(demoLotterySnapshot(engine, none, [none], drawAt)!.eligible, true, "can opt in before being a participant");
});
test("empty cash and insufficient eligible balances retain accurate residual budgets", () => {
  const empty = frame(0), a = wallet("a", 1);
  advanceDemoLottery(empty, [a], drawAt, () => 0);
  assert.equal(empty.burnLottery!.draws[0]!.status, "no_budget");
  const small = frame();
  advanceDemoLottery(small, [a], drawAt, () => 0);
  assert.equal(small.burnLottery!.draws[0]!.remainingUsdc, 9.92);
  assert.equal(demoBurnSnapshot(small, drawAt)!.totalBurnedBettex, 1);
});
test("fractional purchases consume the remaining cash without losing precision or conflating held/burned", () => {
  const engine = frame(362.50), a = wallet("a", 12500);
  advanceDemoLottery(engine, [a], drawAt, () => 0);
  assert.equal(a.bettex, 7968.75);
  assert.equal(a.usdc, 362.5);
  assert.equal(demoBurnSnapshot(engine, drawAt)!.totalBurnedBettex, 4531.25);
  assert.equal(demoBurnSnapshot(engine, drawAt)!.walletUsdc, 0);
});
test("persisted draws cannot repeat on reads, restart or next day; private account IDs never leak", () => {
  const engine = frame(), a = wallet("secret-wallet", 1000);
  advanceDemoLottery(engine, [a], drawAt, () => 0);
  const restarted = JSON.parse(JSON.stringify(engine)) as EngineState;
  const saved = JSON.stringify(a);
  advanceDemoLottery(restarted, [a], drawAt + 100, () => 0);
  assert.equal(JSON.stringify(a), saved);
  assert.equal(restarted.burnLottery!.draws.length, 1);
  const snap = demoLotterySnapshot(restarted, a, [a], drawAt)!;
  assert.equal(snap.draws[0]!.purchases[0]!.isOwn, true);
  assert.ok(!JSON.stringify(snap).includes("secret-wallet"));
  advanceDemoLottery(restarted, [a], drawAt + 86_400_000, () => 0);
  assert.equal(restarted.burnLottery!.draws.length, 2);
  assert.equal(restarted.burnLottery!.draws[1]!.status, "no_budget");
   const { lotteryEntries, ...financial } = a;
   const { lotteryEntries: previousEntries, ...previousFinancial } = JSON.parse(saved);
   assert.deepEqual(financial, previousFinancial, "a no-budget draw never changes wallet finances");
   assert.equal(lotteryEntries!.entries.length, 1, "the next daily draw receives a fresh free number");
   assert.notEqual(lotteryEntries!.entries[0]!.number, previousEntries.entries[0].number);
});
test("lottery stops future authored buybacks without erasing completed legacy burns", () => {
  const engine = frame();
  engine.rounds = [{ id: "legacy", status: "paid", buybackUsdc: 5, source: "seeded_demo", endedAt: new Date(opening).toISOString() }] as EngineState["rounds"];
  advanceDemoBurnStory(engine, opening + 3 * 86_400_000);
  assert.equal(demoBurnSnapshot(engine, opening)!.walletUsdc, 15);
  assert.equal(demoBurnSnapshot(engine, opening)!.totalBurnedBettex, 0);
  assert.equal(engine.burnStory!.journal.filter(e => e.kind === "tokens_purchased").length, 0);
});
