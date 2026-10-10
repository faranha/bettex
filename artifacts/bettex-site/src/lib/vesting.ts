import { tokenomics } from './tokenomics';

// Release whole-token groups of 13:4:3, preserving 65%/20%/15% every month.
// Cumulative rounding spreads the indivisible remainder across the 36 months.
const totalGroups = tokenomics.maxSupply / 20;
export const vestingSchedule = Array.from({ length: tokenomics.vestingMonths }, (_, index) => {
  const month = index + 1;
  const cumulativeGroups = Math.floor(totalGroups * month / tokenomics.vestingMonths);
  const previousGroups = Math.floor(totalGroups * index / tokenomics.vestingMonths);
  const groups = cumulativeGroups - previousGroups;
  return {
    month,
    publicSale: groups * 13,
    team: groups * 4,
    investors: groups * 3,
    total: groups * 20,
    cumulative: cumulativeGroups * 20,
    publicSaleCumulative: cumulativeGroups * 13,
    teamCumulative: cumulativeGroups * 4,
    investorsCumulative: cumulativeGroups * 3,
  };
});