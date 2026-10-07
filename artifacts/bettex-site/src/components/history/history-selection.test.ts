import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { historyQuery, selectHistoryArea, treasuryFiltersFromSearch, treasuryWalletFromSearch } from './history-selection.ts';

test('each financial shortcut selects its own history area', () => {
  for (const wallet of ['USDC', 'BETTEX', 'ETH', 'earnings']) {
    const query = historyQuery('wallets', { wallet });
    assert.equal(selectHistoryArea(query), 'wallets');
    assert.equal(new URLSearchParams(query).get('wallet'), wallet);
  }
  for (const account of ['treasury', 'buyback'] as const) for (const asset of ['USDC', 'BETTEX'] as const) {
    const query = historyQuery('treasury', { treasuryAccount: account, treasuryAsset: asset });
    assert.equal(selectHistoryArea(query), 'treasury');
    assert.deepEqual(treasuryFiltersFromSearch(query), { account, asset });
  }
});

test('old bookmarks retain wallet, statement and round destinations', () => {
  assert.equal(selectHistoryArea('?wallet=BETTEX'), 'wallets');
  assert.equal(selectHistoryArea('', '#wallet-statement'), 'wallets');
  assert.equal(selectHistoryArea('', '#treasury-statement'), 'treasury');
  for (const tab of ['burn', 'lottery', 'fees', 'positions', 'closed']) assert.equal(selectHistoryArea(`?roundTab=${tab}`), 'rounds');
  assert.equal(selectHistoryArea('', '#round-archive'), 'rounds');
  assert.equal(selectHistoryArea('?history=audit'), 'audit');
});

test('invalid input never invents a financial account or asset', () => {
  assert.equal(selectHistoryArea('?history=invalid'), 'rounds');
  assert.deepEqual(treasuryFiltersFromSearch('?treasuryAccount=personal&treasuryAsset=ETH'), { account: 'all', asset: 'all' });
});
test('assigned Treasury wallets each have an explicit history counterpart', () => {
  for (const purpose of ['operational', 'reserve', 'buyback', 'crypto_agent']) {
    const search = historyQuery('treasury', { treasuryWallet: purpose });
    assert.equal(selectHistoryArea(search), 'treasury');
    assert.equal(treasuryWalletFromSearch(search), purpose);
  }
  assert.equal(treasuryWalletFromSearch('?treasuryWallet=invalid'), null);
});
