import { applyReadingPage } from './documentationReadingPages';
import type { ChapterOutline } from './whitepaperOutline';

const HIDDEN = 'data-documentation-page-hidden';
const HEADING = 'data-documentation-section-heading';
const TOGGLE = 'data-documentation-section-toggle';
const ATOMIC = new Set(['SVG', 'IMG', 'IFRAME', 'VIDEO', 'CANVAS', 'TABLE']);

/** Technical blocks own their nested content even when legacy numbers are siblings. */
function enclosingSectionIds(id: string) {
  const ids: string[] = [];
  for (let parent = document.getElementById(id)?.parentElement; parent; parent = parent.parentElement) {
    if (!parent.matches('.whitepaper__technical-body')) continue;
    const heading = parent.parentElement?.querySelector<HTMLElement>(':scope > h3');
    if (heading?.id) ids.push(heading.id);
  }
  return ids;
}

/** Collapse existing blocks in place: React nodes and live chart state stay owned by React. */
export function applyDocumentationAccordions(
  root: HTMLElement, chapter: ChapterOutline, expanded: ReadonlySet<string>,
  expandLabel: string, collapseLabel: string,
) {
  const owners = applyReadingPage(root, chapter, chapter.id);
  const headings = new Map<Element, (typeof chapter.items)[number]>();
  for (const item of chapter.items) {
    const heading = document.getElementById(item.id);
    if (!heading || !root.contains(heading)) continue;
    headings.set(heading, item);
    if (heading.tagName === 'DETAILS') continue; // Native technical-reference accordions.
    heading.setAttribute(HEADING, item.id);
    let button = heading.querySelector<HTMLButtonElement>(`[${TOGGLE}]`);
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.setAttribute(TOGGLE, item.id);
      button.className = 'whitepaper__section-toggle';
      button.innerHTML = '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
      heading.append(button);
    }
    const open = expanded.has(item.id);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', `${open ? collapseLabel : expandLabel} ${item.title}`);
  }
  const sectionIds = new Set(chapter.items.map(item => item.id));
  const enclosingSections = new Map(chapter.items.map(item =>
    [item.id, enclosingSectionIds(item.id).filter(id => sectionIds.has(id))]));
  const ancestorsOpen = (id: string) => {
    const item = chapter.items.find(entry => entry.id === id);
    return (!item || chapter.items.every(parent => !item.number.startsWith(`${parent.number}.`) ||
      parent.isReference || expanded.has(parent.id))) &&
      (enclosingSections.get(id) ?? []).every(parent => expanded.has(parent));
  };
  const bodyOpen = (id: string) => id === chapter.id || ancestorsOpen(id) &&
    (expanded.has(id) || !!chapter.items.find(item => item.id === id)?.isReference);
  const visit = (node: Node): boolean => {
    const owner = owners.get(node) ?? chapter.id;
    if (node.nodeType === Node.TEXT_NODE) return !!node.textContent?.trim() && bodyOpen(owner);
    if (!(node instanceof Element)) return false;
    const heading = headings.get(node);
    let visible: boolean;
    if (heading && node.tagName !== 'DETAILS') visible = ancestorsOpen(heading.id);
    else if (node.hasAttribute(TOGGLE)) visible = ancestorsOpen(owner);
    else if (ATOMIC.has(node.tagName.toUpperCase())) visible = bodyOpen(owner);
    else {
      const children = Array.from(node.childNodes).map(visit);
      visible = children.some(Boolean) || !children.length && bodyOpen(owner);
      if (heading) visible = ancestorsOpen(heading.id);
    }
    if (node !== root && !visible) node.setAttribute(HIDDEN, '');
    else node.removeAttribute(HIDDEN);
    return visible;
  };
  visit(root);
}

/** A deep link opens only its section and ancestors, leaving other accordions unchanged. */
export function sectionAncestors(chapter: ChapterOutline, id: string) {
  const item = chapter.items.find(entry => entry.id === id);
  if (!item) return [];
  const enclosing = new Set(enclosingSectionIds(id));
  const targets = chapter.items.filter(entry => entry.id === id || enclosing.has(entry.id));
  return chapter.items.filter(entry => targets.some(target =>
    target.id === entry.id || target.number.startsWith(`${entry.number}.`))).map(entry => entry.id);
}
