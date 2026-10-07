/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { useSearch, useLocation } from 'wouter';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { demoPath } from '../demo/demo-navigation';
import { RoundIdentity } from '../demo/RoundIdentity';
import { selectTreasuryRound, roundHistoryQuery } from './round-history-selection';
import { SnapshotFacts, ClosedFacts, useRoundFmt } from './RoundFacts';
import { RoundTabs } from './RoundTabs';

export function RoundHistory({ d }: { d: DemoDashboard }) {
  const search = useSearch(); const [, navigate] = useLocation();
  const { x, loc } = useX(); const { dt } = useRoundFmt();
  const requested = new URLSearchParams(search).get('round');
  const native = d.profile.provider === 'native';
  if (native && requested == null) return null;
  const cur = d.treasury.currentRound;
  const go = (id: string) => navigate(demoPath('wallet', loc) + roundHistoryQuery(id, search) + '#round-history');
  const shell = (body: ReactNode) => <section id="round-history" data-testid="round-history" className="dcard grid min-w-0 w-full gap-3 p-4 sm:p-5">
    <h2 className="display text-lg font-extrabold">{x('Histórico por rodada', 'Round history', 'Historial por ronda')}</h2>{body}</section>;
  const unavailable = <p role="status" data-testid="round-history-unavailable" className="rounded-xl bg-[#F5F1E8] p-3 text-sm font-semibold text-[#5B6B85]">{native ? x('Indisponível no protocolo nativo.', 'Unavailable in the native protocol.', 'No disponible en el protocolo nativo.') : x('Histórico de rodadas indisponível: nenhum dado registrado.', 'Round history unavailable: no data recorded.', 'Historial de rondas no disponible: sin datos registrados.')}</p>;
  if (native) return shell(unavailable);
  const sel = selectTreasuryRound(d, requested);
  if (sel.kind === 'unavailable') return shell(unavailable);
  const ids = [...new Set([...(cur ? [cur.id] : []), ...d.rounds.map(r => r.id)])];
  const selector = <label className="grid min-w-0 w-full max-w-full gap-1 text-xs font-bold text-[#5B6B85] sm:max-w-md">{x('Rodada', 'Round', 'Ronda')}
    <select data-testid="select-round-history" value={sel.kind === 'unknown' ? '' : sel.id} onChange={e => go(e.target.value)} className="min-h-11 min-w-0 w-full max-w-full rounded-xl border border-[#D8CFBB] bg-[#FFFCF6] px-3 text-sm font-semibold text-[#1B2A41] hover:border-[#0E7C6B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]">
      {sel.kind === 'unknown' && <option value="" disabled>{x('Selecione uma rodada', 'Select a round', 'Seleccione una ronda')}</option>}
      {ids.map(id => { const r = d.rounds.find(p => p.id === id); const isCur = id === cur?.id;
        return <option key={id} value={id}>{isCur ? x('Atual', 'Current', 'Actual') : x('Encerrada', 'Closed', 'Cerrada')} · {id}{!isCur && r ? ` · ${dt(r.endedAt)}` : ''}</option>; })}
    </select></label>;
  if (sel.kind === 'unknown') return shell(<>{selector}<div role="alert" data-testid="round-history-unknown" className="rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-sm font-semibold text-[#6B3A10]">
    {x(`A rodada "${sel.id}" não existe nos registros.`, `Round "${sel.id}" is not in the records.`, `La ronda "${sel.id}" no existe en los registros.`)}
    {cur && <button type="button" onClick={() => go(cur.id)} className="ml-2 min-h-11 rounded-lg bg-[#0E7C6B] px-3 text-white hover:bg-[#0A6657]">{x('Ver rodada atual', 'View current round', 'Ver ronda actual')}</button>}</div></>);
  const isCur = sel.kind === 'current'; const snap = sel.snapshot;
  const win = snap ? { id: sel.id, startedAt: snap.startedAt, endsAt: snap.endsAt } : null;
  return shell(<>{selector}
    <div className="flex flex-wrap items-center gap-2"><RoundIdentity id={sel.id} testId="round-history-id" />
      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isCur ? 'bg-[#DDEBE4] text-[#0A6657]' : 'bg-[#F0E9DA] text-[#5B6B85]'}`}>{isCur ? x('Atual', 'Current', 'Actual') : x('Encerrada', 'Closed', 'Cerrada')}</span></div>
    {isCur && <p className="text-xs text-[#5B6B85]">{x('Rodada em andamento: distribuição e participação ainda não liquidadas.', 'Round in progress: distribution and participation not settled yet.', 'Ronda en curso: distribución y participación aún no liquidadas.')}</p>}
    <SnapshotFacts s={snap} missing={!isCur} />
    {sel.kind === 'closed' && <ClosedFacts r={sel.round} />}
    <RoundTabs d={d} roundId={sel.id} current={isCur} roundWindow={win} />
  </>);
}
