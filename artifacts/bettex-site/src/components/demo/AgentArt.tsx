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
    <defs><linearGradient id="agx-cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38BDF8" /><stop offset="1" stopColor="#4F46E5" stopOpacity=".35" /></linearGradient></defs>
    {h.map((v, i) => <g key={i}>
      <rect x={6 + i * 19.5} y={100 - v} width="13" height={v} rx="2.5" fill="url(#agx-cb)" opacity={0.3 + (i % 4) * 0.1} />
      <rect x={6 + i * 19.5} y={100 - v} width="13" height="2" rx="1" fill="#BAE6FD" opacity=".7" />
    </g>)}
    <path d="M6 70 45 52 84 60 123 30 162 38 201 8" fill="none" stroke="#7DD3FC" strokeWidth=".9" opacity=".6" vectorEffect="non-scaling-stroke" />
  </svg>;
}

export function SportsBrainArt({ label, l1, l2 }: { label: string; l1: string; l2: string }) {
  const base = import.meta.env.BASE_URL;
  return <div className="agx-brainart" role="img" aria-label={label}>
    <svg className="agx-links" viewBox="0 0 320 220" aria-hidden focusable="false" fill="none" strokeLinecap="round">
      <g stroke="#FB923C" strokeWidth="1" opacity=".75"><path d="M92 62 128 84M92 150 126 128M232 74 200 90M236 158 204 134" /></g>
      <g fill="#FDBA74"><circle cx="92" cy="62" r="2.5" /><circle cx="92" cy="150" r="2.5" /><circle cx="232" cy="74" r="2.5" /><circle cx="236" cy="158" r="2.5" /></g>
      <g transform="translate(10 40)"><rect width="82" height="48" rx="10" fill="rgba(20,8,16,.75)" stroke="rgba(251,146,60,.55)" />
        {[16, 30, 22, 38, 28].map((v, i) => <rect key={i} x={10 + i * 13} y={42 - v} width="8" height={v} rx="2" fill={i === 3 ? '#FBBF24' : '#FB923C'} opacity={i === 3 ? 1 : .7} />)}</g>
      <g transform="translate(10 128)"><rect width="82" height="44" rx="10" fill="rgba(20,8,16,.75)" stroke="rgba(244,114,182,.5)" />
        <path d="M10 32 24 24 38 28 54 14 72 10" stroke="#F472B6" strokeWidth="2" /><circle cx="72" cy="10" r="3" fill="#F472B6" stroke="none" /></g>
      <g transform="translate(232 56)"><rect width="78" height="36" rx="10" fill="rgba(20,8,16,.75)" stroke="rgba(94,234,212,.5)" /><circle cx="22" cy="18" r="9" stroke="#5EEAD4" strokeWidth="1.6" /><path d="M22 12v12M16 18h12" stroke="#5EEAD4" strokeWidth="1" /><rect x="38" y="13" width="30" height="4" rx="2" fill="#5EEAD4" opacity=".6" stroke="none" /><rect x="38" y="21" width="20" height="3" rx="1.5" fill="#5EEAD4" opacity=".35" stroke="none" /></g>
      <g transform="translate(232 140)"><rect width="78" height="36" rx="10" fill="rgba(20,8,16,.75)" stroke="rgba(251,191,36,.5)" /><rect x="10" y="9" width="58" height="18" rx="4" stroke="#FBBF24" strokeWidth="1.2" /><path d="M39 9v18M10 18h58" stroke="#FBBF24" strokeWidth="1" opacity=".6" /></g>
    </svg>
    <div className="agx-brainbox">
      <img className="agx-brainimg" src={`${base}agents/bettex-intelligence-brain.webp`} alt="" width={640} height={640} loading="lazy" decoding="async" />
      <BrainEnergy />
    </div>
    <span className="agx-chip agx-chip-a" aria-hidden>{l1}</span>
    <span className="agx-chip agx-chip-b" aria-hidden>{l2}</span>
  </div>;
}

