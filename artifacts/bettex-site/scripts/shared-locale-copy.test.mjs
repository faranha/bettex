import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = name => JSON.parse(readFileSync(new URL(`../src/lib/locales/${name}.json`, import.meta.url), 'utf8'));
const messages = { ...read('translations'), ...read('english-source-messages') };
const labels = [
  'Close', 'Loading', 'Previous', 'Next', 'Go to previous page', 'Go to next page',
  'Previous slide', 'Next slide', 'Toggle Sidebar', 'Displays the mobile sidebar.',
  'More pages', 'pagination',
];

test('shared controls have real Portuguese and Spanish translations, not copied English defaults', () => {
  for (const label of labels) {
    const copy = messages[label];
    assert.ok(copy, label);
    assert.equal(copy.en, label);
    for (const locale of ['pt', 'es']) {
      assert.ok(copy[locale]?.trim(), `${label}: missing ${locale}`);
      assert.notEqual(copy[locale], label, `${label}: untranslated ${locale}`);
    }
  }
});
