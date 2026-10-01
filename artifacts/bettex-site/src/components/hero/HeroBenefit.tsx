import { BettexMark } from '@/components/BettexMark';
import './HeroBenefit.css';

export function HeroBenefit() {
  return (
    <figure className="hero-benefit">
      <img
        className="hero-benefit__art"
        src={`${import.meta.env.BASE_URL}hero-ai-participation.webp`}
        alt="Homem olhando para a câmera e segurando uma ficha BETTEX diante do núcleo de IA, com moedas e carteira à frente"
        width={1024}
        height={1024}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      <BettexMark className="hero-benefit__brand hero-benefit__brand--token" />
      <BettexMark className="hero-benefit__brand hero-benefit__brand--core" />
      <span className="hero-benefit__label hero-benefit__label--bets">Apostas</span>
      <span className="hero-benefit__label hero-benefit__label--predictions">Previsões</span>
    </figure>
  );
}
