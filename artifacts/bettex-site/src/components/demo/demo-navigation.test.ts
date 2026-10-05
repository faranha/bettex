import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoView, demoPath, demoPageTitle } from './demo-navigation.ts';

test('treasury is a dedicated localized destination, including on reload', () => {
  for (const language of ['pt', 'en', 'es'] as const) {
    assert.equal(demoView(demoPath('treasury', language)), 'treasury');
    assert.equal(demoView(demoPath('treasury', language) + '/'), 'treasury');
    assert.equal(demoView(demoPath('central', language)), 'central');
    assert.equal(demoView(demoPath('home', language)), 'home');
    assert.equal(demoView(demoPath('account', language)), 'account');
    assert.equal(demoView(demoPath('wallet', language)), 'wallet');
    assert.equal(demoView(demoPath('wallet', language) + '/'), 'wallet');
  }
  assert.equal(demoPageTitle('treasury', 'pt'), 'Tesouraria | BETTEX');
  assert.equal(demoPageTitle('treasury', 'en'), 'Treasury | BETTEX');
  assert.equal(demoPageTitle('treasury', 'es'), 'Tesorería | BETTEX');
  assert.equal(demoView('/demo/unknown'), undefined);
});
test('personal wallet and history have their own title, separate from account and dashboard', () => {
  assert.equal(demoPageTitle('wallet', 'pt'), 'Saldo e histórico | BETTEX');
  assert.equal(demoPageTitle('wallet', 'en'), 'Balance and history | BETTEX');
  assert.equal(demoPageTitle('wallet', 'es'), 'Saldo e historial | BETTEX');
  assert.notEqual(demoPath('wallet', 'pt'), demoPath('account', 'pt'));
  assert.notEqual(demoPath('wallet', 'pt'), demoPath('home', 'pt'));
});
test('profile and security details stay in the account area', () => {
  for (const language of ['pt', 'en', 'es'] as const) {
    for (const detail of ['/security', '/profile', '/security/password', '/profile/email-address']) {
      assert.equal(demoView(demoPath('account', language) + detail), 'account');
    }
  }
  assert.equal(demoView('/demo/accounting'), undefined);
  assert.equal(demoView('/demo/central/security'), undefined);
});