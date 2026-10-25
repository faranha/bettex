import { ArrowRight, ExternalLink } from 'lucide-react';
import { t } from '../../lib/i18n';
import { AgenticProblemMetrics } from './AgenticProblemMetrics';
import { PitchSlider } from './PitchSlider';
import { OptimusWorkCard } from './OptimusWorkCard';
import { LaborSignals } from './LaborSignals';
import { USVacancyChart } from './USVacancyChart';
import { BrazilEmploymentCharts } from './BrazilEmploymentCharts';
import './ProblemSection.css';

export function EmploymentIncomeProblem() {
  return <section id="problema-emprego-renda" className="pb-problem__automation" aria-labelledby="problema-ia-t">
    <div className="pb-problem__robot-background" aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}pitch-future/tesla-optimus.jpg`} alt="" width={1024} height={1024} />
    </div>
    <p className="mono pb-problem__topic">2. Emprego e renda ameaçados pela IA</p>
    <h3 id="problema-ia-t" className="display">Automação não garante prosperidade para todos.</h3>
    <PitchSlider id="emprego-ia-slider" tone="dark" label={['IA, trabalho e renda em blocos', 'AI, work and income blocks', 'IA, trabajo e ingresos por bloques']} slides={[
      { label: ['Promessa de abundância', 'Promise of abundance', 'Promesa de abundancia'], node: <>
    <p>Musk apresenta a visão de máquinas substituindo o trabalho humano e de renda universal alta. A tese da BETTEX é outra: sem ampliar o acesso aos ganhos da tecnologia, a automação pode aprofundar a perda de renda e a exclusão antes de produzir prosperidade.</p>
    <figure className="pb-problem__opening-video">
      <div className="pb-problem__video-frame">
        <iframe
          src="https://www.youtube-nocookie.com/embed/HHS8OVYT9cI?rel=0&enablejsapi=1"
          title={t('Elon Musk e a promessa de abundância')}
          loading="eager"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <figcaption><a href="https://www.youtube.com/watch?v=HHS8OVYT9cI" target="_blank" rel="noopener noreferrer">{t('USA TODAY · Elon Musk e a promessa de abundância')}<ExternalLink aria-hidden="true" /></a></figcaption>
    </figure>
      </> },
      { label: ['Economia agêntica', 'Agentic economy', 'Economía agéntica'], node: <>
    <div className="pb-problem__agentic-intro">
      <h4 className="display">Economia agêntica: não é só conversar com uma IA.</h4>
      <p>Agentes de IA executam tarefas, usam ferramentas e tomam decisões dentro de limites definidos. O risco para o colarinho branco é deixar de ser necessário no fluxo de trabalho. Robôs como o Optimus ampliam essa pressão para o trabalho físico.</p>
    </div>
    <OptimusWorkCard />
    <AgenticProblemMetrics />

      </> },
      { label: ['Exposição à IA', 'AI exposure', 'Exposición a la IA'], node: <>
    <div className="pb-problem__response">
      <p>No estudo de <strong>2024</strong> da OIT e do Banco Mundial, <strong>26% a 38%</strong> dos empregos da América Latina e do Caribe estavam expostos à IA generativa, e <strong>2% a 5%</strong> tinham potencial de automação completa com as capacidades então disponíveis. A exposição era maior em empregos formais e qualificados, inclusive de colarinho branco; a exclusão digital limitava os benefícios potenciais da IA em cerca de <strong>17 milhões</strong> de postos. Exposição não equivale a empregos eliminados: são estimativas de potencial técnico e barreiras de acesso, não desemprego futuro comprovado.</p>
    </div>

      </> },
      { label: ['O problema a resolver', 'The problem to solve', 'El problema a resolver'], node: <>
    <div className="pb-problem__response">
      <h4 className="display">O problema que a BETTEX quer resolver</h4>
      <p>Trocar a busca de futuro nas apostas por participação na economia agêntica. Pelo token, a BETTEX propõe acesso à tecnologia e aos resultados previstos pelas suas regras: participar dessa economia, em vez de depender apenas do salário que ela ameaça. Não é renda garantida.</p>
      <a className="tap pb-problem__evidence-link" href="#solucao">Como a BETTEX responde a esse problema<ArrowRight aria-hidden="true" /></a>
    </div>
      </> },
    ]} />
    <div id="cenario-exclusao" className="fu-scenario">
      <section id="resgatar-futuro" className="fu-environment-signals" aria-labelledby="resgatar-futuro-t">
        <h4 id="resgatar-futuro-t" className="display fu-environment-title">O que já acontece na economia real.</h4>
        <LaborSignals />
      </section>
      <PitchSlider id="emprego-indicadores-slider" tone="dark" label={['Indicadores econômicos em blocos', 'Economic indicator blocks', 'Indicadores económicos por bloques']} slides={[
        { label: ['EUA: vagas abertas', 'US: job openings', 'EE. UU.: vacantes'], node: <USVacancyChart /> },
        { label: ['Brasil: menos novas vagas', 'Brazil: fewer new jobs', 'Brasil: menos empleos nuevos'], node: <BrazilEmploymentCharts /> },
      ]} />
    </div>
  </section>;
}