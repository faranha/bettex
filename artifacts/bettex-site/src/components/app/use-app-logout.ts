import { useState } from 'react';
import { useClerk, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { getTestAccountSession } from '@workspace/api-client-react';
import { signOutTestAccount } from '@/components/account/test-account-client';
import { endAppSession } from '@/lib/app-session';

export function useAppLogout() {
  const clerk = useClerk();
  const { isSignedIn } = useUser();
  const client = useQueryClient();
  const [, navigate] = useLocation();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const logout = async () => {
    if (busy) return;
    setBusy(true); setFailed(false);
    try {
      await client.cancelQueries();
      const native = await getTestAccountSession({ credentials: 'same-origin' });
      if (native.account) await signOutTestAccount(native);
      if (isSignedIn) await clerk.signOut();
      window.dispatchEvent(new Event('bettex-wallet-lock'));
      endAppSession();
      client.clear();
      navigate('/sign-in', { replace: true });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  return { logout, busy, failed };
}
