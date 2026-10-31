import type { DemoDashboard } from '@workspace/api-client-react';

export function burnOf(d: DemoDashboard) {
  // Native profiles never receive modeled data.
  if (d.profile.provider === 'native') return null;
  return d.treasury?.burn ?? null;
}
export function burnFl(loc: string) { return loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES'; }
export const nf = (fl: string, n: number, dg = 2) => n.toLocaleString(fl, { minimumFractionDigits: dg, maximumFractionDigits: Math.max(dg, 6) });
