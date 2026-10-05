/** @jsxImportSource react */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp } from 'lucide-react';

/** Click, keyboard and touch help. Never hover-only; Escape and outside tap close it. */
export function Help({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const note = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState({ left: 12, top: 12, width: 288 });
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      if (!ref.current || !note.current) return;
      const anchor = ref.current.getBoundingClientRect();
      const width = Math.min(288, document.documentElement.clientWidth - 24);
      note.current.style.width = `${width}px`;
      const height = note.current.getBoundingClientRect().height;
      const left = Math.max(12, Math.min(anchor.left, document.documentElement.clientWidth - width - 12));
      const below = anchor.bottom + 6;
      const top = Math.max(12, Math.min(below + height <= window.innerHeight - 12 ? below : anchor.top - height - 6, window.innerHeight - height - 12));
      setPosition({ left, top, width });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open, children]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const out = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node) && !note.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('keydown', key); document.addEventListener('pointerdown', out);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', out); };
  }, [open]);
  return <span ref={ref} className="relative inline-flex align-middle">
    <button type="button" aria-label={label} aria-expanded={open} aria-controls={id} aria-describedby={open ? id : undefined} title={label} onClick={() => setOpen(o => !o)} className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#5B6B85] hover:bg-[#E9EEE5] hover:text-[#0A6657] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] [@media(pointer:coarse)]:h-9 [@media(pointer:coarse)]:w-9"><CircleHelp className="h-4 w-4" aria-hidden="true" /></button>
    {open && createPortal(<span ref={note} id={id} role="note" style={{ ...position, maxHeight: 'calc(100dvh - 24px)' }} className="fixed z-[80] block overflow-y-auto rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-[#1B2A41] shadow-lg">{children}</span>, document.body)}
  </span>;
}
