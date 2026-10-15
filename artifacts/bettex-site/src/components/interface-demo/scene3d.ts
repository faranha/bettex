import { GRAPH_EDGES as EDGES, GRAPH_NODES as NODES, SCENE_Z, graphRoute as route, type EdgeDef, type NodeDef, type P, type Sel } from './central-graph-model';

export type V3 = [number, number, number];
export type Cam = { yaw: number; pitch: number; zoom: number; px: number; py: number };
type Cluster = { n: NodeDef; rgb: string; R: number; count: number; pts: Float32Array; lines: Uint32Array };
type SEdge = { e: EdgeDef; jit: Float32Array; lift: number; speed: number; phase: number };
export type Scene = { clusters: Cluster[]; dust: Float32Array; centers: Record<string, V3>; edges: SEdge[]; narrow: boolean };

const CYAN = '53,214,255', MAGENTA = '255,61,139', AMBER = '242,193,78', GREEN = '70,227,176', WHITE = '200,210,225';
const KIND = { core: { n: 900, R: 170, rgb: CYAN }, agent: { n: 340, R: 115, rgb: CYAN }, spec: { n: 210, R: 82, rgb: CYAN }, control: { n: 150, R: 70, rgb: AMBER }, hub: { n: 150, R: 68, rgb: GREEN }, soon: { n: 70, R: 46, rgb: WHITE } };
const EDGE_RGB = { flow: CYAN, control: AMBER, hub: GREEN };
const F = 1100;
const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };

export function centerOf(n: NodeDef, narrow: boolean, world: P): V3 { const p = narrow ? n.tall : n.wide; return [p[0] - world[0] / 2, p[1] - world[1] / 2, SCENE_Z[n.id] * (narrow ? 0.6 : 1)]; }
export const ctrlOf = (a: V3, b: V3, lift: number): V3 => [(a[0] + b[0]) / 2 - (b[1] - a[1]) * 0.16, (a[1] + b[1]) / 2 + (b[0] - a[0]) * 0.16, (a[2] + b[2]) / 2 + lift];
export const bez = (a: V3, c: V3, b: V3, t: number): V3 => { const u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1], u * u * a[2] + 2 * u * t * c[2] + t * t * b[2]]; };

export function buildScene(narrow: boolean, world: P): Scene {
  const centers: Record<string, V3> = {}; NODES.forEach(n => { centers[n.id] = centerOf(n, narrow, world); });
  const clusters = NODES.map((n): Cluster => {
    const k = KIND[n.kind]; const R = k.R * (narrow ? 0.72 : 1); const count = Math.round(k.n * (narrow ? 0.6 : 1)); const r = rng(hash(n.id));
    const pts = new Float32Array((count + 1) * 3);
    for (let i = 0; i < count; i++) { const u = 2 * r() - 1, th = 2 * Math.PI * r(), q = Math.sqrt(1 - u * u); const rad = R * (r() < 0.7 ? 0.62 + 0.38 * r() : 0.2 + 0.5 * r()); pts[i * 3] = rad * q * Math.cos(th); pts[i * 3 + 1] = rad * u * 0.92; pts[i * 3 + 2] = rad * q * Math.sin(th); }
    const L: number[] = [];
    for (let i = 0; i < count; i++) { let best = -1, bd = R * 0.48; for (let t = 0; t < 7; t++) { const j = Math.floor(r() * count); if (j === i) continue; const d = Math.hypot(pts[i * 3] - pts[j * 3], pts[i * 3 + 1] - pts[j * 3 + 1], pts[i * 3 + 2] - pts[j * 3 + 2]); if (d < bd) { bd = d; best = j; } } if (best >= 0) L.push(i, best); }
    const spokes = n.kind === 'core' ? 30 : n.kind === 'agent' ? 12 : n.kind === 'soon' ? 0 : 6; for (let s = 0; s < spokes; s++) L.push(count, Math.floor(r() * count));
    return { n, rgb: k.rgb, R, count, pts, lines: Uint32Array.from(L) };
  });
  const r = rng(7); const dust = new Float32Array(700 * 3); for (let i = 0; i < 700; i++) { dust[i * 3] = (r() - 0.5) * 2200; dust[i * 3 + 1] = (r() - 0.5) * 1800; dust[i * 3 + 2] = (r() - 0.5) * 1400; }
  const edges = EDGES.map((e): SEdge => { const q = rng(hash(e.id)); const jit = new Float32Array(60 * 3); for (let i = 0; i < jit.length; i++) jit[i] = (q() - 0.5) * 18; return { e, jit, lift: (q() - 0.5) * 140, speed: 0.8 + q() * 0.5, phase: q() }; });
  return { clusters, dust, centers, edges, narrow };
}

