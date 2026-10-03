import fees from './service-fee-proposal.json';
import assumptions from './fee-projection-scenarios.json';

export const purchaseRate = fees.fees[0].rate;
export const withdrawalRate = fees.fees[1].rate;

// purchaseFees/withdrawalFees/monthlyFees são ALVOS líquidos de tributos,
// não cobrança bruta. A cobertura fiscal exige dados e cotação próprios.
export const feeProjections = assumptions.scenarios.map(scenario => {
  const annualNewBuyers = Math.max(0, scenario.targetHolders - scenario.initialHolders) * scenario.poolBuyerShare;
  const newBuyers = annualNewBuyers / 12;
  // Média temporal linear: não projetar o DAU final como se existisse desde o dia 1.
  const activeUsers = (scenario.initialDailyActiveUsers + scenario.targetDailyActiveUsers) / 2;
  const repeatBuyers = activeUsers * scenario.repeatBuyerShare;
  const withdrawers = activeUsers * scenario.withdrawerShare;
  const firstPurchaseVolume = newBuyers * scenario.firstPurchase;
  const repeatPurchaseVolume = repeatBuyers * scenario.monthlyRepeatPurchase;
  const purchaseVolume = firstPurchaseVolume + repeatPurchaseVolume;
  const monthlyWithdrawal = scenario.dailyWithdrawal * scenario.withdrawalDays;
  const withdrawalCount = withdrawers * scenario.withdrawalDays;
  const dailyWithdrawalVolume = scenario.withdrawalDays > 0 ? withdrawers * scenario.dailyWithdrawal : 0;
  const withdrawalVolume = dailyWithdrawalVolume * scenario.withdrawalDays;
  const purchaseFees = purchaseVolume * purchaseRate;
  const withdrawalFees = withdrawalVolume * withdrawalRate;
  const monthlyFees = purchaseFees + withdrawalFees;
  const acquisitionFees = annualNewBuyers * scenario.firstPurchase * purchaseRate;
  const recurringMonthlyFees = repeatPurchaseVolume * purchaseRate + withdrawalFees;
  const yearEndRecurringMonthlyFees = scenario.targetDailyActiveUsers * (
    scenario.repeatBuyerShare * scenario.monthlyRepeatPurchase * purchaseRate
    + scenario.withdrawerShare * scenario.dailyWithdrawal * scenario.withdrawalDays * withdrawalRate
  );
  return {
    ...scenario, activeUsers, annualNewBuyers, newBuyers, repeatBuyers, withdrawers, monthlyWithdrawal, withdrawalCount,
    firstPurchaseVolume, repeatPurchaseVolume, acquisitionFees, recurringMonthlyFees, yearEndRecurringMonthlyFees,
    activeShareOfHolders: scenario.targetHolders > 0 ? scenario.targetDailyActiveUsers / scenario.targetHolders : 0,
    activeShareOfProjection: scenario.projectedUsers > 0 ? scenario.targetDailyActiveUsers / scenario.projectedUsers : 0,
    dailyWithdrawalVolume, purchaseVolume, withdrawalVolume,
    dailyWithdrawalFees: dailyWithdrawalVolume * withdrawalRate,
    purchaseFees, withdrawalFees, monthlyFees, annualFees: monthlyFees * 12,
    // Sensibilidade operacional exclui aquisição anual, que não decorre do DAU.
    feesPerActiveUser: activeUsers > 0 ? recurringMonthlyFees / activeUsers : 0,
    // Piso APÓS tributos da entidade, sem créditos anteriores ou retenções individuais.
    // Retenções exigem (volume líquido + imposto retido) / 25%; não presumir isenção.
    // Não é previsão de resultado das estratégias ou lucro antes dos impostos.
    minimumEligibleProfit: withdrawalVolume / 0.25,
    minimumDailyEligibleProfit: dailyWithdrawalVolume / 0.25,
  };
});