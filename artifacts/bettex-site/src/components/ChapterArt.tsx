import './ChapterArt.css';

const ink = '#070B1F';
const navy = '#13204F';
const blue = '#2B59FF';
const gold = '#F2B632';

/** 0 vision, 1 agents, 2 roadmap, 3 risks */
function Scene({ n }: { n: number }) {
  if (n === 0) {
    return <>
      <g fill="none" stroke={navy} strokeOpacity=".28">
        {[56, 42, 28].map(r => <circle key={r} cx="300" cy="62" r={r} />)}
      </g>
      <circle cx="300" cy="62" r="13" fill={gold} />
      <path d="M0 96 C60 78 110 106 170 90 S270 74 360 92" fill="none" stroke={blue} strokeWidth="3" strokeLinecap="round" />
      <path d="M0 108 C70 94 120 116 180 104 S290 92 360 106" fill="none" stroke={navy} strokeOpacity=".3" strokeWidth="1.5" />
      <circle cx="170" cy="90" r="5" fill={ink} />
    </>;
  }
  if (n === 1) {
    const pts: [number, number][] = [[200, 22], [270, 36], [316, 78], [250, 104], [196, 92], [150, 56]];
    return <>
      <g stroke={navy} strokeOpacity=".3">
        {pts.map(([x, y]) => <path key={x} d={`M236 62 L${x} ${y}`} />)}
      </g>
      {pts.map(([x, y], i) => <circle key={x} cx={x} cy={y} r={i % 2 ? 7 : 9} fill={i % 2 ? gold : blue} />)}
      <circle cx="236" cy="62" r="26" fill={ink} />
      <circle cx="236" cy="62" r="38" fill="none" stroke={gold} strokeWidth="2" />
      <circle cx="236" cy="62" r="9" fill={gold} />
    </>;
  }
  if (n === 2) {
    const xs = [30, 92, 154, 216, 278, 336];
    const ys = [96, 82, 70, 54, 40, 26];
    return <>
      <path d={xs.map((x, i) => `${i ? 'L' : 'M'}${x} ${ys[i]}`).join(' ')} fill="none" stroke={blue} strokeWidth="3" strokeLinejoin="round" />
      <path d="M10 108 H350" stroke={navy} strokeOpacity=".3" strokeDasharray="3 6" />
      {xs.map((x, i) => <g key={x}>
        <path d={`M${x} ${ys[i] + 9} V108`} stroke={navy} strokeOpacity=".3" />
        <circle cx={x} cy={ys[i]} r={i === 0 ? 10 : 7} fill={i === 0 ? gold : '#F4F1E8'} stroke={i === 0 ? gold : ink} strokeWidth="2.5" />
      </g>)}
    </>;
  }
  return <>
    <g fill="none" stroke={navy} strokeOpacity=".28" strokeDasharray="2 6">
      <circle cx="250" cy="62" r="54" />
    </g>
    <path d="M250 8 L298 25 V58 C298 82 276 100 250 112 C224 100 202 82 202 58 V25 Z" fill="none" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
    <path d="M250 26 L282 37 V58 C282 74 268 86 250 95 C232 86 218 74 218 58 V37 Z" fill={blue} />
    <path d="M236 60 L246 70 L266 48" fill="none" stroke="#F4F1E8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="298" cy="25" r="6" fill={gold} />
  </>;
}

export function ChapterArt({ n }: { n: number }) {
  return <div className="chapter-art" aria-hidden="true" role="presentation">
    <svg viewBox="0 0 360 120" preserveAspectRatio="xMaxYMid meet" focusable="false"><Scene n={n} /></svg>
  </div>;
}
