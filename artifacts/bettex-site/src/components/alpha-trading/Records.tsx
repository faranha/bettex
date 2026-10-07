/** @jsxImportSource react */
import type { AlphaOpportunityRecord, AlphaTradingDecision, AlphaTradingOrder, AlphaTradingPosition } from '@workspace/api-client-react';
import { useFmt, KV, Tag } from './format';
import {PolicyEvidence} from './PolicyEvidence';
import { Radar } from 'lucide-react';

const box = 'rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3';

export function OpportunityCard({ r, onJourney }: { r: AlphaOpportunityRecord; onJourney: (id: string) => void }) {
  const f = useFmt(); const { x } = f; const o = r.opportunity;
  return <li className={box}>
    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#0A6657]"><Radar className="h-4 w-4" aria-hidden="true" />{x('Cripto', 'Crypto', 'Cripto')} → {o.specialist.toUpperCase()}</p>
    <p className="break-all font-mono text-[11px] text-[#5B6B85]">{x('Pedido', 'Request', 'Pedido')}: {o.id}</p>
    <div className="flex flex-wrap items-center gap-2"><Tag>{f.code(r.state)}</Tag>{r.queueState && <Tag>{f.code(r.queueState)}</Tag>}<Tag warn={o.origin.nature !== 'real_market_data'}>{f.code(o.origin.nature)}</Tag></div>
    <p className="mt-2 break-words font-bold">{o.market}</p>
    <p className="text-xs text-[#5B6B85]">{o.instrument.name} · {o.instrument.outcome} · {o.specialist}</p>
    <p className="mt-1 text-sm">{f.reason(r.reason)}</p>
    <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <KV k={x('Operação', 'Operation', 'Operación')} v={f.datum(o.operation)} />
      <KV k={x('Preço executável', 'Executable price', 'Precio ejecutable')} v={f.datum(o.executablePrice)} />
      <KV k={x('Custos', 'Costs', 'Costos')} v={f.datum(o.costs)} />
      <KV k={x('Liquidez', 'Liquidity', 'Liquidez')} v={f.datum(o.liquidity)} />
      <KV k={x('Retorno estimado', 'Estimated return', 'Retorno estimado')} v={f.datum(o.estimatedReturn)} />
      <KV k={x('Incerteza', 'Uncertainty', 'Incertidumbre')} v={f.datum(o.uncertainty)} />
      <KV k={x('Perda potencial', 'Potential loss', 'Pérdida potencial')} v={f.datum(o.potentialLossUnits)} />
      <KV k={x('Capital', 'Capital', 'Capital')} v={f.datum(o.capitalUnits)} />
      <KV k={x('Válida até', 'Valid until', 'Válida hasta')} v={f.date(o.validUntil)} />
    </dl>
    {o.risks.length > 0 && <p className="mt-2 text-xs"><b>{x('Riscos: ', 'Risks: ', 'Riesgos: ')}</b>{o.risks.join('; ')}</p>}
    {o.invalidationConditions.length > 0 && <p className="mt-1 text-xs"><b>{x('Invalidação: ', 'Invalidation: ', 'Invalidación: ')}</b>{o.invalidationConditions.join('; ')}</p>}
    {o.sources.length > 0 && <ul className="mt-1 text-xs text-[#5B6B85]">{o.sources.map((s, i) => <li key={i} className="break-all">{s.url} · {f.date(s.collectedAt)} · {s.evidence}</li>)}</ul>}
    <PolicyEvidence reference={o.policyReference}/>
    <button type="button" onClick={() => onJourney(o.id)} className="mt-2 min-h-11 rounded-xl border border-[#0E7C6B] px-3 text-sm font-bold text-[#0A6657]">{x('Ver percurso completo', 'View full journey', 'Ver recorrido completo')}</button>
  </li>;
}

export function DecisionCard({ d, onJourney }: { d: AlphaTradingDecision; onJourney: (id: string) => void }) {
  const f = useFmt(); const { x } = f;
  return <li className={box}>
    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#0A6657]"><Radar className="h-4 w-4" aria-hidden="true" />{x('Cripto', 'Crypto', 'Cripto')} → {d.asset.toUpperCase()}</p>
    <p className="mb-2 break-all font-mono text-[11px] text-[#5B6B85]">{x('Pedido', 'Request', 'Pedido')}: {d.opportunityId} · {x('Decisão', 'Decision', 'Decisión')}: {d.id}</p>
    <div className="flex flex-wrap items-center gap-2"><Tag warn={d.state === 'rejected'}>{f.code(d.state)}</Tag><span className="text-xs">{f.code(d.asset)} · #{d.rank}</span></div>
    <p className="mt-1 text-sm">{f.reason(d.reason)}</p>
    <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3"><KV k={x('Solicitado', 'Requested', 'Solicitado')} v={f.units(d.requestedUnits)} /><KV k={x('Quando', 'When', 'Cuándo')} v={f.date(d.at)} /><KV k={x('Política', 'Policy', 'Política')} v={`${d.policyVersion} / ${d.strategyVersion}`} /></dl>
    <PolicyEvidence reference={d.policyReference}/>
    <button type="button" onClick={() => onJourney(d.opportunityId)} className="mt-2 min-h-11 rounded-xl border border-[#0E7C6B] px-3 text-sm font-bold text-[#0A6657]">{x('Ver percurso', 'View journey', 'Ver recorrido')}</button></li>;
}

