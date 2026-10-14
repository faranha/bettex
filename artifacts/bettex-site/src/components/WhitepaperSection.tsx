import { useCallback, useContext, useEffect, useRef, useState, type MouseEvent, type ReactElement } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { ChapterContent, chapters } from './WhitepaperChapters';
import { ChapterVisibility } from './ChapterVisibility';
import { DocumentationGovernanceMarquee } from './DocumentationGovernanceMarquee';
import { DocumentationOutlineItems } from './DocumentationOutlineItems';
import { DocumentationMenuContext, DocumentationMenuItem } from './DocumentationMenuItem';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DocumentationSectionOpening } from './DocumentationSectionOpening';
import { DocumentationLinkedTerms } from './DocumentationLinkedTerms';
import { DocumentationRelatedTopics } from './DocumentationRelatedTopics';
import { readingPageForTarget } from './documentationReadingPages';
import { applyDocumentationAccordions, sectionAncestors } from './documentationAccordions';
import { intelligenceCopy } from '@/lib/documentation-intelligence';
import { documentationGroups, documentationParentId, documentationChapterNumber } from '@/lib/documentation-structure';
import { t, useLocale } from '@/lib/i18n';
import { resolveDocumentationId } from '@/lib/documentation-aliases';
import { collectOutline, documentationMenuItems, formatOutlineTitle, openAncestors, outlineSignature, scrollOffset, type ChapterOutline } from './whitepaperOutline';
import './WhitepaperSection.css';
import { DocumentationRenderContext } from './DocumentationRenderContext';
import { documentationInitialTarget, documentationOutline, documentationSectionTargets, documentationSectionTitles, documentationTarget } from '@/lib/documentation-navigation';

const featuresIndex = chapters.findIndex(chapter => chapter.id === 'documentacao-features');

