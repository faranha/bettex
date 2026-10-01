import type { PlatformId } from './presentationData';

// A single fictional account keeps all presentation screens consistent.
// These values are not fetched from an investor account or live BETTEX operations.
const platformAttributionCents: Record<PlatformId, number> = {
  polymarket: 4820,
  robinhood: 3960,
  kalshi: 2710,
  duel: 1350,
};
const profitCents = Object.values(platformAttributionCents).reduce((sum, amount) => sum + amount, 0);
const depositsCents = 400000;
const purchaseCents = 300000;
const withdrawalsCents = 40000;

export const presentationAccount = {
  tokens: 1000,
  depositsCents,
  purchaseCents,
  withdrawalsCents,
  profitCents,
  availableCents: depositsCents - purchaseCents + profitCents - withdrawalsCents,
  platformAttributionCents,
  movements: [
    {
      label: 'Distribuição diária BETTEX',
      detail: 'Hoje, 09:00 · Crédito consolidado em reais',
      direction: 'in' as const,
      amountCents: profitCents,
    },
    { label: 'Saque por Pix', detail: 'Ontem, 16:30', direction: 'out', amountCents: withdrawalsCents },
    {
      label: 'Compra concluída de BETTEX',
      detail: 'Pré-venda · 1.000 BETTEX a R$ 3,00',
      direction: 'out' as const,
      amountCents: purchaseCents,
    },
    { label: 'Depósito por Pix', detail: 'Ontem, 10:00', direction: 'in', amountCents: depositsCents },
  ],
};

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatAccountMoney = (cents: number) => currency.format(cents / 100);
export const formatAccountTokens = (tokens: number) => tokens.toLocaleString('pt-BR');