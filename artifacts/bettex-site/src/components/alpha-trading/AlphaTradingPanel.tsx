/** @jsxImportSource react */
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { demoPath, type DemoView } from '@/components/demo/demo-navigation';
import { useGetAlphaTrading, getGetAlphaTradingQueryKey, type GetAlphaTradingParams, type AlphaTradingSnapshot } from '@workspace/api-client-react';
import { useFmt, card, KV, Tag } from './format';
import { AlphaTradingCapitalPanel } from './CapitalPanel';
import { OpportunityCard, DecisionCard, OrderCard, PositionCard } from './Records';
import { Journey } from './Journey';
import { AlloraAnalysis } from '@/components/demo/AlloraAnalysis';

export { AlphaTradingCapitalPanel };
type View = NonNullable<GetAlphaTradingParams['view']>;
const VIEWS: View[] = ['opportunities', 'decisions', 'orders', 'positions', 'closed'];
const STATES: Record<View, string[]> = {
  opportunities: ['received', 'validated', 'awaiting_decision', 'selected', 'rejected', 'expired', 'forwarded_to_execution', 'needs_update', 'awaiting_authorization', 'allocation_authorized', 'allocation_uncertain', 'allocation_confirmed'],
  decisions: ['selected', 'rejected', 'hold'],
  orders: ['pending', 'partial', 'filled', 'cancelled', 'expired', 'failed'],
  positions: ['open', 'reducing'],
  closed: ['closed', 'settled'],
};
const sel = 'min-h-11 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm';

