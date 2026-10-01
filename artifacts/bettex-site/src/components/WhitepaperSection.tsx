import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ChapterContent, chapters } from './WhitepaperChapters';
import './WhitepaperSection.css';

function chapterFromHash() {
  const id = window.location.hash.slice(1);
  return chapters.findIndex((chapter) => chapter.id === id);
}

export function WhitepaperSection() {
  const [selected, setSelected] = useState(() => Math.max(0, chapterFromHash()));
  const contentRef = useRef<HTMLDivElement>(null);
  const chapter = chapters[selected];
  const number = String(selected + 1).padStart(2, '0');
  const total = String(chapters.length).padStart(2, '0');

  useEffect(() => {
    const onNavigate = () => {
      if (window.location.hash === '#documentacao') {
        setSelected(0);
        requestAnimationFrame(() => document.getElementById('documentacao')?.scrollIntoView({ block: 'start' }));
        return;
      }
      const next = chapterFromHash();
      if (next < 0) return;
      setSelected(next);
      requestAnimationFrame(() => contentRef.current?.scrollIntoView({ block: 'start' }));
    };
    window.addEventListener('hashchange', onNavigate);
    window.addEventListener('popstate', onNavigate);
    if (chapterFromHash() >= 0) requestAnimationFrame(() => contentRef.current?.scrollIntoView({ block: 'start' }));
    return () => {
      window.removeEventListener('hashchange', onNavigate);
      window.removeEventListener('popstate', onNavigate);
    };
  }, []);

  function selectChapter(event: MouseEvent<HTMLAnchorElement>, index: number) {
    event.preventDefault();
    const hash = `#${chapters[index].id}`;
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    setSelected(index);
    requestAnimationFrame(() => contentRef.current?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    }));
  }

  return (
    <section id="documentacao" className="whitepaper" aria-labelledby="whitepaper-title">
      <div className="whitepaper__topline"><span>BETTEX / DOCUMENTAÇÃO TÉCNICA</span><span>UM AGENTE · {total} CAPÍTULOS</span></div>
      <header className="whitepaper__hero page-wrap">
        <div>
          <p className="whitepaper__eyebrow"><span aria-hidden="true" /> ARQUITETURA, ECONOMIA E RISCO</p>
          <h2 id="whitepaper-title">Documentação<br /><em>técnica.</em></h2>
          <p className="whitepaper__hero-lede">Uma leitura técnica do agente BETTEX em previsões, ações e cripto, esportes e cassinos, das contas em reais, da arquitetura backend, da operação e das regras econômicas.</p>
        </div>
        <div className="whitepaper__hero-note"><span>VISÃO GERAL</span><p>A BETTEX é um agente único. Estratégias e conectores por mercado operam sob o mesmo núcleo de risco; o token BETTEX e a Carteira BETTEX registram a participação e as distribuições em reais nos dias de lucro.</p></div>
      </header>
      <div className="whitepaper__body page-wrap">
        <aside className="whitepaper__aside" aria-label="Índice da documentação">
          <div className="whitepaper__aside-inner" id="documentacao-indice">
            <div className="whitepaper__aside-label"><span>CAPÍTULOS</span><span>{total} SEÇÕES</span></div>
            <nav aria-label="Capítulos da documentação">
              {chapters.map((item, index) => (
                <a key={item.id} href={`#${item.id}`} className={`whitepaper__toc-link${selected === index ? ' is-active' : ''}`}
                  aria-current={selected === index ? 'page' : undefined} onClick={(event) => selectChapter(event, index)} data-testid={`link-${item.id}`}>
                  <span className="whitepaper__toc-number">{String(index + 1).padStart(2, '0')}</span>
                  <span>{item.title}</span><span className="whitepaper__toc-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </nav>
            <p className="whitepaper__aside-foot">Apenas um capítulo por vez. Use o índice ou os links de anterior e próximo para continuar.</p>
          </div>
        </aside>
        <div className="whitepaper__content" ref={contentRef}>
          <div className="whitepaper__chapter-meta"><span>DOCUMENTAÇÃO TÉCNICA / BETTEX</span><button type="button" onClick={() => document.getElementById('documentacao-indice')?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>Ver índice ↑</button><span>{number} / {total}</span></div>
          <article id={chapter.id} key={chapter.id} className="whitepaper__chapter" aria-labelledby={`title-${chapter.id}`}>
            <header className="whitepaper__chapter-head">
              <span className="whitepaper__chapter-number">{number} <i aria-hidden="true" /> {total}</span>
              <h3 id={`title-${chapter.id}`}>{chapter.title}<span className="whitepaper__title-period">.</span></h3>
              <p>{chapter.subtitle}</p>
            </header>
            <ChapterContent index={selected} />
            <nav className="whitepaper__chapter-pagination" aria-label="Navegação entre capítulos">
              {selected > 0 ? <a href={`#${chapters[selected - 1].id}`} onClick={(event) => selectChapter(event, selected - 1)} data-testid="link-capitulo-anterior"><span>← ANTERIOR</span><strong>{chapters[selected - 1].title}</strong></a> : <span aria-hidden="true" />}
              {selected < chapters.length - 1 ? <a href={`#${chapters[selected + 1].id}`} onClick={(event) => selectChapter(event, selected + 1)} data-testid="link-proximo-capitulo"><span>PRÓXIMO →</span><strong>{chapters[selected + 1].title}</strong></a> : <a href="#documentacao" onClick={(event) => selectChapter(event, 0)} data-testid="link-voltar-documentacao"><span>VOLTAR AO INÍCIO ↑</span><strong>{chapters[0].title}</strong></a>}
            </nav>
          </article>
        </div>
      </div>
    </section>
  );
}

export default WhitepaperSection;