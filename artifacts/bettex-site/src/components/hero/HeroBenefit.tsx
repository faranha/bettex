import { ChartCandlestick, Radar, Spade, Trophy } from 'lucide-react';
import './HeroBenefit.css';

const markets = [
  { name: 'PREDIX', type: 'Previsões', Icon: Radar },
  { name: 'TRADEX', type: 'Ações e cripto', Icon: ChartCandlestick },
  { name: 'SPORTIX', type: 'Esportes', Icon: Trophy },
  { name: 'BETTIX', type: 'Cassino', Icon: Spade },
] as const;

export function HeroBenefit() {
  return (
    <figure className="hero-benefit">
      <div className="hero-benefit__top" aria-hidden="true">
        <span>BETTEX / NO SEU CELULAR</span>
      </div>
      <div className="hero-benefit__light" aria-hidden="true" />
      <img
        className="hero-benefit__spouse"
        src={`${import.meta.env.BASE_URL}hero-spouse.webp`}
        alt="Esposa ao fundo sorrindo e olhando para o marido"
        loading="eager"
        decoding="async"
      />
      <div className="hero-benefit__scene">
        <img
          className="hero-benefit__person"
          src={`${import.meta.env.BASE_URL}hero-person-phone.webp`}
          alt="Pessoa olhando a BETTEX no celular"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="hero-benefit__phone-screen" role="img" aria-label="Tela ilustrativa do aplicativo BETTEX com gráfico de mercados e tokens ativados, sem dados reais">
          <span className="hero-benefit__phone-brand">BETTEX</span>
          <span className="hero-benefit__phone-title">Mercados</span>
          <svg className="hero-benefit__phone-chart" viewBox="0 0 48 42" preserveAspectRatio="none" aria-hidden="true">
            <path className="hero-benefit__phone-grid" d="M0 9H48 M0 21H48 M0 33H48" />
            <path className="hero-benefit__phone-bars" d="M7 27V36 M14 22V32 M21 19V29 M29 15V26 M38 10V22" />
            <path className="hero-benefit__phone-line" d="M2 33 L9 29 L15 31 L22 21 L29 24 L37 13 L45 9" />
          </svg>
          <span className="hero-benefit__phone-status"><span aria-hidden="true" />Tokens ativos</span>
        </div>
      </div>
      <svg className="hero-benefit__routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker id="hero-benefit-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 8 4 0 8Z" fill="#b6f7d5" />
          </marker>
        </defs>
        <path d="M61 25 C54 25 59 52 53.8 57" />
        <path d="M61 37 C56 37 59 55 53.8 59.2" />
        <path d="M61 49 C57 49 57 59 53.8 61.4" />
        <path d="M61 61 C58 61 56 62 53.8 63.6" />
        <circle cx="61" cy="25" r=".6" />
        <circle cx="61" cy="37" r=".6" />
        <circle cx="61" cy="49" r=".6" />
        <circle cx="61" cy="61" r=".6" />
      </svg>
      <ul className="hero-benefit__markets" aria-label="Agentes e mercados em que a BETTEX opera">
        {markets.map(({ name, type, Icon }, index) => (
          <li key={name} className={`hero-benefit__market hero-benefit__market--${index + 1}`}>
            <Icon aria-hidden="true" size={17} strokeWidth={1.9} />
            <span><strong>AGENTE {name}</strong><small>{type}</small></span>
          </li>
        ))}
      </ul>
      <figcaption className="hero-benefit__caption">
        <img className="hero-benefit__caption-mark" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" aria-hidden="true" />
        <strong>Invista em mercados de risco e receba nos dias de lucro sem abrir mão da sua participação.</strong>
      </figcaption>
      <span className="hero-benefit__bottom" aria-hidden="true">INTELIGÊNCIA EM MERCADOS DE RISCO</span>
    </figure>
  );
}