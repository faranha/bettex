/** @jsxImportSource react */
import { useEffect, useRef, type ReactNode } from 'react';

/** Native expandable section: content stays mounted so anchors, filters and tests keep working. */
export function DemoFold({ id, title, hint, children, open }: { id: string; title: string; hint?: string; children: ReactNode; open?: boolean }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const reveal = () => {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target && ref.current?.contains(target)) {
        ref.current.open = true;
        for (let parent = target.parentElement; parent && ref.current.contains(parent); parent = parent.parentElement) {
          if (parent instanceof HTMLDetailsElement) parent.open = true;
        }
        requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
      }
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => window.removeEventListener('hashchange', reveal);
  }, []);
  return <details ref={ref} open={open} className="dcard group min-w-0 overflow-hidden" data-testid={`fold-${id}`}>
    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] sm:px-5 [&::-webkit-details-marker]:hidden">
      <span className="grid min-w-0 gap-0.5"><span className="display text-base font-extrabold">{title}</span>{hint && <span className="text-xs text-[#5B6B85]">{hint}</span>}</span>
      <span aria-hidden className="shrink-0 text-lg font-bold text-[#0E7C6B] transition-transform group-open:rotate-45">+</span>
    </summary>
    <div className="grid min-w-0 gap-4 border-t border-[#E4DCCB] p-3 sm:p-4">{children}</div>
  </details>;
}
