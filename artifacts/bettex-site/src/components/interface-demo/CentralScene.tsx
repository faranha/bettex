/** @jsxImportSource react */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, CircleDollarSign, ClipboardList, Coins, Dices, GitCompareArrows, Hand, Landmark, Layers, Maximize2, Minimize2, Move3d, Radar, RotateCcw, RotateCw, Scale, ScrollText, ShieldAlert, Target, Trophy, Waypoints, Wallet, Workflow, ZoomIn, ZoomOut, BarChart3, ChevronUp, ChevronDown, type LucideIcon } from 'lucide-react';
import { useFmt } from '../alpha-trading/format';
import { useL } from './CentralAgents';
import { EDGES, NODES, TALL_SIZE, WIDE_SIZE, nodeOf, route, type Sel } from './central-graph-model';
import { bez, buildScene, centerOf, ctrlOf, drawScene, projectPoint, type Cam, type V3 } from './scene3d';
import { useCamera, type Mode } from './useCamera';

const ICON: Record<string, LucideIcon> = { bettex: Workflow, predictions: Radar, btc: CircleDollarSign, eth: Coins, sol: Scale, treasury: Landmark, governance: ScrollText, risk: ShieldAlert, execution: Waypoints, reconciliation: GitCompareArrows, records: ClipboardList, capital: Wallet, execrec: Layers, markets: BarChart3, s0: Trophy, s1: Target, s2: Dices };
const pos = (v: V3) => v;
/** Label-only collision pass: nearer labels keep their spot, others slide vertically (then sideways) into free space. Node coordinates are untouched. */
function placeLabels(bs: { el: HTMLElement; cx: number; top: number; wd: number; ht: number; z: number }[], w: number, h: number) {
  const done: { l: number; t: number; r: number; b: number }[] = []; const G = 3;
  const hit = (l: number, t: number, r: number, b: number) => done.some(d => l < d.r + G && r > d.l - G && t < d.b + G && b > d.t - G);
  for (const o of [...bs].sort((p, q) => q.z - p.z)) {
    // Mobile is intentionally pannable. Do not pull offscreen nodes' labels into the viewport.
    if (o.top >= h || o.top + o.ht <= 0 || o.cx + o.wd / 2 <= 0 || o.cx - o.wd / 2 >= w) {
      o.el.style.setProperty('--lx', '0px'); o.el.style.setProperty('--ly', '0px'); continue;
    }
    const baseL = o.cx - o.wd / 2, maxL = Math.max(4, w - o.wd - 4);
    const baseT = Math.max(2, Math.min(o.top, h - o.ht - 2));
    let best: { l: number; t: number } | null = null;
    for (const sx of [0, 1, -1, 2, -2]) {
      const l = Math.min(Math.max(baseL + sx * (o.wd + G), 4), maxL);
      for (let d = 0; d <= h && !best; d += 6) {
        for (const sign of [1, -1]) {
          const t = baseT + sign * d;
          if (t >= 2 && t + o.ht <= h - 2 && !hit(l, t, l + o.wd, t + o.ht)) { best = { l, t }; break; }
        }
      }
      if (best) break;
    }
    const { l, t } = best ?? { l: Math.min(Math.max(baseL, 4), maxL), t: baseT };
    done.push({ l, t, r: l + o.wd, b: t + o.ht });
    o.el.style.setProperty('--lx', `${(l - baseL).toFixed(0)}px`); o.el.style.setProperty('--ly', `${(t - o.top).toFixed(0)}px`);
  }
}

type Props = { narrow: boolean; reduced: boolean; sel: Sel | null; onSelect: (s: Sel) => void; immersive: boolean; onImmersive: () => void };

