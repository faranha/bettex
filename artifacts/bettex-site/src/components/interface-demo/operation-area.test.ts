import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page = readFileSync(new URL('./InterfaceDemoPage.tsx', import.meta.url), 'utf8');
const stk = readFileSync(new URL('../demo/StakingCorridor.tsx', import.meta.url), 'utf8');
test('participation stays within Central, without the promotional agent showcase', () => {
  const c = page.indexOf('id="central"'), p = page.indexOf('id="participation"'), end = page.indexOf('</section>', p);
  assert.ok(c > 0 && p > c && end > p);
  assert.doesNotMatch(page, /AgentShowcase/);
  assert.doesNotMatch(page, /id="treasury"|<MockTreasuryPanel d=\{d\} embedded/);
  assert.match(page, /view === 'treasury' && <MockTreasuryPanel d=\{d\}/);
  assert.ok(!page.includes('showAgents'));
});
test('staking has no AI Center link', () => assert.ok(!stk.includes('staking-live-trading')));
