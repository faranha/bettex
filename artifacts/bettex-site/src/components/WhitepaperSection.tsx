import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { ChapterContent, chapters } from './WhitepaperChapters';
import { t, useLocale } from '@/lib/i18n';
import { collectOutline, openAncestors, outlineSignature, scrollOffset, type ChapterOutline } from './whitepaperOutline';
import './WhitepaperSection.css';

function prefersReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function WhitepaperSection() {
  const documentationTitle = t('Documentação técnica.').split(' ');
  const locale = useLocale();
  const [selected, setSelected] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const active = selected;
  const [activeId, setActiveId] = useState<string>('');
  const [outline, setOutline] = useState<ChapterOutline[]>(() => chapters.map((c, i) => ({ id: c.id, number: String(i + 1), title: t(c.title), items: [] })));
  const sigRef = useRef('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const total = String(chapters.length).padStart(2, '0');

  const scrollToId = useCallback((id: string, smooth: boolean) => {
    const el = document.getElementById(id);
    if (!el) return false;
    const owner = el.closest<HTMLElement>('article.whitepaper__chapter');
    const index = owner ? chapters.findIndex(chapter => chapter.id === owner.id) : -1;
    const switchingChapter = owner?.hidden ?? false;
    if (index >= 0) {
      // Stop an old scroll before collapsing its chapter changes the page height.
      if (switchingChapter) window.scrollTo({ top: window.scrollY, behavior: 'instant' });
      // Event/timer callbacks reveal the target before measuring its position.
      flushSync(() => { setEnhanced(true); setSelected(index); });
    }
    openAncestors(el);
    requestAnimationFrame(() => {
      const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset();
      window.scrollTo({ top: Math.max(0, top), behavior: smooth && !switchingChapter && !prefersReduced() ? 'smooth' : 'instant' });
      const focusEl = el instanceof HTMLDetailsElement ? el.querySelector<HTMLElement>('summary') ?? el : el;
      if (!focusEl.hasAttribute('tabindex') && focusEl.tagName !== 'SUMMARY') focusEl.setAttribute('tabindex', '-1');
      focusEl.focus({ preventScroll: true });
    });
    return true;
  }, []);

  useEffect(() => {
    // This reader restores hash destinations itself; native restoration competes
    // with revealing/collapsing chapters of very different lengths.
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useEffect(() => {
    const owner = document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.closest('article.whitepaper__chapter');
    const initial = owner ? chapters.findIndex(chapter => chapter.id === owner.id) : -1;
    setEnhanced(true);
    if (initial >= 0) setSelected(initial);
  }, [scrollToId]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const root = document.querySelector('.whitepaper__content');
    let timer = 0;
    const rebuild = () => {
      const next = collectOutline(chapters);
      const sig = outlineSignature(next);
      if (sig !== sigRef.current) { sigRef.current = sig; setOutline(next); }
    };
    const schedule = () => { window.clearTimeout(timer); timer = window.setTimeout(rebuild, 120); };
    rebuild();
    const obs = new MutationObserver(schedule);
    if (root) obs.observe(root, { childList: true, subtree: true, characterData: true });
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
        requestAnimationFrame(() => scrollToId('documentacao', smooth));
      }
    };
    const t1 = window.setTimeout(() => go(false), 60);
    const t2 = window.setTimeout(() => go(false), 400);
    const onHash = () => go(true);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    const onContentLink = (event: globalThis.MouseEvent) => {
      const anchor = (event.target as Element)?.closest<HTMLAnchorElement>('.whitepaper__content a[href^="#"]');
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const id = decodeURIComponent(anchor.hash.slice(1));
      if (!document.getElementById(id)) return;
      event.preventDefault();
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
  }, []);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const limit = scrollOffset() + 40;
      let curId = '';
      const c = outline[selected];
      const el = c ? document.getElementById(c.id) : null;
      if (c && el && el.getClientRects().length && el.getBoundingClientRect().top <= limit) {
        curId = c.id;
        c.items.forEach(item => {
          const e = document.getElementById(item.id);
          if (!e || !e.getClientRects().length) return;
          if (e.getBoundingClientRect().top <= limit) curId = item.id;
        });
      }
      setActiveId(curId === c?.id ? '' : curId);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [outline, selected, enhanced]);

  function jump(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const wasOpen = menuOpen;
    setMenuOpen(false);
    if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
    // Let the overlay close before measuring against the compact index.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id, true)));
    if (mobile && wasOpen && id === 'documentacao-indice') menuButtonRef.current?.focus({ preventScroll: true });
  }

  const activeChapter = outline[active] ?? outline[0];
  const activeItem = activeChapter?.items.find(i => i.id === activeId);
  const crumbs: { label: string; id: string }[] = [{ label: t('Documentação'), id: 'documentacao' }, { label: `${activeChapter.number.padStart(2, '0')} ${activeChapter.title}`, id: activeChapter.id }];
  if (activeItem) {
    const list = activeChapter.items;
    const idx = list.indexOf(activeItem);
    const chain: typeof list = [activeItem];
    for (let lvl = activeItem.level - 1, j = idx - 1; lvl >= 1 && j >= 0; j--) if (list[j].level === lvl) { chain.unshift(list[j]); lvl--; }
    chain.forEach(c => crumbs.push({ label: `${c.number} ${c.title}`, id: c.id }));
  }

  return (
    <section id="documentacao" className="whitepaper" aria-labelledby="whitepaper-title">
      <div className="whitepaper__topline"><span>BETTEX / DOCUMENTAÇÃO TÉCNICA · v1</span><span>UM AGENTE · {total} CAPÍTULOS</span></div>
      <header className="whitepaper__hero page-wrap">
        <div>
          <p className="whitepaper__eyebrow"><span aria-hidden="true" /> v1 · ARQUITETURA, ECONOMIA E RISCO</p>
          <h1 id="whitepaper-title" data-i18n="translated">{documentationTitle[0]}<br /><em data-i18n="translated">{documentationTitle.slice(1).join(' ')}</em></h1>
          <p className="whitepaper__hero-lede">A BETTEX é um fundo de investimentos descentralizado, gerido por IA, criado para ampliar o acesso de pessoas comuns a diferentes mercados e à participação nos lucros, sem precisar operar por conta própria.</p>
        </div>
        <div className="whitepaper__hero-note"><span>VERSÃO INICIAL · 100% CRIPTO</span><p>A BETTEX é um projeto internacional. O saldo efetivo e as movimentações previstos são em USDC; a interface mostra seu valor estimado na moeda fiduciária da pessoa. O saque interno continua em USDC. BETTEX é o token de participação.</p><p>A entrada em moeda fiduciária depende de um provedor externo de conversão habilitado. Conversão de saldos USDC e pagamentos em moeda fiduciária por serviços próprios da BETTEX pertencem à proposta futura do BETTEX Bank, sujeita a validação específica.</p></div>
      </header>
      <div className="whitepaper__body page-wrap" id="documentacao-indice">
        <aside className="whitepaper__aside" aria-label="Índice da documentação">
          <div className="whitepaper__aside-inner" ref={menuRef}
            onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMenuOpen(false);
            }}>
            <div className="whitepaper__aside-label"><span>CAPÍTULOS</span><span>{total} SEÇÕES</span></div>
            <button type="button" className="whitepaper__mobile-index" ref={menuButtonRef}
              aria-expanded={menuOpen} aria-controls="whitepaper-chapter-menu"
              onClick={() => setMenuOpen(open => !open)}>
              <span className="whitepaper__mobile-index-copy">
                <span className="whitepaper__mobile-index-label">CAPÍTULOS · {String(active + 1).padStart(2, '0')} / {total}</span>
                <span className="whitepaper__mobile-index-title" data-i18n="translated">{activeItem ? `${activeItem.number} ${activeItem.title}` : activeChapter.title}</span>
              </span>
              <span className="whitepaper__mobile-index-action">{menuOpen ? 'Fechar' : 'Explorar'}
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </button>
            <nav className="whitepaper__crumbs" aria-label="Localização atual">
              <ol>
                {crumbs.map((c, i) => (
                  <li key={c.id}>
                    {i === crumbs.length - 1
                      ? <span aria-current="location" data-i18n="translated">{c.label}</span>
                      : <a href={`#${c.id}`} onClick={(e) => jump(e, c.id)} data-i18n="translated">{c.label}</a>}
                  </li>
                ))}
              </ol>
            </nav>
            <nav id="whitepaper-chapter-menu" className={`whitepaper__chapter-menu${menuOpen ? ' is-open' : ''}`} aria-label="Capítulos da documentação">
              {outline.map((item, index) => {
                const current = active === index;
                return (
                  <div key={item.id} className={`whitepaper__toc-group${current ? ' is-current' : ''}`}>
                    <a href={`#${item.id}`} className={`whitepaper__toc-link${current && !activeItem ? ' is-active' : ''}${current ? ' is-chapter-current' : ''}`}
                      aria-current={current && !activeItem ? 'location' : undefined} onClick={(e) => jump(e, item.id)} data-testid={`link-${item.id}`}>
                      <span className="whitepaper__toc-number">{String(index + 1).padStart(2, '0')}</span>
                      <span data-i18n="translated">{item.title}</span><span className="whitepaper__toc-arrow" aria-hidden="true">↗</span>
                    </a>
                    {current && item.items.length > 0 && (
                      <ul className="whitepaper__toc-sub">
                        {item.items.map(sub => (
                          <li key={sub.id}>
                            <a href={`#${sub.id}`} className={`whitepaper__toc-sublink level-${sub.level}${activeId === sub.id ? ' is-active' : ''}`}
                              aria-current={activeId === sub.id ? 'location' : undefined} onClick={(e) => jump(e, sub.id)} data-testid={`link-${sub.id}`}>
                              <span className="whitepaper__toc-subnum">{sub.number}</span><span data-i18n="translated">{sub.title}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>
        <div className={`whitepaper__content${enhanced ? ' is-single' : ''}`}>
          {chapters.map((chapter, index) => {
            const number = String(index + 1).padStart(2, '0');
            return (
              <article key={chapter.id} id={chapter.id} hidden={enhanced && index !== selected} className="whitepaper__chapter" aria-labelledby={`title-${chapter.id}`}>
                <header className="whitepaper__chapter-head">
                  <span className="whitepaper__chapter-number">{number} <i aria-hidden="true" /> {total}</span>
                  <h2 id={`title-${chapter.id}`}>{chapter.title}<span className="whitepaper__title-period">.</span></h2>
                  <p>{chapter.subtitle}</p>
                </header>
                <ChapterContent index={index} />
                <nav className="whitepaper__chapter-pagination" aria-label="Capítulos da documentação">
                  {index > 0 ? (
                    <a href={`#${chapters[index - 1].id}`} rel="prev" onClick={(e) => jump(e, chapters[index - 1].id)} data-testid={`link-prev-${chapter.id}`}>
                      <span data-i18n="translated">← {t('Capítulo anterior')}</span><strong data-i18n="translated">{t(chapters[index - 1].title)}</strong>
                    </a>
                  ) : <span aria-hidden="true" />}
                  {index < chapters.length - 1 ? (
                    <a href={`#${chapters[index + 1].id}`} rel="next" onClick={(e) => jump(e, chapters[index + 1].id)} data-testid={`link-next-${chapter.id}`}>
                      <span data-i18n="translated">{t('Próximo capítulo')} →</span><strong data-i18n="translated">{t(chapters[index + 1].title)}</strong>
                    </a>
                  ) : <span aria-hidden="true" />}
                </nav>
                <a className="whitepaper__back" href="#documentacao-indice" onClick={(e) => jump(e, 'documentacao-indice')} data-testid={`link-voltar-indice-${chapter.id}`}>Voltar ao índice ↑</a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhitepaperSection;
