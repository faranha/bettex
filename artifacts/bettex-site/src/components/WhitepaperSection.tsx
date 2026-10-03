import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ChapterContent, chapters } from './WhitepaperChapters';
import { ExpandControls } from './ReadingDisclosure';
import { t } from '@/lib/i18n';
import './WhitepaperSection.css';

function scrollOffset() {
  const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 73;
  const mobileIndexHeight = window.matchMedia('(max-width: 768px)').matches
    ? document.querySelector('.whitepaper__aside')?.getBoundingClientRect().height ?? 0
    : 0;
  return headerHeight + (mobileIndexHeight ? 20 + mobileIndexHeight : 0) + 16;
}

function prefersReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollToId(id: string, smooth: boolean) {
  const el = document.getElementById(id);
  if (!el) return false;
  // Deep links retain access to requirements inside closed technical sections.
  if (el instanceof HTMLDetailsElement) el.open = true;
  for (let parent = el.parentElement; parent; parent = parent.parentElement) {
    if (parent instanceof HTMLDetailsElement) parent.open = true;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset();
  window.scrollTo({ top: Math.max(0, top), behavior: smooth && !prefersReduced() ? 'smooth' : 'instant' });
  return true;
}

export function WhitepaperSection() {
  const documentationTitle = t('Documentação técnica.').split(' ');
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const total = String(chapters.length).padStart(2, '0');

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
    // Label every data cell with its column header so tables can stack on narrow screens.
    document.querySelectorAll('.whitepaper table').forEach(table => {
      const heads = Array.from(table.querySelectorAll('thead th')).map(th => (th.textContent ?? '').replace(/\s+/g, ' ').trim());
      table.querySelectorAll('tr').forEach(tr => {
        Array.from(tr.children).forEach((cell, i) => {
          if (cell.tagName === 'TD' && heads[i]) cell.setAttribute('data-label', heads[i]);
        });
      });
    });
  }, []);

  useEffect(() => {
    const go = (smooth: boolean) => {
      const id = window.location.hash.slice(1);
      if (id) requestAnimationFrame(() => scrollToId(id, smooth));
    };
    const t1 = window.setTimeout(() => go(false), 60);
    const t2 = window.setTimeout(() => go(false), 400);
    const onHash = () => go(true);
    window.addEventListener('hashchange', onHash);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('hashchange', onHash);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      let cur = 0;
      chapters.forEach((c, i) => {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top <= scrollOffset() + 40) cur = i;
      });
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function jump(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    setMenuOpen(mobile && id === 'documentacao-indice');
    if (mobile) menuButtonRef.current?.focus({ preventScroll: true });
    if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
    scrollToId(id, true);
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
                <span className="whitepaper__mobile-index-title">{chapters[active].title}</span>
              </span>
              <span className="whitepaper__mobile-index-action">{menuOpen ? 'Fechar' : 'Explorar'}
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </button>
            <nav id="whitepaper-chapter-menu" className={`whitepaper__chapter-menu${menuOpen ? ' is-open' : ''}`} aria-label="Capítulos da documentação">
              {chapters.map((item, index) => (
                <a key={item.id} href={`#${item.id}`} className={`whitepaper__toc-link${active === index ? ' is-active' : ''}`}
                  aria-current={active === index ? 'true' : undefined} onClick={(e) => jump(e, item.id)} data-testid={`link-${item.id}`}>
                  <span className="whitepaper__toc-number">{String(index + 1).padStart(2, '0')}</span>
                  <span>{item.title}</span><span className="whitepaper__toc-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </nav>
            <p className="whitepaper__aside-foot">Todos os capítulos estão nesta página. Use o índice para saltar entre seções.</p>
          </div>
        </aside>
        <div className="whitepaper__content">
          <ExpandControls scope=".whitepaper__content" label="Expandir ou recolher toda a documentação" />
          {chapters.map((chapter, index) => {
            const number = String(index + 1).padStart(2, '0');
            return (
              <article key={chapter.id} id={chapter.id} className="whitepaper__chapter" aria-labelledby={`title-${chapter.id}`}>
                <header className="whitepaper__chapter-head">
                  <span className="whitepaper__chapter-number">{number} <i aria-hidden="true" /> {total}</span>
                  <h2 id={`title-${chapter.id}`}>{chapter.title}<span className="whitepaper__title-period">.</span></h2>
                  <p>{chapter.subtitle}</p>
                </header>
                <ChapterContent index={index} />
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