export function CentralScene({ narrow, reduced, sel, onSelect, immersive, onImmersive }: Props) {
  const { x } = useFmt(); const L = useL();
  const world = narrow ? TALL_SIZE : WIDE_SIZE;
  const scene = useMemo(() => buildScene(narrow, world), [narrow, world]);
  const [mode, setMode] = useState<Mode>(narrow ? 'pan' : 'orbit');
  useEffect(() => { setMode(narrow ? 'pan' : 'orbit'); }, [narrow]);
  const cv = useRef<HTMLCanvasElement>(null); const els = useRef<Record<string, HTMLElement | null>>({});
  const selRef = useRef(sel); selRef.current = sel;
  const sceneRef = useRef(scene); sceneRef.current = scene;

  const frame = (c: Cam, w: number, h: number, t: number) => {
    const canvas = cv.current; if (!canvas) return; const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    const ctx = canvas.getContext('2d'); if (!ctx) return; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const eff = { ...c, yaw: c.yaw + (reduced ? 0 : Math.sin(t * 0.00018) * 0.06) };
    const sc = sceneRef.current; drawScene(ctx, sc, eff, w, h, t, selRef.current, reduced);
    // Measure as a batch before changing transforms/top offsets; avoid a layout flush per node.
    const labels = new Map(NODES.map(n => {
      const label = els.current[`n-${n.id}`]?.querySelector<HTMLElement>('.cg-label');
      return [n.id, label ? { el: label, wd: label.offsetWidth, ht: label.offsetHeight } : null] as const;
    }));
    const boxes: { el: HTMLElement; cx: number; top: number; wd: number; ht: number; z: number }[] = [];
    for (const n of NODES) { const el = els.current[`n-${n.id}`]; if (!el) continue; const q = projectPoint(sc.centers[n.id], eff, w, h); const cl = sc.clusters.find(k => k.n.id === n.id)!;
      el.style.transform = `translate3d(${q.x.toFixed(1)}px,${q.y.toFixed(1)}px,0)`; el.style.setProperty('--r', `${(cl.R * q.s * eff.zoom).toFixed(0)}px`); el.style.zIndex = String(Math.round(q.s * 100)); el.style.opacity = String(Math.min(1, Math.max(0.55, 0.4 + q.s * 0.6)));
      const lb = labels.get(n.id); if (lb) boxes.push({ ...lb, cx: q.x, top: q.y + (cl.R * q.s * eff.zoom) + (n.kind === 'soon' ? 4 : 6), z: q.s }); }
    placeLabels(boxes, w, h);
    for (const e of sc.edges) { const el = els.current[`e-${e.e.id}`]; if (!el) continue; const a = sc.centers[e.e.a], b = sc.centers[e.e.b]; const m = bez(a, ctrlOf(a, b, e.lift), b, 0.5); const q = projectPoint(m, eff, w, h); el.style.transform = `translate3d(${q.x.toFixed(1)}px,${q.y.toFixed(1)}px,0)`; }
  };
  const cam = useCamera({ narrow, world, reduced, wheelAlways: immersive, mode, frame });
  const { w, h } = cam.size;
  useEffect(() => { cam.api.redraw(); }, [sel, scene]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { // bring the picked node or connection into the free part of the view
    if (!sel || !w) return; let p: V3;
    if (sel.k === 'node') p = scene.centers[sel.id]; else { const se = scene.edges.find(q => q.e.id === sel.id)!; const a = scene.centers[se.e.a], b = scene.centers[se.e.b]; p = bez(a, ctrlOf(a, b, se.lift), b, 0.5); }
    cam.api.focusOn(pos(p), narrow ? [w / 2, h * 0.2] : [Math.max(w * 0.3, (w - Math.min(660, w * 0.5)) / 2), h / 2], narrow ? 1 : 1);
  }, [sel?.id, sel?.k, narrow, w, h]); // eslint-disable-line react-hooks/exhaustive-deps

  const rt = route(sel);
  const keyAct = (fn: () => void) => ({ onClick: fn });
  const tb = 'cg-tool'; const nm = (id: string) => L(nodeOf(id).name);
  void centerOf;

  return <div className="cg-scene" ref={cam.ref} {...cam.handlers} data-testid="graph-scene" data-mode={mode} role="group" tabIndex={-1}
    aria-label={x('Cena 3D da Central de IA: arraste para girar, use os controles para mover e ampliar', 'AI Center 3D scene: drag to rotate, use the controls to move and zoom', 'Escena 3D de la Central de IA: arrastre para girar, use los controles para mover y ampliar')}>
    <canvas ref={cv} className="cg-canvas" aria-hidden="true" data-testid="graph-canvas" style={{ width: '100%', height: '100%' }} />
    {EDGES.map(e => <button key={e.id} type="button" ref={el => { els.current[`e-${e.id}`] = el; }} data-testid={`graph-edge-${e.id}`} data-focus-key={`e-${e.id}`} aria-pressed={sel?.k === 'edge' && sel.id === e.id}
      aria-label={`${x('Conexão', 'Connection', 'Conexión')}: ${nm(e.a)} → ${nm(e.b)}`} title={`${nm(e.a)} → ${nm(e.b)}`} className={`cg-edge ${e.type} ${rt.edges.has(e.id) ? 'on' : ''}`} {...keyAct(() => onSelect({ k: 'edge', id: e.id }))}><span /></button>)}
    {NODES.map(n => { const I = ICON[n.id] ?? Bot; const on = sel?.k === 'node' && sel.id === n.id; const dim = sel && !rt.nodes.has(n.id);
      if (n.kind === 'soon') return <div key={n.id} ref={el => { els.current[`n-${n.id}`] = el; }} className="cg-node soon" role="img" aria-disabled="true" data-testid={`graph-soon-${n.id}`} aria-label={`${L(n.name)}: ${L(n.sub)}`}>
        <span className="cg-label"><b>{L(n.name)}</b><i>{L(n.sub)}</i></span></div>;
      return <button key={n.id} type="button" ref={el => { els.current[`n-${n.id}`] = el; }} data-testid={`graph-node-${n.id}`} data-focus-key={`n-${n.id}`} aria-pressed={on} aria-label={`${L(n.name)}, ${L(n.sub)}`}
        className={`cg-node ${n.kind} ${on ? 'sel' : ''} ${dim ? 'dim' : ''}`} {...keyAct(() => onSelect({ k: 'node', id: n.id }))}>
        <span className="cg-orb"><I aria-hidden="true" /></span><span className="cg-label"><b>{L(n.name)}</b><i>{L(n.sub)}</i></span></button>; })}
    <div className="cg-tools" role="toolbar" aria-label={x('Controles da câmera', 'Camera controls', 'Controles de cámara')}>
      <button type="button" className={tb} data-testid="button-graph-zoom-in" aria-label={x('Aproximar', 'Zoom in', 'Acercar')} title={x('Aproximar (+)', 'Zoom in (+)', 'Acercar (+)')} onClick={() => cam.api.zoomBy(1.25)}><ZoomIn aria-hidden="true" /></button>
      <button type="button" className={tb} data-testid="button-graph-zoom-out" aria-label={x('Afastar', 'Zoom out', 'Alejar')} title={x('Afastar (-)', 'Zoom out (-)', 'Alejar (-)')} onClick={() => cam.api.zoomBy(0.8)}><ZoomOut aria-hidden="true" /></button>
      <button type="button" className={tb} data-testid="button-graph-rotate-left" aria-label={x('Girar para a esquerda', 'Orbit left', 'Girar a la izquierda')} onClick={() => cam.api.orbitBy(-0.2, 0)}><RotateCcw aria-hidden="true" /></button>
      <button type="button" className={tb} data-testid="button-graph-rotate-right" aria-label={x('Girar para a direita', 'Orbit right', 'Girar a la derecha')} onClick={() => cam.api.orbitBy(0.2, 0)}><RotateCw aria-hidden="true" /></button>
      <button type="button" className={tb} data-testid="button-graph-tilt-up" aria-label={x('Inclinar para cima', 'Tilt up', 'Inclinar hacia arriba')} onClick={() => cam.api.orbitBy(0, -0.15)}><ChevronUp aria-hidden="true" /></button>
      <button type="button" className={tb} data-testid="button-graph-tilt-down" aria-label={x('Inclinar para baixo', 'Tilt down', 'Inclinar hacia abajo')} onClick={() => cam.api.orbitBy(0, 0.15)}><ChevronDown aria-hidden="true" /></button>
      <button type="button" className={`${tb} ${mode === 'pan' ? 'act' : ''}`} data-testid="button-graph-mode" aria-pressed={mode === 'pan'} aria-label={mode === 'pan' ? x('Modo mover ativo: arrastar desloca a cena', 'Move mode active: dragging pans the scene', 'Modo mover activo: arrastrar desplaza la escena') : x('Modo girar ativo: arrastar gira a cena', 'Orbit mode active: dragging rotates the scene', 'Modo girar activo: arrastrar gira la escena')} title={mode === 'pan' ? x('Mover', 'Move', 'Mover') : x('Girar', 'Orbit', 'Girar')} onClick={() => setMode(m => m === 'pan' ? 'orbit' : 'pan')}>{mode === 'pan' ? <Hand aria-hidden="true" /> : <Move3d aria-hidden="true" />}</button>
      <button type="button" className={tb} data-testid="button-graph-reset" aria-label={x('Reiniciar vista', 'Reset view', 'Reiniciar vista')} title={x('Reiniciar vista (0)', 'Reset view (0)', 'Reiniciar vista (0)')} onClick={cam.api.reset}><span aria-hidden="true" className="cg-r0">1:1</span></button>
      <button type="button" className={tb} data-testid="button-graph-immersive" aria-pressed={immersive} aria-label={immersive ? x('Sair da tela ampla', 'Exit wide view', 'Salir de la vista amplia') : x('Tela ampla', 'Wide view', 'Vista amplia')} onClick={onImmersive}>{immersive ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}</button>
    </div>
    <p className="cg-legend" aria-hidden="true"><span className="d c" />{x('Agentes inteligentes', 'Intelligent agents', 'Agentes inteligentes')} <span className="d a" />{x('Controles, não agentes', 'Controls, not agents', 'Controles, no agentes')} <span className="d g" />{x('Registros', 'Records', 'Registros')} <span className="d w" />{x('Em breve', 'Upcoming', 'Próximamente')}</p>
  </div>;
}
