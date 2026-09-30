import assert from 'node:assert/strict';
import test from 'node:test';
import { quotePresalePurchase } from './presaleQuote.ts';
import { tokenomics } from './tokenomics.ts';

test('presale quantity and amount use the R$3 price and whole tokens', () => {
  assert.deepEqual(quotePresalePurchase('1'), { quantity: 1, totalCents: 300 });
  assert.deepEqual(quotePresalePurchase('100'), { quantity: 100, totalCents: 30_000 });
  assert.deepEqual(quotePresalePurchase('100000'), { quantity: 100_000, totalCents: 30_000_000 });
  assert.deepEqual(quotePresalePurchase(' 10 '), { quantity: 10, totalCents: 3_000 });
});

test('presale quote rejects empty, fractional, negative, non-numeric and over-allocation input', () => {
  for (const value of ['', ' ', '0', '-1', '1.5', '1,5', '1e3', 'abc', '100001', '99999999999999999999']) {
    assert.equal(quotePresalePurchase(value), null, value);
  }
});

test('public sale allocation includes presale without exceeding total supply', () => {
  assert.equal(tokenomics.presaleAllocation, 100_000);
  assert.equal(tokenomics.publicSaleAllocation - tokenomics.presaleAllocation, 900_000);
  assert.equal(tokenomics.publicSaleAllocation + tokenomics.founderTeamAllocation + tokenomics.externalInvestorAllocation, tokenomics.totalSupply);
});