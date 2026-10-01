import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Pause, Play } from 'lucide-react';
import { Walker, makeSim, stepSims, type Sim } from './walkers';
import { AgentValue } from './AgentValue';
import './RobotTradingFloor.css';

const CYCLE = 20;
const CX = 500, CY = 112, UW = 30, UH = 17, UZ = 30;
const P = (x: number, y: number, z = 0): [number, number] => [CX + (x - y) * UW, CY + (x + y) * UH - z * UZ];
const pts = (...a: [number, number][]) => a.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const kt = (...a: number[]) => a.map(n => n.toFixed(4)).join(';');
const DUR = `${CYCLE}s`;

type Team = { id: string; name: string; color: string; gx: number; gy: number; tickers: [string, string]; values: [string, string, string, string]; role: string; desc: string };
const TEAMS: Team[] = [
  { id: 'previsoes', name: 'Previsões', color: '#36E0D0', gx: 5, gy: 0, tickers: ['SIM', 'NÃO'], values: ['64%', '58%', '71%', '62%'], role: 'Mercados de previsão', desc: 'Compara probabilidades de eventos e envia à IA da BETTEX as análises que passam nos critérios.' },
  { id: 'surebet', name: 'Surebet', color: '#FF8A45', gx: 0, gy: 5, tickers: ['ODDS A', 'ODDS B'], values: ['2,10×', '1,85×', '2,35×', '1,92×'], role: 'Diferenças entre casas', desc: 'Cruza odds de casas diferentes e pede autorização antes de qualquer cobertura de risco.' },
  { id: 'memecoins', name: 'Memecoins', color: '#5F86FF', gx: 10, gy: 5, tickers: ['PEPE', 'DOGE'], values: ['$0,004', '$0,012', '$0,008', '$0,006'], role: 'Compra de memecoins', desc: 'Monitora memecoins e só compra dentro do limite liberado pela IA central.' },
  { id: 'bonus', name: 'Bônus', color: '#F2B632', gx: 5, gy: 10, tickers: ['ROLLOVER', 'FREEBET'], values: ['$ 25', '$ 40', '$ 30', '$ 50'], role: 'Mineração de bônus', desc: 'Garimpa bônus e promoções, respeitando regras e limites aprovados pela IA da BETTEX.' },
];
const MM = { x: 7, y: 7 };

function connectionPoints(team: Team) {
  const x = team.gx + 2, y = team.gy + 2;
  const dx = Math.sign(MM.x - x), dy = Math.sign(MM.y - y);
  return { a: P(x + dx * 2, y + dy * 2), b: P(MM.x - dx * 2, MM.y - dy * 2) };
}

const t0 = (i: number) => 0.02 + i * 0.24;
const W = (i: number) => ({ req: [t0(i), t0(i) + 0.09], auth: [t0(i) + 0.09, t0(i) + 0.13], ret: [t0(i) + 0.13, t0(i) + 0.17], exec: [t0(i) + 0.17, t0(i) + 0.235] }) as Record<string, [number, number]>;

function Win({ attr, w, on, off }: { attr: string; w: [number, number]; on: string; off: string }) {
  return <animate attributeName={attr} values={`${off};${on};${off};${off}`} keyTimes={kt(0, w[0], w[1], 1)} calcMode="discrete" dur={DUR} repeatCount="indefinite" />;
}

function Box({ x, y, w, d, h, z = 0, top, left, right, stroke }: { x: number; y: number; w: number; d: number; h: number; z?: number; top: string; left: string; right: string; stroke?: string }) {
  const H = z + h;
  return (
    <g stroke={stroke ?? 'rgba(95,134,255,.22)'} strokeWidth=".8" strokeLinejoin="round">
      <polygon points={pts(P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, H), P(x, y + d, H))} fill={left} />
      <polygon points={pts(P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, H), P(x + w, y, H))} fill={right} />
      <polygon points={pts(P(x, y, H), P(x + w, y, H), P(x + w, y + d, H), P(x, y + d, H))} fill={top} />
    </g>
  );
}

