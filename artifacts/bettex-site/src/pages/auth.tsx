/** @jsxImportSource react */
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useX } from '@/components/demo/ui';
import { demoPath } from '@/components/demo/demo-navigation';

// Legacy routes: the embedded controls live inside Minha conta.
export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const { loc } = useX();
  const [, navigate] = useLocation();
  useEffect(() => { navigate(`${demoPath('account', loc)}?provider=${mode === 'sign-up' ? 'clerk-signup' : 'clerk-signin'}`, { replace: true }); }, [loc, mode, navigate]);
  return <main className="demo-root p-6"><p>…</p></main>;
}
export const SignInPage = () => <AuthPage mode="sign-in" />;
export const SignUpPage = () => <AuthPage mode="sign-up" />;
export default AuthPage;
