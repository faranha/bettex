import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = (name: string) => readFileSync(new URL(name, import.meta.url), 'utf8');

test('wallet key icon toggles the same export panel closed and switches directly to another wallet', () => {
  const demo = source('./ProtectedDemoWallets.tsx');
  const expression = demo.match(/setSelected\(current => (current\?\.id === wallet\?\.id \? undefined : wallet)\)/);
  assert.ok(expression, 'Export must use a functional toggle of the selected wallet');
  const toggle = new Function('current', 'wallet', `return ${expression[1]};`);
  const usdc = { id: 'test-usdc' };
  const bettex = { id: 'test-bettex' };
  assert.equal(toggle(undefined, usdc), usdc);
  assert.equal(toggle(usdc, usdc), undefined);
  assert.equal(toggle(usdc, bettex), bettex);
  assert.equal(toggle(bettex, bettex), undefined);
  assert.equal(toggle(undefined, bettex), bettex);
});

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
