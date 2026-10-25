const coins: Array<[number, number, string]> = [[150, 10, 'USDC'], [210, 0, 'B'], [265, 20, 'USDC'], [180, -50, 'B'], [240, -60, 'USDC']];

export function EarningsWalletIllustration() {
  return (
    <div className="ew-art" aria-hidden="true">
      <svg viewBox="0 0 420 400">
        <defs>
          <radialGradient id="ew-glow"><stop offset="0" stopColor="#F2B632" stopOpacity=".45" /><stop offset="1" stopColor="#F2B632" stopOpacity="0" /></radialGradient>
          <linearGradient id="ew-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2B59FF" /><stop offset="1" stopColor="#13204F" /></linearGradient>
          <linearGradient id="ew-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFD266" /><stop offset="1" stopColor="#D9961A" /></linearGradient>
        </defs>
        <ellipse cx="210" cy="300" rx="200" ry="90" fill="url(#ew-glow)" />
        <circle cx="210" cy="200" r="150" fill="none" stroke="#5F86FF" strokeOpacity=".25" strokeDasharray="3 8" className="hi-dash" />
        <rect x="95" y="215" width="230" height="30" rx="8" fill="#0A1030" opacity=".6" />
        <path d="M110 250 L128 215 H292 L310 250 Z" fill="#070B1F" />
        {coins.map(([x, y, t], i) => (
          <g key={i} className="ew-coin">
            <g transform={`translate(${x} ${y + 60})`}>
              <circle r="21" fill="url(#ew-gold)" stroke="#8a5d0a" strokeWidth="2" />
              <circle r="15" fill="none" stroke="#fff3c9" strokeOpacity=".7" />
              <text y={t === 'B' ? 7 : 4} textAnchor="middle" fontSize={t === 'B' ? 20 : 9} fontWeight="800" fill="#6b4606" fontFamily="var(--app-font-serif)">{t}</text>
            </g>
          </g>
        ))}
        <rect x="70" y="235" width="280" height="140" rx="26" fill="url(#ew-body)" stroke="#8FA8FF" strokeOpacity=".5" strokeWidth="2" />
        <path d="M70 265 H350" stroke="#070B1F" strokeOpacity=".35" strokeWidth="2" />
        <rect x="258" y="288" width="108" height="56" rx="18" fill="#0D1530" stroke="#F2B632" strokeWidth="3" />
        <circle cx="286" cy="316" r="8" fill="#F2B632" />
        <circle cx="140" cy="318" r="30" fill="#0D1530" stroke="#F2B632" strokeWidth="3" />
        <text x="140" y="330" textAnchor="middle" fontSize="34" fontWeight="800" fill="#F2B632" fontFamily="var(--app-font-serif)">B</text>
      </svg>
    </div>
  );
}
