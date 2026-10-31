import test from 'node:test';
import assert from 'node:assert/strict';
import { formatUnits, historyLegDecimals } from './format.ts';

test('reverse-swap audit formats BETTEX paid independently of USDC received', () => {
  const data = { decimals: '6', paidAsset: 'BETTEX', paidDecimals: '18', receivedAsset: 'USDC', receivedDecimals: '6' };
  assert.equal(formatUnits('1000000000000000000000', historyLegDecimals(data, 'paid')), '1.000');
  assert.equal(formatUnits('37755972', historyLegDecimals(data, 'received')), '37,755972');
});

test('forward-swap audit does not apply token output precision to USDC input', () => {
  const data = { decimals: '18', paidAsset: 'USDC', paidDecimals: '6', receivedAsset: 'BETTEX', receivedDecimals: '18' };
  assert.equal(formatUnits('100000000', historyLegDecimals(data, 'paid')), '100');
  assert.equal(formatUnits('2490039840000000000000', historyLegDecimals(data, 'received')), '2.490,03984');
});

test('older audit records use the leg asset precision when leg decimals are absent', () => {
  assert.equal(historyLegDecimals({ decimals: '6', paidAsset: 'BETTEX' }, 'paid'), 18);
  assert.equal(historyLegDecimals({ decimals: '18', paidAsset: 'USDC' }, 'paid'), 6);
  assert.equal(historyLegDecimals({ decimals: '18', paidAsset: 'USDC', paidDecimals: '99' }, 'paid'), 6);
  assert.equal(historyLegDecimals({ decimals: '6', paidAsset: 'CUSTOM', paidDecimals: '8' }, 'paid'), 8);
});
