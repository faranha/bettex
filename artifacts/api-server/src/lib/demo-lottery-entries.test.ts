import test from "node:test";
import assert from "node:assert/strict";
import type { AccountState, EngineState } from "./demo-state.ts";
import { buyLotteryEntries, ensureLotteryEntries, entryQuantity, normalizeEntryReceipt } from "./demo-lottery-entries.ts";
import { createDemoSwapPool } from "./demo-swap-pool.ts";
import { demoBurnSnapshot } from "./demo-burn-story.ts";
import { advanceDemoLottery } from "./demo-lottery.ts";

const now = Date.parse("2026-10-08T01:00:00Z");
const drawAt = Date.parse("2026-10-08T07:00:00Z");
function fixture(id = "alice") {
  const engine = { scheduledStory: 1, price: .04, treasury: { assetsUsdc: 25000 },
    burnLottery: { nextDrawAt: drawAt, draws: [] }, burnStory: { allocations: [], journal: [] },
    swapPool: createDemoSwapPool(25000, now) } as unknown as EngineState;
  const account = { profile: { accountId: id, provider: "anonymous" }, usdc: 20, receivedYield: 3, bettex: 100,
    lots: [{ amount: 100, since: now - 3600000 }], history: [],
    lotteryConsent: { participating: true, confirmedAt: new Date(now).toISOString() } } as unknown as AccountState;
  return { engine, account };
}
test("every staked wallet gets one unique free number, even before opting in; reload does not regenerate it", () => {
  const { engine, account } = fixture();
  account.lotteryConsent!.participating = false;
  const a = ensureLotteryEntries(engine, account, now)!;
  assert.equal(a.entries.length, 1);
  assert.equal(a.entries[0]!.type, "free");
  assert.deepEqual(ensureLotteryEntries(engine, account, now)!.entries, a.entries);
  const other = fixture("bob").account;
  assert.notEqual(ensureLotteryEntries(engine, other, now)!.entries[0]!.number, a.entries[0]!.number);
  engine.burnLottery!.nextDrawAt += 86400000;
  assert.notEqual(ensureLotteryEntries(engine, account, now)!.entries[0]!.number, a.entries[0]!.number);
});
test("native and unstaked wallets never receive simulated free entries", () => {
  const { engine, account } = fixture();
  account.bettex = 0; account.lots = [];
  assert.equal(ensureLotteryEntries(engine, account, now)!.entries.length, 0);
  account.profile.provider = "native";
  assert.equal(ensureLotteryEntries(engine, account, now), undefined);
});
test("1 BETTEX per paid number is directly burned; exits reset unpaid weight without touching USDC or AMM", () => {
  const { engine, account } = fixture();
  const pool = structuredClone(engine.swapPool), treasury = structuredClone(engine.treasury);
  const r = buyLotteryEntries(engine, account, 3, "order-1", now, "alice");
  assert.equal(r.paidAsset, "BETTEX"); assert.equal(r.paidAmount, 3); assert.equal(r.burnedBettex, 3);
  assert.equal(account.usdc, 20); assert.equal(account.bettex, 97); assert.equal(account.receivedYield, 3);
  assert.deepEqual(account.lots, [{ amount: 97, since: now }]);
  assert.equal(account.lotteryEntries!.entries.filter(e => e.type === "free").length, 1);
  assert.equal(account.lotteryEntries!.entries.reduce((sum, e) => sum + entryQuantity(e), 0), 4);
  assert.equal(r.firstNumber, "000002"); assert.equal(r.lastNumber, "000004");
  const burn = demoBurnSnapshot(engine, now)!;
  assert.equal(burn.walletUsdc, 0); assert.equal(burn.walletBettex, 0); assert.equal(burn.totalBurnedBettex, r.burnedBettex);
  assert.deepEqual(engine.swapPool, pool); assert.deepEqual(engine.treasury, treasury);
  assert.equal(account.history[0]!.feeUsdc, 0);
});
test("replaying an order generates no new numbers, debit, or burn; changed quantity is rejected", () => {
  const { engine, account } = fixture();
  const r = buyLotteryEntries(engine, account, 2, "same", now, "alice");
  const before = structuredClone({ engine, account });
  assert.deepEqual(buyLotteryEntries(engine, account, 2, "same", now, "alice"), r);
  assert.deepEqual({ engine, account }, before);
  assert.throws(() => buyLotteryEntries(engine, account, 3, "same", now, "alice"), /invalid_lottery_purchase/);
});
test("entry payments increase the burned total without using or increasing an existing prize balance", () => {
  const { engine, account } = fixture();
  engine.burnStory!.journal.push({ id: "existing-prize", roundId: "prior", at: new Date(now).toISOString(),
    kind: "wallet_funded", amountUsdc: 12.5, tokensBettex: 0, source: "modeled_demo" });
  const before = demoBurnSnapshot(engine, now)!;
  const receipt = buyLotteryEntries(engine, account, 3, "entry-only", now, "alice");
  const after = demoBurnSnapshot(engine, now)!;
  assert.equal(after.walletUsdc, before.walletUsdc);
  assert.equal(after.walletUsdc, 12.5);
  assert.equal(after.walletBettex, before.walletBettex);
  assert.equal(after.totalBurnedBettex - before.totalBurnedBettex, receipt.burnedBettex);
});
test("invalid quantities, insufficient balance, nonparticipation, and closed draw make no financial changes", () => {
  for (const scenario of ["quantity", "balance", "consent", "closed", "native"] as const) {
    const { engine, account } = fixture();
    if (scenario === "balance") account.bettex = .5;
    if (scenario === "consent") account.lotteryConsent!.participating = false;
    if (scenario === "native") account.profile.provider = "native";
    const before = structuredClone({ engine, account });
    assert.throws(() => buyLotteryEntries(engine, account, scenario === "quantity" ? 1.5 : 1, "bad", scenario === "closed" ? drawAt : now, "alice"));
    assert.deepEqual({ engine, account }, before);
  }
});
test("purchased numbers add equal-weight chances but a wallet is selected at most once per draw", () => {
  const { engine, account } = fixture();
  const other = fixture("bob").account;
  const r = buyLotteryEntries(engine, account, 2, "weighted", now, "alice");
  engine.burnStory!.journal.push({ id: "draw-fund", roundId: "fixture", at: new Date(now).toISOString(), kind: "wallet_funded",
    amountUsdc: 1, tokensBettex: 0, source: "modeled_demo" });
  let choices = 0;
  advanceDemoLottery(engine, [account, other], drawAt, total => { choices = total; return 2; });
  const draw = engine.burnLottery!.draws[0]!;
  assert.equal(choices, 4); assert.equal(draw.purchases.length, 1);
  assert.equal(draw.purchases[0]!.winningNumber, r.numbers[1]);
  assert.equal(draw.purchases[0]!.walletLabel.startsWith("DEMO-"), true);
});
test("there are no per-order or per-draw business caps; millions of unique numbers allocate as compact ranges", () => {
  const { engine, account } = fixture();
  account.bettex = 20_000_000;
  const first = buyLotteryEntries(engine, account, 1001, "large", now, "alice");
  const second = buyLotteryEntries(engine, account, 10_000_000, "larger", now, "alice");
  assert.equal(first.quantity, 1001);
  assert.equal(Number(second.firstNumber), Number(first.lastNumber) + 1);
  assert.equal(account.lotteryEntries!.entries.length, 3);
  assert.equal(account.lotteryEntries!.entries.reduce((sum, e) => sum + entryQuantity(e), 0), 10_001_002);
  assert.equal(account.bettex, 9_998_999);
  assert.equal(second.numbers.length, 2);
  assert.equal(demoBurnSnapshot(engine, now)!.totalBurnedBettex, 10_001_001);
});
test("burning the full balance leaves no stake; old USDC receipts remain historical USDC facts", () => {
  const { engine, account } = fixture();
  buyLotteryEntries(engine, account, 100, "all", now, "alice");
  assert.deepEqual(account.lots, []); assert.equal(account.bettex, 0);
  const old = { requestId: "legacy", quantity: 3, paidUsdc: 3, burnedBettex: 74,
    createdAt: new Date(now).toISOString(), numbers: ["1", "2", "3"] } as unknown as Parameters<typeof normalizeEntryReceipt>[0];
  assert.equal(normalizeEntryReceipt(old).paidAsset, "USDC");
  assert.equal(normalizeEntryReceipt(old).paidAmount, 3);
});
test("middle-of-range tickets win and cryptographic selection supports ticket totals beyond randomInt's 48-bit bound", () => {
  const { engine, account } = fixture();
  account.bettex = 2000;
  const r = buyLotteryEntries(engine, account, 1001, "middle", now, "alice");
  engine.burnStory!.journal.push({ id: "fund", roundId: "fixture", at: new Date(now).toISOString(),
    kind: "wallet_funded", amountUsdc: 1, tokensBettex: 0, source: "modeled_demo" });
  advanceDemoLottery(engine, [account], drawAt, () => 501);
  assert.equal(engine.burnLottery!.draws[0]!.purchases[0]!.winningNumber, String(Number(r.firstNumber) + 500).padStart(6, "0"));
  const wide = fixture();
  ensureLotteryEntries(wide.engine, wide.account, now);
  wide.account.lotteryEntries!.entries.push({ number: "000002", quantity: 2 ** 49, type: "paid", createdAt: new Date(now).toISOString() });
  wide.engine.burnLottery!.nextNumber = 2 ** 49 + 1;
  wide.engine.burnStory!.journal.push({ id: "wide-fund", roundId: "fixture", at: new Date(now).toISOString(),
    kind: "wallet_funded", amountUsdc: 1, tokensBettex: 0, source: "modeled_demo" });
  assert.doesNotThrow(() => advanceDemoLottery(wide.engine, [wide.account], drawAt));
  assert.ok(Number(wide.engine.burnLottery!.draws[0]!.purchases[0]!.winningNumber) <= 2 ** 49 + 1);
});
