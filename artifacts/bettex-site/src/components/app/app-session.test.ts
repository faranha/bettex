import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
test('demo entry is explicit and separate from real account authorization', () => {
  const session = read('../../lib/app-session.ts');
  assert.match(session, /sessionStorage\.setItem\(KEY, 'true'\)/);
  assert.match(session, /sessionStorage\.removeItem\(KEY\)/);
  assert.doesNotMatch(session, /localStorage|restartDemoTabSession|password|csrf/);
  const gate = read('./AppSessionGate.tsx');
  assert.match(gate, /demoActive \|\| isSignedIn \|\| native\.data\?\.account/);
  assert.match(gate, /<Redirect to="\/sign-in"/);
});
test('logout terminates real sessions, locks wallets, clears caches, and returns to login', () => {
  const logout = read('./use-app-logout.ts');
  assert.match(logout, /if \(native\.account\) await signOutTestAccount\(native\)/);
  assert.match(logout, /if \(isSignedIn\) await clerk\.signOut\(\)/);
  assert.match(logout, /bettex-wallet-lock/);
  assert.ok(logout.indexOf('endAppSession();') > logout.indexOf('await clerk.signOut()'));
  assert.match(logout, /client\.clear\(\)/);
  assert.match(logout, /navigate\('\/sign-in', \{ replace: true \}\)/);
});
test('ALFA entry exposes only the demo, without credential or signup forms', () => {
  const auth = read('../../pages/auth.tsx');
  assert.match(auth, /startAppSession\(\)/);
  assert.match(auth, /navigate\('\/app'/);
  assert.doesNotMatch(auth, /<SignIn |<SignUp |NativeSignIn|NativeSignUp|<input|<form|signInTestAccount|<AccountPanel/);
});
test('app entrance shares the app footer and presents a sports-oriented demo without a fictional-person explanation', () => {
  const app = read('../../App.tsx');
  const auth = read('../../pages/auth.tsx');
  assert.match(app, /function SignInEntry\(\)[\s\S]*?<SignInPage \/><SiteFooter compact \/>/);
  assert.match(app, /function SignUpEntry\(\)[\s\S]*?<SignUpPage \/><SiteFooter compact \/>/);
  assert.match(app, /path="\/sign-in\/\*\?" component=\{SignInEntry\}/);
  assert.match(app, /path="\/sign-up\/\*\?" component=\{SignUpEntry\}/);
  assert.match(auth, /Pare de apostar e comece a investir agora com a Bettex/);
  assert.match(auth, /auth-sportsbook-fullbleed\.jpg/);
  assert.match(auth, /Demonstração com dados simulados/);
  assert.doesNotMatch(auth, /Meet the BETTEX app through Alex|pessoa fictícia|hero-person-phone/);
  assert.match(auth, /hero-person-centered\.webp/);
});
test('shared agent showcase prioritizes Sports value betting as next without enabling it', () => {
  const showcase = read('../demo/AgentShowcase.tsx');
  assert.ok(showcase.indexOf('data-testid="card-agent-sports"') < showcase.indexOf('data-testid="card-agent-crypto"'));
  assert.match(showcase, /card-agent-sports" aria-disabled="true" data-next="true" className="agx-hero"/);
  assert.match(showcase, /Coming next: Sports Value Betting/);
  assert.match(showcase, /Not live yet/);
  assert.match(showcase, /Not active in this demo yet/);
  assert.match(showcase, /card-agent-crypto" className="agx-crypto"/);
  assert.match(showcase, /Enter the crypto AI Center demo/);
  assert.doesNotMatch(showcase, /Four agents\. Crypto is already active|54%|FAIR 1\.85/);
});
