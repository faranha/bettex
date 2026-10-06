import { useQuery } from '@tanstack/react-query';
import { getDemoHistory, getTestHistory } from '@workspace/api-client-react';
import { collectWalletHistory } from './history-pagination';

export async function readAllWalletHistory(mode: 'demo' | 'native', signal?: AbortSignal) {
  return collectWalletHistory(async cursor => {
    const params = { view: 'general' as const, limit: 50, ...(mode === 'demo' ? { environment: 'simulation' as const } : {}), ...(cursor ? { cursor } : {}) };
    const options = { signal, credentials: 'same-origin' as const };
    return mode === 'demo' ? getDemoHistory(params, options) : getTestHistory(params, options);
  });
}
export function useWalletHistory(mode: 'demo' | 'native', accountKey: string) {
  return useQuery({
    queryKey: ['wallet-statement', mode, accountKey],
    queryFn: ({ signal }) => readAllWalletHistory(mode, signal),
    staleTime: 15000, refetchInterval: 30000, retry: false,
  });
}
