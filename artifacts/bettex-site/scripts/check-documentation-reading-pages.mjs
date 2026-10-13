import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { transformWithEsbuild } from 'vite';

// A bounded DOM fixture tests pagination without cloning the live React tree.
class Text {
  nodeType = 3;
  constructor(text) { this.textContent = text; }
}
class Element {
  nodeType = 1;
  childNodes = [];
  attributes = new Map();
  dataset = {};
  constructor(tag, id = '') { this.tagName = tag.toUpperCase(); this.id = id; }
  append(...children) { children.forEach(child => { child.parentElement = this; this.childNodes.push(child); }); return this; }
  get textContent() { return this.childNodes.map(child => child.textContent).join(''); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  contains(node) { return this === node || this.childNodes.some(child => child instanceof Element && child.contains(node) || child === node); }
  querySelectorAll(selector) { return nodes(this).slice(1).filter(node => node instanceof Element && selector.split(',').some(part => this.match(node, part.trim()))); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  match(node, selector) {
    if (selector === '[role="note"]') return node.attributes.get('role') === 'note';
    if (selector === '[data-testid^="documentation-future-market-"]') return node.attributes.get('data-testid')?.startsWith('documentation-future-market-');
    if (selector.startsWith('[')) return node.attributes.has(selector.slice(1, -1));
    return node.tagName === selector.toUpperCase();
  }
  matches(selector) { return this.match(this, selector); }
  closest(selector) { for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node; return null; }
  compareDocumentPosition(other) { return nodes(root).indexOf(other) > nodes(root).indexOf(this) ? 4 : 2; }
}
const nodes = element => [element, ...(element.childNodes ?? []).flatMap(nodes)];
const el = (tag, id, text) => new Element(tag, id).append(...(text ? [new Text(text)] : []));
const root = el('section', 'content');
const intro = el('p', 'intro', 'Introduction');
const first = el('h3', 'first', 'Section 2.1');
const child = el('h4', 'child', 'Section 2.1.1');
const second = el('h3', 'second', 'Section 2.2');
const diagram = el('svg', 'diagram').append(el('text', '', 'Graphic labels'));
const caption = el('h3', 'caption', 'Section 2.3');
const figure = el('figure', 'figure').append(diagram, el('figcaption', '').append(caption, el('p', '', 'Figure explanation')));
const summary = el('summary', '', 'Reference 2.4');
summary.setAttribute('data-outline-number', '2.4');
const inner = el('h4', 'inner', 'Reference 2.4.1');
const reference = el('details', 'reference').append(summary, el('div', '').append(inner, el('p', '', 'Technical conditions')));
const notice = el('aside', '', 'Unavailable in demo and ALFA');
notice.setAttribute('role', 'note');
const future = el('div', '').append(notice);
future.setAttribute('data-testid', 'documentation-future-market-sports');
root.append(intro, future, el('div', '').append(first, el('p', '', 'First explanation'), child, el('p', 'anchor', 'Child explanation')), second, el('p', '', 'Second explanation'), figure, reference);
globalThis.Element = Element;
globalThis.Node = { TEXT_NODE: 3, DOCUMENT_POSITION_FOLLOWING: 4 };
globalThis.document = { getElementById: id => nodes(root).find(node => node.id === id) };
const source = await fs.readFile(new URL('../src/components/documentationReadingPages.ts', import.meta.url), 'utf8');
const { code } = await transformWithEsbuild(source, 'documentationReadingPages.ts', { loader: 'ts' });
const { applyReadingPage, readingPageForTarget } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const chapter = { id: 'chapter', items: [
  { id: 'first' }, { id: 'child' }, { id: 'second' }, { id: 'caption' }, { id: 'reference' }, { id: 'inner' },
] };
const visible = node => {
  for (let current = node; current; current = current.parentElement) if (current.attributes?.has('data-documentation-page-hidden')) return false;
  return true;
};
const original = root.textContent;
for (const id of ['chapter', ...chapter.items.map(item => item.id)]) {
  const owners = applyReadingPage(root, chapter, id);
  for (const [node, owner] of owners) if (node instanceof Text && node.textContent.trim()) assert.equal(visible(node), owner === id, `${id}: ${node.textContent}`);
  assert(visible(notice), 'future-market availability remains visible on every page');
  assert.equal(root.textContent, original, 'no content removed or React node moved');
}
applyReadingPage(root, chapter, 'caption');
assert(visible(diagram), 'a figure preceding its caption belongs to that caption page');
assert.equal(readingPageForTarget(root, chapter, diagram), 'caption');
assert.equal(readingPageForTarget(root, chapter, document.getElementById('anchor')), 'child');
assert.equal(readingPageForTarget(root, chapter, inner), 'inner');
assert.equal(readingPageForTarget(root, chapter, intro), 'chapter');
console.log('Documentation reading pages: intro, siblings, nested sections, reference descendants, figure ownership, deep anchors and persistent availability; original nodes and text preserved.');
