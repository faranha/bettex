import { ArrowDown } from 'lucide-react';
import { useX } from './pitchCopy';
import './PitchMissionHero.css';

export function PitchMissionHero() {
  const x = useX();
  const base = import.meta.env.BASE_URL;

  return <section id="visao" className="pitch-mission-hero" aria-labelledby="pitch-mission-title">
    <div className="page-wrap pitch-mission-hero__layout">
      <div className="pitch-mission-hero__copy">
        <h1 id="pitch-mission-title" className="hero-title">
          <span>{x('Resgatar pessoas', 'Rescue people', 'Rescatar a las personas')}</span>
          <span className="pitch-mission-hero__accent">{x('de um futuro perdido.', 'from a lost future.', 'de un futuro perdido.')}</span>
        </h1>
        <h2>{x(
          'Os robôs vão tomar os empregos. As bets, o dinheiro.',
          'Robots will take the jobs. Betting will take the money.',
          'Los robots se llevarán los empleos. Las apuestas, el dinero.',
        )}</h2>
        <p>{x(
          'A IA também deve pertencer às pessoas. Com BETTEX, você tem o token e é dono da IA junto à comunidade de um projeto descentralizado de DeFi e inteligência artificial.',
          'AI should belong to people too. With BETTEX, you hold the token and become an owner of the AI together with the community of a decentralized DeFi and artificial intelligence project.',
          'La IA también debe pertenecer a las personas. Con BETTEX, tienes el token y eres dueño de la IA junto a la comunidad de un proyecto descentralizado de DeFi e inteligencia artificial.',
        )}</p>
        <a href="#solucao" className="tap pitch-mission-hero__button">
          <span>{x('Conhecer a BETTEX', 'Discover BETTEX', 'Conocer BETTEX')}</span>
          <span className="pitch-mission-hero__button-icon" aria-hidden="true"><ArrowDown size={22} strokeWidth={2.2} /></span>
        </a>
      </div>
      <figure className="pitch-mission-hero__art">
        <img src={`${base}pitch-hero-ai-rescue.webp`}
          srcSet={`${base}pitch-hero-ai-rescue-640.webp 640w, ${base}pitch-hero-ai-rescue-960.webp 960w, ${base}pitch-hero-ai-rescue.webp 1280w`}
          sizes="(max-width: 767px) 100vw, 52vw"
          width={1280} height={1120}
          alt={x('Um robô estende a mão para resgatar uma pessoa.', 'A robot reaches out to rescue a person.', 'Un robot tiende la mano para rescatar a una persona.')}
          loading="eager" decoding="async" fetchPriority="high" />
      </figure>
    </div>
  </section>;
}
