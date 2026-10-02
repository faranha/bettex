import { tokenomics } from './tokenomics';

// Release whole-token groups of 2:1:1, preserving 50%/25%/25% every month.
// Cumulative rounding spreads the indivisible remainder across the 36 months.
export const vestingSchedule = Array.from({ length: tokenomics.vestingMonths }, (_, index) => {
  const month = index + 1;
  const cumulativeQuarter = Math.floor(tokenomics.teamAllocation * month / tokenomics.vestingMonths);
  const previousQuarter = Math.floor(tokenomics.teamAllocation * index / tokenomics.vestingMonths);
  const quarter = cumulativeQuarter - previousQuarter;
  return {
    month,
    publicSale: quarter * 2,
    team: quarter,
    investors: quarter,
    total: quarter * 4,
    cumulative: cumulativeQuarter * 4,
  };
});