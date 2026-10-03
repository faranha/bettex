import { profitAllocation } from './profit-allocation-policy';

/** Simulação documental. Não determina tributos legais nem autoriza pagamentos. */
export function calculateTaxIllustration(input: {
  resultAfterCosts: number;
  entityTaxes: number | null;
  beneficiaryWithholding: number | null;
  distributionConditionsMet: boolean;
}) {
  const { resultAfterCosts, entityTaxes, beneficiaryWithholding, distributionConditionsMet } = input;
  if (!Number.isFinite(resultAfterCosts)
    || [entityTaxes, beneficiaryWithholding].some(value => value !== null && (!Number.isFinite(value) || value < 0))) {
    return { status: 'invalid' as const, message: 'Informe valores finitos; tributos e retenções não podem ser negativos.' };
  }
  if (entityTaxes === null || beneficiaryWithholding === null) {
    return { status: 'pending' as const, message: 'Informe os tributos e as retenções. Zero deve ser informado explicitamente, não presumido.' };
  }
  const netResult = resultAfterCosts - entityTaxes;
  const eligibleProfit = Math.max(0, netResult);
  const stakingGross = distributionConditionsMet ? eligibleProfit * profitAllocation.staking : 0;
  if (beneficiaryWithholding > stakingGross) {
    return { status: 'invalid' as const, message: 'A retenção não pode superar a parcela bruta do staking desta simulação. Sem split, não há nova retenção sobre esta rodada.' };
  }
  const treasury = distributionConditionsMet ? eligibleProfit * profitAllocation.treasury : eligibleProfit;
  const buyback = distributionConditionsMet ? eligibleProfit * profitAllocation.buyback : 0;
  return {
    status: 'ready' as const,
    netResult, eligibleProfit, treasury, buyback, stakingGross, beneficiaryWithholding,
    stakingNet: stakingGross - beneficiaryWithholding,
  };
}