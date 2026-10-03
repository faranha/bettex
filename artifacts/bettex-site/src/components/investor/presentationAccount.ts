import type { PlatformId } from './presentationData';

// A single fictional account keeps all presentation screens consistent.
// These values are not fetched from an investor account or live BETTEX operations.
// Monetary cents are illustrative BRL display estimates, NOT USDC quantities,
// a live conversion rate or an offer price. Preserve that distinction in every view.
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
      detail: 'Exemplo · Crédito USDC confirmado, valor em moeda fiduciária estimado',
      direction: 'in' as const,
      amountCents: profitCents,
    },
    { label: 'Saque de USDC', detail: 'Exemplo · Valor em moeda fiduciária estimado', direction: 'out', amountCents: withdrawalsCents },
    {
      label: 'Compra concluída de BETTEX',
      detail: 'Exemplo · 1.000 BETTEX, valor em moeda fiduciária estimado',
      direction: 'out' as const,
      amountCents: purchaseCents,
    },
    { label: 'Depósito de USDC', detail: 'Exemplo · Após on-ramp externo, valor em moeda fiduciária estimado', direction: 'in', amountCents: depositsCents },
  ],
};

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatAccountMoney = (cents: number) => currency.format(cents / 100);
export const formatAccountTokens = (tokens: number) => tokens.toLocaleString('pt-BR');