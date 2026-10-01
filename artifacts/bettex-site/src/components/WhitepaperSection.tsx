import { useEffect, useState, type MouseEvent } from 'react';
import { ChapterContent, chapters } from './WhitepaperChapters';
import './WhitepaperSection.css';

const OFFSET = 88;

function scrollOffset() {
  const mobileIndexHeight = window.matchMedia('(max-width: 768px)').matches
    ? document.querySelector('.whitepaper__aside')?.getBoundingClientRect().height ?? 0
    : 0;
  return OFFSET + mobileIndexHeight;
}

function prefersReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollToId(id: string, smooth: boolean) {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset();
  window.scrollTo({ top: Math.max(0, top), behavior: smooth && !prefersReduced() ? 'smooth' : 'instant' });
  return true;
}

export function WhitepaperSection() {
  const [active, setActive] = useState(0);
  const total = String(chapters.length).padStart(2, '0');

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
    if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
    scrollToId(id, true);
  }

  return (
    <section id="documentacao" className="whitepaper" aria-labelledby="whitepaper-title">
      <div className="whitepaper__topline"><span>BETTEX / DOCUMENTAÇÃO TÉCNICA</span><span>UM AGENTE · {total} CAPÍTULOS</span></div>
      <header className="whitepaper__hero page-wrap">
        <div>
          <p className="whitepaper__eyebrow"><span aria-hidden="true" /> ARQUITETURA, ECONOMIA E RISCO</p>
          <h1 id="whitepaper-title">Documentação<br /><em>técnica.</em></h1>
          <p className="whitepaper__hero-lede">Uma leitura técnica do agente BETTEX em previsões, ações e cripto, esportes e cassinos, da operação inicial 100% cripto em USDC, da arquitetura backend e das regras econômicas.</p>
        </div>
        <div className="whitepaper__hero-note"><span>VERSÃO INICIAL · 100% CRIPTO</span><p>A BETTEX é um projeto internacional. O saldo efetivo e as movimentações são em USDC; a interface mostra seu valor estimado na moeda da pessoa, como reais. O saque continua em USDC. BETTEX é o token de participação. A entrada fiat usa on-ramp externo; conversão e pagamento em moeda local pertencem à proposta futura do BETTEX Bank.</p></div>
      </header>
      <div className="whitepaper__body page-wrap" id="documentacao-indice">
        <aside className="whitepaper__aside" aria-label="Índice da documentação">
          <div className="whitepaper__aside-inner">
            <div className="whitepaper__aside-label"><span>CAPÍTULOS</span><span>{total} SEÇÕES</span></div>
            <nav aria-label="Capítulos da documentação">
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
