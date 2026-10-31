/** @jsxImportSource react */
import { useMemo, useState } from 'react';
import type { AgentId, DemoState, Operation } from './types';
import { ACTIVE, AGENTS, POLICY_STAGE, BUYBACK_STAGE, Chip, Panel, Stat, useX, Example } from './ui';

const MARKET_VIEW: Record<string, [string, string, string]> = {
  sports: ['Odds, coberturas e execução incompleta', 'Odds, hedges and incomplete execution', 'Cuotas, coberturas y ejecución incompleta'],
  predictions: ['Probabilidades, posição e resolução', 'Probabilities, position and resolution', 'Probabilidades, posición y resolución'],
  crypto: ['Cripto à vista, sem alavancagem', 'Spot crypto, no leverage', 'Cripto spot, sin apalancamiento'],
  bonus: ['Requisitos, progresso e custos do bônus', 'Bonus requirements, progress and costs', 'Requisitos, progreso y costos del bono'],
};
export function OperationDetail({ op, state }: { op: Operation; state: DemoState }) {
  const { x, tx, n } = useX();
  const expired = state.clock > op.quoteUntil;
  const a = AGENTS[op.agent];
  const progress = Math.min(100, Math.round((op.events.length / 5) * 100));
  return <Panel title={tx(op.title)} tag={op.id} id="operation-detail">
    <div className="flex flex-wrap items-center gap-2"><Chip status={op.status} /><span className="mono text-[11px]" style={{ color: a.color }}>{tx(a.name)}</span><span className="mono text-[11px] text-[#9AA9D6]">v{op.version}</span></div>
    {MARKET_VIEW[op.agent] && <p className="mt-2 text-xs text-[#8FA8F0]">{tx(MARKET_VIEW[op.agent] as never)}</p>}
    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
      <Stat label={x('Capital', 'Capital', 'Capital')} value={`${n(op.capital)}`} sub="USDC" />
      <Stat label={x('Resultado', 'Result', 'Resultado')} value={n(op.result)} accent={op.result < 0 ? '#E56B6B' : op.result > 0 ? '#6FE3A1' : undefined} sub="USDC" />
      <Stat label={x('Custos', 'Costs', 'Costos')} value={n(op.costs)} sub="USDC" />
      <Stat label={x('Validade da cotação', 'Quote validity', 'Validez de la cotización')} value={expired ? x('Vencida', 'Expired', 'Vencida') : `T+${op.quoteUntil}h`} accent={expired ? '#FF8A45' : '#36E0D0'} />
    </div>
    <p className="mt-3 text-sm"><b>{x('Motivo da decisão', 'Decision reason', 'Motivo de la decisión')}:</b> {tx(op.reason)}</p>
    <p className="mt-1 text-sm"><b>{x('Fonte', 'Source', 'Fuente')}:</b> {tx(op.source)}</p>
    <dl className="mt-3 grid gap-1.5 sm:grid-cols-2">{op.data.map((d, i) => <div key={i} className="flex justify-between gap-3 rounded-lg bg-[#070B1F]/70 px-3 py-1.5 text-xs"><dt className="text-[#8FA8F0]">{tx(d.label)}</dt><dd className="text-right font-bold">{tx(d.value)}</dd></div>)}</dl>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={x('Progresso das etapas', 'Stage progress', 'Progreso de etapas')}><div className="h-full" style={{ width: `${progress}%`, background: a.color }} /></div>
    <ol className="mt-3 grid gap-1.5 border-l border-white/15 pl-3">{op.events.map((e, i) => <li key={i} className="text-xs"><span className="mono text-[#9AA9D6]">T+{e.time}h </span><Chip status={e.status} /> <span className="ml-1">{tx(e.text)}</span></li>)}</ol>
    <p className="mt-3"><Example /></p>
  </Panel>;
}

export function useSelection(state: DemoState) {
  const [agent, setAgent] = useState<AgentId>('orchestrator');
  const [opId, setOpId] = useState<string | null>(null);
  const op = state.operations.find(o => o.id === opId) ?? null;
  const agentOps = useMemo(() => state.operations.filter(o => agent === 'orchestrator' || o.agent === agent), [state.operations, agent]);
  return { agent, setAgent, opId, setOpId, op, agentOps };
}
export function AgentView({ agent, state, opId, onOp }: { agent: AgentId; state: DemoState; opId: string | null; onOp: (id: string) => void }) {
  const { x, tx } = useX();
  const a = AGENTS[agent];
  const ops = state.operations.filter(o => agent === 'orchestrator' || o.agent === agent);
  return <Panel title={tx(a.name)} tag={tx(a.role)}>
    <AgentFlow agent={agent} state={state} />
    <div className="h-3" />
    {ops.length === 0 ? <p className="rounded-xl border border-dashed border-white/20 p-5 text-center text-sm text-[#9AA9D6]">{x('Sem operações deste agente neste ponto do cenário.', 'No operations from this agent at this scenario step.', 'Sin operaciones de este agente en este punto del escenario.')}</p>
      : <ul className="grid gap-2">{ops.map(o => <li key={o.id}><button type="button" aria-current={o.id === opId} onClick={() => onOp(o.id)} data-testid={`button-op-${o.id}`} className={`flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#36E0D0] ${o.id === opId ? 'border-[#36E0D0] bg-[#36E0D0]/10' : 'border-white/10 bg-[#070B1F]/60 hover:bg-white/5'}`}><span><span className="mono mr-2 text-[10px] text-[#9AA9D6]">{o.id}</span>{tx(o.title)}</span><Chip status={o.status} /></button></li>)}</ul>}
  </Panel>;
}
export const isActive = (o: Operation) => ACTIVE.includes(o.status);

