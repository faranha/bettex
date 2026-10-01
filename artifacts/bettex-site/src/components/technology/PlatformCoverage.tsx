import { technologyPlatforms } from '@/lib/platforms';
import './PlatformCoverage.css';

export function PlatformCoverage() {
  return (
    <section className="platform-coverage" aria-labelledby="platform-coverage-title">
      <p className="platform-coverage__eyebrow">Tecnologia multimercado</p>
      <h3 id="platform-coverage-title">Plataformas onde podemos operar <em>com nossa tecnologia.</em></h3>
      <p className="platform-coverage__description">A BETTEX seleciona onde operar conforme suas análises e as oportunidades de cada mercado.</p>
      <ul className="platform-coverage__list" aria-label="Plataformas de atuação da tecnologia BETTEX">
        {technologyPlatforms.map((platform) => (
          <li key={platform.id}>
            <img className={`platform-coverage__logo platform-coverage__logo--${platform.id}`} src={`${import.meta.env.BASE_URL}platforms/${platform.logo}`} alt={platform.name} loading="lazy" decoding="async" />
          </li>
        ))}
      </ul>
    </section>
  );
}