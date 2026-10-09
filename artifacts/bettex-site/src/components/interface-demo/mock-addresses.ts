/** Deliberately invalid blockchain addresses; never usable for transfers. */
export const MOCK_WALLET_ADDRESSES = { USDC: 'MOCK-USDC-0001', BETTEX: 'MOCK-BETTEX-0001' } as const;
export const MOCK_TREASURY_ADDRESSES = {
  operational: 'MOCK-TREASURY-OPERATING',
  reserve: 'MOCK-TREASURY-RESERVE',
  buyback: 'MOCK-TREASURY-BUYBACK',
} as const;
