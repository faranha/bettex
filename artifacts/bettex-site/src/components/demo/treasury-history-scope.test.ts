import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('homepage Treasury slider omits detailed round summary while full Treasury retains it', () => {
  const slider = read('TreasurySlider.tsx');
  assert.doesNotMatch(slider, /TreasuryCycle|id: 'round'/);
  for (const id of ['wallets', 'statement', 'burn', 'pool']) {
    assert.match(slider, new RegExp(`id: '${id}'`));
  }
  assert.match(slider, /link-open-treasury/);
  assert.match(read('TreasuryOverview.tsx'), /<TreasuryCycle d=\{d\}/);
});

test('Treasury has no horizontally scrolling wallet list; dashboard uses one wallet per slide', () => {
  const wallets = read('TreasuryWallets.tsx');
  assert.doesNotMatch(wallets, /overflow-x-auto|scrollBy|scrollTo|snap-x|w-\[300px\]|w-\[320px\]/);
  assert.match(wallets, /if \(wallet && wallet !== p\) return null/);
  assert.match(wallets, /data-testid="wallet-list" className="grid min-w-0 gap-3"/);
  const slider = read('TreasurySlider.tsx');
  for (const wallet of ['operational', 'reserve', 'crypto_agent', 'buyback']) {
    assert.match(slider, new RegExp(`layout="compact" wallet="${wallet}"`));
  }
  assert.match(slider, /flex min-w-0 flex-wrap justify-center/);
  assert.match(read('TreasuryOverview.tsx'), /layout="vertical"/);
});

test('Treasury never mounts historical panels, including for privileged accounts', () => {
  const page = read('../../pages/demo.tsx');
  const treasury = page.slice(page.indexOf("tab === 'treasury'"), page.indexOf("tab === 'account'"));
  assert.ok(treasury.length > 0);
  assert.match(treasury, /<TreasuryOverview/);
  assert.doesNotMatch(treasury, /HistoryPanel|RoundHistory|RoundArchiveBrowser|d\.rounds/);
  for (const file of ['TreasuryOverview.tsx', 'TreasuryCycle.tsx']) {
    assert.doesNotMatch(read(file), /HistoryPanel|RoundHistory|RoundArchiveBrowser|d\.rounds/);
  }
});

test('Historical access and the current-round summary remain available', () => {
  assert.match(read('WalletPage.tsx'), /treasuryAccess=\{!!d\.profile\.canViewTreasuryHistory\}/);
  assert.match(read('WalletPage.tsx'), /<RoundHistory/);
  assert.match(read('TreasuryCycle.tsx'), /link-treasury-round-history/);
  assert.match(read('TreasuryCycle.tsx'), /#round-archive/);
  assert.match(read('TreasuryCycle.tsx'), /<RoundSummary/);
});
