import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoView, demoPath, demoLabel, demoPageTitle, demoAccountTab, demoRedirect, isRemovedSimulationPath } from './demo-navigation.ts';

test('wallets dashboard, history, AI Center, Treasury and personal Profile have independent reloadable routes', () => {
  for (const language of ['pt', 'en', 'es'] as const) {
    for (const view of ['home', 'wallet', 'central', 'treasury', 'account'] as const) {
      const path = demoPath(view, language);
      assert.equal(demoView(path), view);
      assert.equal(demoView(path + '/'), view);
      assert.equal(demoView(path.replace('/app', '/demo')), view);
      assert.equal(demoRedirect(path, language, '?wallet=earnings'), null);
    }
  }
  for (const language of ['pt', 'en', 'es'] as const) {
    assert.equal(demoLabel('home', language), 'Dashboard');
    assert.equal(demoPageTitle('home', language), 'Dashboard | BETTEX');
  }
  assert.equal(demoPageTitle('wallet', 'en'), 'History | BETTEX');
  assert.equal(demoPageTitle('wallet', 'es'), 'Historial | BETTEX');
  assert.equal(demoPageTitle('account', 'pt'), 'Perfil | BETTEX');
  assert.equal(demoView('/app/unknown'), undefined);
});
test('old profile finance paths and query tabs migrate without losing filters or anchors', () => {
  for (const language of ['pt', 'en', 'es'] as const) {
    for (const root of ['/app/minha-conta', '/app/account', '/app/mi-cuenta', '/demo/account']) {
      assert.equal(demoRedirect(`${root}/wallets`, language), '/app');
      assert.equal(demoRedirect(root, language, '?tab=operations'), '/app');
      assert.equal(demoRedirect(`${root}/history`, language, '?wallet=earnings', '#wallet-statement'),
        `${demoPath('wallet', language)}?wallet=earnings#wallet-statement`);
      assert.equal(demoRedirect(root, language, '?tab=history&wallet=USDC'),
        `${demoPath('wallet', language)}?wallet=USDC`);
      assert.equal(demoRedirect(`${root}/profile`, language), demoPath('account', language));
      assert.equal(demoRedirect(`${root}/security/password`, language), demoPath('account', language));
      assert.equal(demoRedirect(`${root}/policies`, language), `${demoPath('treasury', language)}?tab=policies`);
    }
    for (const legacy of ['/app/saldo', '/app/balance']) {
      assert.equal(demoRedirect(legacy, language, '?wallet=BETTEX'), `${demoPath('wallet', language)}?wallet=BETTEX`);
    }
    assert.equal(demoRedirect('/app/wallets', language), '/app');
    assert.equal(demoRedirect('/app/account', language, '?provider=clerk-signin'), null);
  }
});
test('history links follow a changed language without redirect loops or dropped wallet filters', () => {
  assert.equal(demoRedirect('/app/historico', 'en', '?wallet=USDC'), '/app/history?wallet=USDC');
  assert.equal(demoRedirect('/app/history', 'en', '?wallet=USDC'), null);
  assert.equal(demoRedirect('/app/history', 'es', '?wallet=USDC'), '/app/historial?wallet=USDC');
});
test('legacy account tabs are parsed for migration, not displayed as Profile sections', () => {
  assert.equal(demoAccountTab('/app/account', '?tab=history'), 'history');
  assert.equal(demoAccountTab('/app/account/operations'), 'wallets');
  assert.equal(demoAccountTab('/app/account/security'), 'profile');
  assert.equal(demoAccountTab('/app/account/unknown'), 'profile');
});
test('removed simulation bookmarks redirect to the new wallets dashboard without adding an area', () => {
  for (const root of ['/app', '/demo', '/en/app', '/es/demo']) {
    for (const slug of ['simulacao', 'simulation', 'simulacion']) {
      const path = `${root}/${slug}`;
      assert.equal(isRemovedSimulationPath(path), true);
      assert.equal(isRemovedSimulationPath(`${path}/unrelated`), false);
      assert.equal(demoRedirect(path, 'pt'), '/app');
    }
  }
});
