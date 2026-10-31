// Isolated visual demo baseline; documentary changes must not change its behavior.
export const tokenomics = {
  maxSupply: 1_000_000_000,
  publicSaleAllocation: 650_000_000,
  teamAllocation: 200_000_000,
  investorAllocation: 150_000_000,
  vestingMonths: 36,
} as const;

// Approved documentary allocations. Mint cap is not executed issuance.
export const documentationTokenomics = {
  maxSupply: 1_000_000_000,
  initialMintAllocation: 100_000_000,
  communityAllocation: 550_000_000,
  teamAllocation: 200_000_000,
  investorAllocation: 150_000_000,
  vestingTotal: 900_000_000,
  vestingMonths: 24,
} as const;

export const formatTokenCount = (amount: number) => amount.toLocaleString('pt-BR');