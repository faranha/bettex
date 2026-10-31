import type { DemoBalances } from '@workspace/api-client-react';

export function exchangeRates(balances?: Pick<DemoBalances, 'brlPerUsdc' | 'bettexUsdc'>) {
  if (!balances || !Number.isFinite(balances.brlPerUsdc) || balances.brlPerUsdc <= 0
    || !Number.isFinite(balances.bettexUsdc) || balances.bettexUsdc <= 0) return null;
  const bettexBrl = balances.bettexUsdc * balances.brlPerUsdc;
  if (!Number.isFinite(bettexBrl)) return null;
  return { usdBrl: balances.brlPerUsdc, bettexUsd: balances.bettexUsdc, bettexBrl };
}
