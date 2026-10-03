export function serviceFeeBalance(feeUsd: number, usdcPerDollar: number,
  taxProvision: number | null, operatingCost: number | null) {
  if (!Number.isFinite(feeUsd) || feeUsd < 0 || !Number.isFinite(usdcPerDollar) || usdcPerDollar <= 0) {
    return { status: 'invalid' as const, message: 'Informe uma referência USDC por dólar positiva e finita.' };
  }
  if (taxProvision === null || operatingCost === null) {
    return { status: 'missing' as const, message: 'Informe a provisão fiscal e o custo, inclusive zero quando conhecido. Dados ausentes não significam isenção.' };
  }
  if (![taxProvision, operatingCost].every(v => Number.isFinite(v) && v >= 0)) {
    return { status: 'invalid' as const, message: 'Provisão e custo devem ser valores não negativos e finitos.' };
  }
  const received = feeUsd * usdcPerDollar;
  return { status: 'ready' as const, received, taxProvision, operatingCost,
    balance: received - taxProvision - operatingCost };
}