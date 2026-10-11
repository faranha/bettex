import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const dir = await mkdtemp(join(tmpdir(), 'pm-titles-'));
await build({ entryPoints: [new URL('../src/lib/polymarket-titles.ts', import.meta.url).pathname],
  outfile: join(dir, 'titles.mjs'), bundle: true, platform: 'node', format: 'esm' });
const { translateMarketTitle, localizeMarketTitles } = await import(pathToFileURL(join(dir, 'titles.mjs')));
test.after(() => rm(dir, { recursive: true, force: true }));

test('translate reach/dip/above/below/range, month and exact settlement deadline', () => {
  const cases = [
    ['Will Ethereum reach $2,700 in October?', 'O Ethereum atingirá $2,700 em outubro?', '¿Ethereum alcanzará $2,700 en octubre?'],
    ['Will Ethereum dip to $2,250 by December 31, 2026?', 'O Ethereum cairá para $2,250 até 31 de dezembro de 2026?', '¿Ethereum caerá a $2,250 hasta 31 de diciembre de 2026?'],
    ['Will the price of Solana be between $110 and $120 on October 13?', 'O preço de Solana estará entre $110 e $120 em 13 de outubro?', '¿El precio de Solana estará entre $110 y $120 en 13 de octubre?'],
    ['Will the price of Bitcoin be above $84,000 on October 12?', 'O preço de Bitcoin estará acima de $84,000 em 12 de outubro?', '¿El precio de Bitcoin estará por encima de $84,000 en 12 de octubre?'],
    ['Will the price of Bitcoin be below $84,000 on October 12?', 'O preço de Bitcoin estará abaixo de $84,000 em 12 de outubro?', '¿El precio de Bitcoin estará por debajo de $84,000 en 12 de octubre?'],
  ];
  for (const [source, pt, es] of cases) {
    assert.equal(translateMarketTitle(source, 'pt'), pt);
    assert.equal(translateMarketTitle(source, 'es'), es);
    assert.equal(translateMarketTitle(source, 'en'), source);
  }
});

test('new question formats use translation cache and never return raw English', async () => {
  const originalFetch = globalThis.fetch;
  const originalBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const originalKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL = 'https://translation.test/v1';
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY = 'unit-test-placeholder';
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ choices: [{ message: { content: JSON.stringify({ titles: ['O Bitcoin fechará acima de $90,000 neste domingo?'] }) } }] });
  };
  try {
    const question = 'Will Bitcoin close above $90,000 this Sunday?';
    assert.equal((await localizeMarketTitles([question], 'pt'))[0], 'O Bitcoin fechará acima de $90,000 neste domingo?');
    await localizeMarketTitles([question], 'pt');
    assert.equal(calls, 1);
    globalThis.fetch = async () => Response.json({ choices: [{ message: { content: JSON.stringify({ titles: ['O Bitcoin fechará acima de $95,000 nesta segunda-feira?'] }) } }] });
    await assert.rejects(localizeMarketTitles(['Will Bitcoin close above $90,000 this Monday?'], 'pt'), /translation_unavailable/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.AI_INTEGRATIONS_OPENAI_BASE_URL; else process.env.AI_INTEGRATIONS_OPENAI_BASE_URL = originalBase;
    if (originalKey === undefined) delete process.env.AI_INTEGRATIONS_OPENAI_API_KEY; else process.env.AI_INTEGRATIONS_OPENAI_API_KEY = originalKey;
  }
});
