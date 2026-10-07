/** @jsxImportSource react */
import { History } from 'lucide-react';
import { Link } from 'wouter';
import { demoPath } from './demo-navigation';
import { useX } from './ui';

export function WalletHistoryLink({ wallet, id, className = 'border-current bg-white/10 hover:bg-white/20' }: {
  wallet: 'USDC' | 'BETTEX' | 'ETH' | 'earnings';
  id: string;
  className?: string;
}) {
  const { x, loc } = useX();
  const name = wallet === 'earnings' ? x('Rendimentos', 'Earnings', 'Ganancias') : wallet;
  return <Link href={`${demoPath('wallet', loc)}?wallet=${wallet}`} data-testid={id}
    aria-label={x(`Abrir histórico: ${name}`, `Open history: ${name}`, `Abrir historial: ${name}`)}
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${className}`}>
    <History className="h-4 w-4 shrink-0" aria-hidden="true" />
    {x('Histórico', 'History', 'Historial')}
  </Link>;
}
