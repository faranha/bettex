/** @jsxImportSource react */
import { useState } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { Money, type Asset, type Kind } from './fin';
import { WalletAction } from './WalletAction';
import { NativeWalletsCard } from './NativeWalletsCard';
import { NativeParticipationCard } from './NativeParticipationCard';
import { usePersonalNative } from './use-personal-native';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { isDemoSession } from './demo-session';
import { DemoWalletsCard } from './DemoWalletsCard';
import { EarningsWalletCard } from './EarningsWalletCard';

const lk = 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#0E7C6B] bg-white text-[#0A6657] hover:bg-[#E9EEE5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current';
export function PersonalOverview({ d, onWallet }: { d: DemoDashboard; onWallet: (k: Kind, a: Asset) => void }) {
  const { x, loc } = useX(); const { snap } = usePersonalNative(d.profile);
  const [showHistory, setShowHistory] = useState(false);
  const p = d.profile; const b = d.balances;
  const demo = isDemoSession(p);
  const historyAccount = demo ? p.accountId : snap?.account?.id;
  const historyLabel = x('Histórico da conta', 'Account history', 'Historial de la cuenta');
  const historyButton = <button type="button" data-testid="button-account-history" aria-label={historyLabel} title={historyLabel} aria-expanded={showHistory} aria-controls="overview-history" onClick={() => setShowHistory(v => !v)} className={lk}><HistoryIcon className="h-5 w-5" aria-hidden="true" /></button>;
  return <div className="grid gap-3 sm:gap-4" data-testid="personal-overview">
    <section className="grid gap-3" data-testid="overview-account">
    {demo ? <DemoWalletsCard d={d} onWallet={onWallet} showReceivedYield showHeading={false} headerActions={historyButton} /> : <><NativeWalletsCard profile={d.profile} showHeading={false} headerActions={historyButton} /><NativeParticipationCard profile={d.profile} /></>}
    {!demo && <section className="dcard p-4 sm:p-5" data-testid="overview-demo-balances">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="display text-lg font-extrabold">{x('Saldos internos', 'Internal balances', 'Saldos internos')}</h2>
        <span data-testid="label-source-demo" className="text-xs text-[#5B6B85]">{x('Saldo interno', 'Internal balance', 'Saldo interno')}</span></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {([['USDC', x('Saldo em dólares', 'Dollar balance', 'Saldo en dólares'), b.usdc, [['onramp', 'add-credit', x('Adicionar crédito', 'Add credit', 'Agregar crédito')], ['withdraw', 'withdraw-usdc', x('Sacar dólares para carteira cripto', 'Withdraw dollars to crypto wallet', 'Retirar dólares a cartera cripto')], ['swap', 'swap-usdc', x('Converter USDC em BETTEX', 'Convert USDC to BETTEX', 'Convertir USDC en BETTEX')]]], ['BETTEX', x('Saldo em BETTEX', 'BETTEX balance', 'Saldo en BETTEX'), b.bettex, [['receive', 'add-bettex', x('Adicionar BETTEX', 'Add BETTEX', 'Agregar BETTEX')], ['send', 'send-bettex', x('Transferir BETTEX para carteira externa', 'Transfer BETTEX to external wallet', 'Transferir BETTEX a cartera externa')], ['swap', 'swap-bettex', x('Converter BETTEX em USDC', 'Convert BETTEX to USDC', 'Convertir BETTEX en USDC')]]]] as [Asset, string, number, [Kind, string, string][]][]).map(([a, t, v, acts]) =>
          <div key={a} className="rounded-2xl bg-[#F5F1E8] p-3" data-testid={`overview-balance-${a.toLowerCase()}`}><p className="text-xs font-semibold text-[#5B6B85]">{t}</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-2"><Money v={v} a={a} big /><div className="flex gap-2">{acts.map(([k, id, l]) => <WalletAction key={`ov-${id}`} kind={k} asset={a} id={`ov-${id}`} label={l} onOpen={onWallet} />)}</div></div></div>)}
        <EarningsWalletCard d={d} onWallet={onWallet} />
      </div>
      <p className="mt-3 text-xs text-[#5B6B85]">{x('Rendimento já recebido', 'Yield already received', 'Rendimiento ya recibido')}: <b>{b.receivedYield.toLocaleString(loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC</b></p>
    </section>}
    <div id="overview-history" hidden={!showHistory} className="mt-3 border-t border-[#E4DCCB] pt-3" data-testid="overview-history">
      {showHistory && (historyAccount ? <HistoryPanel mode={demo ? 'demo' : 'native'} accountKey={historyAccount} /> : <p className="text-sm text-[#5B6B85]">{x('O histórico estará disponível quando sua conta carregar.', 'History will be available when your account loads.', 'El historial estará disponible cuando se cargue tu cuenta.')}</p>)}
    </div>
    </section>
  </div>;
}
