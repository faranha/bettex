/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { useUser } from '@clerk/react';
import { Redirect } from 'wouter';
import { useGetTestAccountSession } from '@workspace/api-client-react';
import { useAppSession } from '@/lib/app-session';
import { useX } from '@/components/demo/ui';

export function AppSessionGate({ children }: { children: ReactNode }) {
  const { x } = useX();
  const demoActive = useAppSession();
  const { isLoaded, isSignedIn } = useUser();
  const native = useGetTestAccountSession({ query: { queryKey: ['test-account-session'], enabled: !demoActive && !isSignedIn, retry: 1 } });
  if (demoActive || isSignedIn || native.data?.account) return children;
  if (!isLoaded || native.isPending) return <main className="demo-root min-h-96 p-6" aria-busy="true"><p>{x('Carregando sua sessão…', 'Loading your session…', 'Cargando tu sesión…')}</p></main>;
  return <Redirect to="/sign-in" />;
}
