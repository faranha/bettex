import { ChartCandlestick, Radar, Spade, Trophy } from 'lucide-react';
import { BettexMark } from '@/components/BettexMark';
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
      <ul className="hero-benefit__markets" aria-label="Agentes e mercados em que a BETTEX opera">
        {markets.map(({ name, type, Icon }, index) => (
          <li key={name} className={`hero-benefit__market hero-benefit__market--${index + 1}`}>
            <Icon aria-hidden="true" size={17} strokeWidth={1.9} />
            <span><strong>AGENTE {name}</strong><small>{type}</small></span>
          </li>
        ))}
      </ul>
      <figcaption className="hero-benefit__caption">
        <span className="hero-benefit__caption-mark" role="img" aria-label="Moeda BETTEX ativa">
          <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="hero-benefit-coin-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffe5bb" />
                <stop offset="1" stopColor="#dc9b68" />
              </linearGradient>
            </defs>
            <circle className="hero-benefit__caption-ring" cx="23" cy="25" r="17" fill="none" stroke="#b6efca" strokeWidth="1.5" strokeDasharray="16 92" strokeLinecap="round" />
            <circle cx="23" cy="25" r="14" fill="#a86645" />
            <circle cx="23" cy="23.5" r="13" fill="url(#hero-benefit-coin-fill)" stroke="#fff0d1" strokeWidth="1.2" />
            <circle cx="23" cy="23.5" r="10" fill="none" stroke="#b87750" strokeWidth="1.2" />
            <circle className="hero-benefit__caption-active-glow" cx="38" cy="10" r="6" fill="#a4eacb" />
            <circle cx="38" cy="10" r="3.4" fill="#a4eacb" stroke="#123a3b" strokeWidth="1.5" />
          </svg>
          <BettexMark className="hero-benefit__caption-brand" />
        </span>
        <strong>Invista em mercados de risco e receba nos dias de lucro sem abrir mão da sua participação.</strong>
      </figcaption>
      <span className="hero-benefit__bottom" aria-hidden="true">INTELIGÊNCIA EM MERCADOS DE RISCO</span>
    </figure>
  );
}