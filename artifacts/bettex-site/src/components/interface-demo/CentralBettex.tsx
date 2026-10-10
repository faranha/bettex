/** @jsxImportSource react */
import { useState } from 'react';
import { Workflow, Settings2, ScrollText } from 'lucide-react';
import { useFmt, card, KV, Tag, dec6 } from '../alpha-trading/format';
import { POLICY, AGENTS, REQUESTS, DECISIONS, SAMPLE_PROVENANCE, type T3 } from './central-data';
import { useL } from './CentralAgents';
import { STATUS, DECISION } from '../agent-operations/copy';

const MANDATES: { id: string; who: T3; text: T3 }[] = [
  { id: 'bettex', who: ['BETTEX', 'BETTEX', 'BETTEX'], text: ['Recebe pedidos, compara por perda potencial, custo e liquidez, e decide manter, selecionar ou rejeitar. Não negocia por conta própria.', 'Receives requests, compares by potential loss, cost and liquidity, and decides to hold, select or reject. It does not trade on its own.', 'Recibe pedidos, compara por pérdida potencial, costo y liquidez, y decide mantener, seleccionar o rechazar. No opera por cuenta propia.'] },
  { id: 'crypto', who: ['Agente Cripto', 'Crypto agent', 'Agente Cripto'], text: ['Coordena BTC, ETH e SOL e registra mercados observados. Só envia pedidos à BETTEX.', 'Coordinates BTC, ETH and SOL and records observed markets. It only sends requests to BETTEX.', 'Coordina BTC, ETH y SOL y registra mercados observados. Solo envía pedidos a BETTEX.'] },
  { id: 'specialists', who: ['Especialistas BTC, ETH, SOL', 'BTC, ETH, SOL specialists', 'Especialistas BTC, ETH, SOL'], text: ['Leem a previsão de preço Allora e mercados Polymarket de seu ativo. Sem autoridade sobre dinheiro.', 'Read the Allora price forecast and Polymarket markets for their asset. No authority over money.', 'Leen la previsión de precio Allora y mercados Polymarket de su activo. Sin autoridad sobre dinero.'] },
  { id: 'controls', who: ['Controles operacionais', 'Operational controls', 'Controles operativos'], text: ['Tesouraria, governança, risco, execução e conciliação verificam regras. Não são agentes.', 'Treasury, governance, risk, execution and reconciliation check rules. They are not agents.', 'Tesorería, gobernanza, riesgo, ejecución y conciliación verifican reglas. No son agentes.'] },
];

export function CentralBettex({ onAction }: { onAction: () => void }) {
  const { x, loc, date } = useFmt(); const L = useL(); const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const u = (v: string) => `${dec6(v, lc)} USDC`; const [m, setM] = useState('bettex'); const b = AGENTS[0].latest;
  const mand = MANDATES.find(k => k.id === m) ?? MANDATES[0];
  const hier: [string, string[]][] = [['BETTEX', ['Cripto']]];
  return <>
    <nav aria-label={x('Hierarquia', 'Hierarchy', 'Jerarquía')} data-testid="hierarchy" className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-[#0A6657]">
      {hier.map(([a]) => <span key={a} className="inline-flex items-center gap-1.5"><Workflow className="h-4 w-4" aria-hidden="true" />{a}</span>)}<span aria-hidden="true">&gt;</span><span>{x('Cripto', 'Crypto', 'Cripto')}</span><span aria-hidden="true">&gt;</span><span>BTC</span><span aria-hidden="true">/</span><span>ETH</span><span aria-hidden="true">/</span><span>SOL</span></nav>
    <section className="rounded-xl border border-[#C9A227]/50 bg-[#FFFCF6] p-3" data-testid="bettex-summary">
      <div className="flex flex-wrap items-center gap-2"><h3 className="display text-base font-extrabold">{x('Resumo da BETTEX', 'BETTEX summary', 'Resumen de BETTEX')}</h3><Tag>{L(STATUS[b.status])}</Tag><Tag>{L(DECISION[b.decision])}</Tag><Tag warn>{x('Demonstração visual', 'Visual demo', 'Demostración visual')}</Tag></div>
      <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4"><KV k={x('Pedidos de amostra', 'Sample requests', 'Pedidos de muestra')} v={REQUESTS.length} /><KV k={x('Decisões de amostra', 'Sample decisions', 'Decisiones de muestra')} v={DECISIONS.length} /><KV k={x('Último ciclo', 'Last cycle', 'Último ciclo')} v={date(b.completedAt)} /><KV k={x('Universo', 'Universe', 'Universo')} v="BTC / ETH / SOL" /></dl>
    </section>
    <section className="rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3" data-testid="bettex-config">
      <h3 className="flex items-center gap-2 font-bold"><Settings2 className="h-4 w-4 text-[#0A6657]" aria-hidden="true" />{x('Configuração', 'Configuration', 'Configuración')}</h3>
      <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3"><KV k={x('Modo', 'Mode', 'Modo')} v={x('Simulação, sem dinheiro real', 'Simulation, no real money', 'Simulación, sin dinero real')} /><KV k={x('Máx. por ordem', 'Max per order', 'Máx. por orden')} v={u(POLICY.maxOrder)} /><KV k={x('Máx. portfólio', 'Max portfolio', 'Máx. portafolio')} v={u(POLICY.maxPortfolio)} /><KV k={x('Autorização', 'Authorization', 'Autorización')} v={x('Humana para qualquer alocação', 'Human, for any allocation', 'Humana para cualquier asignación')} /><KV k={x('Frequência de ciclo', 'Cycle cadence', 'Frecuencia de ciclo')} v="60 s" /><KV k={x('Política', 'Policy', 'Política')} v={`${POLICY.version}`} /></dl>
      <button type="button" data-demo-action data-testid="button-bettex-config-save" onClick={onAction} className="mt-3 min-h-11 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white">{x('Salvar configuração', 'Save configuration', 'Guardar configuración')}</button>
    </section>
    <section className="rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3" data-testid="bettex-mandates">
      <h3 className="flex items-center gap-2 font-bold"><ScrollText className="h-4 w-4 text-[#0A6657]" aria-hidden="true" />{x('Mandatos', 'Mandates', 'Mandatos')}</h3>
      <div className="mt-2 flex flex-wrap gap-2" role="tablist">{MANDATES.map(k => <button key={k.id} type="button" role="tab" aria-selected={m === k.id} data-testid={`mandate-${k.id}`} onClick={() => setM(k.id)} className={`min-h-11 rounded-full px-4 text-sm font-bold ${m === k.id ? 'bg-[#0E7C6B] text-white' : 'border border-[#E4DCCB]'}`}>{L(k.who)}</button>)}</div>
      <p className="mt-2 text-sm" data-testid="mandate-text">{L(mand.text)}</p>
      <button type="button" data-demo-action data-testid="button-mandate-edit" onClick={onAction} className="mt-2 min-h-11 rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657]">{x('Editar mandato', 'Edit mandate', 'Editar mandato')}</button>
    </section>
    <p className="text-[11px] font-bold text-[#7A5410]">{L(SAMPLE_PROVENANCE)}</p>
  </>;
}
