// Regras de emissão da BETTEX; não representam tokens vendidos ou operações executadas.
export const tokenomics = {
  maxSupply: 1_000_000_000,
  publicSaleAllocation: 500_000_000,
  investorAllocation: 250_000_000,
  teamAllocation: 250_000_000,
  presaleAllocation: 100_000,
  launchAllocation: 900_000,
  presalePriceBRL: 3,
  launchPriceBRL: 5,
  vestingMonths: 36,
} as const;

// Current documentation rules. Keep the homepage's previous presentation unchanged.
export const documentationTokenomics = {
  maxSupply: 1_000_000_000,
  publicSaleAllocation: 650_000_000,
  teamAllocation: 200_000_000,
  investorAllocation: 150_000_000,
  vestingMonths: 36,
} as const;

export const formatTokenCount = (amount: number) => amount.toLocaleString('pt-BR');