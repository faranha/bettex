/** @jsxImportSource react */
import { useState } from 'react';
import { Workflow, Settings2, ScrollText } from 'lucide-react';
import { useFmt, KV, Tag } from '../alpha-trading/format';
import { POLICY, AGENTS, REQUESTS, DECISIONS, type T3 } from './central-data';
import { useL } from './CentralAgents';
import { STATUS, DECISION } from '../agent-operations/copy';
import { DemoBusinessContext } from './DemoBusinessContext';
import { businessIntelligence } from '@/lib/documentation-business';

const RESPONSIBILITIES: { id: string; who: T3; text: readonly [string, string, string] }[] = [
  { id: 'bettex', who: ['BETTEX', 'BETTEX', 'BETTEX'], text: businessIntelligence.coordination },
  { id: 'crypto', who: ['Cripto', 'Crypto', 'Cripto'], text: businessIntelligence.agP1 },
  { id: 'specialists', who: ['Análises por ativo', 'Asset analyses', 'Análisis por activo'], text: businessIntelligence.agP2 },
  { id: 'controls', who: ['Subagentes de apoio', 'Support subagents', 'Subagentes de apoyo'], text: businessIntelligence.subagentDefinition },
];

export function CentralBettex() {
  const { x, date } = useFmt();
  const L = useL();
  const [selected, setSelected] = useState('bettex');
  const latest = AGENTS[0].latest;
  const responsibility = RESPONSIBILITIES.find(item => item.id === selected) ?? RESPONSIBILITIES[0];
  return <div className="cgo-bettex" data-testid="bettex-overview">
    <nav aria-label={x('Hierarquia', 'Hierarchy', 'Jerarquía')} data-testid="hierarchy" className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-[#0A6657]">
      <Workflow className="h-4 w-4" aria-hidden />BETTEX <span aria-hidden>↔</span> {x('Cripto e subagentes de apoio', 'Crypto and support subagents', 'Cripto y subagentes de apoyo')}
    </nav>
    <DemoBusinessContext area="central" />
    <section className="rounded-xl border border-[#C9A227]/50 bg-[#FFFCF6] p-3" data-testid="bettex-summary">
      <div className="flex flex-wrap items-center gap-2"><h3 className="display text-base font-extrabold">{x('Resumo da BETTEX', 'BETTEX summary', 'Resumen de BETTEX')}</h3><Tag>{L(STATUS[latest.status])}</Tag><Tag>{L(DECISION[latest.decision])}</Tag></div>
      <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KV k={x('Pedidos', 'Requests', 'Pedidos')} v={REQUESTS.length} />
        <KV k={x('Decisões', 'Decisions', 'Decisiones')} v={DECISIONS.length} />
        <KV k={x('Último ciclo', 'Last cycle', 'Último ciclo')} v={date(latest.completedAt)} />
        <KV k={x('Universo', 'Universe', 'Universo')} v={x('Moedas sem lista fixa', 'Coins without a fixed list', 'Monedas sin lista fija')} />
      </dl>
    </section>
    <section className="rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3" data-testid="bettex-config">
      <h3 className="flex items-center gap-2 font-bold"><Settings2 className="h-4 w-4" aria-hidden />{x('Desenvolvimento', 'Development', 'Desarrollo')}</h3>
      <p className="mt-2 text-sm">{x(...businessIntelligence.visaoEstado)}</p>
      <p className="mt-2 text-xs">{x('Referência técnica do cenário', 'Scenario technical reference', 'Referencia técnica del escenario')}: {POLICY.version}</p>
    </section>
    <section className="rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3" data-testid="bettex-mandates">
      <h3 className="flex items-center gap-2 font-bold"><ScrollText className="h-4 w-4" aria-hidden />{x('Responsabilidades e colaboração', 'Responsibilities and collaboration', 'Responsabilidades y colaboración')}</h3>
      <div className="mt-2 flex flex-wrap gap-2" role="tablist" aria-label={x('Responsabilidades', 'Responsibilities', 'Responsabilidades')}>
        {RESPONSIBILITIES.map(item => <button key={item.id} type="button" role="tab" aria-selected={selected === item.id} data-testid={`mandate-${item.id}`} onClick={() => setSelected(item.id)} className={`min-h-11 rounded-full px-4 text-sm font-bold ${selected === item.id ? 'bg-[#0E7C6B] text-white' : 'border border-[#E4DCCB]'}`}>{L(item.who)}</button>)}
      </div>
      <p className="mt-2 text-sm" data-testid="mandate-text">{L([...responsibility.text])}</p>
    </section>
    <section className="rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3" data-testid="bettex-authorization">
      <h3 className="font-bold">{x('Autonomia e limites', 'Autonomy and boundaries', 'Autonomía y límites')}</h3>
      <p className="mt-2 text-sm">{x(...businessIntelligence.baseline)}</p>
      <p className="mt-2 text-sm">{x('Risco e Tesouraria contribuem para a análise de exposição, liquidez e cenários. A IA não pode alterar direitos econômicos, usar tokens pessoais ou ampliar sozinha suas permissões. Nada neste demo executa ordens.', 'Risk and Treasury contribute exposure, liquidity and scenario analysis. AI cannot change economic rights, use personal tokens or expand its permissions unilaterally. Nothing in this demo executes orders.', 'Riesgo y Tesorería contribuyen al análisis de exposición, liquidez y escenarios. La IA no puede cambiar derechos económicos, usar tokens personales ni ampliar sola sus permisos. Nada en este demo ejecuta órdenes.')}</p>
    </section>
  </div>;
}
