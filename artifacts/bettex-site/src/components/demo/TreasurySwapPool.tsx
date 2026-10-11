/** @jsxImportSource react */
import { Link } from 'wouter';
import { useState } from 'react';
import { Check, Copy, Droplets } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { Money, useMoney } from './fin';
import { TreasuryTerm as Term } from './TreasuryHelp';
import { formatBrazilDateTime } from './brazil-time';

const box = 'rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 sm:p-4';

export function TreasurySwapPool({ d, visualDemo = false }: { d: DemoDashboard; visualDemo?: boolean }) {
  const { x, loc } = useX(); const { num, fl } = useMoney();
  const p = d.treasury.swapPool;
  const c = p?.contract;
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const copy = async () => {
    if (!c) return;
    setCopyFailed(false);
    try {
      try { await navigator.clipboard.writeText(c.id); }
      catch {
        const t = document.createElement('textarea'); t.value = c.id; document.body.appendChild(t); t.select();
        try { if (!document.execCommand('copy')) throw new Error('clipboard_unavailable'); }
        finally { t.remove(); }
      }
    } catch { setCopyFailed(true); return; }
    setCopied(true); window.setTimeout(() => setCopied(false), 2000);
  };
  return <section data-testid="treasury-swap-pool" className="dcard grid gap-3 p-4 sm:p-5">
    <h2 className="display flex items-center gap-2 text-lg font-extrabold"><Droplets className="h-5 w-5 text-[#0E7C6B]" aria-hidden="true" /><Term tip={x('Estrutura modelada para converter USDC e BETTEX nos dois sentidos. As reservas determinam a cotação e mudam com as conversões. Não existe contrato AMM real nem autorização para enviar ativos reais. Converter nas carteiras abre o fluxo de conversão, não executa uma operação automaticamente.', 'Modeled structure for converting USDC and BETTEX in both directions. Reserves determine the quote and change with swaps. There is no real AMM contract or authorization to send real assets. Convert in wallets opens the conversion flow; it does not automatically execute an operation.', 'Estructura modelada para convertir USDC y BETTEX en ambos sentidos. Las reservas determinan la cotización y cambian con las conversiones. No existe un contrato AMM real ni autorización para enviar activos reales. Convertir en carteras abre el flujo, no ejecuta una operación automáticamente.')}>{x('Pool de conversão simulado', 'Simulated swap pool', 'Pool de conversión simulado')}</Term></h2>
    <p role="note" className="rounded-xl border border-[#E7B98A] bg-[#FFF3E3] p-3 text-xs font-semibold text-[#6B3A10]">{x('Simulação: contrato AMM simulado, não publicado on-chain. O preço varia conforme as reservas, pela regra de produto constante. O estoque de BETTEX é modelado, não emissão on-chain.', 'Simulation: simulated AMM contract, not deployed on-chain. Price varies with reserves under the constant-product rule. BETTEX stock is modeled, not on-chain issuance.', 'Simulación: contrato AMM simulado, no desplegado on-chain. El precio varía con las reservas según el producto constante. El stock de BETTEX es modelado, no emisión on-chain.')}</p>
    {!p ? <p data-testid="treasury-swap-pool-unavailable" className="rounded-xl bg-[#F5F1E8] p-3 text-sm font-semibold text-[#5B6B85]">{x('Indisponível: nenhuma liquidez é exibida sem dados do pool.', 'Unavailable: no liquidity is shown without pool data.', 'No disponible: no se muestra liquidez sin datos del pool.')}</p> : <>
      <div className={`${box} bg-[#EFF6F2]`}><p className="text-xs font-bold text-[#1B2A41]"><Term tip={x('Reserva USDC dividida pela reserva BETTEX. Muda a cada conversão.', 'USDC reserve divided by BETTEX reserve. Changes with every conversion.', 'Reserva USDC dividida por reserva BETTEX. Cambia con cada conversión.')}>{x('Preço spot', 'Spot price', 'Precio spot')}</Term></p><p data-testid="swap-pool-price" className="display mt-1 text-2xl font-extrabold tabular-nums">{num(p.spotPriceUsdc, 4)} <span className="mono text-xs text-[#5B6B85]">USDC / BETTEX</span></p></div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className={box}><p className="text-xs font-bold text-[#1B2A41]"><Term tip={x('Reserva de USDC do pool, já incluída no caixa total da Tesouraria. Agentes de trading não podem usá-la.', 'Pool USDC reserve, already included in Treasury cash total. Trading agents cannot use it.', 'Reserva de USDC del pool, ya incluida en el caja total de la Tesorería. Los agentes no pueden usarla.')}>{x('Liquidez USDC', 'USDC liquidity', 'Liquidez USDC')}</Term></p><div data-testid="swap-pool-usdc" className="mt-1"><Money v={p.reserveUsdc} a="USDC" big /></div></div>
        <div className={box}><div className="text-xs font-bold text-[#1B2A41]"><Term tip={x('Quantidade modelada de BETTEX disponível na pool para conversões. Não representa emissão on-chain, tokens queimados nem seu saldo pessoal. Inicial é o estoque no início do modelo; o valor principal é a reserva atual.', 'Modeled BETTEX available in the pool for swaps. Not on-chain issuance, burned tokens or your personal balance. Initial is the stock at the model’s start; the main figure is the current reserve.', 'BETTEX modelados disponibles en el pool para conversiones. No representan emisión on-chain, tokens quemados ni tu saldo personal. Inicial es el stock al comienzo del modelo; la cifra principal es la reserva actual.')}>{x('Estoque BETTEX modelado', 'Modeled BETTEX stock', 'Stock BETTEX modelado')}</Term></div><div data-testid="swap-pool-bettex" className="mt-1"><Money v={p.reserveBettex} a="BETTEX" big precision={2} /></div></div>
      </div>
      <div data-testid="swap-pool-contract" className={box}>
        <p className="text-xs font-bold text-[#1B2A41]">{x('Contrato AMM simulado', 'Simulated AMM contract', 'Contrato AMM simulado')}</p>
        {c ? <>
          <div className="mt-1 flex flex-wrap items-center gap-2"><span className="display text-sm font-extrabold">{c.name} {c.version}</span><span data-testid="swap-pool-contract-status" className="rounded-full bg-[#EFF6F2] px-2 py-0.5 text-[11px] font-bold text-[#0A6657]">{c.status === 'active' ? x('Ativo', 'Active', 'Activo') : c.status}</span><span className="mono text-[11px] text-[#5B6B85]">{c.runtime === 'server_simulation' ? x('simulação no servidor', 'server simulation', 'simulación en servidor') : c.runtime}</span></div>
          <div className="mt-2 flex flex-wrap items-center gap-2"><code data-testid="swap-pool-contract-id" className="mono min-w-0 break-all rounded-lg bg-[#F5F1E8] px-2 py-1 text-xs">{c.id}</code><button type="button" data-testid="button-copy-contract-id" onClick={copy} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#D8CFBB] px-3 text-xs font-bold text-[#0A6657] hover:bg-[#EFF6F2]">{copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}<span aria-live="polite">{copied ? x('ID copiado', 'ID copied', 'ID copiado') : x('Copiar ID', 'Copy ID', 'Copiar ID')}</span></button></div>
         </> : <p data-testid="swap-pool-contract-unavailable" className="mt-1 text-xs text-[#5B6B85]">{x('Descritor do contrato indisponível.', 'Contract descriptor unavailable.', 'Descriptor del contrato no disponible.')}</p>}
         {copyFailed && <p role="alert" className="mt-1 text-xs text-[#A12D2D]">{x('Não foi possível copiar. Selecione o ID e copie manualmente.', 'Could not copy. Select the ID and copy it manually.', 'No se pudo copiar. Selecciona el ID y cópialo manualmente.')}</p>}
        <p className="mt-2 text-xs text-[#5B6B85]">{visualDemo ? x('Descritor fictício local, sem execução ou ativos reais.', 'Fictitious local descriptor, with no execution or real assets.', 'Descriptor ficticio local, sin ejecución ni activos reales.') : x('Contrato simulado no servidor: não está publicado on-chain e não usa ativos reais.', 'Server-side simulated contract: not deployed on-chain and uses no real assets.', 'Contrato simulado en el servidor: no está desplegado on-chain y no usa activos reales.')}</p>
        {p.contractAddress && <p className="mono mt-1 break-all text-xs" data-testid="swap-pool-onchain-address">{x('Endereço on-chain (distinto do ID simulado)', 'On-chain address (distinct from simulated ID)', 'Dirección on-chain (distinta del ID simulado)')}: {p.contractAddress}</p>}
      </div>
       <p className="text-xs text-[#5B6B85]">{x('Uma contribuição por serviços é apenas uma alternativa em avaliação, sem cobrança ou valor definidos. O demo usa números fictícios. Números da loteria são pagos e queimados diretamente em BETTEX, sem usar o AMM.', 'A service contribution is only an alternative under evaluation, with no charge or amount defined. The demo uses fictional figures. Lottery entries are paid and burned directly in BETTEX without using the AMM.', 'Una contribución por servicios es solo una alternativa en evaluación, sin cobro ni importe definidos. El demo usa cifras ficticias. Los números de lotería se pagan y queman directamente en BETTEX sin usar el AMM.')}</p>
      <details data-testid="swap-pool-details" className="rounded-xl border border-[#E4DCCB] p-3 text-xs">
        <summary className="min-h-6 cursor-pointer font-bold text-[#1B2A41]">{x('Detalhes e números completos', 'Details and full figures', 'Detalles y cifras completas')}</summary>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div><dt className="font-bold text-[#5B6B85]">{x('Reserva USDC (atual / inicial)', 'USDC reserve (current / initial)', 'Reserva USDC (actual / inicial)')}</dt><dd className="tabular-nums">{num(p.reserveUsdc, 6)} / {num(p.initialReserveUsdc)}</dd></div>
          <div><dt className="font-bold text-[#5B6B85]">{x('Reserva BETTEX (atual / inicial)', 'BETTEX reserve (current / initial)', 'Reserva BETTEX (actual / inicial)')}</dt><dd className="tabular-nums">{num(p.reserveBettex, 4)} / {num(p.initialReserveBettex, 4)}</dd></div>
          <div><dt className="font-bold text-[#5B6B85]">{x('Preço spot', 'Spot price', 'Precio spot')}</dt><dd className="tabular-nums">{num(p.spotPriceUsdc, 6)} USDC / BETTEX</dd></div>
          <div><dt className="font-bold text-[#5B6B85]"><Term tip={x('Volume acumulado das conversões modeladas, expresso em USDC. Mede atividade da pool, não lucro, saldo disponível ou valor que você recebeu.', 'Accumulated modeled swap volume, expressed in USDC. Measures pool activity, not profit, available funds or money you received.', 'Volumen acumulado de conversiones modeladas, expresado en USDC. Mide actividad del pool, no ganancias, saldo disponible ni dinero recibido.')}>{x('Volume total', 'Total volume', 'Volumen total')}</Term></dt><dd data-testid="swap-pool-volume" className="tabular-nums">{num(p.totalVolumeUsdc)} USDC</dd></div>
          <div><dt className="font-bold text-[#5B6B85]"><Term tip={x('Quantidade acumulada de conversões registradas na pool, não quantidade de usuários ou de tokens.', 'Accumulated number of swaps recorded in the pool, not a user or token count.', 'Cantidad acumulada de conversiones registradas en el pool, no cantidad de usuarios ni tokens.')}>{x('Conversões', 'Swaps', 'Conversiones')}</Term></dt><dd data-testid="swap-pool-count" className="tabular-nums">{p.swapCount.toLocaleString(fl)}</dd></div>
          <div><dt className="font-bold text-[#5B6B85]"><Term tip={x('Horário da última atualização do estado da pool, exibido em São Paulo. Não é o horário de fechamento da rodada nem confirmação de uma transação real.', 'Last pool-state update time, shown in São Paulo time. Not the round closing time or confirmation of a real transaction.', 'Hora de la última actualización del estado del pool, en horario de São Paulo. No es el cierre de la ronda ni confirmación de una transacción real.')}>{x('Atualizado em', 'Updated at', 'Actualizado en')}</Term></dt><dd>{p.updatedAt ? formatBrazilDateTime(p.updatedAt, fl) + ' (São Paulo)' : '—'}</dd></div>
        </dl>
        <p className="mono mt-3 text-[11px] text-[#5B6B85]">x · y = k · {x('estoque de BETTEX modelado, não emissão de tokens', 'BETTEX stock is modeled, not token issuance', 'stock de BETTEX modelado, no emisión de tokens')}</p>
      </details>
    </>}
    <Link href={demoPath('home', loc)} data-testid="link-swap-pool-wallets" className="inline-flex min-h-11 items-center justify-center self-start rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657] hover:bg-[#EFF6F2]">{x('Converter nas carteiras', 'Convert in wallets', 'Convertir en carteras')}</Link>
  </section>;
}
