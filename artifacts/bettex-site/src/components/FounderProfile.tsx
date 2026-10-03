import g from '@/lib/growth-strategy.json';
import './growth.css';

const n = (v: number) => v.toLocaleString('pt-BR');
const f = g.founder;

export function FounderProfile({ dark = false, id }: { dark?: boolean; id?: string }) {
  const stats = [
    ['Comunidade', n(f.community), 'membros'],
    ['Instagram', n(f.instagram), `${f.instagramEngagementPercent[0]}–${f.instagramEngagementPercent[1]}% de engajamento`],
    ['YouTube', `${f.youtubeMoreThan ? 'mais de ' : ''}${n(f.youtube)}`, 'inscritos'],
    ['X', n(f.x), 'seguidores'],
  ];
  return <figure id={id} className={`fp${dark ? ' fp--dark' : ''}`} aria-label="Apresentação do fundador">
    <span className="mono text-[10px] font-bold uppercase tracking-[.14em]" style={{ color: dark ? '#F2B632' : '#2B59FF' }}>Founder-led · distribuição existente</span>
    <blockquote className="fp__quote">“{f.quote}”</blockquote>
    <figcaption className="fp__who"><span className="fp__ini" aria-hidden="true">FA</span><span>{f.name}<br /><small style={{ fontWeight: 500, opacity: .75 }}>Fundador de BETTEX · {f.channel}</small></span></figcaption>
    <ul className="fp__grid">{stats.map(([l, v, t]) => <li key={l}><span>{l}</span><strong>{v}</strong><small>{t}</small></li>)}</ul>
    <p className="fp__cap">{f.sourceNote} Esta é audiência de distribuição do fundador, não tração de produto da BETTEX.</p>
  </figure>;
}
