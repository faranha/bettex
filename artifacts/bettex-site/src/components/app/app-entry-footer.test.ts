import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('demo entrance and sign-in reuse the shared footer without duplicating the active app footer', () => {
  const app = readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
  const gate = readFileSync(new URL('./AppSessionGate.tsx', import.meta.url), 'utf8');
  assert.match(app, /<AppSessionGate entry=\{<SignInEntry \/>\}>/);
  const entry = app.match(/function SignInEntry\(\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
  assert.match(entry, /<SignInPage \/><SiteFooter \/>/);
  assert.equal((entry.match(/<SiteFooter \/>/g) ?? []).length, 1);
  assert.match(gate, /demoActive \? children : \(entry \?\? <SignInPage \/>\)/);
  assert.match(app, /<AppHeader \/><InterfaceDemoPage \/><SiteFooter \/>/);
});
