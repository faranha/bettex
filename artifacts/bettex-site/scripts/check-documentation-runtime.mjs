// ResponsiveContainer renders no ticks in SSR. Exercise its locale callbacks
// explicitly so prerender success cannot hide browser-only formatter failures.
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const server = await createServer({
  configFile: path.join(root, 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
});
try {
  const { setLocale, t } = await server.ssrLoadModule('/src/lib/i18n.ts');
  const { componentProps, localizeProps } = await server.ssrLoadModule('/src/lib/localized/jsx-runtime.ts');
  const { chartTooltipTrigger } = await server.ssrLoadModule('/src/lib/chart-input.ts');
  assert.equal(chartTooltipTrigger('touch', 'hover'), 'click');
  assert.equal(chartTooltipTrigger('pen', 'hover'), 'click');
  assert.equal(chartTooltipTrigger('mouse', 'click'), 'hover');
  assert.equal(chartTooltipTrigger('', 'click'), 'click');
  for (const locale of ['pt', 'en', 'es']) {
    setLocale(locale);
    const props = componentProps(null, {
      tickFormatter: value => `${value / 1_000_000} mi`,
      labelFormatter: value => `Mês ${value}`,
      formatter: (value, name) => [`${value} BETTEX`, name],
    });
    assert.equal(props.tickFormatter(30_000_000), locale === 'pt' ? '30 mi' : '30 M');
    assert.equal(props.labelFormatter(12), { pt: 'Mês 12', en: 'Month 12', es: 'Mes 12' }[locale]);
    const name = t('Venda pública · 65%');
    assert.deepEqual(props.formatter(650_000_000, name), ['650000000 BETTEX', name]);
    const renderedTitle = { 'data-i18n': 'translated', children: '01 Project vision.' };
    assert.equal(localizeProps(renderedTitle, 'span'), renderedTitle);
  }
  console.log('Documentation runtime: PT/EN/ES chart ticks, tooltip labels and already-localized DOM titles verified.');
} finally {
  await server.close();
}