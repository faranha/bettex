/** @jsxImportSource react */
import { useEffect, type MouseEvent, type ReactElement } from 'react';
import { t, useLocale } from '@/lib/i18n';
import { documentationParentId } from '@/lib/documentation-structure';
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
  const pages = chapters.flatMap(chapter => [
    { id: chapter.id, number: chapter.number, title: chapter.title },
    ...chapter.items,
  ]);
  const index = pages.findIndex(page => page.id === pageId);
  const previous = pages[index - 1];
  const next = pages[index + 1];
  const chapter = chapters.find(item => item.id === chapterId);
  const current = chapter?.items.find(item => item.id === pageId);
  const children = chapter?.items.filter(item => current
    ? item.number.startsWith(`${current.number}.`) && item.level === current.level + 1
    : item.level === 1) ?? [];

  useEffect(() => {
    document.querySelectorAll<HTMLDetailsElement>('[data-documentation-footer-group]').forEach(group => { group.open = false; });
  }, [pageId, locale]);

  const link = (page: { id: string; number: string; title: string }) => <a href={`#${page.id}`}
    data-documentation-footer-page="" aria-current={page.id === pageId ? 'page' : undefined}
    data-i18n="translated" onClick={event => onNavigate(event, page.id)}>
    <span className="mono">{page.number}</span> {page.title}
  </a>;
  const group = (entry: ChapterOutline): ReactElement => <details key={entry.id} data-documentation-footer-group>
    <summary data-i18n="translated"><span className="mono">{entry.number}</span> {entry.title}</summary>
    <ul>
      {entry.id === 'documentacao-carteira-bettex' && <li>{link({ id: 'documentacao-features', number: '', title: t('Features') })}</li>}
      <li>{link(entry)}</li>
      {entry.items.map(item => <li key={item.id} className={`documentation-page-footer__level-${item.level}`}>{link(item)}</li>)}
      {chapters.filter(child => documentationParentId(child.id) === entry.id).map(child => <li key={child.id}>{group(child)}</li>)}
    </ul>
  </details>;

  return <footer className="documentation-page-footer" data-testid="documentation-page-footer">
    {children.length > 0 && <nav aria-label={x('Conteúdos desta seção', 'Contents of this section', 'Contenidos de esta sección')}>
      <p><strong>{x('Conteúdos desta seção', 'Contents of this section', 'Contenidos de esta sección')}</strong></p>
      <ul>{children.map(item => <li key={item.id}>{link(item)}</li>)}</ul>
    </nav>}
    <nav className="whitepaper__chapter-pagination" aria-label={x('Navegação entre seções', 'Section navigation', 'Navegación entre secciones')}>
      {previous ? <a href={`#${previous.id}`} rel="prev" onClick={event => onNavigate(event, previous.id)} data-testid="documentation-page-previous">
        <span>{x('← Seção anterior', '← Previous section', '← Sección anterior')}</span><strong data-i18n="translated">{previous.number} {previous.title}</strong>
      </a> : <span />}
      {next ? <a href={`#${next.id}`} rel="next" onClick={event => onNavigate(event, next.id)} data-testid="documentation-page-next">
        <span>{x('Próxima seção →', 'Next section →', 'Siguiente sección →')}</span><strong data-i18n="translated">{next.number} {next.title}</strong>
      </a> : <span />}
    </nav>
    {current && chapter && <p>{link(chapter)}</p>}
    <nav aria-label={x('Todas as seções e conteúdos', 'All sections and content', 'Todas las secciones y contenidos')} data-testid="documentation-all-pages">
      <p><strong>{x('Todas as seções e conteúdos', 'All sections and content', 'Todas las secciones y contenidos')}</strong></p>
      <div className="documentation-page-footer__directory">
        {chapters.filter(entry => !documentationParentId(entry.id)).map(group)}
      </div>
    </nav>
    <a className="whitepaper__back" href="#documentacao-indice" onClick={event => onNavigate(event, 'documentacao-indice')}>{t('Voltar ao índice ↑')}</a>
  </footer>;
}
