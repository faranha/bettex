import type { ChapterOutline } from './whitepaperOutline';

const SUBTITLE = 'data-documentation-section-subtitle';
const PERIOD = 'data-documentation-heading-period';

/** Use a short excerpt of the existing localized explanation, not invented rules. */
export function sectionSubtitleExcerpt(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const sentence = normalized.match(/^.*?[.!?](?=\s|$)/u)?.[0] ?? normalized;
  if (sentence.length <= 190) return sentence;
  const end = sentence.slice(0, 187).lastIndexOf(' ');
  return `${sentence.slice(0, end > 90 ? end : 187).replace(/[,:;]$/u, '')}…`;
}

function ownerOf(node: Node, owners: ReadonlyMap<Node, string>) {
  for (let current: Node | null = node; current; current = current.parentNode) {
    const owner = owners.get(current);
    if (owner) return owner;
  }
  return undefined;
}

/** Enhance existing headings without wrapping or moving React-owned content. */
export function applySectionPresentation(root: HTMLElement, chapter: ChapterOutline, owners: ReadonlyMap<Node, string>) {
  const explanations = [...root.querySelectorAll<HTMLElement>('p, td, figcaption, small')]
    .filter(node => !node.hasAttribute(SUBTITLE) && !node.closest(`[${SUBTITLE}]`));
  for (const item of chapter.items) {
    const target = document.getElementById(item.id);
    if (!target || !root.contains(target)) continue;
    const heading = target.tagName === 'DETAILS'
      ? target.querySelector<HTMLElement>(':scope > summary [data-outline-number], :scope > summary')
      : target;
    if (!heading) continue;
    heading.dataset.documentationSectionLevel = String(item.level);
    let period = heading.querySelector<HTMLElement>(`[${PERIOD}]`);
    if (!period) {
      period = document.createElement('span');
      period.setAttribute(PERIOD, '');
      period.setAttribute('aria-hidden', 'true');
      period.textContent = '.';
      heading.insertBefore(period, heading.querySelector('[data-documentation-section-toggle]'));
    }
    const explanation = explanations.find(node => ownerOf(node, owners) === item.id && node.textContent?.trim());
    const description = sectionSubtitleExcerpt(explanation?.textContent ?? '');
    // A structural index with no own prose uses the first actual child explanation.
    const descendant = description ? '' : sectionSubtitleExcerpt(explanations.find(node => {
      const owner = ownerOf(node, owners);
      return owner && chapter.items.some(child => child.id === owner && child.number.startsWith(`${item.number}.`)) && node.textContent?.trim();
    })?.textContent ?? '');
    const text = description || descendant;
    if (!text) continue;
    let subtitle = root.querySelector<HTMLElement>(`[${SUBTITLE}="${item.id}"]`);
    if (!subtitle) {
      subtitle = document.createElement('span');
      subtitle.setAttribute(SUBTITLE, item.id);
      subtitle.setAttribute('data-i18n', 'translated');
      subtitle.className = 'whitepaper__section-subtitle';
      const summary = heading.tagName === 'SUMMARY' ? heading : heading.closest('summary');
      if (summary) summary.append(subtitle);
      else heading.after(subtitle);
    }
    if (subtitle.textContent !== text) subtitle.textContent = text;
  }
}
