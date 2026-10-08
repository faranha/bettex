/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { Money } from './fin';
import { usePersonalNative } from './use-personal-native';
import { earningsStake } from './earnings-stake';
import { WalletHelp } from './WalletHelp';

export function EarningsStakingSummary({ d }: { d: DemoDashboard }) {
  const { x } = useX();
  const native = usePersonalNative(d.profile);
  const stake = earningsStake(d, native.j, native.stale);
  const values = [
    { id: 'total', label: x('Total na carteira BETTEX', 'Total in BETTEX wallet', 'Total en la cartera BETTEX'), value: stake.total,
      help: x('Quantidade total de BETTEX na carteira: soma da parte elegível e da parte fora da rodada. Não inclui USDC nem o saldo da carteira de rendimentos. No modo nativo, usa o saldo informado pelo protocolo.', 'Total BETTEX in the wallet: eligible plus outside-round tokens. It does not include USDC or the earnings wallet balance. Native mode uses the balance reported by the protocol.', 'Cantidad total de BETTEX en la cartera: suma de la parte elegible y la parte fuera de la ronda. No incluye USDC ni el saldo de ganancias. El modo nativo usa el saldo informado por el protocolo.') },
    { id: 'eligible', label: x('Em staking nesta rodada', 'Staked in this round', 'En staking en esta ronda'), value: stake.eligible,
      help: stake.native
        ? x('Quantidade elegível informada pelo protocolo nativo para a rodada atual. Não é substituída por números do demo. Dados ausentes ou desatualizados ficam indisponíveis.', 'Eligible amount reported by the native protocol for the current round. It is not replaced with demo figures. Missing or stale data is shown as unavailable.', 'Cantidad elegible informada por el protocolo nativo para la ronda actual. No se sustituye por cifras del demo. Los datos ausentes o desactualizados se muestran como no disponibles.')
        : x('BETTEX elegível na abertura desta rodada e cuja participação não foi cancelada. Novas entradas após a abertura não aumentam este valor. Uma saída, mesmo parcial, cancela toda a participação ainda não paga da rodada. Os tokens permanecem na sua carteira, sem bloqueio de saque.', 'BETTEX eligible at this round’s opening whose participation has not been cancelled. New entries after opening do not increase this amount. Any exit, even partial, cancels all unpaid round participation. Tokens remain in your wallet, without a withdrawal lock.', 'BETTEX elegible al inicio de esta ronda cuya participación no se ha cancelado. Las nuevas entradas después del inicio no aumentan este valor. Cualquier salida, incluso parcial, cancela toda la participación aún no pagada. Los tokens permanecen en tu cartera, sin bloqueo de retiro.') },
    { id: 'outside', label: x('Fora desta rodada', 'Outside this round', 'Fuera de esta ronda'), value: stake.outside,
      help: stake.native
        ? x('Diferença entre o saldo total e a quantidade elegível informada pelo protocolo. Esta parte não entra na participação atual.', 'Difference between the total balance and protocol-reported eligible amount. This portion is not included in current participation.', 'Diferencia entre el saldo total y la cantidad elegible informada por el protocolo. Esta parte no entra en la participación actual.')
        : x('Total de BETTEX menos a parte elegível. Inclui entradas feitas durante a rodada e saldos cuja participação foi cancelada por uma saída. Não gera rendimentos nesta rodada; se mantido, pode participar a partir da próxima.', 'Total BETTEX minus the eligible amount. Includes entries during the round and balances whose participation was cancelled by an exit. It earns nothing in this round; if kept, it can participate from the next round.', 'Total de BETTEX menos la parte elegible. Incluye entradas durante la ronda y saldos cuya participación se canceló por una salida. No genera ganancias en esta ronda; si se mantiene, puede participar a partir de la próxima.') },
  ];
  return <section className="grid min-w-0 gap-2 rounded-lg border border-[#0E7C6B]/20 bg-white/50 p-3" data-testid="earnings-round-stake">
    <h4 className="text-xs font-bold text-[#0A6657]">{x('Sua participação na rodada atual', 'Your participation in the current round', 'Tu participación en la ronda actual')}</h4>
    <dl className="grid min-w-0 divide-y divide-[#0E7C6B]/20 border-y border-[#0E7C6B]/20">
      {values.map(({ id, label, value, help }) => <div key={id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-3 py-3">
        <dt className="min-w-0 text-[11px] font-semibold text-[#3F6F63]"><WalletHelp id={`stake-${id}`} label={label}><p>{help}</p></WalletHelp></dt>
        <dd className="min-w-0 text-right tabular-nums [overflow-wrap:anywhere]" data-testid={`earnings-stake-${id}`}>
          {value === null ? <span className="text-xs font-semibold text-[#5B6B85]">{x('Indisponível', 'Unavailable', 'No disponible')}</span> : <Money v={value} a="BETTEX" />}
        </dd>
      </div>)}
    </dl>
    <p className="text-[11px] leading-snug text-[#3F6F63]">{stake.native
      ? x('Participação informada pelo protocolo nativo, separada do saldo recebido em USDC.', 'Participation reported by the native protocol, separate from received USDC earnings.', 'Participación informada por el protocolo nativo, separada de las ganancias recibidas en USDC.')
      : x('BETTEX que entra após o início não participa desta rodada. Se mantido na carteira, pode participar a partir da próxima. Uma saída de BETTEX cancela toda a participação ainda não paga desta rodada.', 'BETTEX received after the start does not participate in this round. If kept in the wallet, it can participate from the next round. Any BETTEX exit cancels all unpaid participation in this round.', 'El BETTEX recibido después del inicio no participa en esta ronda. Si se mantiene en la cartera, puede participar a partir de la próxima. Cualquier salida de BETTEX cancela toda la participación aún no pagada de esta ronda.')}</p>
  </section>;
}
