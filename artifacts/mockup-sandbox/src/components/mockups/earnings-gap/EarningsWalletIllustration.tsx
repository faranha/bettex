import { useId } from 'react';

// Even the largest coin starts inside the viewBox and ends behind the wallet front.
// Denominations are decorative, not account balances or projected earnings.
const coins = [
  { x: 150, restY: 150, value: 1, scale: 0.78 },
  { x: 300, restY: 140, value: 50, scale: 1.3 },
  { x: 215, restY: 90, value: 10, scale: 1.02 },
  { x: 270, restY: 185, value: 20, scale: 1.16 },
  { x: 185, restY: 190, value: 5, scale: 0.9 },
];
const START_Y = 44;

export function EarningsWalletIllustration() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (n: string) => `ew-${n}-${uid}`;
  return (
    <div className="ew-art" aria-hidden="true">
      <svg viewBox="0 0 460 450" focusable="false">
        <defs>
          <radialGradient id={id('glow')}><stop offset="0" stopColor="#F2B632" stopOpacity=".38" /><stop offset="1" stopColor="#F2B632" stopOpacity="0" /></radialGradient>
          <radialGradient id={id('shadow')}><stop offset="0" stopColor="#02040f" stopOpacity=".7" /><stop offset="1" stopColor="#02040f" stopOpacity="0" /></radialGradient>
          <linearGradient id={id('body')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F5FFF" /><stop offset=".55" stopColor="#1B3398" /><stop offset="1" stopColor="#101C4A" /></linearGradient>
          <linearGradient id={id('back')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E2F7A" /><stop offset="1" stopColor="#0B1236" /></linearGradient>
          <linearGradient id={id('gold')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFE08A" /><stop offset=".5" stopColor="#F2B632" /><stop offset="1" stopColor="#C98512" /></linearGradient>
          <linearGradient id={id('edge')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B87A10" /><stop offset="1" stopColor="#7A4C06" /></linearGradient>
        </defs>
        <ellipse cx="230" cy="250" rx="225" ry="190" fill={`url(#${id('glow')})`} />
        <ellipse cx="230" cy="424" rx="190" ry="18" fill={`url(#${id('shadow')})`} />
        <rect x="76" y="236" width="308" height="80" rx="24" fill={`url(#${id('back')})`} stroke="#5F86FF" strokeOpacity=".35" strokeWidth="2" />
        <ellipse cx="230" cy="256" rx="142" ry="20" fill="#03061a" />
        <ellipse cx="230" cy="256" rx="142" ry="20" fill="none" stroke="#8FA8FF" strokeOpacity=".4" strokeWidth="2" />
        {coins.map(({ x, restY, value, scale }, i) => (
          <g
            key={i}
            className="ew-coin"
            style={{ ['--rest' as string]: `${restY - START_Y}px`, ['--delay' as string]: `${(-i * 0.96).toFixed(2)}s` }}
          >
            <g transform={`translate(${x} ${START_Y}) scale(${scale})`}>
              <circle r="24" cy="4" fill={`url(#${id('edge')})`} />
              <circle r="24" fill={`url(#${id('gold')})`} stroke="#9A6409" strokeWidth="2" />
              <circle r="18" fill="none" stroke="#FFF3C9" strokeOpacity=".75" strokeWidth="1.5" />
              <path d="M-16 -8 A18 18 0 0 1 4 -17" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" />
              <text y="-6" textAnchor="middle" fontSize="8" fontWeight="800" fill="#6B4606" fontFamily="var(--app-font-serif)">R$</text>
              <text y="11" textAnchor="middle" fontSize="18" fontWeight="800" fill="#6B4606" fontFamily="var(--app-font-serif)">{value}</text>
            </g>
          </g>
        ))}
        <path d="M60 296 Q60 268 90 268 H370 Q400 268 400 296 V382 Q400 412 370 412 H90 Q60 412 60 382 Z" fill={`url(#${id('body')})`} stroke="#8FA8FF" strokeOpacity=".55" strokeWidth="2" />
        <path d="M76 274 H384" stroke="#fff" strokeOpacity=".28" strokeWidth="3" strokeLinecap="round" />
        <path d="M84 392 H300" stroke="#8FA8FF" strokeOpacity=".4" strokeWidth="2" strokeDasharray="6 7" strokeLinecap="round" />
        <path d="M84 300 H250" stroke="#8FA8FF" strokeOpacity=".4" strokeWidth="2" strokeDasharray="6 7" strokeLinecap="round" />
        <image href={`${import.meta.env.BASE_URL}bettex-mark-gamblefi.svg`} x="130" y="312" width="60" height="60" opacity=".95" />
        <path d="M290 322 H408 Q422 322 422 336 V362 Q422 376 408 376 H290 Q268 376 268 349 Q268 322 290 322 Z" fill="#0D1530" stroke={`url(#${id('gold')})`} strokeWidth="4" />
        <circle cx="302" cy="349" r="10" fill={`url(#${id('gold')})`} stroke="#9A6409" strokeWidth="1.5" />
        <circle cx="299" cy="346" r="3" fill="#fff" fillOpacity=".7" />
      </svg>
    </div>
  );
}
