/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { History } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { Money } from './fin';
import { TreasuryTerm as Term } from './TreasuryHelp';
import { TreasuryRoundHeader } from './TreasuryRoundHeader';
import { AgentRoundAllocation } from './AgentRoundAllocation';
import { demoPath } from './demo-navigation';

const box = 'rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 sm:p-4';

function Metric({ id, label, tip, help, children }: { id?: string; label: string; tip: string; help: string; children: ReactNode }) {
  return <div data-testid={id} className={box}><p className="text-xs font-bold text-[#1B2A41]"><Term tip={tip}>{label}</Term></p><div className="mt-1">{children}</div><p className="mt-1.5 text-xs leading-snug text-[#5B6B85]">{help}</p></div>;
}

export function RoundSummary({ r, serverNow, showOperatorFees = false, headerAction }: { r: NonNullable<DemoDashboard['treasury']['currentRound']>; serverNow: string; showOperatorFees?: boolean; headerAction?: ReactNode }) {
  const { x } = useX();
  const prec = (v: number) => (v !== 0 && Math.abs(v) < .01 ? 6 : 2);
  const NR = x('Não registrado', 'Not recorded', 'No registrado');
  const U = (v: number | null | undefined, signed = false) => v == null ? <span className="text-sm font-bold text-[#5B6B85]">{NR}</span> : <Money v={v} a="USDC" signed={signed} precision={prec(v)} />;
  return <>
    <p className="mb-2 text-xs font-semibold text-[#8A641D]">{x('Roteiro predefinido do demo · 16h às 16h, horário de São Paulo · histórico modelado e fixo.', 'Predefined demo storyline · 16:00–16:00 São Paulo time · fixed modeled history.', 'Guion predefinido del demo · 16:00–16:00, hora de São Paulo · historial modelado y fijo.')}</p>
    <TreasuryRoundHeader round={r} serverNow={serverNow} action={headerAction} />
    <AgentRoundAllocation r={r} />
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <Metric id="treasury-round-realized" label={x('Realizado líquido', 'Realized net', 'Realizado neto')} tip={x('Resultado já liquidado desta rodada, depois dos custos de execução.', 'Settled result of this round after execution costs.', 'Resultado liquidado de esta ronda tras costos de ejecución.')} help={x('Só posições liquidadas nesta rodada. Exclui tarifas do operador. Base do lucro elegível.', 'Only positions settled this round. Excludes operator fees. Basis of eligible profit.', 'Solo posiciones liquidadas en esta ronda. Excluye tarifas del operador. Base de la ganancia elegible.')}><Money v={r.realizedNetUsdc} a="USDC" big signed precision={prec(r.realizedNetUsdc)} /></Metric>
      <Metric label={x('Não realizado', 'Unrealized', 'No realizado')} tip={x('Indicação de posições ainda abertas.', 'Indication from still-open positions.', 'Indicación de posiciones aún abiertas.')} help={x('Apenas indicação: não pode ser distribuído.', 'Indication only: it cannot be distributed.', 'Solo indicación: no se puede distribuir.')}><Money v={r.unrealizedUsdc} a="USDC" signed /></Metric>
      <Metric label={x('Meta da rodada', 'Round target', 'Meta de la ronda')} tip={x('Meta líquida aprovada para a rodada, se existir.', 'Approved net target for the round, if any.', 'Meta neta aprobada para la ronda, si existe.')} help={r.targetNetUsdc == null ? x('Nenhuma meta aprovada configurada.', 'No approved target configured.', 'Ninguna meta aprobada configurada.') : x('Meta aprovada fixa.', 'Fixed approved target.', 'Meta aprobada fija.')}>{r.targetNetUsdc == null ? <span className="text-sm font-bold">{x('Sem meta aprovada', 'No approved target', 'Sin meta aprobada')}</span> : <Money v={r.targetNetUsdc} a="USDC" />}</Metric>
      <Metric label={x('Esperado nas posições comprometidas', 'Expected on committed positions', 'Esperado en posiciones comprometidas')} tip={x('Soma das estimativas líquidas das propostas dos agentes.', 'Sum of the agents’ proposal net estimates.', 'Suma de las estimaciones netas de las propuestas de los agentes.')} help={x('Estimativa dos agentes. Não é meta nem garantida.', 'Agents’ estimate. Not a target, not guaranteed.', 'Estimación de agentes. No es meta ni garantizada.')}><Money v={r.expectedCommittedNetUsdc} a="USDC" signed /></Metric>
      <Metric label={x('Custos de execução', 'Execution costs', 'Costos de ejecución')} tip={x('Custos pagos para executar as posições.', 'Costs paid to execute positions.', 'Costos pagados para ejecutar las posiciones.')} help={x('Já descontados do realizado líquido.', 'Already deducted from realized net.', 'Ya descontados del realizado neto.')}>{U(r.executionCostsUsdc)}</Metric>
      <Metric label={x('Posições encerradas', 'Closed positions', 'Posiciones cerradas')} tip={x('Quantas posições liquidaram nesta rodada.', 'How many positions settled this round.', 'Cuántas posiciones liquidaron en esta ronda.')} help={x('Contagem registrada na rodada.', 'Count recorded in the round.', 'Conteo registrado en la ronda.')}><span className="display text-xl font-extrabold">{r.closedOperations ?? NR}</span></Metric>
    </div>
    {showOperatorFees && <div className="mt-3" data-testid="treasury-fees">
      <Metric id="treasury-round-fees" label={x('Tarifas da operadora', 'Operator fees', 'Tarifas de la operadora')} tip={x('Total de tarifas confirmadas nesta rodada.', 'Total confirmed fees this round.', 'Total de tarifas confirmadas en esta ronda.')} help={x('Receita da operadora, separada dos ativos e do lucro da Tesouraria.', 'Operator revenue, separate from Treasury assets and profit.', 'Ingreso de la operadora, separado de los activos y la ganancia de Tesorería.')}>{U(r.feesCollectedUsdc)}</Metric>
    </div>}
    <p className="mt-3 rounded-xl bg-[#F5F1E8] p-3 text-xs leading-relaxed text-[#5B6B85]" data-testid="treasury-distribution-note">{x('O realizado líquido de investimentos é a fonte do lucro elegível. Só há split com resultado positivo, reservas, liquidez e elegibilidade atendidas: 50% tesouraria, 25% participação e 25% recompra. O demo não cobra taxas; no ALFA estão previstos apenas custos de rede.', 'Realized net investment profit is the source of eligible profit. A split requires a positive result, adequate reserves and liquidity, and eligibility: 50% treasury, 25% participation and 25% buyback. The demo charges no fees; only network costs are planned for ALFA.', 'El resultado neto realizado de inversiones es la fuente de la ganancia elegible. El reparto exige resultado positivo, reservas, liquidez y elegibilidad: 50% tesorería, 25% participación y 25% recompra. El demo no cobra tarifas; en ALFA solo se prevén costes de red.')}</p>
    {r.coverage === 'partial' && <p className="mt-2 text-xs font-semibold text-[#B4701A]">{x('Cobertura parcial: atividades anteriores ao registro detalhado não têm detalhes por posição. Os registros disponíveis ficam no Histórico.', 'Partial coverage: activity before detailed tracking lacks per-position details. Available records are in History.', 'Cobertura parcial: las actividades anteriores al registro detallado no tienen detalles por posición. Los registros disponibles están en Historial.')}</p>}
  </>;
}

export function TreasuryCycle({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const r = d.treasury.currentRound;
  const historyLabel = x('Pesquisar rodadas anteriores no Histórico', 'Find previous rounds in History', 'Buscar rondas anteriores en Historial');
  const historyLink = <Link href={`${demoPath('wallet', loc)}#round-archive`} data-testid="link-treasury-round-history" aria-label={historyLabel} title={historyLabel} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D8CFBB] bg-[#FFFCF6] text-[#1B2A41] transition-colors hover:border-[#C9A24A] hover:bg-[#F0E9DA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]"><History className="h-5 w-5" aria-hidden="true" /></Link>;
  if (!r) return <section data-testid="treasury-cycle" className="dcard p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm text-[#5B6B85]">{x('Detalhes da rodada atual indisponíveis agora.', 'Current round details are unavailable right now.', 'Detalles de la ronda actual no disponibles ahora.')}</p>{historyLink}</div></section>;
  return <section data-testid="treasury-cycle" className="dcard p-4 sm:p-5">
    <RoundSummary r={r} serverNow={d.serverNow} showOperatorFees headerAction={historyLink} />
  </section>;
}
