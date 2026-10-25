import './HeroBenefit.css';

export function HeroBenefit({ alt }: { alt?: string } = {}) {
  const base = import.meta.env.BASE_URL;
  const imageAlt = alt ?? 'Homem com celular ao lado de um robô de IA branco, de expressão neutra e com o logo da BETTEX';
  return (
    <div className="hero-benefit entrance entrance-delay" role="group" aria-label={imageAlt}>
      <div className="hero-benefit__float">
        <img
          src={`${base}hero-duo-btx-silver.webp`}
          alt=""
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
