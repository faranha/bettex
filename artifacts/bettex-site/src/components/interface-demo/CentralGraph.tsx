/** @jsxImportSource react */
import { useEffect, useRef, useState } from 'react';
import { useFmt } from '../alpha-trading/format';
import { CentralInspector } from './CentralInspector';
import { CentralScene } from './CentralScene';
import { SceneTitle, TelemetryStrip, TopRail } from './CentralHud';
import type { Sel } from './central-graph-model';
import './central-graph.css';

const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches;
function useMedia(q: string) {
  const [m, setM] = useState(() => mq(q));
  useEffect(() => { const l = window.matchMedia(q); const h = () => setM(l.matches); h(); l.addEventListener('change', h); return () => l.removeEventListener('change', h); }, [q]);
  return m;
}

/** The AI Center IS this scene: 3D constellation, in-scene inspector and telemetry strip. Local sample data only. */
export function CentralGraph({ onAction }: { onAction: () => void }) {
  const { x } = useFmt();
  const narrow = useMedia('(max-width: 768px)'); const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const [sel, setSel] = useState<Sel | null>(null); const [imm, setImm] = useState(false);
  const head = useRef<HTMLHeadingElement>(null); const back = useRef<HTMLElement | null>(null);
  const pick = (s: Sel) => { const a = document.activeElement; if (!back.current || !back.current.isConnected || !sel) back.current = a instanceof HTMLElement ? a : null; setSel(s); };
  const close = () => { setSel(null); const b = back.current; back.current = null; if (b && b.isConnected) b.focus(); };
  useEffect(() => { if (sel) head.current?.focus({ preventScroll: true }); }, [sel?.k, sel?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className={`cg-stage ${imm ? "cg-imm" : ""} ${sel ? "cg-open" : ""}`} data-testid="central-graph" onKeyDown={e => { if (e.key !== 'Escape') return; if (sel) { e.stopPropagation(); close(); } else if (imm) setImm(false); }}
    aria-label={x('Central da IA BETTEX: cena interativa', 'BETTEX AI Center: interactive scene', 'Central de IA BETTEX: escena interactiva')}>
    <TopRail sel={sel} onPick={pick} />
    <div className="cg-main">
      <CentralScene narrow={narrow} reduced={reduced} sel={sel} onSelect={pick} immersive={imm} onImmersive={() => setImm(v => !v)} />
      <SceneTitle sel={sel} />
      {sel && <CentralInspector key={`${sel.k}:${sel.id}`} sel={sel} onClose={close} onAction={onAction} headRef={head} onPick={pick} />}
    </div>
    <TelemetryStrip onPick={pick} />
  </div>;
}
