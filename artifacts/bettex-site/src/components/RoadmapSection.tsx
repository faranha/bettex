import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { FlaskConical, ScrollText, Rocket, Compass, MessagesSquare, Bot, ArrowRight, ArrowLeft } from 'lucide-react';
import { t } from '@/lib/i18n';
import { CommunityCTA } from './CommunityCTA';
import { DemoAppLink } from './DemoAppLink';
import { copy } from '@/lib/documentation-copy';
import { RoadmapIllustration } from './RoadmapIllustration';
import './RoadmapSection.css';

const icons = [MessagesSquare, ScrollText, Rocket, FlaskConical, Compass, Bot];

export const roadmapStops = [
  { tag: 'DISPONÍVEL COMO DEMO', date: 'Atual', dateTime: undefined, title: 'Comunidade e preparação', description: 'Interface visual acessível e canal de feedback com a comunidade. O demo não comprova trading nem dinheiro real.' },
  { tag: 'PREVISTO · MINT PÚBLICO', date: '10 de dezembro de 2026', dateTime: '2026-12-10', title: 'Mint público', description: copy.rm2x },
  { tag: 'PREVISTO · ALFA E VESTING', date: 'Março de 2027', dateTime: '2027-03', title: 'Sistema ALFA e vesting', description: copy.rm3x, featured: true },
  { tag: 'PREVISTO · BETA', date: 'Após o ALFA · data a definir', dateTime: undefined, title: 'BETA e go to market', description: 'Evolução do produto a partir das validações do ALFA, ampliando o acesso sem novo lançamento do token.' },
  { tag: 'EVOLUÇÃO FUTURA', date: 'Gradual · data a definir', dateTime: undefined, title: 'Expansão de mercados', description: 'Cada mercado e território só abre com integração e controles validados e adequação legal. Dados públicos não equivalem a operação autorizada.' },
  { tag: 'DIREÇÃO FUTURA', date: 'Sem prazo', dateTime: undefined, title: 'Autonomia do agente BETTEX', description: 'Agentes de IA assumirão gradualmente as funções hoje exercidas pelo fundador e pelo time. O objetivo é um agente BETTEX totalmente autônomo na operação, com controles verificáveis. Não é uma capacidade já entregue nem uma promessa de data.' },
] as const;

type Stop = { tag: string; date: string; dateTime?: string; title: string; description: string; featured?: boolean; extra?: string };
const homeRoadmapStops: readonly Stop[] = roadmapStops.map((stop, i): Stop => i === 2
  ? { ...stop, extra: 'Um agente de IA em cripto. Ativo inicial a definir.' }
  : i === 4
    ? { ...stop, title: 'Expansão de ativos', description: 'Novos ativos cripto só entram após validação, com integração, controles verificados e adequação legal. Dados públicos não equivalem a operação autorizada.' }
    : stop);

const pitchRoadmapStops: readonly Stop[] = homeRoadmapStops.map((stop, i): Stop => i === 4 || i === 2 ? stop : roadmapStops[i]);

