import type { ReactNode } from 'react';
import { CircleHelp } from 'lucide-react';

// Context and API stubs for the extracted, read-only component preview.
export type TreasuryStatementBalance = {
  account: 'treasury' | 'buyback'; asset: string; reconciled: boolean;
  opening: string | null; closing: string | null; inflows: string;
  outflows: string; income: string; otherIncome: string | null;
};
export type TreasuryStatementPage = {
  from: string; to: string; balances: TreasuryStatementBalance[];
};
export function useX() {
  const lang = new URLSearchParams(window.location.search).get('lang');
  const loc = lang === 'pt' || lang === 'es' ? lang : 'en';
  return { loc, x: (pt: string, en: string, es: string) => loc === 'pt' ? pt : loc === 'es' ? es : en };
}
export function TreasuryTerm({ children, tip }: { children: ReactNode; tip: string }) {
  return <span className="inline-flex items-center gap-1">{children}<CircleHelp aria-label={tip} className="h-3 w-3 shrink-0 opacity-60" /></span>;
}
export const statement: TreasuryStatementPage = {
  from: '2026-10-07', to: '2026-10-08',
  balances: [{ account: 'treasury', asset: 'USDC', reconciled: true,
    opening: '236483.333333', inflows: '14611.766667', outflows: '7684.255971',
    closing: '243410.844029', income: '7914.766667', otherIncome: null }],
};
