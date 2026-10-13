import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { transformWithEsbuild } from 'vite';

// A bounded DOM fixture exercises the production outline helpers without
// another browser run or adding a DOM library to the application's bundle.
class Element {
  constructor(tag, text = '', id = '', classes = '') {
    this.tagName = tag.toUpperCase();
    this.ownText = text;
    this.id = id;
    this.classes = new Set(classes.split(' '));
    this.children = [];
    this.parentElement = null;
    this.attributes = {};
    this.height = 0;
  }
  append(...nodes) {
    for (const node of nodes) { node.parentElement = this; this.children.push(node); }
    return this;
  }
  get textContent() { return this.ownText + this.children.map(n => n.textContent).join(''); }
  matches(selector) {
    if (selector === '[id]') return Boolean(this.id);
    if (selector === '[data-documentation-reference]') return Object.hasOwn(this.attributes, 'data-documentation-reference');
    const [tag, ...classes] = selector.split('.');
    return (!tag || tag.toUpperCase() === this.tagName) && classes.every(c => this.classes.has(c));
  }
  querySelectorAll(selector) {
    const selectors = selector.split(',').map(s => s.trim());
    const result = [];
    const walk = node => {
      for (const child of node.children) {
        if (selectors.some(s => child.matches(s))) result.push(child);
        walk(child);
      }
    };
    walk(this);
    return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  closest(selector) {
    for (let node = this; node; node = node.parentElement) {
      if (selector.split(',').some(s => node.matches(s.trim()))) return node;
    }
    return null;
  }
  setAttribute(key, value) { this.attributes[key] = value; }
  getBoundingClientRect() { return { height: this.height }; }
}
class Details extends Element {
  constructor(id = '') { super('details', '', id); this.open = false; }
}
globalThis.HTMLElement = Element;
globalThis.HTMLDetailsElement = Details;
const source = await fs.readFile(new URL('../src/components/whitepaperOutline.ts', import.meta.url), 'utf8');
const compiled = await transformWithEsbuild(source, 'whitepaperOutline.ts', { loader: 'ts' });
const { collectOutline, groupReferenceItems, openAncestors, scrollOffset, outlineSignature } = await import(`data:text/javascript;base64,${Buffer.from(compiled.code).toString('base64')}`);
let referenceIds;
for (const [locale, title] of [['pt', 'Visão do projeto.'], ['en', 'Project vision.'], ['es', 'Visión del proyecto.']]) {
  const root = new Element('div');
  const header = new Element('header', '', '', 'site-header'); header.height = 72;
  const aside = new Element('aside', '', '', 'whitepaper__aside'); aside.height = 112;
  const article = new Element('article', '', 'documentacao-teste');
  const account = new Element('h3', `${locale}: account`);
  const policy = new Details('policy');
  policy.setAttribute('data-documentation-reference', '');
  const policyHeading = new Element('h3', `${locale}: policy`, '', 'reading__title');
  policy.append(new Element('summary').append(policyHeading));
  const version = new Details('version');
  const versionHeading = new Element('h3', `${locale}: version`, '', 'reading__title');
  const controls = new Element('h4', `${locale}: limits`, 'limits');
  version.append(new Element('summary').append(versionHeading), controls);
  policy.append(version);
  article.append(new Element('h2', title, 'title-documentacao-teste'), account, policy, new Element('h3', `${locale}: fees`, 'fees'));
  // Reserve the first automatic id to exercise collision handling.
  root.append(header, aside, new Element('div', '', 'documentacao-teste-secao-1'), article);
  const measuredOffsets = {};
  globalThis.document = {
    documentElement: { style: { setProperty: (name, value) => { measuredOffsets[name] = value; } } },
    querySelector: s => root.querySelector(s),
    querySelectorAll: s => root.querySelectorAll(s),
    getElementById: id => root.querySelectorAll('[id]').find(n => n.id === id),
  };
  const chapters = [{ id: article.id, title: 'source title' }];
  const outline = collectOutline(chapters);
  assert.equal(outline[0].title, title.replace(/\.$/u, ''));
  assert.equal(document.getElementById('title-documentacao-teste').textContent, title);
  assert.deepEqual(outline[0].items.map(i => i.number), ['1.1', '1.2', '1.2.1', '1.2.1.1', '1.3']);
  assert.deepEqual(outline[0].items.map(i => i.level), [1, 1, 2, 3, 1]);
  assert.equal(account.id, 'documentacao-teste-secao-1-2');
  assert.equal(policyHeading.attributes['data-outline-number'], '1.2');
  const ids = outline[0].items.map(i => i.id);
  if (referenceIds) assert.deepEqual(ids, referenceIds);
  referenceIds = ids;
  assert.equal(outlineSignature(collectOutline(chapters)), outlineSignature(outline));
  const reference = groupReferenceItems(outline[0].items)[1];
  assert.equal(reference.item.isReference, true);
  assert.equal(reference.item.referenceOpen, false);
  assert.deepEqual(reference.children.map(i => i.number), ['1.2.1', '1.2.1.1']);
  assert.equal(policy.open, false, 'Menu collection must not open the content');
  openAncestors(controls);
  assert(policy.open && version.open);
  assert.equal(collectOutline(chapters)[0].items.find(i => i.id === policy.id).referenceOpen, true);
  policy.open = false; version.open = false;
  openAncestors(version);
  assert(policy.open && version.open);
  globalThis.window = { matchMedia: () => ({ matches: false }) };
  assert.equal(scrollOffset(), 72);
  assert.equal(measuredOffsets['--documentation-sticky-h'], '72px');
  window.matchMedia = () => ({ matches: true });
  assert.equal(scrollOffset(), 184);
  assert.equal(measuredOffsets['--documentation-sticky-h'], '184px');
  assert.equal(scrollOffset({ closest: () => null }), 72, 'The documentation opening has no sticky chapter index above it.');
  assert.equal(scrollOffset({ closest: () => article }), 184, 'Chapter content compensates only the header and mobile index.');
}
const readerSource = await fs.readFile(new URL('../src/components/WhitepaperSection.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(readerSource, /whitepaper__crumbs|crumbs\.map/, 'Do not repeat chapter options in a breadcrumb above the index.');
console.log('Documentation navigation: single index, 3-level numbering, stable locale ids, collisions, closed ancestors and measured desktop/mobile offsets verified.');