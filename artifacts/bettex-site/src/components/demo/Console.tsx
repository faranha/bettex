/** @jsxImportSource react */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowRight, Radio, Layers } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { AGENTS, useX } from './ui';
import { Money } from './fin';
import { AgentIcon } from './AgentIcon';
import { OrchestratorHelp, useOperationStatusLabels } from './OrchestratorHelp';
import { ProposalDetail } from './ProposalDetail';
import { formatBrazilTime } from './brazil-time';

export function Console({ d }: { d: DemoDashboard }) {
  const { x, tx, loc } = useX();
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const tm = (s: string) => formatBrazilTime(s, fl);
  const zone = x('Horário do Brasil', 'Brazil time', 'Horario de Brasil');
  const an = (id: string) => { if (id === 'risk') return x('Controle de risco', 'Risk control', 'Control de riesgo'); const a = (AGENTS as Record<string, { name: readonly [string, string, string] }>)[id]; return a ? tx(a.name) : id; };
  const statusLabels = useOperationStatusLabels();
  const ost = (s: string) => statusLabels[s] ?? s;
  const ev = (k: string) => ({ signal: x('sinal', 'signal', 'señal'), risk_check: x('checagem de risco', 'risk check', 'chequeo de riesgo'), approved: x('aprovou', 'approved', 'aprobó'), order: x('ordem', 'order', 'orden'), result: x('resultado', 'result', 'resultado'), rejected: x('rejeitou', 'rejected', 'rechazó'), reconciliation: x('conciliação', 'reconciliation', 'conciliación'), cycle_closed: x('ciclo encerrado', 'cycle closed', 'ciclo cerrado') } as Record<string, string>)[k] ?? k;
  const [agent, setAgent] = useState<string>('all'); const [sel, setSel] = useState<string | null>(null); const [live, setLive] = useState<'all' | 'active'>('all');
  const prevOps = useRef<Map<string, string>>(new Map()); const prevEv = useRef<Set<string> | null>(null);
  const [chg, setChg] = useState<Set<string>>(new Set()); const [fresh, setFresh] = useState<Set<string>>(new Set());
  useEffect(() => {
    const c = new Set<string>(); const m = new Map<string, string>();
    d.operations.forEach(o => { const k = `${o.status}|${o.pnlUsdc}|${o.capitalUsdc}`; m.set(o.id, k); if (prevOps.current.size && prevOps.current.get(o.id) !== k) c.add(o.id); });
    prevOps.current = m; setChg(c);
    const ids = new Set(d.events.map(e => e.id)); const f = new Set<string>();
    if (prevEv.current) ids.forEach(i => { if (!prevEv.current!.has(i)) f.add(i); });
    prevEv.current = ids; setFresh(f);
  }, [d.operations, d.events]);
  const agents = useMemo(() => Array.from(new Set(d.operations.map(o => o.agent))), [d.operations]);
  const isAct = (s: string) => !['closed', 'rejected', 'expired', 'cancelled', 'failed'].includes(s);
  const ops = d.operations.filter(o => (agent === 'all' || o.agent === agent) && (live === 'all' || isAct(o.status)));
  const evs = d.events.filter(e => agent === 'all' || e.fromAgent === agent || e.toAgent === agent);
  const cur = ops.find(o => o.id === sel) ?? null;
  const rel = cur ? d.events.filter(e => e.reference === cur.id).sort((a, b) => Date.parse(a.at) - Date.parse(b.at)) : [];
  const chip = (on: boolean) => `console-chip min-h-10 rounded-full border px-3 text-xs font-bold ${on ? 'border-[#0E7C6B] bg-[#0E7C6B] text-white' : 'border-[#D8CFBB] bg-[#FFFCF6] text-[#1B2A41]'}`;
  const nAct = d.operations.filter(o => isAct(o.status)).length;
  return <div className="grid grid-cols-1 gap-4" data-testid="console-root">
    <OrchestratorHelp d={d} />
    <div className="dcard flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3"><span className="console-dot" aria-hidden="true" /><div><p className="text-sm font-bold">{x('Atividade ao vivo', 'Live activity', 'Actividad en vivo')} · {tm(d.serverNow)} · {zone}</p></div></div>
      <p className="mono text-xs text-[#5B6B85]" data-testid="text-console-count">{nAct} {x('ativas', 'active', 'activas')} · {d.operations.length} {x('operações', 'operations', 'operaciones')} · {d.events.length} {x('eventos', 'events', 'eventos')}</p></div>
    <div className="flex flex-wrap gap-2" role="group" aria-label={x('Filtrar por agente', 'Filter by agent', 'Filtrar por agente')}>
      <button type="button" data-testid="filter-agent-all" aria-pressed={agent === 'all'} onClick={() => setAgent('all')} className={chip(agent === 'all')}>{x('Todos os agentes', 'All agents', 'Todos los agentes')}</button>
      {agents.map(a => <button key={a} type="button" data-testid={`filter-agent-${a}`} aria-pressed={agent === a} onClick={() => setAgent(a)} className={`${chip(agent === a)} inline-flex items-center gap-2`}><AgentIcon id={a} className="h-4 w-4 shrink-0" />{an(a)}</button>)}
      <span className="mx-1 hidden w-px bg-[#E4DCCB] sm:block" />
      <button type="button" data-testid="filter-active" aria-pressed={live === 'active'} onClick={() => setLive(live === 'active' ? 'all' : 'active')} className={chip(live === 'active')}>{x('Só ativas', 'Active only', 'Solo activas')}</button></div>
    <div className="grid gap-4 lg:grid-cols-5">
      <section className="dcard p-4 lg:col-span-3" aria-label={x('Operações', 'Operations', 'Operaciones')}>
        <h2 className="display mb-2 flex items-center gap-2 text-lg font-extrabold"><Layers className="h-4 w-4 text-[#0E7C6B]" aria-hidden="true" />{x('Propostas e operações', 'Proposals and operations', 'Propuestas y operaciones')}</h2>
        <p className="mb-3 text-xs text-[#5B6B85]">{x('Clique em um item para ver a sugestão e os movimentos propostos.', 'Click an item to see the suggestion and proposed moves.', 'Haz clic en un elemento para ver la sugerencia y los movimientos propuestos.')}</p>
        {!ops.length ? <p className="rounded-xl bg-[#F5F1E8] p-4 text-sm text-[#5B6B85]">{x('Nenhuma operação neste filtro.', 'No operations in this filter.', 'Ninguna operación en este filtro.')}</p> :
        <ul className="grid gap-2">{ops.map(o => <li key={o.id}><button type="button" data-testid={`row-operation-${o.id}`} aria-expanded={cur?.id === o.id} aria-controls={`operation-detail-${o.id}`} onClick={() => setSel(sel === o.id ? null : o.id)} className={`console-row ${chg.has(o.id) ? 'console-pulse' : ''} grid w-full gap-1 rounded-xl border px-3 py-2.5 text-left sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4 ${cur?.id === o.id ? 'border-[#0E7C6B] bg-[#EFF6F2]' : 'border-[#EBE3D1] bg-[#FBF8F0]'}`}>
          <span className="flex min-w-0 items-center gap-2"><AgentIcon id={o.agent} className="h-5 w-5 shrink-0 text-[#0E7C6B]" /><span className="min-w-0"><span className="block text-sm font-bold">{an(o.agent)}</span><span className="block truncate text-xs text-[#5B6B85]">{o.market} · {o.id}</span></span></span>
          <span className={`console-state w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${isAct(o.status) ? 'bg-[#DDEBE4] text-[#0A6657]' : 'bg-[#F0E9DA] text-[#5B6B85]'}`}>{ost(o.status)}</span>
          {['open', 'result', 'reconciling', 'closed'].includes(o.status) ? <Money v={o.pnlUsdc} a="USDC" signed /> : <span className="text-xs text-[#5B6B85]">{x('Sem resultado', 'No result yet', 'Sin resultado')}</span>}</button>
          {cur?.id === o.id && <div id={`operation-detail-${o.id}`} className="mt-2 grid gap-3 rounded-xl border border-dashed border-[#D8CFBB] p-3 text-sm" data-testid="panel-operation-detail">
            <dl className="grid grid-cols-2 gap-3"><div><dt className="text-xs text-[#5B6B85]">{x('Capital solicitado', 'Requested capital', 'Capital solicitado')}</dt><dd><Money v={cur.capitalUsdc} a="USDC" /></dd></div><div><dt className="text-xs text-[#5B6B85]">{x('Estado', 'Status', 'Estado')}</dt><dd className="font-bold">{ost(cur.status)}</dd></div></dl>
            <ProposalDetail operation={cur} />
            <h3 className="text-sm font-bold">{x('Percurso da operação', 'Operation trail', 'Recorrido de la operación')}</h3>
            {rel.length ? <ol className="console-rail grid gap-0">{rel.map(e => <li key={e.id} className="console-ev relative py-2 pl-5 text-xs"><span className="mono text-[#5B6B85]">{tm(e.at)}</span><p className="flex flex-wrap items-center gap-1.5 font-bold"><AgentIcon id={e.fromAgent} className="h-3.5 w-3.5 shrink-0" />{an(e.fromAgent)}<ArrowRight className="h-3 w-3" aria-hidden="true" /><AgentIcon id={e.toAgent} className="h-3.5 w-3.5 shrink-0" />{an(e.toAgent)}</p><p>{ev(e.kind)}</p></li>)}</ol> : <p className="text-xs text-[#5B6B85]">{x('Sem eventos recentes disponíveis para este item.', 'No recent events available for this item.', 'No hay eventos recientes disponibles para este elemento.')}</p>}
          </div>}</li>)}</ul>}</section>
      <section className="dcard p-4 lg:col-span-2" aria-label={x('Interações entre agentes', 'Agent interactions', 'Interacciones entre agentes')}>
        <h2 className="display mb-3 flex items-center gap-2 text-lg font-extrabold"><Radio className="h-4 w-4 text-[#0E7C6B]" aria-hidden="true" />{x('Troca entre agentes', 'Agent exchanges', 'Intercambio entre agentes')}</h2>
        {!evs.length ? <p className="rounded-xl bg-[#F5F1E8] p-4 text-sm text-[#5B6B85]">{x('Sem eventos para este agente.', 'No events for this agent.', 'Sin eventos para este agente.')}</p> :
        <ol className="console-rail grid gap-0" data-testid="list-feed" aria-live="polite">{evs.slice(0, 14).map(e => <li key={e.id} className={`console-ev ${fresh.has(e.id) ? 'console-pulse demo-in' : ''} relative grid gap-0.5 py-2 pl-5`}>
          <span className="mono text-[11px] text-[#5B6B85]">{tm(e.at)}</span>
          <span className="flex flex-wrap items-center gap-1.5 text-sm font-bold"><AgentIcon id={e.fromAgent} className="h-4 w-4 shrink-0" />{an(e.fromAgent)}<ArrowRight className="h-3.5 w-3.5 text-[#0E7C6B]" aria-hidden="true" /><AgentIcon id={e.toAgent} className="h-4 w-4 shrink-0" />{an(e.toAgent)}</span>
          <span className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-[#DDEBE4] px-2 font-semibold text-[#0A6657]">{ev(e.kind)}</span><span className="mono text-[#5B6B85]">{x('ref.', 'ref.', 'ref.')} {e.reference}</span></span></li>)}</ol>}
        <p className="mt-3 flex items-center gap-2 text-xs text-[#5B6B85]"><Activity className="h-3.5 w-3.5" aria-hidden="true" />{x('Dúvidas? Fale com a comunidade no Telegram.', 'Questions? Talk to the community on Telegram.', '¿Dudas? Habla con la comunidad en Telegram.')}</p></section></div></div>;
}
