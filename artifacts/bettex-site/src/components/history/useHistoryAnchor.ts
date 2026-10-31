import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import type { HistoryArea } from './history-selection';

const anchors: Record<HistoryArea, string> = {
  wallets: 'wallet-statement', treasury: 'treasury-statement', rounds: 'round-history', audit: 'history-audit',
};

/** SPA navigation must wait for the selected panel and its asynchronous layout. */
export function useHistoryAnchor(area: HistoryArea, search: string) {
  const root = useRef<HTMLDivElement>(null);
  const [path] = useLocation();
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    let stopped = false, frame = 0;
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (stopped) return;
        const id = window.location.hash.slice(1) || anchors[area];
        const panel = document.getElementById(id);
        if (!panel || !container.contains(panel)) return;
        // Only one area is mounted now. Keep its selector visible on entry;
        // deep round/archive anchors still land on the requested subsection.
        const target = id === anchors[area] ? container : panel;
        const header = document.querySelector('[data-testid="app-header"]');
        const submenu = container.querySelector('[data-testid="page-submenu"]');
        const offset = Math.max(0, header?.getBoundingClientRect().bottom ?? 0) + (target === container ? 0 : submenu?.getBoundingClientRect().height ?? 0) + 12;
        window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset), behavior: 'instant' });
      });
    };
    const resize = new ResizeObserver(scroll);
    const mutations = new MutationObserver(scroll);
    resize.observe(container);
    mutations.observe(container, { childList: true, subtree: true });
    // Accommodate late archive/data responses, but never fight the visitor's input.
    const stop = () => { stopped = true; cancelAnimationFrame(frame); resize.disconnect(); mutations.disconnect(); };
    const timer = window.setTimeout(stop, 8000);
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
    events.forEach(event => window.addEventListener(event, stop, { once: true, passive: true }));
    window.addEventListener('hashchange', scroll);
    scroll();
    return () => {
      stop(); clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, stop));
      window.removeEventListener('hashchange', scroll);
    };
  }, [area, search, path]);
  return root;
}
