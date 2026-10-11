import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import type { P } from './central-graph-model';
import { projectPoint, type Cam, type V3 } from './scene3d';

export type Mode = 'orbit' | 'pan';
const clampZ = (z: number) => Math.min(2.8, Math.max(0.3, z));
const lim = (v: number, m: number) => Math.min(m, Math.max(-m, v));

/** Camera state lives in refs; frame() paints canvas and labels imperatively. No storage, network or data timers. */
export function useCamera(o: { narrow: boolean; world: P; reduced: boolean; wheelAlways: boolean; mode: Mode; frame: (c: Cam, w: number, h: number, t: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const sizeRef = useRef(size); const cur = useRef<Cam>({ yaw: 0, pitch: 0.1, zoom: 1, px: 0, py: 0 }); const tgt = useRef<Cam>({ ...cur.current });
  const touched = useRef(false); const moved = useRef(false); const first = useRef(true);
  const frameRef = useRef(o.frame); frameRef.current = o.frame;
  const opt = useRef(o); opt.current = o;
  const pts = useRef(new Map<number, P>()); const st = useRef({ x: 0, y: 0, d: 0, z: 1, t: { ...cur.current } });

  const redraw = useCallback(() => { const s = sizeRef.current; if (s.w) frameRef.current(cur.current, s.w, s.h, opt.current.reduced ? 0 : performance.now()); }, []);
  const commit = useCallback(() => { if (opt.current.reduced) { Object.assign(cur.current, tgt.current); redraw(); } }, [redraw]);
  const fitTarget = useCallback((): Cam => { const { w, h } = sizeRef.current; const { narrow, world } = opt.current;
    if (narrow) { const zoom = Math.min(w / (world[0] + 20), 1.15); return { yaw: 0, pitch: 0.08, zoom, px: 0, py: h >= world[1] * zoom ? 0 : 24 + (world[1] / 2) * zoom - h / 2 }; }
    return { yaw: 0.16, pitch: 0.1, zoom: Math.min(w / (world[0] + 60), h / (world[1] + 40), 1.3), px: 0, py: 0 }; }, []);
  const reset = useCallback(() => { touched.current = false; tgt.current = fitTarget(); commit(); }, [fitTarget, commit]);

  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => { const s = { w: e.contentRect.width, h: e.contentRect.height }; sizeRef.current = s; setSize(s); if (!touched.current) { tgt.current = fitTarget(); if (first.current && s.w) { first.current = false; Object.assign(cur.current, tgt.current); } } commit(); redraw(); }); ro.observe(el); return () => ro.disconnect(); }, [fitTarget, commit, redraw]);
  useEffect(() => { touched.current = false; if (sizeRef.current.w) { tgt.current = fitTarget(); Object.assign(cur.current, tgt.current); redraw(); } }, [o.narrow, fitTarget, redraw]);
  useEffect(() => {
    if (o.reduced) { Object.assign(cur.current, tgt.current); redraw(); return; }
    let raf = 0; const tick = (t: number) => { const c = cur.current, g = tgt.current; (Object.keys(g) as (keyof Cam)[]).forEach(k => { c[k] += (g[k] - c[k]) * 0.12; }); const s = sizeRef.current; if (s.w) frameRef.current(c, s.w, s.h, t); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [o.reduced, redraw]);

  const zoomBy = (f: number) => { touched.current = true; tgt.current.zoom = clampZ(tgt.current.zoom * f); commit(); };
  const orbitBy = (dy: number, dp: number) => { touched.current = true; tgt.current.yaw = lim(tgt.current.yaw + dy, 1.2); tgt.current.pitch = lim(tgt.current.pitch + dp, 0.6); commit(); };
  const panBy = (dx: number, dy: number) => { touched.current = true; tgt.current.px += dx; tgt.current.py += dy; commit(); };
  const focusOn = (p: V3, at: P, minZ: number) => { touched.current = true; const t = tgt.current; t.zoom = Math.max(t.zoom, minZ); const { w, h } = sizeRef.current; const q = projectPoint(p, { ...t, px: 0, py: 0 }, w, h); t.px = at[0] - q.x; t.py = at[1] - q.y; commit(); };

  const dist = () => { const [a, b] = [...pts.current.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]); };
  const handlers = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => { if (e.pointerType === 'mouse' && e.button !== 0) return; pts.current.set(e.pointerId, [e.clientX, e.clientY]); moved.current = false; st.current = { x: e.clientX, y: e.clientY, d: pts.current.size === 2 ? dist() : 0, z: tgt.current.zoom, t: { ...tgt.current } }; },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      if (!pts.current.has(e.pointerId)) return; pts.current.set(e.pointerId, [e.clientX, e.clientY]); touched.current = true;
      if (pts.current.size === 2) { if (!st.current.d) st.current.d = dist() || 1; moved.current = true; tgt.current.zoom = clampZ(st.current.z * dist() / st.current.d); commit(); return; }
      const dx = e.clientX - st.current.x, dy = e.clientY - st.current.y;
      if (!moved.current) { if (Math.hypot(dx, dy) < 6) return; moved.current = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ } }
      const pan = opt.current.mode === 'pan' || e.shiftKey; const t0 = st.current.t;
      if (pan) { tgt.current.px = t0.px + dx; tgt.current.py = t0.py + dy; } else { tgt.current.yaw = lim(t0.yaw + dx * 0.006, 1.2); tgt.current.pitch = lim(t0.pitch + dy * 0.005, 0.6); }
      commit();
    },
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => { pts.current.delete(e.pointerId); },
    onPointerCancel: (e: PointerEvent<HTMLDivElement>) => { pts.current.delete(e.pointerId); },
    /** A drag never counts as a node/edge click; keyboard clicks (detail 0) always pass. */
    onClickCapture: (e: MouseEvent<HTMLDivElement>) => { if (moved.current && e.detail !== 0) { e.stopPropagation(); e.preventDefault(); } moved.current = false; },
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      if (/INPUT|SELECT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return; const k = e.key; const s = e.shiftKey;
      if (k === '+' || k === '=') zoomBy(1.2); else if (k === '-') zoomBy(0.83); else if (k === '0') reset();
      else if (k === 'ArrowLeft') { if (s) panBy(60, 0); else orbitBy(-0.12, 0); } else if (k === 'ArrowRight') { if (s) panBy(-60, 0); else orbitBy(0.12, 0); }
      else if (k === 'ArrowUp') { if (s) panBy(0, 60); else orbitBy(0, -0.1); } else if (k === 'ArrowDown') { if (s) panBy(0, -60); else orbitBy(0, 0.1); } else return;
      e.preventDefault();
    },
  };
  useEffect(() => { const el = ref.current; if (!el) return; const h = (e: WheelEvent) => { if (!(e.ctrlKey || e.metaKey || opt.current.wheelAlways)) return; e.preventDefault(); touched.current = true; tgt.current.zoom = clampZ(tgt.current.zoom * Math.exp(-e.deltaY * 0.0012)); commit(); }; el.addEventListener('wheel', h, { passive: false }); return () => el.removeEventListener('wheel', h); }, [commit]);
  return { ref, size, handlers, api: { zoomBy, orbitBy, panBy, reset, focusOn, redraw } };
}
