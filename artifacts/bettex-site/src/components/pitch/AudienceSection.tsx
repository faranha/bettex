import './ProblemSection.css';
import { MarketOpportunity } from './MarketOpportunity';
import { useX } from './pitchCopy';

export function AudienceSection() {
  const x = useX();
  return <section id="publico-pitch" aria-labelledby="publico-pitch-t" className="slide pb-problem">
    <div className="page-wrap pt-10">
      <h2 id="publico-pitch-t" className="display max-w-[860px] text-[clamp(1.7rem,3.6vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-.05em]">{x('O público brasileiro.', 'The Brazilian audience.', 'El público brasileño.')} <span className="text-[#2B59FF]">{x('A escala e o volume financeiro.', 'The scale and financial volume.', 'La escala y el volumen financiero.')}</span></h2>
      <p className="mt-3 max-w-[700px] text-base leading-7">{x('A BETTEX busca alcançar os públicos brasileiros de apostas e cripto com um produto de investimento que fale sua língua: experiência familiar, custos claros e risco de perda explícito.', 'BETTEX aims to reach Brazilian betting and crypto audiences with an investment product that speaks their language: a familiar experience, clear costs and explicit risk of loss.', 'BETTEX busca llegar al público brasileño de apuestas y cripto con un producto de inversión que hable su idioma: una experiencia familiar, costes claros y riesgo de pérdida explícito.')}</p>
    </div>
    <div className="page-wrap pb-problem__wrap">
      <MarketOpportunity />
    </div>
  </section>;
}