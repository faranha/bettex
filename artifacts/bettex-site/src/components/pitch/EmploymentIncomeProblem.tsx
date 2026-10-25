import { ArrowRight, ExternalLink } from 'lucide-react';
import { t } from '../../lib/i18n';
import { useX } from './pitchCopy';
import { AgenticProblemMetrics } from './AgenticProblemMetrics';
import { PitchSlider } from './PitchSlider';
import { OptimusWorkCard } from './OptimusWorkCard';
import { LaborSignals } from './LaborSignals';
import { USVacancyChart } from './USVacancyChart';
import { BrazilEmploymentCharts } from './BrazilEmploymentCharts';
import './ProblemSection.css';
import './EmploymentIncomeProblem.css';

export function EmploymentIncomeProblem() {
  const x = useX();
  return <section id="problema-emprego-renda" className="pb-problem__automation" aria-labelledby="problema-ia-t">
    <div className="pb-problem__robot-background" aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}pitch-future/tesla-optimus.jpg`} alt="" width={1024} height={1024} />
    </div>
    <p className="mono pb-problem__topic">{x('Emprego e renda ameaçados pela IA', 'Jobs and income threatened by AI', 'Empleo e ingresos amenazados por la IA')}</p>
    <h3 id="problema-ia-t" className="display">{x('Automação não garante prosperidade para todos.', 'Automation does not guarantee prosperity for everyone.', 'La automatización no garantiza prosperidad para todos.')}</h3>
    <PitchSlider id="emprego-ia-slider" tone="dark" label={['IA, trabalho, renda e indicadores em blocos', 'AI, work and income blocks', 'IA, trabajo e ingresos por bloques']} slides={[
      { label: ['Promessa de abundância', 'Promise of abundance', 'Promesa de abundancia'], node: <>
    <p>{x('Musk prevê máquinas no lugar do trabalho humano e renda universal alta. Tese da BETTEX: sem acesso aos ganhos da tecnologia, a automação pode aprofundar a perda de renda e a exclusão antes de gerar prosperidade.','Musk envisions machines replacing human work and high universal income. BETTEX thesis: without access to technology gains, automation can deepen income loss and exclusion before producing prosperity.','Musk prevé máquinas en lugar del trabajo humano e ingreso universal alto. Tesis de BETTEX: sin acceso a los beneficios de la tecnología, la automatización puede profundizar la pérdida de ingresos y la exclusión antes de generar prosperidad.')}</p>
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
      { label: ['Agentes e renda', 'Agents and income', 'Agentes e ingresos'], node: <>
    <div className="pb-problem__agentic-intro">
      <h4 className="display">{x('Economia agêntica: IA que executa tarefas.', 'Agentic economy: AI that executes tasks.', 'Economía agéntica: IA que ejecuta tareas.')}</h4>
      <p>{x('Agentes executam tarefas, usam ferramentas e decidem dentro de limites. O risco para o colarinho branco é sair do fluxo de trabalho; robôs como o Optimus levam essa pressão ao trabalho físico.','Agents execute tasks, use tools and decide within limits. The white-collar risk is dropping out of the workflow; robots like Optimus extend that pressure to physical work.','Los agentes ejecutan tareas, usan herramientas y deciden dentro de límites. El riesgo para el trabajo de oficina es salir del flujo de trabajo; robots como Optimus llevan esa presión al trabajo físico.')}</p>
    </div>
    <OptimusWorkCard />
    <AgenticProblemMetrics />

    <div className="pb-problem__response">
      <p>{x('Estudo de 2024 da OIT e do Banco Mundial: 26% a 38% dos empregos na América Latina e no Caribe expostos à IA generativa; 2% a 5% com potencial de automação completa. Exposição maior em empregos formais e qualificados; a exclusão digital limita benefícios em cerca de 17 milhões de postos. São estimativas de potencial técnico, não desemprego comprovado nem causalidade da IA.','2024 ILO and World Bank study: 26% to 38% of jobs in Latin America and the Caribbean exposed to generative AI; 2% to 5% with full automation potential. Exposure is higher in formal, skilled jobs; the digital divide limits benefits for about 17 million jobs. These are technical-potential estimates, not proven unemployment or AI causation.','Estudio de 2024 de la OIT y el Banco Mundial: 26% a 38% de los empleos en América Latina y el Caribe expuestos a la IA generativa; 2% a 5% con potencial de automatización completa. Mayor exposición en empleos formales y calificados; la exclusión digital limita los beneficios en unos 17 millones de puestos. Son estimaciones de potencial técnico, no desempleo comprobado ni causalidad de la IA.')}</p>
    </div>

    <div className="pb-problem__response">
      <h4 className="display">{x('O problema que a BETTEX quer resolver', 'The problem BETTEX wants to solve', 'El problema que BETTEX quiere resolver')}</h4>
      <p>{x('Trocar a busca de futuro nas apostas por participação na economia agêntica, nos resultados previstos pelas regras do token, em vez de depender só do salário ameaçado. Não é renda garantida.','Swap the search for a future in betting for participation in the agentic economy, in the results set by the token rules, instead of relying only on a threatened wage. Not guaranteed income.','Cambiar la búsqueda de futuro en las apuestas por participación en la economía agéntica, en los resultados previstos por las reglas del token, en lugar de depender solo del salario amenazado. No es ingreso garantizado.')}</p>
      <a className="tap pb-problem__evidence-link" href="#solucao">{x('Como a BETTEX responde a esse problema','How BETTEX responds to this problem','Cómo responde BETTEX a este problema')}<ArrowRight aria-hidden="true" /></a>
    </div>
      </> },
      { label: ['Economia real', 'Real economy', 'Economía real'], node: <div id="cenario-exclusao"><section id="resgatar-futuro" className="fu-environment-signals" aria-labelledby="resgatar-futuro-t">
        <h4 id="resgatar-futuro-t" className="display fu-environment-title">{x('O que já acontece na economia real.', 'What is already happening in the real economy.', 'Lo que ya ocurre en la economía real.')}</h4>
        <div data-testid="pitch-labor-carousel" onTouchStart={event => event.stopPropagation()} onTouchEnd={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
          <LaborSignals />
        </div>
      </section></div> },
      { label: ['Vagas nos EUA', 'US job openings', 'Vacantes en EE. UU.'], node: <div id="emprego-indicadores-slider"><USVacancyChart /></div> },
      { label: ['Emprego no Brasil', 'Jobs in Brazil', 'Empleo en Brasil'], node: <BrazilEmploymentCharts /> },
    ]} />
  </section>;
}