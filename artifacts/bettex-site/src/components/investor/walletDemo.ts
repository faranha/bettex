export type TransferKind = 'deposit' | 'withdraw';
export type WithdrawalKind = 'externalWithdraw';
export type LegacyMovementKind = 'externalDeposit' | 'purchase' | 'bettexReaisTransfer'
  | 'bettexExternalWithdraw' | 'personalReaisWithdraw' | 'bettexReaisWithdraw';
export type MovementKind = TransferKind | WithdrawalKind | LegacyMovementKind
  | 'distribution' | 'profitTransfer' | 'profitWithdraw';
export type TransferStatus = 'pending' | 'completed';

export type DemoTransfer = {
  id: string;
  kind: MovementKind;
  amountCents: number;
  feeCents?: number;
  /** Preserved only on historical purchase entries from the previous demo. */
  costCents?: number;
  requestedAt: number;
  readyAt: number;
  status: TransferStatus;
  destinationAddress?: string;
  periodIndex?: number;
  periodStartAt?: number;
  periodEndAt?: number;
};

export type DemoStakeChange = {
  at: number;
  allocatedTokensCents: number;
};

export type WalletDemoState = {
  personalTokensCents: number;
  allocatedTokensCents: number;
  personalUsdcCents: number;
  allocatedUsdcCents: number;
  legacyPersonalReaisCents: number;
  legacyAllocatedReaisCents: number;
  transfers: DemoTransfer[];
  distributionPeriods: number;
  totalUsdcDistributedCents: number;
  totalUsdcWithdrawnCents: number;
  /** Absolute post-change eligible stake snapshots used for UTC month weighting. */
  stakeChanges: DemoStakeChange[];
  /** Start of the next fictional UTC calendar month to distribute, if a period has begun. */
  nextDistributionStartAt: number | null;
};

const STORAGE_KEY = 'bettex-wallet-demo-v2';
const LEGACY_STORAGE_KEY = 'bettex-wallet-demo-v1';
export const TRANSFER_FEE_CENTS = 0;
export const OTHER_INVESTORS_ACTIVE_TOKENS = 116_250;
export const DISTRIBUTION_NET_RESULT_CENTS = 100_000;
export const DISTRIBUTION_SHARE_BASIS_POINTS = 5_000;
export const DISTRIBUTABLE_CENTS = DISTRIBUTION_NET_RESULT_CENTS * DISTRIBUTION_SHARE_BASIS_POINTS / 10_000;
export const MAX_DISTRIBUTION_PERIODS = 12;

const INITIAL_PERSONAL_TOKENS_CENTS = 125_000;
const INITIAL_ALLOCATED_TOKENS_CENTS = 375_000;
const INITIAL_DISTRIBUTION_CENTS = 1_563;
const HISTORICAL_DISTRIBUTION_AT = Date.UTC(2025, 0, 1);
const LEGACY_PERSONAL_REAIS_SEED_CENTS = 85_000;
const LEGACY_ALLOCATED_REAIS_SEED_CENTS = 12_480;

export const initialWalletDemo = (): WalletDemoState => ({
  personalTokensCents: INITIAL_PERSONAL_TOKENS_CENTS,
  allocatedTokensCents: INITIAL_ALLOCATED_TOKENS_CENTS,
  personalUsdcCents: 0,
  allocatedUsdcCents: INITIAL_DISTRIBUTION_CENTS,
  legacyPersonalReaisCents: 0,
  legacyAllocatedReaisCents: 0,
  transfers: [{
    id: 'historical-distribution-1',
    kind: 'distribution',
    amountCents: INITIAL_DISTRIBUTION_CENTS,
    feeCents: 0,
    requestedAt: HISTORICAL_DISTRIBUTION_AT,
    readyAt: HISTORICAL_DISTRIBUTION_AT,
    status: 'completed',
    periodIndex: 1,
    periodStartAt: HISTORICAL_DISTRIBUTION_AT,
    periodEndAt: Date.UTC(2025, 1, 1),
  }],
  distributionPeriods: 1,
  totalUsdcDistributedCents: INITIAL_DISTRIBUTION_CENTS,
  totalUsdcWithdrawnCents: 0,
  stakeChanges: [{ at: 0, allocatedTokensCents: INITIAL_ALLOCATED_TOKENS_CENTS }],
  nextDistributionStartAt: null,
});

