import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DISTRIBUTABLE_CENTS,
  MAX_DISTRIBUTION_PERIODS,
  OTHER_INVESTORS_ACTIVE_TOKENS,
  TRANSFER_FEE_CENTS,
  depositIntoPersonal,
  illustrativeParticipation,
  initialWalletDemo,
  loadWalletDemo,
  parseTokens,
  parseUsdc,
  requestTransfer,
  saveWalletDemo,
  simulateMonthlyDistribution,
  transferProfit,
  withdrawFromWallet,
  withdrawProfit,
  type WalletDemoState,
} from './walletDemo.ts';

const NOW = Date.UTC(2026, 3, 15, 12);
const V1_STORAGE_KEY = 'bettex-wallet-demo-v1';
const V2_STORAGE_KEY = 'bettex-wallet-demo-v2';
const VALID_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

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

test('fresh wallet starts with one exactly credited historical period and a distinct estimate', () => {
  const state = initialWalletDemo();
  assert.equal(state.allocatedUsdcCents, 1_563);
  assert.equal(state.personalUsdcCents, 0);
  assert.equal(state.distributionPeriods, 1);
  assert.equal(state.transfers.filter((entry) => entry.kind === 'distribution').length, 1);
  assert.equal(state.transfers[0].periodIndex, 1);
  assert.equal(state.transfers[0].amountCents, 1_563);
  assert.equal(state.transfers[0].feeCents, 0);
  assert.equal(state.transfers[0].requestedAt, Date.UTC(2025, 0, 1));
  const participation = illustrativeParticipation(state);
  assert.equal(participation.personalActiveTokens, 3_750);
  assert.equal(participation.totalActiveTokens, 120_000);
  assert.equal(participation.percentage, 3.125);
  assert.equal(participation.nextDistributionCents, 1_563);
});

test('zero eligible stake advances a period but receives no distribution', () => {
  const initial = initialWalletDemo();
  const unstaked: WalletDemoState = {
    ...initial,
    allocatedTokensCents: 0,
    stakeChanges: [{ at: 0, allocatedTokensCents: 0 }],
  };
  const result = simulateMonthlyDistribution(unstaked, NOW);
  assert.equal(result.distributionPeriods, 2);
  assert.equal(result.transfers[0].kind, 'distribution');
  assert.equal(result.transfers[0].periodIndex, 2);
  assert.equal(result.transfers[0].amountCents, 0);
  assert.equal(result.allocatedUsdcCents, unstaked.allocatedUsdcCents);
  assert.equal(illustrativeParticipation(result).nextDistributionCents, 0);
});

test('token deposits become eligible immediately and withdrawals remove eligibility immediately', () => {
  const initial = initialWalletDemo();
  const walletDeposit = depositIntoPersonal(initial, 2_500, NOW);
  assert.equal(walletDeposit.personalTokensCents, initial.personalTokensCents + 2_500);
  assert.equal(illustrativeParticipation(walletDeposit).personalActiveTokens, 3_750);

  const allocated = requestTransfer(walletDeposit, 'deposit', 2_500, NOW + 1);
  assert.equal(allocated.personalTokensCents, walletDeposit.personalTokensCents - 2_500);
  assert.equal(allocated.allocatedTokensCents, initial.allocatedTokensCents + 2_500);
  assert.equal(allocated.transfers[0].feeCents, 0);
  assert.equal(illustrativeParticipation(allocated).personalActiveTokens, 3_775);

  const withdrawn = requestTransfer(allocated, 'withdraw', 2_500, NOW + 2);
  assert.equal(withdrawn.allocatedTokensCents, initial.allocatedTokensCents);
  assert.equal(withdrawn.personalTokensCents, walletDeposit.personalTokensCents);
  assert.equal(illustrativeParticipation(withdrawn).personalActiveTokens, 3_750);
  assert.equal(withdrawn.transfers[0].feeCents, TRANSFER_FEE_CENTS);

  const externalWithdrawal = withdrawFromWallet(withdrawn, 'externalWithdraw', 500, NOW + 3);
  assert.equal(externalWithdrawal.personalTokensCents, withdrawn.personalTokensCents - 500);
  assert.equal(externalWithdrawal.allocatedTokensCents, withdrawn.allocatedTokensCents);
  assert.equal(externalWithdrawal.transfers[0].feeCents, 0);
});

