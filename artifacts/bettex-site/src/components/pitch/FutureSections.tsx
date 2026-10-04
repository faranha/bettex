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
        <div className="mono fu-kicker"><span>02 / 9</span><span className="fu-rule" aria-hidden="true" />Promessa sob contestação</div>
        <div className="fu-hero">
          <div>
            <div className="fu-verdict">
              <span className="mono">Tese da BETTEX</span>
              <h2 id="agora-t" className="display">É mentira, a era da prosperidade é uma mentira.</h2>
            </div>
            <p className="fu-sub">Na tese da BETTEX, a promessa de abundância esconde o risco de androides substituírem trabalhadores: os ganhos ficam com os donos das máquinas, enquanto quem depende de salário pode perder renda e lugar na economia.</p>
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
          <p>Se androides assumem funções físicas e a IA substitui atividades de escritório, a ameaça é perder o emprego e descobrir que a próxima oportunidade também deixou de existir.</p>
          <ol className="fu-pauta"><li>EUA: vagas abertas</li><li>Brasil: menos novas vagas</li><li>Inflação, petróleo e conflitos globais</li><li>Alertas de um futuro sem trabalho</li><li>Bolha da IA e risco de ruptura</li><li>Desta vez, patrimônio e salário</li></ol>
          <USVacancyChart />
          <BrazilEmploymentCharts />
          <InflationOilRisks />
          <LaborWarningReports />
          <div className="fu-evidence fu-evidence--focused">
            <article>
              <span className="mono fu-tag">EUA · dados até junho de 2026</span>
              <p className="display fu-evidence-value">19% abaixo</p>
              <h4 className="display">Menos oportunidades na entrada do mercado</h4>
              <p>Em ocupações expostas à IA, o emprego de jovens de 22 a 25 anos ficou 19% abaixo do nível que teria acompanhado seus colegas em funções menos expostas. A diferença aparece sobretudo em menos contratações, não em mais demissões. É uma comparação descritiva, não uma prova de causalidade.</p>
              <Src href="https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence">Stanford, 12 ago. 2026</Src>
            </article>
          </div>
          <p className="fu-evidence-limit">Os indicadores têm períodos e métodos diferentes e não devem ser somados. Stanford não encontra eliminação generalizada de empregos na economia; a comparação não prova causalidade da IA.</p>
          <AIBubbleScenario />
          <p className="display fu-now">Só resta o agora. O amanhã está perdido.</p>
          <p className="fu-scenario-note">Tese da BETTEX sobre o risco de exclusão, não uma previsão inevitável nem uma promessa de renda do projeto.</p>
        </div>
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
