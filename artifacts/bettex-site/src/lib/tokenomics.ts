// Alocações da emissão; estes números não representam o saldo restante em tempo real.
export const tokenomics = {
  priceBRL: 5,
  totalSupply: 2_000_000,
  publicPrelaunchAllocation: 1_000_000,
  investorAllocation: 500_000,
  creatorAllocation: 500_000,
} as const;

export const formatTokenCount = (amount: number) => amount.toLocaleString('pt-BR');