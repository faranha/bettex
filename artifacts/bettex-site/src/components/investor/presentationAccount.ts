import { markets, type PlatformId } from './presentationData';

// A single fictional account keeps all presentation screens consistent.
// These values are not fetched from an investor account or live BETTEX operations.
const platformCreditsCents: Record<PlatformId, number> = {
  polymarket: 4820,
  robinhood: 3960,
  kalshi: 2710,
  duel: 1350,
};
const profitCents = Object.values(platformCreditsCents).reduce((sum, credit) => sum + credit, 0);
const depositsCents = 100000;
const withdrawalsCents = 40000;

export const presentationAccount = {
  tokens: 1000,
  activatedTokens: 800,
  depositsCents,
  withdrawalsCents,
  profitCents,
  availableCents: depositsCents + profitCents - withdrawalsCents,
  platformCreditsCents,
  movements: [
    ...markets.map((market) => ({
      label: `Operação BETTEX · ${market.platform}`,
      detail: `Hoje, 09:00 · ${market.label} · Lucro creditado`,
      direction: 'in' as const,
      amountCents: platformCreditsCents[market.platformId],
    })),
    { label: 'Saque por Pix', detail: 'Ontem, 16:30', direction: 'out', amountCents: withdrawalsCents },
    { label: 'Depósito por Pix', detail: 'Ontem, 10:00', direction: 'in', amountCents: depositsCents },
  ],
};

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatAccountMoney = (cents: number) => currency.format(cents / 100);
export const formatAccountTokens = (tokens: number) => tokens.toLocaleString('pt-BR');