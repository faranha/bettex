import './ProblemSection.css';
import { MarketOpportunity } from './MarketOpportunity';

export function AudienceSection() {
  return <section id="publico-pitch" aria-labelledby="publico-pitch-t" className="slide pb-problem">
    <div className="page-wrap pb-problem__wrap">
      <header className="pb-problem__market-head">
        <div className="mono pb-problem__kicker"><span>02 / 10</span><span className="pb-problem__rule" aria-hidden="true" />Público e mercado</div>
        <h2 id="publico-pitch-t" className="display pb-problem__title">O público brasileiro.<br /><span>A escala e o volume financeiro.</span></h2>
        <p className="pb-problem__summary">A BETTEX busca alcançar os públicos brasileiros de apostas e cripto. A proposta é um produto de investimento que fale a língua dessas pessoas, com experiência familiar, custos claros e risco de perda explícito.</p>
      </header>
      <MarketOpportunity />
    </div>
  </section>;
}