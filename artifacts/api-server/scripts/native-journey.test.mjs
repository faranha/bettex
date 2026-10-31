import test from 'node:test';
import assert from 'node:assert/strict';
import { participationAt } from '../src/modules/ledger/domain/participation.ts';
import { nativeJourney } from '../src/modules/execution/application/native-journey.ts';
import { findPurchaseInProgress, purchaseNeedsQuote } from '../../bettex-site/src/components/account/native-journey-status.ts';

const meta = { epoch: 'local-run', chainId: 31337, environment: 'local_evm', reserve: 'reserve',
  treasury: 'treasury', operating: 'operating', usdc: 'usdc', token: 'bettex', sale: 'sale', deploymentBlock: 1 };
const transfer = (from, to, value, timestamp, logIndex = 0) => ({ from, to, value, timestamp, blockNumber: timestamp, logIndex });
test('confirmed late entry earns only its own quantity × time', () => {
  const p = participationAt('wallet', [transfer('sale', 'wallet', '10', 50)], 100);
  assert.equal(p.balance, '10'); assert.equal(p.tokenSeconds, '500'); assert.equal(p.startedAt, 50);
});
test('partial exit resets ALL previous weight; residual balance restarts', () => {
  const p = participationAt('wallet', [transfer('sale', 'wallet', '10', 50), transfer('wallet', 'other', '3', 75)], 100);
  assert.equal(p.balance, '7'); assert.equal(p.tokenSeconds, '175'); assert.equal(p.startedAt, 75);
});
test('UTC round rollover never imports yesterday weight', () => {
  const p = participationAt('wallet', [transfer('sale', 'wallet', '10', 50)], 86420);
  assert.equal(p.roundStart, 86400); assert.equal(p.tokenSeconds, '200');
});
test('missing source history fails rather than inventing eligibility', () => {
  assert.throws(() => participationAt('wallet', [transfer('wallet', 'other', '3', 75)], 100));
});
test('self-transfer is not an outflow from the official wallet', () => {
  assert.equal(participationAt('wallet', [transfer('sale', 'wallet', '10', 50), transfer('wallet', 'wallet', '3', 75)], 100).tokenSeconds, '500');
});
test('UI resumes quote-only and confirmed-approval operation until BUY confirms', () => {
  const operation = { id: 'purchase', kind: 'purchase', stages: [] };
  assert.equal(findPurchaseInProgress([operation])?.id, 'purchase');
  assert.equal(purchaseNeedsQuote(operation), true);
  operation.stages.push({ name: 'approve', state: 'confirmed' });
  assert.equal(findPurchaseInProgress([operation])?.id, 'purchase');
  assert.equal(purchaseNeedsQuote(operation), true);
  operation.stages.push({ name: 'buy', state: 'sent' });
  assert.equal(findPurchaseInProgress([operation])?.id, 'purchase');
  assert.equal(purchaseNeedsQuote(operation), false);
  operation.stages[1].state = 'confirmed';
  assert.equal(findPurchaseInProgress([operation]), undefined);
});
function fixtures({ loss = false, noEvidence = false } = {}) {
  const operations = new Map(), stages = new Map(), receipts = new Map();
  let calls = 0, allowance = 0n;
  const store = {
    async create(account, epoch, id, kind, quantity = '0', principal = '0', fee = '0') {
      if (!operations.has(id)) operations.set(id, { id, account, epoch, kind, quantity, principal, fee });
      return operations.get(id);
    },
    async owned(account, epoch, id) {
      const op = operations.get(id);
      if (!op || op.account !== account || op.epoch !== epoch) throw new Error('operation_not_found');
      return op;
    },
    async intent(id, value) {
      const op = operations.get(id);
      if (op.intent && JSON.stringify(op.intent) !== JSON.stringify(value)) throw new Error('operation_conflict');
      op.intent = structuredClone(value);
    },
    async list(account, epoch) { return { archivedCount: 0, operations: [...operations.values()].filter(o => o.account === account && o.epoch === epoch)
      .map(o => ({ ...o, stages: [...stages.values()].filter(s => s.operationId === o.id).map(s => structuredClone(s)) })) }; },
    async stage(operation, name) { return structuredClone(stages.get(`${operation}:${name}`)); },
    async plan(operationId, epoch, name, sender, nonce, startBlock, draft) {
      const id = `${operationId}:${name}`;
      if (!stages.has(id)) stages.set(id, { id, operationId, name, sender, nonce, startBlock, draft, transactionHash: null, state: 'requested' });
      return structuredClone(stages.get(id));
    },
    async arm(id, executor, transactionHash) {
      const stage = stages.get(id);
      if (stage.state !== 'requested') return null;
      Object.assign(stage, { state: 'sending', executor, transactionHash: transactionHash ?? null });
      return structuredClone(stage);
    },
    async state(id, state, hash) { Object.assign(stages.get(id), { state, ...(hash ? { transactionHash: hash } : {}) }); },
  };
  const chain = {
    async draft(sender, to, data, value = '0') { return { nonce: stages.size, block: 1, draft: { nonce: stages.size, chainId: 31337, to, data, value } }; },
    async allowance() { return allowance; },
    encode(kind, values) { return JSON.stringify([kind, ...values.map(String)]); },
    async sendOperator(draft) { calls++; const hash = `hash-${draft.nonce}`; if (!noEvidence) receipts.set(hash, { hash, status: 1 }); if (loss) throw new Error('response_lost'); return hash; },
    validateSigned() { return 'signed-hash'; },
    async sendSigned() { calls++; receipts.set('signed-hash', { hash: 'signed-hash', status: 1 }); allowance = 99999999n; if (loss) throw new Error('response_lost'); return 'signed-hash'; },
    async verifyReceipt(hash) { return receipts.get(hash) ?? null; },
    async recover(sender, nonce) { const hash = `hash-${nonce}`; return receipts.has(hash) ? { hash } : null; },
  };
  const ports = { store, chain, executorId: 'executor', hashId: s => s, async verifyEffects() {} };
  return { store, stages, flow: nativeJourney(ports), other: nativeJourney({ ...ports, executorId: 'other' }), calls: () => calls };
}
const withdrawalIntent = { asset: 'USDC', destination: '0x' + 'a'.repeat(40), units: '1000000',
  executor: 'executor', deposit: 'deposit', holder: 'holder' };