export function OrderCard({ o, onJourney }: { o: AlphaTradingOrder; onJourney?: (id: string) => void }) {
  const f = useFmt(); const { x } = f;
  return <li className={box}><div className="flex flex-wrap items-center gap-2"><Tag>{f.code(o.state)}</Tag><Tag>{f.code(o.direction)}</Tag><span className="text-xs">{f.code(o.asset)} · {o.outcome}</span></div>
    <p className="mt-1 text-sm">{f.reason(o.reason)}</p>
    <PolicyEvidence reference={o.policyReference}/>
    <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"><KV k={x('Quantidade', 'Quantity', 'Cantidad')} v={f.shares(o.quantityUnits)} /><KV k={x('Executado', 'Filled', 'Ejecutado')} v={f.shares(o.filledUnits)} /><KV k={x('Reservado', 'Reserved', 'Reservado')} v={f.units(o.reservedUnits)} /><KV k={x('Atualizada', 'Updated', 'Actualizada')} v={f.date(o.updatedAt)} /></dl>
    {o.fills.length === 0 ? <p className="mt-1 text-xs text-[#5B6B85]">{x('Sem execuções registradas.', 'No fills recorded.', 'Sin ejecuciones registradas.')}</p> : <ul className="mt-1 grid gap-1 text-xs">{o.fills.map(fl => <li key={fl.id}>{f.date(fl.at)} · {f.shares(fl.sharesUnits)} @ {fl.price} · {x('caixa', 'cash', 'caja')} {f.units(fl.cashUnits)} · {x('taxas', 'fees', 'tarifas')} {f.units(fl.feesUnits)} · {fl.source}</li>)}</ul>}
    {onJourney && <button type="button" onClick={() => onJourney(o.opportunityId)} className="mt-2 min-h-11 rounded-xl border border-[#0E7C6B] px-3 text-sm font-bold text-[#0A6657]">{x('Ver percurso', 'View journey', 'Ver recorrido')}</button>}</li>;
}

export function PositionCard({ p, onJourney }: { p: AlphaTradingPosition; onJourney?: (id: string) => void }) {
  const f = useFmt(); const { x } = f;
  const v = p.valuations.length ? p.valuations.reduce((a, b) => (new Date(b.at) > new Date(a.at) ? b : a)) : null;
  const noLiq = p.exitState === 'blocked_liquidity' || (v && (v.exitValueUnits === null || v.kind === 'unavailable'));
  return <li className={box}>
    <PolicyEvidence reference={p.policyReference}/>
    <div className="flex flex-wrap items-center gap-2"><Tag>{f.code(p.state)}</Tag><Tag>{f.code(p.exitState)}</Tag><Tag>{f.code(p.resolutionState)}</Tag>{v?.stale && <Tag warn>{x('Defasada', 'Stale', 'Desactualizada')}</Tag>}</div>
    <p className="mt-2 font-bold">{p.event}</p><p className="text-xs text-[#5B6B85]">{f.code(p.asset)} · {p.outcome}</p>
    <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <KV k={x('Quantidade', 'Quantity', 'Cantidad')} v={f.shares(p.quantityUnits)} />
      <KV k={x('Custo de entrada', 'Entry cost', 'Costo de entrada')} v={f.units(p.entryCostUnits)} />
      <KV k={x('Taxas de entrada', 'Entry fees', 'Tarifas de entrada')} v={f.units(p.entryFeesUnits)} />
      <KV k={x('Esperado original (imutável)', 'Original expected (immutable)', 'Esperado original (inmutable)')} v={f.units(p.originalExpectedUnits)} />
      <KV k={x('Esperado atualizado', 'Updated expected', 'Esperado actualizado')} v={f.units(v ? v.updatedExpectedUnits : null)} />
      <KV k={x('Não realizado', 'Unrealized', 'No realizado')} v={f.units(v ? v.unrealizedUnits : null)} />
      <KV k={x('Realizado', 'Realized', 'Realizado')} v={f.units(p.realizedUnits)} />
      <KV k={x('Valor de saída', 'Exit value', 'Valor de salida')} v={noLiq ? x('sem valor de saída confiável (sem liquidez)', 'no reliable exit value (no liquidity)', 'sin valor de salida confiable (sin liquidez)') : f.units(v?.exitValueUnits)} />
      <KV k={x('Aberta em', 'Opened', 'Abierta')} v={f.date(p.openedAt)} />
      {p.closedAt && <KV k={x('Encerrada em', 'Closed', 'Cerrada')} v={f.date(p.closedAt)} />}
    </dl>
    <p className="mt-2 text-xs"><b>{x('Plano de saída: ', 'Exit plan: ', 'Plan de salida: ')}</b>{p.exitPlan}</p>
    {v ? <p className="mt-1 text-xs text-[#5B6B85]">{x('Avaliação em', 'Valuation as of', 'Valoración al')} {f.date(v.at)} · {f.code(v.kind)} · {f.code(v.action)} · {x('Preço por cota', 'Price per share', 'Precio por cuota')}: {v.priceUnits === null ? x('indisponível', 'unavailable', 'no disponible') : f.units(v.priceUnits)} · {x('Fonte em', 'Source as of', 'Fuente en')} {f.date(v.producedAt)} · {v.source} · {x('liquidável', 'liquidatable', 'liquidable')} {f.shares(v.liquidatableUnits)}/{f.shares(v.quantityUnits)} · {f.reason(v.reason)}</p> : <p className="mt-1 text-xs text-[#5B6B85]">{x('Sem avaliação registrada.', 'No valuation recorded.', 'Sin valoración registrada.')}</p>}
    {onJourney && <button type="button" onClick={() => onJourney(p.opportunityId)} className="mt-2 min-h-11 rounded-xl border border-[#0E7C6B] px-3 text-sm font-bold text-[#0A6657]">{x('Ver percurso', 'View journey', 'Ver recorrido')}</button>}
  </li>;
}
