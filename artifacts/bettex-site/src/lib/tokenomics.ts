// Modelo de discussão: limite e alocações, não oferta ativa nem saldo emitido.
export const tokenomics = {
  maxSupply: 1_000_000_000,
  publicSaleAllocation: 500_000_000,
  firstPublicTranche: 100_000_000,
  monthlyPublicAllocation: 400_000_000,
  investorAllocation: 250_000_000,
  companyAllocation: 250_000_000,
  investorSaleMonths: 24,
  launchPriceBRL: 0.10,
} as const;

export const formatTokenCount = (amount: number) => amount.toLocaleString('pt-BR');