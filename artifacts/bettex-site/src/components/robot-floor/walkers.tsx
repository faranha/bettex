export type Sim = {
  x: number; y: number; tx: number; ty: number;
  speed: number; wait: number; hasTarget: boolean; phase: number;
  b: { x0: number; x1: number; y0: number; y1: number };
  g: SVGGElement | null; body: SVGGElement | null;
  legL: SVGElement | null; legR: SVGElement | null; armL: SVGElement | null; armR: SVGElement | null;
  mark: SVGElement | null;
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function pick(s: Sim) {
  let tx = rnd(s.b.x0, s.b.x1);
  for (let i = 0; i < 6 && Math.abs(tx - s.x) < 0.9; i++) tx = rnd(s.b.x0, s.b.x1);
  if (Math.abs(tx - s.x) < 0.9) tx = s.x < (s.b.x0 + s.b.x1) / 2 ? s.b.x1 : s.b.x0;
  s.tx = tx;
  s.ty = rnd(s.b.y0, s.b.y1);
  s.speed = rnd(0.5, 1.0);
  s.hasTarget = true;
}

/** Cria um caminhante confinado a uma faixa do corredor da sala (gx, gy). */
export function makeSim(gx: number, gy: number, lane: number): Sim {
  const y0 = gy + 1.85 + lane * 0.6;
  const b = { x0: gx + 0.35, x1: gx + 3.65, y0, y1: y0 + 0.35 };
  const s: Sim = { x: rnd(b.x0, b.x1), y: rnd(b.y0, b.y1), tx: 0, ty: 0, speed: 0.7, wait: rnd(0, 1.2), hasTarget: false, phase: 0, b, g: null, body: null, legL: null, legR: null, armL: null, armR: null, mark: null };
  pick(s);
  return s;
}

export function stepSims(sims: Sim[], dt: number, project: (x: number, y: number) => [number, number]) {
  for (const s of sims) {
    let moving = false;
    let dirX = 0;
    if (s.wait > 0) {
      s.wait -= dt;
    } else {
      if (!s.hasTarget) pick(s);
      const dx = s.tx - s.x, dy = s.ty - s.y;
      const dist = Math.hypot(dx, dy);
      const step = s.speed * dt;
      if (dist <= step) {
        s.x = s.tx; s.y = s.ty; s.hasTarget = false; s.wait = rnd(0.5, 2.2);
      } else {
        s.x += (dx / dist) * step; s.y += (dy / dist) * step;
        s.phase += step * 7;
        moving = true; dirX = Math.sign(dx);
      }
    }
    const [px, py] = project(s.x, s.y);
    s.g?.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)})`);
    const sw = moving ? Math.sin(s.phase) : 0;
    s.legL?.setAttribute('transform', `translate(0 ${(-Math.max(0, sw) * 3).toFixed(2)})`);
    s.legR?.setAttribute('transform', `translate(0 ${(-Math.max(0, -sw) * 3).toFixed(2)})`);
    s.armL?.setAttribute('transform', `rotate(${(sw * 24).toFixed(1)} 0 0)`);
    s.armR?.setAttribute('transform', `rotate(${(-sw * 24).toFixed(1)} 0 0)`);
    s.body?.setAttribute('transform', `translate(0 ${(-Math.abs(sw) * 1.6).toFixed(2)}) rotate(${dirX * 3} 0 -8)`);
    if (s.mark) {
      const [mx, my] = project(s.tx, s.ty);
      s.mark.setAttribute('cx', mx.toFixed(1));
      s.mark.setAttribute('cy', my.toFixed(1));
      s.mark.setAttribute('opacity', s.hasTarget ? '.7' : '.15');
    }
  }
}

export function Walker({ sim, color, at }: { sim: Sim; color: string; at: [number, number] }) {
  return (
    <g ref={el => { sim.g = el; }} data-testid="walking-agent" data-x-min={sim.b.x0} data-x-max={sim.b.x1} data-y-min={sim.b.y0} data-y-max={sim.b.y1} transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)})`}>
      <ellipse cx="0" cy="1" rx="12" ry="4" fill="rgba(0,0,0,.4)" />
      <rect ref={el => { sim.legL = el; }} x="-6" y="-9" width="4.4" height="9" rx="2" fill="#F4F1E8" />
      <rect ref={el => { sim.legR = el; }} x="1.6" y="-9" width="4.4" height="9" rx="2" fill="#F4F1E8" />
      <g ref={el => { sim.body = el; }}>
        <rect x="-9" y="-32" width="18" height="24" rx="5" fill="#1B2D6B" stroke={color} strokeWidth="1" />
        <rect x="-4" y="-26" width="8" height="5" rx="2" fill={color}><animate attributeName="opacity" values=".4;1;.4" dur="1.6s" repeatCount="indefinite" /></rect>
        <g transform="translate(-9 -28)"><line ref={el => { sim.armL = el; }} x1="0" y1="0" x2="-3" y2="13" stroke="#F4F1E8" strokeWidth="3.4" strokeLinecap="round" /></g>
        <g transform="translate(9 -28)"><line ref={el => { sim.armR = el; }} x1="0" y1="0" x2="3" y2="13" stroke="#F4F1E8" strokeWidth="3.4" strokeLinecap="round" /></g>
        <line x1="0" y1="-45" x2="0" y2="-52" stroke={color} strokeWidth="1.5" />
        <circle cx="0" cy="-53" r="2.2" fill={color} />
        <rect x="-10" y="-45" width="20" height="14" rx="5" fill="#F4F1E8" />
        <rect x="-7.5" y="-42" width="15" height="8" rx="3" fill="#070B1F" />
        <circle cx="-3.2" cy="-38" r="1.7" fill="#36E0D0" /><circle cx="3.2" cy="-38" r="1.7" fill="#36E0D0" />
      </g>
    </g>
  );
}
