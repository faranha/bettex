import { NewsClipping } from './NewsClipping';
import './HeroBenefit.css';

export function HeroBenefit() {
  const base = import.meta.env.BASE_URL;
  return (
    <div className="hero-benefit entrance entrance-delay" role="group" aria-label="Homem diante de um site de apostas, ao lado de um recorte de notícia">
      <img className="hero-benefit__site" src={`${base}hero-casino-site.webp`} alt="" aria-hidden="true" width={1000} height={1000} loading="eager" decoding="async" />
      <div className="hero-benefit__person">
        <img
          src={`${base}hero-person-centered.webp`}
          alt="Homem de camisa bege olhando de lado para a câmera"
          width={514}
          height={968}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <svg className="hero-benefit__face-reader" viewBox="0 0 514 968" fill="none" aria-hidden="true" focusable="false">
          {/* Coordinates follow the portrait, so the frame scales with the face. */}
          <path d="M 184 84 H 154 V 114 M 407 84 H 437 V 114 M 154 375 V 405 H 184 M 407 405 H 437 V 375" />
          <path className="hero-benefit__scan-line" d="M 154 282 H 437" />
        </svg>
      </div>
      <NewsClipping className="hero-benefit__clip" />
    </div>
  );
}
