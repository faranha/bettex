import './ProblemSection.css';
import { MarketOpportunity } from './MarketOpportunity';
import { useX } from './pitchCopy';

export function AudienceSection() {
  const x = useX();
  return <section id="publico-pitch" aria-labelledby="publico-pitch-t" className="slide pb-problem pb-aud">
    <img className="pb-aud__front-fan" src={`${import.meta.env.BASE_URL}pitch-future/audience-front-fan-cutout.svg`} alt="" aria-hidden="true" width={298} height={784} loading="lazy" />
    <div className="page-wrap pb-problem__wrap">
      <div className="pb-aud__heading">
      <h1 id="publico-pitch-t" className="pb-aud__title">{x('Milhões de brasileiros já apostam ou usam cripto.', 'Millions of Brazilians already bet or use crypto.', 'Millones de brasileños ya apuestan o usan cripto.')}</h1>
      </div>
      <MarketOpportunity />
    </div>
  </section>;
}