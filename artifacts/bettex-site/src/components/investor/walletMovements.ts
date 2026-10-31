import type { MovementKind } from './walletDemo';

export const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const tokens = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const dollars = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const DEMO_BRL_PER_USDC = 5;
export const formatTokens = (cents: number) => `${tokens.format(cents / 100)} BETTEX`;
export const formatUsdc = (cents: number) => `${dollars.format(cents / 100)} USDC`;
export const formatUsdcInReais = (cents: number) => reais.format(cents / 100 * DEMO_BRL_PER_USDC);

type MovementDefinition = {
  title: string;
  description: string;
  currency: 'BRL' | 'BETTEX' | 'USDC';
  source: 'personal' | 'bettex' | 'system';
  confirm: string;
};

export const movements: Record<MovementKind, MovementDefinition> = {
  purchase: {
    title: 'Compra simulada antiga de BETTEX',
    description: 'Registro de uma versão anterior da demonstração.',
    currency: 'BETTEX', source: 'personal', confirm: '',
  },
  deposit: {
    title: 'Depositar BETTEX na Carteira BETTEX',
    description: 'Transfere BETTEX da carteira pessoal para a Carteira BETTEX. Na simulação, os tokens ficam elegíveis imediatamente; não há taxa do projeto.',
    currency: 'BETTEX', source: 'personal', confirm: 'Confirmar depósito simulado',
  },
  withdraw: {
    title: 'Retirar BETTEX do staking',
    description: 'Retirar BETTEX, mesmo parcialmente, cancela todos os créditos anteriores ainda não pagos do ciclo e zera o peso acumulado. USDC já recebido não é retirado.',
    currency: 'BETTEX', source: 'bettex', confirm: 'Confirmar retirada simulada',
  },
  bettexReaisTransfer: {
    title: 'Registro antigo em reais · transferência interna',
    description: 'Histórico de uma versão anterior; não é saldo em USDC.',
    currency: 'BRL', source: 'bettex', confirm: '',
  },
  externalDeposit: {
    title: 'Adicionar BETTEX de exemplo',
    description: 'Adiciona tokens fictícios à carteira pessoal. Não há depósito real nem endereço de recebimento.',
    currency: 'BETTEX', source: 'system', confirm: 'Adicionar BETTEX fictícios',
  },
  externalWithdraw: {
    title: 'Retirar BETTEX da carteira pessoal',
    description: 'A saída de BETTEX cancela todos os créditos anteriores ainda não pagos do ciclo e zera o peso acumulado, mesmo quando parcial. Sacar USDC é uma operação distinta.',
    currency: 'BETTEX', source: 'personal', confirm: 'Confirmar retirada simulada',
  },
  bettexExternalWithdraw: {
    title: 'Registro antigo · saída de BETTEX',
    description: 'Movimentação antiga da demonstração.',
    currency: 'BETTEX', source: 'bettex', confirm: '',
  },
  personalReaisWithdraw: {
    title: 'Registro antigo em reais · saída externa',
    description: 'Histórico de uma versão anterior; não é saque disponível.',
    currency: 'BRL', source: 'personal', confirm: '',
  },
  bettexReaisWithdraw: {
    title: 'Registro antigo em reais · saída da Carteira BETTEX',
    description: 'Histórico de uma versão anterior; não é saque disponível.',
    currency: 'BRL', source: 'bettex', confirm: '',
  },
  distribution: {
    title: 'Distribuição simulada atribuída',
    description: 'Lucro elegível do fechamento ilustrativo creditado na Carteira BETTEX.',
    currency: 'USDC', source: 'system', confirm: '',
  },
  profitTransfer: {
    title: 'Transferir lucro para carteira pessoal',
    description: 'Transfere USDC da Carteira BETTEX para a carteira pessoal. Nenhum USDC real se move.',
    currency: 'USDC', source: 'bettex', confirm: 'Confirmar transferência simulada',
  },
  profitWithdraw: {
    title: 'Sacar lucro em USDC',
    description: 'Simula saída da carteira pessoal para um endereço compatível com Arbitrum One. Nenhuma transação blockchain será feita.',
    currency: 'USDC', source: 'personal', confirm: 'Confirmar saque simulado',
  },
};

export const formatMovementAmount = (kind: MovementKind, cents: number) =>
  movements[kind].currency === 'BRL' ? reais.format(cents / 100)
    : movements[kind].currency === 'USDC' ? formatUsdc(cents) : formatTokens(cents);