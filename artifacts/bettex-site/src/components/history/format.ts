export const DEC: Record<string, number> = { USDC: 6, BETTEX: 18, ETH: 18 };
export function historyLegDecimals(data: Record<string, unknown>, leg: 'paid' | 'received', fallbackAsset?: string | null): number {
  const explicit = data[`${leg}Decimals`];
  const decimals = typeof explicit === 'number' ? explicit : typeof explicit === 'string' && /^\d{1,2}$/.test(explicit) ? Number(explicit) : NaN;
  if (Number.isInteger(decimals) && decimals >= 0 && decimals <= 36) return decimals;
  const asset = typeof data[`${leg}Asset`] === 'string' ? data[`${leg}Asset`] as string : fallbackAsset ?? '';
  if (DEC[asset] !== undefined) return DEC[asset]!;
  const common = typeof data.decimals === 'number' ? data.decimals : typeof data.decimals === 'string' && /^\d{1,2}$/.test(data.decimals) ? Number(data.decimals) : NaN;
  return Number.isInteger(common) && common >= 0 && common <= 36 ? common : 18;
}
export function formatUnits(raw: unknown, decimals: number): string {
  let s = typeof raw === 'string' ? raw : typeof raw === 'number' && Number.isInteger(raw) ? String(raw) : '';
  if (!/^-?\d+$/.test(s) || !Number.isInteger(decimals) || decimals < 0 || decimals > 36) return '—';
  const neg = s.startsWith('-'); if (neg) s = s.slice(1);
  const b = BigInt(s); const base = 10n ** BigInt(decimals);
  const whole = (b / base).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const frac = (b % base).toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${neg ? '-' : ''}${whole}${frac ? `,${frac}` : ''}`;
}
export const fmtTime = (iso?: string | null, loc = 'pt') => {
  if (!iso) return '—';
  const d = new Date(iso); if (isNaN(d.getTime())) return '—';
  return d.toLocaleString(loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium' });
};
export const ALLOWED = ['paidAsset','paidUnits','receivedAsset','receivedUnits','principalUnits','feeUnits','gasWei','priceUnits','priceDecimals','quantityUnits','eligibleUnits','ruleVersion','periodId','poolUnits','weightUnits','amountUnits','decimals','reason','targetWallet','from','to','trigger','previousState'] as const;
