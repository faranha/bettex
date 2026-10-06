import test from 'node:test';
import assert from 'node:assert/strict';
import { isDemoSession } from './demo-session.ts';
import type { DemoProfile } from '@workspace/api-client-react';
import { readFileSync } from 'node:fs';

const profile: DemoProfile = { name: 'Demo', email: 'demo@example.com', accountId: 'test-browser', memberSince: '2026-10-06T00:00:00Z' };
test('browser demo is automatically active without impersonating actual authentication', () => {
  assert.equal(isDemoSession({ ...profile, provider: 'anonymous', authenticated: false }), true);
  assert.equal(isDemoSession(profile), true);
  assert.equal(isDemoSession({ ...profile, provider: 'native', authenticated: false }), false);
  assert.equal(isDemoSession({ ...profile, provider: 'native', authenticated: true }), false);
  assert.equal(isDemoSession({ ...profile, provider: 'clerk', authenticated: true }), false);
});
test('automatic demo branches preserve real auth and do not mount legacy blockchain sign-in', () => {
  const root = new URL('./', import.meta.url);
  const wallet = readFileSync(new URL('WalletPage.tsx', root), 'utf8');
  const account = readFileSync(new URL('../account/AccountSheet.tsx', root), 'utf8');
  assert.match(wallet, /isDemoSession\(d.profile\) \? <TestPeriodNotice/);
  assert.match(account, /isDemoSession\(d.profile\) && !explicitProvider/);
  assert.match(account, /<AccountPanel/);
  for (const file of ['DemoAccountPanel.tsx', 'DemoWalletsCard.tsx', 'TestPeriodNotice.tsx']) {
    const source = readFileSync(new URL(file, root), 'utf8');
    assert.doesNotMatch(source, /SignInButton|signInTestAccount|createTestAccount|privateWalletAction|useGetNativeTestJourney/);
  }
});
