import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const files = [
  'src/pages/pitch.tsx',
  'src/components/pitch/AudienceSection.tsx',
];
const backgrounds = files.flatMap(file => {
  const source = readFileSync(new URL(file, root), 'utf8');
  return [...source.matchAll(/<(?:Sec\b[^>]*\bhero|ChapterHero\b[^>]*\bsrc)="([^"]+)"/g)]
    .map(match => ({ file, image: match[1] }));
});
assert.equal(backgrounds.length, 5, 'Audit every chapter hero rendered by the simplified Pitch');
const seen = new Map();
for (const { file, image } of backgrounds) {
  assert.ok(existsSync(new URL(`public/${image}`, root)), `Missing background: ${image}`);
  assert.ok(!seen.has(image), `Repeated hero background: ${image} (${seen.get(image)} and ${file})`);
  seen.set(image, file);
}
console.log('Pitch: all five rendered chapter heroes use distinct, existing backgrounds.');
