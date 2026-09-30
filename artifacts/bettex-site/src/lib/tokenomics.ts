// Regras de emissão da BETTEX; não representam tokens vendidos ou operações executadas.
export const tokenomics = {
  maxSupply: 1_000_000_000,
  publicSaleAllocation: 500_000_000,
  firstPublicTranche: 100_000_000,
  monthlyPublicAllocation: 400_000_000,
  investorAllocation: 250_000_000,
  projectAllocation: 250_000_000,
  investorSaleMonths: 24,
  presaleAllocation: 50_000_000,
  launchAllocation: 50_000_000,
  presalePriceBRL: 0.08,
  launchPriceBRL: 0.10,
  monthlySaleMonths: 40,
  monthlySaleLimit: 10_000_000,
  investorPriceBRL: 0.10,
} as const;

export const formatTokenCount = (amount: number) => amount.toLocaleString('pt-BR');