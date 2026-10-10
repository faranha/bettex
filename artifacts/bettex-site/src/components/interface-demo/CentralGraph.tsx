/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { Bot, CircleDollarSign, Coins, GitCompareArrows, Landmark, Radar, Scale, ScrollText, ShieldAlert, Sparkles, Waypoints, Workflow, type LucideIcon } from 'lucide-react';
import { useFmt, Tag, KV, dec6 } from '../alpha-trading/format';
import { AGENT, RULE, FINDING } from '../agent-operations/copy';
import { AGENTS, REASONING, REASONING_PROVENANCE, SAMPLE_PROVENANCE, REQUESTS, DECISIONS, ORDERS, POSITIONS, CAPITAL, POLICY, FORECASTS, STATE, type Asset } from './central-data';
import { useL } from './CentralAgents';
import { OrderCard, Journey } from './CentralRecords';
import './central-graph.css';

const ICON: Record<string, LucideIcon> = { bettex: Workflow, predictions: Radar, btc: CircleDollarSign, eth: Coins, sol: Scale, treasury: Landmark, governance: ScrollText, risk: ShieldAlert, execution: Waypoints, reconciliation: GitCompareArrows };
const CTL = ['governance', 'risk', 'treasury', 'execution', 'reconciliation'];
const SPEC: Asset[] = ['btc', 'eth', 'sol'];
type P = [number, number];
const WIDE: Record<string, P> = { btc: [70, 100], eth: [70, 250], sol: [70, 400], predictions: [280, 250], bettex: [500, 250], governance: [800, 70], risk: [840, 160], treasury: [860, 250], execution: [840, 340], reconciliation: [800, 430], s0: [250, 520], s1: [450, 520], s2: [650, 520] };
const TALL: Record<string, P> = { btc: [60, 50], eth: [180, 50], sol: [300, 50], predictions: [180, 190], bettex: [180, 330], governance: [60, 480], risk: [180, 480], treasury: [300, 480], execution: [110, 590], reconciliation: [250, 590], s0: [60, 730], s1: [180, 730], s2: [300, 730] };
const EDGES: { id: string; a: string; b: string; ctl?: boolean }[] = [
  ...SPEC.map(s => ({ id: `${s}-predictions`, a: s, b: 'predictions' })),
  { id: 'predictions-bettex', a: 'predictions', b: 'bettex' },
  ...CTL.map(c => ({ id: `bettex-${c}`, a: 'bettex', b: c, ctl: true })),
];
const SOON: { id: string; n: [string, string, string] }[] = [
  { id: 's0', n: ['Esportes', 'Sports', 'Deportes'] }, { id: 's1', n: ['Mercados de previsão', 'Prediction Markets', 'Mercados de predicción'] }, { id: 's2', n: ['Cassino', 'Casino', 'Casino'] }];
type Sel = { k: 'node' | 'edge'; id: string };

function route(sel: Sel | null): Set<string> {
  const s = new Set<string>(); if (!sel) return s;
  if (sel.k === 'edge') { s.add(sel.id); if (SPEC.some(a => sel.id.startsWith(a))) s.add('predictions-bettex'); return s; }
  EDGES.forEach(e => { if (e.a === sel.id || e.b === sel.id) s.add(e.id); });
  if (SPEC.includes(sel.id as Asset)) s.add('predictions-bettex');
  if (sel.id === 'predictions') SPEC.forEach(a => s.add(`${a}-predictions`));
  return s;
}

