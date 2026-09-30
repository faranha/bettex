import './RoadmapSection.css';

const steps = [
  {
    title: 'Regras e preparação',
    delivery: <>Transformar as <strong>regras já documentadas</strong> para token, tesouraria, risco e distribuição em critérios de implementação.</>,
    gate: <>Revisão jurídica e permissões necessárias ainda precisam ser verificadas antes de qualquer operação.</>,
  },
  {
    title: 'Base tecnológica',
    delivery: <>Construir emissão limitada a <strong>vendas confirmadas</strong>, carteiras, staking e infraestrutura na Arbitrum One.</>,
    gate: <>Testes dos fluxos e auditoria de segurança devem validar a base antes do uso real.</>,
  },
  {
    title: 'Tesouraria e controles',
    delivery: <>Separar <strong>50% em reserva defensiva</strong> e <strong>50% em parcela investível</strong>, com limites e registros. Vendas primárias não financiam despesas operacionais.</>,
    gate: <>Conciliação dos saldos, registros e controles de risco verificados antes de alocar recursos.</>,
  },
  {
    title: 'Pilotos dos agentes',
    delivery: <>Testar PREDIX, TRADEX, SPORTIX e BETTIX em pilotos supervisionados, sem pressupor integração ativa ou parceria com plataformas.</>,
    gate: <>Somente avançar com dados e integrações autorizados, acesso permitido e avaliação dos resultados e riscos.</>,
  },
  {
    title: 'Apuração e distribuição',
    delivery: <>Apurar resultados em <strong>USD</strong>, compensar perdas e calcular a participação pelo tempo dos BETTEX em staking. Quando houver lucro distribuível, atribuir a parcela em USDC; permitir transferência à carteira pessoal e, depois, saque para endereço na Arbitrum One.</>,
    gate: <>Conferir cálculos, elegibilidade, endereços, custos de rede e transferências em testes antes de disponibilizar o fluxo real.</>,
  },
  {
    title: 'Disponibilização gradual',
    delivery: <>Abrir o acesso em etapas, com monitoramento, suporte e mecanismo de <strong>pausa de emergência</strong>.</>,
    gate: <>Depende de validações técnicas, de segurança, jurídicas e externas; problemas podem adiar ou interromper a abertura.</>,
  },
] as const;

export function RoadmapSection() {
  return (
    <section className="roadmap" id="roadmap" aria-labelledby="roadmap-title">
      <div className="roadmap__wrap">
        <div className="roadmap__topline" aria-hidden="true">
          <span>BETTEX / DA REGRA À ENTREGA</span>
          <span>SEQUÊNCIA PROPOSTA · 06 ETAPAS</span>
        </div>
        <header className="roadmap__intro">
          <div>
            <p className="roadmap__eyebrow">Depois da documentação</p>
            <h2 id="roadmap-title">Roadmap da <span>BETTEX</span></h2>
            <p className="roadmap__lede">O que precisa ser construído — e o que precisa ser comprovado antes de seguir.</p>
          </div>
          <div className="roadmap__intro-note">
            <span>COMO LER</span>
            <p>Estas são etapas planejadas, não um registro de entregas concluídas. Cada avanço depende das verificações ao lado.</p>
          </div>
        </header>
        <div className="roadmap__board">
          <div className="roadmap__board-head" aria-hidden="true">
            <span className="roadmap__column-head">ETAPA</span>
            <span className="roadmap__column-head">ENTREGA PREVISTA</span>
            <span className="roadmap__column-head">CONDIÇÃO PARA AVANÇAR</span>
          </div>
          <ol className="roadmap__list">
            {steps.map((step, index) => (
              <li className="roadmap__step" key={step.title} data-testid={`roadmap-step-${index + 1}`}>
                <span className="roadmap__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div className="roadmap__delivery">
                  <span className="roadmap__step-label">ETAPA {String(index + 1).padStart(2, '0')} / ENTREGA PREVISTA</span>
                  <h3>{step.title}</h3>
                  <p>{step.delivery}</p>
                </div>
                <div className="roadmap__gate">
                  <span className="roadmap__step-label">CONDIÇÃO PARA AVANÇAR</span>
                  <p>{step.gate}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="roadmap__foot" aria-label="Condições e ressalvas do roadmap">
          <span className="roadmap__foot-label">NOTA DE ESCOPO / 001</span>
          <p>Esta sequência é uma <strong>proposta inicial, sem datas garantidas</strong>. Não há licença confirmada nem promessa de rendimento. O calendário de vendas contado em relação ao Gênesis descreve regras de emissão; <strong>não é um anúncio de lançamento</strong>.</p>
        </aside>
      </div>
    </section>
  );
}

export default RoadmapSection;