import test from 'node:test';
import assert from 'node:assert/strict';
import { isDemoSession } from './demo-session.ts';
import type { DemoProfile } from '@workspace/api-client-react';
import { readFileSync } from 'node:fs';

const profile: DemoProfile = { name: 'Demo', email: 'demo@example.com', accountId: 'test-browser', memberSince: '2026-10-06T00:00:00Z' };
test('app footer omits the homepage promotional section while keeping shared navigation', () => {
  const app = readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
  assert.match(app, /<AppHeader \/><DemoPage \/><SiteFooter compact \/>/);
  assert.match(app, /\{!compact && <div className="site-footer__cta/);
  assert.match(app, /function Home\(\)[\s\S]*?return <SitePage>/);
  assert.match(app, /footer-community\.webp/);
  assert.match(app, /data-testid="link-community-footer-nav"/);
});
test('demo reset lives inside the blue environment banner, not a separate strip', () => {
  const page = readFileSync(new URL('../../pages/demo.tsx', import.meta.url), 'utf8');
  const banner = readFileSync(new URL('./DemoEnvironmentBanner.tsx', import.meta.url), 'utf8');
  const controls = readFileSync(new URL('./DemoTabControls.tsx', import.meta.url), 'utf8');
  assert.match(page, /DemoEnvironmentBanner actions=\{<DemoTabControls \/>\}/);
  assert.doesNotMatch(page, /<><DemoTabControls \/><DevelopmentDemoPage \/><\/>/);
   assert.match(banner, /max-w-5xl items-center gap-2 whitespace-nowrap/);
   assert.doesNotMatch(banner, /overflow-x-auto|w-max|min-w-full/);
   assert.doesNotMatch(banner, /flex-wrap|grid-cols/);
   assert.match(controls, /flex items-center gap-2 whitespace-nowrap/);
   assert.doesNotMatch(controls, /flex-col/);
  assert.doesNotMatch(controls, /bg-\[#FBF8F0\]/);
  assert.match(controls, /window\.confirm/);
});
test('player data precede agent trading, not a generic crypto price viewer', () => {
  const source = readFileSync(new URL('../../pages/demo.tsx', import.meta.url), 'utf8');
  const home = source.slice(source.indexOf("{tab === 'home'"), source.indexOf("{tab === 'central'"));
  const personal = home.indexOf('<PersonalOverview ');
  const nextCycle = home.indexOf('<CycleLive ');
  const staking = home.indexOf('<StakingCorridor ');
  const trading = home.indexOf('<TradingOverview ');
  const agents = home.indexOf('<AgentOperationsDashboard ');
  assert.ok(personal >= 0 && trading > personal && agents > trading);
  assert.ok(nextCycle > personal && nextCycle < staking && staking < trading);
  assert.match(home, /PersonalOverview d=\{d\} onWallet=\{open\}/);
  assert.doesNotMatch(home, /PersonalRecentActivity/);
  assert.doesNotMatch(home, /LiveMarketsSection/);
  assert.match(home, /My participation and next cycle/);
});
test('profile access lives in the options bar, with history inside wallets and no dashboard greeting block', () => {
  const source = readFileSync(new URL('./PersonalOverview.tsx', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../../pages/demo.tsx', import.meta.url), 'utf8');
  const home = page.slice(page.indexOf("{tab === 'home'"), page.indexOf("{tab === 'central'"));
   const profileLink = readFileSync(new URL('../app/AppProfileLink.tsx', import.meta.url), 'utf8');
   const header = readFileSync(new URL('../app/AppHeader.tsx', import.meta.url), 'utf8');
   const mobile = readFileSync(new URL('./MobileAreaNav.tsx', import.meta.url), 'utf8');
   assert.match(header, /<AppProfileLink \/>/);
   assert.doesNotMatch(mobile, /<AppProfileLink \/>/);
   assert.ok(header.indexOf('<AppProfileLink />') < header.indexOf('<LanguageSelector '));
   assert.ok(header.indexOf('<AppProfileLink />') < header.indexOf('data-testid="app-nav-desktop"'));
   assert.match(profileLink, /DropdownMenuTrigger/);
   assert.match(profileLink, /aria-label=.*Open my account menu/);
   assert.match(profileLink, /account-menu-logout/);
   assert.match(profileLink, /'profile'.*UserRound/);
   assert.match(profileLink, /'wallets'.*Wallet/);
   assert.match(profileLink, /'history'.*History/);
   assert.match(profileLink, /profile\.nickname\?\.trim\(\) \|\| data\?\.profile\.name/);
   assert.doesNotMatch(home, /text-greeting-name|link-account-full|ProfileAvatar|greet/);
  assert.doesNotMatch(home, /d\.profile\.email|d\.profile\.accountId/);
  assert.doesNotMatch(source, /My account overview|UserRound|<Link /);
  assert.match(source, /headerActions=\{historyButton\}/);
  assert.match(source, /data-testid="button-account-history" aria-expanded=\{showHistory\} aria-controls="overview-history"/);
  assert.match(source, /setShowHistory\(v => !v\)/);
  assert.match(source, /hidden=\{!showHistory\}/);
  assert.match(source, /showHistory && \(historyAccount \? <HistoryPanel mode=\{demo \? 'demo' : 'native'\}/);
  assert.doesNotMatch(source, /Member since|Account ID|PersonalRecentActivity|See full balance and history/);
});
test('dashboard positions and orders use stored agent records, not fabricated user positions', () => {
  const source = readFileSync(new URL('../alpha-trading/TradingOverview.tsx', import.meta.url), 'utf8');
  assert.match(source, /view: 'positions'/);
  assert.match(source, /view: 'orders'/);
  assert.match(source, /useGetAlphaTrading/);
  assert.match(source, /PositionCard/);
  assert.match(source, /OrderCard/);
  assert.match(source, /No open positions recorded/);
  assert.match(source, /No orders recorded/);
  assert.match(source, /agents’ portfolio/);
  assert.doesNotMatch(source, /Math\.random|useGetLiveMarkets/);
});
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
  assert.match(wallet, /!isDemoSession\(d.profile\) && \(d.profile.provider === 'native' \? <NativeParticipationCard/);
  assert.doesNotMatch(wallet, /<TestPeriodNotice/);
  assert.match(account, /isDemoSession\(d.profile\) && !explicitProvider/);
  assert.match(account, /<AccountPanel/);
  for (const file of ['DemoAccountPanel.tsx', 'DemoWalletsCard.tsx']) {
    const source = readFileSync(new URL(file, root), 'utf8');
    assert.doesNotMatch(source, /SignInButton|signInTestAccount|createTestAccount|privateWalletAction|useGetNativeTestJourney/);
  }
});
