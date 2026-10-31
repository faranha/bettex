import { createElement, isValidElement, type ReactElement } from 'react';

/** Inline continuations must not be replaced by standalone summaries. */
export function isDocumentationContinuation(source: string) {
  const text = source.trim();
  return !!text && (/^[,;:]/.test(text) || /^\p{Ll}/u.test(text) || !/[.!?]$/.test(text));
}

export function preserveDocumentationSpacing(source: string, localized: string) {
  if (!source.trim()) return source;
  const leading = source.match(/^\s+/)?.[0] ?? '';
  const trailing = source.match(/\s+$/)?.[0] ?? '';
  let text = localized.trim();
  const boundary = source.trimStart().match(/^([.,;:!?])(\s+)/);
  if (boundary && !/^[.,;:!?—–-]/.test(text)) text = boundary[1] + boundary[2] + text;
  return (/^[.,;:!?]/.test(text) ? '' : leading) + text + trailing;
}

/**
 * Related documentation paragraphs become semantic list items without splitting
 * sentences, translating twice, or cloning away their original inline content.
 * Introductory prose, cards, existing lists and non-documentation content stay as-is.
 */
export function formatDocumentationProse(props: Record<string, unknown>, type?: unknown) {
  if (type !== 'div' || typeof props.className !== 'string'
      || !props.className.split(/\s+/).includes('whitepaper__prose')) return props;

  const children = Array.isArray(props.children) ? props.children : [props.children];
  const paragraphs = children.filter(child =>
    child != null && typeof child !== 'boolean'
    && !(typeof child === 'string' && /^\s*$/.test(child)));
  const rules = paragraphs.filter((child): child is ReactElement =>
    isValidElement(child) && child.type === 'p');
  if (rules.length < 2 || rules.length !== paragraphs.length) return props;

  return {
    ...props,
    // Keep an array: JSX's static-children contract also applies after formatting.
    children: [createElement('ul', { className: 'whitepaper__rules', key: 'whitepaper__rules' },
      rules.map((paragraph, index) =>
        createElement('li', { key: `rule-${index}` }, paragraph)))],
  };
}
