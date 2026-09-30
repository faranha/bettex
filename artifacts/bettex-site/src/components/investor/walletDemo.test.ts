import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BETTEX_REAIS_CENTS,
  EXAMPLE_DISTRIBUTION_REAIS_CENTS,
  PERSONAL_REAIS_CENTS,
  TRANSFER_FEE_CENTS,
  depositIntoPersonal,
  illustrativeParticipation,
  initialWalletDemo,
  loadWalletDemo,
  parseReais,
  parseTokens,
  requestTransfer,
  saveWalletDemo,
  withdrawFromWallet,
  type WalletDemoState,
} from './walletDemo.ts';

const NOW = 1_700_000_000_000;
const STORAGE_KEY = 'bettex-wallet-demo-v1';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

function useStorage() {
  const localStorage = memoryStorage();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage } });
  return localStorage;
}

function expectRejectedWithoutMutation(action: () => unknown, state: WalletDemoState) {
  const before = structuredClone(state);
  assert.throws(action);
  assert.deepEqual(state, before);
}

test('internal transfers in both directions are immediate and charge the source fee', () => {
  const initial = initialWalletDemo();
  const toBettex = requestTransfer(initial, 'deposit', 2_000, NOW);
  assert.equal(toBettex.personalTokensCents, initial.personalTokensCents - 2_000 - TRANSFER_FEE_CENTS);
  assert.equal(toBettex.allocatedTokensCents, initial.allocatedTokensCents + 2_000);
  assert.equal(toBettex.transfers[0].kind, 'deposit');
  assert.equal(toBettex.transfers[0].feeCents, TRANSFER_FEE_CENTS);
  assert.equal(toBettex.transfers[0].status, 'completed');
  assert.equal(toBettex.transfers[0].readyAt, NOW);
  assert.equal(toBettex.personalReaisCents, initial.personalReaisCents);
  assert.equal(toBettex.allocatedReaisCents, initial.allocatedReaisCents);

  const toPersonal = requestTransfer(toBettex, 'withdraw', 1_000, NOW + 1);
  assert.equal(toPersonal.allocatedTokensCents, toBettex.allocatedTokensCents - 1_000 - TRANSFER_FEE_CENTS);
  assert.equal(toPersonal.personalTokensCents, toBettex.personalTokensCents + 1_000);
  assert.equal(toPersonal.transfers[0].status, 'completed');
  assert.equal(toPersonal.transfers[0].readyAt, NOW + 1);
});

test('external token deposits are immediate and fee-free', () => {
  const initial = initialWalletDemo();
  const result = depositIntoPersonal(initial, 500, NOW);
  assert.equal(result.personalTokensCents, initial.personalTokensCents + 500);
  assert.equal(result.allocatedTokensCents, initial.allocatedTokensCents);
  assert.equal(result.transfers[0].kind, 'externalDeposit');
  assert.equal(result.transfers[0].feeCents, 0);
  assert.equal(result.transfers[0].readyAt, NOW);
  assert.equal(result.transfers[0].status, 'completed');
});

test('external token and both BRL withdrawals charge the correct wallet fee', () => {
  const initial = initialWalletDemo();
  const external = withdrawFromWallet(initial, 'externalWithdraw', 1_000, NOW);
  assert.equal(external.personalTokensCents, initial.personalTokensCents - 1_000 - TRANSFER_FEE_CENTS);
  assert.equal(external.allocatedTokensCents, initial.allocatedTokensCents);
  assert.equal(external.transfers[0].amountCents, 1_000);
  assert.equal(external.transfers[0].kind, 'externalWithdraw');
  assert.equal(external.personalReaisCents, initial.personalReaisCents);

  const personalReais = withdrawFromWallet(initial, 'personalReaisWithdraw', 2_550, NOW);
  assert.equal(personalReais.personalReaisCents, initial.personalReaisCents - 2_550);
  assert.equal(personalReais.allocatedReaisCents, initial.allocatedReaisCents);
  assert.equal(personalReais.personalTokensCents, initial.personalTokensCents - TRANSFER_FEE_CENTS);
  assert.equal(personalReais.allocatedTokensCents, initial.allocatedTokensCents);
  assert.equal(personalReais.transfers[0].amountCents, 2_550);

  const bettexReais = withdrawFromWallet(initial, 'bettexReaisWithdraw', 1_234, NOW);
  assert.equal(bettexReais.allocatedReaisCents, initial.allocatedReaisCents - 1_234);
  assert.equal(bettexReais.personalReaisCents, initial.personalReaisCents);
  assert.equal(bettexReais.allocatedTokensCents, initial.allocatedTokensCents - TRANSFER_FEE_CENTS);
  assert.equal(bettexReais.personalTokensCents, initial.personalTokensCents);
  assert.equal(bettexReais.transfers[0].feeCents, TRANSFER_FEE_CENTS);
});

