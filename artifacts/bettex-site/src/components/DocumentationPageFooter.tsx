/** @jsxImportSource react */
import { type MouseEvent } from 'react';
import { useLocale } from '@/lib/i18n';
import type { ChapterOutline } from './whitepaperOutline';

type Props = {
  outline: ChapterOutline[];
  chapterId: string;
  pageId: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
};

export function DocumentationPageFooter({ outline, chapterId, pageId, onNavigate }: Props) {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  const chapters = outline.filter(chapter => chapter.id !== 'documentacao-features');
  const chapter = chapters.find(item => item.id === chapterId);
  const chapterIndex = chapters.findIndex(item => item.id === chapterId);
  const current = chapter?.items.find(item => item.id === pageId);
  const itemIndex = chapter?.items.findIndex(item => item.id === pageId) ?? -1;
  const previous = current
    ? chapter?.items.slice(0, itemIndex).filter(item => item.level <= current.level).at(-1) ?? chapter
    : chapters[chapterIndex - 1];
  const next = current
    ? chapter?.items.slice(itemIndex + 1).find(item => item.level <= current.level) ?? chapters[chapterIndex + 1]
    : chapters[chapterIndex + 1];

  const link = (page: { id: string; number: string; title: string }) => <a href={`#${page.id}`}
    data-documentation-footer-page="" aria-current={page.id === pageId ? 'page' : undefined}
    data-i18n="translated" onClick={event => onNavigate(event, page.id)}>
    <span className="mono">{page.number}</span> {page.title}
  </a>;

  return <footer className="documentation-page-footer" data-testid="documentation-page-footer">
    <nav className="whitepaper__chapter-pagination" aria-label={x('Navegação entre seções', 'Section navigation', 'Navegación entre secciones')}>
      {previous ? <a href={`#${previous.id}`} rel="prev" onClick={event => onNavigate(event, previous.id)} data-testid="documentation-page-previous">
        <span>{x('← Seção anterior', '← Previous section', '← Sección anterior')}</span><strong data-i18n="translated">{previous.number} {previous.title}</strong>
      </a> : <span />}
      {next ? <a href={`#${next.id}`} rel="next" onClick={event => onNavigate(event, next.id)} data-testid="documentation-page-next">
        <span>{x('Próxima seção →', 'Next section →', 'Siguiente sección →')}</span><strong data-i18n="translated">{next.number} {next.title}</strong>
      </a> : <span />}
    </nav>
    {current && chapter && <p>{link(chapter)}</p>}
  </footer>;
}
