import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = (name: string) => readFileSync(new URL(name, import.meta.url), 'utf8');

test('keys are masked until explicitly revealed, and copying requires a visible key', () => {
  const row = source('./WalletKeyRow.tsx');
  assert.match(row, /useState\(false\)/);
  assert.match(row, /visible && key \? key : '•+'/);
  assert.match(row, /if \(!visible \|\| !key\) return/);
  assert.match(row, /disabled=\{!visible \|\| !key\}/);
  assert.match(row, /visibilitychange/);
  assert.match(row, /pagehide/);
  assert.match(row, /setTimeout\(hide, 60_000\)/);
  assert.match(row, /attempt !== generation\.current/);
});

test('demo private-key decryption is triggered by the eye, not opening export', () => {
  const demo = source('./ProtectedDemoWallets.tsx');
  assert.match(demo, /WalletKeyRow id="export-public"/);
  assert.match(demo, /WalletKeyRow id="export-private".*loadValue=\{\(\) => revealDeviceWallet/);
  assert.doesNotMatch(demo, /void revealDeviceWallet/);
  assert.doesNotMatch(demo, /privateKey \|\|/);
  assert.match(demo, /Arbitrum Sepolia · 421614/);
});

test('native and existing encrypted wallets share masked key rows without skipping their password gate', () => {
  const native = source('./account-ui/AccountPanel.tsx');
  assert.match(native, /WalletKeyRow id=\{`pubkey-/);
  assert.match(native, /WalletKeyRow id=\{`private-.*revealOnValue onRequestReveal=\{\(\) => open\('reveal'\)\}/);
  assert.match(native, /privateWalletAction\(snap, p, w\.id, a, controller\.signal\)/);
  assert.match(native, /if \(!action \|\| !pw \|\| !ack \|\| busy\) return/);
  assert.doesNotMatch(native, /<p[^>]*data-testid=\{`text-secret-[^]*?\}>\{secret\}/);
});
