/** @jsxImportSource react */
import { Link } from 'wouter';
import { Droplets } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { Money, Term, useMoney } from './fin';
import { formatBrazilDateTime } from './brazil-time';

const box = 'rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 sm:p-4';

export function TreasurySwapPool({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX(); const { num, fl } = useMoney();
  const p = d.treasury.swapPool;
  return <section data-testid="treasury-swap-pool" className="dcard grid gap-3 p-4 sm:p-5">
    <h2 className="display flex items-center gap-2 text-lg font-extrabold"><Droplets className="h-5 w-5 text-[#0E7C6B]" aria-hidden="true" />{x('Pool de conversão simulado', 'Simulated swap pool', 'Pool de conversión simulado')}</h2>
    <p role="note" className="rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-xs font-semibold text-[#6B3A10]">{x('Simulação: não existe contrato AMM real. O preço varia conforme as reservas, pela regra de produto constante. O estoque de BETTEX é modelado, não emissão on-chain.', 'Simulation: there is no actual AMM contract. Price varies with reserves under the constant-product rule. BETTEX stock is modeled, not on-chain issuance.', 'Simulación: no existe contrato AMM real. El precio varía con las reservas según el producto constante. El stock de BETTEX es modelado, no emisión on-chain.')}</p>
    {!p ? <p data-testid="treasury-swap-pool-unavailable" className="rounded-xl bg-[#F5F1E8] p-3 text-sm font-semibold text-[#5B6B85]">{x('Indisponível: nenhuma liquidez é exibida sem dados do pool.', 'Unavailable: no liquidity is shown without pool data.', 'No disponible: no se muestra liquidez sin datos del pool.')}</p> : <>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className={box}><p className="text-xs font-bold text-[#1B2A41]"><Term tip={x('Reserva de USDC do pool, já incluída no caixa total da Tesouraria. Agentes de trading não podem usá-la.', 'Pool USDC reserve, already included in Treasury cash total. Trading agents cannot use it.', 'Reserva de USDC del pool, ya incluida en el caja total de la Tesorería. Los agentes no pueden usarla.')}>{x('Liquidez USDC', 'USDC liquidity', 'Liquidez USDC')}</Term></p><div data-testid="swap-pool-usdc" className="mt-1"><Money v={p.reserveUsdc} a="USDC" big /></div><p className="mt-1 text-xs text-[#5B6B85]">{x('Inicial', 'Initial', 'Inicial')}: {num(p.initialReserveUsdc)}</p></div>
        <div className={box}><p className="text-xs font-bold text-[#1B2A41]">{x('Estoque BETTEX modelado', 'Modeled BETTEX stock', 'Stock BETTEX modelado')}</p><div data-testid="swap-pool-bettex" className="mt-1"><Money v={p.reserveBettex} a="BETTEX" big /></div><p className="mt-1 text-xs text-[#5B6B85]">{x('Inicial', 'Initial', 'Inicial')}: {num(p.initialReserveBettex, 4)}</p></div>
        <div className={`${box} bg-[#EFF6F2]`}><p className="text-xs font-bold text-[#1B2A41]"><Term tip={x('Reserva USDC dividida pela reserva BETTEX. Muda a cada conversão.', 'USDC reserve divided by BETTEX reserve. Changes with every conversion.', 'Reserva USDC dividida por reserva BETTEX. Cambia con cada conversión.')}>{x('Preço spot', 'Spot price', 'Precio spot')}</Term></p><p data-testid="swap-pool-price" className="display mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">{num(p.spotPriceUsdc, 6)} <span className="mono text-xs text-[#5B6B85]">USDC / BETTEX</span></p></div>
      </div>
      <dl className="grid gap-2 text-xs sm:grid-cols-3">
        <div><dt className="font-bold text-[#5B6B85]">{x('Volume total', 'Total volume', 'Volumen total')}</dt><dd data-testid="swap-pool-volume" className="tabular-nums">{num(p.totalVolumeUsdc)} USDC</dd></div>
        <div><dt className="font-bold text-[#5B6B85]">{x('Conversões', 'Swaps', 'Conversiones')}</dt><dd data-testid="swap-pool-count" className="tabular-nums">{p.swapCount.toLocaleString(fl)}</dd></div>
        <div><dt className="font-bold text-[#5B6B85]">{x('Atualizado em', 'Updated at', 'Actualizado en')}</dt><dd>{formatBrazilDateTime(p.updatedAt, fl)} (São Paulo)</dd></div>
      </dl>
      <p className="mono text-[11px] text-[#5B6B85]">{x('Contrato AMM: nenhum (simulado)', 'AMM contract: none (simulated)', 'Contrato AMM: ninguno (simulado)')} · x · y = k</p>
      <p className="text-xs text-[#5B6B85]">{x('A taxa de serviço continua 2,5 USDC por conversão; não há taxa extra para provedores de liquidez.', 'The service fee remains 2.5 USDC per conversion; there is no extra liquidity-provider fee.', 'La tarifa de servicio sigue en 2,5 USDC por conversión; no hay tarifa extra para proveedores de liquidez.')}</p>
    </>}
    <Link href={demoPath('home', loc)} data-testid="link-swap-pool-wallets" className="inline-flex min-h-11 items-center justify-center self-start rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657] hover:bg-[#EFF6F2]">{x('Converter nas carteiras', 'Convert in wallets', 'Convertir en carteras')}</Link>
  </section>;
}