function isSafeAmount(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isPositiveSafeAmount(value: unknown): value is number {
  return isSafeAmount(value) && value > 0;
}

function isWholeTokens(value: unknown): value is number {
  return isSafeAmount(value) && value % 100 === 0;
}

function isUtcMonthStart(value: number): boolean {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    && date.getUTCDate() === 1
    && date.getUTCHours() === 0
    && date.getUTCMinutes() === 0
    && date.getUTCSeconds() === 0
    && date.getUTCMilliseconds() === 0;
}

function isValidEvmAddress(value: unknown): value is string {
  return typeof value === 'string' && /^0x[0-9a-fA-F]{40}$/.test(value);
}

const LEGACY_KINDS: LegacyMovementKind[] = [
  'externalDeposit',
  'purchase',
  'bettexReaisTransfer',
  'bettexExternalWithdraw',
  'personalReaisWithdraw',
  'bettexReaisWithdraw',
];

function isValidTransfer(value: unknown): value is DemoTransfer {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<DemoTransfer>;
  const kind = entry.kind;
  const knownKind = kind === 'deposit' || kind === 'withdraw' || kind === 'externalWithdraw'
    || kind === 'distribution' || kind === 'profitTransfer' || kind === 'profitWithdraw'
    || LEGACY_KINDS.includes(kind as LegacyMovementKind);
  if (typeof entry.id !== 'string' || entry.id.length === 0 || !knownKind || !isSafeAmount(entry.amountCents)) return false;
  if (kind === 'distribution') {
    if (!isSafeAmount(entry.amountCents) || !isPositiveSafeAmount(entry.periodIndex)) return false;
  } else if (!isPositiveSafeAmount(entry.amountCents)) return false;

  if (kind === 'deposit' || kind === 'withdraw' || kind === 'externalWithdraw'
    || kind === 'externalDeposit' || kind === 'purchase' || kind === 'bettexExternalWithdraw') {
    if (!isWholeTokens(entry.amountCents) || entry.amountCents === 0) return false;
  }
  if (kind === 'purchase'
    ? !isPositiveSafeAmount(entry.costCents)
    : entry.costCents !== undefined) return false;
  if (kind === 'profitWithdraw'
    ? !isValidEvmAddress(entry.destinationAddress)
    : entry.destinationAddress !== undefined) return false;

  const isLegacy = LEGACY_KINDS.includes(kind as LegacyMovementKind)
    || kind === 'deposit' || kind === 'withdraw' || kind === 'externalWithdraw';
  if (entry.feeCents !== undefined) {
    if (!isSafeAmount(entry.feeCents)) return false;
    if (!isLegacy && entry.feeCents !== TRANSFER_FEE_CENTS) return false;
  }
  if (!isSafeAmount(entry.requestedAt) || !isSafeAmount(entry.readyAt) || entry.readyAt < entry.requestedAt) return false;
  if (entry.status !== 'pending' && entry.status !== 'completed') return false;
  if (entry.status === 'pending' && kind !== 'deposit' && kind !== 'withdraw') return false;
  if (kind === 'distribution' && entry.status !== 'completed') return false;
  if ((kind === 'distribution') !== (entry.periodIndex !== undefined)) return false;
  if (entry.periodStartAt !== undefined || entry.periodEndAt !== undefined) {
    if (kind !== 'distribution'
      || !isSafeAmount(entry.periodStartAt)
      || !isSafeAmount(entry.periodEndAt)
      || entry.periodEndAt <= entry.periodStartAt
      || !isUtcMonthStart(entry.periodStartAt)
      || !isUtcMonthStart(entry.periodEndAt)) return false;
  }
  if ((kind === 'externalDeposit' || kind === 'purchase')
    && (entry.readyAt !== entry.requestedAt || entry.status !== 'completed')) return false;
  return true;
}

function distributionEntries(transfers: DemoTransfer[]): DemoTransfer[] {
  return transfers.filter((transfer) => transfer.kind === 'distribution');
}

function isValidState(value: unknown): value is WalletDemoState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<WalletDemoState>;
  const distributionPeriods = state.distributionPeriods;
  if (!isWholeTokens(state.personalTokensCents)
    || !isWholeTokens(state.allocatedTokensCents)
    || !isSafeAmount(state.personalUsdcCents)
    || !isSafeAmount(state.allocatedUsdcCents)
    || !isSafeAmount(state.legacyPersonalReaisCents)
    || !isSafeAmount(state.legacyAllocatedReaisCents)
    || !isSafeAmount(state.distributionPeriods)
    || !isSafeAmount(state.totalUsdcDistributedCents)
    || !isSafeAmount(state.totalUsdcWithdrawnCents)
    || !Array.isArray(state.stakeChanges)
    || state.stakeChanges.length === 0
    || state.stakeChanges.length > 100_000
    || !state.stakeChanges.every(isValidStakeChange)
    || (state.nextDistributionStartAt !== null
      && (!isSafeAmount(state.nextDistributionStartAt) || !isUtcMonthStart(state.nextDistributionStartAt)))
    || state.distributionPeriods > MAX_DISTRIBUTION_PERIODS
    || !Array.isArray(state.transfers)
    || state.transfers.length > 500
    || !state.transfers.every(isValidTransfer)) return false;
  if (!state.stakeChanges.every((change, index, changes) => index === 0 || change.at >= changes[index - 1].at)) return false;
  if (state.stakeChanges[state.stakeChanges.length - 1].allocatedTokensCents !== state.allocatedTokensCents) return false;

  const entries = distributionEntries(state.transfers);
  const indexes = entries.map((entry) => entry.periodIndex as number).sort((a, b) => a - b);
  if (new Set(indexes).size !== indexes.length || indexes.some((index) => index > (distributionPeriods as number))) return false;
  const distributionTotal = entries.reduce((sum, entry) => sum + entry.amountCents, 0);
  const availableUsdc = state.personalUsdcCents + state.allocatedUsdcCents;
  const reconciledTotal = state.totalUsdcWithdrawnCents + availableUsdc;
  return Number.isSafeInteger(distributionTotal)
    && Number.isSafeInteger(availableUsdc)
    && Number.isSafeInteger(reconciledTotal)
    && distributionTotal <= state.totalUsdcDistributedCents
    && state.totalUsdcDistributedCents === reconciledTotal;
}

