/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { useLocation, useSearch } from 'wouter';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { HistoryPanel } from '../history/HistoryPanel';
import { WalletStatement } from '../history/WalletStatement';
import { TestContractPanel } from './TestContractPanel';
import { isDemoSession } from './demo-session';
import { NativeParticipationCard } from './NativeParticipationCard';
import { TreasuryStatement } from '../history/TreasuryStatement';
import { RoundHistory } from '../history/RoundHistory';
import { historyQuery, selectHistoryArea, type HistoryArea } from '../history/history-selection';
import { useHistoryAnchor } from '../history/useHistoryAnchor';
import { demoPath } from './demo-navigation';

export function WalletPage({ d, historyPanel }: { d: DemoDashboard; historyPanel?: ReactNode }) {
  const { x, loc } = useX();
  const search = useSearch(); const [, navigate] = useLocation();
  const area = !search && !window.location.hash && d.profile.provider === 'native' ? 'wallets' : selectHistoryArea(search, window.location.hash);
  const root = useHistoryAnchor(area, search);
  const areas: { id: HistoryArea; label: string }[] = [
    { id: 'wallets', label: x('Carteiras', 'Wallets', 'Carteras') },
    { id: 'treasury', label: x('Tesouraria', 'Treasury', 'Tesorería') },
    { id: 'rounds', label: x('Rodadas', 'Rounds', 'Rondas') },
    { id: 'audit', label: x('Auditoria', 'Audit', 'Auditoría') },
  ];
  return <div ref={root} className="grid min-w-0 w-full gap-4" data-testid="page-wallet">
    <h2 className="display text-xl font-extrabold tracking-tight" data-testid="text-wallet-title">{x('Histórico', 'History', 'Historial')}</h2>
    <nav aria-label={x('Área do histórico', 'History area', 'Área del historial')} className="flex flex-wrap gap-2">
      {areas.map(a => <button key={a.id} type="button" data-testid={`history-area-${a.id}`} aria-current={area === a.id ? 'page' : undefined}
        onClick={() => navigate(`${demoPath('wallet', loc)}${historyQuery(a.id)}`)}
        className={`min-h-11 rounded-xl border px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] ${area === a.id ? 'border-[#0E7C6B] bg-[#0E7C6B] text-white' : 'border-[#E4DCCB] bg-[#FFFCF6] text-[#1B2A41] hover:bg-[#E9EEE5]'}`}>{a.label}</button>)}
    </nav>
    {area === 'rounds' && (d.profile.provider === 'native'
      ? <section id="round-history" className="dcard p-4 text-sm text-[#5B6B85]">{x('Histórico de rodadas indisponível no protocolo nativo.', 'Round history unavailable in the native protocol.', 'Historial de rondas no disponible en el protocolo nativo.')}</section>
      : <RoundHistory key={`round-history-${d.profile.accountId}`} d={d} />)}
    {area === 'treasury' && <TreasuryStatement dashboard={d} serverNow={d.serverNow} roundStartedAt={d.treasury.currentRound?.startedAt} />}
    {area === 'wallets' && <WalletStatement key={d.profile.accountId} d={d} />}
    {area === 'audit' && <section id="history-audit" className="dcard grid gap-4 p-4 sm:p-5">
      <h3 className="display text-lg font-extrabold">{x('Auditoria detalhada e operações relacionadas', 'Detailed audit and related operations', 'Auditoría detallada y operaciones relacionadas')}</h3>
      {!isDemoSession(d.profile) && (d.profile.provider === 'native' ? <NativeParticipationCard profile={d.profile} /> : <TestContractPanel />)}
      {historyPanel ?? <HistoryPanel mode={d.profile.provider === 'native' ? 'native' : 'demo'} accountKey={d.profile.accountId} treasuryAccess={!!d.profile.canViewTreasuryHistory} />}
    </section>}
  </div>;
}
