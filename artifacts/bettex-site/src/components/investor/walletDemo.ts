import { tokenomics } from '../../lib/tokenomics.ts';

export type TransferKind = 'deposit' | 'withdraw';
export type WithdrawalKind = 'externalWithdraw' | 'personalReaisWithdraw';
export type MovementKind = TransferKind | WithdrawalKind | 'externalDeposit' | 'purchase'
  | 'bettexReaisTransfer' | 'bettexExternalWithdraw' | 'bettexReaisWithdraw';
export type TransferStatus = 'pending' | 'completed';

export type DemoTransfer = {
  id: string;
  kind: MovementKind;
  amountCents: number;
  feeCents?: number; // Older local demonstration entries did not record a fee.
  costCents?: number; // BRL debited for a simulated purchase, fixed at the price when recorded.
  requestedAt: number;
  readyAt: number;
  status: TransferStatus;
};

export type WalletDemoState = {
  personalTokensCents: number;
  allocatedTokensCents: number;
  personalReaisCents: number;
  allocatedReaisCents: number;
  /** Kept for compatibility with older saved demos; never applied to the clock. */
  clockOffsetMs: number;
  transfers: DemoTransfer[];
};

const STORAGE_KEY = 'bettex-wallet-demo-v1';
export const DAY_MS = 24 * 60 * 60 * 1000;
export const PERSONAL_REAIS_CENTS = 85000;
export const BETTEX_REAIS_CENTS = 12480;
export const TRANSFER_FEE_CENTS = 100; // 1 whole BETTEX, paid in addition to the amount sent.
export const PURCHASE_PRICE_CENTS = Math.round(tokenomics.priceBRL * 100);
// Only the visitor's active tokens vary in this local demo; other investors are illustrative.
export const OTHER_INVESTORS_ACTIVE_TOKENS = 116250;
export const EXAMPLE_DISTRIBUTION_REAIS_CENTS = 100000;

export const initialWalletDemo = (): WalletDemoState => ({
  personalTokensCents: 125000,
  allocatedTokensCents: 375000,
  personalReaisCents: PERSONAL_REAIS_CENTS,
  allocatedReaisCents: BETTEX_REAIS_CENTS,
  clockOffsetMs: 0,
  transfers: [],
});

