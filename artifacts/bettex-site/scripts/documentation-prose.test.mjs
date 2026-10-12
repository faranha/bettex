import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { formatDocumentationProse, preserveDocumentationSpacing } from '../src/lib/documentation-prose.ts';

test('localized documentation fragments preserve author-supplied inline spaces in every language', () => {
  for (const translated of ['é uma L2.', 'is an L2.', 'es una L2.']) {
    assert.equal(preserveDocumentationSpacing(' é uma rede.', translated), ' ' + translated);
    assert.equal(preserveDocumentationSpacing(' é uma rede. ', translated), ' ' + translated + ' ');
    assert.equal(preserveDocumentationSpacing('é uma rede.', translated), translated);
  }
  assert.equal(preserveDocumentationSpacing(' ', ''), ' ');
  assert.equal(preserveDocumentationSpacing(': executa.', ': executes.'), ': executes.');
  assert.equal(preserveDocumentationSpacing('. O acesso confirma.', 'Access confirms.'), '. Access confirms.');
  assert.equal(preserveDocumentationSpacing(': executa.', 'Executes.'), ': Executes.');
  assert.equal(preserveDocumentationSpacing('. O acesso confirma.', '. Access confirms.'), '. Access confirms.');
  assert.equal(preserveDocumentationSpacing(', texto.', '. Text.'), '. Text.');
  assert.equal(preserveDocumentationSpacing(' para facilitar a leitura.', '. Withdrawals remain in USDC.'), '. Withdrawals remain in USDC.');
  assert.equal(preserveDocumentationSpacing('Uma frase antes do link. ', 'Frase resumida.'), 'Frase resumida. ');
});

test('documentation rules use real lists while retaining paragraphs, emphasis and anchors', () => {
  const first = createElement('p', { id: 'rule-original' },
    createElement('strong', null, 'Rodadas independentes.'));
  const second = createElement('p', null,
    'Consultar ', createElement('a', { href: '#original-destination' }, 'as regras'), '.');
  const props = { className: 'whitepaper__prose', children: [first, second] };
  const formatted = formatDocumentationProse(props, 'div');
  assert.ok(Array.isArray(formatted.children), 'preserve the JSX static-children array contract');
  assert.equal(formatted.children[0].type, 'ul');
  assert.equal(formatted.children[0].key, 'whitepaper__rules', 'synthetic array children need stable keys');
  assert.equal(formatted.children[0].props.children.length, 2);
  assert.equal(formatted.children[0].props.children[0].props.children, first);
  assert.equal(formatted.children[0].props.children[1].props.children, second);
  const html = renderToStaticMarkup(createElement('div', formatted));
  assert.match(html, /<ul class="whitepaper__rules"><li><p id="rule-original"><strong>/);
  assert.match(html, /<a href="#original-destination">as regras<\/a>/);
});

test('introductory paragraphs, cards and existing mixed content are not turned into lists', () => {
  const paragraph = createElement('p', null, 'Explicação introdutória.');
  for (const props of [
    { className: 'whitepaper__prose', children: paragraph },
    { className: 'whitepaper__lead', children: [paragraph, paragraph] },
    { className: 'homepage-copy', children: [paragraph, paragraph] },
    { className: 'whitepaper__prose', children: [paragraph, createElement('ul', null)] },
  ]) assert.equal(formatDocumentationProse(props, 'div'), props);
  const props = { className: 'whitepaper__prose', children: [paragraph, paragraph] };
  assert.equal(formatDocumentationProse(props, 'section'), props);
});

test('empty conditional children are ignored and formatting is idempotent', () => {
  const paragraph = createElement('p', null, 'Regra.');
  const once = formatDocumentationProse({
    className: 'whitepaper__prose', children: [null, paragraph, ' ', false, paragraph],
  }, 'div');
  assert.equal(once.children[0].props.children.length, 2);
  assert.equal(formatDocumentationProse(once, 'div'), once);
});