test('invalid amounts, insufficient funds, and overflow reject without mutating state', () => {
  const initial = initialWalletDemo();
  expectRejectedWithoutMutation(() => requestTransfer(initial, 'deposit', 101, NOW), initial);
  expectRejectedWithoutMutation(() => requestTransfer(initial, 'deposit', 0, NOW), initial);
  expectRejectedWithoutMutation(() => requestTransfer(initial, 'deposit', 125_000, NOW), initial);
  expectRejectedWithoutMutation(() => withdrawFromWallet(initial, 'personalReaisWithdraw', PERSONAL_REAIS_CENTS + 1, NOW), initial);

  const noTokens = { ...initial, personalTokensCents: 0 };
  expectRejectedWithoutMutation(() => withdrawFromWallet(noTokens, 'personalReaisWithdraw', 100, NOW), noTokens);
  const insufficientExternal = { ...initial, personalTokensCents: 50_000 };
  expectRejectedWithoutMutation(
    () => withdrawFromWallet(insufficientExternal, 'externalWithdraw', 50_000, NOW),
    insufficientExternal,
  );
  const overflow = { ...initial, allocatedTokensCents: Number.MAX_SAFE_INTEGER - 100 };
  expectRejectedWithoutMutation(() => requestTransfer(overflow, 'deposit', 200, NOW), overflow);
  const tokenOverflow = { ...initial, personalTokensCents: Number.MAX_SAFE_INTEGER - 99 };
  expectRejectedWithoutMutation(() => depositIntoPersonal(tokenOverflow, 200, NOW), tokenOverflow);
});

test('parsers accept whole tokens and positive BRL up to two decimals only', () => {
  assert.equal(parseTokens('25'), 2_500);
  assert.equal(parseTokens(' 1 '), 100);
  for (const input of ['0', '1.5', '-2', '1,0', '1 0', '90071992547410']) assert.equal(parseTokens(input), null);

  assert.equal(parseReais('25,50'), 2_550);
  assert.equal(parseReais('25.5'), 2_550);
  assert.equal(parseReais('25'), 2_500);
  assert.equal(parseReais('0,01'), 1);
  for (const input of ['0', '-1', '1,234', '1.2.3', '1,2.3', '1 000,00', '1,000', '90071992547410']) {
    assert.equal(parseReais(input), null, input);
  }
});

test('legacy pending transfers migrate once, preserve history and balances, and reload without double credit', () => {
  const storage = useStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({
    personalTokensCents: 120_000,
    allocatedTokensCents: 380_000,
    clockOffsetMs: 99_000,
    transfers: [
      { id: 'old-withdrawal', kind: 'withdraw', amountCents: 2_000, requestedAt: NOW - 2, readyAt: NOW + 50_000, status: 'pending' },
      { id: 'old-deposit', kind: 'deposit', amountCents: 1_000, feeCents: 100, requestedAt: NOW - 1, readyAt: NOW + 60_000, status: 'pending' },
      { id: 'old-external', kind: 'externalDeposit', amountCents: 300, feeCents: 0, requestedAt: NOW - 3, readyAt: NOW - 3, status: 'completed' },
    ],
  }));

  const first = loadWalletDemo();
  assert.match(first.warning ?? '', /pendentes.*liberadas/i);
  assert.equal(first.state.personalTokensCents, 122_000);
  assert.equal(first.state.allocatedTokensCents, 381_000);
  assert.equal(first.state.personalReaisCents, PERSONAL_REAIS_CENTS);
  assert.equal(first.state.allocatedReaisCents, BETTEX_REAIS_CENTS);
  assert.equal(first.state.clockOffsetMs, 0);
  assert.equal(first.state.transfers[0].readyAt, first.state.transfers[0].requestedAt);
  assert.equal(first.state.transfers[0].status, 'completed');
  assert.equal(first.state.transfers[1].feeCents, 100);
  assert.equal(first.state.transfers[2].kind, 'externalDeposit');

  const second = loadWalletDemo();
  assert.equal(second.warning, null);
  assert.equal(second.state.personalTokensCents, first.state.personalTokensCents);
  assert.equal(second.state.allocatedTokensCents, first.state.allocatedTokensCents);
  assert.deepEqual(second.state.transfers, first.state.transfers);
});

test('current state and real balances persist, and illustrative participation remains proportional', () => {
  const storage = useStorage();
  const initial = initialWalletDemo();
  const moved = withdrawFromWallet(initial, 'bettexReaisWithdraw', 480, NOW);
  saveWalletDemo(moved);
  const loaded = loadWalletDemo();
  assert.equal(loaded.warning, null);
  assert.deepEqual(loaded.state, moved);
  assert.equal(loaded.state.personalReaisCents, PERSONAL_REAIS_CENTS);
  assert.equal(loaded.state.allocatedReaisCents, BETTEX_REAIS_CENTS - 480);

  const participation = illustrativeParticipation(initial);
  assert.equal(participation.personalActiveTokens, initial.allocatedTokensCents / 100);
  assert.equal(participation.exampleShareReaisCents, Math.round(
    EXAMPLE_DISTRIBUTION_REAIS_CENTS * (initial.allocatedTokensCents / (116_250 * 100 + initial.allocatedTokensCents)),
  ));
  assert.equal(storage.getItem(STORAGE_KEY), JSON.stringify(moved));
});