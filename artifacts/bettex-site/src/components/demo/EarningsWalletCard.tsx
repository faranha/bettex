/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { ArrowRightLeft, PiggyBank } from 'lucide-react';
import { useX } from './ui';
import { Money, type Asset, type Kind } from './fin';
import { previousCycle } from './previous-cycle';
import { scenarioStakingView } from './staking-model';
import { WalletHistoryLink } from './WalletHistoryLink';

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
        <h3 className="text-sm font-bold text-[#0A6657]">{x('Carteira de rendimentos', 'Earnings wallet', 'Cartera de ganancias')}</h3>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#3F6F63]">{x('Saldo recebido, disponível', 'Received balance, available', 'Saldo recibido, disponible')}</p>
        <div className="mt-0.5"><Money v={d.balances.receivedYield} a="USDC" big /></div>
      </div>
    </div>
    <dl className="grid gap-px overflow-hidden rounded-lg bg-[#0E7C6B]/20 text-xs sm:grid-cols-2">
      <div className="bg-[#F4FAF6] px-3 py-2">
        <dt className="flex items-center gap-1.5 font-bold text-[#0A6657]"><span className="h-2 w-2 rounded-full bg-[#0E7C6B]" aria-hidden="true" />{x('Recebido na rodada anterior', 'Received last round', 'Recibido en la ronda anterior')}</dt>
        <dd className="mt-1" data-testid="earnings-last-round">{last === null ? <span className="text-sm font-bold text-[#5B6B85]">{na}</span> : <Money v={last} a="USDC" />}</dd>
      </div>
      <div className="bg-[#FBF6EA] px-3 py-2">
        <dt className="flex items-center gap-1.5 font-bold text-[#8A5A12]"><span className="h-2 w-2 rounded-full border-2 border-dashed border-[#B8801F]" aria-hidden="true" />{x('Projeção estimada da rodada atual', 'Estimated current-round projection', 'Proyección estimada de la ronda actual')}</dt>
        <dd className="mt-1" data-testid="earnings-current-projection">{proj === null ? <span className="text-sm font-bold text-[#5B6B85]">{na}</span> : <Money v={proj} a="USDC" />}</dd>
        <dd className="mt-1 text-[11px] font-semibold text-[#8A5A12]">{x('Estimativa de 24h, não garantida e ainda não recebida.', '24h estimate, not guaranteed and not yet received.', 'Estimación de 24 h, no garantizada y aún no recibida.')}</dd>
      </div>
    </dl>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" data-testid="button-earnings-transfer" data-asset="USDC" onClick={() => onWallet('earnings-transfer', 'USDC')}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#0E7C6B] px-4 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#0A6657] active:bg-[#085446] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B] sm:flex-none">
        <ArrowRightLeft className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="whitespace-nowrap sm:hidden">{x('Transferir', 'Transfer', 'Transferir')}</span><span className="hidden sm:inline">{label}</span>
      </button>
      <WalletHistoryLink wallet="earnings" id="button-earnings-history" className="border-[#0E7C6B]/40 bg-[#FFFCF6] text-[#0A6657] hover:bg-[#DDEBE4]" />
    </div>
    <p className="text-[11px] text-[#3F6F63]">{x('Só rendimentos de ciclos; transferíveis apenas para a carteira em dólares.', 'Cycle earnings only; transferable only to the dollar wallet.', 'Solo ganancias de ciclos; transferibles solo a la cartera en dólares.')}</p>
  </article>;
}
