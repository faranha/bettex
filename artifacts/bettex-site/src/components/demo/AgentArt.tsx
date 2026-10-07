/** @jsxImportSource react */
export function CryptoBarsArt() {
  const h = [30, 46, 38, 62, 50, 78, 58, 90, 70, 100, 80, 66];
  return <svg className="agx-cbg" viewBox="0 0 240 100" preserveAspectRatio="none" aria-hidden focusable="false">
    <defs><linearGradient id="agx-cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FA2FF" /><stop offset="1" stopColor="#2B59FF" stopOpacity=".35" /></linearGradient></defs>
    {h.map((v, i) => <g key={i}>
      <rect x={6 + i * 19.5} y={100 - v} width="13" height={v} rx="2.5" fill="url(#agx-cb)" opacity={0.35 + (i % 4) * 0.12} />
      <rect x={6 + i * 19.5} y={100 - v} width="13" height="3" rx="1.5" fill="#B8CBFF" opacity=".7" />
    </g>)}
  </svg>;
}

export function PredictionArt() {
  return <svg className="agx-art" viewBox="0 0 200 76" aria-hidden focusable="false">
    <defs>
      <linearGradient id="agx-p1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6F93FF" /><stop offset="1" stopColor="#2B59FF" /></linearGradient>
      <linearGradient id="agx-p2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD56B" /><stop offset="1" stopColor="#F2B632" /></linearGradient>
    </defs>
    <g transform="translate(96 8) rotate(8 40 30)"><rect width="84" height="58" rx="9" fill="#1B3A9E" stroke="#8FB0FF" /><rect x="10" y="12" width="40" height="6" rx="3" fill="#8FB0FF" /><rect x="10" y="24" width="56" height="5" rx="2.5" fill="#4E73D8" /><rect x="10" y="35" width="30" height="5" rx="2.5" fill="#4E73D8" /><circle cx="66" cy="44" r="8" fill="url(#agx-p2)" /></g>
    <g transform="translate(14 6) rotate(-6 36 32)">
      <rect y="3" width="76" height="62" rx="10" fill="#0A1233" opacity=".5" />
      <rect width="76" height="62" rx="10" fill="#F4F1E8" />
      <path d="M0 10a10 10 0 0 1 10-10h56a10 10 0 0 1 10 10v10H0z" fill="url(#agx-p1)" />
      <rect x="18" y="-4" width="5" height="12" rx="2.5" fill="#F2B632" /><rect x="53" y="-4" width="5" height="12" rx="2.5" fill="#F2B632" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <rect key={i} x={9 + (i % 4) * 15} y={27 + Math.floor(i / 4) * 14} width="10" height="9" rx="2.5" fill={i === 5 ? 'url(#agx-p2)' : '#C9D3F5'} />)}
    </g>
    <g transform="translate(150 44)"><circle r="14" fill="#F2B632" stroke="#0A1233" strokeWidth="2" /><path d="M0-8V0l6 4" fill="none" stroke="#0A1233" strokeWidth="2.5" strokeLinecap="round" /></g>
  </svg>;
}

export function CasinoArt() {
  return <svg className="agx-art" viewBox="0 0 200 76" aria-hidden focusable="false">
    <defs>
      <linearGradient id="agx-c1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFD56B" /><stop offset="1" stopColor="#E89A1C" /></linearGradient>
      <linearGradient id="agx-c2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4A73FF" /><stop offset="1" stopColor="#2B59FF" /></linearGradient>
    </defs>
    <ellipse cx="100" cy="70" rx="60" ry="5" fill="#0A1233" opacity=".45" />
    <path d="M62 34h76v32a4 4 0 0 1-4 4H66a4 4 0 0 1-4-4z" fill="url(#agx-c2)" />
    <path d="M62 34l14-9h62l0 9z" fill="#6F93FF" opacity=".0" />
    <rect x="56" y="22" width="88" height="16" rx="4" fill="#6F93FF" />
    <rect x="93" y="22" width="14" height="48" fill="url(#agx-c1)" />
    <path d="M100 22c-10-18-30-14-24-4 4 6 16 4 24 4zM100 22c10-18 30-14 24-4-4 6-16 4-24 4z" fill="#F2B632" stroke="#0A1233" strokeWidth="1.5" />
    <circle cx="100" cy="22" r="5" fill="#FFD56B" stroke="#0A1233" strokeWidth="1.5" />
    <g className="agx-conf"><circle cx="30" cy="22" r="7" fill="#F2B632" stroke="#0A1233" strokeWidth="1.5" /><circle cx="172" cy="30" r="9" fill="#F2B632" stroke="#0A1233" strokeWidth="1.5" /><circle cx="172" cy="30" r="4" fill="none" stroke="#0A1233" strokeWidth="1.5" />
      <rect x="44" y="48" width="8" height="8" rx="2" fill="#8FB0FF" transform="rotate(25 48 52)" /><rect x="158" y="8" width="8" height="8" rx="2" fill="#FFF" transform="rotate(-20 162 12)" /><path d="M20 50l4 8 4-8z" fill="#6F93FF" /><path d="M146 54l3 6 3-6z" fill="#FFD56B" /></g>
  </svg>;
}