test('monthly distributions use UTC token-time weights and preserve earlier credits', () => {
  const initial = initialWalletDemo();
  const changedStake = requestTransfer(initial, 'deposit', 50_000, NOW);
  const nextEstimate = illustrativeParticipation(changedStake).nextDistributionCents;
  const period2 = simulateMonthlyDistribution(changedStake, NOW + 1);
  assert.equal(period2.transfers[0].periodIndex, 2);
  assert.equal(period2.transfers[0].periodStartAt, Date.UTC(2026, 3, 1));
  assert.equal(period2.transfers[0].periodEndAt, Date.UTC(2026, 4, 1));
  const weightedTokens = 3_750 * (NOW - Date.UTC(2026, 3, 1)) / 1000
    + 4_250 * (Date.UTC(2026, 4, 1) - NOW) / 1000;
  const weightedOtherTokens = OTHER_INVESTORS_ACTIVE_TOKENS * 30 * 24 * 60 * 60;
  const expectedProratedCents = Math.round(DISTRIBUTABLE_CENTS * weightedTokens / (weightedOtherTokens + weightedTokens));
  assert.equal(period2.transfers[0].amountCents, expectedProratedCents);
  assert.notEqual(period2.transfers[0].amountCents, nextEstimate);
  assert.equal(period2.allocatedUsdcCents, 1_563 + expectedProratedCents);
  assert.equal(period2.transfers.find((entry) => entry.periodIndex === 1)?.amountCents, 1_563);

  const changedAgain = requestTransfer(period2, 'withdraw', 25_000, NOW + 2);
  assert.notEqual(illustrativeParticipation(changedAgain).nextDistributionCents, nextEstimate);
  assert.equal(changedAgain.allocatedUsdcCents, period2.allocatedUsdcCents);
  const period3 = simulateMonthlyDistribution(changedAgain, NOW + 3);
  assert.equal(period3.transfers[0].amountCents, illustrativeParticipation(changedAgain).nextDistributionCents);
  assert.equal(period3.transfers[0].periodStartAt, Date.UTC(2026, 4, 1));
  assert.equal(period3.transfers.filter((entry) => entry.kind === 'distribution').length, 3);
});

test('withdrawal before UTC month close retains prior-month token time', () => {
  const initial = initialWalletDemo();
  const halfMonth = Date.UTC(2026, 3, 16);
  const unstaked = requestTransfer(initial, 'withdraw', initial.allocatedTokensCents, halfMonth);
  const distributed = simulateMonthlyDistribution(unstaked, halfMonth);
  const expectedCents = Math.round(
    DISTRIBUTABLE_CENTS * (3_750 * 15) / (OTHER_INVESTORS_ACTIVE_TOKENS * 30 + 3_750 * 15),
  );
  assert.equal(distributed.transfers[0].amountCents, expectedCents);
  assert.ok(expectedCents > 0);
});

test('a last-second UTC-month deposit earns only its remaining token time', () => {
  const initial = initialWalletDemo();
  const monthStart = Date.UTC(2026, 3, 1);
  const monthEnd = Date.UTC(2026, 4, 1);
  const unstaked: WalletDemoState = {
    ...initial,
    personalTokensCents: 20_000_000,
    allocatedTokensCents: 0,
    stakeChanges: [{ at: 0, allocatedTokensCents: 0 }],
  };
  const deposited = requestTransfer(unstaked, 'deposit', 10_000_000, monthEnd - 1_000);
  const distributed = simulateMonthlyDistribution(deposited, monthEnd - 1_000);
  assert.equal(distributed.transfers[0].periodStartAt, monthStart);
  assert.equal(distributed.transfers[0].amountCents, 0);
});

test('no fee is charged for any new token or USDC movement; insufficient balances reject', () => {
  const initial = initialWalletDemo();
  assert.equal(TRANSFER_FEE_CENTS, 0);
  const deposited = depositIntoPersonal(initial, 100, NOW);
  assert.equal(deposited.transfers[0].feeCents, 0);
  const sent = requestTransfer(deposited, 'deposit', 100, NOW + 1);
  assert.equal(sent.transfers[0].feeCents, 0);
  expectRejectedWithoutMutation(() => requestTransfer(initial, 'deposit', 125_100, NOW), initial);
  expectRejectedWithoutMutation(() => requestTransfer(initial, 'withdraw', 375_100, NOW), initial);
  expectRejectedWithoutMutation(() => withdrawFromWallet(initial, 'externalWithdraw', 375_100, NOW), initial);
  const personalEmpty: WalletDemoState = { ...initial, personalTokensCents: 0 };
  expectRejectedWithoutMutation(
    () => withdrawFromWallet(personalEmpty, 'externalWithdraw', 100, NOW),
    personalEmpty,
  );
  expectRejectedWithoutMutation(() => transferProfit(initial, 1_564, NOW), initial);
  expectRejectedWithoutMutation(() => withdrawProfit(initial, 1, NOW, VALID_ADDRESS), initial);
});