function isValidStakeChange(value: unknown): value is DemoStakeChange {
  if (!value || typeof value !== 'object') return false;
  const change = value as Partial<DemoStakeChange>;
  return isSafeAmount(change.at) && isWholeTokens(change.allocatedTokensCents);
}

function legacyState(value: unknown): { state: WalletDemoState; releasedPending: boolean } | null {
  if (!value || typeof value !== 'object') return null;
  const legacy = value as {
    personalTokensCents?: unknown;
    allocatedTokensCents?: unknown;
    personalReaisCents?: unknown;
    allocatedReaisCents?: unknown;
    transfers?: unknown;
  };
  if (!isWholeTokens(legacy.personalTokensCents)
    || !isWholeTokens(legacy.allocatedTokensCents)
    || (legacy.personalReaisCents !== undefined && !isSafeAmount(legacy.personalReaisCents))
    || (legacy.allocatedReaisCents !== undefined && !isSafeAmount(legacy.allocatedReaisCents))
    || !Array.isArray(legacy.transfers)
    || legacy.transfers.length > 500
    || !legacy.transfers.every(isValidTransfer)) return null;
  let personalTokensCents = legacy.personalTokensCents;
  let allocatedTokensCents = legacy.allocatedTokensCents;
  let releasedPending = false;
  const transfers = (legacy.transfers as DemoTransfer[]).map((transfer) => {
    if (transfer.status !== 'pending' || (transfer.kind !== 'deposit' && transfer.kind !== 'withdraw')) return transfer;
    releasedPending = true;
    if (transfer.kind === 'deposit') allocatedTokensCents += transfer.amountCents;
    else personalTokensCents += transfer.amountCents;
    return { ...transfer, readyAt: transfer.requestedAt, status: 'completed' as const };
  });
  if (!isWholeTokens(personalTokensCents) || !isWholeTokens(allocatedTokensCents)) return null;
  const pendingStakeMovements = (legacy.transfers as DemoTransfer[])
    .filter((transfer) => transfer.status === 'pending'
      && (transfer.kind === 'deposit' || transfer.kind === 'withdraw'))
    .sort((left, right) => left.requestedAt - right.requestedAt);
  const initialEligibleTokensCents = legacy.allocatedTokensCents
    + pendingStakeMovements.reduce((sum, transfer) =>
      sum + (transfer.kind === 'withdraw' ? transfer.amountCents : 0), 0);
  if (!isWholeTokens(initialEligibleTokensCents)) return null;
  const stakeChanges: DemoStakeChange[] = [{ at: 0, allocatedTokensCents: initialEligibleTokensCents }];
  let eligibleTokensCents = initialEligibleTokensCents;
  for (const transfer of pendingStakeMovements) {
    eligibleTokensCents += transfer.kind === 'deposit' ? transfer.amountCents : -transfer.amountCents;
    if (!isWholeTokens(eligibleTokensCents)) return null;
    stakeChanges.push({ at: transfer.requestedAt, allocatedTokensCents: eligibleTokensCents });
  }
  if (eligibleTokensCents !== allocatedTokensCents) return null;
  return {
    state: {
      personalTokensCents,
      allocatedTokensCents,
      personalUsdcCents: 0,
      allocatedUsdcCents: 0,
      legacyPersonalReaisCents: legacy.personalReaisCents ?? LEGACY_PERSONAL_REAIS_SEED_CENTS,
      legacyAllocatedReaisCents: legacy.allocatedReaisCents ?? LEGACY_ALLOCATED_REAIS_SEED_CENTS,
      transfers,
      distributionPeriods: 0,
      totalUsdcDistributedCents: 0,
      totalUsdcWithdrawnCents: 0,
      stakeChanges,
      nextDistributionStartAt: null,
    },
    releasedPending,
  };
}

