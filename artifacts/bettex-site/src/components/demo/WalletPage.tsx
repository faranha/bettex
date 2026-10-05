/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { Money, type Asset, type Kind } from './fin';
import { WalletAction } from './WalletAction';
import { History } from './Views';
import { PreviousCycle } from './PreviousCycle';
import { HistoryPanel } from '../history/HistoryPanel';
import { TestContractPanel } from './TestContractPanel';

export function WalletPage({ d, onWallet }: { d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void }) {
  const { x } = useX();
  const b = d.balances;
  const usdcActions: [Kind, string, string][] = [
    ['onramp', 'add-credit', x('Adicionar crédito', 'Add credit', 'Agregar crédito')],
    ['withdraw', 'withdraw-usdc', x('Sacar dólares para carteira cripto', 'Withdraw dollars to crypto wallet', 'Retirar dólares a cartera cripto')],
    ['swap', 'swap-usdc', x('Converter USDC em BETTEX', 'Convert USDC to BETTEX', 'Convertir USDC en BETTEX')],
  ];
  const bettexActions: [Kind, string, string][] = [
    ['receive', 'add-bettex', x('Adicionar BETTEX', 'Add BETTEX', 'Agregar BETTEX')],
    ['send', 'send-bettex', x('Transferir BETTEX para carteira externa', 'Transfer BETTEX to external wallet', 'Transferir BETTEX a cartera externa')],
    ['swap', 'swap-bettex', x('Converter BETTEX em USDC', 'Convert BETTEX to USDC', 'Convertir BETTEX en USDC')],
  ];
  const card = (asset: Asset, title: string, value: number, acts: typeof usdcActions) => (
    <section className="dcard p-4 sm:p-5" data-testid={`wallet-${asset.toLowerCase()}`}>
      <p className="text-xs font-semibold text-[#5B6B85]">{title}</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <Money v={value} a={asset} big />
        <div className="flex shrink-0 gap-2">
          {acts.map(([k, id, label]) => <WalletAction key={id} kind={k} asset={asset} id={id} label={label} onOpen={onWallet} />)}
        </div>
      </div>
    </section>
  );
  return <div className="grid gap-4" data-testid="page-wallet">
    <h1 className="display text-2xl font-extrabold tracking-tight" data-testid="text-wallet-title">{x('Saldo e histórico', 'Balance and history', 'Saldo e historial')}</h1>
    <div className="grid gap-3 md:grid-cols-2">
      {card('USDC', x('Saldo em dólares', 'Dollar balance', 'Saldo en dólares'), b.usdc, usdcActions)}
      {card('BETTEX', x('Saldo em BETTEX', 'BETTEX balance', 'Saldo en BETTEX'), b.bettex, bettexActions)}
    </div>
    <PreviousCycle d={d} />
    <TestContractPanel />
    <section className="dcard p-4 sm:p-5">
      <h3 className="display mb-2 text-base font-extrabold">{x('Extrato', 'Statement', 'Extracto')}</h3>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#5B6B85]"><span>{x('Total recebido em ciclos anteriores', 'Total received in past cycles', 'Total recibido en ciclos anteriores')}</span><Money v={b.receivedYield} a="USDC" /></div>
      <History d={d} />
    </section>
    <div className="dcard p-4 sm:p-5"><HistoryPanel mode="demo" accountKey={d.profile.accountId} /></div>
  </div>;
}
