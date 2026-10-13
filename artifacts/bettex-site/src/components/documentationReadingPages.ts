import type { ChapterOutline } from './whitepaperOutline';

const HIDDEN = 'data-documentation-page-hidden';
const HEADING = 'data-documentation-page-heading';
const ATOMIC = new Set(['SVG', 'IMG', 'IFRAME', 'VIDEO', 'CANVAS', 'TABLE']);

function boundaries(root: HTMLElement, chapter: ChapterOutline) {
  const figures = new Set<Element>();
  return chapter.items.flatMap(item => {
    const element = document.getElementById(item.id);
    if (!element || !root.contains(element)) return [];
    const figure = element.closest('figure');
    const start = figure && root.contains(figure) && !figures.has(figure) ? figure : element;
    if (figure) figures.add(figure);
    return [{ item, element, start }];
  });
}

/** Existing anchors open the page that owns their content, not a long chapter. */
export function readingPageForTarget(root: HTMLElement, chapter: ChapterOutline, target: Element) {
  if (!root.contains(target)) return chapter.id;
  const points = boundaries(root, chapter);
  const exact = points.find(point => point.element === target);
  if (exact) return exact.item.id;
  const containing = points.filter(point => point.element.contains(target)).at(-1);
  if (containing) {
    const nested = points.filter(point => containing.element.contains(point.element) &&
      !point.element.contains(target) && (point.element.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)).at(-1);
    return nested?.item.id ?? containing.item.id;
  }
  const contained = points.find(point => target.contains(point.element));
  if (contained) return contained.item.id;
  return points.filter(point => point.start === target || point.start.contains(target) ||
    (point.start.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)).at(-1)?.item.id ?? chapter.id;
}

/**
 * Partition the original live React DOM without moving or cloning its nodes.
 * Each numbered heading starts a page; nested headings start independent pages
 * too. Ancestor shells remain only when they contain the selected page.
 * Charts, images, tables and event handlers stay attached to their real nodes.
 */
export function applyReadingPage(root: HTMLElement, chapter: ChapterOutline, pageId: string) {
  root.querySelectorAll(`[${HIDDEN}], [${HEADING}]`).forEach(element => {
    element.removeAttribute(HIDDEN);
    element.removeAttribute(HEADING);
  });
  const points = boundaries(root, chapter);
  const starts = new Map<Element, string>(points.flatMap(({ item, element, start }) => [[start, item.id], [element, item.id]] as [Element, string][]));
  const owners = new Map<Node, string>();
  let current = chapter.id;
  const visit = (node: Node): Set<string> => {
    if (node instanceof Element && starts.has(node)) current = starts.get(node)!;
    if (node.nodeType === Node.TEXT_NODE) {
      owners.set(node, current);
      return node.textContent?.trim() ? new Set([current]) : new Set();
    }
    if (!(node instanceof Element)) return new Set();
    // Future-market availability applies to every page of those chapters.
    if (node.matches('[role="note"]') && node.closest('[data-testid^="documentation-future-market-"]')) return new Set([pageId]);
    const own = current;
    owners.set(node, own);
    if (ATOMIC.has(node.tagName.toUpperCase())) {
      if (own !== pageId) node.setAttribute(HIDDEN, '');
      return new Set([own]);
    }
    const pages = new Set<string>();
    node.childNodes.forEach(child => visit(child).forEach(id => pages.add(id)));
    if (!pages.size) pages.add(own);
    if (node !== root && !pages.has(pageId)) node.setAttribute(HIDDEN, '');
    return pages;
  };
  visit(root);
  const selected = points.find(point => point.item.id === pageId)?.element;
  const title = selected?.tagName === 'DETAILS'
    ? selected.querySelector('[data-outline-number]') ?? selected.querySelector('summary')
    : selected;
  title?.setAttribute(HEADING, '');
  root.dataset.documentationReadingPage = pageId;
  return owners;
}
