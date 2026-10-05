/** @jsxImportSource react */
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateDemoProfile, getGetDemoDashboardQueryKey, type DemoDashboard } from '@workspace/api-client-react';
import { useUser, useClerk, UserProfile } from '@clerk/react';
import { Loader2, LogOut, ShieldCheck, UserRound, AlertTriangle } from 'lucide-react';
import { inp } from '@/components/demo/fin';
import { useX } from '@/components/demo/ui';
import { demoPath } from '@/components/demo/demo-navigation';

const primary = 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white hover:bg-[#0A6657] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]';
const link = 'inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';

export function AccountSheet({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const qc = useQueryClient();
  const u = useUpdateDemoProfile();
  const { isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const home = `${base}${loc === 'pt' ? '' : `/${loc}`}`;
  const [name, setName] = useState(d.profile.name);
  const [err, setErr] = useState(false);
  const [saved, setSaved] = useState(false);
  const [out, setOut] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => { setName(d.profile.name); setErr(false); setSaved(false); setOut('idle'); }, [d.profile.accountId]); // eslint-disable-line react-hooks/exhaustive-deps
  const ok = name.trim().length >= 2 && name.trim().length <= 60;
  const save = async () => {
    if (!ok || u.isPending) return;
    try { const s = await u.mutateAsync({ data: { name: name.trim() } }); qc.setQueryData(getGetDemoDashboardQueryKey(), s); setSaved(true); setErr(false); } catch { setErr(true); setSaved(false); }
  };
  const signOut = async () => {
    if (out === 'loading') return;
    setOut('loading');
    try { await clerk.signOut({ redirectUrl: `${home}/` }); } catch { setOut('error'); }
  };
  const since = useMemo(() => new Date(d.profile.memberSince).toLocaleDateString(loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { dateStyle: 'long' }), [d.profile.memberSince, loc]);

  const note = <div className="flex gap-3 rounded-2xl bg-[#EFF6F2] p-3 text-xs leading-relaxed text-[#1B2A41]">
    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0E7C6B]" aria-hidden="true" />
    <p>{x('Tecnologia em protótipo: saldos, depósitos, saques e rendimentos são emulados. Entrar ou sair não move dinheiro real, não cria carteira e não é um fundo. Nenhum dado financeiro é apagado automaticamente.', 'Prototype technology: balances, deposits, withdrawals and yield are emulated. Signing in or out moves no real money, creates no wallet and is not a fund. No financial data is deleted automatically.', 'Tecnología en prototipo: saldos, depósitos, retiros y rendimientos son emulados. Entrar o salir no mueve dinero real, no crea cartera y no es un fondo. Ningún dato financiero se borra automáticamente.')}</p>
  </div>;

  const panel = <>
      <header className="flex items-start justify-between gap-3 border-b border-[#E4DCCB] p-4 sm:px-6">
        <div><h1 className="display text-xl font-extrabold">{x('Minha conta', 'My account', 'Mi cuenta')}</h1>
          <p className="mt-1 text-sm text-[#5B6B85]">{isSignedIn ? x('Perfil, e-mail, senha e dispositivos ativos.', 'Profile, email, password and active devices.', 'Perfil, correo, contraseña y dispositivos activos.') : x('Você está em uma sessão demonstrativa anônima.', 'You are in an anonymous demo session.', 'Estás en una sesión demostrativa anónima.')}</p></div>
      </header>
      <div className="min-w-0 p-4 sm:p-6">
        {!isLoaded ? <div className="grid gap-3" aria-busy="true" aria-label={x('Carregando', 'Loading', 'Cargando')}>{[0, 1, 2].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#F0E9DA]" />)}</div>
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
        : <div className="grid gap-4 md:grid-cols-2">
          <form className="grid content-start gap-3" onSubmit={e => { e.preventDefault(); void save(); }}>
            <p className="flex items-center gap-2 text-sm font-bold"><UserRound className="h-4 w-4 text-[#0E7C6B]" aria-hidden="true" />{x('Perfil anônimo', 'Anonymous profile', 'Perfil anónimo')}</p>
            <label className="grid gap-1 text-sm font-semibold">{x('Nome', 'Name', 'Nombre')}<input data-testid="input-name" className={inp} minLength={2} maxLength={60} value={name} onChange={e => { setName(e.target.value); setErr(false); setSaved(false); }} /></label>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm"><dt className="text-[#5B6B85]">{x('E-mail', 'Email', 'Correo electrónico')}</dt><dd className="break-all">{d.profile.email}</dd><dt className="text-[#5B6B85]">{x('Membro desde', 'Member since', 'Miembro desde')}</dt><dd>{since}</dd><dt className="text-[#5B6B85]">{x('ID da conta', 'Account ID', 'ID de cuenta')}</dt><dd className="mono break-all">{d.profile.accountId}</dd></dl>
            {err && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{x('Não foi possível salvar. Tente de novo.', 'Could not save. Try again.', 'No se pudo guardar. Intenta de nuevo.')}</p>}
            {saved && <p role="status" className="text-sm font-semibold text-[#0E7C6B]">{x('Nome atualizado.', 'Name updated.', 'Nombre actualizado.')}</p>}
            <button type="submit" data-testid="button-save-name" disabled={!ok || u.isPending} className={primary}>{u.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{x('Salvar', 'Save', 'Guardar')}</button>
          </form>
          <div className="grid content-start gap-3">
            <div className="rounded-2xl border border-[#E4DCCB] bg-white p-4"><p className="text-sm font-bold">{x('Sem senha nesta sessão', 'No password in this session', 'Sin contraseña en esta sesión')}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#5B6B85]">{x('A demonstração anônima não tem senha nem recuperação. Ao criar uma conta, os saldos e o histórico emulados desta sessão ficam vinculados a ela no primeiro cadastro.', 'The anonymous demo has no password or recovery. When you create an account, this session\'s emulated balances and history get linked to it on first registration.', 'La demostración anónima no tiene contraseña ni recuperación. Al crear una cuenta, los saldos e historial emulados de esta sesión quedan vinculados en el primer registro.')}</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row"><a data-testid="link-account-sign-up" href={`${home}/sign-up`} className={`${link} bg-[#0E7C6B] !text-white hover:!bg-[#0A6657]`}>{x('Criar conta', 'Create account', 'Crear cuenta')}</a><a data-testid="link-account-sign-in" href={`${home}/sign-in`} className={link}>{x('Entrar', 'Sign in', 'Entrar')}</a></div></div>
            {note}
          </div>
        </div>}
      </div>
    </>;
  return <section data-testid="page-account" className="demo-root dcard min-w-0">{panel}</section>;
}
export default AccountSheet;
