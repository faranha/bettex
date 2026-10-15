/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { TrendingUp } from 'lucide-react';
import { useMoney } from './fin';
import { useX } from './ui';
import { WalletHelp } from './WalletHelp';
import { walletEarningsSummary } from './wallet-earnings-model';
import './WalletPotentialGain.css';

export function WalletPotentialGain({ d }: { d: DemoDashboard }) {
  const { x } = useX();
  const { brl, num } = useMoney();
  const s = walletEarningsSummary(d);
  const pct = (v: number | null) => v === null ? '—' : `${num(v, 2)}%`;
  const na = x('Indisponível', 'Unavailable', 'No disponible');
  const hist = [
    { k: 'yesterday', w: s.history.yesterday, l: x('Ontem', 'Yesterday', 'Ayer') },
    { k: 'week', w: s.history.week, l: x('Últimos 7 dias', 'Last 7 days', 'Últimos 7 días') },
    { k: 'month', w: s.history.month, l: x('Últimos 30 dias', 'Last 30 days', 'Últimos 30 días') },
  ];
  return <div className="wallet-potential wpg" data-testid="wallet-potential-gain">
    <div className="wpg-top">
      <span className="inline-flex items-center gap-2"><span aria-hidden="true" style={{ color: '#E3BE63', display: 'grid' }}><TrendingUp size={16} /></span>
        <WalletHelp id="wallet-potential-gain" label={x('Ganho potencial hoje', 'Potential earnings today', 'Ganancia potencial hoy')}>
          <p>{x(
            'Projeção da rodada atual para seus tokens elegíveis, a mesma exibida na carteira de rendimentos. Depende do resultado final e das condições de distribuição; não é saldo disponível nem retorno garantido.',
            'Current-round projection for your eligible tokens, also shown in the earnings wallet. It depends on final results and distribution conditions; it is not an available balance or a guaranteed return.',
            'Proyección de la ronda actual para tus tokens elegibles, también mostrada en la cartera de ganancias. Depende del resultado final y de las condiciones de distribución; no es saldo disponible ni retorno garantizado.',
          )}</p>
          <p>{x(
            'Mantenha os BETTEX elegíveis até a apuração. Qualquer saída de BETTEX, mesmo parcial, cancela os direitos ainda não pagos da rodada. Novas entradas só participam da próxima rodada.',
            'Keep eligible BETTEX until settlement. Any BETTEX outflow, even partial, cancels the round’s unpaid entitlements. New deposits only participate in the next round.',
            'Mantén los BETTEX elegibles hasta la liquidación. Cualquier salida de BETTEX, incluso parcial, cancela los derechos no pagados de la ronda. Las nuevas entradas solo participan en la próxima ronda.',
          )}</p>
          <p>{x(
            'Base do percentual: ganho estimado de hoje ÷ valor atual em USDC dos BETTEX elegíveis. Não é probabilidade. O mensal é o diário × 30, supondo o mesmo pagamento e elegibilidade, sem reinvestimento, pois o rendimento em USDC não é aplicado automaticamente.',
            'Percentage base: estimated payout today ÷ current USDC value of eligible BETTEX. It is not a probability. Monthly is daily × 30, assuming the same payout and eligibility, with no reinvestment since USDC yield is not auto-staked.',
            'Base del porcentaje: ganancia estimada de hoy ÷ valor actual en USDC de los BETTEX elegibles. No es probabilidad. El mensual es diario × 30, suponiendo el mismo pago y elegibilidad, sin reinversión, pues el rendimiento en USDC no se reinvierte automáticamente.',
          )}</p>
          <p>{x(
            'Ontem corresponde à rodada anterior encerrada; 7 e 30 dias somam as rodadas diárias encerradas antes da atual. Não são ganhos do dia em andamento. Quando faltam registros, mostramos somente o subtotal disponível e quantos dias estão cobertos.',
            'Yesterday refers to the previous completed round; 7 and 30 days sum daily rounds completed before the current one. They exclude the ongoing day. When records are missing, only the available subtotal and the number of covered days are shown.',
            'Ayer corresponde a la ronda anterior cerrada; 7 y 30 días suman las rondas diarias cerradas antes de la actual. Excluyen el día en curso. Si faltan registros, mostramos solo el subtotal disponible y cuántos días están cubiertos.',
          )}</p>
        </WalletHelp></span>
      <span className="wpg-brand">BETTEX</span>
    </div>
    <p className="wpg-main">
      <strong className="wpg-value" data-testid="wallet-potential-value">{s.projectedUsdc === null ? na : brl('USDC', s.projectedUsdc)}</strong>
      {s.projectedUsdc !== null && <span className="wpg-sub">{num(s.projectedUsdc, 2)} USDC</span>}
    </p>
    <p className="wpg-note wallet-potential-condition">{x('Se mantiver seus BETTEX elegíveis até a apuração.', 'If you keep your eligible BETTEX until settlement.', 'Si mantienes tus BETTEX elegibles hasta la liquidación.')}</p>
    <dl className="wpg-grid">
      {hist.map(h => <div key={h.k} className={`wpg-tile ${h.w.complete ? 'ok' : ''}`} data-testid={`wallet-history-${h.k}`}>
        <dt>{h.l}</dt>
        <dd>{h.w.recordedUsdc === null ? '—' : brl('USDC', h.w.recordedUsdc)}</dd>
        <small>{h.w.complete
          ? h.k === 'yesterday' ? x('Rodada anterior', 'Previous round', 'Ronda anterior') : x('Completo', 'Complete', 'Completo')
          : x(`Parcial · ${h.w.coveredDays} de ${h.w.days} dias · subtotal registrado`, `Partial · ${h.w.coveredDays} of ${h.w.days} days · recorded subtotal`, `Parcial · ${h.w.coveredDays} de ${h.w.days} días · subtotal registrado`)}</small>
      </div>)}
      <div className="wpg-tile" data-testid="wallet-return-daily">
        <dt>{x('Retorno diário est.', 'Est. daily return', 'Retorno diario est.')}</dt>
        <dd>{pct(s.dailyReturnPercent)}</dd>
        <small>{x('Sobre BETTEX elegíveis', 'On eligible BETTEX', 'Sobre BETTEX elegibles')}</small>
      </div>
      <div className="wpg-tile" data-testid="wallet-return-monthly">
        <dt>{x('Retorno mensal est.', 'Est. monthly return', 'Retorno mensual est.')}</dt>
        <dd>{pct(s.projected30DaysPercent)}</dd>
        <small>{s.projected30DaysUsdc === null ? x('Diário × 30, sem reinvestir', 'Daily × 30, no reinvestment', 'Diario × 30, sin reinvertir') : `${brl('USDC', s.projected30DaysUsdc)} · ${x('diário × 30', 'daily × 30', 'diario × 30')}`}</small>
      </div>
    </dl>
    <p className="wpg-prob" data-testid="wallet-win-probability">
      <span>{x('Probabilidade de ganho hoje', 'Probability of earning today', 'Probabilidad de ganancia hoy')}:</span>
      <b>{x('Não calculada', 'Not calculated', 'No calculada')}</b>
      <span>{x('— diferente do rendimento diário projetado acima.', '— distinct from the projected daily yield above.', '— distinta del rendimiento diario proyectado arriba.')}</span>
    </p>
    <p className="wpg-foot">{x('Ilustrativo, não garantido. Dados de demonstração, não histórico financeiro.', 'Illustrative, not guaranteed. Demo data, not financial history.', 'Ilustrativo, no garantizado. Datos de demostración, no historial financiero.')}</p>
  </div>;
}