test('withdrawal immutable intent, exact allowance and progressive signing survive reload', async () => {
  const f = fixtures(), id = '0x' + '1'.repeat(64), balances = { usdc: '25000000', bettex: '0' };
  await f.flow.withdrawal('account', meta, id, withdrawalIntent, balances);
  assert.equal((await f.store.stage(id, 'approve-usdc-withdraw')).draft.data, JSON.stringify(['approve', 'executor', '3500000']));
  await assert.rejects(f.other.withdrawal('account', meta, id, { ...withdrawalIntent, destination: '0x' + 'b'.repeat(40) }, balances), /operation_conflict/);
  await f.flow.sign('account', meta, id, 'approve-usdc-withdraw', 'raw');
  await f.other.withdrawal('account', meta, id, withdrawalIntent, balances);
  assert.ok(await f.store.stage(id, 'withdraw'));
  await f.flow.sign('account', meta, id, 'withdraw', 'raw');
  await f.other.sign('account', meta, id, 'withdraw', 'raw');
  assert.equal(f.calls(), 2, 'one approval and one withdrawal broadcast');
});
test('withdrawal rejects wrong destinations, insufficient fee and missing ownership', async () => {
  const f = fixtures(), id = '0x' + '2'.repeat(64);
  await assert.rejects(f.flow.withdrawal('account', meta, id, withdrawalIntent, { usdc: '1000000', bettex: '0' }), /usdc_insufficient/);
  await assert.rejects(f.flow.withdrawal('account', meta, id, { ...withdrawalIntent, destination: '0x' + '0'.repeat(40) }, { usdc: '25000000', bettex: '0' }), /invalid_destination/);
  await f.flow.withdrawal('account', meta, id, withdrawalIntent, { usdc: '25000000', bettex: '0' });
  await assert.rejects(f.flow.sign('other', meta, id, 'approve-usdc-withdraw', 'raw'), /operation_not_found/);
  assert.equal(f.calls(), 0);
});
test('lost operator response recovers four original transactions; retry sends nothing', async () => {
  const f = fixtures({ loss: true });
  await f.flow.fund('account', meta, 'deposit', 'holder', '100000000', true);
  assert.equal(f.calls(), 4);
  await f.other.fund('account', meta, 'deposit', 'holder', '100000000', true);
  assert.equal(f.calls(), 4);
  assert.ok([...f.stages.values()].every(s => s.state === 'confirmed'));
});
test('uncertain operation without evidence is neither retried nor called success', async () => {
  const f = fixtures({ loss: true, noEvidence: true });
  await f.flow.fund('account', meta, 'deposit', 'holder', '100000000', true);
  await f.other.fund('account', meta, 'deposit', 'holder', '100000000', true);
  assert.equal(f.calls(), 1);
  assert.equal([...f.stages.values()][0].state, 'uncertain');
});
test('duplicate signed approval request has one broadcast, including lost response', async () => {
  const f = fixtures({ loss: true }), id = `0x${'1'.repeat(64)}`;
  await f.flow.quote('account', meta, 'deposit', 'holder', id, '100', { price: '50000', fee: '2500000', paused: false, available: String(100000n * 10n ** 18n) }, '25000000');
  await Promise.all([f.flow.sign('account', meta, id, 'approve', 'raw'), f.other.sign('account', meta, id, 'approve', 'raw')]);
  assert.equal(f.calls(), 1);
  assert.equal((await f.store.stage(id, 'approve')).state, 'confirmed');
  await assert.rejects(f.flow.sign('different-account', meta, id, 'approve', 'raw'));
});
test('insufficient reserve, unaccepted local network, price or inventory fail before send', async () => {
  const f = fixtures(), id = `0x${'2'.repeat(64)}`;
  await assert.rejects(f.flow.fund('account', meta, 'deposit', 'holder', '0', true), /reserve_insufficient/);
  await assert.rejects(f.flow.fund('account', meta, 'deposit', 'holder', '100000000', false), /acknowledgement/);
  await assert.rejects(f.flow.quote('account', meta, 'deposit', 'holder', id, '100', { price: '50000', fee: '2500000', paused: false, available: '0' }, '25000000'), /inventory/);
  assert.equal(f.calls(), 0);
});
