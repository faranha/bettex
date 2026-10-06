/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import type { ReactNode } from 'react';
import { useX } from './ui';
import { Money, type Asset, type Kind } from './fin';
import { WalletAction } from './WalletAction';
import { TokenIcon } from './TokenIcon';
import { Download } from 'lucide-react';

export function DemoWalletsCard({ d, onWallet, showReceivedYield = false, showHeading = true, headerActions, onExport, addresses }: { d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void; showReceivedYield?: boolean; showHeading?: boolean; headerActions?: ReactNode; onExport?: (asset: Asset) => void; addresses?: Partial<Record<Asset, string>> }) {
  const { x, loc } = useX();
  return <section className="dcard grid gap-3 p-4 sm:p-5" data-testid="demo-session-wallets">
    {(showHeading || headerActions) && <div className="flex flex-wrap items-center justify-between gap-2">{showHeading && <h2 className="display text-lg font-extrabold">{x('Minhas carteiras', 'My wallets', 'Mis carteras')}</h2>}{headerActions && <div className="ml-auto">{headerActions}</div>}</div>}
    <div className="grid gap-3 sm:grid-cols-2">{(['USDC', 'BETTEX'] as Asset[]).map(asset => <article key={asset} className={`dcard tk-card ${asset === 'USDC' ? 'tk-usdc' : 'tk-bettex'} grid gap-2 rounded-xl p-3`} data-testid={`demo-wallet-${asset.toLowerCase()}`}>
      <h3 className="flex items-center gap-2 text-sm font-bold"><TokenIcon asset={asset} />{asset === 'USDC' ? x('Carteira em dólares', 'Dollar wallet', 'Cartera en dólares') : x('Carteira BETTEX', 'BETTEX wallet', 'Cartera BETTEX')}</h3>
      {addresses?.[asset] && <p className="mono break-all text-xs text-[#5B6B85]" data-testid={`wallet-address-${asset}`}>{x('Endereço público', 'Public address', 'Dirección pública')}: {addresses[asset]}</p>}
      <Money v={asset === 'USDC' ? d.balances.usdc : d.balances.bettex} a={asset} big />
      <div className="flex flex-wrap gap-2"><WalletAction kind={asset === 'USDC' ? 'onramp' : 'receive'} asset={asset} id={`demo-add-${asset}`} label={x('Adicionar saldo', 'Add balance', 'Agregar saldo')} onOpen={onWallet} />
        <WalletAction kind={asset === 'USDC' ? 'withdraw' : 'send'} asset={asset} id={`demo-out-${asset}`} label={x('Retirar', 'Withdraw', 'Retirar')} onOpen={onWallet} />
        <WalletAction kind="swap" asset={asset} id={`demo-swap-${asset}`} label={x('Converter', 'Convert', 'Convertir')} onOpen={onWallet} /></div>
      {onExport && <button type="button" onClick={() => onExport(asset)} data-testid={`button-export-wallet-${asset}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-current px-3 text-sm font-bold"><Download className="h-4 w-4" aria-hidden="true" />{x('Exportar carteira', 'Export wallet', 'Exportar cartera')}</button>}
    </article>)}</div>
    {showReceivedYield && <p className="text-xs text-[#5B6B85]" data-testid="demo-received-yield">{x('Rendimento já recebido', 'Yield already received', 'Rendimiento ya recibido')}: <b>{d.balances.receivedYield.toLocaleString(loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC</b></p>}
  </section>;
}
