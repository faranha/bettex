/** @jsxImportSource react */
import { useState } from 'react';
import { Link } from 'wouter';
import { FileText } from 'lucide-react';
import { useGetDemoRoundArchive, getGetDemoRoundArchiveQueryKey, getDemoRoundArchive, type DemoDashboard, type DemoRound } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { Money } from '../demo/fin';
import { formatBrazilDateTime } from '../demo/brazil-time';
import { demoPath } from '../demo/demo-navigation';
import { historyQuery } from './history-selection';
import { safeCsvCell } from './wallet-history-export';
import { walletAllocation, walletAllocationRows, type AllocationWallet } from './treasury-wallet-history-model';

const button = 'min-h-11 rounded-xl border border-[#D8CFBB] bg-white px-3 text-sm font-bold text-[#0A6657] disabled:opacity-40';

export function TreasuryWalletRoundHistory({ d, purpose }: { d: DemoDashboard; purpose: AllocationWallet }) {
  const { x, loc } = useX();
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [exportError, setExportError] = useState(false);
  const params = { page, pageSize: 10 };
  const q = useGetDemoRoundArchive(params, { query: {
    enabled: d.profile.provider !== 'native',
    queryKey: [...getGetDemoRoundArchiveQueryKey(params), d.profile.accountId],
    staleTime: 30_000, refetchInterval: 60_000,
  } });
  const rows = walletAllocationRows(page === 1 ? d.treasury.currentRound : undefined, q.data?.items ?? []);
  const totalPages = Math.max(1, Math.ceil((q.data?.total ?? 0) / 10));
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'es' ? 'es-ES' : 'en-US';

  const download = async () => {
    if (busy) return;
    setBusy(true); setExportError(false);
    try {
      const archived: DemoRound[] = [];
      let expected = 0;
      for (let next = 1; ; next++) {
        const result = await getDemoRoundArchive({ page: next, pageSize: 50 });
        if (next === 1) expected = result.total;
        if (result.total !== expected || result.page !== next) throw new Error('archive_changed');
        archived.push(...result.items);
        if (next * result.pageSize >= result.total) break;
        if (!result.items.length) throw new Error('incomplete_archive');
      }
      if (new Set(archived.map(r => r.id)).size !== expected) throw new Error('incomplete_archive');
      const header = [x('Rodada', 'Round', 'Ronda'), x('Data (São Paulo)', 'Date (São Paulo)', 'Fecha (São Paulo)'),
        x('Carteira', 'Wallet', 'Cartera'), x('Tipo', 'Type', 'Tipo'), 'USDC'];
      const data = walletAllocationRows(d.treasury.currentRound, archived).map(row => [
        row.id, formatBrazilDateTime(row.at, fl), purpose, row.current ? 'current_allocation' : 'saved_round_allocation',
        walletAllocation(row.snapshot, purpose)?.toString() ?? '',
      ]);
      const csv = '\uFEFF' + [header, ...data].map(line => line.map(safeCsvCell).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url; link.download = `treasury-${purpose}-allocations.csv`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setExportError(true); } finally { setBusy(false); }
  };

  return <section data-testid={`treasury-wallet-round-history-${purpose}`} className="grid min-w-0 gap-3 rounded-2xl border border-[#E4DCCB] bg-[#FBF8F0] p-3 sm:p-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <h3 className="display text-base font-extrabold">{x('Alocações por rodada', 'Round allocations', 'Asignaciones por ronda')}</h3>
      <button type="button" className={button} disabled={busy || q.isLoading || q.isError} onClick={() => void download()} data-testid="treasury-wallet-allocations-csv">{x('Alocações salvas (CSV)', 'Saved allocations (CSV)', 'Asignaciones guardadas (CSV)')}</button>
    </div>
    <p className="text-xs text-[#5B6B85]">{x('Posição atual e fotos salvas das rodadas, não entradas ou saídas de caixa. Este arquivo tem paginação própria e não usa os filtros de transações abaixo. Valores antigos ausentes permanecem não registrados.', 'Current position and saved round snapshots, not cash inflows or outflows. This archive has its own pagination and does not use the transaction filters below. Missing historical values remain unrecorded.', 'Posición actual y fotos guardadas de las rondas, no entradas o salidas de caja. Este archivo tiene paginación propia y no usa los filtros de transacciones inferiores. Los valores históricos ausentes siguen sin registrar.')}</p>
    {q.isLoading && <div className="h-12 animate-pulse rounded-xl bg-[#EEE9DD]" aria-busy="true" />}
    {q.isError && <div role="alert" className="text-sm text-[#8C2B2B]">{x('Não foi possível carregar as alocações salvas.', 'Could not load saved allocations.', 'No se pudieron cargar las asignaciones guardadas.')} <button type="button" className={button} onClick={() => void q.refetch()}>{x('Tentar novamente', 'Try again', 'Reintentar')}</button></div>}
    {exportError && <p role="alert" className="text-sm text-[#8C2B2B]">{x('Não foi possível exportar o arquivo completo. Tente novamente.', 'Could not export the complete archive. Try again.', 'No se pudo exportar el archivo completo. Inténtalo de nuevo.')}</p>}
    {rows.map(row => {
      const value = walletAllocation(row.snapshot, purpose);
      const label = x(`Ver rodada ${row.id}`, `View round ${row.id}`, `Ver ronda ${row.id}`);
      return <div key={row.id} data-testid={`wallet-allocation-round-${row.id}`} className="grid min-w-0 gap-2 rounded-xl border border-[#E4DCCB] bg-white p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
        <div className="min-w-0"><p className="font-bold">{row.id}</p><p className="text-xs text-[#5B6B85]">{row.current ? x('Rodada atual', 'Current round', 'Ronda actual') : x('Foto salva da rodada', 'Saved round snapshot', 'Foto guardada de la ronda')}</p><p className="text-xs text-[#5B6B85]">{formatBrazilDateTime(row.at, fl)}</p></div>
        {value === null ? <p className="text-sm text-[#5B6B85]">{x('Não registrado', 'Not recorded', 'No registrado')}</p> : <Money v={value} a="USDC" />}
        <Link className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#D8CFBB] text-[#0A6657]" aria-label={label} title={label} href={`${demoPath('wallet', loc)}${historyQuery('rounds', { round: row.id })}#round-history`}><FileText className="h-4 w-4" aria-hidden="true" /></Link>
      </div>;
    })}
    {!q.isLoading && !q.isError && !rows.length && <p className="text-sm text-[#5B6B85]">{x('Nenhuma alocação registrada.', 'No recorded allocation.', 'Ninguna asignación registrada.')}</p>}
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className={button} disabled={page === 1 || q.isLoading} onClick={() => setPage(p => p - 1)}>{x('Anterior', 'Previous', 'Anterior')}</button>
      <span className="text-xs font-bold">{page} / {totalPages}</span>
      <button type="button" className={button} disabled={page >= totalPages || q.isLoading || q.isError} onClick={() => setPage(p => p + 1)}>{x('Próxima', 'Next', 'Siguiente')}</button>
    </div>
  </section>;
}
