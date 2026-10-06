/** @jsxImportSource react */
import { Link } from 'wouter';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { Money, type Asset, type Kind } from './fin';
import { WalletAction } from './WalletAction';
import { History } from './Views';
import { demoPath } from './demo-navigation';
import { NativeWalletsCard } from './NativeWalletsCard';
import { NativeParticipationCard } from './NativeParticipationCard';
import { usePersonalNative } from './use-personal-native';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { isDemoSession } from './demo-session';
import { DemoWalletsCard } from './DemoWalletsCard';

const lk = 'inline-flex min-h-11 items-center rounded-xl border border-[#0E7C6B] bg-white px-4 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5]';
export function PersonalOverview({ d, onWallet }: { d: DemoDashboard; onWallet: (k: Kind, a: Asset) => void }) {
  const { x, loc } = useX(); const { snap } = usePersonalNative(d.profile);
  const p = d.profile; const b = d.balances;
  const demo = isDemoSession(p);
  const authenticated = p.authenticated === true || demo;
  const since = new Date(p.memberSince).toLocaleDateString(loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { dateStyle: 'long' });
  const acc = snap?.account;
  const rows: [string, string, string][] = [
    ['name', x('Nome', 'Name', 'Nombre'), authenticated ? acc?.displayName ?? p.name : x('Visitante', 'Guest', 'Visitante')], ['email', x('E-mail', 'Email', 'Correo electrónico'), authenticated ? acc?.email ?? p.email : x('Disponível após entrar', 'Available after signing in', 'Disponible al entrar')],
    ['id', x('ID da conta', 'Account ID', 'ID de cuenta'), authenticated ? acc?.id ?? p.accountId : x('Demonstração sem login', 'Demo without sign-in', 'Demostración sin sesión')], ['since', x('Membro desde', 'Member since', 'Miembro desde'), authenticated ? since : x('Disponível após entrar', 'Available after signing in', 'Disponible al entrar')],
    ['auth', x('Acesso', 'Access', 'Acceso'), demo ? x('Sessão de teste ativa · período ALFA', 'Test session active · ALFA period', 'Sesión de prueba activa · período ALFA') : p.authenticated ? x('Sessão ativa', 'Active session', 'Sesión activa') : x('Sessão indisponível', 'Session unavailable', 'Sesión no disponible')],
  ];
  return <div className="grid gap-3 sm:gap-4" data-testid="personal-overview">
    <section className="dcard p-3 sm:p-4" data-testid="overview-account">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="display text-lg font-extrabold">{x('Minha conta', 'My account', 'Mi cuenta')}</h2>
         <Link href={demoPath('account', loc)} data-testid="link-account-full" className={lk}>{demo ? x('Gerenciar conta de teste', 'Manage test account', 'Gestionar cuenta de prueba') : x('Conta, segurança e exportar chaves', 'Account, security and key export', 'Cuenta, seguridad y exportar claves')}</Link></div>
      <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm min-[480px]:grid-cols-2 lg:grid-cols-3">{rows.map(([k, l, v]) => <div key={k} className="min-w-0"><dt className="text-xs text-[#5B6B85]">{l}</dt><dd className="min-w-0 break-all font-bold" data-testid={`text-account-${k}`}>{v}</dd></div>)}</dl>
    </section>
    {demo ? <DemoWalletsCard d={d} onWallet={onWallet} showReceivedYield /> : <><NativeWalletsCard profile={d.profile} /><NativeParticipationCard profile={d.profile} /></>}
    {!demo && <section className="dcard p-4 sm:p-5" data-testid="overview-demo-balances">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="display text-lg font-extrabold">{x('Saldos da demonstração', 'Demo balances', 'Saldos de la demostración')}</h2>
        <span data-testid="label-source-demo" className="rounded-full bg-[#DDEBE4] px-2.5 py-0.5 text-xs font-bold text-[#0A6657]">{x('Emulado · não é cadeia nem dinheiro real', 'Emulated · not chain nor real money', 'Emulado · no es cadena ni dinero real')}</span></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {([['USDC', x('Saldo em dólares', 'Dollar balance', 'Saldo en dólares'), b.usdc, [['onramp', 'add-credit', x('Adicionar crédito', 'Add credit', 'Agregar crédito')], ['withdraw', 'withdraw-usdc', x('Sacar dólares para carteira cripto', 'Withdraw dollars to crypto wallet', 'Retirar dólares a cartera cripto')], ['swap', 'swap-usdc', x('Converter USDC em BETTEX', 'Convert USDC to BETTEX', 'Convertir USDC en BETTEX')]]], ['BETTEX', x('Saldo em BETTEX', 'BETTEX balance', 'Saldo en BETTEX'), b.bettex, [['receive', 'add-bettex', x('Adicionar BETTEX', 'Add BETTEX', 'Agregar BETTEX')], ['send', 'send-bettex', x('Transferir BETTEX para carteira externa', 'Transfer BETTEX to external wallet', 'Transferir BETTEX a cartera externa')], ['swap', 'swap-bettex', x('Converter BETTEX em USDC', 'Convert BETTEX to USDC', 'Convertir BETTEX en USDC')]]]] as [Asset, string, number, [Kind, string, string][]][]).map(([a, t, v, acts]) =>
          <div key={a} className="rounded-2xl bg-[#F5F1E8] p-3" data-testid={`overview-balance-${a.toLowerCase()}`}><p className="text-xs font-semibold text-[#5B6B85]">{t}</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-2"><Money v={v} a={a} big /><div className="flex gap-2">{acts.map(([k, id, l]) => <WalletAction key={`ov-${id}`} kind={k} asset={a} id={`ov-${id}`} label={l} onOpen={onWallet} />)}</div></div></div>)}
      </div>
      <p className="mt-3 text-xs text-[#5B6B85]">{x('Rendimento já recebido (emulado)', 'Yield already received (emulated)', 'Rendimiento ya recibido (emulado)')}: <b>{b.receivedYield.toLocaleString(loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC</b></p>
    </section>}
    <section className="dcard p-4 sm:p-5" data-testid="overview-activity">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="display text-lg font-extrabold">{x('Atividade recente', 'Recent activity', 'Actividad reciente')}</h2><Link href={demoPath('wallet', loc)} data-testid="link-full-history" className={lk}>{x('Ver saldo e histórico completo', 'See full balance and history', 'Ver saldo e historial completo')}</Link></div>
      {snap?.account ? <HistoryPanel mode="native" accountKey={snap.account.id} />
        : <><p className="mb-2 text-xs text-[#5B6B85]">{x('Movimentações emuladas da demonstração.', 'Emulated demo movements.', 'Movimientos emulados de la demostración.')}</p><History d={d} limit={5} /></>}
    </section>
  </div>;
}
