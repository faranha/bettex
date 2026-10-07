/** @jsxImportSource react */
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { AGENTS, useX } from './ui';
import { Money, Term, useMoney } from './fin';
import { formatBrazilDateTime } from './brazil-time';
import { TreasuryActivity } from './TreasuryActivity';

const ACTIVE = ['approved', 'validated', 'executing', 'open', 'result', 'reconciling'];
const TABS = ['fees', 'committed', 'closed', 'history'] as const;
type Tab = typeof TABS[number];
const box = 'rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 sm:p-4';

function Metric({ id, label, tip, help, children }: { id?: string; label: string; tip: string; help: string; children: ReactNode }) {
  return <div data-testid={id} className={box}><p className="text-xs font-bold text-[#1B2A41]"><Term tip={tip}>{label}</Term></p><div className="mt-1">{children}</div><p className="mt-1.5 text-xs leading-snug text-[#5B6B85]">{help}</p></div>;
}

export function RoundSummary({ r, serverNow }: { r: NonNullable<DemoDashboard['treasury']['currentRound']>; serverNow: string }) {
  const { x, loc } = useX(); const { num } = useMoney(); void num;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const dt = (s: string) => formatBrazilDateTime(s, fl, { dateStyle: 'medium', timeStyle: 'short' });
  const prec = (v: number) => (v !== 0 && Math.abs(v) < .01 ? 6 : 2);
  const NR = x('Não registrado', 'Not recorded', 'No registrado');
  const U = (v: number | null | undefined, signed = false) => v == null ? <span className="text-sm font-bold text-[#5B6B85]">{NR}</span> : <Money v={v} a="USDC" signed={signed} precision={prec(v)} />;
  const left = Math.max(0, Date.parse(r.endsAt) - Date.parse(serverNow));
  const hrs = Math.floor(left / 3600000); const mins = Math.floor((left % 3600000) / 60000);
  return <>
    <p className="mb-2 text-xs font-semibold text-[#8A641D]">{x('Roteiro predefinido do demo · 16h às 16h, horário de São Paulo · histórico modelado e fixo.', 'Predefined demo storyline · 16:00–16:00 São Paulo time · fixed modeled history.', 'Guion predefinido del demo · 16:00–16:00, hora de São Paulo · historial modelado y fijo.')}</p>
    <h2 className="display text-lg font-extrabold">{x('Rodada atual', 'Current round', 'Ronda actual')} <span className="mono text-xs font-semibold text-[#5B6B85]">{r.id}</span></h2>
    <p className="text-xs text-[#5B6B85]">{dt(r.startedAt)} → {dt(r.endsAt)} · {x('Horário do Brasil', 'Brazil time', 'Horario de Brasil')} · {x(`faltam ${hrs} h ${mins} min`, `${hrs} h ${mins} min left`, `faltan ${hrs} h ${mins} min`)}</p>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <Metric id="treasury-round-realized" label={x('Realizado líquido', 'Realized net', 'Realizado neto')} tip={x('Resultado já liquidado desta rodada, depois dos custos de execução.', 'Settled result of this round after execution costs.', 'Resultado liquidado de esta ronda tras costos de ejecución.')} help={x('Só posições liquidadas nesta rodada. Exclui tarifas do operador. Base do lucro elegível.', 'Only positions settled this round. Excludes operator fees. Basis of eligible profit.', 'Solo posiciones liquidadas en esta ronda. Excluye tarifas del operador. Base de la ganancia elegible.')}><Money v={r.realizedNetUsdc} a="USDC" big signed precision={prec(r.realizedNetUsdc)} /></Metric>
      <Metric label={x('Não realizado', 'Unrealized', 'No realizado')} tip={x('Indicação de posições ainda abertas.', 'Indication from still-open positions.', 'Indicación de posiciones aún abiertas.')} help={x('Apenas indicação: não pode ser distribuído.', 'Indication only: it cannot be distributed.', 'Solo indicación: no se puede distribuir.')}><Money v={r.unrealizedUsdc} a="USDC" signed /></Metric>
      <Metric label={x('Meta da rodada', 'Round target', 'Meta de la ronda')} tip={x('Meta líquida aprovada para a rodada, se existir.', 'Approved net target for the round, if any.', 'Meta neta aprobada para la ronda, si existe.')} help={r.targetNetUsdc == null ? x('Nenhuma meta aprovada configurada.', 'No approved target configured.', 'Ninguna meta aprobada configurada.') : x('Meta aprovada fixa.', 'Fixed approved target.', 'Meta aprobada fija.')}>{r.targetNetUsdc == null ? <span className="text-sm font-bold">{x('Sem meta aprovada', 'No approved target', 'Sin meta aprobada')}</span> : <Money v={r.targetNetUsdc} a="USDC" />}</Metric>
      <Metric label={x('Esperado nas posições comprometidas', 'Expected on committed positions', 'Esperado en posiciones comprometidas')} tip={x('Soma das estimativas líquidas das propostas dos agentes.', 'Sum of the agents’ proposal net estimates.', 'Suma de las estimaciones netas de las propuestas de los agentes.')} help={x('Estimativa dos agentes. Não é meta nem garantida.', 'Agents’ estimate. Not a target, not guaranteed.', 'Estimación de agentes. No es meta ni garantizada.')}><Money v={r.expectedCommittedNetUsdc} a="USDC" signed /></Metric>
      <Metric label={x('Custos de execução', 'Execution costs', 'Costos de ejecución')} tip={x('Custos pagos para executar as posições.', 'Costs paid to execute positions.', 'Costos pagados para ejecutar las posiciones.')} help={x('Já descontados do realizado líquido.', 'Already deducted from realized net.', 'Ya descontados del realizado neto.')}>{U(r.executionCostsUsdc)}</Metric>
      <Metric label={x('Posições encerradas', 'Closed positions', 'Posiciones cerradas')} tip={x('Quantas posições liquidaram nesta rodada.', 'How many positions settled this round.', 'Cuántas posiciones liquidaron en esta ronda.')} help={x('Contagem registrada na rodada.', 'Count recorded in the round.', 'Conteo registrado en la ronda.')}><span className="display text-xl font-extrabold">{r.closedOperations ?? NR}</span></Metric>
    </div>
    <p className="mt-3 rounded-xl bg-[#F5F1E8] p-3 text-xs leading-relaxed text-[#5B6B85]" data-testid="treasury-distribution-note">{x('O realizado líquido de investimentos é a fonte do lucro elegível. Só se o resultado for positivo e a reserva estiver protegida, ele se divide em 50% tesouraria, 25% participação e 25% recompra. Tarifas do operador ficam fora.', 'Investment realized net is the source of eligible profit. Only if the result is positive and the reserve is protected, it splits 50% treasury, 25% staking and 25% buyback. Operator fees are excluded.', 'El neto realizado de inversiones es la fuente de la ganancia elegible. Solo si el resultado es positivo y la reserva está protegida, se divide 50% tesorería, 25% participación y 25% recompra. Las tarifas del operador quedan fuera.')}</p>
    {r.coverage === 'partial' && <p className="mt-2 text-xs font-semibold text-[#B4701A]">{x('Cobertura parcial: atividade migrada anterior não tem detalhe por posição; o que foi capturado desde o registro detalhado aparece nas abas.', 'Partial coverage: earlier migrated activity lacks per-position detail; what was captured since detailed tracking began appears in the tabs.', 'Cobertura parcial: la actividad migrada anterior carece de detalle por posición; lo capturado desde el registro detallado aparece en las pestañas.')}</p>}
  </>;
}

