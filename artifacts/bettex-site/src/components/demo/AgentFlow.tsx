/** @jsxImportSource react */
import { ArrowDown } from 'lucide-react';
import { AGENTS, useX } from './ui';
import { AgentIcon } from './AgentIcon';
import './AgentFlow.css';

const IDS = ['crypto', 'predictions', 'sports', 'bonus', 'treasury'] as const;

export function AgentFlow() {
  const { x, tx } = useX();
  return <section className="dcard af" aria-label={x('Como uma proposta chega ao BTEX', 'How a proposal reaches BTEX', 'Cómo llega una propuesta a BTEX')} data-testid="agent-flow">
    <div className="af-head">
      <h2 className="display text-lg font-extrabold">{x('Da sugestão à decisão do BTEX', 'From suggestion to BTEX decision', 'De la sugerencia a la decisión de BTEX')}</h2>
      <span className="af-badge">{x('Fluxo ilustrativo', 'Illustrative flow', 'Flujo ilustrativo')}</span>
    </div>
    <p className="mt-1 text-xs text-[#5B6B85]">{x('Cada agente especialista envia sugestões. Nenhuma delas é uma ordem aprovada.', 'Each specialist agent sends suggestions. None of them is an approved order.', 'Cada agente especialista envía sugerencias. Ninguna es una orden aprobada.')}</p>
    <ul className="af-grid" aria-label={x('Agentes especialistas', 'Specialist agents', 'Agentes especialistas')} style={{ listStyle: 'none', padding: 0 }}>
      {IDS.map(id => <li key={id} className="af-ag">
        <span className="af-bot"><AgentIcon id={id} className="h-5 w-5" /></span>
        <span>{tx(AGENTS[id].name)}</span>
        <span className="sr-only">{x('envia sugestão', 'sends suggestion', 'envía sugerencia')}</span>
      </li>)}
    </ul>
    <div className="af-track" aria-hidden="true">
      <svg viewBox="0 0 1000 90" preserveAspectRatio="none" focusable="false">
        {IDS.map((id, i) => {
          const path = `M ${100 + i * 200},0 V 12 Q ${100 + i * 200},44 500,68 V 88`;
          return <g key={id}>
            <path className="af-line" d={path} vectorEffect="non-scaling-stroke" />
            <g className="af-pkt-motion"><rect className="af-pkt" x="-10" y="-5" width="20" height="10" rx="3" opacity="0">
              <animateMotion dur="4.5s" begin={`${i * .7}s`} repeatCount="indefinite" path={path} />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.9;1" dur="4.5s" begin={`${i * .7}s`} repeatCount="indefinite" />
            </rect></g>
          </g>;
        })}
      </svg>
    </div>
    <div className="af-flow">
      <div className="af-box af-q" role="group" aria-label={x('Fila central de propostas', 'Central proposal queue', 'Cola central de propuestas')}>
        <h4>{x('Fila central', 'Central queue', 'Cola central')}</h4>
        <p>{x('Sugestões reunidas para análise.', 'Suggestions gathered for analysis.', 'Sugerencias reunidas para análisis.')}</p>
        <div className="af-slots" aria-hidden="true"><i /><i /><i /><i /></div>
      </div>
      <div className="af-down" aria-hidden="true"><ArrowDown className="h-5 w-5" /></div>
      <div className="af-box af-chief af-ag" style={{ flexDirection: 'row', textAlign: 'left', gap: 12 }} role="group" aria-label={x('IA principal BTEX', 'Chief AI BTEX', 'IA principal BTEX')}>
        <span className="af-bot"><AgentIcon id="orchestrator" className="h-7 w-7" /></span>
        <span><span className="block display text-base font-extrabold">{tx(AGENTS.orchestrator.name)}</span><span className="block text-xs font-normal">{x('IA principal: prioriza, pede análise e decide.', 'Chief AI: prioritizes, requests analysis and decides.', 'IA principal: prioriza, pide análisis y decide.')}</span></span>
      </div>
    </div>
    <div className="af-notes">
      <p className="af-note warn"><b>{x('Sugestão enviada:', 'Suggestion sent:', 'Sugerencia enviada:')}</b> {x('ainda em análise, nada foi executado.', 'still under analysis, nothing executed.', 'aún en análisis, nada ejecutado.')}</p>
      <p className="af-note"><b>{x('Decisão do BTEX:', 'BTEX decision:', 'Decisión de BTEX:')}</b> {x('aprovação e execução são etapas diferentes.', 'approval and execution are separate steps.', 'aprobación y ejecución son etapas diferentes.')}</p>
    </div>
  </section>;
}
