import { FlaskConical, ScrollText, Rocket, Compass, MessagesSquare, Bot, Landmark, ArrowRight } from 'lucide-react';
import { CommunityCTA } from './CommunityCTA';
import { DemoAppLink } from './DemoAppLink';
import './RoadmapSection.css';

const icons = [FlaskConical, ScrollText, Rocket, Compass, MessagesSquare, Bot, Landmark];

const stops = [
  {
    tag: 'ALFA · SEED',
    date: 'Outubro de 2026',
    dateTime: '2026-10',
    title: 'ALFA com token de teste e audiência semente',
    description: 'Validar o produto com uma audiência semente, token de teste e contratos básicos em testnet, a IA BTEX e um agente de trading básico com Allora. Usar apenas tokens de teste, sem dinheiro real, venda TGE ou lançamento do token em produção.',
    current: true,
  },
  {
    tag: 'PRÉ-VENDA · CAPTAÇÃO · FORMALIZAÇÃO',
    date: 'Novembro de 2026',
    dateTime: '2026-11',
    title: 'Pré-venda, investidores e estruturação da empresa',
    description: 'Realizar a pré-venda do token, captar investidores-anjo, formalizar a empresa e estruturar o negócio para a próxima fase.',
  },
  {
    tag: 'BETA · TGE · GO TO MARKET',
    date: 'Janeiro de 2027',
    dateTime: '2027-01',
    title: 'Lançamento do BETA, TGE e go to market',
    description: 'Lançar a versão BETA, realizar o evento de geração do token (TGE) e iniciar o go to market. Ampliar o acesso ao produto a partir dos testes e aprendizados do ALFA.',
    featured: true,
  },
  {
    tag: 'PRIMEIRO MERCADO',
    date: 'Fevereiro de 2027',
    dateTime: '2027-02',
    title: 'Abertura dos mercados',
    description: 'Iniciar a operação em mercados de previsão (prediction markets), com acompanhamento, limites de risco e avaliação dos resultados.',
  },
  {
    tag: 'CONSULTA ABERTA',
    date: 'Março de 2027',
    dateTime: '2027-03',
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
            <p>ALFA seed em outubro de 2026, com token de teste em testnet e primeiros agentes. Pré-venda, captação e formalização em novembro de 2026. BETA, TGE e go to market em janeiro de 2027.</p>
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
              const current = 'current' in stop && stop.current;
              return (
              <li
                className={`roadmap__stop roadmap__stop--${index + 1}${'featured' in stop ? ' roadmap__stop--featured' : ''}${current ? ' roadmap__stop--current' : ''}`}
                key={stop.title}
                aria-current={current ? 'step' : undefined}
                data-testid={`roadmap-step-${index + 1}`}
              >
                <span className="roadmap__pin" aria-hidden="true"><span /></span>
                <article className="roadmap__place">
                  <span className="roadmap__icon" aria-hidden="true"><Icon strokeWidth={2.2} /></span>
                  <div className="roadmap__place-top">
                    <span className="roadmap__place-number">{number}<span> / {total}</span></span>
                    {current ? <DemoAppLink className="roadmap__place-tag underline underline-offset-4">{stop.tag}</DemoAppLink> : <span className="roadmap__place-tag">{stop.tag}</span>}
                  </div>
                  <time className="roadmap__place-date" dateTime={stop.dateTime}>{stop.date}</time>
                  {current && <span className="roadmap__current-badge" data-testid="roadmap-current-phase">Estamos aqui</span>}
                  <h3>{stop.title}</h3>
                  <p>{stop.description}</p>
                  {(index === 0 || index === 2) && <DemoAppLink className="roadmap__features roadmap__features--demo" data-testid={index === 0 ? 'roadmap-alpha-features' : 'roadmap-beta-features'}><span>Abrir o demo</span><ArrowRight size={16} aria-hidden="true" /></DemoAppLink>}
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