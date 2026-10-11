/** @jsxImportSource react */
import { useMemo } from 'react';
import { useLocation, useSearch } from 'wouter';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { demoPath } from '../demo/demo-navigation';
import { HistoryPanel } from '../history/HistoryPanel';
import { WalletStatement } from '../history/WalletStatement';
import { RoundHistory } from '../history/RoundHistory';
import { selectHistoryArea, type HistoryArea } from '../history/history-selection';
import { useHistoryAnchor } from '../history/useHistoryAnchor';
import { DemoTreasuryStatement } from './TreasuryDemoStatement';
import { TreasuryDemoProvider } from './TreasuryDemoProvider';
import { historyDashboard } from './history-demo-data';

/**
 * Complete original History (wallets, treasury, rounds, audit) over one local illustrative source.
 * The original queries are answered in the browser by the visual-demo transport; nothing is sent anywhere.
 */
export function MockHistoryPanel({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const search = useSearch();
  const [, navigate] = useLocation();
  const hd = useMemo(() => historyDashboard(d), [d]);
  const area = selectHistoryArea(search, typeof window === 'undefined' ? '' : window.location.hash);
  const root = useHistoryAnchor(area, search);
  const areas: { id: HistoryArea; label: string }[] = [
    { id: 'wallets', label: x('Carteiras', 'Wallets', 'Carteras') },
    { id: 'treasury', label: x('Tesouraria e recompra', 'Treasury and buyback', 'Tesorería y recompra') },
    { id: 'rounds', label: x('Rodadas', 'Rounds', 'Rondas') },
    { id: 'audit', label: x('Auditoria', 'Audit', 'Auditoría') },
  ];
  return <div ref={root} className="grid min-w-0 w-full gap-4" data-testid="page-history-mock">
    <h2 className="display text-xl font-extrabold tracking-tight" data-testid="text-wallet-title">{x('Histórico', 'History', 'Historial')}</h2>
    <p className="text-xs text-[#5B6B85]" data-testid="history-demo-note">{x('Registros de exemplo ilustrativos, locais a esta interface. Identificadores fictícios, sem blockchain nem transações reais; downloads exportam apenas estes registros.', 'Illustrative sample records, local to this interface. Fictitious identifiers, no blockchain or real transactions; downloads export only these records.', 'Registros de ejemplo ilustrativos, locales a esta interfaz. Identificadores ficticios, sin blockchain ni transacciones reales; las descargas exportan solo estos registros.')}</p>
    <nav aria-label={x('Área do histórico', 'History area', 'Área del historial')} role="tablist" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {areas.map(a => <button key={a.id} type="button" role="tab" aria-selected={area === a.id} data-testid={`tab-history-${a.id}`}
        onClick={() => navigate(`${demoPath('wallet', loc)}?${(() => { const p = new URLSearchParams(search); p.set('history', a.id); return p.toString(); })()}`)}
        className={`min-h-11 rounded-xl border px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] ${area === a.id ? 'border-[#0E7C6B] bg-[#0E7C6B] text-white' : 'border-[#E4DCCB] bg-[#FFFCF6] text-[#1B2A41] hover:bg-[#E9EEE5]'}`}>{a.label}</button>)}
    </nav>
    {area === 'rounds' && <div data-demo-local className="min-w-0"><RoundHistory key="round-history" d={hd} visualDemo /></div>}
    {area === 'treasury' && <section className="dcard min-w-0 p-4 sm:p-5"><TreasuryDemoProvider><DemoTreasuryStatement d={d} /></TreasuryDemoProvider></section>}
    {area === 'wallets' && <div data-demo-local className="min-w-0"><WalletStatement key={d.profile.accountId} d={hd} visualDemo /></div>}
    {area === 'audit' && <section id="history-audit" data-demo-local className="dcard grid min-w-0 gap-4 p-4 sm:p-5">
      <h3 className="display text-lg font-extrabold">{x('Auditoria detalhada e operações relacionadas', 'Detailed audit and related operations', 'Auditoría detallada y operaciones relacionadas')}</h3>
      <HistoryPanel mode="demo" accountKey={d.profile.accountId} treasuryAccess={false} visualDemo />
    </section>}
  </div>;
}