function normalizeV2State(value: unknown): { state: WalletDemoState; upgraded: boolean } | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Partial<WalletDemoState>;
  const distributionPeriods = saved.distributionPeriods;
  if (!isWholeTokens(saved.personalTokensCents)
    || !isWholeTokens(saved.allocatedTokensCents)
    || !isSafeAmount(saved.personalUsdcCents)
    || !isSafeAmount(saved.allocatedUsdcCents)
    || !isSafeAmount(saved.legacyPersonalReaisCents)
    || !isSafeAmount(saved.legacyAllocatedReaisCents)
    || !isSafeAmount(saved.distributionPeriods)
    || saved.distributionPeriods > MAX_DISTRIBUTION_PERIODS
    || !Array.isArray(saved.transfers)
    || saved.transfers.length > 500
    || !saved.transfers.every(isValidTransfer)) return null;

  const distributions = distributionEntries(saved.transfers);
  const periodIndexes = distributions.map((entry) => entry.periodIndex as number);
  if (new Set(periodIndexes).size !== periodIndexes.length
    || periodIndexes.some((index) => index > (distributionPeriods as number))) return null;

  const distributionRecordsTotal = distributions.reduce((sum, entry) => sum + entry.amountCents, 0);
  const recordedWithdrawals = saved.transfers
    .filter((entry) => entry.kind === 'profitWithdraw')
    .reduce((sum, entry) => sum + entry.amountCents, 0);
  const availableUsdc = saved.personalUsdcCents + saved.allocatedUsdcCents;
  if (!Number.isSafeInteger(distributionRecordsTotal)
    || !Number.isSafeInteger(recordedWithdrawals)
    || !Number.isSafeInteger(availableUsdc)) return null;

  if (saved.totalUsdcDistributedCents !== undefined && !isSafeAmount(saved.totalUsdcDistributedCents)) return null;
  if (saved.totalUsdcWithdrawnCents !== undefined && !isSafeAmount(saved.totalUsdcWithdrawnCents)) return null;
  const knownDistributed = Math.max(distributionRecordsTotal, saved.totalUsdcDistributedCents ?? 0);
  const knownWithdrawn = Math.max(recordedWithdrawals, saved.totalUsdcWithdrawnCents ?? 0);
  const impliedWithdrawn = Math.max(0, knownDistributed - availableUsdc);
  const totalUsdcWithdrawnCents = Math.max(knownWithdrawn, impliedWithdrawn);
  const totalUsdcDistributedCents = Math.max(knownDistributed, availableUsdc + totalUsdcWithdrawnCents);
  if (!Number.isSafeInteger(totalUsdcWithdrawnCents) || !Number.isSafeInteger(totalUsdcDistributedCents)) return null;

  let stakeChanges: DemoStakeChange[];
  if (saved.stakeChanges === undefined) {
    stakeChanges = [{ at: 0, allocatedTokensCents: saved.allocatedTokensCents }];
  } else if (Array.isArray(saved.stakeChanges)
    && saved.stakeChanges.length > 0
    && saved.stakeChanges.length <= 100_000
    && saved.stakeChanges.every(isValidStakeChange)
    && saved.stakeChanges.every((change, index, changes) => index === 0 || change.at >= changes[index - 1].at)) {
    stakeChanges = saved.stakeChanges;
  } else return null;

  const nextDistributionStartAt = saved.nextDistributionStartAt === undefined
    ? null
    : saved.nextDistributionStartAt;
  if (nextDistributionStartAt !== null
    && (!isSafeAmount(nextDistributionStartAt) || !isUtcMonthStart(nextDistributionStartAt))) return null;

  const state: WalletDemoState = {
    personalTokensCents: saved.personalTokensCents,
    allocatedTokensCents: saved.allocatedTokensCents,
    personalUsdcCents: saved.personalUsdcCents,
    allocatedUsdcCents: saved.allocatedUsdcCents,
    legacyPersonalReaisCents: saved.legacyPersonalReaisCents,
    legacyAllocatedReaisCents: saved.legacyAllocatedReaisCents,
    transfers: saved.transfers,
    distributionPeriods: saved.distributionPeriods,
    totalUsdcDistributedCents,
    totalUsdcWithdrawnCents,
    stakeChanges,
    nextDistributionStartAt,
  };
  if (!isValidState(state)) return null;
  return { state, upgraded: JSON.stringify(value) !== JSON.stringify(state) };
}

