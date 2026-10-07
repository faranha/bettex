/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { Flame } from 'lucide-react';
import { useX } from './ui';
import { Money, type Asset, type Kind } from './fin';
import { TokenIcon } from './TokenIcon';
import { WalletAction } from './WalletAction';
import { previousCycle } from './previous-cycle';
import { scenarioStakingView } from './staking-model';
import { WalletHistoryLink } from './WalletHistoryLink';

export function EarningsWalletCard({ d, onWallet }: { d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void }) {
  const { x, loc } = useX();
  const native = d.profile.authenticated && d.profile.provider === 'native';
  const last = native ? null : previousCycle(d)?.received ?? null;
  const proj = native ? null : scenarioStakingView(d)?.timeline.projectedOwnUsdc ?? null;
  const na = x('Indisponível', 'Unavailable', 'No disponible');
  return <article className="col-span-full relative grid gap-3 overflow-hidden rounded-xl border border-[#D9BD7D] bg-gradient-to-br from-[#FFF5D9] via-[#FFEBB8] to-[#FFD98A] p-3 sm:p-4" data-testid="demo-wallet-earnings">
    <Flame aria-hidden="true" className="pointer-events-none absolute -right-3 -top-3 h-28 w-28 text-[#E8892B]/15 motion-safe:animate-pulse" />
    <h3 className="relative flex items-center gap-2 text-sm font-bold"><TokenIcon asset="USDC" />{x('Carteira de rendimentos', 'Earnings wallet', 'Cartera de ganancias')}<Flame className="h-4 w-4 text-[#D9591B]" aria-hidden="true" /></h3>
    <Money v={d.balances.receivedYield} a="USDC" big />
    <p className="relative text-xs text-[#5B6B85]">{x('Recebe apenas rendimentos dos ciclos. Sem depósitos ou conversão direta em BETTEX.', 'Receives cycle earnings only. No deposits or direct conversion to BETTEX.', 'Recibe solo ganancias de los ciclos. Sin depósitos ni conversión directa a BETTEX.')}</p>
    <div className="relative grid gap-2 sm:grid-cols-2">
      <section className="rounded-xl border border-[#0E7C6B]/30 bg-[#FFFCF6]/80 p-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-[#0A6657]"><Flame className="h-4 w-4" aria-hidden="true" />{x('Recebido na rodada anterior', 'Received last round', 'Recibido en la ronda anterior')}</p>
        <div data-testid="earnings-last-round" className="mt-1">{last === null ? <span className="text-sm font-bold text-[#5B6B85]">{na}</span> : <Money v={last} a="USDC" big />}</div>
        <p className="mt-1 text-xs text-[#5B6B85]">{last === null ? x('Sem crédito pessoal registrado.', 'No personal credit recorded.', 'Sin crédito personal registrado.') : last === 0 ? x('Sem distribuição na rodada anterior.', 'No distribution last round.', 'Sin distribución en la ronda anterior.') : x('Renda já paga, seu valor pessoal.', 'Income already paid, your personal amount.', 'Ingreso ya pagado, tu monto personal.')}</p>
      </section>
      <section className="rounded-xl border border-dashed border-[#D9591B]/50 bg-[#FFF0D6]/80 p-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-[#B8480F]"><Flame className="h-4 w-4 motion-safe:animate-pulse" aria-hidden="true" />{x('Projeção estimada da rodada atual', 'Estimated current-round projection', 'Proyección estimada de la ronda actual')}</p>
        <div data-testid="earnings-current-projection" className="mt-1">{proj === null ? <span className="text-sm font-bold text-[#5B6B85]">{na}</span> : <Money v={proj} a="USDC" big />}</div>
        <p className="mt-1 text-xs text-[#5B6B85]">{x('Estimativa de 24h, não garantida e ainda não recebida.', '24h estimate, not guaranteed and not yet received.', 'Estimación de 24 h, no garantizada y aún no recibida.')}</p>
      </section>
    </div>
    <div className="relative flex flex-wrap items-center gap-2">
      <WalletAction kind="earnings-transfer" asset="USDC" id="earnings-transfer" label={x('Mover para carteira em dólares', 'Move to dollar wallet', 'Mover a cartera en dólares')} onOpen={onWallet} />
      <WalletHistoryLink wallet="earnings" id="button-earnings-history" className="border-[#0E7C6B]/40 bg-[#FFFCF6] text-[#0A6657] hover:bg-[#DDEBE4]" />
    </div>
    <p className="relative text-xs text-[#5B6B85]">{x('Os rendimentos só podem ser transferidos para a carteira em dólares.', 'Earnings can only be transferred to the dollar wallet.', 'Las ganancias solo se pueden transferir a la cartera en dólares.')}</p>
  </article>;
}
