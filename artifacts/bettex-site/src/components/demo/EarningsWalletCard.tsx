/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { ArrowRightLeft, PiggyBank } from 'lucide-react';
import { useX } from './ui';
import { Money, type Asset, type Kind } from './fin';
import { previousCycle } from './previous-cycle';
import { scenarioStakingView } from './staking-model';
import { WalletHistoryLink } from './WalletHistoryLink';
import { EarningsStakingSummary } from './EarningsStakingSummary';
import { WalletHelp } from './WalletHelp';

export function EarningsWalletCard({ d, onWallet }: { d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void }) {
  const { x } = useX();
  const native = d.profile.authenticated && d.profile.provider === 'native';
  const last = native ? null : previousCycle(d)?.received ?? null;
  const proj = native ? null : scenarioStakingView(d)?.timeline.projectedOwnUsdc ?? null;
  const na = x('Indisponível', 'Unavailable', 'No disponible');
  const label = x('Mover para carteira em dólares', 'Move to dollar wallet', 'Mover a cartera en dólares');
  return <article className="grid content-start gap-3 rounded-xl border border-[#0E7C6B]/40 bg-gradient-to-br from-[#E6F4EE] to-[#CFE8DD] p-3 sm:p-4" data-testid="demo-wallet-earnings">
    <div className="flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#0E7C6B] text-white shadow-sm"><PiggyBank className="h-6 w-6" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-[#0A6657]"><WalletHelp id="earnings" label={x('Carteira de rendimentos', 'Earnings wallet', 'Cartera de ganancias')}>
          <p>{x('Recebe somente os rendimentos pagos em USDC. É separada da carteira em dólares e do saldo de BETTEX em staking. Não aceita depósitos nem faz conversões ou saques externos diretamente.', 'Receives only paid USDC earnings. It is separate from the dollar wallet and staked BETTEX balance. It does not accept deposits, convert assets or withdraw externally directly.', 'Recibe solo las ganancias pagadas en USDC. Está separada de la cartera en dólares y del saldo BETTEX en staking. No acepta depósitos ni hace conversiones o retiros externos directamente.')}</p>
        </WalletHelp></h3>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#3F6F63]"><WalletHelp id="earnings-balance" label={x('Saldo recebido, disponível', 'Received balance, available', 'Saldo recibido, disponible')}>
          <p>{x('USDC já recebido e ainda disponível nesta carteira, descontadas as transferências realizadas. Projeções e parcelas ainda não pagas não fazem parte deste saldo. A equivalência em reais é apenas informativa.', 'USDC already received and still available in this wallet, after completed transfers. Forecasts and unpaid amounts are not included in this balance. The BRL equivalent is informational only.', 'USDC ya recibido y aún disponible en esta cartera, descontadas las transferencias realizadas. Las proyecciones y los importes aún no pagados no forman parte de este saldo. La equivalencia en reales es solo informativa.')}</p>
        </WalletHelp></div>
        <div className="mt-0.5"><Money v={d.balances.receivedYield} a="USDC" big /></div>
      </div>
    </div>
    <dl className="grid gap-px overflow-hidden rounded-lg bg-[#0E7C6B]/20 text-xs sm:grid-cols-2">
      <div className="min-w-0 bg-[#F4FAF6] px-3 py-2">
        <dt className="flex min-w-0 items-center gap-1.5 font-bold text-[#0A6657]"><span className="h-2 w-2 shrink-0 rounded-full bg-[#0E7C6B]" aria-hidden="true" /><WalletHelp id="earnings-last" label={x('Recebido na rodada anterior', 'Received last round', 'Recibido en la ronda anterior')}>
          <p>{x('Quanto foi efetivamente recebido na rodada anterior, não o saldo acumulado da carteira. Cada rodada é independente: uma rodada sem pagamento não gera crédito para rodadas futuras. Indisponível significa que não há um dado verificável, não um pagamento de zero.', 'Amount actually received in the previous round, not the wallet’s accumulated balance. Each round is independent: an unpaid round does not create credit for future rounds. Unavailable means there is no verifiable figure, not a zero payment.', 'Importe realmente recibido en la ronda anterior, no el saldo acumulado de la cartera. Cada ronda es independiente: una ronda sin pago no genera crédito para rondas futuras. No disponible significa que no hay un dato verificable, no un pago de cero.')}</p>
        </WalletHelp></dt>
        <dd className="mt-1" data-testid="earnings-last-round">{last === null ? <span className="text-sm font-bold text-[#5B6B85]">{na}</span> : <Money v={last} a="USDC" />}</dd>
      </div>
      <div className="min-w-0 bg-[#FBF6EA] px-3 py-2">
        <dt className="flex min-w-0 items-center gap-1.5 font-bold text-[#8A5A12]"><span className="h-2 w-2 shrink-0 rounded-full border-2 border-dashed border-[#B8801F]" aria-hidden="true" /><WalletHelp id="earnings-projection" label={x('Projeção estimada da rodada atual', 'Estimated current-round projection', 'Proyección estimada de la ronda actual')}>
          <p>{x('Estimativa do que sua participação elegível pode receber ao fim da rodada de 24 horas. Pode mudar e não é dinheiro recebido, saldo disponível nem promessa de pagamento. O resultado final depende da apuração e das condições de distribuição.', 'Estimate of what your eligible participation may receive at the end of the 24-hour round. It can change and is not received money, an available balance or a payment promise. The final result depends on assessment and distribution conditions.', 'Estimación de lo que tu participación elegible puede recibir al final de la ronda de 24 horas. Puede cambiar y no es dinero recibido, saldo disponible ni una promesa de pago. El resultado final depende del cálculo y de las condiciones de distribución.')}</p>
        </WalletHelp></dt>
        <dd className="mt-1" data-testid="earnings-current-projection">{proj === null ? <span className="text-sm font-bold text-[#5B6B85]">{na}</span> : <Money v={proj} a="USDC" />}</dd>
        <dd className="mt-1 text-[11px] font-semibold text-[#8A5A12]">{x('Estimativa de 24h, não garantida e ainda não recebida.', '24h estimate, not guaranteed and not yet received.', 'Estimación de 24 h, no garantizada y aún no recibida.')}</dd>
      </div>
    </dl>
    <EarningsStakingSummary d={d} />
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" data-testid="button-earnings-transfer" data-asset="USDC" onClick={() => onWallet('earnings-transfer', 'USDC')}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#0E7C6B] px-4 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#0A6657] active:bg-[#085446] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B] sm:flex-none">
        <ArrowRightLeft className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="whitespace-nowrap sm:hidden">{x('Transferir', 'Transfer', 'Transferir')}</span><span className="hidden sm:inline">{label}</span>
      </button>
      <WalletHistoryLink wallet="earnings" id="button-earnings-history" className="border-[#0E7C6B]/40 bg-[#FFFCF6] text-[#0A6657] hover:bg-[#DDEBE4]" />
      <WalletHelp id="earnings-actions" iconOnly label={x('Transferência e histórico de rendimentos', 'Earnings transfer and history', 'Transferencia e historial de ganancias')}>
        <p>{x('Transferir move o USDC já recebido para sua própria carteira em dólares. Não envia para um endereço externo e não converte em BETTEX. Confira os valores na tela antes de confirmar. O histórico abre o extrato filtrado pelos rendimentos, sem movimentar saldo.', 'Transfer moves received USDC to your own dollar wallet. It does not send to an external address or convert to BETTEX. Review the amounts in the form before confirming. History opens the earnings-filtered statement without moving funds.', 'Transferir mueve el USDC ya recibido a tu propia cartera en dólares. No envía a una dirección externa ni convierte en BETTEX. Revisa los importes antes de confirmar. El historial abre el extracto filtrado por ganancias sin mover saldo.')}</p>
      </WalletHelp>
    </div>
    <p className="text-[11px] text-[#3F6F63]">{x('Só rendimentos de ciclos; transferíveis apenas para a carteira em dólares.', 'Cycle earnings only; transferable only to the dollar wallet.', 'Solo ganancias de ciclos; transferibles solo a la cartera en dólares.')}</p>
  </article>;
}
