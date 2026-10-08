import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { walletHistoryRow, decimalQuantity, filterWalletHistory, brlReference, walletFilterFromSearch } from './wallet-history-model.ts';
import { collectWalletHistory } from './history-pagination.ts';
import { shouldRetryWalletHistory } from './history-query-policy.ts';
import { exportWalletHistory, safeCsvCell } from './wallet-history-export.ts';
import { walletHistoryExamples } from './wallet-history-examples.ts';
import type { HistoryEntry, HistoryPage, DemoDashboard } from '@workspace/api-client-react';
import { walletAllocation, walletAllocationRows } from './treasury-wallet-history-model.ts';
import type { DemoTreasuryRound, DemoRound } from '@workspace/api-client-react';

const now = '2026-10-06T00:00:00Z';
test('Treasury wallet history uses its saved allocations without backfilling old rounds', () => {
  const snapshot = { id: 'current', startedAt: now, reserveUsdc: 50, operationalWalletUsdc: 90,
    agentAllocations: [{ agent: 'crypto', allocatedUsdc: 10 }] } as DemoTreasuryRound;
  const old = { ...snapshot, id: 'old', reserveUsdc: 25, operationalWalletUsdc: 70,
    agentAllocations: [{ ...snapshot.agentAllocations![0], allocatedUsdc: 5 }] } as DemoTreasuryRound;
  const rounds = [
    { id: 'old', endedAt: now, treasurySnapshot: old },
    { id: 'legacy', endedAt: now },
    { id: 'current', endedAt: now, treasurySnapshot: snapshot },
  ] as DemoRound[];
  const rows = walletAllocationRows(snapshot, rounds);
  assert.deepEqual(rows.map(r => r.id), ['current', 'old', 'legacy']);
  assert.equal(walletAllocation(rows[1].snapshot, 'reserve'), 25);
  assert.equal(walletAllocation(rows[1].snapshot, 'operational'), 70);
  assert.equal(walletAllocation(rows[1].snapshot, 'crypto_agent'), 5);
  for (const wallet of ['reserve', 'operational', 'crypto_agent'] as const) assert.equal(walletAllocation(rows[2].snapshot, wallet), null);
  const legacy = { ...snapshot, operationalWalletUsdc: undefined, agentAllocations: undefined };
  assert.equal(walletAllocation(legacy, 'operational'), null);
  assert.equal(walletAllocation(legacy, 'crypto_agent'), null);
  assert.equal(walletAllocation({ ...snapshot, reserveUsdc: 0 }, 'reserve'), 0);
  const panel = readFileSync(new URL('./TreasuryStatement.tsx', import.meta.url), 'utf8');
  assert.match(panel, /wallet: walletScope \?\? 'all'/);
  assert.match(panel, /TreasuryWalletRoundHistory key=\{walletScope\}/);
  assert.match(panel, /const noTransferLedger = reserveOnly;/);
  assert.match(panel, /setFrom\(roundStartedAt \? brazilDate\(roundStartedAt\) : today\); setTo\(today\);/);
});
test('demo distribution audit reads scheduled calculations without a manual simulation action', () => {
  const source = readFileSync(new URL('./HistoryPanel.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /button-simulate-distribution|previewHistoryDistribution|runSim|No simulation recorded yet/);
  assert.match(source, /const q = usePage\(mode, accountKey, view, apiFilters, cursor\)/);
});

test('wallet filters do not offer a separate gas wallet or retain its legacy selection', () => {
  const source = readFileSync(new URL('./WalletStatement.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /<option\s+value="(?:ETH|GAS|gas)"/);
  assert.equal(walletFilterFromSearch('?wallet=ETH'), '');
  assert.equal(walletFilterFromSearch('?wallet=GAS'), '');
  for (const wallet of ['earnings', 'USDC', 'BETTEX']) {
    assert.equal(walletFilterFromSearch(`?wallet=${wallet}`), wallet);
  }
});

test('earnings history links select the wallet, include past credits and reset on navigation', () => {
  assert.equal(walletFilterFromSearch('?wallet=earnings'), 'earnings');
  assert.equal(walletFilterFromSearch('wallet=USDC'), 'USDC');
  assert.equal(walletFilterFromSearch('?wallet=BETTEX'), 'BETTEX');
  assert.equal(walletFilterFromSearch(''), '');
  assert.equal(walletFilterFromSearch('?wallet=unsupported'), '');
  const credit = walletHistoryRow(entry({ kind: 'distribution', data: { amountUnits: '1000000', decimals: 6 } }));
  const transfer = walletHistoryRow(entry({ id: 'TRANSFER', kind: 'transfer', data: { sourceWallet: 'earnings', amountUnits: '2000000', decimals: 6 } }));
  const unrelated = walletHistoryRow(entry({ id: 'DEPOSIT', kind: 'receive', data: { amountUnits: '1000000', decimals: 6 } }));
  assert.deepEqual(filterWalletHistory([credit, transfer, unrelated], { wallet: 'earnings', type: '', state: '', search: '' }).map(r => r.id), [credit.id, transfer.id]);
});
test('earnings offers only an internal dollar-wallet transfer, never an external withdrawal', () => {
  const card = readFileSync(new URL('../demo/EarningsWalletCard.tsx', import.meta.url), 'utf8');
  const form = readFileSync(new URL('../demo/fin.tsx', import.meta.url), 'utf8');
  assert.equal((card.match(/onWallet\('earnings-transfer', 'USDC'\)/g) ?? []).length, 1);
  assert.match(card, /data-testid="button-earnings-transfer"/);
  assert.match(card, /bg-\[#0E7C6B\]/);
  assert.doesNotMatch(card + form, /earnings-withdraw/);
  assert.match(form, /const needDest = k === 'send' \|\| k === 'withdraw';/);
});
test('earnings wallet is a compact green piggy bank with distinct paid and projected values, filtered history and no card fee', () => {
  const card = readFileSync(new URL('../demo/EarningsWalletCard.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(card, /col-span-full/);
  assert.match(card, /previousCycle\(d\)\?\.received/);
  assert.match(card, /scenarioStakingView\(d\)\?\.timeline.projectedOwnUsdc/);
  assert.match(card, /<PiggyBank/);
  assert.doesNotMatch(card, /Flame|TokenIcon/);
  assert.doesNotMatch(card, /<section/);
  assert.match(card, /earnings-last-round/);
  assert.match(card, /earnings-current-projection/);
  assert.match(card, /button-earnings-history/);
  assert.match(card, /WalletHistoryLink wallet="earnings"/);
  assert.match(card, /not guaranteed and not yet received/);
  assert.doesNotMatch(card, /2[.,]50|fee|taxa|comisión/i);
});
test('burned tokens have their own flame block without fabricated quantities or a buyback-budget conversion', () => {
  const card = readFileSync(new URL('../demo/BurnedTokensCard.tsx', import.meta.url), 'utf8');
  const wallets = readFileSync(new URL('../demo/DemoWalletsCard.tsx', import.meta.url), 'utf8');
  assert.match(card, /<Flame/);
  assert.match(card, /burned-tokens-value/);
  assert.match(card, /Not recorded/);
  assert.match(card, /Buyback budgets do not count as burns/);
  assert.match(card, /demoPath\('treasury', loc\)/);
  assert.match(wallets, /<EarningsWalletCard.*<BurnedTokensCard/);
  assert.doesNotMatch(card, /receivedYield|buybackUsdc|bettexUsdc|v=\{0\}/);
});
test('each demo and native wallet exposes a labeled icon link to its selected history filter', () => {
  const link = readFileSync(new URL('../demo/WalletHistoryLink.tsx', import.meta.url), 'utf8');
  const wallets = readFileSync(new URL('../demo/DemoWalletsCard.tsx', import.meta.url), 'utf8');
  const native = readFileSync(new URL('../demo/NativeWalletsCard.tsx', import.meta.url), 'utf8');
  assert.match(link, /demoPath\('wallet', loc\)/);
  assert.match(link, /historyQuery\('wallets', \{ wallet \}\)/);
  assert.match(link, /#wallet-statement/);
  assert.match(link, /<History/);
  assert.match(link, /aria-label=\{label\}/);
  assert.match(link, /Open history: \$\{name\}/);
  assert.match(wallets, /<WalletHistoryLink wallet=\{asset/);
  assert.match(native, /<WalletHistoryLink wallet=\{w.purpose === 'deposits' \? 'USDC' : 'BETTEX'\}/);
});
test('request audit records cannot imply a second fee or an unfinished settlement', () => {
  const source = readFileSync(new URL('./WalletStatement.tsx', import.meta.url), 'utf8');
  assert.match(source, /const pending = !requestRecord/);
  assert.match(source, /const noCredit = BAD\.has\(r\.state\);/);
  assert.match(source, /Request logged/);
  assert.match(source, /this is not a second charge/);
  assert.match(source, /Quoted fee/);
});
test('money retains exact read-only amounts and a blank conversion does not trigger an overdraw alert', () => {
  const source = readFileSync(new URL('../demo/fin.tsx', import.meta.url), 'utf8');
  assert.match(source, /data-amount=\{v\} data-asset=\{a\}/);
  assert.match(source, /const over = n > 0 &&/);
});
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
  const result = await collectWalletHistory(async cursor => {
    calls.push(cursor);
    return cursor ? page([entry(), entry({ id: 'TWO', occurredAt: '2026-10-07T00:00:00Z' })]) : page([entry()], 'page-two');
  });
  assert.deepEqual(calls, [undefined, 'page-two']);
  assert.deepEqual(result.rows.map(r => r.id), ['TWO','ONE']);
  assert.equal(result.syncUnavailable, false);
});
test('paging failures never produce a partial archive or an infinite export', async () => {
  await assert.rejects(collectWalletHistory(async () => page([entry()], 'same-cursor')), /history_cursor_repeated/);
  await assert.rejects(collectWalletHistory(async cursor => {
    if (cursor) throw new Error('network_failed');
    return page([entry()], 'next');
  }), /network_failed/);
});
test('live-sync outages preserve saved records and their exact transaction states across all pages', async () => {
  const result = await collectWalletHistory(async cursor => cursor
    ? page([entry({ id: 'TWO', state: 'pending' })])
    : { ...page([entry()], 'next'), syncState: 'unavailable' });
  assert.equal(result.syncUnavailable, true);
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows.find(r => r.id === 'ONE')?.state, 'confirmed');
  assert.equal(result.rows.find(r => r.id === 'TWO')?.state, 'pending');
});
test('empty saved history retains the live-sync warning rather than implying current chain coverage', async () => {
  const result = await collectWalletHistory(async () => ({ ...page([]), syncState: 'unavailable' }));
  assert.deepEqual(result, { rows: [], syncUnavailable: true });
});
test('temporary history requests retry twice; auth, bad responses and corrupt paging never retry', () => {
  for (const status of [408, 429, 500, 503]) assert.equal(shouldRetryWalletHistory(0, { status }), true);
  assert.equal(shouldRetryWalletHistory(1, new TypeError('Failed to fetch')), true);
  assert.equal(shouldRetryWalletHistory(2, { status: 503 }), false);
  for (const status of [200, 400, 401, 403, 404, 422]) assert.equal(shouldRetryWalletHistory(0, { status }), false);
  assert.equal(shouldRetryWalletHistory(0, new Error('history_cursor_repeated')), false);
});
