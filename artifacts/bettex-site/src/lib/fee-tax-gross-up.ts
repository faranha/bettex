/** Modelo ilustrativo linear, não cálculo legal nem autorização financeira. */
export function grossUpFee(netTarget: number, taxRate: number | null, fixedTax: number | null) {
  if (!Number.isFinite(netTarget) || netTarget < 0
    || (taxRate !== null && (!Number.isFinite(taxRate) || taxRate < 0 || taxRate >= 1))
    || (fixedTax !== null && (!Number.isFinite(fixedTax) || fixedTax < 0))) {
    return { status: 'invalid' as const, message: 'Alvo e tributo adicional devem ser não negativos. A carga proporcional deve ser menor que 100%.' };
  }
  if (taxRate === null || fixedTax === null) {
    return { status: 'pending' as const, message: 'Informe a carga fiscal e o tributo adicional, inclusive zero. Sem dados fiscais, não há cobrança total calculada.' };
  }
  // A parcela proporcional incide sobre o TOTAL, inclusive sobre o acréscimo.
  const total = (netTarget + fixedTax) / (1 - taxRate);
  if (!Number.isFinite(total)) return { status: 'invalid' as const, message: 'Resultado fora da capacidade numérica da simulação.' };
  return { status: 'ready' as const, netTarget, total, taxProvision: total - netTarget };
}