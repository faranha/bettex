/** @jsxImportSource react */
import { useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { demoPath } from '../demo/demo-navigation';
import { Radar, CircleDollarSign, X as XIcon } from 'lucide-react';
import { useFmt, card, KV, Tag, dec6 } from '../alpha-trading/format';
import { REQUESTS, DECISIONS, ORDERS, POSITIONS, STATE, STATES_BY_VIEW, type Asset, type T3, type Request, type Decision, type Order, type Position } from './central-data';
import { useL } from './CentralAgents';

const box = 'rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3';
const sel = 'min-h-11 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm';
const link = 'mt-2 min-h-11 rounded-xl border border-[#0E7C6B] px-3 text-sm font-bold text-[#0A6657]';
const PER = 3;
type V = 'opportunities' | 'decisions' | 'orders' | 'positions' | 'closed';

function useBits() {
  const f = useFmt(); const L = useL(); const { x, loc } = f; const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const st = (s: string) => L(STATE[s]) || s; const u = (v: string) => `${dec6(v, lc)} USDC`;
  return { f, L, x, st, u, lc };
}

function RequestCard({ r, onJourney }: { r: Request; onJourney: (id: string) => void }) {
  const { f, L, x, st, u } = useBits();
  return <li className={box} data-testid={`request-${r.id}`}>
    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#0A6657]"><Radar className="h-4 w-4" aria-hidden="true" />{x('Cripto', 'Crypto', 'Cripto')} → {r.asset.toUpperCase()}</p>
    <p className="break-all font-mono text-[11px] text-[#5B6B85]">{x('Pedido', 'Request', 'Pedido')}: {r.id}</p>
    <div className="flex flex-wrap items-center gap-2"><Tag warn={r.state === 'rejected' || r.state === 'expired'}>{st(r.state)}</Tag></div>
    <p className="mt-2 break-words font-bold">{L(r.market)}</p><p className="text-xs text-[#5B6B85]">{L(r.outcome)} · {x('especialista', 'specialist', 'especialista')} {r.asset.toUpperCase()}</p>
    <p className="mt-1 text-sm">{L(r.reason)}</p>
    <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <KV k={x('Operação', 'Operation', 'Operación')} v={L(r.operation)} /><KV k={x('Preço executável', 'Executable price', 'Precio ejecutable')} v={r.price} />
      <KV k={x('Custos', 'Costs', 'Costos')} v={u(r.costs)} /><KV k={x('Liquidez', 'Liquidity', 'Liquidez')} v={u(r.liquidity)} />
      <KV k={x('Retorno estimado', 'Estimated return', 'Retorno estimado')} v={u(r.ret)} /><KV k={x('Incerteza', 'Uncertainty', 'Incertidumbre')} v={L(r.uncertainty)} />
      <KV k={x('Perda potencial', 'Potential loss', 'Pérdida potencial')} v={u(r.loss)} /><KV k={x('Capital', 'Capital', 'Capital')} v={u(r.capital)} /><KV k={x('Válida até', 'Valid until', 'Válida hasta')} v={f.date(r.validUntil)} /></dl>
    <p className="mt-2 text-xs"><b>{x('Riscos: ', 'Risks: ', 'Riesgos: ')}</b>{r.risks.map(L).join('; ')}</p>
    <p className="mt-1 text-xs"><b>{x('Invalidação: ', 'Invalidation: ', 'Invalidación: ')}</b>{r.invalidation.map(L).join('; ')}</p>
    <ul className="mt-2 grid gap-1 text-xs text-[#5B6B85]" data-testid={`sources-${r.id}`}>{r.sources.map(s => <li key={s.ref} className="flex flex-wrap items-center gap-1.5">{s.kind === 'allora' ? <CircleDollarSign className="h-3.5 w-3.5 text-[#0A6657]" aria-hidden="true" /> : <Radar className="h-3.5 w-3.5 text-[#0A6657]" aria-hidden="true" />}<b className="text-[#1B2A41]">{s.name}</b> · <span className="mono break-all">{s.ref}</span> · {f.date(s.at)} · {L(s.evidence)}</li>)}</ul>
    <p className="mt-1 break-all font-mono text-[11px] text-[#5B6B85]">{x('Política', 'Policy', 'Política')}: demo-policy-v1 / demo-strategy-v1</p>
    <button type="button" onClick={() => onJourney(r.id)} data-testid={`button-journey-${r.id}`} className={link}>{x('Ver percurso completo', 'View full journey', 'Ver recorrido completo')}</button></li>;
}
function DecisionCard({ d, onJourney }: { d: Decision; onJourney: (id: string) => void }) {
  const { f, L, x, st, u } = useBits();
  return <li className={box} data-testid={`decision-${d.id}`}>
    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#0A6657]"><Radar className="h-4 w-4" aria-hidden="true" />{x('Cripto', 'Crypto', 'Cripto')} → {d.asset.toUpperCase()}</p>
    <p className="mb-2 break-all font-mono text-[11px] text-[#5B6B85]">{x('Pedido', 'Request', 'Pedido')}: {d.requestId} · {x('Decisão', 'Decision', 'Decisión')}: {d.id}</p>
    <div className="flex flex-wrap items-center gap-2"><Tag warn={d.state === 'rejected'}>{st(d.state)}</Tag><span className="text-xs">{d.asset.toUpperCase()} · #{d.rank}</span></div>
    <p className="mt-1 text-sm">{L(d.reason)}</p>
    <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3"><KV k={x('Solicitado', 'Requested', 'Solicitado')} v={u(d.requested)} /><KV k={x('Quando', 'When', 'Cuándo')} v={f.date(d.at)} /><KV k={x('Política', 'Policy', 'Política')} v="demo-policy-v1 / demo-strategy-v1" /></dl>
    <button type="button" onClick={() => onJourney(d.requestId)} className={link}>{x('Ver percurso', 'View journey', 'Ver recorrido')}</button></li>;
}
export function OrderCard({ o, onJourney }: { o: Order; onJourney?: (id: string) => void }) {
  const { f, L, x, st, u, lc } = useBits(); const sh = (v: string) => `${dec6(v, lc)} ${x('cotas', 'shares', 'cuotas')}`;
  return <li className={box} data-testid={`order-${o.id}`}><div className="flex flex-wrap items-center gap-2"><Tag>{st(o.state)}</Tag><Tag>{st(o.direction)}</Tag><span className="text-xs">{o.asset.toUpperCase()} · {L(o.outcome)}</span></div>
    <p className="mt-1 break-all font-mono text-[11px] text-[#5B6B85]">{o.id}</p><p className="mt-1 text-sm">{L(o.reason)}</p>
    <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"><KV k={x('Quantidade', 'Quantity', 'Cantidad')} v={sh(o.qty)} /><KV k={x('Executado', 'Filled', 'Ejecutado')} v={sh(o.filled)} /><KV k={x('Reservado', 'Reserved', 'Reservado')} v={u(o.reserved)} /><KV k={x('Atualizada', 'Updated', 'Actualizada')} v={f.date(o.updatedAt)} /></dl>
    {o.fills.length === 0 ? <p className="mt-1 text-xs text-[#5B6B85]">{x('Sem execuções registradas.', 'No fills recorded.', 'Sin ejecuciones registradas.')}</p> : <ul className="mt-1 grid gap-1 text-xs">{o.fills.map(fl => <li key={fl.id}>{f.date(fl.at)} · {sh(fl.shares)} @ {fl.price} · {x('caixa', 'cash', 'caja')} {u(fl.cash)} · {fl.source}</li>)}</ul>}
    {onJourney && <button type="button" onClick={() => onJourney(o.requestId)} className={link}>{x('Ver percurso', 'View journey', 'Ver recorrido')}</button>}</li>;
}
export function PositionCard({ p, onJourney }: { p: Position; onJourney?: (id: string) => void; onAction: () => void }) {
  const { f, L, x, st, u, lc } = useBits();
  return <li className={box} data-testid={`position-${p.id}`}><div className="flex flex-wrap items-center gap-2"><Tag>{st(p.state)}</Tag><Tag>{st(p.exitState)}</Tag><Tag>{st(p.resolution)}</Tag>{p.stale && <Tag warn>{x('Defasada', 'Stale', 'Desactualizada')}</Tag>}</div>
    <p className="mt-2 font-bold">{L(p.event)}</p><p className="text-xs text-[#5B6B85]">{p.asset.toUpperCase()} · {L(p.outcome)} · <span className="mono">{p.id}</span></p>
    <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3"><KV k={x('Quantidade', 'Quantity', 'Cantidad')} v={`${dec6(p.qty, lc)} ${x('cotas', 'shares', 'cuotas')}`} /><KV k={x('Custo de entrada', 'Entry cost', 'Costo de entrada')} v={u(p.cost)} />
      <KV k={x('Valor de saída', 'Exit value', 'Valor de salida')} v={p.exitValue ? u(p.exitValue) : x('indisponível (sem liquidez)', 'unavailable (no liquidity)', 'no disponible (sin liquidez)')} /><KV k={x('Avaliada em', 'Valued at', 'Valuada en')} v={f.date(p.at)} /></dl>
    <div className="flex flex-wrap gap-2">{onJourney && <button type="button" onClick={() => onJourney(p.requestId)} className={link}>{x('Ver percurso', 'View journey', 'Ver recorrido')}</button>}
    </div></li>;
}

export function Journey({ id, onClose }: { id: string; onClose: () => void }) {
  const { f, L, x, st } = useBits(); const r = REQUESTS.find(q => q.id === id); if (!r) return null;
  return <section className={card} data-testid="alpha-journey" aria-label={x('Percurso completo', 'Full journey', 'Recorrido completo')}>
    <Link data-demo-local data-testid="link-journey-history" className="inline-flex min-h-11 items-center rounded-xl border border-[#0E7C6B] px-3 text-sm font-bold text-[#0A6657]" href={`${demoPath('wallet', f.loc)}?history=audit&correlationId=${encodeURIComponent(id)}`}>{x('Consultar este percurso no Histórico', 'View this journey in History', 'Consultar este recorrido en el Historial')}</Link>
    <div className="flex items-center justify-between gap-2"><h3 className="display text-lg font-extrabold">{x('Percurso completo', 'Full journey', 'Recorrido completo')}</h3><button type="button" aria-label={x('Fechar', 'Close', 'Cerrar')} data-testid="button-journey-close" onClick={onClose} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-[#E9EEE5]"><XIcon className="h-5 w-5" aria-hidden="true" /></button></div>
    <div className="mt-3 grid gap-3"><p className="text-sm font-bold">{L(r.market)} <Tag>{st(r.state)}</Tag></p>
      <div><p className="text-sm font-bold">{x('Linha do tempo', 'Timeline', 'Línea de tiempo')}</p><ol className="mt-1 grid gap-1 text-sm">{r.events.map((e, i) => <li key={i}><span className="font-mono text-xs">#{i + 1} {f.date(e.at)}</span> · <b>{L(e.stage)}</b> · {L(e.reason)}</li>)}</ol></div>
      {DECISIONS.filter(d => d.requestId === id).length > 0 && <div><p className="text-sm font-bold">{x('Decisões', 'Decisions', 'Decisiones')}</p><ul className="mt-1 grid gap-1 text-sm">{DECISIONS.filter(d => d.requestId === id).map(d => <li key={d.id}>{f.date(d.at)} · <b>{st(d.state)}</b> · {L(d.reason)}</li>)}</ul></div>}
      {ORDERS.filter(o => o.requestId === id).length > 0 && <div><p className="text-sm font-bold">{x('Ordens', 'Orders', 'Órdenes')}</p><ul className="mt-1 grid gap-2">{ORDERS.filter(o => o.requestId === id).map(o => <OrderCard key={o.id} o={o} />)}</ul></div>}
      {POSITIONS.filter(p => p.requestId === id).length > 0 && <div><p className="text-sm font-bold">{x('Posições', 'Positions', 'Posiciones')}</p><ul className="mt-1 grid gap-2">{POSITIONS.filter(p => p.requestId === id).map(p => <PositionCard key={p.id} p={p} onAction={() => undefined} />)}</ul></div>}</div></section>;
}

export function RecordsSection({ views, title, intro, onJourney, onAction, initialAsset }: { views: V[]; title: string; intro: string; initialAsset?: Asset; onJourney: (id: string) => void; onAction: () => void }) {
  const { x, L, st } = useBits();
  const [view, setView] = useState<V>(views[0]); const [asset, setAsset] = useState<'' | Asset>(initialAsset ?? ''); const [state, setState] = useState(''); const [page, setPage] = useState(0);
  const label: Record<V, string> = { opportunities: x('Pedidos recebidos e comparações', 'Received requests and comparisons', 'Pedidos recibidos y comparaciones'), decisions: x('Decisões da BETTEX', 'BETTEX decisions', 'Decisiones de BETTEX'), orders: x('Ordens', 'Orders', 'Órdenes'), positions: x('Posições abertas', 'Open positions', 'Posiciones abiertas'), closed: x('Encerradas', 'Closed', 'Cerradas') };
  const okA = (a: Asset) => !asset || a === asset; const okS = (s: string) => !state || s === state;
  const items: { key: string; node: ReactNode }[] =
    view === 'opportunities' ? REQUESTS.filter(r => okA(r.asset) && okS(r.state)).map(r => ({ key: r.id, node: <RequestCard key={r.id} r={r} onJourney={onJourney} /> }))
    : view === 'decisions' ? DECISIONS.filter(d => okA(d.asset) && okS(d.state)).map(d => ({ key: d.id, node: <DecisionCard key={d.id} d={d} onJourney={onJourney} /> }))
    : view === 'orders' ? ORDERS.filter(o => okA(o.asset) && okS(o.state)).map(o => ({ key: o.id, node: <OrderCard key={o.id} o={o} onJourney={onJourney} /> }))
    : POSITIONS.filter(p => (view === 'closed' ? ['closed', 'settled'].includes(p.state) : ['open', 'reducing'].includes(p.state)) && okA(p.asset) && okS(p.state)).map(p => ({ key: p.id, node: <PositionCard key={p.id} p={p} onJourney={onJourney} onAction={onAction} /> }));
  const shown = items.slice(page * PER, page * PER + PER); const reset = () => setPage(0);
  return <div className="grid gap-2"><h3 className="display text-base font-extrabold">{title}</h3><p className="text-xs text-[#5B6B85]">{intro}</p>
    <section className={card} data-testid={`records-${views[0]}`}>
      <div className="flex flex-wrap gap-2" role="tablist">{views.map(v => <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => { setView(v); setState(''); reset(); }} className={`min-h-11 rounded-full px-4 text-sm font-bold ${view === v ? 'bg-[#0E7C6B] text-white' : 'border border-[#E4DCCB]'}`}>{label[v]}</button>)}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <select aria-label={x('Ativo', 'Asset', 'Activo')} data-testid={`select-asset-${views[0]}`} className={sel} value={asset} onChange={e => { setAsset(e.target.value as '' | Asset); reset(); }}><option value="">{x('Todos os ativos', 'All assets', 'Todos los activos')}</option>{(['btc', 'eth', 'sol'] as const).map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}</select>
        <select aria-label={x('Estado', 'State', 'Estado')} data-testid={`select-state-${views[0]}`} className={sel} value={state} onChange={e => { setState(e.target.value); reset(); }}><option value="">{x('Todos os estados', 'All states', 'Todos los estados')}</option>{STATES_BY_VIEW[view].map(s => <option key={s} value={s}>{st(s)}</option>)}</select></div>
      <p className="mt-2 text-xs text-[#5B6B85]">{items.length} {x('registros', 'records', 'registros')} · {label[view]}</p>
      {shown.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-[#E4DCCB] p-6 text-center text-sm text-[#5B6B85]">{x('Nenhum registro para estes filtros.', 'No records for these filters.', 'Ningún registro para estos filtros.')}</p> : <ul className="mt-3 grid gap-3">{shown.map(i => i.node)}</ul>}
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="min-h-11 rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold disabled:opacity-40">{x('Anterior', 'Previous', 'Anterior')}</button>
        <button type="button" disabled={(page + 1) * PER >= items.length} onClick={() => setPage(p => p + 1)} className="min-h-11 rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold disabled:opacity-40">{x('Próxima', 'Next', 'Siguiente')}</button></div>
    </section></div>;
}
