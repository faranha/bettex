import './AICrisisScenario.css';
import { PitchObservations } from './PitchObservations';

const sources = {
  axios: 'https://www.axios.com/2025/05/28/ai-jobs-white-collar-unemployment-anthropic',
  jobs: 'https://www.cnbc.com/2026/01/27/dario-amodei-warns-ai-cause-unusually-painful-disruption-jobs.html',
  essay: 'https://www.darioamodei.com/essay/the-adolescence-of-technology#4-player-piano',
  existential: 'https://www.reuters.com/business/finance/anthropic-warns-ai-may-pose-existential-risks-humanity-ipo-filing-2026-09-29/',
  revision: 'https://fortune.com/2026/05/26/sam-altman-dario-amodei-walking-back-ai-jobs-apocalypse-prophecies-ipo',
};

function NewsLink({ href, children }: { href: string; children: string }) {
  return <a className="ai-news-source" href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>;
}

export function LaborWarningReports() {
  return <section id="alertas-ia" className="ai-crisis" aria-labelledby="ai-warnings-title">
    <span className="mono fu-tag">04 / Futuro do trabalho · matérias e alertas</span>
    <h3 id="ai-warnings-title" className="display">E se o próximo emprego também desaparecer?</h3>
    <p className="ai-crisis-intro">O risco sombrio não é apenas perder uma função. É procurar a próxima e descobrir que a mesma tecnologia também chegou lá: escritório, programação, atendimento e, com robôs, trabalho físico. Os alertas abaixo descrevem esse cenário; não são contagens de desempregados.</p>
    <div className="ai-news-grid">
      <article>
        <span className="mono">Axios · maio de 2025 / CNBC · janeiro de 2026</span>
        <h4 className="display">Metade dos empregos de entrada pode desaparecer</h4>
        <p>Em maio de 2025, Dario Amodei alertou à Axios que a IA poderia eliminar metade dos empregos de entrada de colarinho branco e levar o desemprego nos EUA a 10% a 20% em um a cinco anos. Voltou ao cenário de substituição no ensaio de janeiro de 2026. É uma previsão, não uma contagem de postos eliminados.</p>
        <NewsLink href={sources.axios}>Ler o alerta de Amodei · Axios</NewsLink>
        <NewsLink href={sources.jobs}>Ler a reportagem da CNBC</NewsLink>
        <NewsLink href={sources.essay}>Ler o ensaio de Amodei · seção 4</NewsLink>
      </article>
      <article>
        <span className="mono">Reuters · setembro de 2026</span>
        <h4 className="display">A própria Anthropic declara riscos catastróficos à humanidade</h4>
        <p>A Reuters relata que o prospecto do IPO alerta para riscos catastróficos ou existenciais de IA avançada, incluindo comportamentos de autopreservação e resistência ao desligamento. É um alerta de segurança da empresa, não uma previsão estatística de desemprego ou de extinção inevitável.</p>
        <NewsLink href={sources.existential}>Ler a reportagem da Reuters</NewsLink>
      </article>
    </div>
    <PitchObservations dark>
      <NewsLink href={sources.revision}>Divergências nas previsões · Fortune, 26 mai. 2026</NewsLink>
      <p>Esses alertas não são fatos consumados: as previsões foram posteriormente revistas e continuam controversas.</p>
    </PitchObservations>
  </section>;
}
