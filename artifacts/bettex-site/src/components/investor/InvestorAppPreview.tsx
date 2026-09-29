import { useState } from 'react';
import { ArrowRight, ChartNoAxesCombined, CircleHelp, Clock3, LayoutDashboard, ListFilter, ShieldAlert, Wallet, type LucideIcon } from 'lucide-react';
import { BettexMark } from '@/components/BettexMark';
import './InvestorAppPreview.css';

type Period = '24 horas' | '7 dias' | '30 dias';
type Agent = { name: string; area: string };

const periods: Period[] = ['24 horas', '7 dias', '30 dias'];
const agents: Agent[] = [
  { name: 'PREDIX', area: 'Previsões' },
  { name: 'TRADEX', area: 'Ações e cripto' },
  { name: 'SPORTIX', area: 'Esportes' },
  { name: 'BETTIX', area: 'Cassino' },
];

function RailItem({ icon: Icon, children, active = false }: { icon: LucideIcon; children: string; active?: boolean }) {
  return <div className={`investor-preview__rail-item${active ? ' investor-preview__rail-item--active' : ''}`}><Icon aria-hidden="true" />{children}</div>;
}

export function InvestorAppPreview() {
  const [period, setPeriod] = useState<Period>('7 dias');
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <section id="visao-investidor" className="investor-preview" aria-labelledby="investor-preview-title" data-testid="section-visao-investidor">
      <div className="investor-preview__wrap">
        <div className="investor-preview__intro">
          <div>
            <p className="investor-preview__eyebrow">Por dentro da participação</p>
            <h2 id="investor-preview-title" className="investor-preview__title">Tudo em um só lugar.<br /><em>Sem perder de vista o risco.</em></h2>
          </div>
          <p className="investor-preview__intro-text">Uma prévia de como o investidor pode entender seus tokens, acompanhar o projeto BETTEX e consultar a atividade de cada agente.</p>
        </div>

        <div className="investor-preview__window" aria-label="Prévia ilustrativa da área do investidor BETTEX">
          <div className="investor-preview__topbar">
            <div className="investor-preview__brand"><span className="investor-preview__brand-mark"><BettexMark /></span><span>BETTEX</span></div>
            <div className="investor-preview__topbar-right">
              <span className="investor-preview__topbar-note">Visão do investidor</span>
              <span className="investor-preview__badge" data-testid="status-previa-ilustrativa">Prévia ilustrativa</span>
            </div>
          </div>

          <div className="investor-preview__body">
            <aside className="investor-preview__rail" aria-label="Áreas representadas nesta prévia">
              <div>
                <p className="investor-preview__rail-heading">Seu espaço</p>
                <div className="investor-preview__rail-items">
                  <RailItem icon={LayoutDashboard} active>Visão geral</RailItem>
                  <RailItem icon={Wallet}>Carteiras</RailItem>
                  <RailItem icon={ChartNoAxesCombined}>Agentes</RailItem>
                  <RailItem icon={Clock3}>Histórico</RailItem>
                </div>
              </div>
              <p className="investor-preview__rail-foot">Uma participação no projeto. Quatro agentes para acompanhar.</p>
            </aside>

            <div className="investor-preview__content">
              <div className="investor-preview__header">
                <div>
                  <p className="investor-preview__micro">Visão geral</p>
                  <h3>Seu espaço na BETTEX</h3>
                  <p className="investor-preview__header-copy">Veja onde ficam seus tokens e como a participação é ativada.</p>
                </div>
                <span className="investor-preview__section-index">01 / 03</span>
              </div>

              <div className="investor-preview__wallet-flow" aria-label="Da carteira pessoal para a Carteira BETTEX">
                <div className="investor-preview__wallet">
                  <div className="investor-preview__wallet-label"><Wallet aria-hidden="true" />Sua carteira pessoal</div>
                  <strong className="investor-preview__wallet-value" data-testid="text-saldo-carteira-pessoal">Saldo não exibido</strong>
                  <span className="investor-preview__wallet-caption">Seus tokens permanecem seus.</span>
                </div>
                <div className="investor-preview__flow-action">
                  <span className="investor-preview__flow-line" aria-hidden="true"><ArrowRight /></span>
                  <button
                    type="button"
                    className="investor-preview__explain-button"
                    aria-expanded={showExplanation}
                    aria-controls="investor-preview-explanation"
                    onClick={() => setShowExplanation((value) => !value)}
                    data-testid="button-entender-ativacao"
                  >
                    {showExplanation ? 'Fechar explicação' : 'Ver como transferir'}
                  </button>
                  <span className="investor-preview__flow-hint">Transferir para participar</span>
                </div>
                <div className="investor-preview__wallet investor-preview__wallet--bettex">
                  <div className="investor-preview__wallet-label"><Wallet aria-hidden="true" />Carteira BETTEX</div>
                  <strong className="investor-preview__wallet-value" data-testid="text-saldo-carteira-bettex">Saldo não exibido</strong>
                  <span className="investor-preview__wallet-caption">Tokens aqui ficam ativados para a distribuição.</span>
                </div>
              </div>
              {showExplanation && (
                <div id="investor-preview-explanation" className="investor-preview__explanation" role="status" data-testid="status-explicacao-ativacao">
                  <CircleHelp aria-hidden="true" />
                  <p><strong>Como funciona:</strong> no sistema do investidor, a transferência da sua carteira pessoal para a Carteira BETTEX ativa os tokens para participar. Este botão só explica o caminho. Nenhuma transferência é feita nesta página.</p>
                </div>
              )}

              <div className="investor-preview__workspace">
                <div className="investor-preview__panel">
                  <div className="investor-preview__panel-head">
                    <div>
                      <p className="investor-preview__micro">Desempenho individual</p>
                      <h4>Desempenho de {selectedAgent.name}</h4>
                      <p className="investor-preview__panel-help">Selecione um agente e um período para consultar os resultados agregados.</p>
                    </div>
                    <span className="investor-preview__panel-icon"><ChartNoAxesCombined aria-hidden="true" /></span>
                  </div>
                  <div className="investor-preview__filters" role="group" aria-label={`Período do desempenho de ${selectedAgent.name}`}>
                    {periods.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="investor-preview__filter"
                        aria-pressed={period === item}
                        onClick={() => setPeriod(item)}
                        data-testid={`button-desempenho-${item.replace(' ', '-')}`}
                      >{item}</button>
                    ))}
                  </div>
                  <div className="investor-preview__chart" data-testid="panel-desempenho-sem-dados">
                    <span className="investor-preview__empty-mark"><ListFilter aria-hidden="true" /></span>
                    <strong>Sem dados de desempenho nesta prévia</strong>
                    <p>O desempenho de {selectedAgent.name} apareceria aqui no período escolhido.</p>
                    <span className="investor-preview__chart-period" aria-live="polite" data-testid="text-periodo-desempenho">{selectedAgent.name} · {period}. O histórico de transações abaixo exibe somente 7 dias.</span>
                  </div>
                  <div className="investor-preview__policy">
                    <ShieldAlert aria-hidden="true" />
                    <p><strong>Distribuição diária:</strong> o resultado do projeto é calculado conforme as políticas de investimento. Só há distribuição nos dias de lucro para tokens ativados. Perdas são possíveis.</p>
                  </div>
                </div>

                <div className="investor-preview__panel investor-preview__agents-panel">
                  <div className="investor-preview__panel-head">
                    <div>
                      <p className="investor-preview__micro">Quatro agentes, um projeto</p>
                      <h4>Atividade por agente</h4>
                      <p className="investor-preview__panel-help">Escolha um agente para ver seu espaço de lucro e transações.</p>
                    </div>
                  </div>
                  <div className="investor-preview__agent-list" role="group" aria-label="Escolher agente">
                    {agents.map((agent, index) => (
                      <button
                        key={agent.name}
                        type="button"
                        className="investor-preview__agent"
                        aria-pressed={selectedAgent.name === agent.name}
                        onClick={() => setSelectedAgent(agent)}
                        data-testid={`button-agente-${agent.name.toLowerCase()}`}
                      >
                        <span className="investor-preview__agent-index">0{index + 1}</span>
                        <span className="investor-preview__agent-name">{agent.name}</span>
                        <span className="investor-preview__agent-area">{agent.area}</span>
                        <ArrowRight aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  <div className="investor-preview__agent-detail" aria-live="polite" data-testid="panel-detalhe-agente">
                    <div className="investor-preview__agent-detail-top">
                      <strong>{selectedAgent.name}</strong>
                      <span>{selectedAgent.area}</span>
                    </div>
                    <div className="investor-preview__detail-row"><span>Lucro do agente</span><strong>Sem dados nesta prévia</strong></div>
                    <div className="investor-preview__detail-row"><span>Transações</span><strong>Ver histórico abaixo</strong></div>
                    <p>Esta área mostra o trabalho do agente, não uma participação separada.</p>
                  </div>
                </div>
              </div>

              <div className="investor-preview__panel investor-preview__history" aria-label={`Histórico de transações de ${selectedAgent.name} nos últimos 7 dias`}>
                <div className="investor-preview__history-header">
                  <div>
                    <p className="investor-preview__micro">Janela de transações</p>
                    <h4>Histórico de {selectedAgent.name}</h4>
                  </div>
                  <span className="investor-preview__history-limit">Últimos 7 dias</span>
                </div>
                <div className="investor-preview__history-columns" aria-hidden="true"><span>Data</span><span>Movimento</span><span>Agente</span><span>Resultado</span></div>
                <div className="investor-preview__history-empty" data-testid="panel-historico-sem-transacoes">
                  <span className="investor-preview__empty-mark"><Clock3 aria-hidden="true" /></span>
                  <div><strong>Sem transações nesta prévia</strong><p>Os movimentos de {selectedAgent.name} dos últimos 7 dias apareceriam aqui. Este histórico não muda com o filtro de desempenho.</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="investor-preview__bottom">
            <ShieldAlert aria-hidden="true" />
            <p><strong>Esta tela é apenas ilustrativa.</strong> Não mostra saldos, lucros ou operações reais e não permite transferir tokens. Os tokens continuam de propriedade do titular, mas podem perder valor. Resultados não são garantidos.</p>
          </div>
        </div>
      </div>
    </section>
  );
}