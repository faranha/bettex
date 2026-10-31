/** @jsxImportSource react */
import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import { useFmt } from '../alpha-trading/format';

/** Continuous, native horizontal scroll: cards retain their original click handlers. */
export function TelemetryTicker({ children }: { children: ReactNode }) {
  const { x } = useFmt();
  const viewport = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const hover = useRef(false); const focus = useRef(false); const holdUntil = useRef(0);
  const [paused, setPaused] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = viewport.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { if (media.matches) setPaused(true); };
    media.addEventListener('change', change);
    return () => { observer.disconnect(); media.removeEventListener('change', change); };
  }, []);
  useEffect(() => {
    const el = viewport.current; const group = first.current;
    if (!el || !group || paused || !visible) return;
    let period = group.getBoundingClientRect().width + 1;
    const resize = new ResizeObserver(() => { period = group.getBoundingClientRect().width + 1; });
    resize.observe(group);
    let frame = 0; let last = performance.now(); let position = el.scrollLeft;
    const tick = (time: number) => {
      const elapsed = Math.min(time - last, 64); last = time;
      if (!document.hidden && !hover.current && !focus.current && time >= holdUntil.current && period > 0) {
        position = (position + elapsed * .024) % period;
        el.scrollLeft = position;
      } else position = el.scrollLeft;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); };
  }, [paused, visible]);
  const copies = Children.toArray(children).map((child, index) => {
    if (!isValidElement(child)) return child;
    const panel = child as ReactElement<{ 'data-testid'?: string; tabIndex?: number }>;
    return cloneElement(panel, { key: `copy-${index}`, tabIndex: -1,
      'data-testid': panel.props['data-testid'] ? `${panel.props['data-testid']}-copy` : undefined });
  });
  return <section className="cg-ticker" id="central-indicators">
    <div className="cg-ticker-bar">
      <span>{x('PAINEL · AMOSTRAS ILUSTRATIVAS', 'TICKER · ILLUSTRATIVE SAMPLES', 'PANEL · MUESTRAS ILUSTRATIVAS')}</span>
      <button type="button" data-demo-local data-testid="button-hud-pause" aria-pressed={paused} onClick={() => setPaused(v => !v)}>
        {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        {paused ? x('Retomar', 'Resume', 'Reanudar') : x('Pausar', 'Pause', 'Pausar')}
      </button>
    </div>
    <div className="cg-hud" ref={viewport} data-testid="graph-hud" tabIndex={0} role="region"
      aria-label={x('Indicadores com rolagem lateral', 'Horizontally scrolling indicators', 'Indicadores con desplazamiento lateral')}
      onMouseEnter={() => { hover.current = true; }} onMouseLeave={() => { hover.current = false; }}
      onFocusCapture={() => { focus.current = true; }} onBlurCapture={e => { focus.current = e.currentTarget.contains(e.relatedTarget as Node | null); }}
      onPointerDown={() => { holdUntil.current = performance.now() + 3000; }}
      onPointerUp={() => { holdUntil.current = performance.now() + 2000; }}
      onWheel={() => { holdUntil.current = performance.now() + 2500; }}>
      <div className="cg-ticker-track">
        <div className="cg-ticker-group" ref={first}>{children}</div>
        <div className="cg-ticker-group" aria-hidden="true" onPointerDown={e => { if (e.pointerType === 'mouse') e.preventDefault(); }}>{copies}</div>
      </div>
    </div>
  </section>;
}
