/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { Money } from './fin';
import { previousCycle } from './previous-cycle';
import { formatBrazilDateTime } from './brazil-time';

export function PreviousCycle({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const previous = previousCycle(d);
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const snapshot = previous?.round.participationSnapshot;
  const unavailable = x('Não registrado', 'Not recorded', 'No registrado');
  const number = (v: number) => v.toLocaleString(fl, { maximumFractionDigits: 4 });
  const row = (label: string, value: string, id: string) => <div className="min-w-0 rounded-xl bg-[#F5F1E8] p-3"><dt className="text-xs text-[#5B6B85]">{label}</dt><dd className="mt-1 break-words text-sm font-bold tabular-nums" data-testid={id}>{value}</dd></div>;
  return <section className="dcard grid gap-4 p-4 sm:p-5" data-testid="previous-cycle">
    <div className="flex flex-wrap items-center justify-between gap-3">
    <div><h3 className="display text-base font-extrabold">{x('Ciclo anterior', 'Previous cycle', 'Ciclo anterior')}</h3>
      {previous && <p className="mt-1 text-xs text-[#5B6B85]">{x('Encerrado em', 'Ended on', 'Cerrado el')} {formatBrazilDateTime(previous.round.endedAt, loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { dateStyle: 'medium' })}</p>}</div>
    {!previous ? <p className="text-sm text-[#5B6B85]">{x('Nenhum ciclo anterior registrado.', 'No previous cycle recorded.', 'Ningún ciclo anterior registrado.')}</p>
      : previous.received === null ? <p className="text-sm text-[#5B6B85]">{x('Sem crédito registrado para sua conta.', 'No credit recorded for your account.', 'Sin crédito registrado para tu cuenta.')}</p>
        : <div><p className="mb-1 text-xs font-semibold text-[#5B6B85]">{previous.received > 0 ? snapshot ? x('Você recebeu', 'You received', 'Recibiste') : x('Crédito registrado', 'Recorded credit', 'Crédito registrado') : x('Sem distribuição neste ciclo', 'No distribution this cycle', 'Sin distribución en este ciclo')}</p>
          <Money v={previous.received} a="USDC" big precision={snapshot || previous.received > 0 && previous.received < .01 ? 6 : 2} /></div>}
    </div>
    {previous && <>
      <p className="text-xs font-semibold text-[#5B6B85]">{previous.round.source === 'seeded_demo' ? x('Exemplo pré-carregado da demonstração', 'Preloaded demo example', 'Ejemplo precargado de la demostración') : x('Rodada simulada', 'Simulated round', 'Ronda simulada')}</p>
      <dl className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {row(x('Seus BETTEX em staking no encerramento', 'Your staked BETTEX at close', 'Tus BETTEX en staking al cierre'), snapshot ? `${number(snapshot.ownEligibleTokens)} BETTEX` : unavailable, 'previous-stake-mine')}
        {row(x('Total em staking no encerramento', 'Total staked at close', 'Total en staking al cierre'), snapshot ? `${number(snapshot.totalEligibleTokens)} BETTEX` : unavailable, 'previous-stake-total')}
        {row(x('Sua parte dos tokens no encerramento', 'Your token share at close', 'Tu parte de tokens al cierre'), snapshot && snapshot.totalEligibleTokens > 0 ? `${number(100 * snapshot.ownEligibleTokens / snapshot.totalEligibleTokens)}%` : unavailable, 'previous-stake-token-share')}
        {row(x('Lucro elegível desta rodada', 'Eligible profit for this round', 'Ganancia elegible de esta ronda'), snapshot ? `${number(previous.round.eligibleUsdc)} USDC` : unavailable, 'previous-cycle-profit')}
        {row(x('Alocação nominal ao pool (25%)', 'Nominal pool allocation (25%)', 'Asignación nominal al pool (25%)'), snapshot ? `${number(previous.round.stakingUsdc)} USDC` : unavailable, 'previous-cycle-allocation')}
        {row(x('Sua participação no pagamento, ponderada por tempo', 'Your time-weighted payout share', 'Tu participación en el pago, ponderada por tiempo'), snapshot ? `${number(snapshot.payoutSharePercent)}%` : unavailable, 'previous-payout-share')}
      </dl>
      {snapshot ? <div className="grid gap-2 text-xs text-[#5B6B85]" data-testid="previous-calculation">
        <p>{x('Peso próprio / peso total do pool (BETTEX × segundos)', 'Own weight / total pool weight (BETTEX × seconds)', 'Peso propio / peso total del pool (BETTEX × segundos)')}: <b>{number(snapshot.ownTokenSeconds)} / {number(snapshot.totalTokenSeconds)}</b></p>
        <p>{x('Pagamento = alocação do pool × peso próprio ÷ peso total, arredondado para baixo em unidades de USDC executáveis.', 'Payment = pool allocation × own weight ÷ total weight, rounded down to executable USDC units.', 'Pago = asignación del pool × peso propio ÷ peso total, redondeado hacia abajo en unidades ejecutables de USDC.')}</p>
        <p>{x('Os saldos acima são os do encerramento. Entradas, saídas e tempo elegível alteram o peso; saldo de hoje não reconstitui essa rodada.', 'The balances above are closing balances. Entries, exits and eligible time change the weight; today’s balance cannot reconstruct that round.', 'Los saldos anteriores son los del cierre. Entradas, salidas y tiempo elegible cambian el peso; el saldo de hoy no reconstruye esa ronda.')}</p>
        <p>{formatBrazilDateTime(snapshot.startedAt, fl)} → {formatBrazilDateTime(snapshot.endedAt, fl)}</p>
      </div> : <p className="rounded-xl bg-[#F0E9DA] p-3 text-xs text-[#5B6B85]" data-testid="previous-snapshot-unavailable">
        {previous.round.source === 'seeded_demo' ? x('Este crédito é um exemplo da demonstração, não um pagamento calculado com seu staking. Não há posição histórica que justifique esse valor.', 'This credit is a demo example, not a payment calculated from your stake. There is no historical position supporting this amount.', 'Este crédito es un ejemplo de la demostración, no un pago calculado con tu staking. No hay una posición histórica que justifique este importe.') : x('O cálculo histórico do staking não foi salvo. Não é possível confirmar quanto você ou o pool tinham em staking para receber esse valor. Os saldos atuais não substituem esse registro.', 'The historical staking calculation was not saved. We cannot confirm how much you or the pool had staked to receive this amount. Current balances cannot replace that record.', 'El cálculo histórico del staking no se guardó. No podemos confirmar cuánto tú o el pool tenían en staking para recibir este importe. Los saldos actuales no sustituyen ese registro.')}
      </p>}
    </>}
  </section>;
}