import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { panelScrollOffset, visiblePanelSection } from './panel-navigation.ts';

test('section offset includes both measured header and submenu with breathing room', () => {
  assert.equal(panelScrollOffset(104, 56), 172);
  assert.equal(panelScrollOffset(126, 58), 196);
});
test('scroll tracking follows wallets, graph and nested participation without relying on hash', () => {
  const positions = (wallets: number, central: number, participation: number) =>
    [{ id: 'wallets' as const, top: wallets }, { id: 'central' as const, top: central }, { id: 'participation' as const, top: participation }];
  assert.equal(visiblePanelSection(positions(200, 800, 1600), 172), 'wallets');
  assert.equal(visiblePanelSection(positions(-600, 170, 900), 172), 'central');
  assert.equal(visiblePanelSection(positions(-1400, -600, 170), 172), 'participation');
  assert.equal(visiblePanelSection(positions(-2200, -1400, -500), 172), 'participation');
});
test('sticky submenu is below the header, above normal content and horizontally scrollable', () => {
  const css = readFileSync(new URL('../demo/demo.css', import.meta.url), 'utf8');
  assert.match(css, /\.panel-submenu\{[^}]*position:sticky;top:var\(--site-header-h,56px\);z-index:30/);
  assert.match(css, /\.panel-submenu\{[^}]*overflow-x:auto/);
  const page = readFileSync(new URL('./InterfaceDemoPage.tsx', import.meta.url), 'utf8');
  assert.match(page, /scrollMarginTop: 'calc\(var\(--site-header-h, 56px\) \+ var\(--panel-submenu-h, 56px\) \+ 12px\)'/);
  assert.match(page, /root\.style\.removeProperty\('--panel-submenu-h'\)/);
  assert.match(page, /event\.preventDefault\(\)/);
  assert.match(page, /last\.current = target;\s*setActive\(i\.id\);\s*scrollToBlock\(i\.id\)/);
  assert.match(page, /behavior: 'instant'/);
  assert.doesNotMatch(page, /el\.scrollIntoView/);
});

test('Treasury becomes the active panel section once its heading reaches the submenu', () => {
  assert.equal(visiblePanelSection([
    { id: 'wallets', top: -3400 }, { id: 'central', top: -2400 },
    { id: 'participation', top: -1400 }, { id: 'treasury', top: 172 },
  ], 172), 'treasury');
});
