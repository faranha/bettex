import { documentationTokenomics as tokenomics } from './tokenomics';

// Whole-token groups preserve 55:20:15 (11:4:3) throughout the 24 releases.
// The initial mint cap is separate, not credited as executed issuance.
const totalGroups = tokenomics.vestingTotal / 18;
export const documentationVestingSchedule = Array.from({ length: tokenomics.vestingMonths }, (_, index) => {
  const month = index + 1;
  const cumulativeGroups = Math.floor(totalGroups * month / tokenomics.vestingMonths);
  const previousGroups = Math.floor(totalGroups * index / tokenomics.vestingMonths);
  const groups = cumulativeGroups - previousGroups;
  return {
    month,
    community: groups * 11,
    team: groups * 4,
    investors: groups * 3,
    total: groups * 18,
    cumulative: cumulativeGroups * 18,
    communityCumulative: cumulativeGroups * 11,
    teamCumulative: cumulativeGroups * 4,
    investorsCumulative: cumulativeGroups * 3,
  };
});
