/** @jsxImportSource react */
import { useMemo, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getGetDemoTreasuryWalletsQueryKey } from '@workspace/api-client-react';
import { walletsSeed } from './treasury-demo-data';

/** Isolated, pre-filled cache: reused renderers read local sample wallets and can never fetch. */
export function TreasuryDemoProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const c = new QueryClient({ defaultOptions: { queries: { enabled: false, staleTime: Infinity, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false } } });
    c.setQueryData(getGetDemoTreasuryWalletsQueryKey(), walletsSeed);
    return c;
  }, []);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
