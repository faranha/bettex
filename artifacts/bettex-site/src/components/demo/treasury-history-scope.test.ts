import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

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
