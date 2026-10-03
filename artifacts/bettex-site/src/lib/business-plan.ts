import assumptions from './business-plan.json';
import team from './entity-team.json';
import policy from './service-fee-proposal.json';

export const businessAssumptions = assumptions;
const rates = [assumptions.revenueTaxProvisionRate, assumptions.support.automatedResolutionShare];
const mixShares = [assumptions.mix.purchaseShare, assumptions.mix.withdrawalShare];
if (rates.some(n => !Number.isFinite(n) || n < 0 || n >= 1)
  || mixShares.some(n => !Number.isFinite(n) || n < 0 || n > 1)
  || assumptions.mix.purchaseShare + assumptions.mix.withdrawalShare > 1
  || assumptions.fixedCosts.some(c => !Number.isFinite(c.amountUsd) || c.amountUsd < 0)
  || assumptions.setupCosts.some(c => !Number.isFinite(c.amountUsd) || c.amountUsd < 0)
  || team.positions.some(p => !Number.isFinite(p.proposedMonthlySalaryUsd) || p.proposedMonthlySalaryUsd < 0)
  || team.positions.length !== team.maxPeople
  || new Set(team.positions.map(p => p.id)).size !== team.positions.length
  || team.positions.filter(p => p.id === 'founder').length !== 1
  || team.positions.some(p => p.id !== 'founder' && p.proposedMonthlySalaryUsd <= 0)
  || !Number.isInteger(assumptions.reserveMonths)
  || assumptions.months.length !== 12
  || assumptions.months.some((m, i) => m.month !== i + 1 || !Number.isInteger(m.operations)
    || m.operations < 0 || !Number.isInteger(m.monthlyActiveUsers) || m.monthlyActiveUsers < 0
    || (m.operations > 0 && m.monthlyActiveUsers === 0))
  || [assumptions.variableCostPerOperationUsd, assumptions.reserveMonths,
    assumptions.support.humanMinutesPerTicket, assumptions.support.humanHoursBudget,
    assumptions.payrollChargesRate, assumptions.support.ticketsPerMonthlyActiveUser,
    assumptions.mix.purchaseTicketUsdc, assumptions.mix.withdrawalTicketUsdc,
    assumptions.growth.monthlyPaidMediaUsd, assumptions.growth.testPaidCacUsd]
    .some(n => !Number.isFinite(n) || n < 0)) {
  throw new Error('Premissas inválidas no plano-base de negócios.');
}
const salary = team.positions.reduce((sum, p) => sum + p.proposedMonthlySalaryUsd, 0);
const charges = salary * assumptions.payrollChargesRate;
const fixed = salary + charges + assumptions.fixedCosts.reduce((sum, c) => sum + c.amountUsd, 0);
const setup = assumptions.setupCosts.reduce((sum, c) => sum + c.amountUsd, 0);
const fee = policy.fees[0]?.amountUsd ?? NaN;
if (policy.fees.length !== 3 || policy.fees.some(p => !Number.isFinite(p.amountUsd) || p.amountUsd !== fee) || fee <= 0) {
  throw new Error('O plano-base exige rever o mix quando as tarifas forem diferentes.');
}
if (assumptions.mix.withdrawalTicketUsdc <= policy.fees[1].amountUsd) {
  throw new Error('O ticket de saque não deixa líquido positivo.');
}
if (assumptions.mix.purchaseTicketUsdc <= 0 || assumptions.growth.testPaidCacUsd <= 0
  || assumptions.support.humanMinutesPerTicket <= 0) {
  throw new Error('Ticket de compra, CAC e tempo humano devem ser positivos.');
}
const contribution = fee * (1 - assumptions.revenueTaxProvisionRate) - assumptions.variableCostPerOperationUsd;
if (contribution <= 0 || team.positions.find(p => p.id === 'founder')?.proposedMonthlySalaryUsd !== 0) {
  throw new Error('Rever a contribuição e a política de fundador sem salário.');
}
const breakEvenOperations = Math.ceil(fixed / contribution);

export function supportCapacity(monthlyActiveUsers: number) {
  if (!Number.isFinite(monthlyActiveUsers) || monthlyActiveUsers < 0) throw new Error('Base de atendimento inválida.');
  const tickets = monthlyActiveUsers * assumptions.support.ticketsPerMonthlyActiveUser;
  const humanTickets = tickets * (1 - assumptions.support.automatedResolutionShare);
  const humanHours = humanTickets * assumptions.support.humanMinutesPerTicket / 60;
  return { tickets, humanTickets, humanHours, overCapacity: humanHours > assumptions.support.humanHoursBudget };
}

let cumulative = 0;
export const businessMonths = assumptions.months.map(m => {
  const purchases = Math.floor(m.operations * assumptions.mix.purchaseShare);
  const withdrawals = Math.floor(m.operations * assumptions.mix.withdrawalShare);
  const transfers = m.operations - purchases - withdrawals;
  const revenue = m.operations * fee;
  const variable = m.operations * assumptions.variableCostPerOperationUsd;
  const taxProvision = revenue * assumptions.revenueTaxProvisionRate;
  const recurringCost = fixed + variable + taxProvision;
  const setupCost = m.month === 1 ? setup : 0;
  const operatingResult = revenue - recurringCost;
  // Free cash movement after setting aside provisions, not a bank-statement balance.
  const cashResult = operatingResult - setupCost;
  cumulative += cashResult;
  return {
    ...m, purchases, withdrawals, transfers, revenue, variable, taxProvision, recurringCost,
    setupCost, operatingResult, cashResult, cumulative,
    treasuryPurchaseVolume: purchases * assumptions.mix.purchaseTicketUsdc,
    requestedWithdrawals: withdrawals * assumptions.mix.withdrawalTicketUsdc,
    // Aggregate floor: q=100% of distribution reaches these withdrawers; no earlier credits/withholding.
    minimumEligibleProfit: withdrawals * assumptions.mix.withdrawalTicketUsdc / 0.25,
    support: supportCapacity(m.monthlyActiveUsers),
  };
});
const peakDeficit = -Math.min(0, ...businessMonths.map(m => m.cumulative));
const buffer = fixed * assumptions.reserveMonths;
export const businessPlan = {
  salary, charges, fixed, setup, fee, contribution, breakEvenOperations,
  costAtBreakEven: fixed + breakEvenOperations * assumptions.variableCostPerOperationUsd
    + breakEvenOperations * fee * assumptions.revenueTaxProvisionRate,
  firstBreakEvenMonth: businessMonths.find(m => m.operations >= breakEvenOperations)?.month ?? null,
  peakDeficit, buffer, operatingFunding: peakDeficit + buffer,
  yearRevenue: businessMonths.reduce((s, m) => s + m.revenue, 0),
  yearRecurringCost: businessMonths.reduce((s, m) => s + m.recurringCost, 0),
  yearCashResult: cumulative,
};

export const businessMoney = (n: number) => `US$ ${n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
export const businessCount = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });