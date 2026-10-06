import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const r = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');
test('app pages use the shared mobile area nav and keep desktop nav hidden on mobile', () => {
  assert.match(r('./MobileAreaNav.tsx'), /sm:hidden/);
  assert.match(r('../../pages/demo.tsx'), /<MobileAreaNav/);
  assert.match(r('../alpha-trading/AlphaTradingPanel.tsx'), /<MobileAreaNav current="central"/);
  assert.doesNotMatch(r('../alpha-trading/AlphaTradingPanel.tsx'), /<nav[^>]*className="flex flex-wrap/);
});
