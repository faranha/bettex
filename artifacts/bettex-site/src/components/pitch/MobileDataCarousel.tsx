/** @jsxImportSource react */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useX } from '@/components/demo/ui';
import './MobileDataCarousel.css';

export function MobileDataCarousel({ children, className, labels, id }: {
  children: ReactNode; className: string; labels: [string, string, string]; id?: string;
}) {
  const { x } = useX();
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [total, setTotal] = useState(0);
  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const cards = Array.from(el.children);
    setTotal(cards.length);
    const left = el.getBoundingClientRect().left;
    let nearest = 0, distance = Infinity;
    cards.forEach((card, i) => {
      const delta = Math.abs(card.getBoundingClientRect().left - left);
      if (delta < distance) { distance = delta; nearest = i; }
    });
    if (el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) nearest = cards.length - 1;
    setActive(nearest);
  }, []);
  useEffect(() => {
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [sync]);
  const go = (index: number) => {
    const el = track.current;
    const card = el?.children[Math.max(0, Math.min(total - 1, index))];
    if (!el || !card) return;
    el.scrollTo({
      left: el.scrollLeft + card.getBoundingClientRect().left - el.getBoundingClientRect().left,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };
  return <div className="mobile-data-carousel" id={id}>
    <div className={`${className} mobile-data-carousel__track`} ref={track} onScroll={sync}
      role="region" aria-label={x(...labels)} tabIndex={0}
      onKeyDown={event => {
        if (event.target !== event.currentTarget || !window.matchMedia('(max-width: 767px)').matches) return;
        if (event.key === 'ArrowRight') { event.preventDefault(); go(active + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); go(active - 1); }
      }}>
      {children}
    </div>
    {total > 0 && <div className="mobile-data-carousel__controls">
      <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label={x('Dado anterior', 'Previous data card', 'Dato anterior')}><ChevronLeft aria-hidden="true" /></button>
      <div className="mobile-data-carousel__position">
        <span className="mono" aria-live="polite">{active + 1} / {total}</span>
        <div className="mobile-data-carousel__dots">{Array.from({ length: total }, (_, i) => <button type="button" key={i} onClick={() => go(i)} aria-label={`${x('Ir para o dado', 'Go to data card', 'Ir al dato')} ${i + 1}`} aria-current={i === active ? 'true' : undefined}><span /></button>)}</div>
      </div>
      <button type="button" onClick={() => go(active + 1)} disabled={active === total - 1} aria-label={x('Próximo dado', 'Next data card', 'Siguiente dato')}><ChevronRight aria-hidden="true" /></button>
    </div>}
  </div>;
}
