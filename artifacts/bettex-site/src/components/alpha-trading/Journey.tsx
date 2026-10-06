/** @jsxImportSource react */
import { RefreshCw, X } from 'lucide-react';
import { useGetAlphaTradingJourney, getGetAlphaTradingJourneyQueryKey } from '@workspace/api-client-react';
import { useFmt, card, Tag } from './format';
import { OrderCard, PositionCard } from './Records';

export function Journey({ id, onClose }: { id: string; onClose: () => void }) {
  const f = useFmt(); const { x } = f;
  const q = useGetAlphaTradingJourney(id, { query: { queryKey: getGetAlphaTradingJourneyQueryKey(id), enabled: !!id, retry: 1 } });
  const j = q.data;
  return <section className={card} data-testid="alpha-journey" aria-label={x('Percurso completo', 'Full journey', 'Recorrido completo')}>
    <div className="flex items-center justify-between gap-2"><h3 className="display text-lg font-extrabold">{x('Percurso completo', 'Full journey', 'Recorrido completo')}</h3><button type="button" aria-label={x('Fechar', 'Close', 'Cerrar')} onClick={onClose} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-[#E9EEE5]"><X className="h-5 w-5" aria-hidden="true" /></button></div>
    {q.isLoading && <div className="mt-3 h-24 animate-pulse rounded-xl bg-[#E4DCCB]/60" aria-busy="true" />}
    {q.isError && <div role="alert" className="mt-3 grid justify-items-start gap-2"><p className="font-bold">{x('Percurso indisponível.', 'Journey unavailable.', 'Recorrido no disponible.')}</p><button type="button" onClick={() => void q.refetch()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" aria-hidden="true" />{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div>}
    {j && <div className="mt-3 grid gap-3">
      <p className="text-sm font-bold">{j.opportunity.opportunity.market} <Tag>{f.code(j.opportunity.state)}</Tag></p>
      <div><p className="text-sm font-bold">{x('Linha do tempo', 'Timeline', 'Línea de tiempo')}</p>
        {j.events.length === 0 ? <p className="text-sm text-[#5B6B85]">{x('Sem eventos.', 'No events.', 'Sin eventos.')}</p> : <ol className="mt-1 grid gap-1 text-sm">{[...j.events].sort((a, b) => a.sequence - b.sequence).map(e => <li key={e.sequence}><span className="font-mono text-xs">#{e.sequence} {f.date(e.at)}</span> · <b>{f.code(e.stage)}</b> · {f.reason(e.reason)}</li>)}</ol>}</div>
      <div><p className="text-sm font-bold">{x('Decisões', 'Decisions', 'Decisiones')} ({j.decisions.length})</p><ul className="mt-1 grid gap-1 text-sm">{[...j.opportunity.decisions.map(d => ({ k: d.layer + d.at, t: f.date(d.at), l: f.code(d.layer), r: f.reason(d.reason) })), ...j.decisions.map(d => ({ k: d.id, t: f.date(d.at), l: f.code(d.state), r: f.reason(d.reason) }))].map(d => <li key={d.k}>{d.t} · <b>{d.l}</b> · {d.r}</li>)}</ul></div>
      {j.orders.length > 0 && <div><p className="text-sm font-bold">{x('Ordens', 'Orders', 'Órdenes')}</p><ul className="mt-1 grid gap-2">{j.orders.map(o => <OrderCard key={o.id} o={o} />)}</ul></div>}
      {j.positions.length > 0 && <div><p className="text-sm font-bold">{x('Posições', 'Positions', 'Posiciones')}</p><ul className="mt-1 grid gap-2">{j.positions.map(p => <PositionCard key={p.id} p={p} />)}</ul></div>}
    </div>}
  </section>;
}
