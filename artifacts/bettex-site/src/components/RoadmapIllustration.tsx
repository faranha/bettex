import './RoadmapIllustration.css';

const base = () => import.meta.env.BASE_URL;

function Scene({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (<>
        <rect x="40" y="150" width="240" height="90" rx="14" fill="#fff" stroke="#2B59FF" strokeWidth="3" />
        <circle cx="90" cy="105" r="24" fill="#2B59FF" /><circle cx="160" cy="85" r="30" fill="#F2B632" /><circle cx="230" cy="105" r="24" fill="#070B1F" />
        <path d="M70 150a20 20 0 0 1 40 0M135 150a25 25 0 0 1 50 0M205 150a20 20 0 0 1 50 0" fill="#fff" stroke="#2B59FF" strokeWidth="3" />
        <rect x="64" y="178" width="130" height="10" rx="5" fill="#E3EAFF" /><rect x="64" y="200" width="90" height="10" rx="5" fill="#E3EAFF" />
        <rect x="205" y="188" width="52" height="34" rx="10" fill="#F2B632" />
        <image href={`${base()}bettex-mark-gamblefi.svg`} x="136" y="62" width="48" height="48" />
      </>);
    case 1:
      return (<>
        <circle cx="160" cy="140" r="96" fill="#fff" stroke="#087FA5" strokeWidth="3" strokeDasharray="6 8" />
        <circle cx="160" cy="140" r="64" fill="#087FA5" /><circle cx="160" cy="140" r="50" fill="#DDF4FA" />
        <image href={`${base()}bettex-mark-gamblefi.svg`} x="130" y="110" width="60" height="60" />
        <path d="M160 18v34m-12-12 12 12 12-12" fill="none" stroke="#F2B632" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <g fill="#F2B632" stroke="#070B1F" strokeWidth="3"><circle cx="58" cy="206" r="16" /><circle cx="262" cy="206" r="16" /><circle cx="262" cy="74" r="12" /></g>
      </>);
    case 2:
      return (<>
        <rect x="30" y="196" width="260" height="14" rx="7" fill="#1f3e92" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={36 + i * 21} y={196} width="16" height="14" rx="4" fill={i < 4 ? '#F2B632' : '#2B59FF'} opacity={i < 4 ? 1 : 0.55} />)}
        <rect x="58" y="50" width="204" height="120" rx="16" fill="#0d1540" stroke="#F2B632" strokeWidth="3" />
        <circle cx="160" cy="110" r="42" fill="none" stroke="#2B59FF" strokeWidth="12" /><path d="M160 68a42 42 0 0 1 42 42" fill="none" stroke="#F2B632" strokeWidth="12" strokeLinecap="round" />
        <rect x="140" y="98" width="40" height="30" rx="7" fill="#F2B632" /><path d="M148 98v-8a12 12 0 0 1 24 0v8" fill="none" stroke="#F4F1E8" strokeWidth="5" />
      </>);
    case 3:
      return (<>
        <rect x="150" y="40" width="120" height="190" rx="20" fill="#fff" stroke="#0E9F6E" strokeWidth="3" />
        <rect x="166" y="64" width="88" height="14" rx="7" fill="#D9F5E9" /><rect x="166" y="92" width="88" height="48" rx="10" fill="#0E9F6E" opacity=".85" /><rect x="166" y="152" width="60" height="12" rx="6" fill="#D9F5E9" />
        <circle cx="210" cy="198" r="12" fill="#F2B632" />
        <path d="M24 140h70" stroke="#0E9F6E" strokeWidth="5" strokeLinecap="round" /><path d="M24 100h50M24 180h50" stroke="#0E9F6E" strokeWidth="5" strokeLinecap="round" opacity=".5" />
        <path d="M100 120l30 20-30 20" fill="none" stroke="#0E9F6E" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <g fill="#2B59FF"><circle cx="40" cy="60" r="10" /><circle cx="76" cy="44" r="7" /><circle cx="108" cy="64" r="9" /></g>
      </>);
    case 4:
      return (<>
        <path d="M30 220h260" stroke="#5E2BA8" strokeWidth="3" />
        {[0, 1, 2, 3].map(i => <g key={i}><circle cx={70 + i * 60} cy={160 - i * 28} r={26 + i * 3} fill={['#EBDDFB', '#fff', '#F2B632', '#8B4DE0'][i]} stroke="#5E2BA8" strokeWidth="3" /></g>)}
        <path d="M70 160L130 132 190 104 250 76" stroke="#8B4DE0" strokeWidth="3" strokeDasharray="5 7" fill="none" />
        <path d="M60 150h20M130 122h20M192 96v16M184 104h16" stroke="#070B1F" strokeWidth="4" strokeLinecap="round" />
        <path d="M241 76h18M250 67v18" stroke="#F4F1E8" strokeWidth="4" strokeLinecap="round" />
        <rect x="40" y="36" width="64" height="28" rx="14" fill="#fff" stroke="#8B4DE0" strokeWidth="3" /><circle cx="56" cy="50" r="7" fill="#8B4DE0" />
      </>);
    default:
      return (<>
        <path d="M30 220h50v-34h50v-34h50v-34h50v-34h30" fill="none" stroke="#E8505B" strokeWidth="4" strokeLinejoin="round" />
        <g fill="#FDE0E2" stroke="#E8505B" strokeWidth="3"><rect x="30" y="196" width="50" height="24" /><rect x="80" y="162" width="50" height="24" /><rect x="130" y="128" width="50" height="24" /></g>
        <rect x="190" y="30" width="86" height="76" rx="20" fill="#070B1F" /><circle cx="218" cy="62" r="8" fill="#F2B632" /><circle cx="248" cy="62" r="8" fill="#F2B632" /><path d="M214 84h38" stroke="#F4F1E8" strokeWidth="5" strokeLinecap="round" />
        <path d="M233 30V16" stroke="#E8505B" strokeWidth="5" /><circle cx="233" cy="14" r="6" fill="#E8505B" />
        <path d="M60 80a50 50 0 0 1 90-20" fill="none" stroke="#2B59FF" strokeWidth="4" strokeDasharray="4 7" />
      </>);
  }
}

export function RoadmapIllustration({ index }: { index: number }) {
  return (
    <div className={`roadmap-art roadmap-art--${index + 1}`} aria-hidden="true">
      <svg viewBox="0 0 320 260" focusable="false"><Scene index={index} /></svg>
    </div>
  );
}
