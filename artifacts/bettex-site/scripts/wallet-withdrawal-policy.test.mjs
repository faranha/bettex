import assert from 'node:assert/strict';
import test from 'node:test';
import {
  initialWalletDemo, requestTransfer, withdrawFromWallet, withdrawProfit, transferProfit,
  simulateMonthlyDistribution, saveWalletDemo, loadWalletDemo,
  DISTRIBUTABLE_CENTS, OTHER_INVESTORS_ACTIVE_TOKENS,
} from '../src/components/investor/walletDemo.ts';

const start = Date.UTC(2025, 1, 1);
const middle = Date.UTC(2025, 1, 15);
const late = Date.UTC(2025, 1, 22);
const end = Date.UTC(2025, 2, 1);
const address = `0x${'1'.repeat(40)}`;
const fixture = () => ({
  ...initialWalletDemo(),
  allocatedTokensCents: 100_000,
  stakeChanges: [{ at: Date.UTC(2025, 0, 1), allocatedTokensCents: 100_000 }],
  nextDistributionStartAt: start,
});
const credit = (state, at = end) => (
  simulateMonthlyDistribution(state, at).totalUsdcDistributedCents - state.totalUsdcDistributedCents
);
function expected(intervals) {
  const weight = intervals.reduce((sum, [tokens, from, to]) => sum + BigInt(tokens) * BigInt(to - from), 0n);
  const total = weight + BigInt(OTHER_INVESTORS_ACTIVE_TOKENS) * BigInt(end - start);
  return Number((BigInt(DISTRIBUTABLE_CENTS) * weight * 2n + total) / (2n * total));
}

test('an uninterrupted position keeps its full eligible weight', () => {
  assert.equal(credit(fixture()), expected([[1000, start, end]]));
});
test('a full withdrawal cancels every earlier unpaid credit', () => {
  assert.equal(credit(requestTransfer(fixture(), 'withdraw', 100_000, middle)), 0);
});
test('a partial withdrawal resets all prior weight, not just the withdrawn portion', () => {
  assert.equal(credit(requestTransfer(fixture(), 'withdraw', 50_000, middle)), expected([[500, middle, end]]));
});
test('each repeated withdrawal resets the complete prior accumulation again', () => {
  const first = requestTransfer(fixture(), 'withdraw', 10_000, middle);
  const second = requestTransfer(first, 'withdraw', 10_000, late);
  assert.equal(credit(second), expected([[800, late, end]]));
});
test('redeposit never restores the cancelled earlier interval', () => {
  const exited = requestTransfer(fixture(), 'withdraw', 100_000, middle);
  const returned = requestTransfer(exited, 'deposit', 100_000, late);
  assert.equal(credit(returned), expected([[1000, late, end]]));
});
test('a withdrawal after period close but before payment cancels that entire unpaid period', () => {
  assert.equal(credit(requestTransfer(fixture(), 'withdraw', 10_000, end + 1), end + 2), 0);
});
test('external BETTEX withdrawal resets prior accrual even without changing the allocated balance', () => {
  const state = withdrawFromWallet(fixture(), 'externalWithdraw', 10_000, middle);
  assert.equal(credit(state), expected([[1000, middle, end]]));
});
test('deposits alone do not cancel prior eligible accrual', () => {
  const state = requestTransfer(fixture(), 'deposit', 50_000, middle);
  assert.equal(credit(state), expected([[1000, start, middle], [1500, middle, end]]));
});
test('a USDC withdrawal does not cancel staking credits', () => {
  const state = withdrawProfit(transferProfit(fixture(), 100, middle), 100, middle, address);
  assert.equal(credit(state), expected([[1000, start, end]]));
});
test('BETTEX withdrawal does not claw back previously paid USDC or erase the historical payment', () => {
  const paid = simulateMonthlyDistribution(fixture(), end);
  const exited = requestTransfer(paid, 'withdraw', 100_000, end + 1);
  assert.equal(exited.allocatedUsdcCents, paid.allocatedUsdcCents);
  assert.equal(exited.personalUsdcCents, paid.personalUsdcCents);
  assert.equal(exited.totalUsdcDistributedCents, paid.totalUsdcDistributedCents);
  assert.deepEqual(exited.transfers.filter(item => item.kind === 'distribution'), paid.transfers.filter(item => item.kind === 'distribution'));
});
test('older stake histories without cancellation markers still reset on a balance decrease', () => {
  const state = requestTransfer(fixture(), 'withdraw', 50_000, middle);
  state.stakeChanges = state.stakeChanges.map(({ cancelsCycleCredits, ...change }) => change);
  assert.equal(credit(state), expected([[500, middle, end]]));
});
test('saving and reloading preserves cancellation markers and paid balances', () => {
  const data = new Map();
  globalThis.window = { localStorage: {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  } };
  try {
    const state = withdrawFromWallet(fixture(), 'externalWithdraw', 10_000, middle);
    saveWalletDemo(state);
    const loaded = loadWalletDemo();
    assert.equal(loaded.warning, null);
    assert.deepEqual(loaded.state, state);
    assert.equal(credit(loaded.state), expected([[1000, middle, end]]));
  } finally {
    delete globalThis.window;
  }
});