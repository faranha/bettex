import g from '@/lib/growth-strategy.json';
import { ExternalLink } from 'lucide-react';
import { founderSocials } from '@/lib/founder-socials';
import './growth.css';
import './FounderProfilePitch.css';

const n = (v: number) => v.toLocaleString('pt-BR');
const f = g.founder;

export function FounderProfile({ dark = false, id, portrait = false, noDashes = false, doc = false, thirdPerson = false }: { dark?: boolean; id?: string; portrait?: boolean; noDashes?: boolean; doc?: boolean; thirdPerson?: boolean }) {
  const stats = [
    [f.communityPlatform, `${f.communityMoreThan ? 'mais de ' : ''}${n(f.community)}`, 'membros'],
    ['Instagram', n(f.instagram), noDashes ? `${f.instagramEngagementPercent[0]} a ${f.instagramEngagementPercent[1]}% de engajamento` : `${f.instagramEngagementPercent[0]}–${f.instagramEngagementPercent[1]}% de engajamento`],
    ['YouTube', `${f.youtubeMoreThan ? 'mais de ' : ''}${n(f.youtube)}`, 'inscritos'],
    ['X', n(f.x), 'seguidores'],
  ];
  return <figure id={id} className={`fp${dark ? ' fp--dark' : ''}${portrait ? ' fp--portrait' : ''}${doc ? ' fp--doc' : ''}${thirdPerson && portrait && !doc ? ' fp--pitch' : ''}`} aria-label="Apresentação do fundador">
    {portrait ? <img className="fp__portrait" src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/fred-azevedo.png`} alt="Retrato de Fred Azevedo, fundador da BETTEX" width={400} height={400} loading="lazy" decoding="async" /> : null}
    <span className="mono text-[10px] font-bold uppercase tracking-[.14em]" style={{ color: dark ? '#F2B632' : '#2B59FF' }}>{thirdPerson ? 'Experiência internacional e comunidade própria' : 'Founder-led · distribuição existente'}</span>
    {thirdPerson
      ? <p className="fp__quote">Fred Azevedo é o fundador da BETTEX e tem experiência no lançamento de diversas operações ao redor do mundo. Influenciador reconhecido no Brasil, reúne uma grande comunidade e canais próprios de relacionamento com seu público.</p>
      : <blockquote className="fp__quote">{doc ? f.quote : <>“{f.quote}”</>}</blockquote>}
    <figcaption className="fp__who"><span className="fp__ini" aria-hidden="true">FA</span><span>{f.name}<br /><small style={{ fontWeight: 500, opacity: .75 }}>Fundador de BETTEX · {f.channel}</small></span></figcaption>
    <nav className="mt-5" aria-label="Redes de Fred Azevedo">
      <p className="mb-2 text-xs font-bold">Redes do fundador</p>
      <ul className="flex flex-wrap gap-2">
        {founderSocials.map(({ name, href }) => <li key={name}><a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${dark ? 'border-[#5F86FF]/50 text-[#F4F1E8] hover:bg-[#13204F] focus-visible:outline-[#F2B632]' : 'border-[#070B1F]/20 text-[#183173] hover:bg-white focus-visible:outline-[#2B59FF]'}`}>{name}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></li>)}
      </ul>
    </nav>
    <ul className="fp__grid">{stats.map(([l, v, t]) => <li key={l}><span>{l}</span><strong>{v}</strong><small>{t}</small></li>)}</ul>
    <p className="fp__cap">{thirdPerson ? 'Informações e métricas declaradas pelo fundador, sem auditoria independente. As audiências podem se sobrepor; seguidores e engajamento não são clientes, alcance garantido ou conversão.' : f.sourceNote} Esta é audiência de distribuição do fundador, não tração de produto da BETTEX.</p>
  </figure>;
}
