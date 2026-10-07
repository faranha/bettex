/** @jsxImportSource react */
import type { ReactNode } from 'react';
import type { DemoRound, DemoTreasuryRound } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { useMoney } from '../demo/fin';
import { formatBrazilDateTime } from '../demo/brazil-time';

export function useRoundFmt() {
  const { x, loc } = useX(); const { num, fl } = useMoney();
  const NR = x('Não registrado', 'Not recorded', 'No registrado');
  const prec = (v: number) => Number(v.toFixed(2)) !== v ? 6 : 2;
  const usdc = (v: number | null | undefined, signed = false) => v == null ? NR : `${signed && v > 0 ? '+' : ''}${num(v, prec(v))} USDC`;
  const dt = (s: string | null | undefined) => s ? formatBrazilDateTime(s, fl, { dateStyle: 'medium', timeStyle: 'short' }) : NR;
  return { x, loc, num, fl, NR, usdc, dt };
}

export function Group({ title, children, note }: { title: string; children: ReactNode; note?: ReactNode }) {
  return <section className="min-w-0 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3">
    <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#8A641D]">{title}</h3>
    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">{children}</dl>
    {note && <p className="mt-2 text-xs text-[#5B6B85]">{note}</p>}
  </section>;
}
export function Fact({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return <div className={`min-w-0 ${wide ? 'col-span-2 sm:col-span-3' : ''}`}><dt className="text-xs text-[#5B6B85]">{label}</dt><dd className="mono break-words text-sm font-bold text-[#1B2A41]">{children}</dd></div>;
}

export function SnapshotFacts({ s, missing }: { s: DemoTreasuryRound | undefined; missing: boolean }) {
  const { x, NR, usdc, dt, fl } = useRoundFmt();
  if (!s) return <p role="status" data-testid="round-no-snapshot" className="rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-sm font-semibold text-[#6B3A10]">{missing ? x('Sem foto de tesouraria: valores financeiros desta rodada Não registrados. Cifras atuais nunca preenchem o passado.', 'No treasury snapshot: this round\'s financial figures are Not recorded. Current figures never fill in the past.', 'Sin foto de tesorería: las cifras financieras de esta ronda No registradas. Las cifras actuales nunca rellenan el pasado.') : NR}</p>;
  const f = s.feeBreakdown;
  return <div className="grid min-w-0 gap-2" data-testid="round-snapshot-facts">
    <Group title={x('Período', 'Period', 'Período')}>
      <Fact label={x('Início', 'Start', 'Inicio')}>{dt(s.startedAt)}</Fact><Fact label={x('Fim', 'End', 'Fin')}>{dt(s.endsAt)}</Fact>
      <Fact label={x('Cobertura', 'Coverage', 'Cobertura')}>{s.coverage === 'complete' ? x('Completa', 'Complete', 'Completa') : x('Parcial', 'Partial', 'Parcial')}</Fact></Group>
    <Group title={x('Ativos', 'Assets', 'Activos')} note={`${usdc(s.assetsUsdc)} = ${usdc(s.reserveUsdc)} + ${usdc(s.committedUsdc)} + ${usdc(s.availableUsdc)}`}>
      <Fact label={x('Abertura', 'Opening', 'Apertura')}>{usdc(s.openingAssetsUsdc)}</Fact><Fact label={x('Ativos', 'Assets', 'Activos')}>{usdc(s.assetsUsdc)}</Fact>
      <Fact label={x('Reserva protegida', 'Protected reserve', 'Reserva protegida')}>{usdc(s.reserveUsdc)}</Fact><Fact label={x('Capital de trabalho', 'Working capital', 'Capital de trabajo')}>{usdc(s.workingUsdc)}</Fact>
      <Fact label={x('Comprometido', 'Committed', 'Comprometido')}>{usdc(s.committedUsdc)}</Fact><Fact label={x('Livre', 'Free', 'Libre')}>{usdc(s.availableUsdc)}</Fact></Group>
    <Group title={x('Resultado', 'Result', 'Resultado')}>
      <Fact label={x('Realizado líquido', 'Realized net', 'Realizado neto')}>{usdc(s.realizedNetUsdc, true)}</Fact><Fact label={x('Não realizado', 'Unrealized', 'No realizado')}>{usdc(s.unrealizedUsdc, true)}</Fact>
      <Fact label={x('Custos de execução', 'Execution costs', 'Costos de ejecución')}>{usdc(s.executionCostsUsdc)}</Fact>
      <Fact label={x('Esperado nos compromissos', 'Expected on commitments', 'Esperado en compromisos')}>{usdc(s.expectedCommittedNetUsdc, true)}</Fact>
      <Fact label={x('Meta aprovada', 'Approved target', 'Meta aprobada')}>{s.targetNetUsdc == null ? x('Não definida', 'Not configured', 'No definida') : usdc(s.targetNetUsdc)}</Fact>
      <Fact label={x('Posições encerradas', 'Closed positions', 'Posiciones cerradas')}>{s.closedOperations == null ? NR : s.closedOperations.toLocaleString(fl)}</Fact></Group>
    <Group title={x('Tarifas do operador', 'Operator fees', 'Tarifas del operador')} note={`${x('Titular', 'Owner', 'Titular')}: ${x('Operadora privada', 'Private operator', 'Operadora privada')} · ${x('Registro desde', 'Tracked since', 'Registro desde')} ${dt(s.feeTrackingSince)}`}>
      <Fact label={x('Total', 'Total', 'Total')}>{usdc(s.feesCollectedUsdc)}</Fact>
      <Fact label={x('Saldo adicionado', 'Balance added', 'Saldo agregado')}>{usdc(f.onramp)}</Fact><Fact label={x('Troca', 'Swap', 'Cambio')}>{usdc(f.swap)}</Fact>
      <Fact label={x('Saque USDC', 'USDC withdrawal', 'Retiro USDC')}>{usdc(f.withdraw)}</Fact><Fact label={x('Envio', 'Send', 'Envío')}>{usdc(f.send)}</Fact>
      <Fact label={x('Transferência de rendimentos', 'Earnings transfer', 'Transferencia de ganancias')}>{usdc(f.transfer)}</Fact></Group>
    {s.coverage === 'partial' && <p className="text-xs font-semibold text-[#B4701A]">{x('Cobertura parcial: tarifas apenas desde o início do registro; custos e saldos anteriores não foram reconstruídos.', 'Partial coverage: fees only since tracking began; earlier costs and balances were not reconstructed.', 'Cobertura parcial: tarifas solo desde el inicio del registro; costos y saldos anteriores no se reconstruyeron.')}</p>}
  </div>;
}

export function ClosedFacts({ r }: { r: DemoRound }) {
  const { x, NR, usdc, dt, num } = useRoundFmt();
  const p = r.participationSnapshot;
  return <div className="grid gap-2" data-testid="round-closed-facts">
    <Group title={x('Encerramento', 'Closing', 'Cierre')}>
      <Fact label={x('Encerrada em', 'Ended at', 'Cerrada en')}>{dt(r.endedAt)}</Fact>
      <Fact label={x('Status', 'Status', 'Estado')}>{r.status === 'paid' ? x('Distribuída', 'Paid', 'Distribuida') : x('Retida', 'Retained', 'Retenida')}</Fact>
      <Fact label={x('Fonte', 'Source', 'Fuente')}>{r.source === 'seeded_demo' ? x('Exemplo pré-carregado', 'Preloaded example', 'Ejemplo precargado') : r.source ? x('Motor de demonstração', 'Demo engine', 'Motor de demostración') : NR}</Fact></Group>
    {r.source === 'seeded_demo' && <p className="text-xs font-semibold text-[#B4701A]">{x('Distribuição pré-carregada como exemplo ilustrativo, não é execução ao vivo.', 'Preloaded distribution for illustration, not live execution.', 'Distribución precargada como ejemplo ilustrativo, no es ejecución en vivo.')}</p>}
    <Group title={x('Distribuição', 'Distribution', 'Distribución')}>
      <Fact label={x('Lucro elegível', 'Eligible profit', 'Ganancia elegible')}>{usdc(r.eligibleUsdc)}</Fact><Fact label={x('Participação', 'Staking', 'Participación')}>{usdc(r.stakingUsdc)}</Fact>
      <Fact label={x('Tesouraria', 'Treasury', 'Tesorería')}>{usdc(r.treasuryUsdc)}</Fact><Fact label={x('Recompra', 'Buyback', 'Recompra')}>{usdc(r.buybackUsdc)}</Fact></Group>
    <Group title={x('Sua participação salva', 'Your saved participation', 'Tu participación guardada')}>
      {!p ? <Fact wide label={x('Participação', 'Participation', 'Participación')}>{NR}</Fact> : <>
        <Fact label={x('BETTEX elegíveis (seus)', 'Eligible BETTEX (own)', 'BETTEX elegibles (propios)')}>{num(p.ownEligibleTokens, 4)}</Fact><Fact label={x('BETTEX elegíveis (pool)', 'Eligible BETTEX (pool)', 'BETTEX elegibles (pool)')}>{num(p.totalEligibleTokens, 4)}</Fact>
        <Fact label={x('Token-segundos (seus)', 'Token-seconds (own)', 'Token-segundos (propios)')}>{num(p.ownTokenSeconds, 0)}</Fact><Fact label={x('Token-segundos (pool)', 'Token-seconds (pool)', 'Token-segundos (pool)')}>{num(p.totalTokenSeconds, 0)}</Fact>
        <Fact label={x('Fatia', 'Share', 'Cuota')}>{num(p.payoutSharePercent, 4)}%</Fact><Fact label={x('Recebido', 'Received', 'Recibido')}>{usdc(p.receivedUsdc)}</Fact>
        <Fact label={x('Início', 'Start', 'Inicio')}>{dt(p.startedAt)}</Fact><Fact label={x('Fim', 'End', 'Fin')}>{dt(p.endedAt)}</Fact></>}</Group>
  </div>;
}
