// Regras de emissão da BETTEX; não representam tokens vendidos ou operações executadas.
export const tokenomics = {
  maxSupply: 2_000_000,
  publicSaleAllocation: 1_000_000,
  investorAllocation: 500_000,
  teamAllocation: 500_000,
  presaleAllocation: 100_000,
  launchAllocation: 900_000,
  presalePriceBRL: 3,
  launchPriceBRL: 5,
  vestingMonths: 36,
} as const;

export const formatTokenCount = (amount: number) => amount.toLocaleString('pt-BR');