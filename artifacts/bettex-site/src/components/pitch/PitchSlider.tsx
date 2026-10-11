/** @jsxImportSource react */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useX } from '@/components/demo/ui';
import './PitchSlider.css';

/** Lets inner data carousels render flat when they already live inside a slider (no nested carousels). */
export const PitchSliderContext = createContext(false);
export const useInsidePitchSlider = () => useContext(PitchSliderContext);

export type PitchSlide = { label: [string, string, string]; node: ReactNode };

export function PitchSlider({ id, label, slides, tone = 'light' }: {
  id: string; label: [string, string, string]; slides: PitchSlide[]; tone?: 'light' | 'dark';
}) {
  const { x } = useX();
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const total = slides.length;
  const go = useCallback((i: number, scrollToStart = false) => {
    root.current?.querySelectorAll('iframe').forEach(frame => {
      const origin = new URL(frame.src).origin;
      if (origin === 'https://www.youtube-nocookie.com' || origin === 'https://www.youtube.com') {
        frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), origin);
      }
    });
    setActive(Math.max(0, Math.min(total - 1, i)));
    if (scrollToStart) requestAnimationFrame(() => root.current?.scrollIntoView({
      block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    }));
  }, [total]);

  useEffect(() => {
    const tabs = root.current?.querySelector<HTMLElement>('.pitch-slider__tabs');
    const button = tabs?.querySelector<HTMLElement>('[aria-current="true"]');
    if (tabs && button) {
      const bounds = tabs.getBoundingClientRect();
      const rect = button.getBoundingClientRect();
      if (rect.left < bounds.left || rect.right > bounds.right)
        tabs.scrollTo({ left: tabs.scrollLeft + rect.left - bounds.left, behavior: 'instant' });
    }
  }, [active]);

  // Hash anchors that point inside a hidden slide open that slide first.
  useEffect(() => {
    const reveal = () => {
      const target = document.getElementById(window.location.hash.slice(1));
      const panel = target && root.current?.contains(target) ? target.closest<HTMLElement>('[data-slide-index]') : null;
      if (panel && panel.closest('.pitch-slider') === root.current) {
        setActive(Number(panel.dataset.slideIndex));
        requestAnimationFrame(() => target?.scrollIntoView({ block: 'start', behavior: 'instant' }));
      }
    };
    const onClick = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
      if (a) setTimeout(reveal, 0);
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    document.addEventListener('click', onClick);
    return () => { window.removeEventListener('hashchange', reveal); document.removeEventListener('click', onClick); };
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest('iframe, input, textarea, select') ) return;
    if (el !== e.currentTarget && !el.closest('.pitch-slider__nav, .pitch-slider__foot')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(total - 1); }
  };

  const prev = x('Anterior', 'Previous', 'Anterior');
  const next = x('Próximo', 'Next', 'Siguiente');
  return <PitchSliderContext.Provider value={true}>
    <div ref={root} id={id} className={`pitch-slider pitch-slider--${tone}`} role="region" aria-roledescription={x('Carrossel', 'Carousel', 'Carrusel')} aria-label={x(...label)} tabIndex={0} onKeyDown={onKey}>
      <div className="pitch-slider__nav">
        <ol className="pitch-slider__tabs" aria-label={x('Blocos de conteúdo', 'Content blocks', 'Bloques de contenido')}>
          {slides.map((s, i) => <li key={i}><button type="button" className="pitch-slider__tab" aria-current={i === active ? 'true' : undefined} onClick={() => go(i)}>
            <span className="mono pitch-slider__n">{String(i + 1).padStart(2, '0')}</span><span className="pitch-slider__t">{x(...s.label)}</span>
          </button></li>)}
        </ol>
        <div className="pitch-slider__ctrl">
          <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label={prev}><ChevronLeft aria-hidden="true" /></button>
          <span className="mono pitch-slider__pos" aria-live="polite">{active + 1} / {total}</span>
          <button type="button" onClick={() => go(active + 1)} disabled={active === total - 1} aria-label={next}><ChevronRight aria-hidden="true" /></button>
        </div>
      </div>
      <div className="pitch-slider__bar" aria-hidden="true"><span style={{ transform: `scaleX(${(active + 1) / total})` }} /></div>
      <div className="pitch-slider__stage"
        onTouchStart={e => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; }}
        onTouchEnd={e => {
          const s = touch.current; touch.current = null; if (!s) return;
          const t = e.changedTouches[0]; const dx = t.clientX - s.x, dy = t.clientY - s.y;
          if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.5) go(active + (dx < 0 ? 1 : -1));
        }}>
        {slides.map((s, i) => <div key={i} className="pitch-slider__panel" data-slide-index={i} hidden={i !== active} role="group" aria-roledescription={x('Slide', 'Slide', 'Diapositiva')} aria-label={`${i + 1} / ${total} · ${x(...s.label)}`}>{s.node}</div>)}
      </div>
      <div className="pitch-slider__foot">
        <button type="button" onClick={() => go(active - 1, true)} disabled={active === 0}><ChevronLeft aria-hidden="true" />{prev}</button>
        <span className="mono">{active + 1} / {total}</span>
        <button type="button" onClick={() => go(active + 1, true)} disabled={active === total - 1}>{next}<ChevronRight aria-hidden="true" /></button>
      </div>
    </div>
  </PitchSliderContext.Provider>;
}
