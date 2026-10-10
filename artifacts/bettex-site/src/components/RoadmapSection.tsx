import { FlaskConical, ScrollText, Rocket, Compass, MessagesSquare, Bot, Landmark, CalendarDays, Scale, ArrowRight } from 'lucide-react';
import { CommunityCTA } from './CommunityCTA';
import { DemoAppLink } from './DemoAppLink';
import './RoadmapSection.css';

const icons = [Scale, ScrollText, FlaskConical, CalendarDays, Rocket, Compass, MessagesSquare, Bot, Landmark];

const stops = [
  {
    tag: 'ADEQUAÇÃO LEGAL E JURÍDICA',
    date: 'Antes de cada lançamento',
    dateTime: undefined,
    title: 'Investigação técnico-legal por mercado',
    description: 'Verificar as regras locais da oferta do token, da solução e de cada agente antes do lançamento. Cumprir as exigências aplicáveis e validar os controles técnicos. Categorias proibidas, sem autorização necessária ou ainda em investigação não serão oferecidas naquele território. Reavaliar a adequação antes de cada expansão.',
  },
  {
    tag: 'TOKEN · VENDA PÚBLICA',
    date: '10 de dezembro de 2026',
    dateTime: '2026-12-10',
    title: 'Lançamento público do token BETTEX',
    description: 'Abrir o mint público de até 10% da emissão total, a preço fixo, para financiar o projeto e ampliar o conhecimento da BETTEX. Execução própria ou por launchpad parceiro, sujeita à adequação legal da oferta e à elegibilidade aplicável.',
  },
  {
    tag: 'ALFA · AGENTE · CAPTAÇÃO',
    date: 'Março de 2027',
    dateTime: '2027-03',
    title: 'ALFA do agente e captação de investidores',
    description: 'Lançar o sistema e a versão ALFA do agente em março de 2027, com escopo adequado ao ambiente jurídico local. Liberar somente agentes e funcionalidades validados para cada território. Recolher feedback da comunidade e captar investidores para a evolução do negócio.',
    featured: true,
  },
  {
    tag: 'VESTING · LIBERAÇÃO',
    date: 'Março de 2027',
    dateTime: '2027-03',
    title: 'Início do vesting',
    description: 'Iniciar o vesting de 24 meses: 55% para a comunidade, 20% para fundador e equipe e 15% para investidores. Os 10% do mint público inicial ficam separados. O início acompanha a etapa prevista de lançamento do sistema.',
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
    description: 'Abrir somente as categorias e os agentes com adequação técnico-legal validada para os territórios atendidos, com acompanhamento, limites de risco e avaliação dos resultados. Mercados de previsão dependem dessa análise específica, sem disponibilidade presumida no Brasil.',
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
    description: 'Expandir com novos agentes conforme os resultados e as prioridades da consulta aberta. Cada nova atividade e território exige investigação técnico-legal e validação antes da liberação.',
  },
  {
    tag: 'EXPANSÃO DO APLICATIVO',
    date: 'Dezembro de 2027',
    dateTime: '2027-12',
    title: 'BETTEX Bank',
    description: 'Uma nova etapa de expansão do aplicativo BETTEX, com estrutura e adequação jurídica próprias antes de qualquer oferta de serviços financeiros. Formato, recursos e alcance permanecem em aberto.',
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
            <p>Mint público em 10 de dezembro de 2026. Sistema, ALFA e início do vesting de 24 meses previstos para março de 2027. Cada lançamento depende da adequação legal e jurídica da oferta, da atividade e do território atendido.</p>
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
                  {(index === 2 || index === 4) && <DemoAppLink className="roadmap__features roadmap__features--demo" data-testid={index === 2 ? 'roadmap-alpha-features' : 'roadmap-beta-features'}><span>Abrir o demo</span><ArrowRight size={16} aria-hidden="true" /></DemoAppLink>}
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
            <p>As datas indicam o cronograma previsto, não entregas concluídas nem autorizações obtidas. Cada lançamento depende de adequação legal e jurídica, testes e controles aplicáveis. Se uma categoria não puder ser oferecida legalmente num território, ela fica fora da oferta local. O planejamento pode ser ajustado. Investir envolve risco e não há rendimento garantido.</p>
            <CommunityCTA source="roadmap" label="Entre na comunidade" note="Acompanhe cada etapa de perto." tone="light" />
          </div>
        </aside>
      </div>
    </section>
  );
}

export default RoadmapSection;