function isSafeAmount(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isWholeTokens(value: unknown): value is number {
  return isSafeAmount(value) && value % 100 === 0;
}

function isValidTransfer(value: unknown): value is DemoTransfer {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<DemoTransfer>;
  const knownKind = entry.kind === 'deposit'
    || entry.kind === 'withdraw'
    || entry.kind === 'bettexReaisTransfer'
    || entry.kind === 'purchase'
    || entry.kind === 'externalDeposit'
    || entry.kind === 'externalWithdraw'
    || entry.kind === 'bettexExternalWithdraw'
    || entry.kind === 'personalReaisWithdraw'
    || entry.kind === 'bettexReaisWithdraw';
  if (typeof entry.id !== 'string' || !knownKind || !isSafeAmount(entry.amountCents) || entry.amountCents === 0) return false;
  if (entry.kind === 'deposit' || entry.kind === 'withdraw' || entry.kind === 'purchase' || entry.kind === 'externalDeposit' || entry.kind === 'externalWithdraw' || entry.kind === 'bettexExternalWithdraw') {
    if (!isWholeTokens(entry.amountCents)) return false;
  }
  if (entry.kind === 'purchase' ? !isSafeAmount(entry.costCents) || entry.costCents === 0 : entry.costCents !== undefined) return false;
  if (entry.feeCents !== undefined
    && (entry.kind === 'externalDeposit' || entry.kind === 'purchase' ? entry.feeCents !== 0 : entry.feeCents !== TRANSFER_FEE_CENTS)) return false;
  if (!isSafeAmount(entry.requestedAt) || !isSafeAmount(entry.readyAt)) return false;
  if (entry.status !== 'pending' && entry.status !== 'completed') return false;
  if ((entry.kind === 'externalDeposit' || entry.kind === 'purchase') && (entry.readyAt !== entry.requestedAt || entry.status !== 'completed')) return false;
  return true;
}

function isValidStateShape(value: unknown): value is {
  personalTokensCents: number;
  allocatedTokensCents: number;
  personalReaisCents?: number;
  allocatedReaisCents?: number;
  clockOffsetMs?: number;
  transfers: DemoTransfer[];
} {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<WalletDemoState>;
  return isWholeTokens(state.personalTokensCents)
    && isWholeTokens(state.allocatedTokensCents)
    && (state.personalReaisCents === undefined || isSafeAmount(state.personalReaisCents))
    && (state.allocatedReaisCents === undefined || isSafeAmount(state.allocatedReaisCents))
    && Array.isArray(state.transfers)
    && state.transfers.length <= 500
    && state.transfers.every(isValidTransfer)
    && !state.transfers.some((entry) => entry.status === 'pending'
      && entry.kind !== 'deposit' && entry.kind !== 'withdraw');
}

function completedOnLoad(state: WalletDemoState): { state: WalletDemoState; releasedPending: boolean } | null {
  let personalTokensCents = state.personalTokensCents;
  let allocatedTokensCents = state.allocatedTokensCents;
  let releasedPending = false;
  const transfers = state.transfers.map((transfer) => {
    if (transfer.status !== 'pending') return transfer;
    releasedPending = true;
    if (transfer.kind === 'deposit') allocatedTokensCents += transfer.amountCents;
    else personalTokensCents += transfer.amountCents;
    return { ...transfer, readyAt: transfer.requestedAt, status: 'completed' as const };
  });
  if (!isWholeTokens(personalTokensCents) || !isWholeTokens(allocatedTokensCents)) return null;
  return {
    state: { ...state, personalTokensCents, allocatedTokensCents, transfers, clockOffsetMs: 0 },
    releasedPending,
  };
}

function migratedState(value: unknown): WalletDemoState {
  const legacy = value as {
    personalTokensCents: number;
    allocatedTokensCents: number;
    personalReaisCents?: number;
    allocatedReaisCents?: number;
    transfers: DemoTransfer[];
  };
  return {
    personalTokensCents: legacy.personalTokensCents,
    allocatedTokensCents: legacy.allocatedTokensCents,
    personalReaisCents: legacy.personalReaisCents ?? PERSONAL_REAIS_CENTS,
    allocatedReaisCents: legacy.allocatedReaisCents ?? BETTEX_REAIS_CENTS,
    clockOffsetMs: 0,
    transfers: legacy.transfers,
  };
}

export function loadWalletDemo(): { state: WalletDemoState; warning: string | null } {
  if (typeof window === 'undefined') return { state: initialWalletDemo(), warning: null };
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { state: initialWalletDemo(), warning: null };
    const parsed: unknown = JSON.parse(saved);
    if (!isValidStateShape(parsed)) {
      return { state: initialWalletDemo(), warning: 'A demonstração anterior tinha frações ou dados inválidos. Os saldos fictícios foram reiniciados para usar apenas BETTEX inteiros.' };
    }
    const loaded = completedOnLoad(migratedState(parsed));
    if (!loaded) {
      return { state: initialWalletDemo(), warning: 'A demonstração anterior excedia os limites de saldo. Os saldos fictícios foram reiniciados.' };
    }
    const { state, releasedPending } = loaded;
    // Persist migrations so pending legacy transfers cannot be credited again on a later load.
    if (releasedPending || !('personalReaisCents' in parsed) || !('allocatedReaisCents' in parsed)
      || (parsed as Partial<WalletDemoState>).clockOffsetMs !== 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    return {
      state,
      warning: releasedPending ? 'Transferências internas pendentes de uma versão anterior foram liberadas e creditadas imediatamente.' : null,
    };
  } catch {
    return { state: initialWalletDemo(), warning: 'Não foi possível recuperar esta demonstração. Os saldos de exemplo foram reiniciados.' };
  }
}

export function saveWalletDemo(state: WalletDemoState): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function parseTokens(input: string): number | null {
  const normalized = input.trim();
  if (!/^\d+$/.test(normalized)) return null;
  const units = Number(normalized);
  const cents = units * 100;
  return Number.isSafeInteger(units) && units > 0 && Number.isSafeInteger(cents) ? cents : null;
}

export function parseReais(input: string): number | null {
  const normalized = input.trim();
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(normalized)) return null;
  const [unitsText, fractionalText = ''] = normalized.replace(',', '.').split('.');
  const units = Number(unitsText);
  const cents = units * 100 + Number(fractionalText.padEnd(2, '0'));
  return Number.isSafeInteger(units) && Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function nextCycleAt(now: number): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime();
}

