import type { ReactNode } from 'react';
import './ChapterHero.css';
import { pitchHeroSrcSet } from '@/lib/pitch-hero-media';

const BASE = import.meta.env.BASE_URL;
export function ChapterHero({ id, kicker, title, summary, src, tone = 'ink', credit }: { id: string; n: string; kicker: string; title: ReactNode; summary: string; src: string; tone?: 'ink' | 'blue'; credit?: { label: string; href: string } }) {
  return <header className={`chero chero--${tone}`}>
    <div className="chero__bg" aria-hidden="true"><img src={`${BASE}${src}`} srcSet={pitchHeroSrcSet(src)} sizes="100vw" alt="" width={640} height={640} loading="lazy" decoding="async" /></div>
    <div className="page-wrap chero__grid">
      <div className="chero__copy">
        <div className="mono chero__kicker">{kicker}</div>
        <h2 id={`${id}-t`} className="display chero__title">{title}</h2>
        <p className="chero__summary">{summary}</p>
      </div>
    </div>
    {credit && <a className="chero__credit" href={credit.href} target="_blank" rel="noopener noreferrer">{credit.label}</a>}
  </header>;
}
