import test from "node:test";
import assert from "node:assert/strict";
import type { AccountState, EngineState } from "./demo-state.ts";
import { buyLotteryEntries, ensureLotteryEntries } from "./demo-lottery-entries.ts";
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
test("1 USDC per paid number is fully converted and burned, with no fee or staking/earnings debit", () => {
  const { engine, account } = fixture();
  const lots = structuredClone(account.lots), poolTokens = engine.swapPool!.reserveBettex;
  const r = buyLotteryEntries(engine, account, 3, "order-1", now, "alice");
  assert.equal(r.paidUsdc, 3); assert.equal(r.numbers.length, 3);
  assert.equal(account.usdc, 17); assert.equal(account.bettex, 100); assert.equal(account.receivedYield, 3);
  assert.deepEqual(account.lots, lots);
  assert.equal(account.lotteryEntries!.entries.filter(e => e.type === "free").length, 1);
  assert.equal(new Set(account.lotteryEntries!.entries.map(e => e.number)).size, 4);
  const burn = demoBurnSnapshot(engine, now)!;
  assert.equal(burn.walletUsdc, 0); assert.equal(burn.walletBettex, 0); assert.equal(burn.totalBurnedBettex, r.burnedBettex);
  assert.equal(engine.swapPool!.reserveUsdc, 25003);
  assert.ok(Math.abs(poolTokens - engine.swapPool!.reserveBettex - r.burnedBettex) < .000001);
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
    if (scenario === "balance") account.usdc = 0;
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
test("the per-wallet paid-entry limit is enforced without losing the free number or charging the excess", () => {
  const { engine, account } = fixture();
  account.usdc = 2000;
  for (let i = 0; i < 10; i++) buyLotteryEntries(engine, account, 100, `batch-${i}`, now, "alice");
  assert.equal(account.lotteryEntries!.entries.length, 1001);
  const before = structuredClone({ engine, account });
  assert.throws(() => buyLotteryEntries(engine, account, 1, "excess", now, "alice"), /lottery_entry_limit/);
  assert.deepEqual({ engine, account }, before);
});
