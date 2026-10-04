import { CircuitBoard, ExternalLink } from 'lucide-react';
import { LaborSignals } from './LaborSignals';
import { USVacancyChart } from './USVacancyChart';
import { BrazilEmploymentCharts } from './BrazilEmploymentCharts';
import { InflationOilRisks } from './InflationOilRisks';
import { AIBubbleScenario, LaborWarningReports } from './AICrisisScenario';
import './FutureSections.css';

const PHOTO = `${import.meta.env.BASE_URL}pitch-future/elon-musk.jpg`;

function Src({ href, children }: { href: string; children: string }) {
  return <a className="fu-src" href={href} target="_blank" rel="noopener noreferrer">{children}<ExternalLink aria-hidden="true" /></a>;
}

export function FutureSections() {
  return <>
    <section id="agora" aria-labelledby="agora-t" className="slide fu fu--one">
      <div className="page-wrap">
        <div className="mono fu-kicker"><span>02 / 9</span><span className="fu-rule" aria-hidden="true" />Resgatar o futuro antes da crise</div>
        <div className="fu-hero">
          <div>
            <div className="fu-verdict">
              <span className="mono">Tese da BETTEX</span>
              <h2 id="agora-t" className="display">É mentira, a era da prosperidade é uma mentira.</h2>
            </div>
            <p className="fu-sub">Na BETTEX, acreditamos que milhões de pessoas vão perder o trabalho e ficar sem renda antes que a prosperidade prometida pela IA chegue. Nossa visão é que a crise, a miséria e o abandono virão primeiro, enquanto os ganhos se concentram em quem controla as máquinas. Por isso, nossa missão é resgatar o futuro das pessoas agora: ampliar o acesso à participação econômica em um mundo automatizado, sem esperar que o socorro venha depois da exclusão.</p>
            <p className="fu-frame"><Src href="https://www.businessinsider.com/elon-musk-ai-abundance-trump-jobs-wealth-healthcare-ubi-robots-2026-9">Business Insider, 30 set. 2026</Src></p>
            <p className="fu-sub">IA e robôs vão destruir empregos e a economia real. As pessoas vão enfrentar miséria e abandono antes de qualquer socorro chegar.</p>
          </div>
          <figure className="fu-photo" data-attribution="The Royal Society (2018)" data-license="https://creativecommons.org/licenses/by-sa/3.0/" data-modifications="crop, color grading">
            <img src={PHOTO} alt="Retrato de Elon Musk em 2018" width={1337} height={1771} loading="lazy" />
            <figcaption><a href="https://commons.wikimedia.org/wiki/File:Elon_Musk_Royal_Society_(crop2).jpg" target="_blank" rel="noopener noreferrer">Fonte: The Royal Society</a></figcaption>
          </figure>
        </div>
        <div id="cenario-exclusao" className="fu-exposed">
          <span className="mono fu-tag">O cenário apocalíptico</span>
          <h3 className="display">Sem emprego. Sem renda. Sem lugar na nova economia.</h3>
          <p>Esse é o apocalipse econômico que acreditamos estar se aproximando: a tecnologia avança, mas pessoas ficam sem trabalho, sem salário e sem uma nova oportunidade. A BETTEX nasce para agir diante dessa ameaça, antes que a exclusão se consolide.</p>
          <ol className="fu-pauta"><li>EUA: vagas abertas</li><li>Brasil: menos novas vagas</li><li>Inflação, petróleo e conflitos globais</li><li>Alertas de um futuro sem trabalho</li><li>Desta vez, patrimônio e salário</li></ol>
          <USVacancyChart />
          <BrazilEmploymentCharts />
          <InflationOilRisks />
          <LaborWarningReports />
        </div>
        <section id="risco-bolha-ia" className="fu-exposed fu-bubble-subsection" aria-labelledby="ai-double-loss-title">
          <AIBubbleScenario />
        </section>
        <div id="tesla-spacex" className="fu-pair fu-pair--focused">
          <article className="fu-card fu-card--tesla">
            <figure className="fu-card-media fu-card-media--optimus">
              <img src={`${import.meta.env.BASE_URL}pitch-future/tesla-optimus.jpg`} alt="Optimus, robô humanoide da Tesla" width={1024} height={1024} loading="lazy" />
              <figcaption>Optimus · Tesla <a href="https://robozaps.com/_next/image?url=/robots/media/tesla-optimus/tesla-tesla-optimus-gen-2-3-01.webp&w=3840&q=75" target="_blank" rel="noopener noreferrer">Imagem via RoboZaps</a></figcaption>
            </figure>
            <div className="fu-card-copy">
              <span className="mono fu-tag">Tesla · Optimus</span>
              <h3 className="display">Optimus e a substituição do trabalho humano</h3>
              <p>Humanoides como o Optimus podem ocupar funções hoje remuneradas. Na tese da BETTEX, a substituição em escala concentra ganhos nos donos das máquinas e retira salário e poder de compra de quem depende do próprio trabalho.</p>
              <Src href="https://www.tesla.com/master-plan-part-4">Tesla, Master Plan Part IV</Src>
            </div>
          </article>
        </div>
        <p className="fu-note mono">A referência à Tesla não indica parceria, endosso ou participação da BETTEX na empresa.</p>
      </div>
    </section>

    <section id="resgatar-futuro" aria-labelledby="resgatar-futuro-t" className="slide fu fu--two">
      <div className="page-wrap">
        <div className="mono fu-kicker"><span>02 / 9</span><span className="fu-rule" aria-hidden="true" />O futuro das pessoas</div>
        <h2 id="resgatar-futuro-t" className="display fu-title fu-title--two">Resgatar o futuro <span>das pessoas</span></h2>
        <p className="fu-sub">Os sinais de fragilidade já são concretos: empregos eliminados, menos vagas criadas e milhões sem trabalho suficiente ou vínculo formal. Para quem depende de renda para viver, a promessa de abundância não resolve o presente.</p>
        <LaborSignals />
        <div className="fu-position">
          <span className="fu-signal-icon fu-position-icon"><CircuitBoard aria-hidden="true" /></span>
          <p className="display fu-pos-lead">Resgatar o futuro é ampliar o acesso à participação econômica, para que a tecnologia não produza prosperidade apenas para quem já controla o capital.</p>
        </div>
      </div>
    </section>

  </>;
}

export default FutureSections;
