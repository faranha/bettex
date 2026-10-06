import { test } from 'node:test';
import assert from 'node:assert/strict';
import { walletHistoryRow, decimalQuantity, filterWalletHistory, brlReference } from './wallet-history-model.ts';
import { collectWalletHistory } from './history-pagination.ts';
import { exportWalletHistory, safeCsvCell } from './wallet-history-export.ts';
import { walletHistoryExamples } from './wallet-history-examples.ts';
import type { HistoryEntry, HistoryPage, DemoDashboard } from '@workspace/api-client-react';

const now = '2026-10-06T00:00:00Z';
const d = { balances: { brlPerUsdc: 5.25, bettexUsdc: .04 } } as DemoDashboard;
function entry(patch: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: 'ONE', correlationId: 'movement:one', category: 'financial', kind: 'swap', state: 'confirmed',
    actor: 'user', environment: 'simulation', asset: 'BETTEX', occurredAt: now,
    processedAt: now, source: 'demo_engine', reconstructed: false,
    data: { amountUnits: '2500000000000000000000', decimals: '18', paidAsset: 'USDC', paidUnits: '100000000', paidDecimals: '6', feeUnits: '100000' },
    ...patch,
  };
}
const page = (items: HistoryEntry[], nextCursor: string | null = null): HistoryPage => ({
  items, nextCursor, completeFrom: now, limitations: [], timezone: 'America/Sao_Paulo', syncState: 'current',
});
const f = { wallet: '', type: '', state: '', search: '' };
test('quantities preserve full native integer precision and reject missing or malformed values', () => {
  assert.equal(decimalQuantity('123456789012345678901234567890123456', 18), '123456789012345678.901234567890123456');
  assert.equal(decimalQuantity('1', 18), '0.000000000000000001');
  assert.equal(decimalQuantity('0', 6), '0');
  assert.equal(decimalQuantity('-1000000', 6), '-1');
  assert.equal(decimalQuantity(undefined, 6), null);
  assert.equal(decimalQuantity('1.5', 6), null);
  assert.equal(decimalQuantity('1', 37), null);
});
test('swap debit, output and fee are separate, and both wallets match', () => {
  const row = walletHistoryRow(entry());
  assert.equal(row.amount, '2500'); assert.equal(row.paidAmount, '100'); assert.equal(row.feeUsdc, '0.1');
  assert.equal(filterWalletHistory([row], { ...f, wallet: 'USDC' }).length, 1);
  assert.equal(filterWalletHistory([row], { ...f, wallet: 'BETTEX' }).length, 1);
  assert.equal(brlReference(row, d), 525);
  assert.equal(brlReference(row, d, true), .525);
});
test('received asset has its own decimals, independent of the debit asset', () => {
  const row = walletHistoryRow(entry({ asset: 'USDC', data: {
    receivedAsset: 'BETTEX', receivedUnits: '1500000000000000000', receivedDecimals: '18',
    paidAsset: 'USDC', paidUnits: '60000', paidDecimals: '6', decimals: '6',
  } }));
  assert.equal(row.asset, 'BETTEX'); assert.equal(row.amount, '1.5'); assert.equal(row.paidAmount, '0.06');
});
test('yield, requests and wallet-related fee records support conjunctive filters', () => {
  const yieldRow = walletHistoryRow(entry({ id: 'YIELD', kind: 'distribution_paid', asset: 'USDC', data: { amountUnits: '717628', decimals: '6' } }));
  const send = walletHistoryRow(entry({ id: 'SEND', kind: 'financial_requested', state: 'pending', data: { operationKind: 'send', amountUnits: '500000000000000000000', decimals: '18', feeUnits: '10000' } }));
  assert.equal(yieldRow.type, 'yield'); assert.equal(yieldRow.amount, '0.717628');
  assert.equal(filterWalletHistory([yieldRow, send], { ...f, wallet: 'BETTEX', type: 'yield', state: 'confirmed' })[0]?.id, 'YIELD');
  assert.equal(filterWalletHistory([send], { ...f, wallet: 'USDC', type: 'send', state: 'pending' }).length, 1);
  assert.equal(filterWalletHistory([send], { ...f, type: 'withdrawal' }).length, 0);
});
test('wallet address matching is case insensitive and supports related wallet fields', () => {
  const row = walletHistoryRow(entry({ wallet: '0xAbC', transactionHash: '0xHASH', data: { targetWallet: '0xDeF' } }));
  assert.equal(filterWalletHistory([row], { ...f, wallet: '0xabc' }).length, 1);
  assert.equal(filterWalletHistory([row], { ...f, wallet: '0xdef', search: 'hash' }).length, 1);
  assert.equal(filterWalletHistory([row], { ...f, wallet: '0xother' }).length, 0);
});
test('a simulation quote never becomes a native BETTEX or ETH market price', () => {
  const row = walletHistoryRow(entry({ environment: 'local_evm' }));
  assert.equal(brlReference(row, d), null);
  assert.equal(brlReference({ ...row, asset: 'ETH' }, d), null);
  assert.equal(brlReference({ ...row, amount: null }, d), null);
  assert.equal(brlReference({ ...row, asset: 'USDC', amount: '12.8' }, d), 67.2);
});
test('exports retain precision, fee details and provenance but remove unsafe raw data', () => {
  const row = walletHistoryRow(entry({ data: { amountUnits: '1000000000000000001', decimals: '18', privateKey: 'SENSITIVE_TEST_VALUE', mnemonic: 'SENSITIVE_TEST_VALUE', gasWei: '21000' } }));
  const json = exportWalletHistory([row], d, 'json');
  assert.ok(json.includes('1.000000000000000001'));
  assert.ok(json.includes('gasWei'));
  assert.ok(!json.includes('SENSITIVE_TEST_VALUE'));
  assert.ok(!json.includes('privateKey'));
  assert.ok(exportWalletHistory([row], d, 'csv').includes('1.000000000000000001'));
});
test('CSV safely escapes delimiters, quotes, newlines and spreadsheet formulas', () => {
  assert.equal(safeCsvCell('a,"b"\nc'), '"a,""b""\nc"');
  for (const cell of ['=CMD()', '+CMD()', '@SUM(1)', '-1', '\t=CMD()', '  =CMD()']) assert.ok(safeCsvCell(cell).startsWith('"\''));
});
test('illustrative examples cannot leak into actual-record exports', () => {
  const examples = walletHistoryExamples(now);
  const actual = walletHistoryRow(entry());
  assert.equal(examples.length, 12);
  assert.ok(examples.every(row => row.example));
  const json = JSON.parse(exportWalletHistory([actual, ...examples], d, 'json'));
  assert.equal(json.count, 1); assert.equal(json.records[0].id, 'ONE');
  assert.ok(!exportWalletHistory([actual, ...examples], d, 'csv').includes('EXAMPLE-'));
  const sampleJson = JSON.parse(exportWalletHistory([actual, ...examples], d, 'json', 'examples'));
  assert.equal(sampleJson.scope, 'illustrative_examples'); assert.equal(sampleJson.count, 12);
});
test('full archives traverse every cursor, de-duplicate records and sort newest first', async () => {
  const calls: (string | undefined)[] = [];
  const rows = await collectWalletHistory(async cursor => {
    calls.push(cursor);
    return cursor ? page([entry(), entry({ id: 'TWO', occurredAt: '2026-10-07T00:00:00Z' })]) : page([entry()], 'page-two');
  });
  assert.deepEqual(calls, [undefined, 'page-two']);
  assert.deepEqual(rows.map(r => r.id), ['TWO','ONE']);
});
test('paging failures never produce a partial archive or an infinite export', async () => {
  await assert.rejects(collectWalletHistory(async () => page([entry()], 'same-cursor')), /history_cursor_repeated/);
  await assert.rejects(collectWalletHistory(async () => ({ ...page([entry()]), syncState: 'unavailable' })), /history_unavailable/);
  await assert.rejects(collectWalletHistory(async cursor => {
    if (cursor) throw new Error('network_failed');
    return page([entry()], 'next');
  }), /network_failed/);
});
