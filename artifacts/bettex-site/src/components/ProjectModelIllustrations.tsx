import './ProjectModelIllustrations.css';

function Mark({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path fill="#123A3B" d="M8 8h41l7 7v41H15l-7-7V8Z" />
      <path fill="#A4EACB" d="M17 15h6v34h-6V15Zm10 0h12l9 8v4l-5 5 6 8v3l-9 6H27v-6h11l4-3-4-5H27v-6h11l4-4-4-4H27v-6Z" />
    </g>
  );
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#d9f7e5" />
        <stop offset="1" stopColor="#7fd0ab" />
      </linearGradient>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2f7a70" />
        <stop offset="1" stopColor="#184f50" />
      </linearGradient>
      <linearGradient id={`${id}-warm`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffe8c4" />
        <stop offset="1" stopColor="#e7a974" />
      </linearGradient>
    </defs>
  );
}

/* Step 1: a BETTEX token standing on edge over a stack of tokens */
export function TokenIllustration() {
  const id = 'pmi1';
  return (
    <svg className="pmi-art" viewBox="0 0 150 84" aria-hidden="true" focusable="false">
      <Defs id={id} />
      <ellipse cx="62" cy="76" rx="52" ry="5" fill="#04201f" opacity=".4" />
      {/* stacked tokens */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0 ${-i * 7})`}>
          <path d="M14 66v7c0 4 21 7 48 7s48-3 48-7v-7z" fill="#0f3a3a" stroke="#a2dcc1" strokeOpacity=".55" />
          <ellipse cx="62" cy="66" rx="48" ry="7" fill={`url(#${id}-body)`} stroke="#b6efca" strokeOpacity=".7" />
        </g>
      ))}
      <ellipse cx="62" cy="45" rx="48" ry="7" fill="none" stroke="#b6efca" strokeOpacity=".35" strokeDasharray="2 4" />
      {/* hero token */}
      <g className="pmi-drop">
        <circle cx="62" cy="31" r="27" fill="#0b2c31" transform="translate(3 4)" />
        <circle cx="62" cy="31" r="27" fill={`url(#${id}-face)`} stroke="#eafcf0" strokeWidth="2" />
        <circle cx="62" cy="31" r="22" fill="none" stroke="#2d7169" strokeWidth="1.3" strokeDasharray="1.5 3" />
        <Mark x={46} y={15} s={0.5} />
      </g>
      {/* warm participation coins */}
      <circle cx="126" cy="60" r="10" fill={`url(#${id}-warm)`} stroke="#ffe0ad" strokeWidth="1.5" />
      <circle cx="126" cy="60" r="6" fill="none" stroke="#a56a4d" strokeOpacity=".6" />
      <path d="M126 14v10M121 19h10" stroke="#f3c9a6" strokeWidth="2" strokeLinecap="round" className="pmi-pulse" />
    </svg>
  );
}

/* Step 2: token dropping into the Carteira (wallet) */
export function DepositIllustration() {
  const id = 'pmi2';
  return (
    <svg className="pmi-art" viewBox="0 0 150 84" aria-hidden="true" focusable="false">
      <Defs id={id} />
      <ellipse cx="72" cy="78" rx="58" ry="4" fill="#04201f" opacity=".4" />
      {/* wallet back */}
      <rect x="16" y="38" width="112" height="38" rx="9" fill="#0f3a3a" stroke="#a2dcc1" strokeOpacity=".5" />
      {/* falling trail */}
      <path d="M72 2v12" stroke="#b6efca" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 5" className="pmi-pulse" />
      <g className="pmi-drop">
        <circle cx="72" cy="27" r="16" fill="#0b2c31" transform="translate(2 3)" />
        <circle cx="72" cy="27" r="16" fill={`url(#${id}-face)`} stroke="#eafcf0" strokeWidth="1.6" />
        <Mark x={60} y={15} s={0.375} />
      </g>
      {/* wallet front */}
      <path d="M16 50a9 9 0 0 1 9-9h94a9 9 0 0 1 9 9v17a9 9 0 0 1-9 9H25a9 9 0 0 1-9-9z" fill={`url(#${id}-body)`} stroke="#b6efca" strokeOpacity=".75" />
      <path d="M22 45h100" stroke="#b6efca" strokeWidth="2" strokeLinecap="round" opacity=".85" />
      <path d="M22 70h100" stroke="#0b2c31" strokeOpacity=".4" />
      {/* clasp */}
      <rect x="100" y="52" width="36" height="16" rx="8" fill="#0f3a3a" stroke="#f3c9a6" strokeWidth="1.5" />
      <circle cx="112" cy="60" r="3.5" fill={`url(#${id}-warm)`} />
    </svg>
  );
}

