import { getFormatLocale } from '../../lib/i18n';

// Receita Federal data reported by Valor Investe, 24 September 2026.
// Calendar days: crypto operates seven days a week.
const cryptoFirstHalf2026Brl = 283_000_000_000;
const cryptoPeriodDays = (Date.UTC(2026, 6, 1) - Date.UTC(2026, 0, 1)) / 86_400_000;

export const marketFlow = {
  cryptoFirstHalf2026Brl,
  cryptoPeriodDays,
  cryptoDailyAverageBrl: cryptoFirstHalf2026Brl / cryptoPeriodDays,
  cryptoSourceUrl: 'https://valorinveste.globo.com/mercados/cripto/noticia/2026/09/24/pessoa-fisica-some-de-parte-do-mercado-cripto-mas-empresas-movimentam-bilhoes-entenda.ghtml',
} as const;

// This is gross crypto operations volume, not solely speculative investment.
// Do not add it to betting deposits as a measured, deduplicated capital pool.
export function formatCryptoDailyBillions() {
  return new Intl.NumberFormat(getFormatLocale(), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(marketFlow.cryptoDailyAverageBrl / 1_000_000_000);
}