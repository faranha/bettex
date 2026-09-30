// Alocações planejadas da emissão; não representam disponibilidade ou vendas em tempo real.
export const tokenomics = {
  priceBRL: 5, // preço de referência do lançamento
  presalePriceBRL: 3,
  totalSupply: 2_000_000,
  publicSaleAllocation: 1_000_000,
  presaleAllocation: 100_000, // incluídos no milhão destinado à venda
  founderTeamAllocation: 500_000,
  externalInvestorAllocation: 500_000,
  salePeriodMonths: 36,
} as const;

export const formatTokenCount = (amount: number) => amount.toLocaleString('pt-BR');