/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import type { ReactNode } from 'react';
import { useX } from './ui';
import { Money, type Asset, type Kind } from './fin';
import { WalletAction } from './WalletAction';
import { TokenIcon } from './TokenIcon';
import { BookUser, KeyRound } from 'lucide-react';
import { BurnedTokensCard } from './BurnedTokensCard';
import { EarningsWalletCard } from './EarningsWalletCard';
import { WalletHistoryLink } from './WalletHistoryLink';
import { WalletHelp } from './WalletHelp';
import { WalletActionsHelp } from './WalletActionsHelp';

export function DemoWalletsCard({ d, onWallet, showReceivedYield = false, showHeading = true, headerActions, onExport, addresses }: { d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void; showReceivedYield?: boolean; showHeading?: boolean; headerActions?: ReactNode; onExport?: (asset: Asset) => void; addresses?: Partial<Record<Asset, string>> }) {
  const { x } = useX();
  return <section className="dcard grid gap-3 p-4 sm:p-5" data-testid="demo-session-wallets">
    {(showHeading || headerActions) && <div className="flex flex-wrap items-center justify-between gap-2">{showHeading && <h2 className="display text-lg font-extrabold">{x('Minhas carteiras', 'My wallets', 'Mis carteras')}</h2>}{headerActions && <div className="ml-auto">{headerActions}</div>}</div>}
    <div className="grid gap-3 sm:grid-cols-2">{(['USDC', 'BETTEX'] as const).map(asset => <article key={asset} className={`dcard tk-card ${asset === 'USDC' ? 'tk-usdc' : 'tk-bettex'} grid gap-2 rounded-xl p-3`} data-testid={`demo-wallet-${asset.toLowerCase()}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2 text-sm font-bold"><TokenIcon asset={asset} /><WalletHelp id={`balance-${asset}`} label={asset === 'USDC' ? x('Carteira em dólares', 'Dollar wallet', 'Cartera en dólares') : x('Carteira BETTEX', 'BETTEX wallet', 'Cartera BETTEX')}>
          <p>{asset === 'USDC'
            ? x('Saldo disponível em USDC, separado dos rendimentos. USDC é o ativo em dólares usado para receber, retirar e converter saldo; não é saldo bancário em reais.', 'Available USDC balance, separate from earnings. USDC is the dollar-denominated asset used to receive, withdraw and convert funds; it is not a BRL bank balance.', 'Saldo disponible en USDC, separado de las ganancias. USDC es el activo en dólares utilizado para recibir, retirar y convertir saldo; no es saldo bancario en reales.')
            : x('Total de BETTEX na carteira, incluindo tokens que ainda não participam da rodada atual. Ter saldo não significa que todo ele esteja elegível para receber rendimentos nesta rodada.', 'Total BETTEX in the wallet, including tokens not participating in the current round. Holding a balance does not mean all of it is eligible for this round’s earnings.', 'Total de BETTEX en la cartera, incluidos los tokens que aún no participan en la ronda actual. Tener saldo no significa que todo sea elegible para las ganancias de esta ronda.')}</p>
          <p>{x('O valor em reais é uma equivalência aproximada pela cotação exibida no cabeçalho, não um saldo adicional nem um retorno garantido.', 'The BRL amount is an approximate equivalent at the rate shown in the header, not an extra balance or a guaranteed return.', 'El importe en reales es una equivalencia aproximada con la cotización del encabezado, no un saldo adicional ni un retorno garantizado.')}</p>
        </WalletHelp></h3>
        {onExport && <button type="button" onClick={() => onExport(asset)} data-testid={`button-export-wallet-${asset}`} aria-label={x('Exportar carteira', 'Export wallet', 'Exportar cartera')} title={x('Exportar carteira', 'Export wallet', 'Exportar cartera')} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg opacity-70 transition-opacity hover:bg-white/10 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-current"><KeyRound className="h-4 w-4" aria-hidden="true" /></button>}
      </div>
      {addresses?.[asset] && <div className="flex items-center gap-1.5 text-xs text-[#5B6B85]" data-testid={`wallet-address-${asset}`}><WalletHelp id={`address-${asset}`} label={x('Endereço público', 'Public address', 'Dirección pública')} iconOnly icon={<BookUser className="h-4 w-4" aria-hidden="true" />}>
        <p>{x(`Endereço para receber ${asset} nesta carteira. Pode ser compartilhado para recebimento; não é sua chave privada. Confira o ativo e a rede indicados no formulário antes de enviar.`, `Address for receiving ${asset} in this wallet. It can be shared to receive funds; it is not your private key. Check the asset and network shown in the form before sending.`, `Dirección para recibir ${asset} en esta cartera. Se puede compartir para recibir fondos; no es tu clave privada. Comprueba el activo y la red del formulario antes de enviar.`)}</p>
        <p>{x('No ALFA, use somente ativos de teste. Não envie fundos reais a este endereço.', 'In ALPHA, use test assets only. Do not send real funds to this address.', 'En ALFA, utiliza solo activos de prueba. No envíes fondos reales a esta dirección.')}</p>
      </WalletHelp><span className="mono min-w-0 break-all">{addresses[asset]}</span></div>}
      <Money v={asset === 'USDC' ? d.balances.usdc : d.balances.bettex} a={asset} big />
      <div className="flex flex-wrap gap-2"><WalletAction kind={asset === 'USDC' ? 'onramp' : 'receive'} asset={asset} id={`demo-add-${asset}`} label={x('Adicionar saldo', 'Add balance', 'Agregar saldo')} onOpen={onWallet} />
        <WalletAction kind={asset === 'USDC' ? 'withdraw' : 'send'} asset={asset} id={`demo-out-${asset}`} label={x('Retirar', 'Withdraw', 'Retirar')} onOpen={onWallet} />
        <WalletAction kind="swap" asset={asset} id={`demo-swap-${asset}`} label={x('Converter', 'Convert', 'Convertir')} onOpen={onWallet} />
        <WalletHistoryLink wallet={asset} id={`button-wallet-history-${asset.toLowerCase()}`} />
        <WalletActionsHelp asset={asset} exportAvailable={!!onExport} /></div>
    </article>)}<EarningsWalletCard d={d} onWallet={onWallet} /><BurnedTokensCard d={d} /></div>
  </section>;
}
