import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoView, demoPath, demoPageTitle, demoAccountTab, isRemovedSimulationPath } from './demo-navigation.ts';

test('treasury is a dedicated localized destination, including on reload', () => {
  for (const language of ['pt', 'en', 'es'] as const) {
    assert.equal(demoView(demoPath('treasury', language)), 'treasury');
    assert.equal(demoView(demoPath('treasury', language) + '/'), 'treasury');
    assert.equal(demoView(demoPath('central', language)), 'central');
    assert.equal(demoView(demoPath('home', language)), 'home');
    assert.equal(demoView(demoPath('account', language)), 'account');
    assert.equal(demoView(demoPath('wallet', language)), 'account');
    assert.equal(demoView(demoPath('wallet', language) + '/'), 'account');
    assert.equal(demoAccountTab(demoPath('wallet', language)), 'history');
  }
  assert.equal(demoPageTitle('treasury', 'pt'), 'Tesouraria | BETTEX');
  assert.equal(demoPageTitle('treasury', 'en'), 'Treasury | BETTEX');
  assert.equal(demoPageTitle('treasury', 'es'), 'Tesorería | BETTEX');
  assert.equal(demoView('/demo/unknown'), undefined);
});
test('removed simulation destinations are not product views and only their exact bookmarks redirect', () => {
  for (const prefix of ['', '/en', '/es']) {
    for (const root of ['/app', '/demo']) {
      for (const slug of ['simulacao', 'simulation', 'simulacion']) {
        const path = `${prefix}${root}/${slug}`;
        assert.equal(isRemovedSimulationPath(path), true);
        assert.equal(isRemovedSimulationPath(`${path}/`), true);
        assert.equal(demoView(`${root}/${slug}`), undefined);
        assert.equal(isRemovedSimulationPath(`${path}/unrelated`), false);
      }
    }
  }
  assert.equal(isRemovedSimulationPath('/app/treasury'), false);
});
test('balance and history links point inside My account, not a separate app area', () => {
  assert.equal(demoPageTitle('wallet', 'pt'), 'Saldo e histórico | BETTEX');
  assert.equal(demoPageTitle('wallet', 'en'), 'Balance and history | BETTEX');
  assert.equal(demoPageTitle('wallet', 'es'), 'Saldo e historial | BETTEX');
  for (const language of ['pt', 'en', 'es'] as const) {
    assert.equal(demoPath('wallet', language), `${demoPath('account', language)}/history`);
  }
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
    for (const view of ['home', 'central', 'wallet', 'treasury', 'account'] as const) {
      const canonical = demoPath(view, language);
      assert.ok(canonical.startsWith('/app'));
      assert.equal(demoView(canonical), view === 'wallet' ? 'account' : view);
      assert.equal(demoView(canonical.replace('/app', '/demo')), view === 'wallet' ? 'account' : view);
    }
  }
  assert.equal(demoView('/app/unknown'), undefined);
  for (const legacy of ['/app/saldo', '/app/balance', '/demo/saldo', '/demo/balance']) {
    assert.equal(demoView(legacy), 'wallet');
  }
});
test('deep account links select the right tab across languages and legacy aliases', () => {
  for (const root of ['/app', '/demo', '/en/app', '/es/demo']) {
    for (const account of ['account', 'minha-conta', 'mi-cuenta']) {
      assert.equal(demoAccountTab(`${root}/${account}/security`), 'profile');
      assert.equal(demoAccountTab(`${root}/${account}/security/password`), 'profile');
      assert.equal(demoAccountTab(`${root}/${account}/operations`), 'wallets');
      assert.equal(demoAccountTab(`${root}/${account}`, '?tab=operations'), 'wallets');
      assert.equal(demoAccountTab(`${root}/${account}`, '?tab=security'), 'profile');
      assert.equal(demoAccountTab(`${root}/${account}/profile`, '?tab=security'), 'profile');
      assert.equal(demoAccountTab(`${root}/${account}`, '?tab=history'), 'history');
      assert.equal(demoAccountTab(`${root}/${account}/unknown`), 'profile');
    }
  }
});