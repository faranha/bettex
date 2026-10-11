/** @jsxImportSource react */
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFmt } from '../alpha-trading/format';
import { CentralInspector } from './CentralInspector';
import { CentralScene } from './CentralScene';
import { PolymarketSimulation } from './PolymarketSimulation';
import { SceneTitle, TelemetryStrip, TopRail } from './CentralHud';
import { SupportNav } from './CentralSupport';
import { isGraphSelection, parseSel, rememberSel, selQuery, type Sel } from './central-graph-model';
import './central-graph.css';

const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;
function useMedia(q: string) {
  const [m, setM] = useState(() => mq(q));
  useEffect(() => { const l = window.matchMedia(q); const h = () => setM(l.matches); h(); l.addEventListener('change', h); return () => l.removeEventListener('change', h); }, [q]);
  return m;
}
const same = (a: Sel | null, b: Sel | null) => a?.k === b?.k && a?.id === b?.id;
const urlFor = (sel: Sel | null) => {
  const q = new URLSearchParams(window.location.search); q.delete('node'); q.delete('edge');
  if (sel) q.set(sel.k, sel.id);
  const s = q.toString(); return `${window.location.pathname}${s ? `?${s}` : ''}${window.location.hash}`;
};

/** The AI Center IS this scene: 3D constellation, in-scene inspector and telemetry strip. Local sample data only.
 *  Selection lives in the URL (?node= or ?edge=), so deep links, back/forward and language switches keep it. */
export function CentralGraph({ onAction }: { onAction: () => void }) {
  const { x } = useFmt();
  const narrow = useMedia('(max-width: 768px)'); const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const [sel, setSel] = useState<Sel | null>(() => (typeof window === 'undefined' ? null : parseSel(window.location.search)));
  const [imm, setImm] = useState(false);
  const head = useRef<HTMLHeadingElement>(null); const back = useRef<HTMLElement | null>(null);
  const gsel = sel && isGraphSelection(sel) ? sel : null; const ssel = sel && !gsel ? sel : null;
  const selRef = useRef(sel); selRef.current = sel;
  const home = useRef(typeof window === 'undefined' ? '' : window.location.pathname);

  const commit = useCallback((s: Sel | null) => {
    if (s && !parseSel(`?${selQuery(s)}`)) return;
    if (same(selRef.current, s)) return;
    selRef.current = s; setSel(s); rememberSel(s);
    const next = urlFor(s);
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.pushState(window.history.state, '', next);
  }, []);
  const pick = (s: Sel) => { const a = document.activeElement; if (!back.current || !back.current.isConnected || !selRef.current) back.current = a instanceof HTMLElement ? a : null; commit(s); };
  const close = () => { commit(null); const b = back.current; back.current = null; if (b && b.isConnected) b.focus(); };

  useEffect(() => { rememberSel(selRef.current); }, []);
  useEffect(() => {
    const sync = (ev: Event) => {
      if (window.location.pathname !== home.current) return;
      const p = parseSel(window.location.search);
      if (ev.type === 'popstate') { selRef.current = p; setSel(p); rememberSel(p); return; }
      if (p) { if (!same(selRef.current, p)) { selRef.current = p; setSel(p); rememberSel(p); } return; }
      // A language switch or route helper rewrote the URL without our parameter: keep the reading position.
      if (selRef.current) window.history.replaceState(window.history.state, '', urlFor(selRef.current));
    };
    const types = ['popstate', 'pushState', 'replaceState'];
    types.forEach(t => window.addEventListener(t, sync));
    return () => types.forEach(t => window.removeEventListener(t, sync));
  }, []);
  useEffect(() => {
    if (!sel) return;
    head.current?.focus({ preventScroll: true });
    // Supporting panels are outside the scene; reveal the selected content rather than leaving it below the fold.
    if (!isGraphSelection(sel)) head.current?.closest('[data-testid="support-workspace"]')?.scrollIntoView({ block: 'start' });
  }, [sel?.k, sel?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const esc = (e: React.KeyboardEvent) => { if (e.key === 'Escape' && sel) { e.stopPropagation(); close(); } };
  return <div className="cg-wrap">
    <div className={`cg-stage ${imm ? "cg-imm" : ""} ${gsel ? "cg-open" : ""}`} data-testid="central-graph" onKeyDown={e => { if (e.key !== 'Escape') return; if (gsel) { e.stopPropagation(); close(); } else if (imm) setImm(false); }}
      aria-label={x('Central da IA BETTEX: cena interativa de agentes', 'BETTEX AI Center: interactive agent scene', 'Central de IA BETTEX: escena interactiva de agentes')}>
      <TopRail sel={gsel} onPick={pick} />
      <SceneTitle sel={gsel} />
      <div className="cg-main">
        <CentralScene narrow={narrow} reduced={reduced} sel={gsel} onSelect={pick} immersive={imm} onImmersive={() => setImm(v => !v)} />
        {gsel && <CentralInspector key={`${gsel.k}:${gsel.id}`} sel={gsel} onClose={close} onAction={onAction} headRef={head} onPick={pick} />}
      </div>
    </div>
    <PolymarketSimulation />
    <section className="cg-support" data-testid="central-support" onKeyDown={esc} aria-label={x('Apoio fora do grafo: controles, registros, capital e tópicos', 'Support outside the graph: controls, records, capital and topics', 'Apoyo fuera del grafo: controles, registros, capital y temas')}>
      <SupportNav sel={ssel} onPick={pick} />
      <TelemetryStrip onPick={pick} />
      {ssel && <div className="cg-sw" data-testid="support-workspace"><CentralInspector key={`${ssel.k}:${ssel.id}`} sel={ssel} onClose={close} onAction={onAction} headRef={head} onPick={pick} /></div>}
    </section>
  </div>;
}