export function RoadmapSection({ id = 'roadmap', variant = 'default', scope = 'default' }: { id?: string; variant?: 'default' | 'home'; scope?: 'default' | 'pitch' } = {}) {
  const slider = variant === 'home';
  const trackRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const stops: readonly Stop[] = variant === 'home' ? homeRoadmapStops : scope === 'pitch' ? pitchRoadmapStops : roadmapStops;
  const total = String(stops.length).padStart(2, '0');
  useEffect(() => {
    const track = trackRef.current;
    if (!slider || !track) return;
    const sync = () => {
      const left = track.getBoundingClientRect().left;
      const distances = Array.from(track.children, child => Math.abs(child.getBoundingClientRect().left - left));
      setActive(distances.indexOf(Math.min(...distances)));
    };
    track.addEventListener('scroll', sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(track);
    sync();
    return () => { track.removeEventListener('scroll', sync); observer.disconnect(); };
  }, [slider]);
  const goTo = (index: number) => {
    const track = trackRef.current;
    const next = Math.max(0, Math.min(stops.length - 1, index));
    const card = track?.children[next];
    if (!track || !card) return;
    track.scrollTo({
      left: track.scrollLeft + card.getBoundingClientRect().left - track.getBoundingClientRect().left,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    if (event.target !== event.currentTarget) return;
    const next = event.key === 'ArrowRight' ? active + 1 : event.key === 'ArrowLeft' ? active - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? stops.length - 1 : undefined;
    if (next === undefined) return;
    event.preventDefault();
    goTo(next);
  };
  return (
    <section className={`roadmap${slider ? ' roadmap--slider' : ''}`} id={id} aria-labelledby={`${id}-title`}>
      <div className="roadmap__wrap">
        <header className="roadmap__intro">
          <div>
            <p className="roadmap__eyebrow"><span className="roadmap__eyebrow-mark" aria-hidden="true" /> Uma rota, passo a passo</p>
            <h2 id={`${id}-title`}>O caminho da <em>BETTEX.</em></h2>
          </div>
          <div className="roadmap__intro-side">
            <span className="roadmap__intro-index" aria-hidden="true">01 → {total}</span>
            <p>Mint público em 10 de dezembro de 2026. Sistema, ALFA e início do vesting de 24 meses previstos para março de 2027. Cada lançamento depende da adequação legal e jurídica da oferta, da atividade e do território atendido.</p>
          </div>
        </header>

        <div className="roadmap__map" aria-label="Percurso planejado do projeto BETTEX">
          <div className="roadmap__map-caption" aria-hidden="true">
            <span>SEQUÊNCIA PLANEJADA</span>
            <span>LEITURA 01 → {total}</span>
          </div>

          <ol className="roadmap__stops" id={slider ? `${id}-slides` : undefined} ref={slider ? trackRef : undefined} tabIndex={slider ? 0 : undefined} onKeyDown={slider ? onKeyDown : undefined}>
            {stops.map((stop, index) => {
              const Icon = icons[index];
              const number = String(index + 1).padStart(2, '0');
              return (
              <li
                className={`roadmap__stop roadmap__stop--${index + 1}${stop.featured ? ' roadmap__stop--featured' : ''}`}
                key={stop.title}
                data-testid={`roadmap-step-${index + 1}`}
              >
                <span className="roadmap__pin" aria-hidden="true"><span /></span>
                <article className="roadmap__place">
                  <span className="roadmap__icon" aria-hidden="true"><Icon strokeWidth={2.2} /></span>
                  {slider && <RoadmapIllustration index={index} />}
                  <div className="roadmap__place-top">
                    <span className="roadmap__place-number">{number}<span> / {total}</span></span>
                    <span className="roadmap__place-tag">{stop.tag}</span>
                  </div>
                  <time className="roadmap__place-date" dateTime={stop.dateTime}>{stop.date}</time>
                  <h3>{stop.title}</h3>
                  <p>{stop.description}</p>
                  {stop.extra && <p><strong>{stop.extra}</strong></p>}
                  {(index === 0 || index === 2) && <DemoAppLink className="roadmap__features roadmap__features--demo" data-testid={index === 2 ? 'roadmap-alpha-features' : 'roadmap-beta-features'}><span>Abrir o demo</span><ArrowRight size={16} aria-hidden="true" /></DemoAppLink>}
                </article>
              </li>
              );
            })}
          </ol>
          {slider && <div className="roadmap__slider-controls" data-testid="roadmap-slider-controls">
            <button type="button" className="roadmap__slider-arrow" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label={t('Etapa anterior')} aria-controls={`${id}-slides`}><ArrowLeft size={20} aria-hidden="true" /></button>
            <div className="roadmap__slider-dots">
              {stops.map((stop, index) => <button type="button" key={stop.title} className="roadmap__slider-dot" onClick={() => goTo(index)} aria-label={t(stop.title)} aria-current={active === index ? 'step' : undefined} aria-controls={`${id}-slides`} />)}
            </div>
            <span className="roadmap__slider-count" aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, '0')} / {total}</span>
            <button type="button" className="roadmap__slider-arrow" onClick={() => goTo(active + 1)} disabled={active === stops.length - 1} aria-label={t('Próxima etapa')} aria-controls={`${id}-slides`}><ArrowRight size={20} aria-hidden="true" /></button>
          </div>}
          <div className="roadmap__destination" aria-hidden="true"><span className="roadmap__destination-dot" /> CAMINHO EM CONSTRUÇÃO</div>
        </div>

        <aside className="roadmap__closing" aria-label="Observação sobre o percurso">
          <div className="roadmap__closing-mark" aria-hidden="true"><span /><span /><span /></div>
          <div>
            <span className="roadmap__closing-label">O QUE IMPORTA NESTA ROTA</span>
            <p>As datas indicam o cronograma previsto, não entregas concluídas. Oferta e operação dependem de adequação por atividade e território e podem ser ajustadas. Investir envolve risco e não há rendimento garantido.</p>
            <CommunityCTA source="roadmap" label="Entre na comunidade" note="Acompanhe cada etapa de perto." tone="light" />
          </div>
        </aside>
      </div>
    </section>
  );
}

export default RoadmapSection;