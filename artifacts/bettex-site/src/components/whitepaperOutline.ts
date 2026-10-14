export type OutlineItem = {
  id: string; // stable target id (existing id preserved)
  chapterId: string;
  number: string; // e.g. "2.1.1"
  level: 1 | 2 | 3;
  title: string;
  isReference?: boolean;
  referenceOpen?: boolean;
};
export type ChapterOutline = { id: string; number: string; title: string; items: OutlineItem[] };

/** Menu labels omit terminal punctuation; rendered headings and target IDs are untouched. */
export const formatOutlineTitle = (s: string | null | undefined) =>
  (s ?? '').replace(/\s+/g, ' ').trim().replace(/[.!?…:;]+$/u, '').trim();
const EXCLUDED = '.whitepaper__timeline, .whitepaper__market-card, .whitepaper__vesting-chart, table, .wp-facts, .whitepaper__status-grid, .whitepaper__system, [data-documentation-opening]';

/** Offset of the real shared site header plus the compact mobile index. */
export function scrollOffset(target?: Element) {
  const header = document.querySelector('header.site-header') ?? document.querySelector('.site-header');
  const headerHeight = header?.getBoundingClientRect().height ?? 73;
  const aside = document.querySelector('.whitepaper__aside');
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  const indexHeight = mobile && (!target || target.closest('.whitepaper__content')) ? aside?.getBoundingClientRect().height ?? 0 : 0;
  const offset = headerHeight + indexHeight;
  document.documentElement.style.setProperty('--documentation-sticky-h', `${offset}px`);
  return offset;
}

export function openAncestors(el: Element) {
  if (el instanceof HTMLDetailsElement) el.open = true;
  for (let p = el.parentElement; p; p = p.parentElement) if (p instanceof HTMLDetailsElement) p.open = true;
}

/**
 * Scans rendered chapters (so it works after locale changes), assigns stable ids
 * (existing ids kept) and numbering attributes, and returns the outline.
 */
export function collectOutline(chapters: readonly { id: string; title: string }[], numberForChapter = (index: number) => String(index + 1)): ChapterOutline[] {
  const used = new Set<string>();
  document.querySelectorAll('[id]').forEach(e => used.add(e.id));
  return chapters.map((chapter, ci) => {
    const article = document.getElementById(chapter.id);
    const number = numberForChapter(ci);
    const titleEl = document.getElementById(`title-${chapter.id}`);
    const out: ChapterOutline = { id: chapter.id, number, title: formatOutlineTitle(titleEl?.textContent) || formatOutlineTitle(chapter.title), items: [] };
    if (!article || chapter.id === 'documentacao-features') return out;
    const counters = [0, 0, 0];
    const nodes = article.querySelectorAll<HTMLElement>('h3, h4, summary');
    nodes.forEach((node, nodeIndex) => {
      const owner = node.closest('article.whitepaper__chapter');
      if (owner && owner.id !== chapter.id) return;
      if (node.closest(EXCLUDED) && !node.closest('.whitepaper__vesting')) return;
      if (node.closest('.whitepaper__chapter-head')) return;
      const reference = node.closest<HTMLDetailsElement>('[data-documentation-reference]');
      let target: HTMLElement = node;
      let titleHost: HTMLElement = node;
      let depth = 0;
      let isSummary = false;
      if (node.tagName === 'SUMMARY') {
        const details = node.parentElement;
        if (!(details instanceof HTMLDetailsElement)) return;
        if (node.querySelector('h3, h4')) return; // heading inside is handled itself below
        isSummary = true;
        target = details;
        for (let p = details.parentElement; p; p = p.parentElement) if (p instanceof HTMLDetailsElement && !p.matches('.whitepaper__chapter-accordion, .whitepaper__reading-group')) depth++;
      } else {
        const summary = node.closest('summary');
        if (summary) {
          const details = summary.parentElement as HTMLDetailsElement;
          target = details;
          isSummary = true;
          for (let p = details.parentElement; p; p = p.parentElement) if (p instanceof HTMLDetailsElement && !p.matches('.whitepaper__chapter-accordion, .whitepaper__reading-group')) depth++;
        } else {
          for (let p = node.parentElement; p; p = p.parentElement) if (p instanceof HTMLDetailsElement && !p.matches('.whitepaper__chapter-accordion, .whitepaper__reading-group')) depth++;
          if (node.tagName === 'H4') depth++;
        }
      }
      if (isSummary && node.tagName === 'SUMMARY') titleHost = (node.querySelector('.reading__title') as HTMLElement) ?? node;
      const title = formatOutlineTitle(titleHost.textContent);
      if (!title) return;
      let level = (Math.min(depth, 2) + 1) as 1 | 2 | 3;
      while (level > 1 && counters[level - 2] === 0) level = (level - 1) as 1 | 2 | 3;
      counters[level - 1]++;
      for (let i = level; i < 3; i++) counters[i] = 0;
      const num = [number, ...counters.slice(0, level)].join('.');
      if (!target.id) {
        // Structural targets remain identical across PT/EN/ES and reloads.
        let id = `${chapter.id}-secao-${nodeIndex + 1}`;
        let n = 2;
        while (used.has(id)) id = `${chapter.id}-secao-${nodeIndex + 1}-${n++}`;
        target.id = id;
        used.add(id);
      }
      titleHost.setAttribute('data-outline-number', num);
      if (!isSummary) titleHost.tabIndex = -1;
      out.items.push({ id: target.id, chapterId: chapter.id, number: num, level, title,
        isReference: !!reference && target === reference,
        referenceOpen: !!reference?.open });
    });
    return out;
  });
}

/** Group a reference with its descendants without renumbering or changing targets. */
export function groupReferenceItems(items: readonly OutlineItem[]) {
  const groups: { item: OutlineItem; children: OutlineItem[] }[] = [];
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const children: OutlineItem[] = [];
    if (item.isReference) {
      while (items[index + 1]?.number.startsWith(`${item.number}.`)) children.push(items[++index]);
    }
    groups.push({ item, children });
  }
  return groups;
}

export const outlineSignature = (o: ChapterOutline[]) => o.map(c => `${c.id}|${c.title}|${c.items.map(i => `${i.id}:${i.number}:${i.title}:${i.isReference}:${i.referenceOpen}`).join(',')}`).join(';');
