import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file: string) => readFileSync(new URL(file, import.meta.url), 'utf8');

test('public ALFA and feature links share the localized app entry', () => {
  const link = read('../DemoAppLink.tsx');
  assert.match(link, /useLocale\(\)/);
  assert.match(link, /import\.meta\.env\.BASE_URL/);
  assert.match(link, /localizedUrl\(appPath, locale\)/);
  assert.match(link, /t\('Abrir o demo'\)/);
  assert.doesNotMatch(link, /target="_blank"|localhost|replit\.dev/);
  const roadmap = read('../RoadmapSection.tsx');
  assert.doesNotMatch(roadmap, /Em breve, features|features--soon/);
  assert.match(roadmap, /index === 0 \|\| index === 2/);
  assert.match(roadmap, /<DemoAppLink className="roadmap__features/);
  assert.match(roadmap, /date: 'Janeiro de 2027'/);
  const app = read('../../App.tsx');
  assert.match(app, /<DemoAppLink[^>]*data-testid="brand-alpha-badge"/);
  assert.match(read('../../pages/pitch.tsx'), /<DemoAppLink data-testid="pitch-open-alpha-demo"/);
  assert.doesNotMatch(read('./PublicDemoPage.tsx'), /Coming soon|Próximamente|is on its way/);
  assert.match(read('../live-markets/LiveMarketsSection.tsx'), /<DemoAppLink/);
});
