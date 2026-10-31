import test from 'node:test';
import assert from 'node:assert/strict';
import { localRoundPlan } from '../src/modules/ledger/domain/local-round.ts';
import { localRoundAllowed } from '../src/modules/risk/domain/local-round-policy.ts';
import { balancedLegs } from '../src/modules/ledger/domain/journal.ts';

test('zero weight retains everything without split or future claims', () => {
  const p = localRoundPlan('1000000', []);
  assert.equal(p.retained, '1000000'); assert.equal(p.buyback, '0'); assert.equal(p.payments.length, 0);
});
test('exact split retains micro-unit fractions and never duplicates recipients', () => {
  const rows = [{ accountId: 'a', wallet: 'x', weight: '1' }, { accountId: 'b', wallet: 'y', weight: '2' }];
  const p = localRoundPlan('1000003', rows);
  assert.equal(p.buyback, '250000');
  assert.deepEqual(p.payments.map(p => p.units), ['83333', '166666']);
  assert.equal(p.retained, '500004');
  assert.equal(BigInt(p.retained) + BigInt(p.buyback) + BigInt(p.participants), 1000003n);
  assert.throws(() => localRoundPlan('100', [rows[0], rows[0]]));
});
test('supports weights larger than float precision and rejects negative/inexact values', () => {
  const p = localRoundPlan('1000000', [{ accountId: 'a', wallet: 'x', weight: '90071992547409931234' }]);
  assert.equal(p.payments[0].units, '250000');
  assert.throws(() => localRoundPlan('-1', [])); assert.throws(() => localRoundPlan('0.1', []));
});
test('test mandate fails closed on production, wrong chain, excessive budget or unavailable liquidity', () => {
  const input = { development:true,chainId:31337,result:'1000000',transferable:'500000',payments:'250000',buyback:'250000',otherObligations:'0' };
  assert.equal(localRoundAllowed(input), true);
  for (const change of [{development:false},{chainId:421614},{result:'1000001'},{transferable:'499999'},{otherObligations:'1'},{payments:'0.1'}]) {
    assert.equal(localRoundAllowed({...input,...change}), false);
  }
});
test('double entry balances exact units and rejects incomplete or floating entries', () => {
  assert.equal(balancedLegs([{account:'a',units:'-9007199254740993000'},{account:'b',units:'9007199254740993000'}]).length,2);
  assert.throws(()=>balancedLegs([{account:'a',units:'-1'},{account:'b',units:'2'}]));
  assert.throws(()=>balancedLegs([{account:'a',units:'0.1'},{account:'b',units:'-0.1'}]));
});