export function CentralGraph({ onAction }: { onAction: () => void }) {
  const f = useFmt(); const { x, loc } = f; const L = useL();
  const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const [sel, setSel] = useState<Sel | null>({ k: 'node', id: 'bettex' });
  const [jid, setJid] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => { const m = window.matchMedia('(max-width: 640px)'); const h = () => setNarrow(m.matches); h(); m.addEventListener('change', h); return () => m.removeEventListener('change', h); }, []);
  const pos = narrow ? TALL : WIDE; const vb = narrow ? '0 0 360 790' : '0 0 920 570';
  const on = route(sel);
  const u = (v: string) => `${dec6(v, lc)} USDC`;
  const st = (s: string) => L(STATE[s]) || s;
  const nm = (id: string) => SPEC.includes(id as Asset) ? id.toUpperCase() : L(AGENT[id]?.name);
  const shortNm = (id: string) => id === 'bettex' ? 'BETTEX' : nm(id);
  const sub = (id: string) => id === 'bettex' ? x('Inteligência central', 'Central intelligence', 'Inteligencia central') : id === 'predictions' ? x('Agente Cripto', 'Crypto agent', 'Agente Cripto') : SPEC.includes(id as Asset) ? x('Especialista', 'Specialist', 'Especialista') : x('Controle', 'Control', 'Control');
  const edgeLabel = (e: typeof EDGES[number]) => `${shortNm(e.a)} → ${shortNm(e.b)}`;
  const pick = (s: Sel) => { setSel(s); setJid(null); };
  const curve = (a: P, b: P) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; const dx = b[0] - a[0], dy = b[1] - a[1]; return `M${a[0]},${a[1]} Q${mx - dy * 0.12},${my + dx * 0.12} ${b[0]},${b[1]}`; };
  const R = (id: string) => id === 'bettex' ? 42 : id === 'predictions' ? 34 : 26;

  const reqMini = (r: typeof REQUESTS[number]) => <li key={r.id} className="rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3 text-sm" data-testid={`graph-request-${r.id}`}>
    <p className="break-all font-mono text-[11px] text-[#5B6B85]">{r.id}</p>
    <div className="mt-1 flex flex-wrap items-center gap-2"><Tag warn={r.state === 'rejected' || r.state === 'expired'}>{st(r.state)}</Tag><Tag warn>{L(STATE.sample)}</Tag></div>
    <p className="mt-1 break-words font-bold">{L(r.market)}</p><p className="text-xs">{L(r.reason)}</p>
    <dl className="mt-2 grid grid-cols-2 gap-2"><KV k={x('Capital', 'Capital', 'Capital')} v={u(r.capital)} /><KV k={x('Perda potencial', 'Potential loss', 'Pérdida potencial')} v={u(r.loss)} /></dl>
    <button type="button" onClick={() => setJid(r.id)} data-testid={`button-graph-journey-${r.id}`} className="mt-2 min-h-11 rounded-xl border border-[#0E7C6B] px-3 text-sm font-bold text-[#0A6657]">{x('Ver percurso completo', 'View full journey', 'Ver recorrido completo')}</button></li>;
  const decMini = (d: typeof DECISIONS[number]) => <li key={d.id} className="rounded-xl border border-[#E4DCCB] p-3 text-sm" data-testid={`graph-decision-${d.id}`}>
    <p className="break-all font-mono text-[11px] text-[#5B6B85]">{d.id} · {d.requestId}</p><div className="mt-1 flex flex-wrap items-center gap-2"><Tag warn={d.state === 'rejected'}>{st(d.state)}</Tag><span className="text-xs">{d.asset.toUpperCase()} · #{d.rank}</span></div><p className="mt-1">{L(d.reason)}</p>
    <button type="button" onClick={() => setJid(d.requestId)} className="mt-2 min-h-11 rounded-xl border border-[#0E7C6B] px-3 text-sm font-bold text-[#0A6657]">{x('Ver percurso', 'View journey', 'Ver recorrido')}</button></li>;
  const list = (t: string, items: React.ReactNode[]) => items.length ? <div className="mt-3"><h4 className="text-sm font-extrabold">{t}</h4><ul className="mt-1 grid gap-2">{items}</ul></div> : null;

  const NodeDetail = ({ id }: { id: string }) => {
    const a = AGENTS.find(q => q.id === id); const ag = AGENT[id]; const r = REASONING[id]; const ctl = CTL.includes(id);
    if (!a || !ag) return null;
    const rec = r?.rec === 'monitor' ? x('Monitorar', 'Monitor', 'Monitorear') : r?.rec === 'abstain' ? x('Abster-se', 'Abstain', 'Abstenerse') : x('Revisar', 'Review', 'Revisar');
    return <div data-testid={`graph-node-detail-${id}`}>
      <div className="flex flex-wrap items-center gap-2"><h3 className="display text-lg font-extrabold">{nm(id)}</h3><Tag warn={ctl}>{ctl ? x('Controle operacional, não é agente', 'Operational control, not an agent', 'Control operativo, no es agente') : x('Agente inteligente', 'Intelligent agent', 'Agente inteligente')}</Tag><Tag warn>{L(STATE.sample)}</Tag></div>
      <p className="mt-2 text-sm">{L(ag.role)}</p>
      <p className="mt-1 break-all font-mono text-[11px] text-[#5B6B85]">{x('Execução de origem', 'Source run', 'Ejecución de origen')}: {a.latest.id}</p>
      {ctl ? <div className="mt-3 rounded-xl border border-[#C9922A]/50 bg-[#FBF0D6] p-3 text-sm" data-testid={`graph-policy-${id}`}>
        <h4 className="font-extrabold">{x('Política de controle (amostra)', 'Control policy (sample)', 'Política de control (muestra)')}</h4>
        <dl className="mt-2 grid grid-cols-2 gap-2">{id === 'risk' && <><KV k={x('Ordem máxima', 'Max order', 'Orden máxima')} v={u(POLICY.maxOrder)} /><KV k={x('Máx. correlacionado', 'Max correlated', 'Máx. correlacionado')} v={u(POLICY.maxCorrelated)} /><KV k={x('Máx. carteira', 'Max portfolio', 'Máx. cartera')} v={u(POLICY.maxPortfolio)} /></>}
          {id === 'treasury' && <><KV k={x('Disponível', 'Available', 'Disponible')} v={u(CAPITAL.available)} /><KV k={x('Reservado', 'Reserved', 'Reservado')} v={u(CAPITAL.reserved)} /><KV k={x('Reserva defensiva', 'Defensive reserve', 'Reserva defensiva')} v={u(POLICY.defensive)} /></>}
          {id === 'governance' && <><KV k={x('Política', 'Policy', 'Política')} v={POLICY.version} /><KV k={x('Estratégia', 'Strategy', 'Estrategia')} v={POLICY.strategy} /><KV k={x('Idade máx. da cotação', 'Max quote age', 'Edad máx. de cotización')} v={`${POLICY.maxQuoteAge} min`} /></>}
          {id === 'execution' && <><KV k={x('Ordens de amostra', 'Sample orders', 'Órdenes de muestra')} v={String(ORDERS.length)} /><KV k={x('Execução real', 'Real execution', 'Ejecución real')} v={x('não', 'no', 'no')} /></>}
          {id === 'reconciliation' && <><KV k={x('Ordens', 'Orders', 'Órdenes')} v={String(ORDERS.length)} /><KV k={x('Posições', 'Positions', 'Posiciones')} v={String(POSITIONS.length)} /></>}</dl>
        <ul className="mt-2 list-disc pl-5 text-xs">{a.latest.findings.map(c => <li key={c}>{L(FINDING[c]) || c}</li>)}</ul>
        <ul className="mt-2 list-disc pl-5 text-xs">{a.rules.filter(c => RULE[c]).map(c => <li key={c}>{L(RULE[c])}</li>)}</ul></div>
      : <>
        <div className="mt-3 rounded-xl border border-[#0E7C6B]/30 bg-[#F1F7F3] p-3 text-sm" data-testid={`graph-mandate-${id}`}><h4 className="font-extrabold">{x('Mandato de amostra', 'Sample mandate', 'Mandato de muestra')}</h4>
          <ol className="mt-1 list-decimal pl-5">{ag.steps.map((s, i) => <li key={i}>{L(s)}</li>)}</ol></div>
        {r && <div className="mt-3 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 text-sm" data-testid={`graph-reasoning-${id}`}><h4 className="flex items-center gap-1.5 font-extrabold"><Sparkles className="h-4 w-4 text-[#0A6657]" aria-hidden="true" />{x('Raciocínio ilustrativo', 'Illustrative reasoning', 'Razonamiento ilustrativo')}</h4>
          <p className="mt-1 text-xs text-[#7A5410]">{L(REASONING_PROVENANCE)}</p><p className="mt-2 font-semibold">{L(r.summary)}</p>
          <p className="mt-1"><b>{x('Sugestão ilustrativa', 'Illustrative suggestion', 'Sugerencia ilustrativa')}:</b> {rec}. <span className="text-xs text-[#5B6B85]">{x('Não é ordem financeira.', 'Not a financial order.', 'No es una orden financiera.')}</span></p>
          <ul className="mt-1 list-disc pl-5">{[...r.obs, ...r.unc, ...r.next].map((s, i) => <li key={i}>{L(s)}</li>)}</ul></div>}
        <div className="mt-3 rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3 text-sm" data-testid={`graph-monitoring-${id}`}><h4 className="font-extrabold">{x('Monitoramento (amostra)', 'Monitoring (sample)', 'Monitoreo (muestra)')}</h4>
          <p className="text-xs text-[#5B6B85]">{x('Ciclo', 'Cycle', 'Ciclo')}: <span className="mono">{a.latest.cycleId}</span> · {x('a cada', 'every', 'cada')} {a.cadenceSeconds} s · {a.runCount} {x('execuções', 'runs', 'ejecuciones')}</p>
          <ul className="mt-1 list-disc pl-5">{a.latest.findings.map(c => <li key={c}>{L(FINDING[c]) || c}</li>)}</ul>
          {SPEC.includes(id as Asset) && <p className="mt-1 text-xs">{x('Previsão de preço, não probabilidade de evento', 'Price forecast, not an event probability', 'Previsión de precio, no probabilidad de evento')}: {Number(FORECASTS[id as Asset].usd).toLocaleString(lc, { minimumFractionDigits: 2 })} USD · {x('bloco', 'block', 'bloque')} <span className="mono">{FORECASTS[id as Asset].block}</span></p>}</div>
        <button type="button" data-demo-action data-testid={`button-graph-ai-generate-${id}`} onClick={onAction} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white"><Sparkles className="h-4 w-4" aria-hidden="true" />{x('Gerar análise por IA', 'Generate AI analysis', 'Generar análisis por IA')}</button></>}
    </div>;
  };

  const EdgeDetail = ({ id }: { id: string }) => {
    const e = EDGES.find(q => q.id === id); if (!e) return null;
    const asset = SPEC.find(s => e.a === s);
    const reqs = asset ? REQUESTS.filter(r => r.asset === asset) : e.id === 'predictions-bettex' ? REQUESTS : [];
    const decs = asset ? DECISIONS.filter(d => d.asset === asset) : e.id === 'predictions-bettex' ? DECISIONS : [];
    return <div data-testid={`graph-edge-detail-${id}`}>
      <h3 className="display text-lg font-extrabold">{edgeLabel(e)}</h3>
      <p className="mt-1 text-sm">{e.ctl ? (e.b === 'execution' ? x('BETTEX encaminha decisões ao controle de execução, que só registra ordens simuladas.', 'BETTEX forwards decisions to the execution control, which only records simulated orders.', 'BETTEX encamina decisiones al control de ejecución, que solo registra órdenes simuladas.') : x('Verificação por regras: o controle confere a política sem ser um agente.', 'Rule-based check: the control verifies policy without being an agent.', 'Verificación por reglas: el control comprueba la política sin ser un agente.')) : asset ? x('Pedidos do especialista enviados ao agente Cripto.', 'Specialist requests sent to the Crypto agent.', 'Pedidos del especialista enviados al agente Cripto.') : x('Pedidos do agente Cripto comparados e decididos pela BETTEX.', 'Crypto agent requests compared and decided by BETTEX.', 'Pedidos del agente Cripto comparados y decididos por BETTEX.')}</p>
      {list(x('Pedidos de amostra', 'Sample requests', 'Pedidos de muestra'), reqs.map(reqMini))}
      {list(x('Decisões de amostra', 'Sample decisions', 'Decisiones de muestra'), decs.map(decMini))}
      {e.b === 'execution' && list(x('Ordens de amostra', 'Sample orders', 'Órdenes de muestra'), ORDERS.map(o => <OrderCard key={o.id} o={o} onJourney={setJid} />))}
      {e.b === 'execution' && list(x('Posições de amostra', 'Sample positions', 'Posiciones de muestra'), POSITIONS.map(p => <li key={p.id} className="rounded-xl border border-[#E4DCCB] p-3 text-sm" data-testid={`graph-position-${p.id}`}><span className="mono text-[11px]">{p.id}</span> · <Tag>{st(p.state)}</Tag> <button type="button" onClick={() => setJid(p.requestId)} className="ml-1 min-h-11 text-sm font-bold text-[#0A6657] underline">{x('Ver percurso', 'View journey', 'Ver recorrido')}</button></li>))}
      {e.ctl && e.b !== 'execution' && <NodeDetail id={e.b} />}
    </div>;
  };

  return <section className="grid min-w-0 gap-3" data-testid="central-graph" aria-label={x('Grafo da Central de IA', 'AI Center graph', 'Grafo de la Central de IA')}>
    <p className="text-xs font-bold text-[#7A5410]" data-testid="graph-provenance">{L(SAMPLE_PROVENANCE)}</p>
    <div className="cg-stage"><svg className="cg-svg" viewBox={vb} role="group" aria-label={x('Grafo: especialistas, agente Cripto, BETTEX e controles operacionais', 'Graph: specialists, Crypto agent, BETTEX and operational controls', 'Grafo: especialistas, agente Cripto, BETTEX y controles operativos')}>
      <text className="cg-zone" x={narrow ? 12 : 20} y={narrow ? 24 : 30}>{x('Agentes inteligentes', 'Intelligent agents', 'Agentes inteligentes')}</text>
      <text className="cg-zone" x={narrow ? 12 : 640} y={narrow ? 440 : 30}>{x('Controles operacionais, não agentes', 'Operational controls, not agents', 'Controles operativos, no agentes')}</text>
      <text className="cg-zone" x={narrow ? 12 : 20} y={narrow ? 690 : 500}>{x('Em breve, desativado', 'Upcoming, disabled', 'Próximamente, desactivado')}</text>
      {EDGES.map(e => { const a = pos[e.a], b = pos[e.b]; const act = on.has(e.id); const d = curve(a, b); const isSel = sel?.k === 'edge' && sel.id === e.id;
        return <g key={e.id} className="cg-hit" role="button" tabIndex={0} data-testid={`graph-edge-${e.id}`} aria-pressed={isSel} aria-label={`${x('Conexão', 'Connection', 'Conexión')}: ${edgeLabel(e)}`}
          onClick={() => pick({ k: 'edge', id: e.id })} onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick({ k: 'edge', id: e.id }); } }}>
          <title>{edgeLabel(e)}</title><path className="cg-hitpath" d={d} /><path className={`cg-edge-line ${e.ctl ? 'ctl' : ''} ${act ? 'on' : sel ? 'dim' : ''}`} d={d} /></g>; })}
      {[...SPEC, 'predictions', 'bettex', ...CTL].map(id => { const [px, py] = pos[id]; const I = ICON[id] ?? Bot; const r = R(id); const ctl = CTL.includes(id); const isSel = sel?.k === 'node' && sel.id === id;
        const inRoute = isSel || EDGES.some(e => on.has(e.id) && (e.a === id || e.b === id));
        return <g key={id} className={`cg-node ${ctl ? 'ctl' : ''} ${isSel ? 'sel' : ''} ${sel && !inRoute ? 'dim' : ''}`} role="button" tabIndex={0} data-testid={`graph-node-${id}`} aria-pressed={isSel} aria-label={`${nm(id)}, ${sub(id)}`}
          onClick={() => pick({ k: 'node', id })} onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick({ k: 'node', id }); } }}>
          <title>{`${nm(id)} - ${sub(id)}`}</title>
          {id === 'bettex' && <circle className="cg-halo" cx={px} cy={py} r={r + 14} />}
          <circle className="cg-ring" cx={px} cy={py} r={r + 6} /><circle className="cg-disc" cx={px} cy={py} r={r} />
          <I x={px - 10} y={py - 10} width={20} height={20} color={isSel ? '#FFFCF6' : ctl ? '#7A5410' : '#0A6657'} aria-hidden="true" />
          <text className="cg-label" x={px} y={py + r + 15}>{shortNm(id)}</text><text className="cg-sub" x={px} y={py + r + 28}>{sub(id)}</text></g>; })}
      {SOON.map(s => { const [px, py] = pos[s.id]; return <g key={s.id} className="cg-soon" role="img" aria-disabled="true" data-testid={`graph-soon-${s.id}`} aria-label={`${L(s.n)}: ${x('em breve, desativado', 'upcoming, disabled', 'próximamente, desactivado')}`}>
        <circle className="cg-disc" cx={px} cy={py} r={20} /><text className="cg-label" style={{ fill: '#8A8372' }} x={px} y={py + 4}>{x('Em breve', 'Soon', 'Pronto')}</text><text className="cg-sub" x={px} y={py + 36}>{L(s.n)}</text></g>; })}
    </svg></div>
    <p className="text-xs text-[#5B6B85]">{x('Selecione um nó ou uma conexão para ver detalhes. Use Tab e Enter no teclado.', 'Select a node or a connection for details. Use Tab and Enter on the keyboard.', 'Seleccione un nodo o una conexión para ver detalles. Use Tab y Enter en el teclado.')}</p>
    <div className="min-w-0 rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 sm:p-4" data-testid="graph-detail" aria-live="polite">
      {!sel ? <p className="text-sm">{x('Nada selecionado.', 'Nothing selected.', 'Nada seleccionado.')}</p> : sel.k === 'node' ? <NodeDetail id={sel.id} /> : <EdgeDetail id={sel.id} />}
      {jid && <div className="mt-3"><Journey key={jid} id={jid} onClose={() => setJid(null)} /></div>}
    </div>
  </section>;
}
