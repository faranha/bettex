/** @jsxImportSource react */
import { RefreshCw } from 'lucide-react';
import { useGetAlphaTrading, getGetAlphaTradingQueryKey } from '@workspace/api-client-react';
import { useFmt, card, KV, Tag } from './format';

const CAP = { view: 'positions', limit: 1 } as const;
export function AlphaTradingCapitalPanel() {
  const f = useFmt(); const { x } = f;
  const q = useGetAlphaTrading(CAP, { query: { queryKey: getGetAlphaTradingQueryKey(CAP), refetchInterval: 15000, retry: 1 } });
  const d = q.data;
  return <section className={card} data-testid="alpha-capital" aria-label={x('Projeção de capital', 'Capital projection', 'Proyección de capital')}>
    <h2 className="display text-lg font-extrabold">{x('Projeção de capital', 'Capital projection', 'Proyección de capital')}</h2>
    {q.isLoading && <div className="mt-3 h-24 animate-pulse rounded-xl bg-[#E4DCCB]/60" aria-busy="true" />}
    {q.isError && <div role="alert" className="mt-3 grid justify-items-start gap-2"><p className="font-bold">{x('Não conseguimos carregar a projeção.', 'Could not load the projection.', 'No pudimos cargar la proyección.')}</p><button type="button" onClick={() => void q.refetch()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" aria-hidden="true" />{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div>}
    {d && <div className="mt-3 grid gap-3">
      <div className="flex flex-wrap items-center gap-2"><Tag warn={d.capital.status !== 'reconciled'}>{f.code(d.capital.status)}</Tag><span className="text-xs text-[#5B6B85]">{x('Posição em', 'As of', 'Al')} {f.date(d.asOf)}</span></div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KV k={x('Caixa', 'Cash', 'Caja')} v={f.units(d.capital.cashUnits)} />
        <KV k={x('Disponível', 'Available', 'Disponible')} v={f.units(d.capital.availableUnits)} />
        <KV k={x('Reservado', 'Reserved', 'Reservado')} v={f.units(d.capital.reservedUnits)} />
        <KV k={x('Comprometido', 'Committed', 'Comprometido')} v={f.units(d.capital.committedUnits)} />
        <KV k={x('Obrigações', 'Obligations', 'Obligaciones')} v={f.units(d.capital.obligationsUnits)} />
        <KV k={x('Realizado', 'Realized', 'Realizado')} v={f.units(d.capital.realizedUnits)} />
        <KV k={x('Distribuível', 'Distributable', 'Distribuible')} v={f.units(d.capital.distributableUnits)} />
      </dl>
      <p className="text-sm"><b>{x('Reconciliação: ', 'Reconciliation: ', 'Conciliación: ')}</b>{f.reason(d.capital.reconciliation)}</p>
      <div><p className="text-sm font-bold">{x('Exposição', 'Exposure', 'Exposición')}</p>
        {d.capital.exposure.length === 0 ? <p className="text-sm text-[#5B6B85]">{x('Sem exposição registrada.', 'No exposure recorded.', 'Sin exposición registrada.')}</p> : <ul className="mt-1 grid gap-1 text-sm">{d.capital.exposure.map((e, i) => <li key={i}>{f.code(e.asset)} · {e.strategyVersion} · {f.units(e.units)}</li>)}</ul>}</div>
    </div>}
  </section>;
}
