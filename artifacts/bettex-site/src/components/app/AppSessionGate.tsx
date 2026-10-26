/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { useAppSession } from '@/lib/app-session';
import { SignInPage } from '@/pages/auth';

export function AppSessionGate({ children }: { children: ReactNode }) {
  const demoActive = useAppSession();
  return demoActive ? children : <SignInPage />;
}
