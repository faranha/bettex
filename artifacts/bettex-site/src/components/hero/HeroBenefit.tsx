import './HeroBenefit.css';

export function HeroBenefit() {
  const base = import.meta.env.BASE_URL;
  return (
    <div className="hero-benefit entrance entrance-delay" role="group" aria-label="Homem em primeiro plano ao lado de um robô de IA branco, em uma cena de trading de cripto">
      <div className="hero-benefit__float">
        <img
          src={`${base}hero-duo-partnership.webp`}
          alt="Homem sorrindo com o celular na mão, com um robô de IA branco ao lado apoiando a mão no ombro dele"
          width={866}
          height={900}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
