/** @jsxImportSource react */
import { BrainEnergy } from '../technology/BrainEnergy';

const frame = { className: 'agx-art', viewBox: '0 0 200 76', 'aria-hidden': true, focusable: 'false' } as const;

function Net({ c, d }: { c: string; d: string }) {
  return <g fill="none" stroke={c} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity=".7" className="agx-net">
    <path d={d} /><path d="M4 12 18 20 14 32M196 14 184 24" />
    <circle cx="18" cy="20" r="1.8" fill={c} stroke="none" /><circle cx="14" cy="32" r="1.4" fill={c} stroke="none" /><circle cx="184" cy="24" r="1.8" fill={c} stroke="none" />
  </g>;
}

export function CryptoBarsArt() {
  const h = [30, 46, 38, 62, 50, 78, 58, 90, 70, 100, 80, 66];
  return <svg className="agx-cbg" viewBox="0 0 240 100" preserveAspectRatio="none" aria-hidden focusable="false">
    <defs><linearGradient id="agx-cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8BA8CD" /><stop offset="1" stopColor="#375781" stopOpacity=".35" /></linearGradient></defs>
    {h.map((v, i) => <g key={i}>
      <rect x={6 + i * 19.5} y={100 - v} width="13" height={v} rx="2.5" fill="url(#agx-cb)" opacity={0.3 + (i % 4) * 0.1} />
      <rect x={6 + i * 19.5} y={100 - v} width="13" height="2" rx="1" fill="#C3D1E5" opacity=".7" />
    </g>)}
    <path d="M6 70 45 52 84 60 123 30 162 38 201 8" fill="none" stroke="#8BA8CD" strokeWidth=".9" opacity=".6" vectorEffect="non-scaling-stroke" />
  </svg>;
}

export function SportsBrainArt({ label, l1, l2 }: { label: string; l1: string; l2: string }) {
  const base = import.meta.env.BASE_URL;
  const pent = (cx: number, cy: number, r: number, rot: number) => Array.from({ length: 5 }, (_, i) => { const t = (rot + i * 72) * Math.PI / 180; return `${(cx + r * Math.cos(t)).toFixed(1)},${(cy + r * Math.sin(t)).toFixed(1)}`; }).join(' ');
  return <div className="agx-brainart" role="img" aria-label={label}>
    <svg className="agx-links" viewBox="0 0 320 220" aria-hidden focusable="false" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="agx-pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0F4A2B" /><stop offset="1" stopColor="#1F8A47" /></linearGradient>
        <radialGradient id="agx-ball" cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".6" stopColor="#E4E7EE" /><stop offset="1" stopColor="#8E96AA" /></radialGradient>
        <clipPath id="agx-pc"><path d="M60 52H260L312 212H8Z" /></clipPath>
      </defs>
      <path d="M60 52H260L312 212H8Z" fill="url(#agx-pitch)" />
      <g clipPath="url(#agx-pc)">{[0, 1, 2, 3, 4].map(i => <rect key={i} x="0" y={52 + i * 32} width="320" height="16" fill="#fff" opacity=".05" />)}</g>
      <path d="M60 52H260L312 212H8Z" stroke="#E9F7EC" strokeWidth="1.6" opacity=".75" />
      <path d="M10 140H310M126 52 106 98H214L194 52" stroke="#E9F7EC" strokeWidth="1.4" opacity=".6" />
      <ellipse cx="160" cy="140" rx="52" ry="14" stroke="#E9F7EC" strokeWidth="1.4" opacity=".6" />
      <g stroke="#FB923C" strokeWidth="1.6" strokeDasharray="4 5" opacity=".95"><path d="M70 196C96 160 120 150 150 128" /><path d="M250 190C232 150 214 118 200 96" /><path d="M110 112C130 96 160 88 188 90" /></g>
      {[[70, 196], [250, 190], [110, 112]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6" fill="#FB923C" stroke="#2A1208" strokeWidth="1.5" />)}
      {[[200, 96], [188, 90], [96, 150]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill="#E8EEF9" stroke="#1B2540" strokeWidth="1.5" opacity=".92" />)}
      <ellipse cx="150" cy="190" rx="52" ry="8" fill="#03140A" opacity=".5" />
      <circle cx="150" cy="140" r="46" fill="url(#agx-ball)" />
      <polygon points={pent(150, 140, 15, -90)} fill="#141A2B" />
      {[-90, -18, 54, 126, 198].map((d, i) => { const t = d * Math.PI / 180; const x = 150 + 31 * Math.cos(t), y = 140 + 31 * Math.sin(t); return <g key={i}><path d={`M${150 + 15 * Math.cos(t)} ${140 + 15 * Math.sin(t)}L${x} ${y}`} stroke="#141A2B" strokeWidth="2" /><polygon points={pent(150 + 41 * Math.cos(t), 140 + 41 * Math.sin(t), 8, d + 180)} fill="#141A2B" opacity=".9" /></g>; })}
      <circle cx="150" cy="140" r="46" stroke="#fff" strokeWidth="1.5" opacity=".5" />
      <path d="M126 112a40 40 0 0 1 36-14" stroke="#fff" strokeWidth="4" opacity=".55" />
      <g transform="translate(12 74)" stroke="#E9F7EC" strokeWidth="2" opacity=".85"><path d="M0 0H26V40H0M6 6H20V34H6" /></g>
    </svg>
    <div className="agx-brainbox">
      <img className="agx-brainimg" src={`${base}agents/bettex-intelligence-brain.webp`} alt="" width={640} height={640} decoding="async" />
      <BrainEnergy />
    </div>
    <span className="agx-chip agx-chip-a" aria-hidden>{l1}</span>
    <span className="agx-chip agx-chip-b" aria-hidden>{l2}</span>
  </div>;
}

export function PredictionArt() {
  return <svg {...frame}>
    <defs>
      <linearGradient id="agx-p1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B7C9E2" /><stop offset="1" stopColor="#5274A0" /></linearGradient>
      <linearGradient id="agx-p3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1D304F" /><stop offset="1" stopColor="#101C34" /></linearGradient>
    </defs>
    <Net c="#8BA8CD" d="M18 20 60 8 104 18 150 6 184 24" />
    <g transform="translate(112 12) rotate(7 40 30)"><rect width="76" height="52" rx="8" fill="url(#agx-p3)" stroke="#6583AC" /><rect x="9" y="10" width="34" height="5" rx="2.5" fill="#8BA8CD" /><rect x="9" y="22" width="52" height="4" rx="2" fill="#5274A0" /><rect x="9" y="32" width="28" height="4" rx="2" fill="#5274A0" /><circle cx="60" cy="40" r="5" fill="#D7BE70" /></g>
    <g transform="translate(30 10) rotate(-5 36 30)"><rect y="4" width="80" height="60" rx="9" fill="#0B1526" opacity=".55" />
      <rect width="80" height="60" rx="9" fill="url(#agx-p3)" stroke="#8BA8CD" strokeWidth="1.2" /><path d="M0 9a9 9 0 0 1 9-9h62a9 9 0 0 1 9 9v10H0z" fill="url(#agx-p1)" />
      <rect x="19" y="-4" width="4" height="11" rx="2" fill="#D6DFED" /><rect x="57" y="-4" width="4" height="11" rx="2" fill="#D6DFED" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <rect key={i} x={9 + (i % 4) * 16} y={26 + Math.floor(i / 4) * 16} width="11" height="10" rx="2.5" fill={i === 5 ? '#D7BE70' : i === 2 ? '#9AB2D1' : '#3E587F'} opacity={i === 5 || i === 2 ? 1 : .9} />)}</g>
    <circle cx="166" cy="54" r="11" fill="#101C34" stroke="#D7BE70" strokeWidth="1.5" /><path d="M166 48v6l5 3" fill="none" stroke="#D7BE70" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}

