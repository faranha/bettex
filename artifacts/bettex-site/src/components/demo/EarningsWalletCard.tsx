/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { PiggyBank } from 'lucide-react';
import { useX } from './ui';
import { Money, type Asset, type Kind } from './fin';
import { WalletAction } from './WalletAction';
import { previousCycle } from './previous-cycle';
import { scenarioStakingView } from './staking-model';
import { WalletHistoryLink } from './WalletHistoryLink';

export function EarningsWalletCard({ d, onWallet }: { d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void }) {
  const { x } = useX();
  const native = d.profile.authenticated && d.profile.provider === 'native';
  const last = native ? null : previousCycle(d)?.received ?? null;
  const proj = native ? null : scenarioStakingView(d)?.timeline.projectedOwnUsdc ?? null;
  const na = x('Indisponível', 'Unavailable', 'No disponible');
  return <article className="grid content-start gap-2 rounded-xl border border-[#0E7C6B]/40 bg-gradient-to-br from-[#E6F4EE] to-[#CFE8DD] p-3" data-testid="demo-wallet-earnings">
    <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A6657]"><PiggyBank className="h-5 w-5" aria-hidden="true" />{x('Carteira de rendimentos', 'Earnings wallet', 'Cartera de ganancias')}</h3>
    <Money v={d.balances.receivedYield} a="USDC" big />
    <dl className="grid gap-x-3 gap-y-1 border-t border-[#0E7C6B]/25 pt-2 text-xs sm:grid-cols-2">
      <div><dt className="font-bold text-[#0A6657]">{x('Recebido na rodada anterior', 'Received last round', 'Recibido en la ronda anterior')}</dt>
        <dd data-testid="earnings-last-round">{last === null ? <span className="text-sm font-bold text-[#5B6B85]">{na}</span> : <Money v={last} a="USDC" />}</dd></div>
      <div><dt className="font-bold text-[#B8480F]">{x('Projeção estimada da rodada atual', 'Estimated current-round projection', 'Proyección estimada de la ronda actual')}</dt>
        <dd data-testid="earnings-current-projection">{proj === null ? <span className="text-sm font-bold text-[#5B6B85]">{na}</span> : <Money v={proj} a="USDC" />}</dd>
        <dd className="text-[#5B6B85]">{x('Estimativa de 24h, não garantida e ainda não recebida.', '24h estimate, not guaranteed and not yet received.', 'Estimación de 24 h, no garantizada y aún no recibida.')}</dd></div>
    </dl>
    <div className="flex flex-wrap items-center gap-2">
      <WalletAction kind="earnings-transfer" asset="USDC" id="earnings-transfer" label={x('Mover para carteira em dólares', 'Move to dollar wallet', 'Mover a cartera en dólares')} onOpen={onWallet} />
      <WalletHistoryLink wallet="earnings" id="button-earnings-history" className="border-[#0E7C6B]/40 bg-[#FFFCF6] text-[#0A6657] hover:bg-[#DDEBE4]" />
    </div>
    <p className="text-xs text-[#5B6B85]">{x('Só rendimentos de ciclos; transferíveis apenas para a carteira em dólares.', 'Cycle earnings only; transferable only to the dollar wallet.', 'Solo ganancias de ciclos; transferibles solo a la cartera en dólares.')}</p>
  </article>;
}
