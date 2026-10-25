import './HeroBenefit.css';

export function HeroBenefit() {
  const base = import.meta.env.BASE_URL;
  return (
    <div className="hero-benefit entrance entrance-delay" role="group" aria-label="Homem em primeiro plano ao lado de um robô de IA prateado, em uma cena de trading de cripto">
      <div className="hero-benefit__robot">
        <img
          src={`${base}hero-ai-robot.webp`}
          alt=""
          width={613}
          height={956}
          loading="eager"
          decoding="async"
        />
      </div>
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
      </div>
    </div>
  );
}
