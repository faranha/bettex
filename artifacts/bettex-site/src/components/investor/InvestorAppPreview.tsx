import { useRef, useState } from 'react';
import { ArrowRight, ChartNoAxesCombined, Clock3, LayoutDashboard, ShieldAlert, Wallet, type LucideIcon } from 'lucide-react';
import { BettexMark } from '@/components/BettexMark';
import { AgentMark, type AgentKind } from '@/components/hero/AgentMark';
import { WalletDemoPreview } from './WalletDemoPreview';
import { PerformanceBars } from './PerformanceBars';
import { performanceTotal, type PerformancePeriod, type PerformanceSubject } from './performanceSeries';
import { historyForPeriod, simulatedDate, type AgentName } from './simulatedHistory';
import './InvestorAppPreview.css';

type Agent = { name: AgentName; area: string; kind: AgentKind };

const periods: PerformancePeriod[] = ['24 horas', '7 dias', '30 dias'];
const agents: Agent[] = [
  { name: 'PREDIX', area: 'Previsões', kind: 'predix' },
  { name: 'TRADEX', area: 'Ações e cripto', kind: 'tradex' },
  { name: 'SPORTIX', area: 'Esportes', kind: 'sportix' },
  { name: 'BETTIX', area: 'Cassino', kind: 'bettix' },
];
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatResult = (value: number) => `${value >= 0 ? '+' : '−'}${currency.format(Math.abs(value))}`;

function RailItem({ icon: Icon, children, active = false }: { icon: LucideIcon; children: string; active?: boolean }) {
  return <div className={`investor-preview__rail-item${active ? ' investor-preview__rail-item--active' : ''}`}><Icon aria-hidden="true" />{children}</div>;
}

