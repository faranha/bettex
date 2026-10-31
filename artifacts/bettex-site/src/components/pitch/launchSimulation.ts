// HISTORICAL SCENARIO: retained for compatibility with legacy evidence and tests.
// Not the current public economics. See PROJECT.md before any reuse.
import { documentationTokenomics } from '../../lib/tokenomics.ts';

export interface LaunchAssumptions {
  monthlyNewUsers: readonly [number, number, number];
  initialPurchaseUsd: number;
  monthlyNetResultPercent: number;
  monthlyOperatorCostUsd: number;
  withdrawalEveryDays: 1 | 7 | 30;
  withdrawalGrossUsd: number;
  tokenPriceUsd?: number;
  monthlyNetResultPercents?: readonly [number, number, number];
}

export const SERVICE_FEE_USD = 2.5;
// Illustrative USDC settlement precision; actual connector precision must be validated.
export const SETTLEMENT_UNITS_PER_USD = 1_000_000;
export const ILLUSTRATIVE_TOKEN_PRICE_USD = .1;
export const PUBLIC_TOKEN_ALLOCATION = documentationTokenomics.communityAllocation;
export const DEFAULT_LAUNCH_ASSUMPTIONS: LaunchAssumptions = {
  monthlyNewUsers: [200, 400, 400],
  initialPurchaseUsd: 50,
  monthlyNetResultPercent: 1,
  monthlyOperatorCostUsd: 300,
  withdrawalEveryDays: 1,
  withdrawalGrossUsd: 10,
};

export interface LaunchDay {
  day: number;
  newUsers: number;
  users: number;
  userDays: number;
  purchasesUsd: number;
  purchaseFeesUsd: number;
  requestedWithdrawals: number;
  completedWithdrawals: number;
  withdrawalsGrossUsd: number;
  withdrawalsNetUsd: number;
  withdrawalFeesUsd: number;
  userMovementUsd: number;
  operatorRevenueUsd: number;
  operatorCostUsd: number;
  operatorResultBeforeTaxUsd: number;
  operatorFundingGapUsd: number;
  treasuryProfitUsd: number;
  nominalStakerPoolUsd: number;
  stakerPaidUsd: number;
  fractionsReturnedUsd: number;
  treasuryRetainedUsd: number;
  buybackReserveUsd: number;
  treasuryTradingBalanceUsd: number;
  userWalletsUsd: number;
  newTokensSold: number;
  tokensSold: number;
  tokensInStaking: number;
  stakingTokenDays: number;
  dailyTreasuryProfitUsd: number;
  treasuryGainsUsd: number;
  treasuryLossesUsd: number;
  dailyStakerPaidUsd: number;
  perTokenPaidTodayUsd: number;
  perTokenPaidCumulativeUsd: number;
  treasuryTotalAssetsUsd: number;
  netResultRatePercent: number;
}

/** 90-day cash-flow illustration, not a forecast or the production staking engine.
 * Equal token purchases at a fixed price; only these buyers have eligible weight.
 * Entries are available at the start of their day. Daily rounds settle executable
 * units of 0.000001 USDC into wallets; non-executable fractions return immediately.
 * Wallet USDC is settled money, not unpaid rights rolled into another round.
 */
