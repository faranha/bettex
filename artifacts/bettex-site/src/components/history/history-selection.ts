export type HistoryArea = 'wallets' | 'treasury' | 'rounds' | 'audit';

/** Keep legacy wallet/round bookmarks useful, but separate personal and treasury accounts. */
export function selectHistoryArea(search: string, hash = ''): HistoryArea {
  const p = new URLSearchParams(search);
  const explicit = p.get('history');
  if (['wallets', 'treasury', 'rounds', 'audit'].includes(explicit ?? '')) return explicit as HistoryArea;
  if (p.has('wallet') || hash === '#wallet-statement') return 'wallets';
  if (p.has('treasuryAccount') || p.has('treasuryAsset') || p.has('treasuryWallet') || hash === '#treasury-statement') return 'treasury';
  if (hash === '#history-audit') return 'audit';
  if (p.has('round') || p.has('roundTab') || hash === '#round-archive') return 'rounds';
  return 'wallets';
}

export function historyQuery(area: HistoryArea, filters: Record<string, string> = {}): string {
  return `?${new URLSearchParams({ ...filters, history: area }).toString()}`;
}

export function treasuryFiltersFromSearch(search: string) {
  const p = new URLSearchParams(search);
  const account = p.get('treasuryAccount');
  const asset = p.get('treasuryAsset');
  return {
    account: account === 'treasury' || account === 'buyback' ? account : 'all',
    asset: asset === 'USDC' || asset === 'BETTEX' ? asset : 'all',
  } as const;
}

export function treasuryWalletFromSearch(search: string) {
  const value = new URLSearchParams(search).get('treasuryWallet');
  return value === 'operational' || value === 'reserve' || value === 'buyback' || value === 'crypto_agent' ? value : null;
}
