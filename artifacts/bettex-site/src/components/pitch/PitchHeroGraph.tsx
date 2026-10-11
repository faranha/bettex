import { t, useLocale } from '@/lib/i18n';
import './PitchHeroGraph.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const COPY = {
  alt: 'Ilustração: uma pessoa no centro da rede do orquestrador BETTEX, ligado a análise, risco, execução, conciliação e mercados.',
  label: 'Orquestrador agêntico BETTEX, ilustração conceitual',
  fns: ['Análise', 'Risco', 'Execução', 'Conciliação'],
  orch: 'BETTEX',
};
const FN: [number, number, boolean][] = [[44, 210, true], [44, 400, true], [556, 210, false], [556, 400, false]];
const MK: [number, number, string][] = [[150, 80, 'BTC'], [300, 44, 'ETH'], [450, 80, 'SOL']];
const CORE: [number, number] = [92, 508];
/** Small unlabeled secondary nodes: density only. */
const LINKS: [number, number, number, number][] = [
  [150, 80, 44, 210], [300, 44, 44, 210], [300, 44, 556, 210], [450, 80, 556, 210],
  [44, 210, 44, 400], [556, 210, 556, 400],
];

export function PitchHeroGraph() {
  useLocale();
  const c = COPY;
  const [a, r, e, k] = FN;
  return <div className="phg" role="img" aria-label={t(c.alt)}>
    <svg viewBox="0 0 600 600" aria-hidden="true" focusable="false">
      <circle className="phg__ring" cx="300" cy="300" r="150" />
      <circle className="phg__ring phg__ring--outer" cx="300" cy="300" r="250" />
      <g className="phg__mesh">{LINKS.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}</g>
      <g className="phg__coord">
        {FN.map(([x, y], i) => <path key={i} d={`M${CORE[0]} ${CORE[1]} Q${i < 2 ? 40 : 330} ${i % 2 ? 450 : 330} ${x} ${y}`} />)}
      </g>
      <defs>
        <linearGradient id="phg-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".7" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
        <mask id="phg-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="600"><rect width="600" height="600" fill="url(#phg-fade)" /></mask>
      </defs>
      <image href={`${BASE}/hero-person-centered.webp`} x="170" y="76" width="260" height="500" mask="url(#phg-mask)" preserveAspectRatio="xMidYMax meet" />
      {FN.map(([x, y, al], i) => <g key={i} className="phg__node">
        <circle cx={x} cy={y} r="5" /><text x={x + (al ? 14 : -14)} y={y + 5} textAnchor={al ? 'start' : 'end'}>{t(c.fns[i])}</text>
      </g>)}
      {MK.map(([x, y, n]) => <g key={n} className="phg__node phg__node--mk"><circle cx={x} cy={y} r="4" /><text x={x} y={y - 12} textAnchor="middle">{n}</text></g>)}
      <g className="phg__core">
        <circle cx={CORE[0]} cy={CORE[1]} r="30" />
        <image href={`${BASE}/bettex-mark.svg`} x={CORE[0] - 17} y={CORE[1] - 17} width="34" height="34" />
        <text x={CORE[0]} y={CORE[1] + 54} textAnchor="middle">{c.orch}</text>
      </g>
    </svg>
    <span className="sr-only">{t(c.label)}</span>
  </div>;
}
