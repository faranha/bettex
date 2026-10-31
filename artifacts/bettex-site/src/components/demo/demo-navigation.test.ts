import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoView, demoPath, demoLabel, demoPageTitle, demoAccountTab, demoRedirect, demoHref, isRemovedSimulationPath } from './demo-navigation.ts';

test('reloadable addresses preserve identity and redirect integrated areas into Dashboard', () => {
  for (const language of ['pt', 'en', 'es'] as const) {
    for (const view of ['home', 'wallet', 'central', 'treasury', 'account'] as const) {
      const path = demoPath(view, language);
      assert.equal(demoView(path), view);
      assert.equal(demoView(path + '/'), view);
      assert.equal(demoView(path.replace('/app', '/demo')), view);
      assert.equal(demoRedirect(path, language, '?wallet=earnings'), view === 'central' ? `/app?wallet=earnings#${view}` : null);
    }
  }
  for (const language of ['pt', 'en', 'es'] as const) {
    const homeLabel = { pt: 'Painel', en: 'Dashboard', es: 'Panel' }[language];
    assert.equal(demoLabel('home', language), homeLabel);
    assert.equal(demoPageTitle('home', language), `${homeLabel} | BETTEX`);
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
test('AI Center links target the home anchor with query before hash', () => {
  assert.equal(demoHref('central', 'en', '?node=btc'), '/app?node=btc#central');
  assert.equal(demoHref('central', 'pt'), '/app#central');
  assert.equal(demoRedirect('/demo/central', 'es', '?node=eth&section=records', '#x'), '/app?node=eth&section=records#central');
  assert.equal(demoRedirect('/app', 'pt', '?section=participation'), null);
});

test('Treasury has its own page; old embedded bookmarks preserve filters in all languages', () => {
  for (const language of ['pt', 'en', 'es'] as const) {
    const treasury = demoPath('treasury', language);
    assert.equal(demoHref('treasury', language, '?node=btc'), `${treasury}?node=btc`);
    assert.equal(demoRedirect(treasury, language, '?section=assets&node=btc'), null);
    assert.equal(demoRedirect('/app', language, '?node=btc&treasurySection=assets', '#treasury'), `${treasury}?node=btc&section=assets`);
    assert.equal(demoRedirect('/app', language, '', '#treasury'), treasury);
    assert.equal(demoRedirect('/app', language, '?section=treasury'), treasury);
    assert.equal(demoRedirect(treasury, language, '?treasurySection=round'), `${treasury}?section=round`);
    assert.equal(demoRedirect('/app/treasury', language, '?section=assets'), language === 'en' ? null : `${treasury}?section=assets`);
  }
});