export function TreasuryCycle({ d }: { d: DemoDashboard }) {
  const { x, tx, loc } = useX(); const { num } = useMoney();
  const [tab, setTab] = useState<Tab>('closed');
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const r = d.treasury.currentRound;
  if (!r) return <section data-testid="treasury-cycle" className="dcard p-5"><p className="text-sm text-[#5B6B85]">{x('Detalhes da rodada atual indisponíveis agora.', 'Current round details are unavailable right now.', 'Detalles de la ronda actual no disponibles ahora.')}</p></section>;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const dt = (s: string) => formatBrazilDateTime(s, fl, { dateStyle: 'medium', timeStyle: 'short' });
  const prec = (v: number) => (v !== 0 && Math.abs(v) < .01 ? 6 : 2);
  const NR = x('Não registrado', 'Not recorded', 'No registrado');
  const U = (v: number | null | undefined, signed = false) => v == null ? <span className="text-sm font-bold text-[#5B6B85]">{NR}</span> : <Money v={v} a="USDC" signed={signed} precision={prec(v)} />;
  const active = d.operations.filter(o => ACTIVE.includes(o.status));
  const roundStart = Date.parse(r.startedAt);
  const label: Record<Tab, string> = { fees: x('Tarifas do operador', 'Operator fees', 'Tarifas del operador'), committed: x('Posições comprometidas', 'Committed positions', 'Posiciones comprometidas'), closed: x('Posições encerradas', 'Closed positions', 'Posiciones cerradas'), history: x('Histórico do ciclo', 'Cycle history', 'Historial del ciclo') };
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = e.key === 'ArrowRight' ? (i + 1) % 4 : e.key === 'ArrowLeft' ? (i + 3) % 4 : e.key === 'Home' ? 0 : e.key === 'End' ? 3 : -1;
    if (n < 0) return; e.preventDefault(); setTab(TABS[n]); refs.current[TABS[n]]?.focus();
  };
  const agent = (id: string) => { const a = (AGENTS as Record<string, { name: readonly [string, string, string] }>)[id]; return a ? tx(a.name) : id; };
  const ost = (s: string) => ({ approved: x('Aprovada', 'Approved', 'Aprobada'), validated: x('Validada', 'Validated', 'Validada'), executing: x('Executando', 'Executing', 'Ejecutando'), open: x('Aberta', 'Open', 'Abierta'), result: x('Resultado', 'Result', 'Resultado'), reconciling: x('Conciliando', 'Reconciling', 'Conciliando') } as Record<string, string>)[s] ?? s;
  const feeHead = <div data-testid="treasury-fees">
    <p className="mt-1 text-xs leading-relaxed text-[#5B6B85]">{x('Receita do serviço da empresa operadora, fora dos ativos da tesouraria e do lucro distribuível. Taxa atual: 2,50 USDC por transação; depósitos USDC/BETTEX gratuitos. O histórico preserva as cobranças anteriores.', 'Operating company service revenue, excluded from treasury assets and distributable profit. Current fee: 2.50 USDC per transaction; USDC/BETTEX deposits are free. History preserves previous charges.', 'Ingreso de servicio de la operadora, fuera de los activos de tesorería y la ganancia distribuible. Tarifa actual: 2,50 USDC por transacción; depósitos USDC/BETTEX gratuitos. El historial conserva cargos anteriores.')}</p>
    <div className="mt-2"><Metric label={x('Tarifas coletadas', 'Fees collected', 'Tarifas recaudadas')} tip={x('Tarifas de operações simuladas confirmadas nesta rodada.', 'Fees from confirmed simulated operations this round.', 'Tarifas de operaciones simuladas confirmadas en esta ronda.')} help={x('Titular: empresa operadora. Nunca soma aos ativos.', 'Owner: operating company. Never added to assets.', 'Titular: empresa operadora. Nunca suma a los activos.')}>{U(r.feesCollectedUsdc)}</Metric></div>
    {r.feesCollectedUsdc != null && <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">{([['onramp', x('Saldo adicionado', 'Balance added', 'Saldo agregado')], ['swap', x('Troca', 'Swap', 'Cambio')], ['withdraw', x('Saque USDC', 'USDC withdrawal', 'Retiro USDC')], ['send', x('Envio', 'Send', 'Envío')]] as const).map(([k, l]) => <div key={k}><dt className="text-[#5B6B85]">{l}</dt><dd className="font-bold">{num(r.feeBreakdown[k], r.feeBreakdown[k] !== 0 ? 6 : 2)} USDC</dd></div>)}</dl>}
    <p className="mt-2 text-xs text-[#5B6B85]">{x('Transferências de rendimentos', 'Earnings transfers', 'Transferencias de ganancias')}: {num(r.feeBreakdown.transfer ?? 0, 2)} USDC</p>
    <p className="mt-2 text-xs text-[#5B6B85]">{x('Registro desde', 'Tracked since', 'Registro desde')}: {r.feeTrackingSince ? dt(r.feeTrackingSince) : NR}</p></div>;
  const histHead = <p className="mt-1 text-xs leading-relaxed text-[#5B6B85]">{x('Abertura, posições encerradas e tarifas do roteiro predefinido, do mais novo ao mais antigo. Os eventos aparecem no horário programado; ações feitas por você continuam registradas separadamente.', 'Opening balance, closed positions and fees from the predefined storyline, newest first. Events appear at their scheduled times; your own actions remain separately recorded.', 'Apertura, posiciones cerradas y tarifas del guion predefinido, de la más nueva a la más antigua. Los eventos aparecen a su hora programada; tus acciones siguen registradas por separado.')}</p>;
  return <section data-testid="treasury-cycle" className="dcard p-4 sm:p-5">
    <RoundSummary r={r} serverNow={d.serverNow} />
    <div role="tablist" aria-label={x('Atividade da rodada', 'Round activity', 'Actividad de la ronda')} className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-[#F0E9DA] p-1 md:grid-cols-4">
      {TABS.map((t, i) => <button key={t} ref={el => { refs.current[t] = el; }} type="button" role="tab" id={`tc-tab-${t}`} data-testid={`treasury-tab-${t}`} aria-selected={tab === t} aria-controls={`tc-panel-${t}`} tabIndex={tab === t ? 0 : -1} onClick={() => setTab(t)} onKeyDown={e => onKey(e, i)} className={`min-h-11 rounded-xl px-2 text-xs font-bold leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] sm:text-sm ${tab === t ? 'bg-[#FFFCF6] text-[#0A6657] shadow-sm' : 'text-[#5B6B85]'}`}>{label[t]}</button>)}
    </div>
    <div role="tabpanel" id={`tc-panel-${tab}`} aria-labelledby={`tc-tab-${tab}`} tabIndex={0} className="mt-3">
      {tab === 'committed' ? <div data-testid="treasury-positions">
        <p className="text-xs text-[#5B6B85]">{x('Posições do roteiro que estão em andamento neste ponto da rodada de 16h às 16h.', 'Storyline positions in progress at this point in the 16:00–16:00 round.', 'Posiciones del guion en curso en este punto de la ronda de 16:00 a 16:00.')}</p>
        {!active.length ? <p className="mt-3 rounded-xl bg-[#F5F1E8] p-3 text-sm text-[#5B6B85]">{x('Nenhuma posição ativa agora.', 'No active positions now.', 'Ninguna posición activa ahora.')}</p> :
          <ul className="mt-3 divide-y divide-[#EBE3D1]">{active.map(o => { const inh = Date.parse(o.updatedAt) < roundStart && (!o.proposal || Date.parse(o.proposal.generatedAt) < roundStart); return <li key={o.id} data-testid={`treasury-position-${o.id}`} className="grid gap-1 py-3 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-center">
            <div className="min-w-0"><p className="text-sm font-bold">{agent(o.agent)} <span className="rounded-full bg-[#DDEBE4] px-2 text-xs font-semibold text-[#0A6657]">{ost(o.status)}</span>{inh && <span className="ml-1 rounded-full bg-[#F0E9DA] px-2 text-xs font-semibold text-[#5B6B85]">{x('herdada', 'inherited', 'heredada')}</span>}</p><p className="mono break-all text-[11px] text-[#5B6B85]">{o.id} · {o.market}</p></div>
            <div className="text-xs text-[#5B6B85]">{x('Capital', 'Capital', 'Capital')}<br /><Money v={o.capitalUsdc} a="USDC" /></div>
            <div className="text-xs text-[#5B6B85]">{x('Esperado (estimativa)', 'Expected (estimate)', 'Esperado (estimación)')}<br />{o.proposal ? <Money v={o.proposal.expectedNetUsdc} a="USDC" signed /> : <b>{NR}</b>}</div></li>; })}</ul>}
      </div> : <TreasuryActivity d={d} roundId={r.id} view={tab} header={tab === 'fees' ? feeHead : tab === 'history' ? histHead : undefined} />}
    </div>
  </section>;
}