export function CasinoArt() {
  return <svg {...frame}>
    <defs>
      <linearGradient id="agx-c1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E1CB81" /><stop offset="1" stopColor="#AC8A3E" /></linearGradient>
      <linearGradient id="agx-c2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8DA8CF" /><stop offset="1" stopColor="#375781" /></linearGradient>
      <linearGradient id="agx-c3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#47658C" /><stop offset="1" stopColor="#203750" /></linearGradient>
    </defs>
    <Net c="#7894BD" d="M18 20 56 10 96 22 150 8 184 24" />
    <ellipse cx="100" cy="70" rx="48" ry="4" fill="#0B1526" opacity=".6" />
    <path d="M62 38h76v30a4 4 0 0 1-4 4H66a4 4 0 0 1-4-4z" fill="url(#agx-c3)" />
    <path d="M62 38h38v34H66a4 4 0 0 1-4-4z" fill="#000" opacity=".12" />
    <rect x="56" y="26" width="88" height="15" rx="4" fill="url(#agx-c2)" /><rect x="56" y="26" width="88" height="4" rx="2" fill="#fff" opacity=".25" />
    <rect x="93" y="26" width="14" height="46" fill="url(#agx-c1)" />
    <path d="M100 26c-10-17-28-14-22-4 4 6 14 4 22 4zM100 26c10-17 28-14 22-4-4 6-14 4-22 4z" fill="url(#agx-c1)" stroke="#92400E" strokeWidth="1" />
    <circle cx="100" cy="26" r="4.5" fill="#FDE68A" stroke="#92400E" strokeWidth="1" />
    <g className="agx-conf"><circle cx="164" cy="34" r="9" fill="url(#agx-c1)" stroke="#92400E" strokeWidth="1.2" /><circle cx="164" cy="34" r="4" fill="none" stroke="#92400E" strokeWidth="1" />
      <rect x="40" y="30" width="7" height="7" rx="2" fill="#94AFCF" transform="rotate(25 44 34)" /><rect x="150" y="10" width="7" height="7" rx="2" fill="#D6DFED" transform="rotate(-20 154 14)" /><path d="M170 56l3 7 3-7z" fill="#D7BE70" /><path d="M52 52l3 7 3-7z" fill="#D7BE70" /></g>
  </svg>;
}
