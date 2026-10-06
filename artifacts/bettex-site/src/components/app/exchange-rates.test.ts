import test from 'node:test';
import assert from 'node:assert/strict';
import { exchangeRates } from './exchange-rates.ts';

test('unit rates use the same dollar and BETTEX quote as wallet valuations', () => {
  assert.deepEqual(exchangeRates({ brlPerUsdc: 5.25, bettexUsdc: 0.04 }), {
    usdBrl: 5.25, bettexUsd: 0.04, bettexBrl: 0.21,
  });
  const next = exchangeRates({ brlPerUsdc: 4.9, bettexUsdc: 0.123456 })!;
  assert.equal(next.bettexBrl, 4.9 * 0.123456);
  assert.equal(next.usdBrl, 4.9);
  assert.equal(next.bettexUsd, 0.123456);
});

test('missing, invalid or overflowing quotes never become fabricated prices', () => {
  assert.equal(exchangeRates(), null);
  for (const value of [0, -1, NaN, Infinity]) {
    assert.equal(exchangeRates({ brlPerUsdc: value, bettexUsdc: 0.04 }), null);
    assert.equal(exchangeRates({ brlPerUsdc: 5.25, bettexUsdc: value }), null);
  }
  assert.equal(exchangeRates({ brlPerUsdc: Number.MAX_VALUE, bettexUsdc: Number.MAX_VALUE }), null);
});