function Monitor({ x, y, z, color, seed }: { x: number; y: number; z: number; color: string; seed: number }) {
  const w = 0.55, d = 0.1, h = 0.6;
  const rows = [0.12, 0.24, 0.36, 0.48];
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} z={z} top="#1d2a5e" left="#0A1030" right="#0F1840" />
      <polygon points={pts(P(x + 0.04, y + d, z + 0.06), P(x + w - 0.04, y + d, z + 0.06), P(x + w - 0.04, y + d, z + h - 0.05), P(x + 0.04, y + d, z + h - 0.05))} fill="#06102c" />
      {rows.map((r, k) => {
        const len = 0.18 + ((seed + k * 3) % 4) * 0.07;
        const a = P(x + 0.08, y + d, z + r), b = P(x + 0.08 + len, y + d, z + r);
        return (
          <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeDasharray="5 3" opacity=".85">
            <animate attributeName="stroke-dashoffset" values="0;-16" dur={`${1.1 + (k % 3) * 0.35}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values=".35;.95;.5;.9;.35" dur={`${2.2 + ((seed + k) % 4) * 0.5}s`} repeatCount="indefinite" />
          </line>
        );
      })}
    </g>
  );
}

function Robot({ x, y, z, color, seed, value }: { x: number; y: number; z: number; color: string; seed: number; value: string }) {
  const [px, py] = P(x, y, z);
  const bob = 1.4 + (seed % 3) * 0.3;
  return (
    <g transform={`translate(${px.toFixed(1)} ${py.toFixed(1)})`}>
      <ellipse cx="0" cy="1" rx="12" ry="4" fill="rgba(0,0,0,.4)" />
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -1.5;0 0" dur={`${bob}s`} begin={`${(seed % 5) * 0.2}s`} repeatCount="indefinite" />
        <rect x="-9" y="-30" width="18" height="22" rx="5" fill="#1B2D6B" stroke={color} strokeWidth="1" />
        <rect x="-4" y="-24" width="8" height="5" rx="2" fill={color}>
          <animate attributeName="opacity" values=".4;1;.4" dur={`${1.2 + (seed % 4) * 0.3}s`} repeatCount="indefinite" />
        </rect>
        <g transform="translate(-9 -26)"><line x1="0" y1="0" x2="-4" y2="14" stroke="#F4F1E8" strokeWidth="3.4" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" values="-10 0 0;14 0 0;-10 0 0" dur={`${0.5 + (seed % 3) * 0.12}s`} repeatCount="indefinite" /></line></g>
        <g transform="translate(9 -26)"><line x1="0" y1="0" x2="4" y2="14" stroke="#F4F1E8" strokeWidth="3.4" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" values="12 0 0;-12 0 0;12 0 0" dur={`${0.42 + (seed % 4) * 0.1}s`} repeatCount="indefinite" /></line></g>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-4 0 -32;4 0 -32;-4 0 -32" dur={`${3 + (seed % 3)}s`} repeatCount="indefinite" />
          <line x1="0" y1="-43" x2="0" y2="-50" stroke={color} strokeWidth="1.5" />
          <circle cx="0" cy="-51" r="2.2" fill={color} />
          <rect x="-10" y="-43" width="20" height="14" rx="5" fill="#F4F1E8" />
          <rect x="-7.5" y="-40" width="15" height="8" rx="3" fill="#070B1F" />
          <circle cx="-3.2" cy="-36" r="1.7" fill="#36E0D0"><animate attributeName="r" values="1.7;1.7;.2;1.7;1.7" keyTimes="0;.9;.94;.98;1" dur={`${3.5 + (seed % 4)}s`} repeatCount="indefinite" /></circle>
          <circle cx="3.2" cy="-36" r="1.7" fill="#36E0D0"><animate attributeName="r" values="1.7;1.7;.2;1.7;1.7" keyTimes="0;.9;.94;.98;1" dur={`${3.5 + (seed % 4)}s`} repeatCount="indefinite" /></circle>
        </g>
        <AgentValue value={value} color={color} />
      </g>
    </g>
  );
}

function Island({ team, idx, sims }: { team: Team; idx: number; sims: Sim[] }) {
  const { gx, gy, color } = team;
  const w = W(idx);
  const rows = [gy + 0.5, gy + 2.7];
  const out: ReactElement[] = [];
  rows.forEach((ry, r) => {
    out.push(<Robot key={`r${r}`} x={gx + 2.65} y={ry + 0.15} z={0.42} color={color} seed={idx * 7 + r * 3} value={team.values[r]} />);
    out.push(<Box key={`d${r}`} x={gx + 0.4} y={ry + 0.2} w={3.2} d={0.85} h={0.42} top="#16245a" left="#0D1740" right="#0A1235" stroke={`${color}55`} />);
    [0.5, 1.75, 3.05].forEach((ox, k) => out.push(<Monitor key={`m${r}${k}`} x={gx + ox} y={ry + 0.45} z={0.42} color={color} seed={idx * 5 + r * 2 + k} />));
    if (r === 0) sims.forEach((sim, k) => out.push(<Walker key={`w${k}`} sim={sim} color={color} value={team.values[k + 2]} at={P(sim.x, sim.y)} />));
  });
  const marks = sims.map((sim, k) => <ellipse key={`t${k}`} ref={el => { sim.mark = el; }} cx={P(sim.tx, sim.ty)[0]} cy={P(sim.tx, sim.ty)[1]} rx="9" ry="5" fill="none" stroke={color} strokeWidth="1.4" strokeDasharray="3 3" opacity=".7" />);
  const [tx, ty] = P(gx + 2, gy + 0.4, 0);
  return (
    <g>
      <polygon points={pts(P(gx, gy), P(gx + 4, gy), P(gx + 4, gy + 4), P(gx, gy + 4))} fill="#0C1536" stroke={`${color}66`} strokeWidth="1.2" />
      <polygon points={pts(P(gx, gy), P(gx + 4, gy), P(gx + 4, gy + 4), P(gx, gy + 4))} fill={color} opacity="0">
        <Win attr="opacity" w={w.exec} on=".2" off="0" />
      </polygon>
      {marks}
      {out}
      <g transform={`translate(${tx} ${ty - 92})`}>
        <rect x="-82" y="-15" width="164" height="30" rx="8" fill="#070B1F" stroke={color} strokeWidth="1.4" />
        <text x="0" y="6" textAnchor="middle" fill={color} fontFamily="var(--app-font-mono)" fontWeight="700" fontSize="17" letterSpacing="1.5">{team.name.toUpperCase()}</text>
        {team.tickers.map((t, k) => (
          <g key={t} opacity="0">
            <rect x={-44} y={-20} width="88" height="22" rx="6" fill={color} />
            <text x="0" y="-4" textAnchor="middle" fill="#070B1F" fontFamily="var(--app-font-mono)" fontWeight="700" fontSize="14">{t}</text>
            <animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -34;0 -34" keyTimes={kt(0, w.exec[0] + k * 0.012, w.exec[1], 1)} dur={DUR} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={kt(0, w.exec[0] + k * 0.012, w.exec[0] + k * 0.012 + 0.005, w.exec[1] - 0.005, w.exec[1], 1)} dur={DUR} repeatCount="indefinite" />
          </g>
        ))}
      </g>
    </g>
  );
}

function Packet({ d, w, fill, ring }: { d: string; w: [number, number]; fill: string; ring?: string }) {
  return (
    <g opacity="0" data-testid="signal-packet">
      <circle r="4.5" fill="none" stroke={ring ?? fill} strokeWidth=".75" opacity=".35" />
      <circle r="2.5" fill={fill} stroke="#F4F1E8" strokeWidth=".6" />
      <animateMotion path={d} keyPoints="0;0;1;1" keyTimes={kt(0, w[0], w[1], 1)} calcMode="linear" dur={DUR} repeatCount="indefinite" />
      <Win attr="opacity" w={w} on="1" off="0" />
    </g>
  );
}

const STATE_TEXT = { req: 'PEDIDO DE ANÁLISE', auth: 'AUTORIZAÇÃO CENTRAL', exec: 'EXECUÇÃO LIBERADA' } as const;
type Stage = 'idle' | keyof typeof STATE_TEXT;

export function RobotTradingFloor() {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [playing, setPlaying] = useState(!reduce);
  const [inView, setInView] = useState(true);
  const [live, setLive] = useState<{ team: number; stage: Stage }>({ team: 0, stage: 'idle' });
  const [sims] = useState<Sim[]>(() => TEAMS.flatMap(t => [0, 1].map(k => makeSim(t.gx, t.gy, k))));
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const running = playing && inView;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setPlaying(false);
    };
    preference.addEventListener('change', onChange);
    return () => preference.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      stepSims(sims, dt, P);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, sims]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (running) svg.unpauseAnimations(); else svg.pauseAnimations();
    const tick = () => {
      const rel = (((svg.getCurrentTime() % CYCLE) / CYCLE) - 0.02 + 1) % 1;
      const team = Math.min(3, Math.floor(rel / 0.24));
      const p = rel - team * 0.24;
      const stage: Stage = rel >= 0.96 ? 'idle' : p < 0.09 ? 'req' : p < 0.17 ? 'auth' : p < 0.235 ? 'exec' : 'idle';
      setLive(s => (s.team === team && s.stage === stage ? s : { team, stage }));
    };
    tick();
    if (!running) return;
    const id = window.setInterval(tick, 160);
    return () => window.clearInterval(id);
  }, [running]);

  const cur = TEAMS[live.team];
  const stages: (keyof typeof STATE_TEXT)[] = ['req', 'auth', 'exec'];
  const mmP = P(MM.x, MM.y, 0.25);
  const caption = live.stage === 'idle'
    ? (playing ? 'Equipes em posição. O próximo pedido de análise já vai começar.' : 'Cena em pausa. Use Retomar para ver o ciclo completo.')
    : live.stage === 'req' ? `Equipe ${cur.name} envia o pedido de análise à IA da BETTEX.`
    : live.stage === 'auth' ? `A IA da BETTEX valida o pedido de ${cur.name} e envia a autorização.`
    : `Execução liberada para a equipe ${cur.name}, dentro dos limites definidos.`;

  return (
    <div ref={rootRef} className="robot-floor" data-testid="section-robot-floor">
      <div className="robot-floor__head">
        <div>
          <p className="robot-floor__eyebrow">Mercados BETTEX</p>
           <h2 id="robot-floor-title" className="robot-floor__title">A IA da BETTEX coordena.<br /><em>Os robôs executam.</em></h2>
        </div>
         <p className="robot-floor__note">Nenhuma equipe age sozinha. Cada pedido passa pela IA da BETTEX, nossa IA central. Ela analisa as oportunidades e autoriza os robôs a executar.</p>
      </div>

      <div className="robot-floor__stage">
        <button type="button" className="robot-floor__toggle" onClick={() => setPlaying(p => !p)} aria-pressed={!playing} data-testid="button-robot-floor-toggle">
          {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          <span>{playing ? 'Pausar animação' : 'Retomar animação'}</span>
        </button>
        <span className="robot-floor__tag">Ilustração conceitual</span>

        <svg ref={svgRef} className="robot-floor__svg" viewBox="0 0 1000 620" role="img" aria-label="Cena isométrica com agentes caminhando aleatoriamente em salas de previsões, surebet, memecoins e mineração de bônus, controlados pela IA da BETTEX. As operações seguem pedidos de análise, autorização e execução em um ciclo ilustrativo.">
          <defs>
            <radialGradient id="rf-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#2B59FF" stopOpacity=".5" /><stop offset="100%" stopColor="#2B59FF" stopOpacity="0" /></radialGradient>
          </defs>
          <ellipse cx="500" cy="345" rx="470" ry="260" fill="url(#rf-glow)" opacity=".35" />
          <polygon points={pts(P(0, 0), P(14, 0), P(14, 14), P(0, 14))} fill="#0A1230" stroke="rgba(95,134,255,.4)" strokeWidth="1.4" />
          {Array.from({ length: 13 }, (_, i) => i + 1).map(i => (
            <g key={i} stroke="rgba(95,134,255,.1)" strokeWidth="1">
              <line x1={P(i, 0)[0]} y1={P(i, 0)[1]} x2={P(i, 14)[0]} y2={P(i, 14)[1]} />
              <line x1={P(0, i)[0]} y1={P(0, i)[1]} x2={P(14, i)[0]} y2={P(14, i)[1]} />
            </g>
          ))}

          <g data-testid="signal-layer">
            {TEAMS.map((t, i) => {
              const w = W(i);
              const { a, b } = connectionPoints(t);
              const go = `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, back = `M${b[0]} ${b[1]} L${a[0]} ${a[1]}`;
              return (
                <g key={t.id} data-testid="signal-connection" data-team={t.id}>
                  <path d={go} data-testid="signal-route" fill="none" stroke={t.color} strokeWidth="1.25" strokeOpacity=".35" strokeLinecap="round" />
                  <path d={go} fill="none" stroke={t.color} strokeWidth="1.5" strokeLinecap="round" opacity="0">
                    <Win attr="opacity" w={[w.req[0], w.ret[1]]} on=".65" off="0" />
                  </path>
                  <circle cx={a[0]} cy={a[1]} r="1.5" fill={t.color} opacity=".6" />
                  <circle cx={b[0]} cy={b[1]} r="1.5" fill={t.color} opacity=".6" />
                  <Packet d={go} w={w.req} fill={t.color} />
                  <Packet d={back} w={w.ret} fill="#2B59FF" ring={t.color} />
                </g>
              );
            })}
          </g>

          {TEAMS.slice(0, 2).map((t, i) => <Island key={t.id} team={t} idx={i} sims={sims.slice(i * 2, i * 2 + 2)} />)}

          <g>
            <Box x={5} y={5} w={4} d={4} h={0.25} top="#13204F" left="#0D1740" right="#0A1235" stroke="rgba(95,134,255,.6)" />
            <ellipse cx={mmP[0]} cy={mmP[1]} rx="108" ry="60" fill="none" stroke="#5F86FF" strokeOpacity=".7" strokeWidth="2" strokeDasharray="14 10">
              <animate attributeName="stroke-dashoffset" values="0;-96" dur="8s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx={mmP[0]} cy={mmP[1]} rx="76" ry="42" fill="none" stroke="#36E0D0" strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="4 10">
              <animate attributeName="stroke-dashoffset" values="0;56" dur="5s" repeatCount="indefinite" />
            </ellipse>
            {TEAMS.map((t, i) => (
              <ellipse key={t.id} cx={mmP[0]} cy={mmP[1]} rx="20" ry="11" fill="none" stroke={t.color} strokeWidth="3" opacity="0">
                <animate attributeName="rx" values="20;20;130;130" keyTimes={kt(0, W(i).auth[0], W(i).auth[1] + 0.03, 1)} dur={DUR} repeatCount="indefinite" />
                <animate attributeName="ry" values="11;11;72;72" keyTimes={kt(0, W(i).auth[0], W(i).auth[1] + 0.03, 1)} dur={DUR} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0;.95;0;0" keyTimes={kt(0, W(i).auth[0], W(i).auth[0] + 0.005, W(i).auth[1] + 0.03, 1)} dur={DUR} repeatCount="indefinite" />
              </ellipse>
            ))}
            <line x1={mmP[0]} y1={mmP[1]} x2={mmP[0]} y2={mmP[1] - 118} stroke="#5F86FF" strokeOpacity=".5" strokeWidth="10" strokeLinecap="round" />
            <line x1={mmP[0]} y1={mmP[1]} x2={mmP[0]} y2={mmP[1] - 118} stroke="#36E0D0" strokeOpacity=".7" strokeWidth="2" strokeDasharray="3 9"><animate attributeName="stroke-dashoffset" values="0;-24" dur="1.2s" repeatCount="indefinite" /></line>
            <g transform={`translate(${mmP[0]} ${mmP[1] - 138})`}>
              <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;0 -5;0 0" dur="3.6s" repeatCount="indefinite" />
              <ellipse rx="52" ry="14" fill="none" stroke="#5F86FF" strokeWidth="1.6" strokeDasharray="10 8"><animate attributeName="stroke-dashoffset" values="0;-72" dur="6s" repeatCount="indefinite" /></ellipse>
              <image href={`${import.meta.env.BASE_URL}bettex-mark-gamblefi.svg`} x="-34" y="-34" width="68" height="68" preserveAspectRatio="xMidYMid meet" aria-label="Logo da BETTEX" />
              <ellipse rx="40" ry="11" fill="none" stroke="#36E0D0" strokeOpacity=".6" strokeWidth="1.2" strokeDasharray="2 12"><animate attributeName="stroke-dashoffset" values="0;28" dur="3s" repeatCount="indefinite" /></ellipse>
            </g>
          </g>

          {TEAMS.slice(2).map((t, i) => <Island key={t.id} team={t} idx={i + 2} sims={sims.slice((i + 2) * 2, (i + 2) * 2 + 2)} />)}

          <g>
            <line x1="500" y1="98" x2="500" y2={mmP[1] - 160} stroke="#5F86FF" strokeOpacity=".6" strokeWidth="2" strokeDasharray="4 5"><animate attributeName="stroke-dashoffset" values="0;-18" dur="1s" repeatCount="indefinite" /></line>
            <text x="500" y="40" textAnchor="middle" fill="#F4F1E8" fontFamily="var(--app-font-serif)" fontWeight="800" fontSize="22" letterSpacing="-.5">IA da BETTEX</text>
            <text x="500" y="58" textAnchor="middle" fill="#8FA8F0" fontFamily="var(--app-font-mono)" fontWeight="700" fontSize="11" letterSpacing="2">CONTROLE CENTRAL</text>
            {TEAMS.map((t, i) => {
              const w = W(i);
              return (['req', 'auth', 'exec'] as const).map(s => (
                <text key={`${t.id}-${s}`} x="500" y="84" textAnchor="middle" fill={t.color} fontFamily="var(--app-font-mono)" fontWeight="700" fontSize="13" letterSpacing="1" opacity="0">
                  {`${STATE_TEXT[s]} / ${t.name.toUpperCase()}`}
                  <Win attr="opacity" w={s === 'req' ? w.req : s === 'auth' ? [w.auth[0], w.ret[1]] : w.exec} on="1" off="0" />
                </text>
              ));
            })}
          </g>
        </svg>
      </div>

      <div className="robot-floor__status" role="status" aria-live="off">
        <ol className="robot-floor__steps" aria-label="Etapas do ciclo">
          {stages.map((s, k) => (
            <li key={s} className={live.stage === s ? 'is-on' : ''}><b>{k + 1}</b><span>{k === 0 ? 'Análise e pedido' : k === 1 ? 'Autorização central' : 'Execução especializada'}</span></li>
          ))}
        </ol>
        <p className="robot-floor__caption" data-testid="text-robot-floor-caption">{caption}</p>
      </div>

      <ul className="robot-floor__teams">
        {TEAMS.map((t, i) => (
          <li key={t.id} className={live.team === i && live.stage !== 'idle' ? 'is-active' : ''} style={{ ['--team' as string]: t.color }}>
            <span className="robot-floor__team-role">{t.role}</span>
            <strong>{t.name}</strong>
            <p>{t.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RobotTradingFloor;