/* Step 3: the BETTEX AI hub coordinating four agent nodes */
export function CoordinationIllustration() {
  const id = 'pmi3';
  const nodes = [
    { x: 46, y: 20, c: '#b6efca', g: 'pred' },
    { x: 46, y: 64, c: '#f3c9a6', g: 'trade' },
    { x: 194, y: 20, c: '#e7a974', g: 'sport' },
    { x: 194, y: 64, c: '#d98069', g: 'casino' },
  ];
  return (
    <svg className="pmi-art" viewBox="0 0 240 84" aria-hidden="true" focusable="false">
      <Defs id={id} />
      <ellipse cx="120" cy="42" rx="100" ry="36" fill="none" stroke="#b6efca" strokeOpacity=".16" strokeDasharray="2 5" />
      {nodes.map((n) => (
        <path key={n.g} className="pmi-flow" d={`M120 42 ${n.x < 120 ? n.x + 17 : n.x - 17} ${n.y}`} stroke={n.c} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      ))}
      {/* hub */}
      <circle cx="120" cy="42" r="31" fill="#1d5a56" stroke="#b6efca" strokeOpacity=".5" />
      <circle cx="120" cy="42" r="26" fill="#0b2c31" transform="translate(0 3)" />
      <circle cx="120" cy="42" r="26" fill={`url(#${id}-face)`} stroke="#eafcf0" strokeWidth="1.6" />
      <Mark x={101} y={23} s={0.6} />
      {nodes.map((n) => (
        <g key={n.g}>
          <circle cx={n.x} cy={n.y + 3} r="17" fill="#04201f" opacity=".45" />
          <circle cx={n.x} cy={n.y} r="17" fill="#184f50" stroke={n.c} strokeWidth="1.8" />
          <g stroke={n.c} fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${n.x} ${n.y})`}>
            {n.g === 'pred' && (<><path d="M-8 0h7M-1 0 5-7M-1 0 5 7" /><circle cx="-9" cy="0" r="2" /><circle cx="7" cy="-8" r="2" /><circle cx="7" cy="8" r="2" /></>)}
            {n.g === 'trade' && (<><path d="M-7-6v12M0-9v14M7-4v10" /><path d="M-9 4l6-4 5 2 7-7" strokeWidth="1.3" /></>)}
            {n.g === 'sport' && (<><circle r="8" /><path d="M0-3.5 3.5-1 2 3h-4l-1.500-4Z" fill={n.c} fillOpacity=".4" /><path d="M0-3.500V-8M3.500-1 8-2.500M2 3l3 4M-2 3l-3 4M-3.500-1-8-2.500" strokeWidth="1.2" /></>)}
            {n.g === 'casino' && (<path d="M0-9c-2.5 3-8 6.5-8 10.5a4 4 0 0 0 7 2C-1 6-2 7.5-4 9h8C2 7.5 1 6 1 3.5a4 4 0 0 0 7-2C8-2.5 2.5-6 0-9Z" fill={n.c} strokeWidth="1" />)}
          </g>
        </g>
      ))}
    </svg>
  );
}