let CY = 1, SY = 0, CP = 1, SP = 0, W = 0, H = 0, ZOOM = 1, OX = 0, OY = 0;
export let PX = 0, PY = 0, PS = 1;
function setCam(c: Cam, w: number, h: number) { CY = Math.cos(c.yaw); SY = Math.sin(c.yaw); CP = Math.cos(c.pitch); SP = Math.sin(c.pitch); W = w; H = h; ZOOM = c.zoom; OX = c.px; OY = c.py; }
function pj(x: number, y: number, z: number) { const x2 = x * CY + z * SY, z2 = -x * SY + z * CY; const y3 = y * CP - z2 * SP, z3 = y * SP + z2 * CP; const s = F / Math.max(120, F - z3); PX = W / 2 + OX + x2 * s * ZOOM; PY = H / 2 + OY + y3 * s * ZOOM; PS = s; }
export function projectPoint(p: V3, c: Cam, w: number, h: number) { setCam(c, w, h); pj(p[0], p[1], p[2]); return { x: PX, y: PY, s: PS }; }

/** Shared screen-space track for canvas rails AND clickable packets.
 * A normal offset (not a vertical offset) keeps packets on their lane at any camera angle. */
export function railPoint(a: V3, c: V3, b: V3, t: number, lane: 1 | -1, cam: Cam, w: number, h: number) {
  const q = projectPoint(bez(a, c, b, t), cam, w, h);
  const before = projectPoint(bez(a, c, b, Math.max(0, t - 0.005)), cam, w, h);
  const after = projectPoint(bez(a, c, b, Math.min(1, t + 0.005)), cam, w, h);
  const dx = after.x - before.x, dy = after.y - before.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: q.x - dy / length * lane * 7, y: q.y + dx / length * lane * 7, angle: Math.atan2(dy, dx) * 180 / Math.PI };
}

function ring(ctx: CanvasRenderingContext2D, c: V3, rad: number, tilt: number, spin: number, steps = 48) {
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) { const a = (i / steps) * Math.PI * 2 + spin; const x = Math.cos(a) * rad; let y = 0, z = Math.sin(a) * rad; const y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt); y = y2; z = z2; pj(c[0] + x, c[1] + y, c[2] + z); if (i) ctx.lineTo(PX, PY); else ctx.moveTo(PX, PY); }
  ctx.stroke();
}