export function PredictionArt() {
  return <svg {...frame}>
    <defs>
      <linearGradient id="agx-p1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C4B5FD" /><stop offset="1" stopColor="#6D28D9" /></linearGradient>
      <linearGradient id="agx-p3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A1A5E" /><stop offset="1" stopColor="#150B3A" /></linearGradient>
    </defs>
    <Net c="#A78BFA" d="M18 20 60 8 104 18 150 6 184 24" />
    <g transform="translate(112 12) rotate(7 40 30)"><rect width="76" height="52" rx="8" fill="url(#agx-p3)" stroke="#8B5CF6" /><rect x="9" y="10" width="34" height="5" rx="2.5" fill="#A78BFA" /><rect x="9" y="22" width="52" height="4" rx="2" fill="#6D4FD0" /><rect x="9" y="32" width="28" height="4" rx="2" fill="#6D4FD0" /><circle cx="60" cy="40" r="5" fill="#22D3EE" /></g>
    <g transform="translate(30 10) rotate(-5 36 30)"><rect y="4" width="80" height="60" rx="9" fill="#08031F" opacity=".55" />
      <rect width="80" height="60" rx="9" fill="url(#agx-p3)" stroke="#A78BFA" strokeWidth="1.2" /><path d="M0 9a9 9 0 0 1 9-9h62a9 9 0 0 1 9 9v10H0z" fill="url(#agx-p1)" />
      <rect x="19" y="-4" width="4" height="11" rx="2" fill="#DDD6FE" /><rect x="57" y="-4" width="4" height="11" rx="2" fill="#DDD6FE" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <rect key={i} x={9 + (i % 4) * 16} y={26 + Math.floor(i / 4) * 16} width="11" height="10" rx="2.5" fill={i === 5 ? '#22D3EE' : i === 2 ? '#E879F9' : '#4B3A93'} opacity={i === 5 || i === 2 ? 1 : .9} />)}</g>
    <circle cx="166" cy="54" r="11" fill="#150B3A" stroke="#22D3EE" strokeWidth="1.5" /><path d="M166 48v6l5 3" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}

export function CasinoArt() {
  return <svg {...frame}>
    <defs>
      <linearGradient id="agx-c1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FDE68A" /><stop offset="1" stopColor="#D97706" /></linearGradient>
      <linearGradient id="agx-c2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F472B6" /><stop offset="1" stopColor="#9D174D" /></linearGradient>
      <linearGradient id="agx-c3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#EC4899" /><stop offset="1" stopColor="#701A75" /></linearGradient>
    </defs>
    <Net c="#F472B6" d="M18 20 56 10 96 22 150 8 184 24" />
    <ellipse cx="100" cy="70" rx="48" ry="4" fill="#12020E" opacity=".6" />
    <path d="M62 38h76v30a4 4 0 0 1-4 4H66a4 4 0 0 1-4-4z" fill="url(#agx-c3)" />
    <path d="M62 38h38v34H66a4 4 0 0 1-4-4z" fill="#000" opacity=".12" />
    <rect x="56" y="26" width="88" height="15" rx="4" fill="url(#agx-c2)" /><rect x="56" y="26" width="88" height="4" rx="2" fill="#fff" opacity=".25" />
    <rect x="93" y="26" width="14" height="46" fill="url(#agx-c1)" />
    <path d="M100 26c-10-17-28-14-22-4 4 6 14 4 22 4zM100 26c10-17 28-14 22-4-4 6-14 4-22 4z" fill="url(#agx-c1)" stroke="#92400E" strokeWidth="1" />
    <circle cx="100" cy="26" r="4.5" fill="#FDE68A" stroke="#92400E" strokeWidth="1" />
    <g className="agx-conf"><circle cx="164" cy="34" r="9" fill="url(#agx-c1)" stroke="#92400E" strokeWidth="1.2" /><circle cx="164" cy="34" r="4" fill="none" stroke="#92400E" strokeWidth="1" />
      <rect x="40" y="30" width="7" height="7" rx="2" fill="#22D3EE" transform="rotate(25 44 34)" /><rect x="150" y="10" width="7" height="7" rx="2" fill="#E9D5FF" transform="rotate(-20 154 14)" /><path d="M170 56l3 7 3-7z" fill="#F472B6" /><path d="M52 52l3 7 3-7z" fill="#FBBF24" /></g>
  </svg>;
}
