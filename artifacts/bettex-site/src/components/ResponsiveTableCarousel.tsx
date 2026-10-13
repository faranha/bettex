import { useRef, useState, type ReactNode } from 'react';

/** Preserve the complete semantic table on desktop and in print; on phones,
 * compare one labelled record at a time using native swipe or buttons. */
export function ResponsiveTableCarousel({ children, count, label }: { children: ReactNode; count: number; label: string }) {
  const scroll = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const move = (next: number) => {
    const element = scroll.current;
    if (element) element.scrollTo({ left: next * element.clientWidth });
  };
  return <div className="whitepaper__table-carousel">
    <div className="whitepaper__table-nav" aria-label={label}>
      <button type="button" aria-label="Item anterior" disabled={index === 0} onClick={() => move(index - 1)}>‹</button>
      <span data-i18n="translated" aria-live="polite">{index + 1} / {count}</span>
      <button type="button" aria-label="Próximo item" disabled={index === count - 1} onClick={() => move(index + 1)}>›</button>
    </div>
    <div className="whitepaper__vesting-scroll whitepaper__table-card-scroll" role="region" aria-label={label}
      tabIndex={0} ref={scroll}
      onScroll={event => {
        const element = event.currentTarget;
        if (element.clientWidth) setIndex(Math.max(0, Math.min(count - 1, Math.round(element.scrollLeft / element.clientWidth))));
      }}>
      {children}
    </div>
  </div>;
}
