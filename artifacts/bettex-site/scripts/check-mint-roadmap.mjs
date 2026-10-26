import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '..');
const server = await createServer({
  configFile: path.join(root, 'vite.config.ts'), mode: 'production',
  define: { 'import.meta.env.PROD': true, 'import.meta.env.DEV': false },
  server: { middlewareMode: true }, appType: 'custom',
});
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  const { roadmapStops } = await server.ssrLoadModule('/src/components/RoadmapSection.tsx');
  const mint = roadmapStops.find(stop => stop.title === 'Mint público');
  assert.equal(mint.date, 'Março de 2027');
  assert.equal(mint.dateTime, '2027-03', 'Month only: no exact mint day was set');
  const { PROJECT_RULES } = await server.ssrLoadModule('/src/components/interface-demo/demo-project-model.ts');
  assert.equal(PROJECT_RULES.mintForecast, '2027-03');
  assert.equal(PROJECT_RULES.launchForecast, '2027-06', 'ALFA moves by the same three months');
  assert.equal(PROJECT_RULES.vestingMonths, 24);
  for (const route of ['/', '/pitch', '/documentacao', '/en/', '/en/pitch', '/en/documentation', '/es/', '/es/pitch', '/es/documentacion']) {
    const main = render(route).match(/<main\b[\s\S]*?<\/main>/)?.[0];
    assert.ok(main, route);
    assert.doesNotMatch(main, /10 de dezembro de 2026|December 10, 2026|10 de diciembre de 2026|2026-12-10|10\/12\/2026|12\/10\/2026/, route);
    if (!/documenta/.test(route)) {
      assert.match(main, /(?:março de|March|marzo de) 2027/i, `${route}: mint`);
      assert.match(main, /(?:junho de|June|junio de) 2027/i, `${route}: ALFA and vesting`);
    }
    console.log(`${route}: rescheduled calendar verified; ${createHash('sha256').update(main).digest('hex')}`);
  }
} finally {
  await server.close();
}
