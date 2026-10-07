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
test('ALFA entry exposes only the Alex demo, without credential or signup forms', () => {
  const auth = read('../../pages/auth.tsx');
  assert.match(auth, /startAppSession\(\)/);
  assert.match(auth, /navigate\('\/app'/);
  assert.doesNotMatch(auth, /<SignIn |<SignUp |NativeSignIn|NativeSignUp|<input|<form|signInTestAccount|<AccountPanel/);
});
