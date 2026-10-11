/** @jsxImportSource react */
import { useState } from 'react';
import { Workflow, Settings2, ScrollText } from 'lucide-react';
import { useFmt, card, KV, Tag, dec6 } from '../alpha-trading/format';
import { POLICY, AGENTS, REQUESTS, DECISIONS, type T3 } from './central-data';
import { useL } from './CentralAgents';
import { STATUS, DECISION } from '../agent-operations/copy';

const MANDATES: { id: string; who: T3; text: T3 }[] = [
  { id: 'bettex', who: ['BETTEX', 'BETTEX', 'BETTEX'], text: ['Recebe pedidos, compara por perda potencial, custo e liquidez, e decide manter, selecionar ou rejeitar. Não negocia por conta própria.', 'Receives requests, compares by potential loss, cost and liquidity, and decides to hold, select or reject. It does not trade on its own.', 'Recibe pedidos, compara por pérdida potencial, costo y liquidez, y decide mantener, seleccionar o rechazar. No opera por cuenta propia.'] },
  { id: 'crypto', who: ['Agente Cripto', 'Crypto agent', 'Agente Cripto'], text: ['Coordena BTC, ETH e SOL e registra mercados observados. Só envia pedidos à BETTEX.', 'Coordinates BTC, ETH and SOL and records observed markets. It only sends requests to BETTEX.', 'Coordina BTC, ETH y SOL y registra mercados observados. Solo envía pedidos a BETTEX.'] },
  { id: 'specialists', who: ['Especialistas BTC, ETH, SOL', 'BTC, ETH, SOL specialists', 'Especialistas BTC, ETH, SOL'], text: ['Leem a previsão de preço Allora e mercados Polymarket de seu ativo. Sem autoridade sobre dinheiro.', 'Read the Allora price forecast and Polymarket markets for their asset. No authority over money.', 'Leen la previsión de precio Allora y mercados Polymarket de su activo. Sin autoridad sobre dinero.'] },
  { id: 'controls', who: ['Controles operacionais', 'Operational controls', 'Controles operativos'], text: ['Tesouraria, governança, risco, execução e conciliação verificam regras. Não são agentes.', 'Treasury, governance, risk, execution and reconciliation check rules. They are not agents.', 'Tesorería, gobernanza, riesgo, ejecución y conciliación verifican reglas. No son agentes.'] },
];

export function CentralBettex() {
  const { x, loc, date } = useFmt(); const L = useL(); const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const u = (v: string) => `${dec6(v, lc)} USDC`; const [m, setM] = useState('bettex'); const b = AGENTS[0].latest;
  const mand = MANDATES.find(k => k.id === m) ?? MANDATES[0];
  const hier: [string, string[]][] = [['BETTEX', ['Cripto']]];
  return <div className="cgo-bettex" data-testid="bettex-overview">
    <nav aria-label={x('Hierarquia', 'Hierarchy', 'Jerarquía')} data-testid="hierarchy" className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-[#0A6657]">
      {hier.map(([a]) => <span key={a} className="inline-flex items-center gap-1.5"><Workflow className="h-4 w-4" aria-hidden="true" />{a}</span>)}<span aria-hidden="true">&gt;</span><span>{x('Cripto', 'Crypto', 'Cripto')}</span><span aria-hidden="true">&gt;</span><span>BTC</span><span aria-hidden="true">/</span><span>ETH</span><span aria-hidden="true">/</span><span>SOL</span></nav>
    <section className="rounded-xl border border-[#C9A227]/50 bg-[#FFFCF6] p-3" data-testid="bettex-summary">
      <div className="flex flex-wrap items-center gap-2"><h3 className="display text-base font-extrabold">{x('Resumo da BETTEX', 'BETTEX summary', 'Resumen de BETTEX')}</h3><Tag>{L(STATUS[b.status])}</Tag><Tag>{L(DECISION[b.decision])}</Tag></div>
      <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4"><KV k={x('Pedidos', 'Requests', 'Pedidos')} v={REQUESTS.length} /><KV k={x('Decisões', 'Decisions', 'Decisiones')} v={DECISIONS.length} /><KV k={x('Último ciclo', 'Last cycle', 'Último ciclo')} v={date(b.completedAt)} /><KV k={x('Universo', 'Universe', 'Universo')} v="BTC / ETH / SOL" /></dl>
    </section>
    <section className="rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3" data-testid="bettex-config">
      <h3 className="flex items-center gap-2 font-bold"><Settings2 className="h-4 w-4 text-[#0A6657]" aria-hidden="true" />{x('Configuração', 'Configuration', 'Configuración')}</h3>
      <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3"><KV k={x('Modo', 'Mode', 'Modo')} v={x('Simulação', 'Simulation', 'Simulación')} /><KV k={x('Máx. por ordem', 'Max per order', 'Máx. por orden')} v={u(POLICY.maxOrder)} /><KV k={x('Máx. portfólio', 'Max portfolio', 'Máx. portafolio')} v={u(POLICY.maxPortfolio)} /><KV k={x('Autorização', 'Authorization', 'Autorización')} v={x('Execução dentro dos mandatos aprovados', 'Execution within approved mandates', 'Ejecución dentro de los mandatos aprobados')} /><KV k={x('Frequência de ciclo', 'Cycle cadence', 'Frecuencia de ciclo')} v="60 s" /><KV k={x('Política', 'Policy', 'Política')} v={`${POLICY.version}`} /></dl>
    </section>
    <section className="rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3" data-testid="bettex-mandates">
      <h3 className="flex items-center gap-2 font-bold"><ScrollText className="h-4 w-4 text-[#0A6657]" aria-hidden="true" />{x('Mandatos', 'Mandates', 'Mandatos')}</h3>
      <div className="mt-2 flex flex-wrap gap-2" role="tablist">{MANDATES.map(k => <button key={k.id} type="button" role="tab" aria-selected={m === k.id} data-testid={`mandate-${k.id}`} onClick={() => setM(k.id)} className={`min-h-11 rounded-full px-4 text-sm font-bold ${m === k.id ? 'bg-[#0E7C6B] text-white' : 'border border-[#E4DCCB]'}`}>{L(k.who)}</button>)}</div>
      <p className="mt-2 text-sm" data-testid="mandate-text">{L(mand.text)}</p>
    </section>
    <section className="rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3" data-testid="bettex-authorization">
      <h3 className="font-bold">{x('Autorização e fronteiras', 'Authorization and boundaries', 'Autorización y fronteras')}</h3>
      <ul className="mt-2 list-disc pl-5 text-sm">
        <li>{x('Operações já cobertas por um mandato aprovado são executadas dentro dos limites, sem nova decisão humana a cada operação.', 'Operations already covered by an approved mandate run within limits, without a new human decision for each operation.', 'Las operaciones ya cubiertas por un mandato aprobado se ejecutan dentro de los límites, sin nueva decisión humana en cada operación.')}</li>
        <li>{x('A recompra exige autorização administrativa e multisig separada; não faz parte da execução dos mandatos.', 'The buyback requires separate administrative and multisig authorization; it is not part of mandate execution.', 'La recompra exige autorización administrativa y multisig separada; no forma parte de la ejecución de mandatos.')}</li></ul></section>
  </div>;
}
