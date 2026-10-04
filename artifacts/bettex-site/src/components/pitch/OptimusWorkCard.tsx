import { ExternalLink } from 'lucide-react';
import { PitchObservations } from './PitchObservations';
import './FutureSections.css';
import './OptimusWorkCard.css';

export function OptimusWorkCard() {
  return <div id="tesla-spacex" className="fu-pair fu-pair--focused pb-problem__optimus">
    <article className="fu-card fu-card--tesla">
      <figure className="fu-card-media fu-card-media--optimus">
        <img src={`${import.meta.env.BASE_URL}pitch-future/tesla-optimus.jpg`} alt="Optimus, robô humanoide da Tesla" width={1024} height={1024} loading="lazy" />
        <figcaption>Optimus · Tesla <a href="https://robozaps.com/_next/image?url=/robots/media/tesla-optimus/tesla-tesla-optimus-gen-2-3-01.webp&w=3840&q=75" target="_blank" rel="noopener noreferrer">Imagem via RoboZaps</a></figcaption>
      </figure>
      <div className="fu-card-copy">
        <span className="mono fu-tag">Tesla · Optimus</span>
        <h4 className="display">Optimus e a substituição do trabalho humano</h4>
        <p>Humanoides como o Optimus podem ocupar funções hoje remuneradas. Na tese da BETTEX, a substituição em escala concentra ganhos nos donos das máquinas e retira salário e poder de compra de quem depende do próprio trabalho.</p>
        <a className="fu-src" href="https://www.tesla.com/master-plan-part-4" target="_blank" rel="noopener noreferrer">Tesla, Master Plan Part IV<ExternalLink aria-hidden="true" /></a>
      </div>
    </article>
    <PitchObservations dark><p>A referência à Tesla não indica parceria, endosso ou participação da BETTEX na empresa.</p></PitchObservations>
  </div>;
}