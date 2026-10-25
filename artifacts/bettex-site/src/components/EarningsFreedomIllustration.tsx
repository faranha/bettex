export function EarningsFreedomIllustration() {
  return (
    <div className="ew-art ew-free-art" aria-hidden="true" data-testid="illustration-earnings-freedom">
      <svg viewBox="0 0 460 450" focusable="false">
        <defs>
          <radialGradient id="ef-glow"><stop offset="0" stopColor="#F2B632" stopOpacity=".34" /><stop offset="1" stopColor="#F2B632" stopOpacity="0" /></radialGradient>
          <linearGradient id="ef-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFE08A" /><stop offset=".5" stopColor="#F2B632" /><stop offset="1" stopColor="#C98512" /></linearGradient>
          <linearGradient id="ef-phone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1B3398" /><stop offset="1" stopColor="#0D1530" /></linearGradient>
        </defs>
        <ellipse cx="230" cy="230" rx="225" ry="205" fill="url(#ef-glow)" />
        <ellipse cx="230" cy="428" rx="150" ry="12" fill="#070B1F" opacity=".25" />
        {/* body */}
        <path d="M110 430 Q110 318 190 306 H270 Q350 318 350 430 Z" fill="#2B59FF" />
        <path d="M190 306 L230 350 L270 306" fill="#F4F1E8" />
        <rect x="210" y="270" width="40" height="44" rx="16" fill="#C98F63" />
        {/* head */}
        <ellipse cx="230" cy="236" rx="46" ry="52" fill="#D9A074" />
        <path d="M184 232 Q180 176 232 178 Q284 178 276 236 Q262 204 228 206 Q196 206 184 232 Z" fill="#1a1208" />
        <circle cx="212" cy="240" r="3.5" fill="#1a1208" /><circle cx="248" cy="240" r="3.5" fill="#1a1208" />
        <path d="M216 262 Q230 274 244 262" fill="none" stroke="#7A3F22" strokeWidth="3" strokeLinecap="round" />
        {/* arm + phone */}
        <path d="M150 400 Q130 340 190 340 L250 372" fill="none" stroke="#1B3398" strokeWidth="38" strokeLinecap="round" />
        <g transform="rotate(-6 240 340)">
          <rect x="196" y="262" width="128" height="176" rx="20" fill="url(#ef-phone)" stroke="#8FA8FF" strokeWidth="3" />
          <rect x="206" y="278" width="108" height="144" rx="12" fill="#070B1F" />
          <circle cx="238" cy="312" r="16" fill="url(#ef-gold)" stroke="#9A6409" strokeWidth="2" />
          <rect x="262" y="302" width="40" height="7" rx="3.5" fill="#8FA8FF" opacity=".7" />
          <rect x="262" y="315" width="26" height="6" rx="3" fill="#8FA8FF" opacity=".4" />
          <rect x="216" y="342" width="88" height="30" rx="15" fill="#2B59FF" />
          <path d="M232 357 H270 M262 350 L270 357 L262 364" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="216" y="380" width="88" height="30" rx="15" fill="none" stroke="#F2B632" strokeWidth="2.5" />
          <rect x="232" y="390" width="26" height="12" rx="3" fill="none" stroke="#F2B632" strokeWidth="2.5" />
          <circle cx="288" cy="396" r="5" fill="url(#ef-gold)" />
        </g>
        {/* tokens leaving, two paths */}
        <path d="M322 290 Q372 250 404 196" fill="none" stroke="#2B59FF" strokeWidth="3" strokeDasharray="6 7" strokeLinecap="round" className="hi-dash" />
        <path d="M326 330 Q388 330 410 292" fill="none" stroke="#F2B632" strokeWidth="3" strokeDasharray="6 7" strokeLinecap="round" className="hi-dash" />
        {[[408, 180, 1.1], [416, 270, 1], [62, 150, .9], [92, 96, .7]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <circle r="24" cy="4" fill="#B87A10" />
            <circle r="24" fill="url(#ef-gold)" stroke="#9A6409" strokeWidth="2" />
            <circle r="17" fill="none" stroke="#FFF3C9" strokeOpacity=".75" strokeWidth="1.5" />
            <path d="M-14 -6 A16 16 0 0 1 4 -15" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ))}
        {/* own wallet */}
        <rect x="360" y="330" width="80" height="56" rx="14" fill="#13204F" stroke="#8FA8FF" strokeWidth="2.5" />
        <circle cx="418" cy="358" r="7" fill="url(#ef-gold)" />
      </svg>
    </div>
  );
}
