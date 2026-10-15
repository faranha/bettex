/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { TrendingUp } from 'lucide-react';
import { useMoney } from './fin';
import { scenarioStakingView } from './staking-model';
import { useX } from './ui';
import { WalletHelp } from './WalletHelp';

export function WalletPotentialGain({ d }: { d: DemoDashboard }) {
  const { x } = useX();
  const { brl } = useMoney();
  // Share the earnings wallet's projection, never add it to available balances.
  const projected = scenarioStakingView(d)?.timeline.projectedOwnUsdc ?? null;
  return <div className="wallet-potential" data-testid="wallet-potential-gain">
    <div className="wallet-potential-heading">
      <span className="wallet-potential-icon" aria-hidden="true"><TrendingUp size={18} /></span>
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
      </WalletHelp>
    </div>
    <strong className="wallet-potential-value" data-testid="wallet-potential-value">{projected === null ? x('Indisponível', 'Unavailable', 'No disponible') : brl('USDC', projected)}</strong>
    <p className="wallet-potential-condition">{x('Se mantiver seus BETTEX elegíveis até a apuração.', 'If you keep your eligible BETTEX until settlement.', 'Si mantienes tus BETTEX elegibles hasta la liquidación.')}</p>
    <span className="wallet-potential-estimate">{x('Estimativa, não garantida', 'Estimate, not guaranteed', 'Estimación, no garantizada')}</span>
  </div>;
}
