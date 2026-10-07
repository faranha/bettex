/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { useSearch, useLocation } from 'wouter';
import { useGetDemoRoundArchive, getGetDemoRoundArchiveQueryKey, type DemoDashboard } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { demoPath } from '../demo/demo-navigation';
import { RoundIdentity } from '../demo/RoundIdentity';
import { selectTreasuryRound, roundHistoryQuery } from './round-history-selection';
import { SnapshotFacts, ClosedFacts } from './RoundFacts';
import { RoundTabs } from './RoundTabs';
import { RoundArchiveBrowser } from './RoundArchiveBrowser';
import { TreasuryRoundHeader } from '../demo/TreasuryRoundHeader';

export function RoundHistory({ d }: { d: DemoDashboard }) {
  const search = useSearch(); const [, navigate] = useLocation();
  const { x, loc } = useX();
  const requested = new URLSearchParams(search).get('round');
  const native = d.profile.provider === 'native';
  const rawPage = Number(new URLSearchParams(search).get('roundPage') ?? 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const params = { page, pageSize: 10, round: requested ?? undefined };
  const archive = useGetDemoRoundArchive(params, { query: {
    enabled: !native,
    queryKey: [...getGetDemoRoundArchiveQueryKey(params), d.profile.accountId],
    staleTime: 30_000, refetchInterval: 60_000,
  } });
  if (native && requested == null) return null;
  const cur = d.treasury.currentRound;
  const go = (id: string) => navigate(demoPath('wallet', loc) + roundHistoryQuery(id, search) + '#round-history');
  const goPage = (next: number) => {
    const query = new URLSearchParams(search); query.set('roundPage', String(next));
    navigate(demoPath('wallet', loc) + '?' + query.toString() + '#round-archive');
  };
  const shell = (body: ReactNode) => <section id="round-history" data-testid="round-history" className="dcard grid min-w-0 w-full gap-3 p-4 sm:p-5">
    <h2 className="display text-lg font-extrabold">{x('Histórico por rodada', 'Round history', 'Historial por ronda')}</h2>{body}</section>;
  const unavailable = <p role="status" data-testid="round-history-unavailable" className="rounded-xl bg-[#F5F1E8] p-3 text-sm font-semibold text-[#5B6B85]">{native ? x('Indisponível no protocolo nativo.', 'Unavailable in the native protocol.', 'No disponible en el protocolo nativo.') : x('Histórico de rodadas indisponível: nenhum dado registrado.', 'Round history unavailable: no data recorded.', 'Historial de rondas no disponible: sin datos registrados.')}</p>;
  if (native) return shell(unavailable);
  const archiveRounds = [...(archive.data?.selected ? [archive.data.selected] : []), ...(archive.data?.items ?? [])];
  const detailDashboard = { ...d, rounds: [...archiveRounds, ...d.rounds.filter(r => !archiveRounds.some(a => a.id === r.id))] };
  const sel = selectTreasuryRound(detailDashboard, requested);
  const browser = <RoundArchiveBrowser data={archive.data} loading={archive.isLoading} error={archive.isError}
    currentId={cur?.id} selectedId={sel.kind === 'unavailable' ? undefined : sel.id} page={page}
    onPage={goPage} onSelect={go} onRetry={() => { void archive.refetch(); }} />;
  if (sel.kind === 'unavailable') return shell(<>{browser}{unavailable}</>);
  if (sel.kind === 'unknown' && archive.isLoading) return shell(browser);
  if (sel.kind === 'unknown' && archive.isError) return shell(browser);
  if (sel.kind === 'unknown') return shell(<>{browser}<div role="alert" data-testid="round-history-unknown" className="rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-sm font-semibold text-[#6B3A10]">
    {x(`A rodada "${sel.id}" não existe nos registros.`, `Round "${sel.id}" is not in the records.`, `La ronda "${sel.id}" no existe en los registros.`)}
    {cur && <button type="button" onClick={() => go(cur.id)} className="ml-2 min-h-11 rounded-lg bg-[#0E7C6B] px-3 text-white hover:bg-[#0A6657]">{x('Ver rodada atual', 'View current round', 'Ver ronda actual')}</button>}</div></>);
  const isCur = sel.kind === 'current'; const snap = sel.snapshot;
  const win = snap ? { id: sel.id, startedAt: snap.startedAt, endsAt: snap.endsAt } : null;
  return shell(<>
    {isCur && snap ? <TreasuryRoundHeader round={snap} serverNow={d.serverNow} testIdPrefix="history" roundIdentityTestId="round-history-id" />
      : <div className="flex flex-wrap items-center gap-2"><RoundIdentity id={sel.id} testId="round-history-id" />
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isCur ? 'bg-[#DDEBE4] text-[#0A6657]' : 'bg-[#F0E9DA] text-[#5B6B85]'}`}>{isCur ? x('Atual', 'Current', 'Actual') : x('Encerrada', 'Closed', 'Cerrada')}</span></div>}
    {isCur && <p className="text-xs text-[#5B6B85]">{x('Rodada em andamento: distribuição e participação ainda não liquidadas.', 'Round in progress: distribution and participation not settled yet.', 'Ronda en curso: distribución y participación aún no liquidadas.')}</p>}
    <SnapshotFacts s={snap} missing={!isCur} />
    {sel.kind === 'closed' && <ClosedFacts r={sel.round} />}
    <RoundTabs d={detailDashboard} roundId={sel.id} current={isCur} roundWindow={win} />
    {browser}
  </>);
}
