import fees from './service-fee-proposal.json';
import assumptions from './fee-projection-scenarios.json';

export const purchaseFeeUsd = fees.fees[0].amountUsd;
export const withdrawalFeeUsd = fees.fees[1].amountUsd;
export const transferFeeUsd = fees.fees[2].amountUsd;
type Scenario = typeof assumptions.scenarios[number];

/** Gross service revenue, not net profit. USD/USDC 1:1 is illustrative only. */
export function projectFees(scenario: Scenario) {
  const values = Object.values(scenario).filter((v): v is number => typeof v === 'number');
  if (values.some(v => !Number.isFinite(v) || v < 0)
    || [scenario.poolBuyerShare, scenario.repeatBuyerShare, scenario.withdrawerShare].some(v => v > 1)
    || scenario.withdrawalDays > 31
    || scenario.initialHolders > scenario.targetHolders) {
    throw new Error(`Premissas inválidas no cenário ${scenario.name}.`);
  }
  const annualNewBuyers = (scenario.targetHolders - scenario.initialHolders) * scenario.poolBuyerShare;
  const newBuyers = annualNewBuyers / 12;
  const activeUsers = (scenario.initialDailyActiveUsers + scenario.targetDailyActiveUsers) / 2;
  const repeatBuyers = activeUsers * scenario.repeatBuyerShare;
  const repeatPurchaseCount = repeatBuyers * scenario.repeatPurchasesPerBuyerPerMonth;
  const withdrawers = activeUsers * scenario.withdrawerShare;
  const withdrawalCount = withdrawers * scenario.withdrawalDays;
  if (withdrawalCount > 0 && scenario.dailyWithdrawal <= withdrawalFeeUsd) {
    throw new Error(`O cenário ${scenario.name} não deixa líquido positivo após a tarifa de saque.`);
  }
  const transferCount = activeUsers * scenario.transferOperationsPerActiveUser;
  const firstPurchaseVolume = newBuyers * scenario.firstPurchase;
  const repeatPurchaseVolume = repeatPurchaseCount > 0 ? repeatBuyers * scenario.monthlyRepeatPurchase : 0;
  const purchaseVolume = firstPurchaseVolume + repeatPurchaseVolume;
  const dailyWithdrawalVolume = scenario.withdrawalDays > 0 ? withdrawers * scenario.dailyWithdrawal : 0;
  const withdrawalVolume = dailyWithdrawalVolume * scenario.withdrawalDays;
  const purchaseCount = newBuyers + repeatPurchaseCount;
  const purchaseFees = purchaseCount * purchaseFeeUsd;
  const withdrawalFees = withdrawalCount * withdrawalFeeUsd;
  const transferFees = transferCount * transferFeeUsd;
  const monthlyFees = purchaseFees + withdrawalFees + transferFees;
  const acquisitionFees = annualNewBuyers * purchaseFeeUsd;
  const recurringMonthlyFees = repeatPurchaseCount * purchaseFeeUsd + withdrawalFees + transferFees;
  const yearEndRecurringMonthlyFees = scenario.targetDailyActiveUsers * (
    scenario.repeatBuyerShare * scenario.repeatPurchasesPerBuyerPerMonth * purchaseFeeUsd
    + scenario.withdrawerShare * scenario.withdrawalDays * withdrawalFeeUsd
    + scenario.transferOperationsPerActiveUser * transferFeeUsd
  );
  return {
    ...scenario, activeUsers, annualNewBuyers, newBuyers, repeatBuyers, repeatPurchaseCount,
    withdrawers, withdrawalCount, transferCount, purchaseCount,
    monthlyWithdrawal: scenario.dailyWithdrawal * scenario.withdrawalDays,
    firstPurchaseVolume, repeatPurchaseVolume, purchaseVolume, withdrawalVolume,
    acquisitionFees, recurringMonthlyFees, yearEndRecurringMonthlyFees,
    activeShareOfHolders: scenario.targetHolders > 0 ? scenario.targetDailyActiveUsers / scenario.targetHolders : 0,
    activeShareOfProjection: scenario.projectedUsers > 0 ? scenario.targetDailyActiveUsers / scenario.projectedUsers : 0,
    dailyWithdrawalVolume, dailyWithdrawalFees: scenario.withdrawalDays > 0 ? withdrawers * withdrawalFeeUsd : 0,
    purchaseFees, withdrawalFees, transferFees, monthlyFees, annualFees: monthlyFees * 12,
    feesPerActiveUser: activeUsers > 0 ? recurringMonthlyFees / activeUsers : 0,
    // Requested withdrawal includes the service fee; do not add it twice.
    netWithdrawalPerOperation: scenario.dailyWithdrawal - withdrawalFeeUsd,
    minimumEligibleProfit: withdrawalVolume / 0.25,
    minimumDailyEligibleProfit: dailyWithdrawalVolume / 0.25,
  };
}

export const feeProjections = assumptions.scenarios.map(projectFees);