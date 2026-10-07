/** @jsxImportSource react */
import type { ReactNode } from 'react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { PreviousCycle } from './PreviousCycle';
import { HistoryPanel } from '../history/HistoryPanel';
import { WalletStatement } from '../history/WalletStatement';
import { TestContractPanel } from './TestContractPanel';
import { isDemoSession } from './demo-session';
import { NativeParticipationCard } from './NativeParticipationCard';

export function WalletPage({ d, historyPanel, extra }: { d: DemoDashboard; historyPanel?: ReactNode; extra?: ReactNode }) {
  const { x } = useX();
  return <div className="grid gap-4" data-testid="page-wallet">
    <h2 className="display text-xl font-extrabold tracking-tight" data-testid="text-wallet-title">{x('Histórico', 'History', 'Historial')}</h2>
    {!isDemoSession(d.profile) && (d.profile.provider === 'native' ? <NativeParticipationCard profile={d.profile} /> : <TestContractPanel />)}
    <WalletStatement key={d.profile.accountId} d={d} />
    {extra}
    <details className="dcard p-4 sm:p-5">
      <summary className="cursor-pointer text-sm font-bold">{x('Detalhes do ciclo anterior', 'Previous cycle details', 'Detalles del ciclo anterior')}</summary>
      <div className="mt-4"><PreviousCycle d={d} /></div>
    </details>
    <details className="dcard p-4 sm:p-5">
      <summary className="cursor-pointer text-sm font-bold">{x('Auditoria detalhada e operações relacionadas', 'Detailed audit and related operations', 'Auditoría detallada y operaciones relacionadas')}</summary>
      <div className="mt-4">{historyPanel ?? <HistoryPanel mode={d.profile.provider === 'native' ? 'native' : 'demo'} accountKey={d.profile.accountId} />}</div>
    </details>
  </div>;
}
