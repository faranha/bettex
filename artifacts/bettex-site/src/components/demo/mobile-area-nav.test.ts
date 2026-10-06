import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const r = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');
test('app pages use the shared mobile area nav and keep desktop nav hidden on mobile', () => {
  assert.match(r('./MobileAreaNav.tsx'), /sm:hidden/);
  const header = r('../app/AppHeader.tsx');
  assert.match(header, /<MobileAreaNav current=\{view\}/);
  assert.match(header, /className="[^"]*sm:hidden"><MobileAreaNav/);
  assert.match(header, /className="hidden[^"]*sm:block"/);
  assert.match(r('../../App.tsx'), /data-testid="app-shell"><AppHeader \/><DemoPage \/>/);
  assert.doesNotMatch(r('../../pages/demo.tsx'), /<MobileAreaNav/);
  assert.doesNotMatch(r('../alpha-trading/AlphaTradingPanel.tsx'), /<MobileAreaNav/);
  assert.doesNotMatch(r('../alpha-trading/AlphaTradingPanel.tsx'), /<nav[^>]*className="flex flex-wrap/);
});

test('balance and history belong to My account, with no independent desktop or mobile area', () => {
  assert.match(r('./MobileAreaNav.tsx'), /APP_AREAS: DemoView\[\] = \['home', 'central', 'treasury', 'account'\]/);
  assert.match(r('./DemoAccountPanel.tsx'), /tab === 'history'.*<WalletPage d=\{d\}/);
  assert.doesNotMatch(r('../../pages/demo.tsx'), /tab === 'wallet' && <WalletPage/);
  assert.match(r('../../pages/demo.tsx'), /tab === 'wallet'.*navigate.*replace: true/);
});

test('account history keeps statements but does not repeat balances or wallet cards', () => {
  const history = r('./WalletPage.tsx');
  assert.doesNotMatch(history, /WalletAction|TokenIcon|DemoWalletsCard|NativeWalletsCard|tk-card/);
  assert.match(history, /<PreviousCycle d=\{d\}/);
  assert.match(history, /<WalletStatement key=\{d\.profile\.accountId\} d=\{d\}/);
  assert.match(history, /<HistoryPanel/);
  assert.match(r('./DemoAccountPanel.tsx'), /tab === 'wallets'.*<ProtectedDemoWallets/);
});

test('ALFA account tabs do not duplicate wallet actions or offer the demo security area', () => {
  const demo = r('./DemoAccountPanel.tsx');
  assert.match(demo, /const tabs: Tab\[\] = \['profile', 'wallets', 'history'\]/);
  assert.doesNotMatch(demo, /demo-tab-operations|demo-tab-security|exportJson|WalletAction|<Money/);
  const native = r('../account/account-ui/AccountPanel.tsx');
  assert.doesNotMatch(native, /\['operations',|\['security',|tab === 'operations'|tab === 'security'/);
  assert.match(native, /tab === 'wallets'.*<NativeJourney snap=\{snap\}/);
});
