import assert from 'node:assert/strict';
import { test } from 'node:test';
import { simulateLaunch, DEFAULT_LAUNCH_ASSUMPTIONS as base } from './launchSimulation.ts';

const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);

test('progressive integer entrants reach 200/600/1000; fees are separate from principal', () => {
  const d = simulateLaunch(base);
  assert.equal(d[6].users, 46);
  assert.equal(d[29].users, 200);
  assert.equal(d[59].users, 600);
  assert.equal(d[89].users, 1000);
  assert.equal(d[89].purchasesUsd, 50000);
  assert.equal(d[89].purchaseFeesUsd, 2500);
  assert.equal(d[89].operatorCostUsd, 900);
  assert.equal(d[89].operatorResultBeforeTaxUsd, 1600);
  assert.ok(d[89].userDays < 1000 * 90);
  assert.equal(d[6].operatorCostUsd, 70);
});

test('1% monthly credits small executable USDC amounts but cannot fund daily $10 withdrawals', () => {
  const d = simulateLaunch(base);
  assert.ok(d[89].requestedWithdrawals > 0);
  assert.equal(d[89].completedWithdrawals, 0);
  assert.equal(d[89].withdrawalFeesUsd, 0);
  assert.ok(d[89].stakerPaidUsd > 0);
  assert.ok(d[89].userWalletsUsd > 0);
  assert.ok(d[89].fractionsReturnedUsd > 0);
  assert.ok(d[89].fractionsReturnedUsd < d[89].userDays * .000001);
});

test('every daily ledger conserves capital and does not double-count split money', () => {
  for (const rate of [-3, 0, 1, 3, 100]) {
    for (const d of simulateLaunch({ ...base, monthlyNetResultPercent: rate })) {
      close(d.purchasesUsd + d.treasuryProfitUsd, d.treasuryTradingBalanceUsd + d.buybackReserveUsd + d.stakerPaidUsd);
      close(d.stakerPaidUsd, d.withdrawalsGrossUsd + d.userWalletsUsd);
      close(d.operatorRevenueUsd, d.purchaseFeesUsd + d.withdrawalFeesUsd);
      close(d.nominalStakerPoolUsd, d.stakerPaidUsd + d.fractionsReturnedUsd);
      close(d.withdrawalsGrossUsd, d.withdrawalsNetUsd + d.withdrawalFeesUsd);
    }
  }
});

test('zero and negative results never create pool, buyback or fictitious withdrawal fees', () => {
  for (const rate of [0, -3]) {
    const d = simulateLaunch({ ...base, monthlyNetResultPercent: rate }).at(-1)!;
    assert.equal(d.nominalStakerPoolUsd, 0);
    assert.equal(d.stakerPaidUsd, 0);
    assert.equal(d.buybackReserveUsd, 0);
    assert.equal(d.completedWithdrawals, 0);
    assert.ok(d.treasuryProfitUsd <= 0);
    assert.ok(d.treasuryTradingBalanceUsd <= d.purchasesUsd);
  }
});

test('withdrawals use settled wallets, deduct fees once and never exceed available money', () => {
  const d = simulateLaunch({ ...base, monthlyNetResultPercent: 100, withdrawalGrossUsd: 3 }).at(-1)!;
  assert.ok(d.completedWithdrawals > 0);
  close(d.withdrawalFeesUsd, d.completedWithdrawals * 2.5);
  assert.ok(d.withdrawalsGrossUsd <= d.stakerPaidUsd);
  assert.ok(d.userWalletsUsd >= -1e-7);
});

test('weekly and monthly cadence count attempts by cohort age, not 1000 people from day one', () => {
  const daily = simulateLaunch(base).at(-1)!;
  for (const frequency of [7, 30] as const) {
    const d = simulateLaunch({ ...base, withdrawalEveryDays: frequency }).at(-1)!;
    assert.ok(d.requestedWithdrawals < daily.requestedWithdrawals);
    close(d.treasuryProfitUsd, daily.treasuryProfitUsd);
    assert.equal(d.withdrawalFeesUsd, 0);
  }
});

