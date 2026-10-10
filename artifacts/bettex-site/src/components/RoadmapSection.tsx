import { FlaskConical, ScrollText, Rocket, Compass, MessagesSquare, Bot, ArrowRight } from 'lucide-react';
import { CommunityCTA } from './CommunityCTA';
import { DemoAppLink } from './DemoAppLink';
import './RoadmapSection.css';

const icons = [MessagesSquare, ScrollText, Rocket, FlaskConical, Compass, Bot];

export const roadmapStops = [
  { tag: 'DISPONÍVEL COMO DEMO', date: 'Atual', dateTime: undefined, title: 'Comunidade e preparação', description: 'Interface visual acessível e canal de feedback com a comunidade. O demo não comprova trading nem dinheiro real.' },
  { tag: 'PREVISTO · MINT PÚBLICO', date: '10 de dezembro de 2026', dateTime: '2026-12-10', title: 'Mint público', description: 'Oferta de até 10% da emissão, a preço fixo, conforme regras, termos e elegibilidade aprovados. Não garante a venda dos 10%.' },
  { tag: 'PREVISTO · ALFA E VESTING', date: 'Março de 2027', dateTime: '2027-03', title: 'Sistema ALFA e vesting', description: 'Sistema e escopo inicial validados, com captação de investidores e início do vesting de 24 meses. Liberação não significa venda ou circulação, nem abre todos os mercados.', featured: true },
  { tag: 'PREVISTO · BETA', date: 'Após o ALFA · data a definir', dateTime: undefined, title: 'BETA e go to market', description: 'Evolução do produto a partir das validações do ALFA, ampliando o acesso sem novo lançamento do token.' },
  { tag: 'EVOLUÇÃO FUTURA', date: 'Gradual · data a definir', dateTime: undefined, title: 'Expansão de mercados', description: 'Cada mercado e território só abre com integração e controles validados e adequação legal. Dados públicos não equivalem a operação autorizada.' },
  { tag: 'DIREÇÃO FUTURA', date: 'Sem prazo', dateTime: undefined, title: 'Gestão crescente por IA', description: 'Funções administrativas e operacionais passam gradualmente ao agente, com limites e evidências. Fundadores mantêm o domínio dos contratos até decisão separada.' },
] as const;

export function RoadmapSection({ id = 'roadmap' }: { id?: string } = {}) {
  const total = String(roadmapStops.length).padStart(2, '0');
  return (
    <section className="roadmap" id={id} aria-labelledby={`${id}-title`}>
      <div className="roadmap__wrap">
        <header className="roadmap__intro">
          <div>
            <p className="roadmap__eyebrow"><span className="roadmap__eyebrow-mark" aria-hidden="true" /> Uma rota, passo a passo</p>
            <h2 id={`${id}-title`}>O caminho da <em>BETTEX.</em></h2>
          </div>
          <div className="roadmap__intro-side">
            <span className="roadmap__intro-index" aria-hidden="true">01 → {total}</span>
            <p>Mint público em 10 de dezembro de 2026. Sistema, ALFA e início do vesting de 24 meses previstos para março de 2027. Cada lançamento depende da adequação legal e jurídica da oferta, da atividade e do território atendido.</p>
          </div>
        </header>

        <div className="roadmap__map" aria-label="Percurso planejado do projeto BETTEX">
          <div className="roadmap__map-caption" aria-hidden="true">
            <span>SEQUÊNCIA PLANEJADA</span>
            <span>LEITURA 01 → {total}</span>
          </div>

          <ol className="roadmap__stops">
            {roadmapStops.map((stop, index) => {
              const Icon = icons[index];
              const number = String(index + 1).padStart(2, '0');
              return (
              <li
                className={`roadmap__stop roadmap__stop--${index + 1}${'featured' in stop ? ' roadmap__stop--featured' : ''}`}
                key={stop.title}
                data-testid={`roadmap-step-${index + 1}`}
              >
                <span className="roadmap__pin" aria-hidden="true"><span /></span>
                <article className="roadmap__place">
                  <span className="roadmap__icon" aria-hidden="true"><Icon strokeWidth={2.2} /></span>
                  <div className="roadmap__place-top">
                    <span className="roadmap__place-number">{number}<span> / {total}</span></span>
                    <span className="roadmap__place-tag">{stop.tag}</span>
                  </div>
                  <time className="roadmap__place-date" dateTime={stop.dateTime}>{stop.date}</time>
                  <h3>{stop.title}</h3>
                  <p>{stop.description}</p>
                  {(index === 0 || index === 2) && <DemoAppLink className="roadmap__features roadmap__features--demo" data-testid={index === 2 ? 'roadmap-alpha-features' : 'roadmap-beta-features'}><span>Abrir o demo</span><ArrowRight size={16} aria-hidden="true" /></DemoAppLink>}
                </article>
              </li>
              );
            })}
          </ol>
          <div className="roadmap__destination" aria-hidden="true"><span className="roadmap__destination-dot" /> CAMINHO EM CONSTRUÇÃO</div>
        </div>

        <aside className="roadmap__closing" aria-label="Observação sobre o percurso">
          <div className="roadmap__closing-mark" aria-hidden="true"><span /><span /><span /></div>
          <div>
            <span className="roadmap__closing-label">O QUE IMPORTA NESTA ROTA</span>
            <p>As datas indicam o cronograma previsto, não entregas concluídas. Oferta e operação dependem de adequação por atividade e território e podem ser ajustadas. Investir envolve risco e não há rendimento garantido.</p>
            <CommunityCTA source="roadmap" label="Entre na comunidade" note="Acompanhe cada etapa de perto." tone="light" />
          </div>
        </aside>
      </div>
    </section>
  );
}

export default RoadmapSection;