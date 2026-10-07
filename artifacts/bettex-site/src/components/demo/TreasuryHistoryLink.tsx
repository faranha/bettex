/** @jsxImportSource react */
import { History } from 'lucide-react';
import { Link } from 'wouter';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { historyQuery } from '../history/history-selection';

export function TreasuryHistoryLink({ account, asset, id }: {
  account: 'treasury' | 'buyback'; asset: 'USDC' | 'BETTEX'; id: string;
}) {
  const { x, loc } = useX();
  const name = account === 'buyback' ? x('Recompra', 'Buyback', 'Recompra') : x('Tesouraria', 'Treasury', 'Tesorería');
  const label = x(`Abrir histórico: ${name} · ${asset}`, `Open history: ${name} · ${asset}`, `Abrir historial: ${name} · ${asset}`);
  return <Link href={`${demoPath('wallet', loc)}${historyQuery('treasury', { treasuryAccount: account, treasuryAsset: asset })}#treasury-statement`}
    data-testid={id} aria-label={label} title={label}
    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] text-[#1B2A41] hover:bg-[#F0E9DA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]">
    <History className="h-5 w-5" aria-hidden="true" />
  </Link>;
}
