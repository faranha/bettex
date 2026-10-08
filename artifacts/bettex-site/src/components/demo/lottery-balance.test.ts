import test from 'node:test';
import assert from 'node:assert/strict';
import { demoLotteryPreviewBalance, lotteryRoundBalance } from './lottery-balance.ts';

test('lottery allocation is 25% of current realized profit, at USDC precision', () => {
  assert.equal(lotteryRoundBalance(100), 25);
  assert.equal(lotteryRoundBalance(124.48), 31.12);
  assert.equal(lotteryRoundBalance(0.000004), 0.000001);
});
test('negative and zero rounds do not create a negative lottery balance', () => {
  assert.equal(lotteryRoundBalance(-831.25), 0);
  assert.equal(lotteryRoundBalance(0), 0);
});
test('missing or invalid profit is unavailable, not invented as zero', () => {
  for (const value of [undefined, null, NaN, Infinity, -Infinity]) {
    assert.equal(lotteryRoundBalance(value), null);
  }
});
test('demo preview always has a positive illustrative budget without changing profit allocation', () => {
  for (const value of [0, -831.25, 0.000004, undefined, null, NaN, Infinity, -Infinity]) {
    assert.equal(demoLotteryPreviewBalance(value), 500);
  }
  assert.equal(demoLotteryPreviewBalance(3200), 800);
  assert.equal(lotteryRoundBalance(-831.25), 0);
  assert.equal(lotteryRoundBalance(undefined), null);
});
