import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page = readFileSync(new URL('./InterfaceDemoPage.tsx', import.meta.url), 'utf8');
const stk = readFileSync(new URL('../demo/StakingCorridor.tsx', import.meta.url), 'utf8');
test('participation nested in central; sports and treasury outside', () => {
  const c = page.indexOf('id="central"'), p = page.indexOf('id="participation"'), end = page.indexOf('</section>', p);
  assert.ok(c > 0 && p > c && end > p);
  assert.ok(page.indexOf('<AgentShowcase') > end && page.indexOf('<TreasuryHomeEntry') > page.indexOf('<AgentShowcase'));
  assert.ok(!page.includes('showAgents'));
});
test('staking has no AI Center link', () => assert.ok(!stk.includes('staking-live-trading')));