export function loadWalletDemo(): { state: WalletDemoState; warning: string | null } {
  if (typeof window === 'undefined') return { state: initialWalletDemo(), warning: null };
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current !== null) {
      const parsed: unknown = JSON.parse(current);
      const normalized = normalizeV2State(parsed);
      if (!normalized) {
        return {
          state: initialWalletDemo(),
          warning: 'A demonstração salva contém dados inválidos. Os saldos fictícios foram reiniciados.',
        };
      }
      if (normalized.upgraded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized.state));
      return {
        state: normalized.state,
        warning: normalized.upgraded
          ? 'Os totais e períodos da demonstração foram reconciliados preservando os saldos existentes.'
          : null,
      };
    }

    const oldSaved = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (oldSaved !== null) {
      const migration = legacyState(JSON.parse(oldSaved));
      if (!migration) {
        return {
          state: initialWalletDemo(),
          warning: 'A demonstração anterior contém dados inválidos. Os saldos fictícios foram reiniciados.',
        };
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migration.state));
      return {
        state: migration.state,
        warning: migration.releasedPending
          ? 'Saldos e histórico BETTEX anteriores foram preservados; transferências internas pendentes foram creditadas uma vez. Os valores em reais são somente históricos e não foram convertidos.'
          : 'Saldos e histórico BETTEX anteriores foram preservados. Os valores em reais são somente históricos e não foram convertidos.',
      };
    }
    return { state: initialWalletDemo(), warning: null };
  } catch {
    return {
      state: initialWalletDemo(),
      warning: 'Não foi possível recuperar esta demonstração. Os saldos de exemplo foram reiniciados.',
    };
  }
}