export function WhitepaperSection() {
  const documentationTitle = t('Documentação técnica.').split(' ');
  const locale = useLocale();
  const fullDocumentation = useContext(DocumentationRenderContext);
  const [initialTarget] = useState(() => documentationInitialTarget(locale));
  const [sectionGroup, setSectionGroup] = useState(initialTarget.group);
  const [selected, setSelected] = useState(initialTarget.index);
  const [readingGroup, setReadingGroup] = useState<number | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [openReadingSections, setOpenReadingSections] = useState<Set<string>>(() => new Set(['documentacao-visao']));
  const openReadingSectionsRef = useRef(openReadingSections);
  openReadingSectionsRef.current = openReadingSections;
  const [pageId, setPageId] = useState<string>(chapters[0].id);
  const active = selected;
  const [activeId, setActiveId] = useState<string>('');
  const [outline, setOutline] = useState<ChapterOutline[]>(() => documentationOutline(locale).length
    ? documentationOutline(locale)
    : chapters.map((c, i) => ({ id: c.id, number: documentationChapterNumber(i), title: formatOutlineTitle(t(c.title)), items: [] })));
  const sigRef = useRef('');
  const outlineRef = useRef(outline);
  outlineRef.current = outline;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigatingRef = useRef(false);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
  const [expandedReferences, setExpandedReferences] = useState<Record<string, boolean>>({});
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setSlot(document.getElementById('documentation-mobile-slot')); }, []);

  const collapseIndex = useCallback(() => {
    setExpandedGroups({});
    setExpandedChapters({});
    setExpandedReferences({});
  }, []);
  useEffect(collapseIndex, [locale, collapseIndex]);

  const scrollToId = useCallback((requestedId: string, _smooth: boolean) => {
    const id = resolveDocumentationId(requestedId);
    const target = documentationTarget(id, locale);
    if (target) {
      navigatingRef.current = true;
      flushSync(() => {
        setSectionGroup(target.group);
        setSelected(target.index);
        setReadingGroup(id.startsWith('documentation-reading-group-') || id === 'documentacao-features' ? target.group : null);
      });
    }
    const el = document.getElementById(id);
    if (!el) { navigatingRef.current = false; return false; }
    navigatingRef.current = true;
    const owner = el.closest<HTMLElement>('article.whitepaper__chapter');
    const index = owner ? chapters.findIndex(chapter => chapter.id === owner.id) : -1;
    const content = owner?.querySelector<HTMLElement>('[data-documentation-reading-content]');
    const chapter = outlineRef.current.find(item => item.id === owner?.id);
    const targetPage = content && chapter ? readingPageForTarget(content, chapter, el) : owner?.id;
    const expanded = new Set([...openReadingSectionsRef.current,
      ...(chapter && targetPage ? sectionAncestors(chapter, targetPage) : [])]);
    if (index >= 0) {
      window.scrollTo({ top: window.scrollY, behavior: 'instant' });
      flushSync(() => {
        setEnhanced(true); setSelected(index); setReadingGroup(null);
        setActiveId(id === owner!.id ? '' : id);
        if (targetPage) setPageId(targetPage);
        setOpenReadingSections(expanded);
      });
      // Reveal DOM-owned subsection blocks synchronously, before measuring the
      // anchor. A React effect alone can run after the first scroll frame.
      if (content && chapter) applyDocumentationAccordions(content, chapter, expanded, t('Expandir'), t('Recolher'));
    }
    openAncestors(el);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      // A page starts before its media, even when its numbered title is a
      // caption below the figure. Precise paragraph anchors still scroll there.
      // Opening a chapter can mount its deferred figure. Do not measure or
      // focus the old pre-expansion node, which may no longer be connected.
      const destination = document.getElementById(id);
      if (!destination) { navigatingRef.current = false; return; }
      openAncestors(destination);
      const top = destination.getBoundingClientRect().top + window.scrollY - scrollOffset(destination);
      // Accordion expansion changes the document height. A smooth animation
      // towards its pre-expansion geometry can finish at the wrong section.
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
      const focusEl = destination.matches('article.whitepaper__chapter, [data-documentation-reading-group], #documentacao-features')
        ? destination.querySelector<HTMLElement>('header h2') ?? destination
        : destination instanceof HTMLDetailsElement ? destination.querySelector<HTMLElement>('summary') ?? destination : destination;
      if (!focusEl.hasAttribute('tabindex') && focusEl.tagName !== 'SUMMARY') focusEl.setAttribute('tabindex', '-1');
      focusEl.focus({ preventScroll: true });
      navigatingRef.current = false;
      window.dispatchEvent(new Event('scroll'));
    }));
    return true;
  }, [locale]);

  useEffect(() => {
    // Lazy chapter content may arrive after the initial hash timers. Resolve
    // again once its numbered outline exists, without following body toggles.
    const requestedId = decodeURIComponent(window.location.hash.slice(1));
    const target = requestedId ? document.getElementById(resolveDocumentationId(requestedId)) : null;
    const owner = target?.closest('article.whitepaper__chapter');
    const targetIndex = owner ? chapters.findIndex(item => item.id === owner.id) : -1;
    const targetChapter = outline[targetIndex];
    const targetContent = owner?.querySelector<HTMLElement>('[data-documentation-reading-content]');
    if (enhanced && target && targetContent && targetChapter?.items.length) {
      const resolvedPage = readingPageForTarget(targetContent, targetChapter, target);
      if (resolvedPage !== pageId) {
        const frame = requestAnimationFrame(() => scrollToId(requestedId, false));
        return () => cancelAnimationFrame(frame);
      }
    }
    for (const chapter of outline) {
      if (chapter.id === 'documentacao-features') continue;
      const content = document.getElementById(chapter.id)?.querySelector<HTMLElement>('[data-documentation-reading-content]');
      if (enhanced && content) applyDocumentationAccordions(content, chapter, openReadingSections, t('Expandir'), t('Recolher'));
    }
    return undefined;
  }, [outline, selected, pageId, locale, enhanced, scrollToId, openReadingSections]);

  useEffect(() => {
    const toggle = (event: globalThis.MouseEvent) => {
      const heading = (event.target as Element)?.closest<HTMLElement>('[data-documentation-section-heading]');
      if (!heading || (event.target as Element).closest('a')) return;
      const id = heading.dataset.documentationSectionHeading!;
      setOpenReadingSections(previous => {
        const next = new Set(previous);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    };
    document.addEventListener('click', toggle);
    return () => document.removeEventListener('click', toggle);
  }, []);

  useEffect(() => {
    // This reader restores hash destinations itself; native restoration competes
    // with revealing/collapsing chapters of very different lengths.
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useEffect(() => {
    const owner = document.getElementById(resolveDocumentationId(decodeURIComponent(window.location.hash.slice(1))))?.closest('article.whitepaper__chapter');
    const initial = owner ? chapters.findIndex(chapter => chapter.id === owner.id) : -1;
    setEnhanced(true);
    if (initial >= 0 && owner) { setSelected(initial); setPageId(owner.id); }
  }, [scrollToId]);

  useEffect(() => {
    const root = document.querySelector('.whitepaper__content');
    let timer = 0;
    const rebuild = () => {
      const collected = collectOutline(chapters, documentationChapterNumber, documentationParentId);
      const localized = documentationOutline(locale);
      const next = collected.map((chapter, index) =>
        document.getElementById(chapter.id) ? chapter : localized[index] ?? chapter);
      const sig = outlineSignature(next);
      if (sig !== sigRef.current) { sigRef.current = sig; setOutline(next); }
    };
    const schedule = () => { window.clearTimeout(timer); timer = window.setTimeout(rebuild, 120); };
    rebuild();
    const obs = new MutationObserver(schedule);
    if (root) obs.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['open'] });
    return () => { obs.disconnect(); window.clearTimeout(timer); };
  }, [locale]);

  useEffect(() => {
    // Label every data cell with its column header so tables can stack on narrow screens.
    document.querySelectorAll('.whitepaper table').forEach(table => {
      const heads = Array.from(table.querySelectorAll('thead th')).map(th => (th.textContent ?? '').replace(/\s+/g, ' ').trim());
      table.querySelectorAll('tr').forEach(tr => {
        Array.from(tr.children).forEach((cell, i) => {
          if (cell.tagName === 'TD' && heads[i]) cell.setAttribute('data-label', heads[i]);
        });
      });
    });
  }, [locale]);

  useEffect(() => {
    const go = (smooth: boolean) => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) requestAnimationFrame(() => scrollToId(id, smooth));
      else {
        setSelected(0);
        setPageId(chapters[0].id);
        requestAnimationFrame(() => scrollToId('documentacao', smooth));
      }
    };
    const t1 = window.setTimeout(() => go(false), 60);
    const t2 = window.setTimeout(() => go(false), 400);
    const onHash = () => { collapseIndex(); go(true); };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    const onContentLink = (event: globalThis.MouseEvent) => {
      const anchor = (event.target as Element)?.closest<HTMLAnchorElement>('.whitepaper__content a[href^="#"]');
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const id = decodeURIComponent(anchor.hash.slice(1));
      if (!document.getElementById(resolveDocumentationId(id)) && !documentationTarget(resolveDocumentationId(id), locale)) return;
      event.preventDefault();
      collapseIndex();
      if (window.location.hash !== anchor.hash) window.history.pushState(null, '', anchor.hash);
      scrollToId(id, true);
    };
    document.addEventListener('click', onContentLink);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
      document.removeEventListener('click', onContentLink);
    };
  }, [collapseIndex, scrollToId, locale]);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      if (navigatingRef.current || menuOpen) return;
      const limit = scrollOffset() + 40;
      let curId = '';
      let currentIndex = chapters.findIndex(chapter => chapter.group === sectionGroup);
      outline.forEach((chapter, index) => {
        const article = document.getElementById(chapter.id);
        if (article?.getClientRects().length && article.getBoundingClientRect().top <= limit) currentIndex = index;
      });
      const c = outline[currentIndex];
      let currentGroup: number | null = null;
      document.querySelectorAll<HTMLElement>('[data-documentation-reading-group]').forEach(group => {
        const bounds = group.getBoundingClientRect();
        if (bounds.top > limit || bounds.bottom <= limit) return;
        const readingChild = [...group.querySelectorAll<HTMLElement>('article.whitepaper__chapter')]
          .some(child => child.getClientRects().length && child.getBoundingClientRect().top <= limit);
        if (!readingChild) currentGroup = Number(group.dataset.documentationReadingGroup);
      });
      setReadingGroup(currentGroup);
      const el = c ? document.getElementById(c.id) : null;
      if (c && el && el.getClientRects().length && el.getBoundingClientRect().top <= limit) {
        curId = c.id;
        c.items.forEach(item => {
          const e = document.getElementById(item.id);
          if (!e || !e.getClientRects().length) return;
          if (e.getBoundingClientRect().top <= limit) curId = item.id;
        });
      }
      setSelected(currentIndex);
      setActiveId(curId === c?.id ? '' : curId);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [outline, enhanced, menuOpen, sectionGroup]);

  function jump(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigatingRef.current = true;
    const owner = document.getElementById(resolveDocumentationId(id))?.closest('article.whitepaper__chapter');
    const index = owner ? chapters.findIndex(chapter => chapter.id === owner.id) : -1;
    if (index >= 0) {
      setSelected(index);
      setReadingGroup(null);
      setActiveId(id === owner!.id ? '' : id);
    }
    collapseIndex();
    setMenuOpen(false);
    if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
    // Let the overlay close before measuring against the compact index.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id, true)));
  }

  const activeChapter = outline[active] ?? outline[0];
  const menuActiveChapter = outline.find(chapter => chapter.id === documentationParentId(activeChapter.id)) ?? activeChapter;
  const activeItem = activeChapter?.items.find(i => i.id === activeId);

  function renderMenuChapter(item: ChapterOutline, index: number, mobile = false) {
    const current = readingGroup === null && active === index;
    const children = outline.flatMap((child, childIndex) =>
      documentationParentId(child.id) === item.id ? [{ child, childIndex }] : []);
    const childCurrent = readingGroup === null && children.some(({ childIndex }) => active === childIndex);
    const open = expandedChapters[item.id] ?? false;
    const menuItems = documentationMenuItems(item.items);
    const hasItems = menuItems.length > 0;
    const childrenId = `${mobile ? 1 : 0}-chapter-menu-${item.id}`;
    return <div key={item.id} className={`whitepaper__toc-group${current || childCurrent ? ' is-current' : ''}`}>
      <div className="whitepaper__toc-row whitepaper__chapter-menu-row">
      <DocumentationMenuItem><a href={`#${item.id}`}
        className={`whitepaper__toc-link${current && !activeItem ? ' is-active' : ''}${current || childCurrent ? ' is-chapter-current' : ''}`}
        aria-current={current && !activeItem ? 'location' : undefined}
        onClick={event => jump(event, item.id)} data-testid={`link-${item.id}`}>
        <span className="whitepaper__toc-subnum">{item.number}</span><span data-i18n="translated">{item.title}</span>
      </a></DocumentationMenuItem>
      {hasItems && <DocumentationMenuItem keepOpen><button type="button" className="whitepaper__reference-toggle whitepaper__chapter-toggle"
        data-i18n="translated" aria-expanded={open} aria-controls={childrenId}
        aria-label={`${t(open ? 'Recolher' : 'Expandir')} ${item.title}`}
        data-testid={`toggle-chapter-${item.id}`}
        onClick={() => setExpandedChapters(previous => ({ ...previous, [item.id]: !open }))}>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : undefined }}>
          <path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button></DocumentationMenuItem>}
      </div>
      {hasItems && (!mobile || open) && <div id={childrenId} className="whitepaper__chapter-menu-children" hidden={!open}>
      <ul className="whitepaper__toc-sub">
        <DocumentationOutlineItems items={menuItems} activeId={activeId}
          expanded={expandedReferences} onNavigate={jump}
          onToggle={(id, open) => setExpandedReferences(previous => ({ ...previous, [id]: open }))} />
      </ul>
      </div>}
    </div>;
  }

  function renderMenuGroups(mobile = false) {
    return documentationGroups.map((title, group) => {
      const entries = outline.map((item, index) => ({ item, index }))
        .filter(({ item, index }) => chapters[index].group === group &&
          item.id !== 'documentacao-features' && !documentationParentId(item.id));
      if (entries.length === 1) return <div key={group} className="whitepaper__menu-section">
        {renderMenuChapter(entries[0].item, entries[0].index, mobile)}
      </div>;
      if (!entries.length) return null;
      const open = expandedGroups[group] ?? false;
      const current = readingGroup === group || (readingGroup === null && chapters[active]?.group === group);
      const id = `documentation-menu-${mobile ? 1 : 0}-group-${group}`;
      return <div key={group} className="whitepaper__menu-section whitepaper__toc-category">
        <div className={`whitepaper__toc-group${current ? ' is-current' : ''}`}>
        <div className="whitepaper__toc-row whitepaper__chapter-menu-row">
        <DocumentationMenuItem><a href={`#${documentationSectionTargets[group]}`}
          className={`whitepaper__toc-link${current ? ' is-active' : ''}`}
          aria-current={current ? 'location' : undefined}
          data-testid={`documentation-group-link-${group}`}
          onClick={event => jump(event, documentationSectionTargets[group])}>
          <span className="whitepaper__toc-subnum">{group + 1}</span><span data-i18n="translated">{t(title)}</span>
        </a></DocumentationMenuItem>
        <DocumentationMenuItem keepOpen><button type="button" className="whitepaper__reference-toggle whitepaper__chapter-toggle"
          aria-expanded={open} aria-controls={id} data-testid={`documentation-group-${group}`}
          data-i18n="translated"
          aria-label={`${t(open ? 'Recolher' : 'Expandir')} ${t(title)}`}
          onClick={() => setExpandedGroups(previous => ({ ...previous, [group]: !open }))}>
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : undefined }}>
            <path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button></DocumentationMenuItem>
        </div>
        </div>
        <div id={id} hidden={!open} className="whitepaper__toc-category-children">
          {(!mobile || open) && entries.map(({ item, index }) => renderMenuChapter(item, index, mobile))}
        </div>
      </div>;
    });
  }

  function renderReadingChapter(index: number): ReactElement {
    const chapter = chapters[index];
    const children = chapters.flatMap((child, childIndex) =>
      documentationParentId(child.id) === chapter.id ? [childIndex] : []);
    return <article key={chapter.id} id={chapter.id} className="whitepaper__chapter" aria-labelledby={`title-${chapter.id}`}>
        <header className="whitepaper__chapter-head">
          <h2 id={`title-${chapter.id}`}><span className="whitepaper__heading-number">{outline[index]?.number ?? documentationChapterNumber(index)}</span>{' '}
            <span data-documentation-title>{chapter.title}</span><span className="whitepaper__title-period">.</span></h2>
          <p>{chapter.subtitle}</p>
        </header>
        <section data-documentation-reading-content data-i18n="translated" aria-label={t(chapter.title)}>
          <ChapterVisibility.Provider value={true}>
            <ChapterContent index={index} />
          </ChapterVisibility.Provider>
        </section>
        <DocumentationRelatedTopics chapterId={chapter.id} />
        {children.length > 0 && <div className="whitepaper__reading-specialists">
          {children.map(renderReadingChapter)}
        </div>}
    </article>;
  }

  function renderReadingGroups() {
    return documentationGroups.map((_, group) => {
      if (!fullDocumentation && group !== sectionGroup) return null;
      const entries = chapters.flatMap((chapter, index) =>
        chapter.group === group && chapter.id !== 'documentacao-features' && !documentationParentId(chapter.id) ? [index] : []);
      if (entries.length === 1) return renderReadingChapter(entries[0]);
      if (!entries.length) return null;
       return <section key={group} id={`documentation-reading-group-${group}`}
        className="whitepaper__reading-group" data-documentation-reading-group={group}>
         {group === 2 && <DocumentationSectionOpening group={2} />}
         {group === 3 && <section id="documentacao-features" data-documentation-opening className="whitepaper__features-opening">
             <DocumentationSectionOpening group={3} />
            <ChapterVisibility.Provider value={true}><ChapterContent index={featuresIndex} /></ChapterVisibility.Provider>
         </section>}
         <div className="whitepaper__reading-group-children">
          {entries.map(renderReadingChapter)}
        </div>
       </section>;
    });
  }

  const bar = slot && createPortal(
    <nav className="pitch-subnav" aria-label={t('Capítulos da documentação')} data-testid="documentation-section-nav">
      <div className="page-wrap">
        <div className="pitch-subnav-mobile">
          <span className="mono" data-i18n="translated">{t('Documentação')}</span>
          <DropdownMenu modal={false} open={menuOpen} onOpenChange={open => {
            if (open) {
              collapseIndex();
              window.dispatchEvent(new Event('bettex:close-public-menu'));
            }
            setMenuOpen(open);
          }}>
          <DropdownMenuTrigger asChild><button type="button" className="whitepaper__mobile-menu-trigger"
            aria-label={t('Capítulos da documentação')} aria-expanded={menuOpen}
            data-testid="documentation-section-select">
            <span data-i18n="translated">{readingGroup === null ? `${menuActiveChapter.number} ${menuActiveChapter.title}` : `${readingGroup + 1} ${t(documentationGroups[readingGroup])}`}</span>
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"
              style={{ transform: menuOpen ? 'rotate(180deg)' : undefined }}>
              <path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button></DropdownMenuTrigger>
          <DropdownMenuContent className="whitepaper__mobile-dropdown" align="end" sideOffset={6} collisionPadding={12}
            onCloseAutoFocus={event => { if (navigatingRef.current) event.preventDefault(); }}
            data-testid="documentation-section-options">
            <DocumentationMenuContext.Provider value={true}>
              {renderMenuGroups(true)}
            </DocumentationMenuContext.Provider>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>, slot);

  return (
    <>
    {bar}
    <section id="documentacao" className="whitepaper" aria-labelledby="whitepaper-title">
      <DocumentationGovernanceMarquee />
      <header className="whitepaper__hero page-wrap" hidden={!fullDocumentation && sectionGroup !== 0}>
        <div>
          <p className="whitepaper__eyebrow" data-i18n="translated"><span aria-hidden="true" /> {t('DEMO / POC · ARQUITETURA E REGRAS INICIAIS')}</p>
          <h1 id="whitepaper-title" data-i18n="translated">{documentationTitle[0]}{' '}<br /><em data-i18n="translated">{documentationTitle.slice(1).join(' ')}</em></h1>
          <p className="whitepaper__hero-lede" data-i18n="translated"><DocumentationLinkedTerms text={t('Documentação do demo e da prova de conceito. A versão ALFA será documentada após consultar a comunidade e testar a receptividade do demo.')} /></p>
          <p className="whitepaper__hero-lede" data-i18n="translated"><DocumentationLinkedTerms text={t(intelligenceCopy.hero)} /></p>
        </div>
        <div className="whitepaper__hero-note">
          <span>MERCADOS E FOCO</span>
          <p>O foco é o apostador que hoje trata a aposta como investimento.</p>
          <ul className="whitepaper__hero-markets">
            <li><strong><DocumentationLinkedTerms text={t('Esportes · Surebetting:')} /></strong>{' '}arbitragem entre odds de diferentes casas de apostas.</li>
            <li><strong><DocumentationLinkedTerms text={t('iGaming:')} /></strong>{' '}mineração de bônus e métodos de extração.</li>
            <li><strong><DocumentationLinkedTerms text={t('Predictions:')} /></strong>{' '}negociação de contratos sobre resultados de eventos.</li>
            <li><strong><DocumentationLinkedTerms text={t('Cripto:')} /></strong>{' '}trading de ativos digitais e arbitragem entre mercados.</li>
          </ul>
          <p data-i18n="translated"><DocumentationLinkedTerms text={t('A proposta da BETTEX é transformar apostadores em investidores por meio de um projeto DeFAI')} /></p>
        </div>
      </header>
      <div className="whitepaper__body page-wrap" id="documentacao-indice">
        <aside className="whitepaper__aside" aria-label="Índice da documentação">
          <div className="whitepaper__aside-inner">
            <div className="whitepaper__aside-label"><span>CAPÍTULOS</span></div>
            <nav id="whitepaper-chapter-menu" className="whitepaper__chapter-menu" aria-label="Capítulos da documentação">
              {renderMenuGroups()}
            </nav>
          </div>
        </aside>
        <div className="whitepaper__content is-accordion">
          {renderReadingGroups()}
          {!fullDocumentation && <footer className="documentation-page-footer">
            <nav className="whitepaper__chapter-pagination" aria-label={t('Capítulos da documentação')} data-testid="documentation-pagination">
              {sectionGroup > 0 ? <a href={`#${documentationSectionTargets[sectionGroup - 1]}`}
                data-testid="documentation-previous" onClick={event => jump(event, documentationSectionTargets[sectionGroup - 1])}>
                <span data-i18n="translated">← {t('Anterior')}</span>
                <strong data-i18n="translated">{t(documentationSectionTitles[sectionGroup - 1])}</strong>
              </a> : <span aria-hidden="true" />}
              {sectionGroup < documentationSectionTargets.length - 1 && <a href={`#${documentationSectionTargets[sectionGroup + 1]}`}
                data-testid="documentation-next" onClick={event => jump(event, documentationSectionTargets[sectionGroup + 1])}>
                <span data-i18n="translated">{t('Próximo capítulo')} →</span>
                <strong data-i18n="translated">{t(documentationSectionTitles[sectionGroup + 1])}</strong>
              </a>}
            </nav>
          </footer>}
        </div>
      </div>
    </section>
    </>
  );
}

export default WhitepaperSection;