test('profit transfer and Arbitrum-address withdrawal use simulated USDC only', () => {
  const state = initialWalletDemo();
  const moved = transferProfit(state, 563, NOW);
  assert.equal(moved.allocatedUsdcCents, 1_000);
  assert.equal(moved.personalUsdcCents, 563);
  assert.equal(moved.transfers[0].kind, 'profitTransfer');
  assert.equal(moved.transfers[0].feeCents, 0);

  const withdrawn = withdrawProfit(moved, 500, NOW + 1, VALID_ADDRESS);
  assert.equal(withdrawn.personalUsdcCents, 63);
  assert.equal(withdrawn.transfers[0].kind, 'profitWithdraw');
  assert.equal(withdrawn.transfers[0].destinationAddress, VALID_ADDRESS);
  assert.equal(withdrawn.transfers[0].feeCents, 0);
  assert.equal(withdrawn.legacyPersonalReaisCents, state.legacyPersonalReaisCents);
  assert.equal(withdrawn.legacyAllocatedReaisCents, state.legacyAllocatedReaisCents);
});

test('profit withdrawal rejects invalid EVM addresses and invalid amounts', () => {
  const funded = transferProfit(initialWalletDemo(), 100, NOW);
  for (const address of ['0x1234', '1234567890abcdef1234567890abcdef12345678', '0xGG34567890abcdef1234567890abcdef12345678', '']) {
    expectRejectedWithoutMutation(() => withdrawProfit(funded, 50, NOW + 1, address), funded);
  }
  expectRejectedWithoutMutation(() => withdrawProfit(funded, 0, NOW + 1, VALID_ADDRESS), funded);
  expectRejectedWithoutMutation(() => withdrawProfit(funded, 101, NOW + 1, VALID_ADDRESS), funded);
});

test('the twelve-period demonstration cap is enforced', () => {
  let state = initialWalletDemo();
  for (let month = state.distributionPeriods + 1; month <= MAX_DISTRIBUTION_PERIODS; month += 1) {
    state = simulateMonthlyDistribution(state, NOW + month);
  }
  assert.equal(state.distributionPeriods, MAX_DISTRIBUTION_PERIODS);
  assert.equal(state.transfers.filter((entry) => entry.kind === 'distribution').length, MAX_DISTRIBUTION_PERIODS);
  assert.throws(() => simulateMonthlyDistribution(state, NOW + 100), /12 períodos/);
});

test('token and USDC parsers accept only positive supported precision', () => {
  assert.equal(parseTokens('25'), 2_500);
  assert.equal(parseTokens(' 1 '), 100);
  for (const input of ['0', '1.5', '-2', '1,0', '1 0', '90071992547410']) {
    assert.equal(parseTokens(input), null, input);
  }

  assert.equal(parseUsdc('25.50'), 2_550);
  assert.equal(parseUsdc('25,5'), 2_550);
  assert.equal(parseUsdc('25'), 2_500);
  assert.equal(parseUsdc('0.01'), 1);
  for (const input of ['0', '-1', '1.234', '1.2.3', '1,2.3', '1 000.00', '1,000', '90071992547410']) {
    assert.equal(parseUsdc(input), null, input);
  }
});

