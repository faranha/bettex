/** @jsxImportSource react */
import { useEffect, useState, type ReactNode } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useGetDemoTreasuryActivity, getGetDemoTreasuryActivityQueryKey, type DemoTreasuryActivityItem, type DemoDashboard } from '@workspace/api-client-react';
import { AGENTS, useX } from './ui';
import { Money, useMoney } from './fin';
import { formatBrazilDateTime } from './brazil-time';
import { RoundIdentity } from './RoundIdentity';

export type ActivityView = 'closed' | 'fees' | 'history';
const PAGE_SIZE = 20;
const prec = (v: number) => Number(v.toFixed(2)) !== v ? 6 : 2;

export function TreasuryActivity({ d, roundId, view, header, archived = false }: { d: DemoDashboard; roundId: string; view: ActivityView; header?: ReactNode; archived?: boolean }) {
  const { x, tx, loc } = useX(); const { num } = useMoney();
  const [page, setPage] = useState(1);
  const [snap, setSnap] = useState<string | undefined>(undefined);
  const accountId = d.profile.accountId;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const params = { roundId, view, page, pageSize: PAGE_SIZE, ...(page > 1 && snap ? { snapshot: snap } : {}) };
  const q = useGetDemoTreasuryActivity(params, { query: { queryKey: [...getGetDemoTreasuryActivityQueryKey(params), accountId, archived], placeholderData: keepPreviousData, refetchInterval: page === 1 && !archived ? 15000 : false } });
  const data = q.data;
  useEffect(() => { setPage(1); setSnap(undefined); }, [roundId, view, accountId]);
  useEffect(() => { if (page === 1 && data?.page === 1 && data.roundId === roundId && !q.isPlaceholderData) setSnap(data.snapshot); }, [page, data, roundId, q.isPlaceholderData]);

  const busy = q.isFetching;
  const stale = q.isPlaceholderData || !!data && (data.page !== page || data.roundId !== roundId);
  const items = stale ? [] : data?.items ?? [];
  const go = (p: number) => { if (busy) return; if (p === 1) setSnap(undefined); setPage(p); };
  const agent = (id: string | null) => { if (!id) return null; const a = (AGENTS as Record<string, { name: readonly [string, string, string] }>)[id]; return a ? tx(a.name) : id; };
  const dt = (s: string) => formatBrazilDateTime(s, fl, { dateStyle: 'medium', timeStyle: 'short' });
  const fk = (k: string | null) => ({ onramp: x('Saldo adicionado', 'Balance added', 'Saldo agregado'), swap: x('Troca', 'Swap', 'Cambio'), withdraw: x('Saque USDC', 'USDC withdrawal', 'Retiro USDC'), send: x('Envio', 'Send', 'Envío'), transfer: x('Transferência de rendimentos', 'Earnings transfer', 'Transferencia de ganancias') } as Record<string, string>)[k ?? ''] ?? '-';
  const cell = (label: string, v: number | null, signed = false) => <div className="text-xs text-[#5B6B85]">{label}<br />{v == null ? <b>-</b> : <Money v={v} a="USDC" signed={signed} precision={prec(v)} />}</div>;

  const row = (it: DemoTreasuryActivityItem) => {
    const head = it.kind === 'position_closed' ? x('Posição encerrada', 'Position closed', 'Posición cerrada') : it.kind === 'operator_fee' ? `${x('Tarifa do operador', 'Operator fee', 'Tarifa del operador')} · ${fk(it.feeKind)}` : x('Saldo de abertura', 'Opening balance', 'Saldo de apertura');
    return <li key={it.id} data-testid="treasury-activity-row" className="grid gap-2 py-3 sm:grid-cols-[1.3fr_repeat(4,1fr)] sm:items-start">
      <div className="min-w-0"><p className="text-sm font-bold">{agent(it.agent) ?? head}{it.agent && <span className="ml-1 rounded-full bg-[#DDEBE4] px-2 text-xs font-semibold text-[#0A6657]">{head}</span>}</p>
        <p className="mono break-all text-[11px] text-[#5B6B85]">{it.id}{it.market ? ` · ${it.market}` : ''}</p><p className="text-xs text-[#5B6B85]">{dt(it.at)}</p>
        {it.source === 'modeled_baseline' && <p className="text-[11px] font-semibold text-[#8A641D]">{x('Roteiro modelado', 'Modeled storyline', 'Guion modelado')}</p>}</div>
      {it.kind === 'operator_fee' ? <>{cell(x('Tarifa', 'Fee', 'Tarifa'), it.feeUsdc)}</> : it.kind === 'checkpoint' ? <>{cell(x('Ativos na abertura', 'Opening assets', 'Activos de apertura'), it.capitalUsdc)}
        <p className="text-xs leading-snug text-[#5B6B85] sm:col-span-3">{x('Base de abertura do cenário emulado. Não é lucro nem tarifa.', 'Opening baseline for the emulated scenario. This is neither profit nor a fee.', 'Base de apertura del escenario emulado. No es ganancia ni tarifa.')}</p></> :
        <>{cell(x('Capital', 'Capital', 'Capital'), it.capitalUsdc)}{cell(x('Bruto', 'Gross', 'Bruto'), it.grossUsdc, true)}{cell(x('Custo', 'Cost', 'Costo'), it.costUsdc)}{cell(x('Líquido', 'Net', 'Neto'), it.netUsdc, true)}</>}
    </li>;
  };

  return <div>
    <RoundIdentity id={roundId} testId="treasury-activity-round-id" />
    {header}
    {q.isError && data && <p role="alert" className="mt-2 text-xs font-semibold text-[#8A641D]">{x('Não foi possível atualizar. Exibindo a última leitura salva.', 'Could not refresh. Showing the last loaded records.', 'No se pudo actualizar. Se muestra la última lectura guardada.')} <button type="button" className="underline" onClick={() => void q.refetch()}>{x('Tentar novamente', 'Try again', 'Reintentar')}</button></p>}
    {q.isError && !data ? <div role="alert" data-testid="treasury-activity-error" className="mt-3 rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-sm font-semibold text-[#6B3A10]">{x('Não foi possível carregar a atividade.', 'Could not load activity.', 'No se pudo cargar la actividad.')} <button type="button" onClick={() => void q.refetch()} className="ml-2 min-h-11 rounded-lg bg-[#0E7C6B] px-3 text-white">{x('Tentar de novo', 'Try again', 'Reintentar')}</button></div> :
      <>
        <p data-testid="treasury-activity-count" aria-live="polite" className="mt-3 text-xs font-semibold text-[#5B6B85]">{!data || stale ? x('Carregando…', 'Loading…', 'Cargando…') : x(`${num(data.total, 0)} registros · página ${data.page} de ${Math.max(1, data.totalPages)}`, `${num(data.total, 0)} records · page ${data.page} of ${Math.max(1, data.totalPages)}`, `${num(data.total, 0)} registros · página ${data.page} de ${Math.max(1, data.totalPages)}`)}{busy && data && !stale ? ` · ${x('atualizando', 'updating', 'actualizando')}` : ''}</p>
        {page > 1 && <p className="mt-1 text-[11px] text-[#5B6B85]">{archived ? x('Páginas preservam a mesma leitura do arquivo desta rodada.', 'Pages preserve the same snapshot of this round’s archive.', 'Las páginas conservan la misma lectura del archivo de esta ronda.') : x('Páginas preservam a mesma leitura; os totais da rodada continuam ao vivo.', 'Pages preserve the same snapshot; cycle totals remain live.', 'Las páginas conservan la misma lectura; los totales de la ronda siguen en vivo.')}</p>}
        {!data || stale ? <div className="mt-2 grid gap-2" aria-busy="true">{[0, 1, 2].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-[#F0E9DA]" />)}</div> :
          !items.length ? <p className="mt-2 rounded-xl bg-[#F5F1E8] p-3 text-sm text-[#5B6B85]">{archived ? x('Nenhum registro individual preservado nesta visão da rodada. A foto salva acima não reconstrói eventos ausentes.', 'No individual records retained in this view of the round. The saved snapshot above does not reconstruct missing events.', 'No se conservaron registros individuales en esta vista de la ronda. La foto guardada arriba no reconstruye eventos ausentes.') : x('Nada registrado nesta visão ainda.', 'Nothing in this view yet.', 'Nada en esta vista todavía.')}</p> :
            <ul className={`mt-2 divide-y divide-[#EBE3D1] ${busy ? 'opacity-60' : ''}`}>{items.map(row)}</ul>}
        {q.isError && data && <p role="alert" data-testid="treasury-activity-error" className="mt-2 text-xs font-semibold text-[#B4421A]">{x('Falha ao atualizar. Mostrando os últimos dados.', 'Update failed. Showing last data.', 'Falló la actualización. Mostrando los últimos datos.')} <button type="button" className="underline" onClick={() => void q.refetch()}>{x('Tentar de novo', 'Try again', 'Reintentar')}</button></p>}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" data-testid="treasury-page-previous" disabled={busy || page <= 1} onClick={() => go(page - 1)} className="min-h-11 rounded-xl border border-[#D8CFBB] px-4 text-sm font-bold disabled:opacity-40">{x('Anterior', 'Previous', 'Anterior')}</button>
          {page > 1 && <button type="button" disabled={busy} onClick={() => go(1)} className="min-h-11 px-2 text-xs font-bold text-[#0E7C6B] underline disabled:opacity-40">{x('Voltar ao mais recente', 'Back to latest', 'Volver a lo más reciente')}</button>}
          <button type="button" data-testid="treasury-page-next" disabled={busy || !data || page >= data.totalPages} onClick={() => go(page + 1)} className="min-h-11 rounded-xl border border-[#D8CFBB] px-4 text-sm font-bold disabled:opacity-40">{x('Próxima', 'Next', 'Próxima')}</button>
        </div>
      </>}
  </div>;
}
