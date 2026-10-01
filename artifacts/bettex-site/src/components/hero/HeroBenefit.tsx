import { ChartNoAxesCombined, GitBranch, Spade } from 'lucide-react';
import './HeroBenefit.css';

const HUB = { x: 76, y: 50 };
const NODES = [
  { key: 'sports', label: 'Surebet', x: 66, y: 23 },
  { key: 'predictions', label: 'Previsões', x: 87, y: 27 },
  { key: 'bonuses', label: 'Mineração de bônus', x: 66, y: 73 },
  { key: 'crypto', label: 'Cripto e memes', x: 87, y: 68 },
];
const R = 5.6;
const ICON = 6.4;

function Icon({ k, x, y }: { k: string; x: number; y: number }) {
  const p = { x: x - ICON / 2, y: y - ICON / 2, width: ICON, height: ICON, strokeWidth: 1.8, color: '#a4eacb' };
  if (k === 'sports')
    return (
      <g transform={`translate(${x - 3.4} ${y - 3.4}) scale(${6.8 / 120})`} fill="none" stroke="#a4eacb" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="60" cy="60" r="54" />
        <path d="M60 34 79 48 72 70 48 70 41 48Z" fill="#a4eacb" />
        <path d="M60 34V6 M79 48l26-9 M72 70l16 29 M48 70 32 99 M41 48l-26-9" />
      </g>
    );
  if (k === 'predictions') return <GitBranch {...p} />;
  if (k === 'bonuses') return <Spade {...p} />;
  return <ChartNoAxesCombined {...p} />;
}

export function HeroBenefit() {
  return (
    <figure className="hero-benefit entrance entrance-delay">
      <img
        className="hero-benefit__art"
        src={`${import.meta.env.BASE_URL}hero-portrait-overlay.webp`}
        alt="Homem ao lado da marca BETTEX, com referências a surebet, previsões, mineração de bônus e cripto e memes"
        width={1024}
        height={1024}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      <svg className="hero-benefit__system" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="hb-halo"><stop offset="0" stopColor="#5ddbb4" stopOpacity=".28" /><stop offset="1" stopColor="#5ddbb4" stopOpacity="0" /></radialGradient>
          <radialGradient id="hb-core" cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="#c9f6df" />
            <stop offset="1" stopColor="#7fd9b3" />
          </radialGradient>
        </defs>
        <circle cx={HUB.x} cy={HUB.y} r="34" fill="url(#hb-halo)" />
        <polygon
          className="hero-benefit__orbit"
          points={`${NODES[0].x},${NODES[0].y} ${NODES[1].x},${NODES[1].y} ${NODES[3].x},${NODES[3].y} ${NODES[2].x},${NODES[2].y}`}
          fill="rgba(164,234,203,.05)"
          strokeLinejoin="round"
        />
        {NODES.map((n) => (
          <line key={n.key} className="hero-benefit__link" x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y} />
        ))}
        <circle cx={HUB.x} cy={HUB.y} r="15" fill="none" stroke="rgba(164,234,203,.22)" strokeWidth=".4" />
        <circle cx={HUB.x} cy={HUB.y} r="11.5" fill="url(#hb-core)" stroke="#e6fbf0" strokeWidth=".6" />
        <g transform={`translate(${HUB.x - 7.5} ${HUB.y - 7.5}) scale(${15 / 64})`} color="#0c3a37">
          <path fill="currentColor" d="M17 15h6v34h-6V15Zm10 0h12l9 8v4l-5 5 6 8v3l-9 6H27v-6h11l4-3-4-5H27v-6h11l4-4-4-4H27v-6Z" />
        </g>
        {NODES.map((n) => (
          <g key={n.key}>
            <circle cx={n.x} cy={n.y} r={R} fill="#0b3633" stroke="#a4eacb" strokeWidth=".7" />
            <Icon k={n.key} x={n.x} y={n.y} />
          </g>
        ))}
      </svg>
      {NODES.map((n) => (
        <span
          key={n.key}
          className="hero-benefit__label"
          style={{ left: `${n.x}%`, top: `${n.y + R + 1.6}%` }}
        >
          {n.label}
        </span>
      ))}
    </figure>
  );
}
