import { ChartCandlestick, Radar, Spade, Trophy } from 'lucide-react';
import { BettexMark } from '@/components/BettexMark';
import './HeroBenefit.css';

const markets = [
  { name: 'Mercado 01', type: 'Previsões', Icon: Radar },
  { name: 'Mercado 02', type: 'Ações e cripto', Icon: ChartCandlestick },
  { name: 'Mercado 03', type: 'Esportes', Icon: Trophy },
  { name: 'Mercado 04', type: 'Cassinos', Icon: Spade },
] as const;

export function HeroBenefit() {
  return (
    <figure className="hero-benefit">
      <div className="hero-benefit__top" aria-hidden="true">
        <span>BETTEX / MERCADOS NO SEU CELULAR</span>
      </div>
      <div className="hero-benefit__light" aria-hidden="true" />
      <img
        className="hero-benefit__spouse"
        src={`${import.meta.env.BASE_URL}hero-spouse-full.webp`}
        alt="Esposa ao fundo sorrindo e olhando para o marido"
        loading="eager"
        decoding="async"
      />
      <div className="hero-benefit__scene">
        <img
          className="hero-benefit__person"
          src={`${import.meta.env.BASE_URL}hero-person-screen.webp`}
          alt="Ilustração da BETTEX no celular, com saldo BETTEX após a compra concluída"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <svg className="hero-benefit__routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M61 25 C58 25 58.5 42 57.8 49 C57 56 56 60 54.7 62.4" />
        <path d="M61 37 C58.3 37 58.4 48 57.5 53 C56.8 57 55.6 61 54.7 62.4" />
        <path d="M61 49 C58 49 57.5 55 56.8 58 C56.2 60 55.4 61.8 54.7 62.4" />
        <path d="M61 61 C58.5 61 56.5 62 54.7 62.4" />
        <circle cx="61" cy="25" r=".42" />
        <circle cx="61" cy="37" r=".42" />
        <circle cx="61" cy="49" r=".42" />
        <circle cx="61" cy="61" r=".42" />
        <circle className="hero-benefit__hub-ring" cx="54.7" cy="62.4" r="1.5" />
        <circle className="hero-benefit__hub-center" cx="54.7" cy="62.4" r=".55" />
      </svg>
      <ul className="hero-benefit__markets" aria-label="Mercados em que a BETTEX opera">
        {markets.map(({ name, type, Icon }, index) => (
          <li key={name} className={`hero-benefit__market hero-benefit__market--${index + 1}`}>
            <Icon aria-hidden="true" size={17} strokeWidth={1.9} />
            <span><strong>{type}</strong><small>{name}</small></span>
          </li>
        ))}
      </ul>
      <figcaption className="hero-benefit__caption">
        <span className="hero-benefit__caption-mark" role="img" aria-label="Símbolo BETTEX">
          <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <circle className="hero-benefit__caption-ring" cx="24" cy="24" r="20" fill="none" stroke="#b6efca" strokeWidth="1.5" strokeDasharray="18 108" strokeLinecap="round" />
            <circle className="hero-benefit__caption-active-glow" cx="38" cy="10" r="6" fill="#a4eacb" />
            <circle cx="38" cy="10" r="3.4" fill="#a4eacb" stroke="#123a3b" strokeWidth="1.5" />
          </svg>
          <BettexMark className="hero-benefit__caption-brand" />
        </span>
        <strong>Faça parte do projeto BETTEX. Com seus tokens, você participa dos lucros e recebe sua parte em reais.</strong>
      </figcaption>
      <span className="hero-benefit__bottom" aria-hidden="true">PARTICIPAÇÃO CONCEITUAL · SEM GARANTIA DE LUCRO</span>
    </figure>
  );
}