test('v1 migration preserves token balances and history, keeps BRL read-only, and never credits it to USDC', () => {
  const storage = useStorage();
  const oldMovements = [
    {
      id: 'old-withdraw', kind: 'withdraw', amountCents: 2_000, feeCents: 100,
      requestedAt: NOW - 20, readyAt: NOW - 20, status: 'completed',
    },
    {
      id: 'old-bettex-reais', kind: 'bettexReaisTransfer', amountCents: 480, feeCents: 100,
      requestedAt: NOW - 10, readyAt: NOW - 10, status: 'completed',
    },
  ];
  const legacy = {
    personalTokensCents: 120_000,
    allocatedTokensCents: 380_000,
    personalReaisCents: 85_000,
    allocatedReaisCents: 12_480,
    clockOffsetMs: 99_000,
    transfers: oldMovements,
  };
  storage.setItem(V1_STORAGE_KEY, JSON.stringify(legacy));
  const loaded = loadWalletDemo();
  assert.match(loaded.warning ?? '', /não foram convertidos/i);
  assert.equal(loaded.state.personalTokensCents, legacy.personalTokensCents);
  assert.equal(loaded.state.allocatedTokensCents, legacy.allocatedTokensCents);
  assert.equal(loaded.state.legacyPersonalReaisCents, legacy.personalReaisCents);
  assert.equal(loaded.state.legacyAllocatedReaisCents, legacy.allocatedReaisCents);
  assert.equal(loaded.state.personalUsdcCents, 0);
  assert.equal(loaded.state.allocatedUsdcCents, 0);
  assert.equal(loaded.state.distributionPeriods, 0);
  assert.deepEqual(loaded.state.transfers, oldMovements);
  assert.equal(storage.getItem(V1_STORAGE_KEY), JSON.stringify(legacy), 'v1 remains untouched');
  assert.equal(storage.getItem(V2_STORAGE_KEY), JSON.stringify(loaded.state));

  const secondLoad = loadWalletDemo();
  assert.equal(secondLoad.warning, null);
  assert.deepEqual(secondLoad.state, loaded.state);
});

test('v1 migration restores legacy BRL seed balances when the old fields are absent', () => {
  const storage = useStorage();
  storage.setItem(V1_STORAGE_KEY, JSON.stringify({
    personalTokensCents: 100_000,
    allocatedTokensCents: 200_000,
    transfers: [],
  }));
  const migrated = loadWalletDemo().state;
  assert.equal(migrated.legacyPersonalReaisCents, 85_000);
  assert.equal(migrated.legacyAllocatedReaisCents, 12_480);
  assert.equal(migrated.personalUsdcCents, 0);
  assert.equal(migrated.allocatedUsdcCents, 0);
});

test('v1 migration settles pending internal movements once, preserves old fees, and keeps v1 untouched', () => {
  const storage = useStorage();
  const oldState = {
    personalTokensCents: 12_000,
    allocatedTokensCents: 38_000,
    personalReaisCents: 5_000,
    allocatedReaisCents: 600,
    transfers: [
      {
        id: 'old-pending-deposit', kind: 'deposit', amountCents: 1_000, feeCents: 100,
        requestedAt: NOW - 100, readyAt: NOW + 10_000, status: 'pending',
      },
      {
        id: 'old-pending-withdraw', kind: 'withdraw', amountCents: 2_000, feeCents: 100,
        requestedAt: NOW - 90, readyAt: NOW + 20_000, status: 'pending',
      },
    ],
  };
  storage.setItem(V1_STORAGE_KEY, JSON.stringify(oldState));
  const migrated = loadWalletDemo();
  assert.match(migrated.warning ?? '', /pendentes.*creditadas uma vez/i);
  assert.equal(migrated.state.personalTokensCents, 14_000);
  assert.equal(migrated.state.allocatedTokensCents, 39_000);
  assert.equal(migrated.state.transfers[0].feeCents, 100);
  assert.equal(migrated.state.transfers[0].status, 'completed');
  assert.equal(migrated.state.transfers[0].readyAt, NOW - 100);
  assert.equal(migrated.state.transfers[1].status, 'completed');
  assert.equal(storage.getItem(V1_STORAGE_KEY), JSON.stringify(oldState));
  assert.equal(loadWalletDemo().warning, null);
  assert.equal(loadWalletDemo().state.allocatedTokensCents, 39_000);
  assert.equal(loadWalletDemo().state.personalTokensCents, 14_000);
});

test('ledger retention never drops distribution records, even beyond 500 newer movements', () => {
  let state = initialWalletDemo();
  for (let period = 0; period < 4; period += 1) {
    state = simulateMonthlyDistribution(state, NOW + period);
  }
  const distributionRecords = state.transfers.filter((movement) => movement.kind === 'distribution');
  for (let entry = 0; entry < 525; entry += 1) {
    state = depositIntoPersonal(state, 100, NOW + 100 + entry);
  }
  assert.equal(state.transfers.length, 500);
  assert.equal(state.transfers.filter((movement) => movement.kind === 'distribution').length, 5);
  assert.deepEqual(
    state.transfers.filter((movement) => movement.kind === 'distribution'),
    distributionRecords,
  );
  const storage = useStorage();
  saveWalletDemo(state);
  assert.deepEqual(loadWalletDemo().state, state);
});