test('empty acquisition curve has no sales, strategy profits or fees; costs create explicit gap', () => {
  const d = simulateLaunch({ ...base, monthlyNewUsers: [0, 0, 0] }).at(-1)!;
  assert.equal(d.users, 0);
  assert.equal(d.purchasesUsd, 0);
  assert.equal(d.treasuryProfitUsd, 0);
  assert.equal(d.operatorFundingGapUsd, 900);
  assert.equal(d.operatorResultBeforeTaxUsd, -900);
});

test('invalid inputs fail explicitly', () => {
  assert.throws(() => simulateLaunch({ ...base, monthlyNetResultPercent: NaN }), RangeError);
  assert.throws(() => simulateLaunch({ ...base, withdrawalGrossUsd: 2.5 }), RangeError);
  assert.throws(() => simulateLaunch({ ...base, monthlyNewUsers: [-1, 400, 400] }), RangeError);
  assert.throws(() => simulateLaunch({ ...base, tokenPriceUsd: 0 }), RangeError);
  assert.throws(() => simulateLaunch({ ...base, tokenPriceUsd: .000001 }), RangeError);
  assert.throws(() => simulateLaunch({ ...base, monthlyNetResultPercents: [1, NaN, 1] }), RangeError);
});

test('token price determines sold and auto-staking quantities, not fictitious token appreciation', () => {
  for (const price of [.1, .2]) {
    const d = simulateLaunch({ ...base, tokenPriceUsd: price });
    for (const x of d) {
      close(x.tokensSold * price, x.purchasesUsd);
      close(x.tokensInStaking, x.tokensSold);
      close(x.stakingTokenDays, x.userDays * base.initialPurchaseUsd / price);
      close(x.dailyStakerPaidUsd, x.perTokenPaidTodayUsd * x.tokensInStaking);
      close(x.treasuryGainsUsd - x.treasuryLossesUsd, x.treasuryProfitUsd);
      close(x.purchasesUsd + x.treasuryProfitUsd, x.treasuryTotalAssetsUsd + x.stakerPaidUsd);
    }
    close(d[89].tokensSold, 50000 / price);
  }
});

test('mixed months expose permanent losses and no staking payment during the loss month', () => {
  const d = simulateLaunch({ ...base, monthlyNetResultPercents: [1, -.5, 1.5] });
  assert.ok(d[89].treasuryGainsUsd > 0);
  assert.ok(d[89].treasuryLossesUsd > 0);
  for (const x of d.slice(30, 60)) {
    assert.ok(x.dailyTreasuryProfitUsd < 0);
    assert.equal(x.dailyStakerPaidUsd, 0);
    assert.equal(x.perTokenPaidTodayUsd, 0);
  }
  close(d[29].stakerPaidUsd, d[59].stakerPaidUsd);
  close(d[89].treasuryGainsUsd - d[89].treasuryLossesUsd, d[89].treasuryProfitUsd);
  for (const x of d) {
    close(x.purchasesUsd + x.treasuryProfitUsd, x.treasuryTradingBalanceUsd + x.buybackReserveUsd + x.stakerPaidUsd);
  }
});

test('per-token payments respect purchase date and reconcile with all settled user funds', () => {
  const price = .1;
  const d = simulateLaunch({ ...base, tokenPriceUsd: price, monthlyNetResultPercents: [1, -.5, 1.5] });
  let reconstructed = 0;
  const final = d.at(-1)!;
  for (const x of d) {
    const beforeEntry = x.day > 1 ? d[x.day - 2].perTokenPaidCumulativeUsd : 0;
    const earnedPerToken = final.perTokenPaidCumulativeUsd - beforeEntry;
    reconstructed += x.newTokensSold * earnedPerToken;
    assert.ok(earnedPerToken <= final.perTokenPaidCumulativeUsd + 1e-12);
  }
  close(reconstructed, final.stakerPaidUsd);
  assert.ok(final.perTokenPaidCumulativeUsd > final.perTokenPaidTodayUsd);
});