function validateNow(now: number): void {
  if (!isSafeAmount(now)) throw new Error('Horário inválido para esta demonstração.');
}

function validateTokenAmount(amountCents: number): void {
  if (!isWholeTokens(amountCents) || amountCents === 0) {
    throw new Error('BETTEX só pode ser movimentado em unidades inteiras e positivas.');
  }
}

function addMovement(state: WalletDemoState, entry: DemoTransfer): WalletDemoState {
  return { ...state, transfers: [entry, ...state.transfers].slice(0, 500) };
}

export function requestTransfer(state: WalletDemoState, kind: TransferKind, amountCents: number, now: number): WalletDemoState {
  validateNow(now);
  validateTokenAmount(amountCents);
  if (kind !== 'deposit' && kind !== 'withdraw') throw new Error('Tipo de transferência inválido.');
  const isDeposit = kind === 'deposit';
  const source = isDeposit ? state.personalTokensCents : state.allocatedTokensCents;
  const destination = isDeposit ? state.allocatedTokensCents : state.personalTokensCents;
  const totalDebit = amountCents + TRANSFER_FEE_CENTS;
  const nextDestination = destination + amountCents;
  if (!Number.isSafeInteger(totalDebit) || !Number.isSafeInteger(nextDestination)) {
    throw new Error('Quantidade muito alta para esta demonstração.');
  }
  if (totalDebit > source) throw new Error('Saldo insuficiente na origem: você precisa da quantidade enviada mais 1 BETTEX de taxa.');
  const updated = {
    ...state,
    personalTokensCents: state.personalTokensCents + (isDeposit ? -totalDebit : amountCents),
    allocatedTokensCents: state.allocatedTokensCents + (isDeposit ? amountCents : -totalDebit),
  };
  return addMovement(updated, {
    id: `${now}-${state.transfers.length}`,
    kind,
    amountCents,
    feeCents: TRANSFER_FEE_CENTS,
    requestedAt: now,
    readyAt: now,
    status: 'completed',
  });
}

export function transferReaisToPersonal(state: WalletDemoState, amountCents: number, now: number): WalletDemoState {
  validateNow(now);
  if (!isSafeAmount(amountCents) || amountCents === 0) throw new Error('Digite um valor positivo em reais.');
  if (amountCents > state.allocatedReaisCents) throw new Error('Saldo em reais insuficiente na Carteira BETTEX.');
  if (state.allocatedTokensCents < TRANSFER_FEE_CENTS) {
    throw new Error('Saldo BETTEX insuficiente na Carteira BETTEX para a taxa de 1 BETTEX.');
  }
  const nextPersonalReais = state.personalReaisCents + amountCents;
  if (!Number.isSafeInteger(nextPersonalReais)) throw new Error('Valor muito alto para esta demonstração.');
  return addMovement({
    ...state,
    personalReaisCents: nextPersonalReais,
    allocatedReaisCents: state.allocatedReaisCents - amountCents,
    allocatedTokensCents: state.allocatedTokensCents - TRANSFER_FEE_CENTS,
  }, {
    id: `${now}-${state.transfers.length}`,
    kind: 'bettexReaisTransfer',
    amountCents,
    feeCents: TRANSFER_FEE_CENTS,
    requestedAt: now,
    readyAt: now,
    status: 'completed',
  });
}

