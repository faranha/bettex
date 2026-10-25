import './HeroBenefit.css';

export function HeroBenefit() {
  const base = import.meta.env.BASE_URL;
  return (
    <div className="hero-benefit entrance entrance-delay" role="group" aria-label="Homem em primeiro plano ao lado de um robô de IA branco, em uma cena de trading de cripto">
      <div className="hero-benefit__float">
        <img
          src={`${base}hero-duo-btx-silver.webp`}
          alt="Homem com celular ao lado de um robô de IA branco, de expressão neutra e com o logo da BETTEX"
          width={1024}
          height={1024}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