export function AlphaTradingPanel() {
  const f = useFmt(); const { x } = f;
  const [view, setView] = useState<View>('opportunities');
  const [asset, setAsset] = useState<GetAlphaTradingParams['asset']>(undefined);
  const [state, setState] = useState('');
  const [cursors, setCursors] = useState<string[]>([]);
  const [jid, setJid] = useState<string | null>(null);
  const cursor = cursors[cursors.length - 1];
  const params: GetAlphaTradingParams = { view, limit: 15, ...(asset ? { asset } : {}), ...(state.trim() ? { state: state.trim() } : {}), ...(cursor ? { cursor } : {}) };
  const q = useGetAlphaTrading(params, { query: { queryKey: getGetAlphaTradingQueryKey(params), refetchInterval: 15000, retry: 1, placeholderData: p => p } });
  const d: AlphaTradingSnapshot | undefined = q.data;
  const links: [DemoView, string][] = [['home', x('Meu painel', 'My dashboard', 'Mi panel')], ['wallet', x('Saldo e histórico', 'Balance and history', 'Saldo e historial')], ['treasury', x('Tesouraria', 'Treasury', 'Tesorería')], ['account', x('Minha conta', 'My account', 'Mi cuenta')]];
  const reset = () => setCursors([]);
  const label: Record<View, string> = { opportunities: x('Oportunidades', 'Opportunities', 'Oportunidades'), decisions: x('Decisões', 'Decisions', 'Decisiones'), orders: x('Ordens', 'Orders', 'Órdenes'), positions: x('Posições abertas', 'Open positions', 'Posiciones abiertas'), closed: x('Encerradas', 'Closed', 'Cerradas') };
  const items = d ? (view === 'opportunities' ? d.opportunities : view === 'decisions' ? d.decisions : view === 'orders' ? d.orders : d.positions) : [];
  return <main className="demo-root min-h-[calc(100dvh-var(--site-header-h))] pb-10" data-testid="alpha-trading">
    <div className="bg-[#1B2A41] py-1 text-center text-[11px] font-semibold tracking-wide text-[#F5F1E8]">{x('desenvolvimento · simulação sem dinheiro real', 'development · simulation, no real money', 'desarrollo · simulación sin dinero real')}</div>
    <div className="mx-auto grid max-w-5xl gap-4 px-3 pt-5 sm:px-5">
      <nav aria-label={x('Áreas do app', 'App areas', 'Áreas de la app')} className="flex flex-wrap gap-2">{links.map(([k, l]) => <Link key={k} href={demoPath(k, f.loc)} data-testid={`nav-${k}`} className="inline-flex min-h-11 items-center rounded-full border border-[#E4DCCB] px-4 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5]">{l}</Link>)}</nav>
      <div><h1 className="display text-2xl font-extrabold">{x('Central da IA', 'AI Center', 'Central de IA')}</h1>
        <p className="mt-1 text-sm text-[#5B6B85]">{x('Como a IA considera eventos de previsão, com evidências. Resultados simulados, nunca lucro distribuível.', 'How the AI considers prediction events, with evidence. Simulated results, never distributable profit.', 'Cómo la IA considera eventos de predicción, con evidencias. Resultados simulados, nunca ganancia distribuible.')}</p></div>
      {q.isLoading && !d && <div className="grid gap-3" aria-busy="true">{[0, 1, 2].map(i => <div key={i} className="dcard h-28 animate-pulse" />)}</div>}
      {q.isError && <div role="alert" className="dcard grid justify-items-start gap-3 p-6"><p className="font-bold">{x('Não conseguimos carregar os dados reais.', 'We could not load the real data.', 'No pudimos cargar los datos reales.')}</p><button type="button" data-testid="button-retry" onClick={() => void q.refetch()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" aria-hidden="true" />{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div>}
      <AlloraAnalysis />
      {d && <>
        <section className={card}>
          <h2 className="font-bold">{x('Políticas efetivas por especialista', 'Effective policies by specialist', 'Políticas efectivas por especialista')}</h2>
          <ul className="mt-2 grid gap-2">{d.effectivePolicies?.map(p=><li key={p.asset} className="rounded-xl border border-[#E4DCCB] p-3 text-sm">
            <b>{p.asset.toUpperCase()}</b> · <Tag warn={p.status!=='active'}>{f.code(p.status)}</Tag>
            <p>{f.reason(p.reason)}</p>
            {p.reference&&<p className="break-all font-mono text-xs">{String(p.reference.effectiveId ?? '')}</p>}
          </li>)}</ul>
          {!d.policy.published&&<p className="mt-2 text-xs text-[#5B6B85]">{x('Os limites abaixo são um rascunho informativo; não autorizam alocação.', 'The limits below are an informative draft; they do not authorize allocation.', 'Los límites siguientes son un borrador informativo; no autorizan asignación.')}</p>}
        </section>
        <section className={card}>
          <div className="flex flex-wrap items-center gap-2"><Tag>{f.code(d.policy.mode)}</Tag><span className="text-xs text-[#5B6B85]">{x('Posição em', 'As of', 'Al')} {f.date(d.asOf)}</span></div>
          <h2 className="display mt-2 text-lg font-extrabold">{x('Política de negociação simulada', 'Simulated trading policy', 'Política de negociación simulada')}</h2>
          <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <KV k={x('Versão', 'Version', 'Versión')} v={`${d.policy.version} / ${d.policy.strategyVersion}`} />
            <KV k={x('Máx. por ordem', 'Max per order', 'Máx. por orden')} v={f.units(d.policy.maxOrderUnits)} />
            <KV k={x('Máx. correlacionado', 'Max correlated', 'Máx. correlacionado')} v={f.units(d.policy.maxCorrelatedUnits)} />
            <KV k={x('Máx. portfólio', 'Max portfolio', 'Máx. portafolio')} v={f.units(d.policy.maxPortfolioUnits)} />
            <KV k={x('Defensivo', 'Defensive', 'Defensivo')} v={f.units(d.policy.defensiveUnits)} />
            <KV k={x('Idade máx. da cotação', 'Max quote age', 'Edad máx. de cotización')} v={`${d.policy.maxQuoteAgeSeconds} s`} />
          </dl>
          <ul className="mt-2 list-disc pl-5 text-sm"><li>{x('Somente simulação: nenhuma ordem usa dinheiro real.', 'Simulation only: no order uses real money.', 'Solo simulación: ninguna orden usa dinero real.')}</li><li>{x('Limites por ordem, por grupo correlacionado e por carteira, conforme acima.', 'Limits per order, per correlated group and per portfolio, as above.', 'Límites por orden, por grupo correlacionado y por cartera, como arriba.')}</li><li>{x('Cotações mais antigas que o limite de idade não são usadas.', 'Quotes older than the age limit are not used.', 'Las cotizaciones más antiguas que el límite de edad no se usan.')}</li></ul>
        </section>
        <section className={card}><h2 className="display text-lg font-extrabold">{x('Especialistas e fontes', 'Specialists and sources', 'Especialistas y fuentes')}</h2>
          {d.specialists.length === 0 ? <p className="mt-2 text-sm text-[#5B6B85]">{x('Nenhum especialista informado.', 'No specialists reported.', 'Ningún especialista informado.')}</p> :
            <ul className="mt-2 grid gap-2 sm:grid-cols-3">{d.specialists.map(s => <li key={s.asset} className="rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3"><p className="font-bold">{f.code(s.asset)}</p><div className="mt-1 flex flex-wrap gap-1"><Tag warn={s.sourceStatus !== 'observed'}>{f.code(s.sourceStatus)}</Tag><Tag warn={s.proposalStatus === 'blocked'}>{f.code(s.proposalStatus)}</Tag></div><p className="mt-1 text-sm">{f.reason(s.reason)}</p><p className="mt-1 text-xs text-[#5B6B85]">{x('Tentativa', 'Attempt', 'Intento')} {f.date(s.attemptedAt)} · {s.observationCount} {x('observações', 'observations', 'observaciones')}</p>{s.sources.map((u, i) => <p key={i} className="break-all text-xs text-[#5B6B85]">{u}</p>)}</li>)}</ul>}
        </section>
        <AlphaTradingCapitalPanel />
        <section className={card}>
          <div className="flex flex-wrap gap-2" role="tablist">{VIEWS.map(v => <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => { setView(v); setState(''); reset(); }} className={`min-h-11 rounded-full px-4 text-sm font-bold ${view === v ? 'bg-[#0E7C6B] text-white' : 'border border-[#E4DCCB]'}`}>{label[v]}</button>)}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <select aria-label={x('Ativo', 'Asset', 'Activo')} className={sel} value={asset ?? ''} onChange={e => { setAsset((e.target.value || undefined) as GetAlphaTradingParams['asset']); reset(); }}><option value="">{x('Todos os ativos', 'All assets', 'Todos los activos')}</option>{(['btc', 'eth', 'sol'] as const).map(a => <option key={a} value={a}>{f.code(a)}</option>)}</select>
            <select aria-label={x('Estado', 'State', 'Estado')} className={sel} value={state} onChange={e => { setState(e.target.value); reset(); }}><option value="">{x('Todos os estados', 'All states', 'Todos los estados')}</option>{STATES[view].map(s => <option key={s} value={s}>{s === 'awaiting_decision' && view === 'opportunities' ? x('Qualificada (aguardando decisão)', 'Qualified (awaiting decision)', 'Calificada (esperando decisión)') : f.code(s)}</option>)}</select>
          </div>
          <p className="mt-2 text-xs text-[#5B6B85]">{d.page.total} {x('registros', 'records', 'registros')} · {label[view]}</p>
          {items.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-[#E4DCCB] p-6 text-center text-sm text-[#5B6B85]">{x('Nenhum registro real para estes filtros.', 'No real records for these filters.', 'Ningún registro real para estos filtros.')}</p> :
            <ul className="mt-3 grid gap-3">
              {view === 'opportunities' && d.opportunities.map(r => <OpportunityCard key={r.opportunity.id} r={r} onJourney={setJid} />)}
              {view === 'decisions' && d.decisions.map(r => <DecisionCard key={r.id} d={r} onJourney={setJid} />)}
              {view === 'orders' && d.orders.map(r => <OrderCard key={r.id} o={r} onJourney={setJid} />)}
              {(view === 'positions' || view === 'closed') && d.positions.map(r => <PositionCard key={r.id} p={r} onJourney={setJid} />)}
            </ul>}
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={cursors.length === 0} onClick={() => setCursors(c => c.slice(0, -1))} className="min-h-11 rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold disabled:opacity-40">{x('Anterior', 'Previous', 'Anterior')}</button>
            <button type="button" disabled={!d.page.hasMore || !d.page.nextCursor} onClick={() => d.page.nextCursor && setCursors(c => [...c, d.page.nextCursor as string])} className="min-h-11 rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold disabled:opacity-40">{x('Próxima', 'Next', 'Siguiente')}</button>
          </div>
        </section>
        {jid && <Journey key={jid} id={jid} onClose={() => setJid(null)} />}
      </>}
    </div>
  </main>;
}
export default AlphaTradingPanel;