export function drawScene(ctx: CanvasRenderingContext2D, sc: Scene, cam: Cam, w: number, h: number, t: number, sel: Sel | null, reduced: boolean) {
  setCam(cam, w, h); ctx.clearRect(0, 0, w, h); const rt = route(sel); const hasSel = !!sel; const T = reduced ? 0 : t;
  ctx.fillStyle = `rgba(${WHITE},0.35)`; for (let i = 0; i < sc.dust.length; i += 3) { pj(sc.dust[i], sc.dust[i + 1], sc.dust[i + 2]); ctx.fillRect(PX, PY, PS > 1 ? 1.3 : 0.9, PS > 1 ? 1.3 : 0.9); }
  const sx = new Float32Array(1200), sy = new Float32Array(1200), ss = new Float32Array(1200);
  for (const cl of sc.clusters) {
    const on = rt.nodes.has(cl.n.id); const dim = hasSel && !on ? 0.4 : 1; const hi = on && hasSel ? 1.5 : 1; const c = sc.centers[cl.n.id];
    const spin = T * 0.00006 * (cl.n.kind === 'core' ? 3 : 1); const cs = Math.cos(spin), sn = Math.sin(spin);
    for (let i = 0; i <= cl.count; i++) { const x = cl.pts[i * 3], y = cl.pts[i * 3 + 1], z = cl.pts[i * 3 + 2]; pj(c[0] + x * cs + z * sn, c[1] + y, c[2] - x * sn + z * cs); sx[i] = PX; sy[i] = PY; ss[i] = PS; }
    ctx.strokeStyle = `rgba(${cl.rgb},${0.17 * dim * hi})`; ctx.lineWidth = 0.7; ctx.beginPath();
    for (let i = 0; i < cl.lines.length; i += 2) { const a = cl.lines[i], b = cl.lines[i + 1]; ctx.moveTo(sx[a], sy[a]); ctx.lineTo(sx[b], sy[b]); } ctx.stroke();
    ctx.fillStyle = `rgba(${cl.rgb},${0.8 * dim})`; for (let i = 0; i < cl.count; i++) { const z = (0.8 + ss[i] * 0.7) * (cl.n.kind === 'soon' ? 0.9 : 1); ctx.fillRect(sx[i], sy[i], z, z); }
    ctx.fillStyle = `rgba(235,250,255,${0.9 * dim})`; for (let i = 0; i < cl.count; i += 9) { const z = 1.6 + ss[i] * 1.2 * hi; ctx.fillRect(sx[i] - z / 2, sy[i] - z / 2, z, z); }
    if (cl.n.kind !== 'soon') {
      ctx.strokeStyle = `rgba(${cl.rgb},${0.3 * dim * hi})`; ctx.lineWidth = 0.8; ring(ctx, c, cl.R * 1.2, 0.9, spin * 2); ring(ctx, c, cl.R * 1.38, -0.5, -spin * 1.5);
    } else { ctx.strokeStyle = `rgba(${WHITE},0.25)`; ctx.setLineDash([3, 5]); ring(ctx, c, cl.R * 1.2, 0.7, 0); ctx.setLineDash([]); }
    if (cl.n.kind === 'core') {
      ctx.strokeStyle = `rgba(${CYAN},${0.55 * dim * hi})`; ctx.lineWidth = 0.9; const rr = cl.R * 0.5;
      for (const lat of [-0.8, -0.4, 0, 0.4, 0.8]) { const ro = rr * Math.sqrt(1 - lat * lat); ring(ctx, [c[0], c[1] + rr * lat, c[2]], ro, 0, spin * 4, 36); }
      for (let m = 0; m < 5; m++) { ctx.beginPath(); for (let i = 0; i <= 28; i++) { const a = (i / 28) * Math.PI * 2, ph = (m / 5) * Math.PI + spin * 4; const x = Math.cos(a) * rr * Math.cos(ph), y = Math.sin(a) * rr, z = Math.cos(a) * rr * Math.sin(ph); pj(c[0] + x, c[1] + y, c[2] + z); if (i) ctx.lineTo(PX, PY); else ctx.moveTo(PX, PY); } ctx.stroke(); }
      pj(c[0], c[1], c[2]); const g = ctx.createRadialGradient(PX, PY, 0, PX, PY, 34 * PS * cam.zoom); g.addColorStop(0, `rgba(${MAGENTA},0.85)`); g.addColorStop(1, `rgba(${MAGENTA},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(PX, PY, 34 * PS * cam.zoom, 0, 7); ctx.fill();
      ctx.fillStyle = `rgb(${MAGENTA})`; const q = 9 * PS * cam.zoom; ctx.save(); ctx.translate(PX, PY); ctx.rotate(Math.PI / 4 + T * 0.0004); ctx.fillRect(-q / 2, -q / 2, q, q); ctx.restore();
    }
  }
  for (const se of sc.edges) {
    const a = sc.centers[se.e.a], b = sc.centers[se.e.b], c = ctrlOf(a, b, se.lift); const act = rt.edges.has(se.e.id); const rgb = EDGE_RGB[se.e.type]; const dim = hasSel && !act ? 0.45 : 1;
    const traffic = se.e.a === 'bettex' || se.e.b === 'predictions' || se.e.id === 'predictions-bettex';
    if (!traffic) {
      ctx.strokeStyle = `rgba(${rgb},${act ? 0.45 : 0.13 * dim})`; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i <= 32; i++) { const p = bez(a, c, b, i / 32); pj(p[0], p[1], p[2]); if (i) ctx.lineTo(PX, PY); else ctx.moveTo(PX, PY); } ctx.stroke();
      continue;
    }
    const support = se.e.type === 'control';
    for (const lane of [1, -1] as const) {
      const color = support ? lane === 1 ? AMBER : GREEN : lane === 1 ? CYAN : MAGENTA;
      ctx.beginPath();
      for (let i = 0; i <= 48; i++) {
        const p = railPoint(a, c, b, i / 48, lane, cam, w, h);
        if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
      }
      // Broad dark bed separates the route from the particle field.
      ctx.strokeStyle = 'rgba(2,10,16,.9)'; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = `rgba(${color},${(act ? 0.85 : 0.52) * dim})`; ctx.lineWidth = act ? 1.8 : 1.3; ctx.stroke();
      // Fixed direction markers belong to the track; only record-backed packets move.
      for (const t of [0.32, 0.68]) {
        const p = railPoint(a, c, b, t, lane, cam, w, h);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.angle + (lane === -1 ? 180 : 0)) * Math.PI / 180);
        ctx.beginPath(); ctx.moveTo(-3, -3); ctx.lineTo(1, 0); ctx.lineTo(-3, 3);
        ctx.strokeStyle = `rgba(${color},${0.8 * dim})`; ctx.lineWidth = 1.3; ctx.stroke(); ctx.restore();
      }
    }
  }
}
