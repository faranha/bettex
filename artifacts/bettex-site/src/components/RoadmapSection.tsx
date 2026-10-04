import { ScrollText, Rocket, Compass, MessagesSquare, Bot, Landmark } from 'lucide-react';
import { CommunityCTA } from './CommunityCTA';
import './RoadmapSection.css';

const icons = [ScrollText, Rocket, Compass, MessagesSquare, Bot, Landmark];

const stops = [
  {
    number: '01',
    tag: 'PREPARAÇÃO TÉCNICA E JURÍDICA',
    date: 'Pré-lançamento',
    dateTime: '',
    title: 'Preparação do ecossistema BETTEX',
    description: 'Apresentar o projeto a investidores-anjo. Investigar os requisitos legais e regulatórios do projeto e preparar sua base técnica: arquitetura, contratos, segurança e integrações. Estruturar o ecossistema BETTEX para as validações técnicas e jurídicas necessárias antes do lançamento.',
  },
  {
    number: '02',
    tag: 'LANÇAMENTO',
    date: 'Dezembro de 2026',
    dateTime: '2026-12',
    title: 'Lançamento do token',
    description: 'Disponibilizar o BETTEX conforme as regras de emissão, após validar contratos, tesouraria, segurança e condições jurídicas.',
    featured: true,
  },
  {
    number: '03',
    tag: 'PRIMEIRO MERCADO',
    date: 'Fevereiro de 2027',
    dateTime: '2027-02',
    title: 'Abertura dos mercados',
    description: 'Iniciar a operação em mercados de previsão (prediction markets), com acompanhamento, limites de risco e avaliação dos resultados.',
  },
  {
    number: '04',
    tag: 'CONSULTA ABERTA',
    date: 'Março de 2027',
    dateTime: '2027-03',
    title: 'Resultados e próximos passos',
    description: 'Realizar uma consulta aberta para avaliar os resultados da operação e determinar os próximos passos do projeto.',
  },
  {
    number: '05',
    tag: 'AMPLIAÇÃO',
    date: 'Junho de 2027',
    dateTime: '2027-06',
    title: 'Novos agentes',
    description: 'Expandir a operação com novos agentes, conforme os resultados e as prioridades definidos na consulta aberta.',
  },
  {
    number: '06',
    tag: 'EXPANSÃO DO APLICATIVO',
    date: 'Dezembro de 2027',
    dateTime: '2027-12',
    title: 'BETTEX Bank',
    description: 'Uma nova etapa de expansão do aplicativo BETTEX. O formato, os recursos e o alcance dessa evolução permanecem em aberto.',
  },
] as const;

export function RoadmapSection() {
  return (
    <section className="roadmap" id="roadmap" aria-labelledby="roadmap-title">
      <div className="roadmap__wrap">
        <header className="roadmap__intro">
          <div>
            <p className="roadmap__eyebrow"><span className="roadmap__eyebrow-mark" aria-hidden="true" /> Uma rota, passo a passo</p>
            <h2 id="roadmap-title">O caminho da <em>BETTEX.</em></h2>
          </div>
          <div className="roadmap__intro-side">
            <span className="roadmap__intro-index" aria-hidden="true">01 → 06</span>
            <p>Da preparação técnica e jurídica à expansão do aplicativo. Lançamento do token em dezembro de 2026; abertura dos mercados em fevereiro de 2027.</p>
          </div>
        </header>

        <div className="roadmap__map" aria-label="Percurso planejado do projeto BETTEX">
          <div className="roadmap__map-caption" aria-hidden="true">
            <span>SEQUÊNCIA PLANEJADA</span>
            <span>LEITURA 01 → 06</span>
          </div>

          <ol className="roadmap__stops">
            {stops.map((stop, index) => {
              const Icon = icons[index];
              return (
              <li
                className={`roadmap__stop roadmap__stop--${index + 1}${'featured' in stop ? ' roadmap__stop--featured' : ''}`}
                key={stop.number}
                data-testid={`roadmap-step-${index + 1}`}
              >
                <span className="roadmap__pin" aria-hidden="true"><span /></span>
                <article className="roadmap__place">
                  <span className="roadmap__icon" aria-hidden="true"><Icon strokeWidth={2.2} /></span>
                  <div className="roadmap__place-top">
                    <span className="roadmap__place-number">{stop.number}<span> / 06</span></span>
                    <span className="roadmap__place-tag">{stop.tag}</span>
                  </div>
                  {stop.dateTime ? (
                    <time className="roadmap__place-date" dateTime={stop.dateTime}>{stop.date}</time>
                  ) : (
                    <span className="roadmap__place-date">{stop.date}</span>
                  )}
                  <h3>{stop.title}</h3>
                  <p>{stop.description}</p>
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