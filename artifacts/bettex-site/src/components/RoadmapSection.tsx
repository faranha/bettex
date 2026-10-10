import { FlaskConical, ScrollText, Rocket, Compass, MessagesSquare, Bot, Landmark, CalendarDays, ArrowRight } from 'lucide-react';
import { CommunityCTA } from './CommunityCTA';
import { DemoAppLink } from './DemoAppLink';
import './RoadmapSection.css';

const icons = [ScrollText, FlaskConical, CalendarDays, Rocket, Compass, MessagesSquare, Bot, Landmark];

const stops = [
  {
    tag: 'TOKEN · VENDA PÚBLICA',
    date: '10 de dezembro de 2026',
    dateTime: '2026-12-10',
    title: 'Lançamento público do token BETTEX',
    description: 'Disponibilizar 15% da emissão total na venda pública inicial, abrir o pool e prever a listagem pública, conforme as condições da oferta. Captar recursos para o projeto e ampliar o conhecimento da BETTEX antes do lançamento do agente.',
  },
  {
    tag: 'ALFA · AGENTE · CAPTAÇÃO',
    date: '1º trimestre de 2027',
    dateTime: undefined,
    title: 'ALFA do agente e captação de investidores',
    description: 'Lançar a versão ALFA do agente entre janeiro e março de 2027, validar o produto com a comunidade e recolher feedback. Captar investidores para a evolução do negócio e avançar na formalização da empresa.',
    featured: true,
  },
  {
    tag: 'VESTING · LIBERAÇÃO',
    date: '10 de março de 2027',
    dateTime: '2027-03-10',
    title: 'Início do vesting',
    description: 'Iniciar o vesting três meses após a abertura da venda pública. Os 15% iniciais pertencem à alocação pública; os 85% restantes seguem o cronograma de 36 meses. Este marco não determina a data de estreia do ALFA.',
  },
  {
    tag: 'BETA · GO TO MARKET',
    date: 'Após o ALFA · data a definir',
    dateTime: undefined,
    title: 'Lançamento do BETA e go to market',
    description: 'Lançar a versão BETA e iniciar o go to market após os testes e aprendizados do ALFA. Ampliar o acesso ao produto, sem repetir o lançamento público do token.',
  },
  {
    tag: 'PRIMEIRO MERCADO',
    date: 'Após o BETA · data a definir',
    dateTime: undefined,
    title: 'Abertura dos mercados',
    description: 'Iniciar a operação em mercados de previsão (prediction markets), com acompanhamento, limites de risco e avaliação dos resultados.',
  },
  {
    tag: 'CONSULTA ABERTA',
    date: 'Após a abertura dos mercados',
    dateTime: undefined,
    title: 'Resultados e próximos passos',
    description: 'Realizar uma consulta aberta para avaliar os resultados da operação e determinar os próximos passos do projeto.',
  },
  {
    tag: 'AMPLIAÇÃO',
    date: 'Junho de 2027',
    dateTime: '2027-06',
    title: 'Novos agentes',
    description: 'Expandir a operação com novos agentes, conforme os resultados e as prioridades definidos na consulta aberta.',
  },
  {
    tag: 'EXPANSÃO DO APLICATIVO',
    date: 'Dezembro de 2027',
    dateTime: '2027-12',
    title: 'BETTEX Bank',
    description: 'Uma nova etapa de expansão do aplicativo BETTEX. O formato, os recursos e o alcance dessa evolução permanecem em aberto.',
  },
] as const;

export function RoadmapSection({ id = 'roadmap' }: { id?: string } = {}) {
  const total = String(stops.length).padStart(2, '0');
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
            <p>Token para o público em 10 de dezembro de 2026. ALFA do agente e captação de investidores no primeiro trimestre de 2027. Vesting a partir de 10 de março de 2027, três meses após a venda pública.</p>
          </div>
        </header>

        <div className="roadmap__map" aria-label="Percurso planejado do projeto BETTEX">
          <div className="roadmap__map-caption" aria-hidden="true">
            <span>SEQUÊNCIA PLANEJADA</span>
            <span>LEITURA 01 → {total}</span>
          </div>

          <ol className="roadmap__stops">
            {stops.map((stop, index) => {
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
                  {(index === 1 || index === 3) && <DemoAppLink className="roadmap__features roadmap__features--demo" data-testid={index === 1 ? 'roadmap-alpha-features' : 'roadmap-beta-features'}><span>Abrir o demo</span><ArrowRight size={16} aria-hidden="true" /></DemoAppLink>}
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
            <p>As datas indicam o cronograma previsto, não entregas concluídas. Cada avanço depende dos testes e das verificações necessárias, e o planejamento pode ser ajustado. Investir envolve risco e não há rendimento garantido.</p>
            <CommunityCTA source="roadmap" label="Entre na comunidade" note="Acompanhe cada etapa de perto." tone="light" />
          </div>
        </aside>
      </div>
    </section>
  );
}

export default RoadmapSection;