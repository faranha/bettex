/** @jsxImportSource react */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Bot, CircleDollarSign, ClipboardList, Coins, Dices, GitCompareArrows, Hand, Landmark, Layers, Maximize2, Minimize2, Move3d, Radar, RotateCcw, RotateCw, Scale, ScrollText, ShieldAlert, Target, Trophy, Waypoints, Wallet, Workflow, ZoomIn, ZoomOut, BarChart3, Users, Gem, Flame, Percent, HandCoins, Ticket, History, LayoutDashboard, Milestone, SlidersHorizontal, ChevronUp, ChevronDown, type LucideIcon } from 'lucide-react';
import { useGetDemoPolymarket } from '@workspace/api-client-react';
import { useFmt } from '../alpha-trading/format';
import { useL } from './CentralAgents';
import { GRAPH_EDGES as EDGES, GRAPH_NODES as NODES, edgeText, nodeOf, graphRoute as route, type Sel, type P } from './central-graph-model';
import { bez, buildScene, centerOf, ctrlOf, drawScene, projectPoint, type Cam, type V3 } from './scene3d';
import { useCamera, type Mode } from './useCamera';

const ICON: Record<string, LucideIcon> = { bettex: Workflow, predictions: Radar, btc: CircleDollarSign, eth: Coins, sol: Scale, treasury: Landmark, governance: ScrollText, risk: ShieldAlert, execution: Waypoints, reconciliation: GitCompareArrows, records: ClipboardList, capital: Wallet, execrec: Layers, markets: BarChart3, s0: Trophy, s1: Target, s2: Dices, community: Users, tokenomics: Gem, participation: HandCoins, settlement: Percent, buyback: Coins, burn: Flame, history: History, dashboard: LayoutDashboard, roadmap: Milestone, games: Ticket };
const pos = (v: V3) => v;
/** Label-only collision pass: nearer labels keep their spot, others slide vertically (then sideways) into free space. Node coordinates are untouched. */
function placeLabels(bs: { el: HTMLElement; cx: number; top: number; wd: number; ht: number; z: number }[], w: number, h: number, obstacles: { l: number; t: number; r: number; b: number }[]) {
  const done = [...obstacles]; const G = 3;
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
  const { x, loc } = useFmt(); const L = useL();
  const quotes = useGetDemoPolymarket({ locale: loc }, { query: { staleTime: 60000, refetchInterval: 60000, retry: 1 } });
  const world = useMemo<P>(() => narrow ? [420, 880] : [1560, 1060], [narrow]);
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
    const obstacles = NODES.filter(n => n.kind !== 'soon').map(n => {
      const q = projectPoint(sc.centers[n.id], eff, w, h);
      return { l: q.x - 24, t: q.y - 24, r: q.x + 24, b: q.y + 24 };
    }).filter(b => b.r > 0 && b.l < w && b.b > 0 && b.t < h);
    placeLabels(boxes, w, h, obstacles);
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

  const [dockOpen, setDockOpen] = useState(false); const dockId = useId(); const toggleRef = useRef<HTMLButtonElement>(null);
  const rt = route(sel);
  const keyAct = (fn: () => void) => ({ onClick: fn });
  const tb = 'cg-tool'; const tool = { 'data-demo-local': '' }; const nm = (id: string) => L(nodeOf(id).name);
  void centerOf;

  const cmds = <>
      <button type="button" {...tool} className={tb} data-testid="button-graph-zoom-in" aria-label={x('Aproximar', 'Zoom in', 'Acercar')} title={x('Aproximar (+)', 'Zoom in (+)', 'Acercar (+)')} onClick={() => cam.api.zoomBy(1.25)}><ZoomIn aria-hidden="true" /></button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-zoom-out" aria-label={x('Afastar', 'Zoom out', 'Alejar')} title={x('Afastar (-)', 'Zoom out (-)', 'Alejar (-)')} onClick={() => cam.api.zoomBy(0.8)}><ZoomOut aria-hidden="true" /></button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-rotate-left" aria-label={x('Girar para a esquerda', 'Orbit left', 'Girar a la izquierda')} onClick={() => cam.api.orbitBy(-0.2, 0)}><RotateCcw aria-hidden="true" /></button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-rotate-right" aria-label={x('Girar para a direita', 'Orbit right', 'Girar a la derecha')} onClick={() => cam.api.orbitBy(0.2, 0)}><RotateCw aria-hidden="true" /></button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-tilt-up" aria-label={x('Inclinar para cima', 'Tilt up', 'Inclinar hacia arriba')} onClick={() => cam.api.orbitBy(0, -0.15)}><ChevronUp aria-hidden="true" /></button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-tilt-down" aria-label={x('Inclinar para baixo', 'Tilt down', 'Inclinar hacia abajo')} onClick={() => cam.api.orbitBy(0, 0.15)}><ChevronDown aria-hidden="true" /></button>
      <button type="button" {...tool} className={`${tb} ${mode === 'pan' ? 'act' : ''}`} data-testid="button-graph-mode" aria-pressed={mode === 'pan'} aria-label={mode === 'pan' ? x('Modo mover ativo: arrastar desloca a cena', 'Move mode active: dragging pans the scene', 'Modo mover activo: arrastrar desplaza la escena') : x('Modo girar ativo: arrastar gira a cena', 'Orbit mode active: dragging rotates the scene', 'Modo girar activo: arrastrar gira la escena')} title={mode === 'pan' ? x('Mover', 'Move', 'Mover') : x('Girar', 'Orbit', 'Girar')} onClick={() => setMode(m => m === 'pan' ? 'orbit' : 'pan')}>{mode === 'pan' ? <Hand aria-hidden="true" /> : <Move3d aria-hidden="true" />}</button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-reset" aria-label={x('Reiniciar vista', 'Reset view', 'Reiniciar vista')} title={x('Reiniciar vista (0)', 'Reset view (0)', 'Reiniciar vista (0)')} onClick={cam.api.reset}><span aria-hidden="true" className="cg-r0">1:1</span></button>
</>;
  const immBtn = <button type="button" {...tool} className={tb} data-testid="button-graph-immersive" aria-pressed={immersive} aria-label={immersive ? x('Sair da tela ampla', 'Exit wide view', 'Salir de la vista amplia') : x('Tela ampla', 'Wide view', 'Vista amplia')} onClick={onImmersive}>{immersive ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}</button>
  return <div className="cg-shell"><div className="cg-scene" ref={cam.ref} {...cam.handlers} data-testid="graph-scene" data-mode={mode} role="group" tabIndex={-1}
    aria-label={x('Cena 3D da Central de IA: arraste para girar, use os controles para mover e ampliar', 'AI Center 3D scene: drag to rotate, use the controls to move and zoom', 'Escena 3D de la Central de IA: arrastre para girar, use los controles para mover y ampliar')}>
    <canvas ref={cv} className="cg-canvas" aria-hidden="true" data-testid="graph-canvas" style={{ width: '100%', height: '100%' }} />
    {EDGES.map(e => <button key={e.id} type="button" disabled={e.planned} ref={el => { els.current[`e-${e.id}`] = el; }} data-testid={`graph-edge-${e.id}`} data-focus-key={`e-${e.id}`} aria-pressed={sel?.k === 'edge' && sel.id === e.id}
      data-demo-local aria-label={`${e.planned ? x('Conexão planejada', 'Planned connection', 'Conexión planificada') : x('Conexão', 'Connection', 'Conexión')}: ${nm(e.a)} → ${nm(e.b)}. ${L(edgeText(e).label)}`} title={`${nm(e.a)} → ${nm(e.b)}: ${L(edgeText(e).label)}`} className={`cg-edge ${e.type} ${e.planned ? 'planned' : ''} ${e.biz ? 'biz' : ''} ${rt.edges.has(e.id) ? 'on' : ''}`} {...keyAct(() => onSelect({ k: 'edge', id: e.id }))}><span /></button>)}
    {NODES.map(n => { const I = ICON[n.id] ?? Bot; const on = sel?.k === 'node' && sel.id === n.id; const dim = sel && !rt.nodes.has(n.id); const quote = n.kind === 'spec' ? quotes.data?.markets.find(m => m.asset === n.id.toUpperCase()) : undefined;
      if (n.kind === 'soon') return <div key={n.id} ref={el => { els.current[`n-${n.id}`] = el; }} className="cg-node soon" role="img" aria-disabled="true" data-testid={`graph-soon-${n.id}`} aria-label={`${L(n.name)}: ${L(n.sub)}`}>
        <span className="cg-label"><b>{L(n.name)}</b><i>{L(n.sub)}</i></span></div>;
      return <button key={n.id} type="button" ref={el => { els.current[`n-${n.id}`] = el; }} data-demo-local data-testid={`graph-node-${n.id}`} data-focus-key={`n-${n.id}`} aria-pressed={on} aria-label={`${L(n.name)}, ${L(n.sub)}`}
        className={`cg-node ${n.kind} ${n.group ?? ''} ${on ? 'sel' : ''} ${dim ? 'dim' : ''}`} {...keyAct(() => onSelect({ k: 'node', id: n.id }))}>
        <span className="cg-orb"><I aria-hidden="true" /></span><span className="cg-label"><b>{L(n.name)}</b><i>{L(n.sub)}</i>{n.kind === 'spec' && <small className="cg-public-price">{x('Polymarket', 'Polymarket', 'Polymarket')} · {quote ? `${(quote.yesPrice * 100).toLocaleString(loc, { maximumFractionDigits: 1 })}¢` : x('Sem cotação', 'No quote', 'Sin cotización')}</small>}</span></button>; })}
    {!narrow && <div className="cg-tools" role="toolbar" aria-label={x('Controles da câmera', 'Camera controls', 'Controles de cámara')}>
      <button type="button" {...tool} className={tb} data-testid="button-graph-zoom-in" aria-label={x('Aproximar', 'Zoom in', 'Acercar')} title={x('Aproximar (+)', 'Zoom in (+)', 'Acercar (+)')} onClick={() => cam.api.zoomBy(1.25)}><ZoomIn aria-hidden="true" /></button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-zoom-out" aria-label={x('Afastar', 'Zoom out', 'Alejar')} title={x('Afastar (-)', 'Zoom out (-)', 'Alejar (-)')} onClick={() => cam.api.zoomBy(0.8)}><ZoomOut aria-hidden="true" /></button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-rotate-left" aria-label={x('Girar para a esquerda', 'Orbit left', 'Girar a la izquierda')} onClick={() => cam.api.orbitBy(-0.2, 0)}><RotateCcw aria-hidden="true" /></button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-rotate-right" aria-label={x('Girar para a direita', 'Orbit right', 'Girar a la derecha')} onClick={() => cam.api.orbitBy(0.2, 0)}><RotateCw aria-hidden="true" /></button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-tilt-up" aria-label={x('Inclinar para cima', 'Tilt up', 'Inclinar hacia arriba')} onClick={() => cam.api.orbitBy(0, -0.15)}><ChevronUp aria-hidden="true" /></button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-tilt-down" aria-label={x('Inclinar para baixo', 'Tilt down', 'Inclinar hacia abajo')} onClick={() => cam.api.orbitBy(0, 0.15)}><ChevronDown aria-hidden="true" /></button>
      <button type="button" {...tool} className={`${tb} ${mode === 'pan' ? 'act' : ''}`} data-testid="button-graph-mode" aria-pressed={mode === 'pan'} aria-label={mode === 'pan' ? x('Modo mover ativo: arrastar desloca a cena', 'Move mode active: dragging pans the scene', 'Modo mover activo: arrastrar desplaza la escena') : x('Modo girar ativo: arrastar gira a cena', 'Orbit mode active: dragging rotates the scene', 'Modo girar activo: arrastrar gira la escena')} title={mode === 'pan' ? x('Mover', 'Move', 'Mover') : x('Girar', 'Orbit', 'Girar')} onClick={() => setMode(m => m === 'pan' ? 'orbit' : 'pan')}>{mode === 'pan' ? <Hand aria-hidden="true" /> : <Move3d aria-hidden="true" />}</button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-reset" aria-label={x('Reiniciar vista', 'Reset view', 'Reiniciar vista')} title={x('Reiniciar vista (0)', 'Reset view (0)', 'Reiniciar vista (0)')} onClick={cam.api.reset}><span aria-hidden="true" className="cg-r0">1:1</span></button>
      <button type="button" {...tool} className={tb} data-testid="button-graph-immersive" aria-pressed={immersive} aria-label={immersive ? x('Sair da tela ampla', 'Exit wide view', 'Salir de la vista amplia') : x('Tela ampla', 'Wide view', 'Vista amplia')} onClick={onImmersive}>{immersive ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}</button>
    </div>}
    <p className="cg-legend" aria-hidden="true"><span className="d c" />{x('Agentes inteligentes', 'Intelligent agents', 'Agentes inteligentes')} <span className="d w" />{x('Em breve, ligado por linha tracejada', 'Upcoming, dashed link', 'Próximamente, enlace discontinuo')}</p>
    </div>
    {narrow && <div className="cg-dock" data-demo-local onKeyDown={e => { if (e.key === 'Escape' && dockOpen) { e.stopPropagation(); setDockOpen(false); toggleRef.current?.focus(); } }}>
      <div className="cg-dock-bar">
        <button ref={toggleRef} type="button" data-demo-local className="cg-dock-toggle" data-testid="button-graph-controls-toggle" aria-expanded={dockOpen} aria-controls={dockId} onClick={() => setDockOpen(v => !v)}><SlidersHorizontal aria-hidden="true" /><span>{dockOpen ? x('Ocultar câmera', 'Hide camera', 'Ocultar cámara') : x('Câmera', 'Camera', 'Cámara')}</span></button>
        {immBtn}
      </div>
      <div id={dockId} className="cg-dock-panel" role="toolbar" hidden={!dockOpen} aria-label={x('Controles da câmera', 'Camera controls', 'Controles de cámara')}>{cmds}</div>
    </div>}
  </div>;
}
