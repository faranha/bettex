/** @jsxImportSource react */
import { useGetDemoTreasuryWallets, type DemoDashboard } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { Money } from '../demo/fin';
import { burnOf } from '../demo/burn-format';
import { formatBrazilDateTime } from '../demo/brazil-time';

export function TreasuryWalletHistoryContext({ d, purpose }: { d: DemoDashboard; purpose: 'operational' | 'reserve' | 'buyback' | 'crypto_agent' }) {
  const { x, loc } = useX();
  const q = useGetDemoTreasuryWallets({ query: { enabled: d.profile.provider !== 'native', staleTime: Infinity } });
  const wallet = q.data?.wallets.find(w => w.purpose === purpose);
  const round = d.treasury.currentRound, burn = burnOf(d);
  const allocation = round?.agentAllocations?.find(a => a.agent === 'crypto');
  const value = purpose === 'operational' ? round?.operationalWalletUsdc
    : purpose === 'reserve' ? round?.reserveUsdc : purpose === 'crypto_agent' ? allocation?.allocatedUsdc : burn?.walletUsdc;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'es' ? 'es-ES' : 'en-US';
  return <div className="grid min-w-0 gap-3 rounded-2xl border border-[#D7E2D6] bg-[#EFF6F2] p-3 sm:p-4" data-testid={`treasury-history-wallet-${purpose}`}>
    <p className="text-sm font-bold text-[#0A6657]">{x('Carteira de teste selecionada · posição simulada atual', 'Selected test wallet · current simulated position', 'Cartera de prueba seleccionada · posición simulada actual')}</p>
    {q.isLoading ? <div aria-busy="true" className="h-12 animate-pulse rounded-xl bg-[#DDEBE4]" />
      : q.isError || !wallet ? <div role="alert" className="text-sm text-[#8C2B2B]">{x('Endereço indisponível.', 'Address unavailable.', 'Dirección no disponible.')} <button className="min-h-11 px-2 font-bold underline" type="button" onClick={() => void q.refetch()}>{x('Tentar novamente', 'Try again', 'Reintentar')}</button></div>
      : <div className="min-w-0">
        <p className="break-all font-mono text-xs" data-testid="treasury-history-wallet-address">{wallet.address}</p>
        <p className="mt-1 text-xs text-[#5B6B85]">Arbitrum Sepolia · {x('Endereço atribuído em', 'Address assigned on', 'Dirección asignada el')} {formatBrazilDateTime(wallet.createdAt, fl)}</p>
      </div>}
    {round && <div className="flex flex-wrap gap-x-6 gap-y-2" data-testid="treasury-history-wallet-balance">
      {value == null ? <p>{x('Saldo não registrado', 'Balance not recorded', 'Saldo no registrado')}</p> : <Money v={value} a="USDC" big />}
      {purpose === 'buyback' && burn && <Money v={burn.walletBettex} a="BETTEX" big />}
    </div>}
    {purpose === 'crypto_agent' && allocation && <p className="text-xs text-[#5B6B85]">{x(
      `Rodada ${round?.id} · ${allocation.activePositions} posições aprovadas. O capital está comprometido em posições; não é USDC líquido na blockchain.`,
      `Round ${round?.id} · ${allocation.activePositions} approved positions. Capital is committed to positions; it is not liquid on-chain USDC.`,
      `Ronda ${round?.id} · ${allocation.activePositions} posiciones aprobadas. El capital está comprometido en posiciones; no es USDC líquido en blockchain.`)}</p>}
    <p className="text-xs text-[#5B6B85]">{x('Saldos de alocação do aplicativo, não saldos on-chain. Esta posição atual não é o saldo final do período filtrado. Não envie ativos reais.', 'App allocation balances, not on-chain balances. This current position is not the closing balance of the filtered period. Do not send real assets.', 'Saldos de asignación de la app, no saldos on-chain. Esta posición actual no es el saldo final del período filtrado. No envíes activos reales.')}</p>
  </div>;
}
