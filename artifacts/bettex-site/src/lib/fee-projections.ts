import fees from './service-fee-proposal.json';
import assumptions from './fee-projection-scenarios.json';

export const purchaseRate = fees.fees[0].rate;
export const withdrawalRate = fees.fees[1].rate;

export const feeProjections = assumptions.scenarios.map(scenario => {
  const newBuyers = scenario.activeUsers * scenario.newBuyerShare;
  const repeatBuyers = scenario.activeUsers * scenario.repeatBuyerShare;
  const withdrawers = scenario.activeUsers * scenario.withdrawerShare;
  const purchaseVolume = newBuyers * scenario.firstPurchase + repeatBuyers * scenario.monthlyRepeatPurchase;
  const monthlyWithdrawal = scenario.dailyWithdrawal * scenario.withdrawalDays;
  const withdrawalCount = withdrawers * scenario.withdrawalDays;
  const dailyWithdrawalVolume = scenario.withdrawalDays > 0 ? withdrawers * scenario.dailyWithdrawal : 0;
  const withdrawalVolume = dailyWithdrawalVolume * scenario.withdrawalDays;
  const purchaseFees = purchaseVolume * purchaseRate;
  const withdrawalFees = withdrawalVolume * withdrawalRate;
  const monthlyFees = purchaseFees + withdrawalFees;
  return {
    ...scenario, newBuyers, repeatBuyers, withdrawers, monthlyWithdrawal, withdrawalCount,
    dailyWithdrawalVolume, purchaseVolume, withdrawalVolume,
    dailyWithdrawalFees: dailyWithdrawalVolume * withdrawalRate,
    purchaseFees, withdrawalFees, monthlyFees, annualFees: monthlyFees * 12,
    feesPerActiveUser: monthlyFees / scenario.activeUsers,
    // Mínimo necessário se não houver créditos anteriores e todo o saque vier
    // de distribuições do mês. Não é previsão de resultado das estratégias.
    minimumEligibleProfit: withdrawalVolume / 0.25,
    minimumDailyEligibleProfit: dailyWithdrawalVolume / 0.25,
  };
});