export function agentActivity(state: DemoState, id: AgentId): { out: boolean; inn: boolean } {
  const ops = state.operations.filter(o => o.agent === id);
  if (id === 'treasury') return { out: state.treasury.committed > 0, inn: state.treasury.transit > 0 };
  if (id === 'buyback') return { out: ['analysis', 'authorized'].includes(state.buyback.stage), inn: ['purchased', 'authorized'].includes(state.buyback.stage) };
  if (id === 'governance') return { out: state.policy.stage !== 'active' || state.policy.paused, inn: state.policy.incident === 'detected' || state.policy.incident === 'contained' };
  return { out: ops.some(o => ['authorized', 'open', 'partial'].includes(o.status)), inn: ops.some(o => ['proposed', 'analyzing', 'uncertain'].includes(o.status)) };
}
export function AgentFlow({ agent, state }: { agent: AgentId; state: DemoState }) {
  const { x, tx } = useX();
  const ops = state.operations.filter(o => o.agent === agent);
  const has = (...st: string[]) => ops.some(o => st.includes(o.status));
  let steps: { l: string; on: boolean }[];
  if (agent === 'treasury') steps = [{ l: x('Reserva da proposta', 'Proposal reservation', 'Reserva de la propuesta'), on: state.treasury.committed > 0 }, { l: x('Checagem de reserva e liquidez', 'Reserve and liquidity check', 'Chequeo de reserva y liquidez'), on: state.treasury.reserve >= state.treasury.requiredReserve }, { l: x('Recursos em trânsito', 'Funds in transit', 'Recursos en tránsito'), on: state.treasury.transit > 0 }, { l: x('Conciliação', 'Reconciliation', 'Conciliación'), on: state.treasury.transit === 0 && state.step >= 6 }];
  else if (agent === 'buyback') { const order = ['accumulating', 'analysis', 'authorized', 'purchased', 'burned']; const i = order.indexOf(state.buyback.stage); steps = order.map((k, j) => ({ l: tx(BUYBACK_STAGE[k]), on: j <= i })); }
  else if (agent === 'governance') { const order = ['suggested', 'approved', 'waiting', 'active']; const i = order.indexOf(state.policy.stage); steps = order.map((k, j) => ({ l: tx(POLICY_STAGE[k]), on: j <= i })); }
  else if (agent === 'orchestrator') steps = [{ l: x('Recebe e prioriza', 'Receives and prioritizes', 'Recibe y prioriza'), on: ops.length > 0 || state.operations.length > 0 }, { l: x('Pede análise', 'Requests analysis', 'Pide análisis'), on: state.operations.some(o => o.status !== 'proposed') }, { l: x('Decide no mandato', 'Decides within mandate', 'Decide dentro del mandato'), on: state.operations.some(o => ['authorized', 'open', 'rejected', 'confirmed'].includes(o.status)) }, { l: x('Recebe confirmação', 'Receives confirmation', 'Recibe confirmación'), on: state.operations.some(o => ['confirmed', 'closed'].includes(o.status)) }];
  else steps = [{ l: x('Dado e fonte', 'Data and source', 'Dato y fuente'), on: ops.length > 0 }, { l: x('Inferência (sem ordens)', 'Inference (no orders)', 'Inferencia (sin órdenes)'), on: has('analyzing', 'authorized', 'open', 'partial', 'uncertain', 'confirmed', 'closed', 'rejected') }, { l: x('Risco e mandato', 'Risk and mandate', 'Riesgo y mandato'), on: has('authorized', 'open', 'partial', 'uncertain', 'confirmed', 'closed') }, { l: x('Conector externo', 'External connector', 'Conector externo'), on: has('open', 'partial', 'uncertain', 'confirmed', 'closed') }, { l: x('Confirmação', 'Confirmation', 'Confirmación'), on: has('confirmed', 'closed') }];
  return <ol className="mt-3 flex flex-wrap items-stretch gap-1" aria-label={x('Fluxo do agente', 'Agent flow', 'Flujo del agente')} data-testid="agent-flow">{steps.map((s, i) => <li key={i} className="flex items-center gap-1"><span className={`rounded-lg border px-2 py-1 text-[11px] ${s.on ? 'border-[#36E0D0] bg-[#36E0D0]/10' : 'border-white/15 text-[#9AA9D6]'}`}>{s.l}</span>{i < steps.length - 1 && <span aria-hidden="true" className="text-[#8FA8F0]">→</span>}</li>)}</ol>;
}
export function RefDetail({ reference, state }: { reference: string; state: DemoState }) {
  const { x, n, tx } = useX();
  const op = state.operations.find(o => o.id === reference);
  if (op) return <OperationDetail op={op} state={state} />;
  const m = state.movements.find(v => v.id === reference);
  if (m) return <Panel title={reference} tag={x('Movimento pessoal (somente seu histórico)', 'Personal movement (your history only)', 'Movimiento personal (solo su historial)')}><Chip status={m.status} /><p className="mono mt-2 text-xs">{n(m.amount)} {m.asset} · {x('tarifa', 'fee', 'tarifa')} {n(m.fee)} · T+{m.time}h</p></Panel>;
  const e = state.publicEvents.find(v => v.reference === reference);
  return <Panel title={reference} tag={x('Referência de exemplo, não é prova real', 'Example reference, not real proof', 'Referencia de ejemplo, no es prueba real')}><p className="text-sm">{e ? tx(e.text) : x('Sem detalhe vinculado a esta referência.', 'No detail linked to this reference.', 'Sin detalle vinculado a esta referencia.')}</p></Panel>;
}
