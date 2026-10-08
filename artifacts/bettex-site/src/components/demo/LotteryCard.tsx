/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { History, Landmark } from 'lucide-react';
import { getGetDemoDashboardQueryKey, useUpdateDemoLotteryParticipation, type DemoDashboard } from '@workspace/api-client-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { burnFl, nf } from './burn-format';
import { WalletHelp } from './WalletHelp';
import { formatBrazilDateTime } from './brazil-time';
import { demoLotteryPreviewBalance } from './lottery-balance';
import { LotteryEntries } from './LotteryEntries';
import { BurnLotteryFlame } from './BurnLotteryArt';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { WalletCardDetails } from './WalletCardDetails';

function useCountdown(target: string, serverNow: string) {
  const [offset, setOffset] = useState(() => Date.parse(serverNow) - Date.now());
  useEffect(() => { const o = Date.parse(serverNow) - Date.now(); if (Number.isFinite(o)) setOffset(o); }, [serverNow]);
  const [, tick] = useState(0);
  useEffect(() => { const i = setInterval(() => tick(v => v + 1), 1000); return () => clearInterval(i); }, []);
  const ms = Date.parse(target) - (Date.now() + (Number.isFinite(offset) ? offset : 0));
  if (!Number.isFinite(ms)) return null;
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export function LotteryCard({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const fl = burnFl(loc);
  const qc = useQueryClient();
  const m = useUpdateDemoLotteryParticipation();
  const [open, setOpen] = useState(false);
  const lot = d.profile.provider === 'native' ? undefined : d.lottery;
  const left = useCountdown(lot?.nextDrawAt ?? '', d.serverNow);
  const roundBalance = demoLotteryPreviewBalance(d.treasury.currentRound?.realizedNetUsdc);
  if (!lot) return null;
  const drawTime = Number.isFinite(Date.parse(lot.nextDrawAt))
    ? formatBrazilDateTime(lot.nextDrawAt, fl, { hour: '2-digit', minute: '2-digit' })
    : x('Indisponível', 'Unavailable', 'No disponible');
  const ownN = lot.ownActiveNumbers, totalN = lot.totalActiveNumbers, pct = lot.numberSharePercent;
  const historyLabel = x('Histórico da loteria', 'Lottery history', 'Historial de la lotería');
  const historyParams = new URLSearchParams({ roundTab: 'lottery' });
  if (d.treasury.currentRound) historyParams.set('round', d.treasury.currentRound.id);
  const send = (participating: boolean, confirmed: boolean) => m.mutate({ data: { participating, confirmed } }, {
    onSuccess: snap => { qc.setQueryData(getGetDemoDashboardQueryKey(), snap); void qc.invalidateQueries({ queryKey: getGetDemoDashboardQueryKey() }); setOpen(false); },
  });
  const onToggle = () => { if (m.isPending) return; if (lot.participating) send(false, false); else { m.reset(); setOpen(true); } };
  const btn = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm font-bold text-[#1B2A41] disabled:opacity-50';
  return <div className="bl-card flex flex-col gap-3" data-testid="lottery-card">
    <div className="flex items-center gap-3">
      <BurnLotteryFlame lit={lot.participating} />
      <div className="min-w-0 flex-1">
        <h4 className="display text-lg font-extrabold leading-tight text-[#F4F1E8]"><WalletHelp id="lottery" label={x('Loteria de queima', 'Burn Lottery', 'Lotería de quema')}>
          <p>{x('Participação opcional na loteria simulada de recompra e queima. O sorteio pode selecionar BETTEX elegíveis para compra por 2× a cotação, com pagamento em USDC. Não há garantia de seleção ou de pagamento. Os botões à direita abrem a Tesouraria e o histórico de sorteios.', 'Optional participation in the simulated buyback-and-burn lottery. The draw may select eligible BETTEX for purchase at 2× the quoted price, paying USDC. Selection or payment is not guaranteed. The buttons on the right open Treasury and draw history.', 'Participación opcional en la lotería simulada de recompra y quema. El sorteo puede seleccionar BETTEX elegibles para comprarlos a 2× la cotización, pagando USDC. La selección o el pago no están garantizados. Los botones a la derecha abren Tesorería y el historial de sorteos.')}</p>
        </WalletHelp></h4>
        <div className="text-xs text-[#C5D2F1]" data-testid="lottery-next-draw"><WalletHelp id="lottery-time" label={x('Próximo sorteio', 'Next draw', 'Próximo sorteo')}>
          <p>{x('Contagem até o próximo sorteio programado. O horário é de São Paulo e os sorteios são diários. Chegar ao horário não garante que sua carteira seja selecionada; consulte o resultado no histórico.', 'Countdown to the next scheduled draw. Times use São Paulo time and draws are daily. Reaching the draw time does not guarantee your wallet is selected; check results in history.', 'Cuenta atrás hasta el próximo sorteo programado. Los horarios son de São Paulo y los sorteos son diarios. Llegar a la hora no garantiza que se seleccione tu cartera; consulta el resultado en el historial.')}</p>
        </WalletHelp> ({drawTime} · São Paulo · 24h)</div>
        <p className="bl-timer display text-3xl font-extrabold" data-testid="lottery-timer">{left ?? x('Indisponível', 'Unavailable', 'No disponible')}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1 self-start">
        <Link href={demoPath('treasury', loc)} data-testid="link-burned-treasury" aria-label={x('Ver Tesouraria', 'View Treasury', 'Ver Tesorería')} title={x('Ver Tesouraria', 'View Treasury', 'Ver Tesorería')} className="bl-hist focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#AAC3EE]"><Landmark className="h-5 w-5" aria-hidden="true" /></Link>
        <Link href={`${demoPath('wallet', loc)}?${historyParams.toString()}#rh-panel-lottery`} data-testid="link-lottery-history" aria-label={historyLabel} title={historyLabel} className="bl-hist focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#AAC3EE]"><History className="h-5 w-5" aria-hidden="true" /></Link>
      </div>
    </div>
    <div className="bl-ticket" data-testid="lottery-round-balance" data-round-id={d.treasury.currentRound?.id}>
      <div className="text-xs font-bold text-[#7A3A06]"><WalletHelp id="lottery-budget" label={x('Verba demonstrativa da loteria', 'Illustrative lottery budget', 'Presupuesto ilustrativo de la lotería')}>
        <p>{x('Verba ilustrativa do demo: mínimo de 500 USDC simulados, ou 25% do lucro líquido positivo da rodada quando esse valor for maior. Não é caixa disponível para o sorteio, saldo pessoal nem prêmio garantido. A alocação financeira e o orçamento usado nas compras permanecem separados e não são alterados por este valor demonstrativo.', 'Illustrative demo budget: at least 500 simulated USDC, or 25% of the round’s positive net profit when higher. Not available draw cash, a personal balance or a guaranteed prize. Financial allocation and the budget used for purchases remain separate and are not changed by this illustrative amount.', 'Presupuesto ilustrativo del demo: mínimo de 500 USDC simulados, o 25% de la ganancia neta positiva de la ronda si es mayor. No es efectivo disponible para el sorteo, saldo personal ni premio garantizado. La asignación financiera y el presupuesto de compras permanecen separados y no cambian por este importe ilustrativo.')}</p>
      </WalletHelp></div>
      <p className="display mt-1 break-words text-2xl font-extrabold tabular-nums text-[#070B1F]" data-testid="lottery-usdc-balance">{roundBalance === null ? x('Indisponível', 'Unavailable', 'No disponible') : <>{nf(fl, roundBalance)} <span className="mono text-[0.55em]">USDC</span></>}</p>
    </div>
    <WalletCardDetails id="lottery" dark label={x('Detalhes da loteria de queima', 'Burn Lottery details', 'Detalles de la lotería de quema')}>
    <div className="grid min-w-0 gap-1.5" data-testid="lottery-explanation">
      <p className="text-sm leading-relaxed text-[#F4F1E8]">{x(
        'Todo dia, o sorteio pode comprar seus BETTEX em stake por 2× o preço cotado. Você recebe USDC, e os tokens comprados são queimados.',
        'Each day, the draw can buy your staked BETTEX for 2× the quoted price. You receive USDC, and the bought tokens are burned.',
        'Cada día, el sorteo puede comprar tus BETTEX en stake por 2× el precio cotizado. Recibes USDC y los tokens comprados se queman.',
      )}</p>
    </div>
    <label className={`bl-join ${lot.participating ? 'is-on' : ''} ${m.isPending || (!lot.participating && !lot.eligible) ? 'is-disabled' : ''}`}>
      <input type="checkbox" checked={lot.participating} disabled={m.isPending || (!lot.participating && !lot.eligible)} onChange={onToggle} data-testid="lottery-participation-checkbox" className="bl-check" />
      {x('Participar da Loteria de queima', 'Join the Burn Lottery', 'Participar en la Lotería de quema')}
    </label>
    <LotteryEntries lot={lot} />
    <div className="grid gap-1 rounded-xl border border-[#F4F1E8]/25 px-3 py-2" data-testid="lottery-share" role="group" aria-label={x('Sua participação nos números ativos', 'Your share of active numbers', 'Tu participación en números activos')}>
      <div className="text-xs font-bold text-[#C5D2F1]">{x('Sua parcela dos números ativos', 'Your share of active numbers', 'Tu parte de los números activos')}</div>
      {Number.isFinite(ownN) && Number.isFinite(totalN) && Number.isFinite(pct) ? <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="display text-2xl font-extrabold tabular-nums text-[#F2B632]" data-testid="lottery-share-percent">{ownN > 0 && pct < 0.01 ? '<' : ''}{ownN > 0 && pct < 0.01 ? `${(0.01).toLocaleString(fl, { minimumFractionDigits: 2 })}%` : `${pct.toLocaleString(fl, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}</span>
        <span className="text-xs tabular-nums text-[#F4F1E8]" data-testid="lottery-share-count">{x(`${nf(fl, ownN, 0)} de ${nf(fl, totalN, 0)} números ativos`, `${nf(fl, ownN, 0)} of ${nf(fl, totalN, 0)} active numbers`, `${nf(fl, ownN, 0)} de ${nf(fl, totalN, 0)} números activos`)}</span>
      </div>
      <p className="text-xs text-[#C5D2F1]">{ownN === 0 ? (totalN === 0
        ? x('Nenhum número ativo no próximo sorteio. Participe com BETTEX elegível em stake para ativar o seu.', 'No active numbers in the upcoming draw. Join with eligible staked BETTEX to activate yours.', 'No hay números activos en el próximo sorteo. Participa con BETTEX elegible en stake para activar el tuyo.')
        : x('Você não tem números ativos. Participe com BETTEX elegível em stake para entrar.', 'You have no active numbers. Join with eligible staked BETTEX to take part.', 'No tienes números activos. Participa con BETTEX elegible en stake para entrar.'))
        : x('Parcela dos números ativos, não uma chance garantida de seleção ou pagamento.', 'Share of active numbers, not a guaranteed selection or payment.', 'Parte de los números activos, no una probabilidad garantizada de selección o pago.')}</p>
      </> : <p className="text-xs text-[#C5D2F1]">{x('Participação indisponível. Aguarde a atualização dos dados.', 'Share unavailable. Waiting for updated data.', 'Participación no disponible. Espera la actualización de los datos.')}</p>}
    </div>
    <div className="text-xs text-[#C5D2F1]"><WalletHelp id="lottery-participation" label={x('Como funciona a participação', 'How participation works', 'Cómo funciona la participación')}>
      <p>{x('Participar é opcional e exige confirmação das condições. O checkbox indica sua escolha, não uma seleção vencedora. Sem BETTEX elegível, não é possível aderir. Desmarcar interrompe a participação futura; resultados já executados permanecem no histórico.', 'Joining is optional and requires confirming the terms. The checkbox shows your choice, not a winning selection. Without eligible BETTEX, you cannot join. Unchecking stops future participation; executed results remain in history.', 'Participar es opcional y requiere confirmar las condiciones. La casilla indica tu elección, no una selección ganadora. Sin BETTEX elegible no puedes participar. Desmarcar detiene la participación futura; los resultados ejecutados permanecen en el historial.')}</p>
    </WalletHelp></div>
    {!lot.eligible && !lot.participating && <p className="text-xs text-[#C5D2F1]">{x('Sem BETTEX em stake elegível.', 'No eligible staked BETTEX.', 'Sin BETTEX en stake elegible.')}</p>}
    {m.isPending && !open && <p className="text-xs text-[#C5D2F1]" data-testid="lottery-loading">{x('Salvando...', 'Saving...', 'Guardando...')}</p>}
    {m.isError && !open && <p role="alert" className="text-xs font-semibold text-[#FFB4A8]" data-testid="lottery-error">{x('Não foi possível atualizar a participação.', 'Could not update participation.', 'No se pudo actualizar la participación.')}</p>}
    </WalletCardDetails>
    <Dialog open={open} onOpenChange={value => { if (!m.isPending) setOpen(value); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-[#FFFCF6] p-4 text-[#1B2A41] shadow-xl" data-testid="lottery-confirm-dialog">
        <DialogTitle className="display text-base font-extrabold text-[#1B2A41]">{x('Confirmar participação', 'Confirm participation', 'Confirmar participación')}</DialogTitle>
        <DialogDescription className="sr-only">{x('Condições de participação opcional na Burn Lottery simulada.', 'Terms of optional participation in the simulated Burn Lottery.', 'Condiciones de participación opcional en Burn Lottery simulada.')}</DialogDescription>
        <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-sm text-[#1B2A41]">
          <li>{x('Compras automáticas diárias a 2x o preço de mercado cotado.', 'Automatic daily purchases at twice the quoted market price.', 'Compras automáticas diarias a 2x el precio de mercado cotizado.')}</li>
          <li>{x('Toda carteira em stake recebe um número grátis, ativado ao aderir. Números comprados têm o mesmo peso. Cada carteira vence e vende no máximo uma vez por sorteio, até esgotar o USDC ou os saldos elegíveis.', 'Every staked wallet receives a free number, activated by joining. Purchased numbers have equal weight. Each wallet wins and sells at most once per draw, until USDC is exhausted or no eligible balances remain.', 'Toda cartera en stake recibe un número gratis, activado al participar. Los números comprados tienen el mismo peso. Cada cartera gana y vende como máximo una vez por sorteo, hasta agotar el USDC o los saldos elegibles.')}</li>
          <li>{x('Cada venda reduz o BETTEX em stake e paga USDC simulado à carteira em dólar.', 'Each sale reduces staked BETTEX and pays simulated USDC to the dollar wallet.', 'Cada venta reduce el BETTEX en stake y paga USDC simulado a la cartera en dólares.')}</li>
          <li>{x('Cancela todo peso/direito não pago do ciclo atual, inclusive o restante.', 'Cancels all prior unpaid weight/rights of the current cycle, including the remainder.', 'Cancela todo peso/derecho no pagado del ciclo actual, incluido el remanente.')}</li>
          <li>{x('A participação continua até você desmarcar. Valores modelados, sem transações reais.', 'Participation continues until you uncheck. Modeled values, no real transactions.', 'La participación continúa hasta que desmarques. Valores modelados, sin transacciones reales.')}</li>
        </ul>
        {m.isError && <p role="alert" className="mt-2 text-xs font-semibold text-[#A12D2D]" data-testid="lottery-error">{x('Falha ao confirmar. Tente novamente.', 'Confirmation failed. Try again.', 'Falló la confirmación. Inténtalo de nuevo.')}</p>}
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button type="button" className={btn} disabled={m.isPending} onClick={() => setOpen(false)} data-testid="lottery-cancel-button">{x('Cancelar', 'Cancel', 'Cancelar')}</button>
          <button type="button" className={`${btn} !border-[#1B2A41] !bg-[#1B2A41] !text-[#FFFCF6]`} disabled={m.isPending} onClick={() => send(true, true)} data-testid="lottery-confirm-button">{m.isPending ? x('Confirmando...', 'Confirming...', 'Confirmando...') : m.isError ? x('Tentar novamente', 'Retry', 'Reintentar') : x('Confirmar', 'Confirm', 'Confirmar')}</button>
        </div>
      </DialogContent>
    </Dialog>
  </div>;
}
