/** @jsxImportSource react */
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { demoPath } from '../demo/demo-navigation';
import { TreasuryWallets } from '../demo/TreasuryWallets';
import { TreasuryDemoProvider } from './TreasuryDemoProvider';

/** Compact Treasury entry for the home: the same wallets, without the detailed round summary. */
export function TreasuryHomeEntry({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const r = d.treasury.currentRound;
  if (!r) return null;
  return <TreasuryDemoProvider><section className="dcard grid min-w-0 gap-3 p-4 sm:p-5" data-testid="home-treasury">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="display text-lg font-extrabold">{x('Tesouraria', 'Treasury', 'Tesorería')}</h2>
      <Link href={demoPath('treasury', loc)} data-testid="link-home-treasury" className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#D8CFBB] bg-[#FFFCF6] px-3 text-sm font-bold text-[#0A6657]">{x('Abrir Tesouraria completa', 'Open full Treasury', 'Abrir Tesorería completa')}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
    <p className="text-xs text-[#5B6B85]">{x('Carteiras de exemplo ilustrativas, sem fundos reais.', 'Illustrative sample wallets, no real funds.', 'Carteras de ejemplo ilustrativas, sin fondos reales.')}</p>
    <TreasuryWallets visualDemo d={d} r={r} layout="compact" />
  </section></TreasuryDemoProvider>;
}
