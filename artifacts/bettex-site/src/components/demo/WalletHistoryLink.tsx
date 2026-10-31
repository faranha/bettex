/** @jsxImportSource react */
import { History } from 'lucide-react';
import { Link } from 'wouter';
import { demoPath } from './demo-navigation';
import { useX } from './ui';
import { historyQuery } from '../history/history-selection';

export function WalletHistoryLink({ wallet, id, className = 'border-current bg-white/10 hover:bg-white/20' }: {
  wallet: 'USDC' | 'BETTEX' | 'ETH' | 'earnings';
  id: string;
  className?: string;
}) {
  const { x, loc } = useX();
  const name = wallet === 'earnings' ? x('Rendimentos', 'Earnings', 'Ganancias') : wallet;
  const label = x(`Abrir histórico: ${name}`, `Open history: ${name}`, `Abrir historial: ${name}`);
  return <Link href={`${demoPath('wallet', loc)}${historyQuery('wallets', { wallet })}#wallet-statement`} data-testid={id}
    aria-label={label} title={label}
    className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${className}`}>
    <History className="h-5 w-5 shrink-0" aria-hidden="true" />
  </Link>;
}
