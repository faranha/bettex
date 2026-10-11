import { LaborSignals } from './LaborSignals';
import { USVacancyChart } from './USVacancyChart';
import { BrazilEmploymentCharts } from './BrazilEmploymentCharts';
import { InflationOilRisks } from './InflationOilRisks';
import { LaborWarningReports } from './AICrisisScenario';
import { PitchSlider } from './PitchSlider';
import { ChapterHero } from './ChapterHero';
import './FutureSections.css';

const PHOTO = `${import.meta.env.BASE_URL}pitch-future/elon-musk.jpg`;

export function FutureSections() {
  return <>
    <section id="agora" aria-labelledby="agora-t" className="slide fu fu--one">
      <ChapterHero id="agora" n="04" kicker="Ambiente externo" src="pitch-future/urban-poverty-sao-paulo-2024.jpg" credit={{ label: 'Paulo Pinto / Agência Brasil · São Paulo, 2024', href: 'https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2024-02/populacao-em-situacao-de-rua-aumenta-17-vezes-em-sao-paulo' }} title={<>Ambiente externo.</>} summary="Musk, automação do trabalho e o que está acontecendo na economia real." />
      <div className="page-wrap">
        <div id="cenario-exclusao" className="fu-scenario">
          <div className="fu-scenario-opening">
            <div className="fu-scenario-copy">
              <h3 className="display fu-environment-title">O cenário apocalíptico</h3>
              <p>Esse é o apocalipse econômico que acreditamos estar se aproximando: a tecnologia avança, mas pessoas ficam sem trabalho, sem salário e sem uma nova oportunidade. A BETTEX nasce para agir diante dessa ameaça, antes que a exclusão se consolide.</p>
            </div>
            <figure className="fu-photo fu-scenario-photo" data-attribution="The Royal Society (2018)" data-license="https://creativecommons.org/licenses/by-sa/3.0/" data-modifications="crop, color grading">
              <img src={PHOTO} alt="Retrato de Elon Musk em 2018" width={1337} height={1771} loading="lazy" />
              <figcaption><a href="https://commons.wikimedia.org/wiki/File:Elon_Musk_Royal_Society_(crop2).jpg" target="_blank" rel="noopener noreferrer">Fonte: The Royal Society</a></figcaption>
            </figure>
          </div>
          <ol className="fu-pauta"><li>EUA: vagas abertas</li><li>Brasil: menos novas vagas</li><li>Inflação, petróleo e conflitos globais</li><li>Alertas de um futuro sem trabalho</li></ol>
          <PitchSlider id="ambiente-externo-slider" tone="dark" label={['Indicadores econômicos em blocos', 'Economic indicator blocks', 'Indicadores económicos por bloques']} slides={[
            { label: ['EUA: vagas abertas', 'US: job openings', 'EE. UU.: vacantes'], node: <USVacancyChart /> },
            { label: ['Brasil: menos novas vagas', 'Brazil: fewer new jobs', 'Brasil: menos empleos nuevos'], node: <BrazilEmploymentCharts /> },
            { label: ['Inflação, petróleo e conflitos', 'Inflation, oil and conflicts', 'Inflación, petróleo y conflictos'], node: <InflationOilRisks /> },
            { label: ['Alertas sem trabalho', 'Warnings of a jobless future', 'Alertas de un futuro sin trabajo'], node: <LaborWarningReports /> },
          ]} />
        </div>
    <section id="resgatar-futuro" aria-labelledby="resgatar-futuro-t" className="fu-environment-signals">
        <h3 id="resgatar-futuro-t" className="display fu-environment-title">O que já acontece na economia real.</h3>
        <p className="fu-sub">Os sinais de fragilidade já são concretos: empregos eliminados, menos vagas criadas e milhões sem trabalho suficiente ou vínculo formal. Para quem depende de renda para viver, a promessa de abundância não resolve o presente.</p>
        <LaborSignals />
    </section>
      </div>
    </section>

  </>;
}

export default FutureSections;
