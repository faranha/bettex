import { ChartNoAxesCombined, Spade } from 'lucide-react';
import './HeroBenefit.css';

function HeroBrand({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path fill="currentColor" d="M17 15h6v34h-6V15Zm10 0h12l9 8v4l-5 5 6 8v3l-9 6H27v-6h11l4-3-4-5H27v-6h11l4-4-4-4H27v-6Z" />
    </svg>
  );
}

export function HeroBenefit() {
  return (
    <figure className="hero-benefit">
      <img
        className="hero-benefit__art"
        src={`${import.meta.env.BASE_URL}hero-ai-wallet.webp`}
        alt="Homem ao lado da marca BETTEX, com referências a surebet, bônus automatizados, previsões e cripto"
        width={1024}
        height={1024}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      <HeroBrand className="hero-benefit__brand hero-benefit__brand--core" />
      <div className="hero-benefit__market-node hero-benefit__market-node--sports" aria-hidden="true">
        <span className="hero-benefit__label">Surebet</span>
        <svg viewBox="0 0 120 120" fill="#0b3633" stroke="#a4eacb" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="60" cy="60" r="54" />
          <path d="M60 34 79 48 72 70 48 70 41 48Z" fill="#a4eacb" />
          <path d="M60 34V7 M79 48l26-9 M72 70l16 29 M48 70 32 99 M41 48l-26-9 M15 39l13-22 M60 7 28 17 M60 7l32 10 M105 39 92 17 M32 99l28 14 28-14" fill="none" />
        </svg>
      </div>
      <div className="hero-benefit__market-node hero-benefit__market-node--predictions" aria-hidden="true">
        <span className="hero-benefit__label">Previsões</span>
      </div>
      <div className="hero-benefit__market-node hero-benefit__market-node--bonuses" aria-hidden="true">
        <span className="hero-benefit__label">Bônus automatizados</span>
        <Spade strokeWidth={1.8} />
      </div>
      <div className="hero-benefit__market-node hero-benefit__market-node--crypto" aria-hidden="true">
        <span className="hero-benefit__label">Cripto</span>
        <ChartNoAxesCombined strokeWidth={1.8} />
      </div>
    </figure>
  );
}
