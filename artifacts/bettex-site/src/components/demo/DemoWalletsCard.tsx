/** @jsxImportSource react */
import { Link } from 'wouter';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { Money, type Asset, type Kind } from './fin';
import { WalletAction } from './WalletAction';
import { demoPath } from './demo-navigation';

export function DemoWalletsCard({ d, onWallet, showReceivedYield = false }: { d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void; showReceivedYield?: boolean }) {
  const { x, loc } = useX();
  return <section className="dcard grid gap-3 p-4 sm:p-5" data-testid="demo-session-wallets">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="display text-lg font-extrabold">{x('Minhas carteiras de teste', 'My test wallets', 'Mis carteras de prueba')}</h2><span className="rounded-full bg-[#DDEBE4] px-2 py-1 text-xs font-bold text-[#0A6657]">{x('Sessão de teste ativa', 'Test session active', 'Sesión de prueba activa')}</span></div>
    <p className="text-xs text-[#5B6B85]">{x('Período de testes ALFA. Carteiras e saldos emulados, sem dinheiro real. Estes identificadores não são endereços blockchain e não recebem depósitos externos.', 'ALFA testing period. Emulated wallets and balances, no real money. These identifiers are not blockchain addresses and cannot receive external deposits.', 'Período de pruebas ALFA. Carteras y saldos emulados, sin dinero real. Estos identificadores no son direcciones blockchain y no reciben depósitos externos.')}</p>
    <div className="grid gap-3 sm:grid-cols-2">{(['USDC', 'BETTEX'] as Asset[]).map(asset => <article key={asset} className="grid gap-2 rounded-xl border border-[#E4DCCB] p-3" data-testid={`demo-wallet-${asset.toLowerCase()}`}>
      <h3 className="text-sm font-bold">{asset === 'USDC' ? x('Carteira em dólares', 'Dollar wallet', 'Cartera en dólares') : x('Carteira BETTEX', 'BETTEX wallet', 'Cartera BETTEX')}</h3>
      <p className="break-all text-xs text-[#5B6B85]">{x('Identificador do teste', 'Test identifier', 'Identificador de prueba')}: {d.profile.accountId}/{asset}</p>
      <Money v={asset === 'USDC' ? d.balances.usdc : d.balances.bettex} a={asset} big />
      <div className="flex flex-wrap gap-2"><WalletAction kind={asset === 'USDC' ? 'onramp' : 'receive'} asset={asset} id={`demo-add-${asset}`} label={x('Adicionar saldo de teste', 'Add test balance', 'Agregar saldo de prueba')} onOpen={onWallet} />
        <WalletAction kind={asset === 'USDC' ? 'withdraw' : 'send'} asset={asset} id={`demo-out-${asset}`} label={x('Saída simulada', 'Simulated withdrawal', 'Salida simulada')} onOpen={onWallet} />
        <WalletAction kind="swap" asset={asset} id={`demo-swap-${asset}`} label={x('Conversão simulada', 'Simulated conversion', 'Conversión simulada')} onOpen={onWallet} /></div>
    </article>)}</div>
    {showReceivedYield && <p className="text-xs text-[#5B6B85]" data-testid="demo-received-yield">{x('Rendimento já recebido (emulado)', 'Yield already received (emulated)', 'Rendimiento ya recibido (emulado)')}: <b>{d.balances.receivedYield.toLocaleString(loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC</b></p>}
    <Link href={`${demoPath('account', loc)}?tab=wallets`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657]">{x('Gerenciar carteiras de teste', 'Manage test wallets', 'Gestionar carteras de prueba')}</Link>
  </section>;
}
