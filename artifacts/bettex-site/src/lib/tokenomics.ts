// Only current definition; release does not represent sale or executed operation.
export const tokenomics = {
  maxSupply: 1_000_000_000,
  publicSaleAllocation: 650_000_000,
  teamAllocation: 200_000_000,
  investorAllocation: 150_000_000,
  vestingMonths: 36,
} as const;

export const documentationTokenomics = tokenomics;

export const formatTokenCount = (amount: number) => amount.toLocaleString('pt-BR');