import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeBook, units } from './book_probe.mjs';
const now = 1780000000000;
const book = () => ({ asset_id: '123', hash: 'fixture', timestamp: String(now),
  asks: [{ price: '0.6', size: '5' }, { price: '0.5', size: '10' }],
  bids: [{ price: '0.45', size: '20' }] });
test('exact size, unordered depth, spread and impact; not an executable quote', () => {
  const r = analyzeBook(book(), '123', '12', now);
  assert.equal(r.grossSubtotalUnits, '6200000');
  assert.equal(r.priceImpactUnits, '200000');
  assert.equal(r.spreadUnits, '50000');
  assert.equal(r.levelsUsed, 2);
  assert.equal(r.completeExecutableQuote, false);
  assert.equal(r.authorized, false);
});
test('rejects stale, wrong identity, depth, crossed books, invalid decimals', () => {
  for (const [b, q] of [[{ ...book(), timestamp: String(now - 60001) }, '1'],
    [{ ...book(), asset_id: '999' }, '1'], [book(), '16'], [book(), '0'],
    [{ ...book(), bids: [{ price: '0.8', size: '10' }] }, '1'],
    [{ ...book(), asks: [{ price: 'NaN', size: '10' }] }, '1']])
    assert.throws(() => analyzeBook(b, '123', q, now));
});
test('integer precision is not lost and rounding never understates principal', () => {
  assert.equal(units('9007199254740993.000001'), 9007199254740993000001n);
  const b = { ...book(), asks: [{ price: '0.123456', size: '1' }], bids: [] };
  assert.equal(analyzeBook(b, '123', '0.000001', now).grossSubtotalUnits, '1');
  assert.throws(() => units('0.0000001'));
});
