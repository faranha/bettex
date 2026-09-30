import type { AgentKind } from '@/components/hero/AgentMark';

// A single fictional account keeps all presentation screens consistent.
// These values are not fetched from an investor account or agent operations.
const agentCreditsCents: Record<AgentKind, number> = {
  predix: 4820,
  tradex: 3960,
  sportix: 2710,
  bettix: 1350,
};
const profitCents = Object.values(agentCreditsCents).reduce((sum, credit) => sum + credit, 0);
const depositsCents = 100000;
const withdrawalsCents = 40000;

export const presentationAccount = {
  tokens: 1000,
  activatedTokens: 800,
  depositsCents,
  withdrawalsCents,
  profitCents,
  availableCents: depositsCents + profitCents - withdrawalsCents,
  agentCreditsCents,
  movements: [
    { label: 'Crédito de lucro', detail: 'Hoje, 09:00', direction: 'in', amountCents: profitCents },
    { label: 'Saque por Pix', detail: 'Ontem, 16:30', direction: 'out', amountCents: withdrawalsCents },
    { label: 'Depósito por Pix', detail: 'Ontem, 10:00', direction: 'in', amountCents: depositsCents },
  ],
};

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatAccountMoney = (cents: number) => currency.format(cents / 100);
export const formatAccountTokens = (tokens: number) => tokens.toLocaleString('pt-BR');