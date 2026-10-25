import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { t, useLocale } from '@/lib/i18n';
import './HeroAnimatedBackground.css';

const TRACKS = [
  'M20 470C150 400 190 300 330 290S520 200 600 90',
  'M60 560C200 500 300 470 420 400S640 330 780 250',
  'M120 140C240 190 300 120 420 170S600 260 760 160',
  'M380 590C430 480 560 470 640 400S740 300 790 330',
];
const NODES: [number, number][] = [[330, 290], [600, 90], [420, 400], [780, 250], [420, 170], [760, 160], [640, 400]];

export function HeroAnimatedBackground() {
  useLocale();
  const [paused, setPaused] = useState(false);
  const label = t(paused ? 'Reproduzir animação de fundo' : 'Pausar animação de fundo');
  return (
    <>
      <div className="home-hero-background" aria-hidden="true" data-testid="hero-background-scene" data-paused={paused ? 'true' : 'false'}>
        <div className="hab-drift">
          <img src={`${import.meta.env.BASE_URL}hero-crypto-trading-background.webp`} alt="" width={1600} height={1600} loading="eager" decoding="async" />
        </div>
        <div className="hab-light" />
        <svg className="hab-net" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">
          {TRACKS.map((d, i) => <path key={`b${i}`} d={d} className="hab-track" />)}
          {TRACKS.map((d, i) => <path key={`s${i}`} d={d} pathLength={100} className={`hab-signal hab-signal--${i}`} />)}
          {NODES.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={3.5} className={`hab-node hab-node--${i % 3}`} />)}
        </svg>
      </div>
      <button type="button" className="hab-toggle" data-testid="button-hero-background-motion" aria-pressed={paused} aria-label={label} title={label} onClick={() => setPaused(p => !p)}>
        {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
      </button>
    </>
  );
}
