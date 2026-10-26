import './ProblemSection.css';
import { MarketOpportunity } from './MarketOpportunity';
import { useX } from './pitchCopy';

export function AudienceSection() {
  const x = useX();
  return <section id="publico-pitch" aria-labelledby="publico-pitch-t" className="slide pb-problem pb-aud">
    <div className="page-wrap pb-problem__wrap">
      <h1 id="publico-pitch-t" className="pb-aud__title">{x('Milhões de brasileiros já apostam ou usam cripto.', 'Millions of Brazilians already bet or use crypto.', 'Millones de brasileños ya apuestan o usan cripto.')}</h1>
      <MarketOpportunity />
    </div>
  </section>;
}