test('lifetime withdrawn and distributed totals reconcile after ledger truncation and reload', () => {
  let state = transferProfit(initialWalletDemo(), 563, NOW);
  for (let withdrawal = 0; withdrawal < 501; withdrawal += 1) {
    state = withdrawProfit(state, 1, NOW + withdrawal, VALID_ADDRESS);
  }
  assert.equal(state.transfers.length, 500);
  assert.equal(state.transfers.filter((movement) => movement.kind === 'distribution').length, 1);
  assert.equal(state.transfers.filter((movement) => movement.kind === 'profitWithdraw').length, 499);
  assert.equal(state.totalUsdcWithdrawnCents, 501);
  assert.equal(
    state.totalUsdcDistributedCents,
    state.totalUsdcWithdrawnCents + state.personalUsdcCents + state.allocatedUsdcCents,
  );

  const storage = useStorage();
  saveWalletDemo(state);
  const reloaded = loadWalletDemo().state;
  assert.equal(reloaded.totalUsdcWithdrawnCents, 501);
  assert.equal(reloaded.totalUsdcDistributedCents, state.totalUsdcDistributedCents);
  assert.equal(reloaded.personalUsdcCents, state.personalUsdcCents);
  assert.equal(reloaded.allocatedUsdcCents, state.allocatedUsdcCents);
  assert.deepEqual(reloaded, state);
});

test('v2 persistence round trips all wallet, period, balance, and history fields', () => {
  const storage = useStorage();
  const initial = initialWalletDemo();
  const next = simulateMonthlyDistribution(
    transferProfit(initial, 500, NOW),
    NOW + 1,
  );
  saveWalletDemo(next);
  assert.equal(storage.getItem(V2_STORAGE_KEY), JSON.stringify(next));
  assert.equal(storage.getItem(V1_STORAGE_KEY), null);
  assert.deepEqual(loadWalletDemo(), { state: next, warning: null });
});

test('loaded v2 state rejects malformed timestamps, movement fields, and duplicate periods', () => {
  const storage = useStorage();
  const initial = initialWalletDemo();
  storage.setItem(V2_STORAGE_KEY, JSON.stringify({
    ...initial,
    transfers: [{
      ...initial.transfers[0],
      requestedAt: Number.MAX_SAFE_INTEGER + 1,
    }],
  }));
  assert.notEqual(loadWalletDemo().warning, null);
  storage.setItem(V2_STORAGE_KEY, JSON.stringify({
    ...initial,
    transfers: [initial.transfers[0], { ...initial.transfers[0], id: 'dupe-period', periodIndex: 1 }],
    distributionPeriods: 2,
  }));
  assert.notEqual(loadWalletDemo().warning, null);
});

test('older v2 records upgrade totals and stake history without clearing user balances', () => {
  const storage = useStorage();
  const funded = transferProfit(initialWalletDemo(), 563, NOW);
  const withdrawn = withdrawProfit(funded, 500, NOW + 1, VALID_ADDRESS);
  const {
    totalUsdcDistributedCents: _totalDistributed,
    totalUsdcWithdrawnCents: _totalWithdrawn,
    stakeChanges: _stakeChanges,
    nextDistributionStartAt: _nextStart,
    ...olderV2
  } = withdrawn;
  storage.setItem(V2_STORAGE_KEY, JSON.stringify({
    ...olderV2,
    transfers: olderV2.transfers.filter((movement) => movement.kind !== 'distribution'),
  }));
  const loaded = loadWalletDemo();
  assert.match(loaded.warning ?? '', /reconciliados/i);
  assert.equal(loaded.state.personalUsdcCents, withdrawn.personalUsdcCents);
  assert.equal(loaded.state.allocatedUsdcCents, withdrawn.allocatedUsdcCents);
  assert.equal(loaded.state.totalUsdcWithdrawnCents, 500);
  assert.equal(loaded.state.totalUsdcDistributedCents, 1_563);
  assert.equal(loaded.state.stakeChanges.at(-1)?.allocatedTokensCents, withdrawn.allocatedTokensCents);
  assert.equal(loadWalletDemo().warning, null);
});

test('balance estimates are separate from already credited distribution totals', () => {
  const initial = initialWalletDemo();
  const stake = requestTransfer(initial, 'deposit', 1_000, NOW);
  const estimate = illustrativeParticipation(stake).nextDistributionCents;
  assert.equal(stake.allocatedUsdcCents, 1_563);
  assert.equal(estimate, Math.round(DISTRIBUTABLE_CENTS * 3_760 / (OTHER_INVESTORS_ACTIVE_TOKENS + 3_760)));
  assert.notEqual(estimate, stake.allocatedUsdcCents);
});