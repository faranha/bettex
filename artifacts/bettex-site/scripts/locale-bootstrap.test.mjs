import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(bootstrap);
assert.ok(html.indexOf('<script>') < html.indexOf('<body>'));

function visit(path = '/', preferred = null, { base = '/', blocked = false, failNavigation = false, host = 'bettex.ai' } = {}) {
  const url = new URL(path, `https://${host}`);
  const document = { documentElement: { lang: 'pt-BR', style: { display: '' } } };
  const redirects = [];
  const paints = [];
  runInNewContext(bootstrap.replaceAll('%BASE_URL%', base), {
    document,
    window: {
      location: {
        hostname: url.hostname, pathname: url.pathname, search: url.search, hash: url.hash,
        replace(destination) {
          paints.push(document.documentElement.style.display);
          if (failNavigation) throw new Error('Navigation blocked');
          redirects.push(destination);
        },
      },
    },
    localStorage: {
      getItem(key) {
        assert.equal(key, 'bettex.locale');
        if (blocked) throw new Error('Storage blocked');
        return preferred;
      },
    },
  });
  return { document, redirects, paints };
}

test('new visitors, Portuguese preferences and unavailable storage stay in Portuguese', () => {
  for (const preferred of [null, 'pt', 'invalid']) {
    const result = visit('/', preferred);
    assert.deepEqual(result.redirects, []);
    assert.equal(result.document.documentElement.lang, 'pt-BR');
    assert.equal(result.document.documentElement.style.display, '');
  }
  assert.deepEqual(visit('/', 'en', { blocked: true }).redirects, []);
});

test('saved English and Spanish are applied before visible content, preserving query and anchor', () => {
  for (const preferred of ['en', 'es']) {
    const result = visit('/?ref=community#roadmap', preferred);
    assert.deepEqual(result.redirects, [`/${preferred}/?ref=community#roadmap`]);
    assert.deepEqual(result.paints, ['none']);
  }
});

test('explicit language URLs override saved preferences without hiding content', () => {
  for (const language of ['en', 'es']) {
    const result = visit(`/${language}/pitch`, language === 'en' ? 'es' : 'en');
    assert.deepEqual(result.redirects, []);
    assert.equal(result.document.documentElement.lang, language);
    assert.equal(result.document.documentElement.style.display, '');
  }
});

test('localized document names, physical HTML and app aliases preserve destinations', () => {
  assert.deepEqual(visit('/documentacao.html?source=pitch#token', 'en').redirects, ['/en/documentation?source=pitch#token']);
  assert.deepEqual(visit('/documentacao/', 'es').redirects, ['/es/documentacion']);
  assert.deepEqual(visit('/demo?tab=wallet', 'en').redirects, ['/en/app?tab=wallet']);
  assert.deepEqual(visit('/app/wallet#history', 'es').redirects, ['/es/app/wallet#history']);
  assert.deepEqual(visit('/index.html', 'en').redirects, ['/en/']);
});

test('artifact prefixes are retained and non-page routes are not redirected', () => {
  assert.deepEqual(visit('/site/pitch?x=1#problem', 'en', { base: '/site/' }).redirects, ['/site/en/pitch?x=1#problem']);
  assert.deepEqual(visit('/outside', 'en', { base: '/site/' }).redirects, []);
  assert.deepEqual(visit('/downloads/bettex-entidade-unica.pdf', 'en').redirects, []);
  assert.deepEqual(visit('/not-a-page', 'en').redirects, []);
});

test('official-domain redirect takes precedence over language preferences', () => {
  const result = visit('/pitch?x=1#token', 'en', { host: 'bettex.replit.app' });
  assert.deepEqual(result.redirects, ['https://bettex.ai/pitch?x=1#token']);
  assert.deepEqual(result.paints, ['none']);
});

test('a failed language navigation does not leave the page hidden', () => {
  const result = visit('/', 'en', { failNavigation: true });
  assert.deepEqual(result.redirects, []);
  assert.equal(result.document.documentElement.style.display, '');
});
