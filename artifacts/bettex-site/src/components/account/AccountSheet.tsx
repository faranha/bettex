/** @jsxImportSource react */
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { type DemoDashboard } from '@workspace/api-client-react';
import { useUser, useClerk, UserProfile, SignIn, SignUp } from '@clerk/react';
import { Loader2, LogOut, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useX } from '@/components/demo/ui';
import { AccountPanel } from './account-ui/AccountPanel';
import { demoPath } from '@/components/demo/demo-navigation';
import { isDemoSession } from '@/components/demo/demo-session';
import { DemoAccountPanel } from '@/components/demo/DemoAccountPanel';
import type { Asset, Kind } from '@/components/demo/fin';

const primary = 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white hover:bg-[#0A6657] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]';
type Provider = 'native' | 'clerk-signin' | 'clerk-signup';

export function AccountSheet({ d, onWallet }: { d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void }) {
  const { x, loc } = useX();
  const qc = useQueryClient();
  const { isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const home = `${base}${loc === 'pt' ? '' : `/${loc}`}`;
  const [out, setOut] = useState<'idle' | 'loading' | 'error'>('idle');
  const [prov, setProv] = useState<Provider>(() => {
    const q = typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('provider');
    return q === 'clerk-signin' || q === 'clerk-signup' ? q : 'native';
  });
  const seen = useRef<boolean | undefined>(undefined);
  useEffect(() => { setOut('idle'); }, [d.profile.accountId]);
  useEffect(() => {
    if (!isLoaded) return;
    if (seen.current !== undefined && seen.current !== !!isSignedIn) void qc.resetQueries();
    seen.current = !!isSignedIn;
  }, [isLoaded, isSignedIn, qc]);
  const native = d.profile.provider === 'native';
  const signOut = async () => {
    if (out === 'loading') return;
    setOut('loading');
    try { await clerk.signOut({ redirectUrl: `${home}${demoPath('account', loc)}` }); } catch { setOut('error'); }
  };
  // The browser-scoped demo is already active. Explicit provider links retain actual account testing.
  const explicitProvider = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('provider');
  if (isDemoSession(d.profile) && !explicitProvider) return <DemoAccountPanel d={d} onWallet={onWallet} />;

  const note = <div className="flex gap-3 rounded-2xl bg-[#EFF6F2] p-3 text-xs leading-relaxed text-[#1B2A41]">
    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0E7C6B]" aria-hidden="true" />
    <p>{x('Tecnologia em protótipo: saldos, depósitos, saques e rendimentos são emulados. Entrar ou sair não move dinheiro real, não cria carteira e não é um fundo. Nenhum dado financeiro é apagado automaticamente.', 'Prototype technology: balances, deposits, withdrawals and yield are emulated. Signing in or out moves no real money, creates no wallet and is not a fund. No financial data is deleted automatically.', 'Tecnología en prototipo: saldos, depósitos, retiros y rendimientos son emulados. Entrar o salir no mueve dinero real, no crea cartera y no es un fondo. Ningún dato financiero se borra automáticamente.')}</p>
  </div>;

  const panel = <>
      <header className="flex items-start justify-between gap-3 border-b border-[#E4DCCB] p-4 sm:px-6">
        <div><h1 className="display text-xl font-extrabold">{x('Minha conta', 'My account', 'Mi cuenta')}</h1>
          <p className="mt-1 text-sm text-[#5B6B85]">{x('Perfil, carteiras, operações, segurança e histórico de testes.', 'Profile, wallets, operations, security and test history.', 'Perfil, carteras, operaciones, seguridad e historial de pruebas.')}</p></div>
      </header>
      <div className="min-w-0 p-4 sm:p-6">
         {native ? <AccountPanel onLogout={async () => { if (isSignedIn) await clerk.signOut(); }} />
        : !isLoaded ? <div className="grid gap-3" aria-busy="true" aria-label={x('Carregando', 'Loading', 'Cargando')}>{[0, 1, 2].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#F0E9DA]" />)}</div>
        : isSignedIn ? <div className="grid gap-4">
          {note}
          <div className="min-w-0 rounded-2xl border border-[#E4DCCB] bg-white" data-testid="inline-account-profile"><UserProfile routing="path" path={`${home}${demoPath('account', loc)}`} appearance={{ elements: { cardBox: 'w-full max-w-none !shadow-none !border-0', rootBox: 'w-full max-w-full', card: 'w-full max-w-none' } }} /></div>
          <div className="grid gap-2 rounded-2xl border border-[#E4DCCB] p-4">
            <p className="text-sm font-bold">{x('Encerrar sessão', 'Sign out', 'Cerrar sesión')}</p>
            <p className="text-xs text-[#5B6B85]">{x('Seus saldos emulados continuam vinculados à sua conta.', 'Your emulated balances stay linked to your account.', 'Tus saldos emulados siguen vinculados a tu cuenta.')}</p>
            {out === 'error' && <p role="alert" className="flex items-start gap-2 text-sm font-semibold text-[#B4421A]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{x('Não foi possível sair. Você continua conectado; tente de novo.', 'Could not sign out. You are still signed in; try again.', 'No se pudo salir. Sigues conectado; intenta de nuevo.')}</p>}
            <button type="button" data-testid="button-sign-out" onClick={() => void signOut()} disabled={out === 'loading'} className={primary}>{out === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}{out === 'loading' ? x('Saindo…', 'Signing out…', 'Saliendo…') : out === 'error' ? x('Tentar sair de novo', 'Try signing out again', 'Reintentar salir') : x('Sair da conta', 'Sign out', 'Salir de la cuenta')}</button>
          </div>
        </div>
        : <>
          <div role="tablist" className="mb-4 grid gap-2 sm:grid-cols-3">{([['native', x('Conta BETTEX', 'BETTEX account', 'Cuenta BETTEX')], ['clerk-signin', x('Entrar (conta anterior)', 'Sign in (legacy account)', 'Entrar (cuenta anterior)')], ['clerk-signup', x('Criar (conta anterior)', 'Create (legacy account)', 'Crear (cuenta anterior)')]] as [Provider, string][]).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={prov === k} data-testid={`provider-${k}`} onClick={() => setProv(k)} className={`min-h-11 rounded-xl text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] ${prov === k ? 'bg-[#0E7C6B] text-white' : 'bg-[#F0E9DA]'}`}>{l}</button>)}</div>
          {prov === 'native' ? <AccountPanel /> : <div className="grid justify-items-center gap-3" data-testid="inline-clerk-auth">{prov === 'clerk-signin' ? <SignIn routing="hash" signUpUrl="#/sign-up" forceRedirectUrl={`${home}${demoPath('account', loc)}`} /> : <SignUp routing="hash" signInUrl="#/" forceRedirectUrl={`${home}${demoPath('account', loc)}`} />}{note}</div>}
        </>}
      </div>
    </>;
  return <section data-testid="page-account" className="demo-root dcard min-w-0">{panel}</section>;
}
export default AccountSheet;