export function depositIntoPersonal(state: WalletDemoState, amountCents: number, now: number): WalletDemoState {
  validateNow(now);
  validateTokenAmount(amountCents);
  const nextBalance = state.personalTokensCents + amountCents;
  if (!Number.isSafeInteger(nextBalance)) throw new Error('Quantidade muito alta para esta demonstração.');
  return addMovement({ ...state, personalTokensCents: nextBalance }, {
    id: `${now}-${state.transfers.length}`,
    kind: 'externalDeposit',
    amountCents,
    feeCents: 0,
    requestedAt: now,
    readyAt: now,
    status: 'completed',
  });
}

export function buyTokens(state: WalletDemoState, amountCents: number, now: number): WalletDemoState {
  validateNow(now);
  validateTokenAmount(amountCents);
  const costCents = (amountCents / 100) * PURCHASE_PRICE_CENTS;
  const nextTokens = state.personalTokensCents + amountCents;
  if (!Number.isSafeInteger(costCents) || !Number.isSafeInteger(nextTokens)) {
    throw new Error('Quantidade muito alta para esta demonstração.');
  }
  if (costCents > state.personalReaisCents) {
    throw new Error('Saldo em reais insuficiente na carteira pessoal para esta compra simulada.');
  }
  return addMovement({
    ...state,
    personalTokensCents: nextTokens,
    personalReaisCents: state.personalReaisCents - costCents,
  }, {
    id: `${now}-${state.transfers.length}`,
    kind: 'purchase',
    amountCents,
    costCents,
    feeCents: 0,
    requestedAt: now,
    readyAt: now,
    status: 'completed',
  });
}

export function withdrawFromWallet(
  state: WalletDemoState,
  kind: WithdrawalKind,
  amountCents: number,
  now: number,
): WalletDemoState {
  validateNow(now);
  if (!isSafeAmount(amountCents) || amountCents === 0) throw new Error('Digite uma quantidade positiva.');
  const isTokenWithdrawal = kind === 'externalWithdraw';
  if (isTokenWithdrawal) validateTokenAmount(amountCents);
  else if (kind !== 'personalReaisWithdraw') throw new Error('Tipo de saque inválido.');

  if (!isTokenWithdrawal && amountCents > state.personalReaisCents) throw new Error('Saldo em reais insuficiente para este saque.');
  const tokenDebit = isTokenWithdrawal ? amountCents + TRANSFER_FEE_CENTS : TRANSFER_FEE_CENTS;
  if (!Number.isSafeInteger(tokenDebit)) throw new Error('Quantidade muito alta para esta demonstração.');
  if (state.personalTokensCents < tokenDebit) throw new Error('Saldo BETTEX insuficiente para cobrir o saque e a taxa de 1 BETTEX.');

  const updated: WalletDemoState = {
    ...state,
    personalTokensCents: state.personalTokensCents - tokenDebit,
    personalReaisCents: state.personalReaisCents - (kind === 'personalReaisWithdraw' ? amountCents : 0),
  };
  return addMovement(updated, {
    id: `${now}-${state.transfers.length}`,
    kind,
    amountCents,
    feeCents: TRANSFER_FEE_CENTS,
    requestedAt: now,
    readyAt: now,
    status: 'completed',
  });
}

/** Compatibility helpers for older consumers; internal movements now settle immediately. */
export function settleTransfers(state: WalletDemoState, _now: number): WalletDemoState {
  return state;
}

export function pendingTokens(state: WalletDemoState, kind: TransferKind): number {
  return state.transfers.reduce((total, transfer) =>
    total + (transfer.kind === kind && transfer.status === 'pending' ? transfer.amountCents : 0), 0);
}

export function illustrativeParticipation(state: WalletDemoState) {
  const personalActiveCents = state.allocatedTokensCents;
  const totalActiveCents = OTHER_INVESTORS_ACTIVE_TOKENS * 100 + personalActiveCents;
  const share = personalActiveCents / totalActiveCents;
  return {
    personalActiveTokens: personalActiveCents / 100,
    totalActiveTokens: totalActiveCents / 100,
    percentage: share * 100,
    exampleShareReaisCents: Math.round(EXAMPLE_DISTRIBUTION_REAIS_CENTS * share),
  };
}