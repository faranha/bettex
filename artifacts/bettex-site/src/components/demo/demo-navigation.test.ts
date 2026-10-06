import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoView, demoPath, demoPageTitle, demoAccountTab } from './demo-navigation.ts';

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
test('app URLs are canonical while all legacy demo destinations remain recognizable', () => {
  for (const language of ['pt', 'en', 'es'] as const) {
    for (const view of ['home', 'central', 'wallet', 'treasury', 'simulation', 'account'] as const) {
      const canonical = demoPath(view, language);
      assert.ok(canonical.startsWith('/app'));
      assert.equal(demoView(canonical), view);
      assert.equal(demoView(canonical.replace('/app', '/demo')), view);
    }
  }
  assert.equal(demoView('/app/unknown'), undefined);
});
test('deep account links select the right tab across languages and legacy aliases', () => {
  for (const root of ['/app', '/demo', '/en/app', '/es/demo']) {
    for (const account of ['account', 'minha-conta', 'mi-cuenta']) {
      assert.equal(demoAccountTab(`${root}/${account}/security`), 'security');
      assert.equal(demoAccountTab(`${root}/${account}/security/password`), 'security');
      assert.equal(demoAccountTab(`${root}/${account}/profile`, '?tab=security'), 'profile');
      assert.equal(demoAccountTab(`${root}/${account}`, '?tab=history'), 'history');
      assert.equal(demoAccountTab(`${root}/${account}/unknown`), 'profile');
    }
  }
});