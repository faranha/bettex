const candles: [number, number, number][] = [
  [330, 560, 600], [372, 540, 590], [414, 570, 610], [456, 520, 565], [498, 500, 545],
  [540, 530, 575], [582, 480, 525], [624, 450, 500], [666, 470, 510], [708, 420, 470],
  [750, 400, 450], [792, 430, 465], [834, 380, 430], [876, 350, 400], [918, 365, 400],
  [960, 310, 365], [1002, 280, 335], [1044, 250, 300], [1086, 220, 270], [1128, 190, 240],
];

const BODY = 'M430 380C470 300 600 262 760 285C900 303 1000 282 1092 232C1086 262 1070 290 1040 316C960 380 880 392 760 424C640 456 520 476 452 434C432 422 424 400 430 380Z';

export function FreeformWhaleArtwork() {
  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="hw-body"><path d={BODY} /></clipPath>
        <linearGradient id="hw-fade" x1="0" x2="1">
          <stop offset="0" stopColor="#5F86FF" stopOpacity="0" />
          <stop offset=".5" stopColor="#5F86FF" stopOpacity=".7" />
          <stop offset="1" stopColor="#F2B632" stopOpacity=".95" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="#5F86FF" strokeWidth="1" opacity=".16">
        {[120, 220, 320, 420, 520, 620].map((y) => <path key={y} d={`M0 ${y}H1200`} strokeDasharray="2 10" />)}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M0 ${560 + i * 30}C200 ${540 + i * 30} 300 ${590 + i * 30} 500 ${565 + i * 30}S900 ${540 + i * 30} 1200 ${575 + i * 30}`} />
        ))}
      </g>
      <g className="hw-candles" strokeLinecap="round">
        {candles.map(([x, top, bot], i) => {
          const c = i % 4 === 3 ? '#F2B632' : '#5F86FF';
          return (
            <g key={x} opacity=".5">
              <path d={`M${x} ${top - 26}V${bot + 22}`} stroke={c} strokeWidth="1.5" />
              <rect x={x - 8} y={top} width="16" height={bot - top} fill="none" stroke={c} strokeWidth="1.5" />
              {[0, 1, 2, 3, 4].map((k) => {
                const yy = top + 8 + k * 9;
                return yy < bot ? <path key={k} d={`M${x - 8} ${yy}L${x + 8} ${yy - 7}`} stroke={c} strokeWidth=".8" /> : null;
              })}
            </g>
          );
        })}
      </g>
      <g className="hw-whale">
        <path d={BODY} fill="#0B1235" />
        <g clipPath="url(#hw-body)" fill="none" stroke="#7FA0FF" strokeLinecap="round">
          {Array.from({ length: 34 }).map((_, i) => (
            <path key={i} d={`M${420 + i * 20} 260C${440 + i * 20} 300 ${430 + i * 20} 340 ${400 + i * 20} 380`} strokeWidth=".9" opacity={0.18 + (i % 5) * 0.05} />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <path key={`p${i}`} d={`M${460 + i * 8} ${420 + i * 1.5}C${600 + i * 8} ${420 - i * 2} ${720 + i * 6} ${400 - i * 2} ${860 + i * 4} ${380 - i * 2}`} strokeWidth="1" stroke="#F4F1E8" opacity=".3" />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => <circle key={`b${i}`} cx={448 + i * 14} cy={330 + (i % 2) * 8} r="2.2" stroke="#F2B632" strokeWidth=".9" />)}
        </g>
        <path d={BODY} fill="none" stroke="#9DB6FF" strokeWidth="2" strokeLinejoin="round" />
        <path d="M436 398C480 420 560 420 640 396" fill="none" stroke="#C9D6FF" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="598" cy="386" r="6" fill="#070B1F" stroke="#F2B632" strokeWidth="1.6" />
        <circle cx="596" cy="384" r="1.6" fill="#F4F1E8" />
        <path d="M900 296C920 268 940 258 960 262C950 276 952 290 960 298Z" fill="#0B1235" stroke="#9DB6FF" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M600 436C560 520 500 590 396 650C470 650 580 590 664 452Z" fill="#0B1235" stroke="#9DB6FF" strokeWidth="1.8" strokeLinejoin="round" />
        <g fill="none" stroke="#7FA0FF" strokeWidth=".9" opacity=".5">
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${612 - i * 4} ${450 + i * 6}C${570 - i * 14} ${520 + i * 4} ${510 - i * 14} ${570 + i * 2} ${430 - i * 4} ${630 - i * 2}`} />)}
        </g>
        <path d="M1092 232C1110 200 1150 160 1196 118C1170 150 1160 176 1140 196C1170 188 1190 192 1200 198C1160 220 1130 244 1092 232Z" fill="#0B1235" stroke="#F2B632" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M1100 228C1130 200 1160 170 1186 134" fill="none" stroke="#F2B632" strokeWidth=".9" opacity=".6" />
      </g>
      <path className="hw-line" pathLength="1" d="M0 640C120 630 180 600 260 610S380 560 450 560S560 500 640 520S740 440 820 430S940 340 1010 300S1130 200 1200 150" fill="none" stroke="url(#hw-fade)" strokeWidth="3" strokeLinecap="round" />
      <g fill="none" stroke="#9DB6FF" opacity=".4">
        {[[410, 350, 5], [392, 322, 3], [376, 296, 4], [366, 268, 2.5]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} />)}
      </g>
    </svg>
  );
}