export function saveWalletDemo(state: WalletDemoState): void {
  if (!isValidState(state)) throw new Error('Estado inválido para salvar a demonstração da carteira.');
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function parseTokens(input: string): number | null {
  const normalized = input.trim();
  if (!/^\d+$/.test(normalized)) return null;
  const units = Number(normalized);
  const cents = units * 100;
  return Number.isSafeInteger(units) && units > 0 && Number.isSafeInteger(cents) ? cents : null;
}

export function parseUsdc(input: string): number | null {
  const normalized = input.trim();
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(normalized)) return null;
  const [unitsText, fractionalText = ''] = normalized.replace(',', '.').split('.');
  const units = Number(unitsText);
  const cents = units * 100 + Number(fractionalText.padEnd(2, '0'));
  return Number.isSafeInteger(units) && Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

function validateNow(now: number): void {
  if (!isSafeAmount(now)) throw new Error('Horário inválido para esta demonstração.');
}

function validateTokenAmount(amountCents: number): void {
  if (!isWholeTokens(amountCents) || amountCents === 0) {
    throw new Error('BETTEX só pode ser movimentado em unidades inteiras e positivas.');
  }
}

function validateUsdcAmount(amountCents: number): void {
  if (!isPositiveSafeAmount(amountCents)) throw new Error('Digite um valor positivo em USDC.');
}

function createId(state: WalletDemoState, kind: MovementKind, now: number): string {
  let suffix = state.transfers.length;
  let id = `${kind}-${now}-${suffix}`;
  while (state.transfers.some((transfer) => transfer.id === id)) {
    suffix += 1;
    id = `${kind}-${now}-${suffix}`;
  }
  return id;
}

function addMovement(state: WalletDemoState, entry: Omit<DemoTransfer, 'id'>): WalletDemoState {
  const transfer: DemoTransfer = { ...entry, id: createId(state, entry.kind, entry.requestedAt) };
  const combined = [transfer, ...state.transfers];
  const distributions = combined.filter((movement) => movement.kind === 'distribution');
  const otherMovements = combined.filter((movement) => movement.kind !== 'distribution');
  const keptOtherIds = new Set(otherMovements.slice(0, 500 - distributions.length).map((movement) => movement.id));
  return {
    ...state,
    transfers: combined.filter((movement) => movement.kind === 'distribution' || keptOtherIds.has(movement.id)),
  };
}

function withStakeChange(
  state: WalletDemoState,
  allocatedTokensCents: number,
  now: number,
): WalletDemoState {
  const latest = state.stakeChanges[state.stakeChanges.length - 1];
  if (state.stakeChanges.length >= 100_000) {
    throw new Error('O histórico de participação desta demonstração atingiu seu limite.');
  }
  if (latest && now < latest.at) {
    throw new Error('O horário da movimentação não pode anteceder uma alteração de participação já registrada.');
  }
  return {
    ...state,
    stakeChanges: [...state.stakeChanges, { at: now, allocatedTokensCents }],
  };
}

export function requestTransfer(
  state: WalletDemoState,
  kind: TransferKind,
  amountCents: number,
  now: number,
): WalletDemoState {
  validateNow(now);
  validateTokenAmount(amountCents);
  if (kind !== 'deposit' && kind !== 'withdraw') throw new Error('Tipo de transferência inválido.');
  const isDeposit = kind === 'deposit';
  const source = isDeposit ? state.personalTokensCents : state.allocatedTokensCents;
  const destination = isDeposit ? state.allocatedTokensCents : state.personalTokensCents;
  const nextDestination = destination + amountCents;
  if (!Number.isSafeInteger(nextDestination)) throw new Error('Quantidade muito alta para esta demonstração.');
  if (amountCents > source) throw new Error('Saldo insuficiente na origem.');

  let updated: WalletDemoState = {
    ...state,
    personalTokensCents: state.personalTokensCents + (isDeposit ? -amountCents : amountCents),
    allocatedTokensCents: state.allocatedTokensCents + (isDeposit ? amountCents : -amountCents),
  };
  updated = withStakeChange(updated, updated.allocatedTokensCents, now);
  return addMovement(updated, {
    kind,
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
  const personalTokensCents = state.personalTokensCents + amountCents;
  if (!Number.isSafeInteger(personalTokensCents)) throw new Error('Quantidade muito alta para esta demonstração.');
  return addMovement({ ...state, personalTokensCents }, {
    kind: 'externalDeposit',
    amountCents,
    feeCents: TRANSFER_FEE_CENTS,
    requestedAt: now,
    readyAt: now,
    status: 'completed',
  });
}

export function withdrawFromWallet(
  state: WalletDemoState,
  kind: 'externalWithdraw',
  amountCents: number,
  now: number,
): WalletDemoState {
  validateNow(now);
  validateTokenAmount(amountCents);
  if (kind !== 'externalWithdraw') throw new Error('Tipo de saque inválido.');
  if (amountCents > state.personalTokensCents) throw new Error('Saldo BETTEX insuficiente na carteira pessoal.');
  return addMovement({ ...state, personalTokensCents: state.personalTokensCents - amountCents }, {
    kind,
    amountCents,
    feeCents: TRANSFER_FEE_CENTS,
    requestedAt: now,
    readyAt: now,
    status: 'completed',
  });
}

export function transferProfit(state: WalletDemoState, amountCents: number, now: number): WalletDemoState {
  validateNow(now);
  validateUsdcAmount(amountCents);
  if (amountCents > state.allocatedUsdcCents) throw new Error('Saldo USDC insuficiente na carteira alocada.');
  const personalUsdcCents = state.personalUsdcCents + amountCents;
  if (!Number.isSafeInteger(personalUsdcCents)) throw new Error('Valor muito alto para esta demonstração.');
  return addMovement({
    ...state,
    allocatedUsdcCents: state.allocatedUsdcCents - amountCents,
    personalUsdcCents,
  }, {
    kind: 'profitTransfer',
    amountCents,
    feeCents: TRANSFER_FEE_CENTS,
    requestedAt: now,
    readyAt: now,
    status: 'completed',
  });
}

export function withdrawProfit(
  state: WalletDemoState,
  amountCents: number,
  now: number,
  address: string,
): WalletDemoState {
  validateNow(now);
  validateUsdcAmount(amountCents);
  if (!isValidEvmAddress(address)) throw new Error('Informe um endereço EVM válido para a rede Arbitrum One.');
  if (amountCents > state.personalUsdcCents) throw new Error('Saldo USDC insuficiente na carteira pessoal.');
  const totalUsdcWithdrawnCents = state.totalUsdcWithdrawnCents + amountCents;
  if (!Number.isSafeInteger(totalUsdcWithdrawnCents)) throw new Error('Valor muito alto para esta demonstração.');
  return addMovement({
    ...state,
    personalUsdcCents: state.personalUsdcCents - amountCents,
    totalUsdcWithdrawnCents,
  }, {
    kind: 'profitWithdraw',
    amountCents,
    feeCents: TRANSFER_FEE_CENTS,
    requestedAt: now,
    readyAt: now,
    status: 'completed',
    destinationAddress: address,
  });
}

function roundedShareCents(allocatedTokensCents: number): number {
  const activeTokens = BigInt(allocatedTokensCents / 100);
  const totalTokens = BigInt(OTHER_INVESTORS_ACTIVE_TOKENS) + activeTokens;
  if (activeTokens === 0n) return 0;
  const numerator = BigInt(DISTRIBUTABLE_CENTS) * activeTokens;
  return Number((numerator * 2n + totalTokens) / (2n * totalTokens));
}

function utcMonthStartAt(timestamp: number): number {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function nextUtcMonthStartAt(monthStartAt: number): number {
  const date = new Date(monthStartAt);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
}

function weightedPersonalTokenMilliseconds(
  changes: DemoStakeChange[],
  periodStartAt: number,
  periodEndAt: number,
): bigint {
  let tokens = 0n;
  let cursor = periodStartAt;
  let tokenMilliseconds = 0n;
  for (const change of changes) {
    if (change.at <= periodStartAt) {
      tokens = BigInt(change.allocatedTokensCents / 100);
      continue;
    }
    if (change.at >= periodEndAt) break;
    tokenMilliseconds += tokens * BigInt(change.at - cursor);
    cursor = change.at;
    tokens = BigInt(change.allocatedTokensCents / 100);
  }
  tokenMilliseconds += tokens * BigInt(periodEndAt - cursor);
  return tokenMilliseconds;
}

function roundedWeightedDistributionCents(
  state: WalletDemoState,
  periodStartAt: number,
  periodEndAt: number,
): number {
  const personalTokenMilliseconds = weightedPersonalTokenMilliseconds(
    state.stakeChanges,
    periodStartAt,
    periodEndAt,
  );
  if (personalTokenMilliseconds === 0n) return 0;
  const duration = BigInt(periodEndAt - periodStartAt);
  const otherInvestorTokenMilliseconds = BigInt(OTHER_INVESTORS_ACTIVE_TOKENS) * duration;
  const totalTokenMilliseconds = personalTokenMilliseconds + otherInvestorTokenMilliseconds;
  const numerator = BigInt(DISTRIBUTABLE_CENTS) * personalTokenMilliseconds;
  return Number((numerator * 2n + totalTokenMilliseconds) / (2n * totalTokenMilliseconds));
}

export function simulateMonthlyDistribution(state: WalletDemoState, now: number): WalletDemoState {
  validateNow(now);
  if (state.distributionPeriods >= MAX_DISTRIBUTION_PERIODS) {
    throw new Error('A demonstração está limitada a 12 períodos de distribuição.');
  }
  let periodStartAt = state.nextDistributionStartAt ?? utcMonthStartAt(now);
  const historicPeriodEndAt = Date.UTC(2025, 1, 1);
  if (periodStartAt < historicPeriodEndAt) periodStartAt = historicPeriodEndAt;
  const periodEndAt = nextUtcMonthStartAt(periodStartAt);
  if (!isSafeAmount(periodEndAt) || periodEndAt <= periodStartAt) {
    throw new Error('Não foi possível determinar o próximo período UTC da demonstração.');
  }
  const periodIndex = state.distributionPeriods + 1;
  const amountCents = roundedWeightedDistributionCents(state, periodStartAt, periodEndAt);
  const allocatedUsdcCents = state.allocatedUsdcCents + amountCents;
  const totalUsdcDistributedCents = state.totalUsdcDistributedCents + amountCents;
  if (!Number.isSafeInteger(allocatedUsdcCents) || !Number.isSafeInteger(totalUsdcDistributedCents)) {
    throw new Error('Valor muito alto para esta demonstração.');
  }
  const updated = {
    ...state,
    allocatedUsdcCents,
    distributionPeriods: periodIndex,
    totalUsdcDistributedCents,
    nextDistributionStartAt: periodEndAt,
  };
  return addMovement(updated, {
    kind: 'distribution',
    amountCents,
    feeCents: TRANSFER_FEE_CENTS,
    requestedAt: now,
    readyAt: now,
    status: 'completed',
    periodIndex,
    periodStartAt,
    periodEndAt,
  });
}

export function illustrativeParticipation(state: WalletDemoState): {
  personalActiveTokens: number;
  totalActiveTokens: number;
  percentage: number;
  nextDistributionCents: number;
} {
  const personalActiveTokens = state.allocatedTokensCents / 100;
  const totalActiveTokens = OTHER_INVESTORS_ACTIVE_TOKENS + personalActiveTokens;
  return {
    personalActiveTokens,
    totalActiveTokens,
    percentage: totalActiveTokens === 0 ? 0 : (personalActiveTokens / totalActiveTokens) * 100,
    nextDistributionCents: roundedShareCents(state.allocatedTokensCents),
  };
}