import { ExternalLink } from 'lucide-react';
import { MobileDataCarousel } from './MobileDataCarousel';
import { useX } from './pitchCopy';

export function AgenticProblemMetrics() {
  const x = useX();
  return <MobileDataCarousel id="economia-agentica-dados" className="pb-problem__agentic-metrics" labels={['Dados da economia agêntica', 'Agentic economy data', 'Datos de la economía agéntica']}>
    <article>
      <p className="mono pb-problem__agentic-label">Economia agêntica</p>
      <p className="display pb-problem__agentic-value">15%</p>
      <h4>Das decisões diárias de trabalho até 2028</h4>
      <p>Previsão da Gartner para decisões tomadas por agentes de IA. Escritório, análise, atendimento e programação estão no centro da nossa preocupação.</p>
      <a href="https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027" target="_blank" rel="noopener noreferrer">Gartner · previsão, 2025<ExternalLink aria-hidden="true" /></a>
    </article>
    <article>
      <p className="mono pb-problem__agentic-label">América Latina e Caribe</p>
      <p className="display pb-problem__agentic-value">26–38%</p>
      <h4>Dos empregos expostos à IA generativa</h4>
      <p>Estimativa da OIT e do Banco Mundial. Exposição significa transformação possível das tarefas, não esse percentual de postos eliminados.</p>
      <a href="https://www.ilo.org/publications/buffer-or-bottleneck-employment-exposure-generative-ai-and-digital-divide" target="_blank" rel="noopener noreferrer">OIT / Banco Mundial · estudo, 2024<ExternalLink aria-hidden="true" /></a>
    </article>
    <article>
      <p className="mono pb-problem__agentic-label">{x('Automação completa', 'Full automation', 'Automatización completa')}</p>
      <p className="display pb-problem__agentic-value">2–5%</p>
      <h4>{x('Dos empregos com potencial de automação completa', 'Of jobs with full automation potential', 'De los empleos con potencial de automatización completa')}</h4>
      <p>{x('Estimativa técnica para a América Latina e o Caribe no estudo de 2024. É diferente de exposição à IA e não representa empregos já eliminados.', 'A technical estimate for Latin America and the Caribbean in the 2024 study. It differs from AI exposure and does not represent jobs already eliminated.', 'Estimación técnica para América Latina y el Caribe en el estudio de 2024. Es distinta de la exposición a la IA y no representa empleos ya eliminados.')}</p>
      <a href="https://www.ilo.org/publications/buffer-or-bottleneck-employment-exposure-generative-ai-and-digital-divide" target="_blank" rel="noopener noreferrer">{x('OIT / Banco Mundial · estudo, 2024', 'ILO / World Bank · study, 2024', 'OIT / Banco Mundial · estudio, 2024')}<ExternalLink aria-hidden="true" /></a>
    </article>
    <article>
      <p className="mono pb-problem__agentic-label">A desigualdade de acesso</p>
      <p className="display pb-problem__agentic-value">17 milhões</p>
      <h4>De empregos com benefícios limitados pela exclusão digital</h4>
      <p>Na região, a falta de acesso digital dificulta ganhos com IA nesses postos. Pessoas humildes têm menos recursos para se adaptar e participar dessa economia.</p>
      <a href="https://www.ilo.org/publications/buffer-or-bottleneck-employment-exposure-generative-ai-and-digital-divide" target="_blank" rel="noopener noreferrer">OIT / Banco Mundial · estudo, 2024<ExternalLink aria-hidden="true" /></a>
    </article>
  </MobileDataCarousel>;
}