/** @jsxImportSource react */
import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import { useLocation, useSearch } from 'wouter';

export type SubmenuItem<T extends string = string> = { id: T; label: string };

/** Shared pill submenu: teal active pill, outlined off-white inactive pills, compact wrapping row. Labels arrive already localized. */
export function DemoSubmenu<T extends string>({ items, value, onChange, label, panelId, testIdPrefix }: {
  items: SubmenuItem<T>[]; value: T; onChange: (id: T) => void; label: string; panelId?: string; testIdPrefix?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const previousValue = useRef(value);
  useLayoutEffect(() => {
    if (previousValue.current === value) return;
    previousValue.current = value;
    // Reset after the new content is committed, before a shorter tab is painted.
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [value]);
  const select = (id: T) => {
    // Selecting the current tab should also return to its beginning.
    if (id === value) window.scrollTo({ top: 0, behavior: 'instant' });
    onChange(id);
  };
  useEffect(() => {
    const nav = bar.current;
    const active = refs.current[items.findIndex(item => item.id === value)];
    if (!nav || !active) return;
    const a = active.getBoundingClientRect(), b = nav.getBoundingClientRect();
    if (a.left < b.left) nav.scrollLeft += a.left - b.left;
    else if (a.right > b.right) nav.scrollLeft += a.right - b.right;
  }, [value, items]);
  const onKey = (e: KeyboardEvent) => {
    const n = items.length; const cur = Math.max(0, items.findIndex(i => i.id === value)); let i = cur;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = (cur + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = (cur + n - 1) % n;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = n - 1;
    else return;
    e.preventDefault(); select(items[i].id); refs.current[i]?.focus({ preventScroll: true });
  };
  return <div ref={bar} role="tablist" aria-label={label} onKeyDown={onKey} data-testid="page-submenu" data-submenu={testIdPrefix} className="demo-submenu flex min-w-0 max-w-full gap-2">
    {items.map((a, i) => <button key={a.id} ref={el => { refs.current[i] = el; }} type="button" role="tab" id={panelId ? `${panelId}-tab-${a.id}` : undefined}
      aria-selected={value === a.id} aria-controls={panelId} tabIndex={value === a.id ? 0 : -1}
      data-testid={testIdPrefix ? `${testIdPrefix}-${a.id}` : undefined} onClick={() => select(a.id)}
      className={`min-h-10 shrink-0 whitespace-nowrap rounded-xl border px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B] ${value === a.id ? 'border-[#0E7C6B] bg-[#0E7C6B] text-white' : 'border-[#E4DCCB] bg-[#FFFCF6] text-[#1B2A41] hover:bg-[#E9EEE5]'}`}>{a.label}</button>)}
  </div>;
}

/** Query-driven section state (?section=...); other parameters are kept. */
export function useSection<T extends string>(ids: readonly T[], param = 'section'): [T, (id: T) => void] {
  const search = useSearch(); const [path, navigate] = useLocation();
  const q = new URLSearchParams(search).get(param);
  const value = (ids as readonly string[]).includes(q ?? '') ? q as T : ids[0];
  const set = (id: T) => { const p = new URLSearchParams(search); p.set(param, id); navigate(`${path}?${p.toString()}${window.location.hash}`); };
  return [value, set];
}
