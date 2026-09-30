import type { MovementKind } from './walletDemo';

export const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const tokens = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
export const formatTokens = (cents: number) => `${tokens.format(cents / 100)} BETTEX`;
export const formatMovementAmount = (kind: MovementKind, cents: number) =>
  movements[kind].currency === 'BRL' ? reais.format(cents / 100) : formatTokens(cents);

type MovementDefinition = {
  title: string;
  description: string;
  currency: 'BRL' | 'BETTEX';
  source: 'personal' | 'bettex';
  confirm: string;
};

export const movements: Record<MovementKind, MovementDefinition> = {
  deposit: {
    title: 'Transferir BETTEX para a Carteira BETTEX',
    description: 'Crédito imediato na Carteira BETTEX nesta demonstração. Os tokens creditados passam a participar do cálculo proporcional.',
    currency: 'BETTEX', source: 'personal', confirm: 'Confirmar transferência',
  },
  withdraw: {
    title: 'Transferir BETTEX para a carteira pessoal',
    description: 'Crédito imediato na carteira pessoal nesta demonstração. Não é um saque externo.',
    currency: 'BETTEX', source: 'bettex', confirm: 'Confirmar transferência',
  },
  externalDeposit: {
    title: 'Depositar BETTEX na carteira pessoal',
    description: 'Depósito fictício e imediato. Não há endereço de depósito nem recebimento de cripto real.',
    currency: 'BETTEX', source: 'personal', confirm: 'Adicionar BETTEX de exemplo',
  },
  externalWithdraw: {
    title: 'Sacar BETTEX da carteira pessoal',
    description: 'Simule a saída imediata de BETTEX para fora da plataforma. Nenhum token será enviado a um endereço real.',
    currency: 'BETTEX', source: 'personal', confirm: 'Confirmar saque simulado',
  },
  personalReaisWithdraw: {
    title: 'Sacar reais da carteira pessoal',
    description: 'Simule um saque imediato do saldo em reais da carteira pessoal. Nenhum pagamento real será realizado.',
    currency: 'BRL', source: 'personal', confirm: 'Confirmar saque simulado',
  },
  bettexReaisWithdraw: {
    title: 'Sacar reais da Carteira BETTEX',
    description: 'Simule um saque imediato do saldo em reais da Carteira BETTEX. Nenhum pagamento real será realizado.',
    currency: 'BRL', source: 'bettex', confirm: 'Confirmar saque simulado',
  },
};