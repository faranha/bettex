import catalog from './documentation-outline.json';
import { documentationChapters, documentationParentId, documentationChapterNumber } from './documentation-structure';
import type { ChapterOutline } from '../components/whitepaperOutline';
import { resolveDocumentationId } from './documentation-aliases';

export const documentationSectionTitles = [
  'Visão do projeto', 'Agente BETTEX', 'Subagentes', 'Features', 'Tokenomics', 'Base técnica e segurança', 'Roadmap',
] as const;
export const documentationSectionTargets = [
  'documentacao-como-funciona', 'documentacao-agentes', 'documentation-reading-group-2',
  'documentation-reading-group-3', 'documentacao-tokenomics', 'documentacao-riscos', 'documentacao-roadmap',
] as const;

export function documentationOutline(locale: 'pt' | 'en' | 'es'): ChapterOutline[] {
  const outline = catalog[locale].outline as ChapterOutline[];
  return documentationChapters.map((chapter, index) => ({
    ...(outline.find(item => item.id === chapter.id) ?? { id: chapter.id, title: chapter.title, items: [] }),
    number: documentationChapterNumber(index),
  }));
}

export function documentationTarget(id: string, locale: 'pt' | 'en' | 'es') {
  const targets = catalog[locale].targets as Record<string, { group: number; index: number }>;
  if (targets[id]) {
    const previousChapter = catalog[locale].outline[targets[id].index];
    const index = documentationChapters.findIndex(chapter => chapter.id === previousChapter?.id);
    if (index >= 0) return { group: documentationChapters[index].group, index };
  }
  const group = documentationSectionTargets.findIndex(target => target === id);
  if (group >= 0) return { group, index: documentationChapters.findIndex(chapter => chapter.group === group) };
  const index = documentationChapters.findIndex(chapter => id === chapter.id || id === `title-${chapter.id}` || id.startsWith(`${chapter.id}-secao-`));
  if (index >= 0) return { group: documentationChapters[index].group, index };
  return undefined;
}

export function documentationInitialTarget(locale: 'pt' | 'en' | 'es') {
  if (typeof window === 'undefined') return { group: 0, index: 0 };
  let id = '';
  try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { /* malformed URL falls back to Vision */ }
  return documentationTarget(resolveDocumentationId(id), locale) ?? { group: 0, index: 0 };
}

export function documentationReadingRoot(index: number) {
  return documentationParentId(documentationChapters[index].id) ?? documentationChapters[index].id;
}
