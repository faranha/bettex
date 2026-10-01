import './RoadmapSection.css';

const stops = [
  {
    number: '01',
    tag: 'PONTO DE PARTIDA',
    title: 'Apresentação do pré-lançamento',
    description: 'Mostrar o projeto, o funcionamento do token e as regras já documentadas. A página apresenta o modelo; não realiza compras.',
  },
  {
    number: '02',
    tag: 'PRIMEIRO TESTE',
    title: 'Piloto da BETTEX',
    description: 'Testar a BETTEX em ambiente supervisionado, com limites de risco e avaliação das oportunidades antes de ampliar a operação.',
  },
  {
    number: '03',
    tag: 'PRÓXIMO MARCO',
    title: 'Lançamento do token',
    description: 'Disponibilizar o BETTEX conforme as regras de emissão, só após validar contratos, tesouraria, segurança e condições jurídicas.',
    featured: true,
  },
  {
    number: '04',
    tag: 'ESTRUTURA',
    title: 'Tesouraria em operação',
    description: 'Acompanhar a reserva defensiva e a parcela investível, com conciliação dos saldos e limites para a operação.',
  },
  {
    number: '05',
    tag: 'AMPLIAÇÃO',
    title: 'Operação multimercado',
    description: 'Ampliar a atuação da BETTEX em previsões, ações e cripto, esportes e cassinos, buscando otimizar a alocação onde houver maior vantagem, conforme acesso permitido, integração viável e limites de risco.',
  },
  {
    number: '06',
    tag: 'ACOMPANHAMENTO',
    title: 'Resultados e acesso',
    description: 'Testar a apuração dos resultados e a distribuição apenas quando houver lucro. Abrir o acompanhamento do investidor gradualmente.',
  },
] as const;

export function RoadmapSection() {
  return (
    <section className="roadmap" id="roadmap" aria-labelledby="roadmap-title">
      <div className="roadmap__wrap">
        <div className="roadmap__topline" aria-hidden="true">
          <span>BETTEX / O CAMINHO ADIANTE</span>
          <span>MAPA DO PROJETO · 06 MARCOS</span>
        </div>

        <header className="roadmap__intro">
          <div>
            <p className="roadmap__eyebrow"><span className="roadmap__eyebrow-mark" aria-hidden="true" /> Uma rota, passo a passo</p>
            <h2 id="roadmap-title">O caminho da <em>BETTEX.</em></h2>
          </div>
          <div className="roadmap__intro-side">
            <span className="roadmap__intro-index" aria-hidden="true">01 → 06</span>
            <p>Do primeiro contato com o projeto à operação acompanhada. Um marco prepara o próximo.</p>
          </div>
        </header>

        <div className="roadmap__map" aria-label="Percurso planejado do projeto BETTEX">
          <div className="roadmap__map-caption" aria-hidden="true">
            <span>SEQUÊNCIA PLANEJADA</span>
            <span>LEITURA 01 → 06</span>
          </div>

          <ol className="roadmap__stops">
            {stops.map((stop, index) => (
              <li
                className={`roadmap__stop roadmap__stop--${index + 1}${'featured' in stop ? ' roadmap__stop--featured' : ''}`}
                key={stop.number}
                data-testid={`roadmap-step-${index + 1}`}
              >
                <span className="roadmap__pin" aria-hidden="true"><span /></span>
                <article className="roadmap__place">
                  <div className="roadmap__place-top">
                    <span className="roadmap__place-number">{stop.number}<span> / 06</span></span>
                    <span className="roadmap__place-tag">{stop.tag}</span>
                  </div>
                  <h3>{stop.title}</h3>
                  <p>{stop.description}</p>
                </article>
              </li>
            ))}
          </ol>
          <div className="roadmap__destination" aria-hidden="true"><span className="roadmap__destination-dot" /> CAMINHO EM CONSTRUÇÃO</div>
        </div>

        <aside className="roadmap__closing" aria-label="Observação sobre o percurso">
          <div className="roadmap__closing-mark" aria-hidden="true"><span /><span /><span /></div>
          <div>
            <span className="roadmap__closing-label">O QUE IMPORTA NESTA ROTA</span>
            <p>Os marcos indicam uma sequência planejada, não entregas concluídas nem uma data de lançamento. Cada avanço depende dos testes e das verificações necessárias. Investir envolve risco e não há rendimento garantido.</p>
          </div>
        </aside>
      </div>
      <div className="roadmap__fade" aria-hidden="true" />
    </section>
  );
}

export default RoadmapSection;