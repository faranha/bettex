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

test('wallets and history are primary areas; personal Profile is accessed only through the top menu', () => {
  assert.match(r('./MobileAreaNav.tsx'), /APP_AREAS: DemoView\[\] = \['home', 'wallet', 'central', 'treasury'\]/);
  const page = r('../../pages/demo.tsx');
  assert.match(page, /tab === 'home' && <WalletsDashboard/);
  assert.match(page, /tab === 'wallet' && <AccountHistoryPage/);
  assert.doesNotMatch(page, /PersonalOverview|CycleLive|TradingOverview|<AgentOperationsDashboard/);
  const menu = r('../app/AppProfileLink.tsx');
  assert.doesNotMatch(menu, /tab: 'wallets'|tab: 'history'/);
  assert.match(menu, /tab: 'profile'/);
  assert.match(menu, /logout/);
});

test('account history keeps statements but does not repeat balances or wallet cards', () => {
  const history = r('./WalletPage.tsx');
  assert.doesNotMatch(history, /WalletAction|TokenIcon|DemoWalletsCard|NativeWalletsCard|tk-card/);
  assert.match(history, /<PreviousCycle d=\{d\}/);
  assert.match(history, /<WalletStatement key=\{d\.profile\.accountId\} d=\{d\}/);
  assert.match(history, /<HistoryPanel/);
  assert.match(r('./WalletsDashboard.tsx'), /<ProtectedDemoWallets/);
});

test('Profile has only identity data; native finance uses controlled sections on the new destinations', () => {
  const demo = r('./DemoAccountPanel.tsx');
  assert.doesNotMatch(demo, /role="tablist"|ProtectedDemoWallets|WalletPage|StakingCorridor|WalletAction|<Money/);
  assert.match(demo, /ProfileIdentitySummary/);
  const account = r('../account/AccountSheet.tsx');
  assert.doesNotMatch(account, /WalletPage|ProtectedDemoWallets|StakingCorridor/);
  assert.match(account, /section="profile"/);
  const native = r('../account/account-ui/AccountPanel.tsx');
  assert.doesNotMatch(native, /\['operations',|\['security',|tab === 'operations'|tab === 'security'/);
  assert.match(native, /tab === 'wallets'.*<NativeJourney snap=\{snap\}/);
  assert.match(native, /tab=\{section \?\? tab\} showNavigation=\{!section\}/);
  assert.match(r('./WalletsDashboard.tsx'), /section="wallets"/);
  assert.match(r('./WalletsDashboard.tsx'), /section="history"/);
});
