/** @jsxImportSource react */
import type { Dispatch } from 'react';
import type { AgentId, DemoAction, DemoState } from './types';
import { AGENTS, Panel, useX } from './ui';
import { AgentView, OperationDetail, agentActivity, isActive, useSelection } from './Operations';
import { Chat } from './Chat';

const NODES: { id: AgentId; x: number; y: number }[] = [
  { id: 'predictions', x: 130, y: 70 }, { id: 'sports', x: 130, y: 250 }, { id: 'crypto', x: 870, y: 70 }, { id: 'bonus', x: 870, y: 250 },
  { id: 'treasury', x: 330, y: 400 }, { id: 'buyback', x: 500, y: 430 }, { id: 'governance', x: 670, y: 400 },
];
const C = { x: 500, y: 190 };

export function Central({ state, dispatch }: { state: DemoState; dispatch: Dispatch<DemoAction> }) {
  const { x, tx } = useX();
  const sel = useSelection(state);
  const reduce = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const activeOf = (id: AgentId) => state.operations.filter(o => o.agent === id && isActive(o));
  return <div className="grid gap-4">
    <Panel title={x('Mapa da IA BETTEX', 'BETTEX AI map', 'Mapa de la IA BETTEX')} tag={`T+${state.clock}h`}>
      <div className="overflow-x-auto"><svg viewBox="0 0 1000 480" className="h-auto min-w-[640px] w-full" role="group" aria-label={x('Mapa com a orquestradora, quatro mercados, tesouraria, recompra e governança. Linhas animadas indicam operações ativas.', 'Map of the orchestrator, four markets, treasury, buyback and governance. Animated lines show active operations.', 'Mapa de la orquestadora, cuatro mercados, tesorería, recompra y gobernanza. Las líneas animadas indican operaciones activas.')}>
        {NODES.map(nd => { const ac = agentActivity(state, nd.id); const col = AGENTS[nd.id].color; const live = ac.out || ac.inn;
          const to = `M${C.x} ${C.y} L${nd.x} ${nd.y}`, from = `M${nd.x} ${nd.y} L${C.x} ${C.y}`;
          return <g key={nd.id}>
            <line x1={nd.x} y1={nd.y} x2={C.x} y2={C.y} stroke={col} strokeOpacity={live ? .55 : .2} strokeWidth="2" />
            {!reduce && ac.out && <circle r="5" fill={col}><animateMotion dur="2.6s" repeatCount="indefinite" path={to} /></circle>}
            {!reduce && ac.inn && <circle r="5" fill="#F4F1E8" stroke={col}><animateMotion dur="2.6s" begin="1.3s" repeatCount="indefinite" path={from} /></circle>}
            {reduce && live && <text x={(nd.x + C.x) / 2} y={(nd.y + C.y) / 2} fill={col} fontSize="14" textAnchor="middle">{ac.out ? '→' : ''}{ac.inn ? '←' : ''}</text>}
          </g>; })}
        <g role="button" tabIndex={0} aria-label={tx(AGENTS.orchestrator.name)} onClick={() => sel.setAgent('orchestrator')} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && sel.setAgent('orchestrator')} style={{ cursor: 'pointer' }}>
          <circle cx={C.x} cy={C.y} r="62" fill="#13204F" stroke="#5F86FF" strokeWidth="3" /><text x={C.x} y={C.y - 2} textAnchor="middle" fill="#F4F1E8" fontWeight="800" fontSize="18">BETTEX</text><text x={C.x} y={C.y + 20} textAnchor="middle" fill="#8FA8F0" fontSize="12">{x('Orquestradora', 'Orchestrator', 'Orquestadora')}</text>
        </g>
        {NODES.map(nd => { const a = AGENTS[nd.id]; const k = activeOf(nd.id).length; const ag = agentActivity(state, nd.id); return <g key={nd.id} role="button" tabIndex={0} aria-label={`${tx(a.name)} ${k}`} onClick={() => sel.setAgent(nd.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && sel.setAgent(nd.id)} style={{ cursor: 'pointer' }}>
          <rect x={nd.x - 80} y={nd.y - 28} width="160" height="56" rx="14" fill="#0C1536" stroke={a.color} strokeWidth={sel.agent === nd.id ? 4 : 1.5} />
          <text x={nd.x} y={nd.y - 3} textAnchor="middle" fill={a.color} fontWeight="700" fontSize="15">{tx(a.name)}</text>
          <text x={nd.x} y={nd.y + 16} textAnchor="middle" fill="#9AA9D6" fontSize="11">{ag.out && ag.inn ? '⇄' : ag.out ? '→' : ag.inn ? '←' : '·'} {k} {x('ativas', 'active', 'activas')}</text>
        </g>; })}
      </svg></div>
      <p className="mt-2 text-xs text-[#C5D2F1]">{x('Ponto cheio: pedido ou autorização indo da orquestradora ao agente (→). Ponto claro: análise, confirmação ou incidente voltando (←). Acompanham os eventos preparados do cenário.', 'Filled dot: request or authorization going from orchestrator to agent (→). Light dot: analysis, confirmation or incident coming back (←). They follow the prepared scenario events.', 'Punto lleno: solicitud o autorización de la orquestadora al agente (→). Punto claro: análisis, confirmación o incidente de vuelta (←). Siguen los eventos preparados del escenario.')}</p>
      <p className="mt-2 text-xs text-[#9AA9D6]">{x('Allora informa inferência e não executa ordens. A Arbitrum registra apenas o que é on-chain; execuções externas seguem seus conectores.', 'Allora provides inference and never executes orders. Arbitrum records only on-chain items; external executions follow their connectors.', 'Allora aporta inferencia y no ejecuta órdenes. Arbitrum registra solo lo on-chain; las ejecuciones externas siguen sus conectores.')}</p>
    </Panel>
    <div className="grid gap-4 lg:grid-cols-2">
      <AgentView agent={sel.agent} state={state} opId={sel.opId} onOp={sel.setOpId} />
      {sel.op ? <OperationDetail op={sel.op} state={state} /> : <Panel><p className="p-6 text-center text-sm text-[#9AA9D6]">{x('Escolha um agente no mapa e uma operação para inspecionar fonte, risco e eventos.', 'Pick an agent on the map and an operation to inspect source, risk and events.', 'Elija un agente en el mapa y una operación para inspeccionar fuente, riesgo y eventos.')}</p></Panel>}
    </div>
    <Chat state={state} dispatch={dispatch} compact />
  </div>;
}
