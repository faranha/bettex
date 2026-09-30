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
  purchase: {
    title: 'Comprar BETTEX',
    description: 'Compra fictícia: desconta reais de exemplo da carteira pessoal e credita BETTEX inteiros nela. Não há cobrança, emissão ou reserva de tokens reais.',
    currency: 'BETTEX', source: 'personal', confirm: 'Confirmar compra simulada',
  },
  deposit: {
    title: 'Transferir BETTEX para a Carteira BETTEX',
    description: 'Origem: carteira pessoal fictícia → Carteira BETTEX fictícia. Crédito imediato só nesta demonstração; regras de staking real ainda em discussão.',
    currency: 'BETTEX', source: 'personal', confirm: 'Confirmar transferência',
  },
  withdraw: {
    title: 'Retirar BETTEX para a carteira pessoal',
    description: 'Origem: Carteira BETTEX fictícia → carteira pessoal fictícia. Crédito imediato só nesta demonstração; não é um saque de lucros em USDC.',
    currency: 'BETTEX', source: 'bettex', confirm: 'Confirmar transferência',
  },
  bettexReaisTransfer: {
    title: 'Sacar reais para a carteira pessoal',
    description: 'Origem: saldo em reais da Carteira BETTEX → saldo em reais da carteira pessoal. Crédito imediato nesta demonstração; não é um saque externo.',
    currency: 'BRL', source: 'bettex', confirm: 'Confirmar transferência',
  },
  externalDeposit: {
    title: 'Depositar BETTEX na carteira pessoal',
    description: 'Depósito fictício e imediato. Não há endereço de depósito nem recebimento de cripto real.',
    currency: 'BETTEX', source: 'personal', confirm: 'Adicionar BETTEX de exemplo',
  },
  externalWithdraw: {
    title: 'Retirar BETTEX da carteira pessoal',
    description: 'Simule a saída fictícia de BETTEX da carteira pessoal. Nenhum token será enviado a um endereço real; não é um saque de lucros em USDC.',
    currency: 'BETTEX', source: 'personal', confirm: 'Confirmar saque simulado',
  },
  bettexExternalWithdraw: {
    title: 'Saque externo antigo da Carteira BETTEX',
    description: 'Movimentação antiga da demonstração: saída externa simulada diretamente da Carteira BETTEX.',
    currency: 'BETTEX', source: 'bettex', confirm: 'Confirmar saque simulado',
  },
  personalReaisWithdraw: {
    title: 'Sacar reais da carteira pessoal',
    description: 'Simule um saque imediato do saldo em reais da carteira pessoal. Nenhum pagamento real será realizado.',
    currency: 'BRL', source: 'personal', confirm: 'Confirmar saque simulado',
  },
  bettexReaisWithdraw: {
    title: 'Saque externo antigo em reais da Carteira BETTEX',
    description: 'Movimentação antiga da demonstração: saída externa simulada diretamente da Carteira BETTEX.',
    currency: 'BRL', source: 'bettex', confirm: 'Confirmar saque simulado',
  },
};