export function simulateLaunch(a: LaunchAssumptions): LaunchDay[] {
  const tokenPrice = a.tokenPriceUsd ?? ILLUSTRATIVE_TOKEN_PRICE_USD;
  const rates = a.monthlyNetResultPercents ?? [a.monthlyNetResultPercent, a.monthlyNetResultPercent, a.monthlyNetResultPercent];
  if (
    a.monthlyNewUsers.length !== 3 ||
    a.monthlyNewUsers.some(n => !Number.isInteger(n) || n < 0 || n > 2000) ||
    !Number.isFinite(a.initialPurchaseUsd) || a.initialPurchaseUsd < 0 ||
    !Number.isFinite(a.monthlyNetResultPercent) || a.monthlyNetResultPercent < -100 || a.monthlyNetResultPercent > 100 ||
    !Number.isFinite(a.monthlyOperatorCostUsd) || a.monthlyOperatorCostUsd < 0 ||
    ![1, 7, 30].includes(a.withdrawalEveryDays) ||
    !Number.isFinite(a.withdrawalGrossUsd) || a.withdrawalGrossUsd <= SERVICE_FEE_USD ||
    !Number.isFinite(tokenPrice) || tokenPrice <= 0 ||
    rates.length !== 3 || rates.some(r => !Number.isFinite(r) || r < -100 || r > 100) ||
    a.monthlyNewUsers.reduce((sum, x) => sum + x, 0) * a.initialPurchaseUsd / tokenPrice > PUBLIC_TOKEN_ALLOCATION
  ) throw new RangeError();

  const cohorts: { count: number; joinedDay: number; walletUsd: number }[] = [];
  const days: LaunchDay[] = [];
  let users = 0, userDays = 0, purchases = 0, purchaseFees = 0;
  let requested = 0, completed = 0, withdrawals = 0, withdrawalFees = 0;
  let profit = 0, pool = 0, paid = 0, fractions = 0, retained = 0, buyback = 0, capital = 0;
  let gains = 0, losses = 0, perTokenPaid = 0;
  for (let day = 1; day <= 90; day++) {
    const month = Math.floor((day - 1) / 30);
    const inMonth = (day - 1) % 30 + 1;
    const target = a.monthlyNewUsers[month];
    const newUsers = Math.floor(target * inMonth / 30) - Math.floor(target * (inMonth - 1) / 30);
    if (newUsers > 0) cohorts.push({ count: newUsers, joinedDay: day, walletUsd: 0 });
    users += newUsers;
    userDays += users;
    purchases += newUsers * a.initialPurchaseUsd;
    purchaseFees += newUsers * SERVICE_FEE_USD;
    capital += newUsers * a.initialPurchaseUsd;
    const dailyProfit = capital * rates[month] / 100 / 30;
    gains += Math.max(0, dailyProfit);
    losses += Math.max(0, -dailyProfit);
    const paidBefore = paid;
    profit += dailyProfit;
    if (dailyProfit > 0 && users > 0) {
      const dailyPool = dailyProfit * .25;
      const perUser = Math.floor(dailyPool / users * SETTLEMENT_UNITS_PER_USD + 1e-10) / SETTLEMENT_UNITS_PER_USD;
      const dailyPaid = perUser * users;
      const dailyFractions = Math.max(0, dailyPool - dailyPaid);
      pool += dailyPool;
      paid += dailyPaid;
      fractions += dailyFractions;
      retained += dailyProfit * .5;
      buyback += dailyProfit * .25;
      capital += dailyProfit * .5 + dailyFractions;
      for (const cohort of cohorts) cohort.walletUsd += perUser;
    } else {
      // Losses reduce strategy capital; neither distribution nor buyback is funded.
      capital += dailyProfit;
    }
    const tokens = purchases / tokenPrice;
    const dailyPaid = paid - paidBefore;
    const perTokenToday = tokens > 0 ? dailyPaid / tokens : 0;
    // Reference token held continuously since the first eligible round.
    // Later purchases earn only the increments after their own entry day.
    perTokenPaid += perTokenToday;
    for (const cohort of cohorts) {
      if ((day - cohort.joinedDay + 1) % a.withdrawalEveryDays !== 0) continue;
      requested += cohort.count;
      if (cohort.walletUsd + 1e-9 < a.withdrawalGrossUsd) continue;
      cohort.walletUsd -= a.withdrawalGrossUsd;
      completed += cohort.count;
      withdrawals += cohort.count * a.withdrawalGrossUsd;
      withdrawalFees += cohort.count * SERVICE_FEE_USD;
    }
    const revenue = purchaseFees + withdrawalFees;
    const cost = a.monthlyOperatorCostUsd * day / 30;
    days.push({
      day, newUsers, users, userDays,
      purchasesUsd: purchases, purchaseFeesUsd: purchaseFees,
      requestedWithdrawals: requested, completedWithdrawals: completed,
      withdrawalsGrossUsd: withdrawals, withdrawalsNetUsd: withdrawals - withdrawalFees,
      withdrawalFeesUsd: withdrawalFees,
      userMovementUsd: purchases + withdrawals,
      operatorRevenueUsd: revenue, operatorCostUsd: cost,
      operatorResultBeforeTaxUsd: revenue - cost,
      operatorFundingGapUsd: Math.max(0, cost - revenue),
      treasuryProfitUsd: profit, nominalStakerPoolUsd: pool, stakerPaidUsd: paid,
      fractionsReturnedUsd: fractions, treasuryRetainedUsd: retained,
      buybackReserveUsd: buyback, treasuryTradingBalanceUsd: capital,
      userWalletsUsd: cohorts.reduce((sum, c) => sum + c.count * c.walletUsd, 0),
      newTokensSold: newUsers * a.initialPurchaseUsd / tokenPrice,
      tokensSold: tokens, tokensInStaking: tokens,
      stakingTokenDays: userDays * a.initialPurchaseUsd / tokenPrice,
      dailyTreasuryProfitUsd: dailyProfit,
      treasuryGainsUsd: gains, treasuryLossesUsd: losses,
      dailyStakerPaidUsd: dailyPaid, perTokenPaidTodayUsd: perTokenToday,
      perTokenPaidCumulativeUsd: perTokenPaid,
      treasuryTotalAssetsUsd: capital + buyback,
      netResultRatePercent: rates[month],
    });
  }
  return days;
}