export function InvestorAppPreview() {
  const [period, setPeriod] = useState<PerformancePeriod>('7 dias');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0]);
  const [topbarActionsEl, setTopbarActionsEl] = useState<HTMLDivElement | null>(null);
  const performancePanelRef = useRef<HTMLDivElement>(null);
  const subject: PerformanceSubject = selectedAgent?.name ?? 'COLETIVO';
  const agentResult = performanceTotal(subject, period);
  const totalResult = performanceTotal('COLETIVO', period);
  const historyResult = performanceTotal(subject, period);
  const historyRows = (selectedAgent ? [selectedAgent] : agents)
    .flatMap((agent) => historyForPeriod(agent.name, period).map((entry) => ({
      ...entry,
      agentName: agent.name,
      key: `${agent.name}-${entry.id}`,
    })))
    .sort((a, b) => a.daysAgo - b.daysAgo || a.hoursAgo - b.hoursAgo);
  const historyLimit = period === '24 horas' ? 2 : period === '7 dias' ? 4 : 10;
  const visibleHistoryRows = selectedAgent ? historyRows : historyRows.slice(0, historyLimit);

  function showPerformance(agent: Agent | null) {
    setSelectedAgent(agent);
    if (window.matchMedia('(max-width: 740px)').matches) {
      window.requestAnimationFrame(() => performancePanelRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      }));
    }
  }

  return (
    <section id="visao-investidor" className="investor-preview" aria-labelledby="investor-preview-title" data-testid="section-visao-investidor">
      <div className="investor-preview__wrap">
        <div className="investor-preview__intro">
          <div>
            <p className="investor-preview__eyebrow">Por dentro da participação</p>
            <h2 id="investor-preview-title" className="investor-preview__title">Conheça o <em>APP da BETTEX</em></h2>
          </div>
          <p className="investor-preview__intro-text">Uma prévia de como o investidor pode entender seus tokens, acompanhar o projeto BETTEX e consultar a atividade de cada agente.</p>
        </div>

        <div className="investor-preview__window" aria-label="Prévia ilustrativa da área do investidor BETTEX">
          <div className="investor-preview__topbar">
            <div className="investor-preview__brand"><span className="investor-preview__brand-mark"><BettexMark /></span><span>BETTEX</span></div>
            <div className="investor-preview__topbar-right">
              <div ref={setTopbarActionsEl} className="investor-preview__topbar-actions" aria-label="Ações da carteira pessoal" />
              <span className="investor-preview__viewer"><strong>João da Silva</strong><small>Investidor fictício</small></span>
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
                  <p className="investor-preview__header-copy">Veja seus saldos em reais e BETTEX e simule a movimentação dos tokens.</p>
                </div>
                <span className="investor-preview__section-index">01 / 03</span>
              </div>

              <WalletDemoPreview topbarActionsEl={topbarActionsEl} />

              <div className="investor-preview__workspace">
                <div className="investor-preview__panel investor-preview__performance-panel" id="investor-preview-performance" ref={performancePanelRef}>
                  <div className="investor-preview__panel-head">
                    <div>
                      <p className="investor-preview__micro">Desempenho {selectedAgent ? 'individual' : 'coletivo'}</p>
                      <h4>Desempenho {selectedAgent ? `de ${selectedAgent.name}` : 'dos agentes'}</h4>
                      <p className="investor-preview__panel-help">{selectedAgent ? 'Selecione um agente e um período para consultar os resultados agregados.' : 'Veja a soma dos quatro agentes no período selecionado.'}</p>
                    </div>
                    <span className="investor-preview__panel-icon"><ChartNoAxesCombined aria-hidden="true" /></span>
                  </div>
                  <div className="investor-preview__filters" role="group" aria-label={`Período do desempenho ${selectedAgent ? `de ${selectedAgent.name}` : 'coletivo'}`}>
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
                  <div className="investor-preview__chart" data-testid="panel-desempenho-simulado">
                    <span className="investor-preview__sample-label">Resultado ilustrativo · {selectedAgent?.name ?? 'quatro agentes'}</span>
                    <strong className="investor-preview__sample-result" data-negative={agentResult < 0} aria-live="polite">{formatResult(agentResult)}</strong>
                    <PerformanceBars subject={subject} period={period} />
                      <span className="investor-preview__chart-period" aria-live="polite" data-testid="text-periodo-desempenho">{selectedAgent?.name ?? 'Quatro agentes'} · {period}. O histórico abaixo acompanha o período selecionado.</span>
                  </div>
                  <div className="investor-preview__policy">
                    <ShieldAlert aria-hidden="true" />
                    <p><strong>Distribuição diária:</strong> o resultado do projeto é calculado conforme as políticas de investimento. Nos dias de lucro, o valor distribuído é dividido proporcionalmente aos BETTEX ativos de cada investidor. Perdas são possíveis.</p>
                  </div>
                </div>

                <div className="investor-preview__panel investor-preview__agents-panel">
                  <div className="investor-preview__panel-head">
                    <div>
                      <p className="investor-preview__micro">Quatro agentes, um projeto</p>
                      <h4>Atividade por agente</h4>
                      <p className="investor-preview__panel-help">Escolha um agente ou o desempenho coletivo para ver resultados e transações.</p>
                    </div>
                  </div>
                  <div className="investor-preview__agent-list" role="group" aria-label="Escolher agente">
                    {agents.map((agent, index) => (
                      <button
                        key={agent.name}
                        type="button"
                        className="investor-preview__agent"
                        aria-pressed={selectedAgent?.name === agent.name}
                        onClick={() => showPerformance(agent)}
                        data-testid={`button-agente-${agent.name.toLowerCase()}`}
                      >
                        <span className="investor-preview__agent-index">0{index + 1}</span>
                        <span className="investor-preview__agent-mark" data-kind={agent.kind}><AgentMark kind={agent.kind} /></span>
                        <span className="investor-preview__agent-name">{agent.name}</span>
                        <span className="investor-preview__agent-area">{agent.area}</span>
                        <ArrowRight aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  <button type="button" className="investor-preview__total" aria-pressed={!selectedAgent} aria-controls="investor-preview-performance" onClick={() => showPerformance(null)} data-testid="resultado-total-agentes">
                    <span>Resultado total · {period}</span>
                    <strong data-negative={totalResult < 0}>{formatResult(totalResult)}</strong>
                    <small>Soma dos quatro resultados simulados.</small>
                    <span className="investor-preview__total-link">Ver desempenho coletivo <ArrowRight aria-hidden="true" /></span>
                  </button>
                  <details className="investor-preview__agent-detail" data-testid="panel-resultados-por-agente">
                    <summary className="investor-preview__agent-detail-top">
                      <strong>Resultado por agente</strong>
                      <span>{period} · abrir</span>
                    </summary>
                    {agents.map((agent) => {
                      const result = performanceTotal(agent.name, period);
                      return (
                        <div className="investor-preview__detail-row" key={agent.name}>
                          <span className="investor-preview__detail-agent"><span className="investor-preview__detail-mark"><AgentMark kind={agent.kind} /></span>{agent.name}</span>
                          <strong data-negative={result < 0}>{formatResult(result)}</strong>
                        </div>
                      );
                    })}
                    <p>Valores simulados. Selecione um agente ou o resultado total para atualizar o gráfico e o histórico abaixo.</p>
                  </details>
                </div>
              </div>

              <div className="investor-preview__panel investor-preview__history" role="region" aria-label={`Histórico simulado ${selectedAgent ? `de ${selectedAgent.name}` : 'dos quatro agentes'} · ${period}`}>
                <div className="investor-preview__history-header">
                  <div>
                    <p className="investor-preview__micro">Janela de transações · simulação</p>
                    <h4>Histórico simulado {selectedAgent ? `de ${selectedAgent.name}` : 'dos agentes'}</h4>
                  </div>
                  <span className="investor-preview__history-limit">{period}</span>
                </div>
                <div className="investor-preview__history-columns" aria-hidden="true"><span>Data</span><span>Movimento</span><span>Agente</span><span>Resultado</span></div>
                <div className="investor-preview__history-rows" role="list" aria-live="polite" tabIndex={0} aria-label="Lista rolável de trades fictícios" data-testid="panel-historico-simulado">
                  {visibleHistoryRows.map((entry) => {
                    const date = simulatedDate(entry.daysAgo);
                    return (
                      <div className="investor-preview__history-row" role="listitem" key={entry.key}>
                        <time dateTime={date.dateTime}>{date.label}</time>
                        <span className="investor-preview__history-movement">{entry.movement}</span>
                        <span className="investor-preview__history-agent">{entry.agentName}</span>
                        <strong className="investor-preview__history-amount" data-negative={entry.resultCents < 0}>{formatResult(entry.resultCents / 100)}</strong>
                      </div>
                    );
                  })}
                </div>
                <p className="investor-preview__history-disclaimer">Mostrando {visibleHistoryRows.length} de {historyRows.length} trades fictícios.{visibleHistoryRows.length < historyRows.length ? ' O total do período inclui também os trades não listados.' : ''}</p>
                <div className="investor-preview__history-summary"><span>Total ilustrativo · {period}</span><strong data-negative={historyResult < 0}>{formatResult(historyResult)}</strong></div>
                <p className="investor-preview__history-disclaimer">Operações e datas fictícias; não refletem mercados ou transações reais.</p>
              </div>
            </div>
          </div>

          <div className="investor-preview__bottom">
            <ShieldAlert aria-hidden="true" />
            <p><strong>Esta tela é apenas ilustrativa.</strong> Saldos, resultados e movimentações são exemplos fictícios. As transferências funcionam apenas nesta demonstração local, sem mover ativos ou reais. Os tokens podem perder valor; resultados não são garantidos.</p>
          </div>
        </div>
      </div>
    </section>
  );
}