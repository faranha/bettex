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
  hasAttribute(name) { return this.attributes.has(name); }
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
// Real SVG namespace tagName is lowercase, unlike HTML and our default fixture.
diagram.tagName = 'svg';
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
globalThis.document = { getElementById: id => nodes(root).find(node => node.id === id), createElement: tag => el(tag, '') };
const source = await fs.readFile(new URL('../src/components/documentationReadingPages.ts', import.meta.url), 'utf8');
const { code } = await transformWithEsbuild(source, 'documentationReadingPages.ts', { loader: 'ts' });
const { applyReadingPage, readingPageForTarget } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const accordionSource = await fs.readFile(new URL('../src/components/documentationAccordions.ts', import.meta.url), 'utf8');
const accordionCode = await transformWithEsbuild(accordionSource.replace("import { applyReadingPage } from './documentationReadingPages';", ''), 'documentationAccordions.ts', { loader: 'ts' });
globalThis.applyReadingPage = applyReadingPage;
const { applyDocumentationAccordions, sectionAncestors } = await import(`data:text/javascript;base64,${Buffer.from(accordionCode.code).toString('base64')}`);
const chapter = { id: 'chapter', items: [
  { id: 'first', number: '2.1' }, { id: 'child', number: '2.1.1' },
  { id: 'second', number: '2.2' }, { id: 'caption', number: '2.3' },
  { id: 'reference', number: '2.4' }, { id: 'inner', number: '2.4.1' },
] };
const visible = node => {
  for (let current = node; current; current = current.parentElement) if (current.attributes?.has('data-documentation-page-hidden')) return false;
  return true;
};
const original = root.textContent;
for (const id of ['chapter', ...chapter.items.map(item => item.id)]) {
  const owners = applyReadingPage(root, chapter, id);
  const selectedNumber = chapter.items.find(item => item.id === id)?.number;
  const belongs = owner => owner === id || id === chapter.id || !!selectedNumber &&
    !!chapter.items.find(item => item.id === owner)?.number.startsWith(`${selectedNumber}.`);
  for (const [node, owner] of owners) if (node instanceof Text && node.textContent.trim()) assert.equal(visible(node), belongs(owner), `${id}: ${node.textContent}`);
  assert(visible(notice), 'future-market availability remains visible on every page');
  assert.equal(root.textContent, original, 'no content removed or React node moved');
}
applyReadingPage(root, chapter, 'chapter');
assert(visible(first) && visible(child) && visible(second) && visible(diagram) && visible(inner), 'chapter selection opens real content, including subsections');
applyReadingPage(root, chapter, 'first');
assert(visible(child) && visible(document.getElementById('anchor')), 'parent section includes its child content');
assert(!visible(second), 'parent section does not expose the next sibling');
applyReadingPage(root, chapter, 'reference');
assert(visible(inner), 'technical reference selection opens its actual nested content');
applyReadingPage(root, chapter, 'caption');
assert(visible(diagram), 'a figure preceding its caption belongs to that caption page');
assert.equal(readingPageForTarget(root, chapter, diagram), 'caption');
assert.equal(readingPageForTarget(root, chapter, document.getElementById('anchor')), 'child');
assert.equal(readingPageForTarget(root, chapter, inner), 'inner');
assert.equal(readingPageForTarget(root, chapter, intro), 'chapter');
console.log('Documentation reading pages: complete chapters, section descendants, isolated siblings, real reference content, figure ownership, deep anchors and availability; original nodes and text preserved.');
const accordion = expanded => applyDocumentationAccordions(root, chapter, new Set(expanded), 'Expand', 'Collapse');
accordion([]);
assert(!visible(diagram), 'a closed figure hides its entire lowercase SVG, not only its labels');
assert(visible(intro) && visible(first) && visible(second), 'intro and collapsed top-level section headings stay visible');
assert(!visible(child) && !visible(document.getElementById('anchor')), 'collapsed parent hides its nested section');
accordion(['first']);
assert(visible(child) && !visible(document.getElementById('anchor')), 'opening parent shows a still-collapsed child');
accordion(['first', 'child']);
assert(visible(document.getElementById('anchor')), 'child opens inline without hiding another chapter or moving nodes');
accordion(['child']);
assert(!visible(child), 'parent may close while remembering the child expansion');
accordion(['first', 'child']);
assert(visible(document.getElementById('anchor')), 'reopening parent preserves child state');
accordion(['caption']);
assert(visible(diagram), 'opening a figure restores its complete SVG including labels');
assert.equal(root.textContent, original, 'accordion toggles preserve all original source text');
assert.deepEqual(sectionAncestors(chapter, 'child'), ['first', 'child']);
assert.deepEqual(sectionAncestors(chapter, 'inner'), ['reference', 'inner']);
console.log('Documentation accordions: nested inline expansion, preserved text/state, native references and deep-link ancestor expansion verified.');
