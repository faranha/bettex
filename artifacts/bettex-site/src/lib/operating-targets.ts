import targets from './operating-targets.json';
import { purchaseFeeUsd, withdrawalFeeUsd, transferFeeUsd } from './fee-projections';
import { businessAssumptions as assumptions, businessPlan } from './business-plan';

export { targets as operatingTargets };

/** Scale the actual proposed fixed costs against the creator's reference.
 * Never back-solve fixed costs to force a changed plan to meet the cost target.
 * Additional shocks preserve the same fixed-cost base.
 */
export function operatingTarget(budgetUsd: number, extraCostPerOperation = 0, extraRevenueTax = 0) {
  if ([budgetUsd, extraCostPerOperation, extraRevenueTax, assumptions.variableCostPerOperationUsd,
    assumptions.revenueTaxProvisionRate].some(n => !Number.isFinite(n) || n < 0)
    || assumptions.revenueTaxProvisionRate + extraRevenueTax >= 1 || targets.daysPerMonth <= 0) {
    throw new Error('Premissas inválidas para o equilíbrio operacional.');
  }
  if (purchaseFeeUsd !== withdrawalFeeUsd || purchaseFeeUsd !== transferFeeUsd) {
    throw new Error('Tarifas diferentes exigem projetar o mix de operações.');
  }
  const fixedBudgetUsd = businessPlan.fixed * budgetUsd / targets.monthlyBudgetUsd;
  const contribution = purchaseFeeUsd * (1 - assumptions.revenueTaxProvisionRate - extraRevenueTax)
    - assumptions.variableCostPerOperationUsd - extraCostPerOperation;
  if (fixedBudgetUsd < 0) throw new Error('O orçamento de referência não comporta os encargos-base.');
  if (contribution <= 0) throw new Error('Contribuição por operação não positiva.');
  const operations = Math.ceil(fixedBudgetUsd / contribution);
  return {
    operations, contribution, fixedBudgetUsd, dailyAverage: operations / targets.daysPerMonth,
    grossFees: operations * purchaseFeeUsd,
    coverageAfterExtras: operations * contribution,
    recurringCostAtTarget: fixedBudgetUsd + operations * (
      assumptions.variableCostPerOperationUsd + extraCostPerOperation
      + purchaseFeeUsd * (assumptions.revenueTaxProvisionRate + extraRevenueTax)),
  };
}