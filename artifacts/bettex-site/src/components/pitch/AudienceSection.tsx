import './ProblemSection.css';
import { MarketOpportunity } from './MarketOpportunity';
import { useX } from './pitchCopy';

export function AudienceSection() {
  const x = useX();
  return <section id="publico-pitch" aria-labelledby="publico-pitch-t" className="slide pb-problem">
    <div className="page-wrap pt-10">
      <h2 id="publico-pitch-t" className="display max-w-[860px] text-[clamp(1.7rem,3.6vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-.05em]">{x('Milhões de brasileiros já apostam', 'Millions of Brazilians already bet', 'Millones de brasileños ya apuestan')} <span className="text-[#2B59FF]">{x('ou usam cripto.', 'or use crypto.', 'o usan cripto.')}</span></h2>
      <p className="mt-3 max-w-[700px] text-base leading-7">{x('É esse público que a BETTEX busca alcançar com uma proposta de investimento, não de aposta: experiência familiar, custos claros e risco de perda explícito. Os dados a seguir mostram sua escala e o volume financeiro envolvido.', 'This is the audience BETTEX aims to reach with an investment proposal, not a betting product: a familiar experience, clear costs and explicit risk of loss. The data below shows its scale and the financial volume involved.', 'Es el público al que BETTEX busca llegar con una propuesta de inversión, no de apuestas: una experiencia familiar, costes claros y riesgo de pérdida explícito. Los datos siguientes muestran su escala y el volumen financiero involucrado.')}</p>
    </div>
    <div className="page-wrap pb-problem__wrap">
      <MarketOpportunity />
    </div>
  </section>;
}