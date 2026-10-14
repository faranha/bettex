import { Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Children } from 'react';
import thesis from '@/lib/new-economy-thesis.json';
import growthStrategy from '@/lib/growth-strategy.json';
import { DocumentationGames } from './DocumentationGames';
import { DocumentationOwnedContent } from './DocumentationOwnedContent';
import { documentationChapters } from '@/lib/documentation-structure';
import { DocumentationAppIntroduction } from './DocumentationAppIntroduction';
import { DocumentationChapterIntroduction } from './DocumentationChapterIntroduction';
import { DocumentationAppWalkthrough } from './DocumentationAppWalkthrough';
import { LegalCompliance } from './LegalCompliance';
import { TechnicalDetails } from './TechnicalDetails';
import { documentationTokenomics as tokenomics, formatTokenCount } from '@/lib/tokenomics';
import { BettexFlow, architectureFigureTitles } from '@/components/architecture/BettexArchitecture';
import type { ArchitectureFigureNumber } from '@/components/architecture/ArchitectureIntegrations';
import { ArbitrumFlowDiagram } from '@/components/docs-diagrams/ArbitrumFlowDiagram';
import { RobinhoodFlowDiagram } from '@/components/docs-diagrams/RobinhoodFlowDiagram';
import { VestingSchedule } from '@/components/VestingSchedule';
import { ServiceFees } from '@/components/ServiceFees';
import { InvestmentAgents } from '@/components/InvestmentAgents';
import { AgentIntelligence } from '@/components/AgentIntelligence';
import { intelligenceCopy } from '@/lib/documentation-intelligence';
import { StakingDistribution } from '@/components/StakingDistribution';
import { ProfitAccounting } from '@/components/ProfitAccounting';
import { DistributionCorrections } from '@/components/DistributionCorrections';
import { DistributionSettlement } from '@/components/DistributionSettlement';
import { ReservePolicy } from '@/components/ReservePolicy';
import { InvestmentRiskBase } from '@/components/InvestmentRiskBase';
import { OrderReservations } from '@/components/OrderReservations';
import { OrderReconciliation } from '@/components/OrderReconciliation';
import { DailyCommitments } from '@/components/DailyCommitments';
import { DailyRealizedLosses } from '@/components/DailyRealizedLosses';
import { FinancialEventTiming } from '@/components/FinancialEventTiming';
import { RiskRuleTransitions } from '@/components/RiskRuleTransitions';
import { CoordinatedProposals } from '@/components/CoordinatedProposals';
import { AuthorizedOperationCosts } from '@/components/AuthorizedOperationCosts';
import { QuoteValidity } from '@/components/QuoteValidity';
import { ExecutionConditions } from '@/components/ExecutionConditions';
import { CoordinatedContinuation } from '@/components/CoordinatedContinuation';
import { RiskReducingClosures } from '@/components/RiskReducingClosures';
import { RiskStateRecovery } from '@/components/RiskStateRecovery';
import { RiskPrecision } from '@/components/RiskPrecision';
import { AuthorizedRequestIntegrity } from '@/components/AuthorizedRequestIntegrity';
import { OutOfOrderResponses } from '@/components/OutOfOrderResponses';
import { TreasuryFundsInTransit } from '@/components/TreasuryFundsInTransit';
import { TokenHolderRights } from '@/components/TokenHolderRights';
import { SaleChannels } from '@/components/SaleChannels';
import { DocFacts } from '@/components/DocFacts';
import { EntityOrganisation } from '@/components/EntityOrganisation';
import { DocumentationGovernance } from '@/components/DocumentationGovernance';
import { ArchitectureCatalogue } from '@/components/architecture/ArchitectureCatalogue';
import { BuybackPolicy } from '@/components/BuybackPolicy';
import { TokenAllocationSchematic } from '@/components/docs-diagrams/DocSchematics';
import { DocImage, DocTerms, Dot } from '@/components/DocImage';
import { FundSecurity } from '@/components/FundSecurity';
import { t } from '@/lib/i18n';
import { copy as c } from '@/lib/documentation-copy';
import { roadmapStops } from '@/components/RoadmapSection';
import { DemoAppLink } from '@/components/DemoAppLink';
import { DocumentationConsistency } from './DocumentationConsistency';
import { defaultTopicOf, groupTopics, type TopicInfo } from './ReadingDisclosure';

/** Previous 14-chapter list, retained as source history and for reference bodies. */
const legacyChapters = [
  { id: 'documentacao-como-funciona', title: 'Visão do projeto', subtitle: 'O agente BETTEX, a operação em USDC, participação automática e controles.' },
  { id: 'documentacao-entidade', title: 'DeFi e autonomia', subtitle: 'Protocolo DeFi e DEX, administração inicial e evolução para IA autônoma.' },
  { id: 'documentacao-adequacao-legal', title: 'Adequação legal e jurídica', subtitle: 'Investigação técnico-legal, disponibilidade territorial e condições para liberar cada agente.' },
  { id: 'documentacao-rede', title: 'Starknet, Arbitrum e ativos', subtitle: 'Redes em avaliação, carteira do titular, USDC e entrada por on-ramp externo.' },
  { id: 'documentacao-acesso', title: 'Acesso ao aplicativo', subtitle: 'Carteira gerada com a conta, acesso e autorização de ações financeiras.' },
  { id: 'documentacao-arquitetura', title: 'Arquitetura e integrações', subtitle: 'Mapa orquestrado, catálogo de conectores, consultas verificadas e demonstrações por plataforma.' },
  { id: 'documentacao-agentes', title: 'Agentes de IA', subtitle: 'Orquestradora, trading, tesouraria, risco, recompra e queima, governança e decisões.' },
  { id: 'documentacao-emissao', title: 'Token e emissão', subtitle: 'Mint inicial de 10%, comunidade 55%, fundador/equipe 20%, investidores 15% e vesting de 24 meses.' },
  { id: 'documentacao-servicos', title: 'Custos de rede', subtitle: 'Sem taxas de serviço; custos externos da rede não são receita da comunidade.' },
  { id: 'documentacao-staking', title: 'Staking e distribuição de resultados', subtitle: 'Participação automática, quantidade e tempo, rateio, liquidação e encerramento.' },
  { id: 'documentacao-controles', title: 'Controles de risco', subtitle: 'Limites globais e por mercado, autorizações e pausas de segurança.' },
  { id: 'documentacao-implantacao', title: 'Requisitos operacionais e de segurança', subtitle: 'Controles técnicos, validações e salvaguardas para operar o modelo.' },
  { id: 'documentacao-riscos', title: 'Riscos e validações', subtitle: 'Exposições dos mercados, do agente e decisões técnicas, operacionais e jurídicas.' },
  { id: 'documentacao-governanca', title: 'Governança', subtitle: 'Políticas evolutivas, carteiras, custódia, mandatos, recompra e queima definitiva.' },
] as const;

export const chapters = documentationChapters;
export const legacyChapterTitles: ReadonlyMap<string, string> = new Map(legacyChapters.map(ch => [ch.id, ch.title]));

function Prose({ children }: { children: ReactNode }) {
  return <div className="whitepaper__prose">{Array.isArray(children)
    ? children.map((item, index) => <p key={index}>{item}</p>)
    : <p>{children}</p>}</div>;
}
function Head({ id, children }: { id?: string; children: ReactNode }) {
  return <h3 className="whitepaper__subhead" id={id}>{children}</h3>;
}

/** Moved technical material: kept collapsed, with the old destination ids retained as headings. */
function Reference({ id, label, parts }: { id: string; label: string; parts: { id?: string; title?: string }[] }) {
  const nodes: ReactNode[] = [];
  parts.forEach(part => {
    const body = LegacyBody({ id: part.id ?? '' });
    if (part.title) nodes.push(<h3 key={'h' + part.id} className="whitepaper__subhead" id={part.id}>{part.title}</h3>);
    const kids = isValidElement(body) && body.type === Fragment ? Children.toArray((body as ReactElement<{ children: ReactNode }>).props.children) : Children.toArray(body);
    kids.forEach(k => nodes.push(k));
  });
  return <details className="whitepaper__reference" id={id} data-documentation-reference>
    <summary>{c.refTec}: {label}</summary>
    <div className="whitepaper__reference-body">{groupTopics(nodes, titleOf)}</div>
  </details>;
}

function MainBody({ id }: { id: string }) {
  switch (id) {
    case 'documentacao-agentes':
      return <>
        <></>
        <div className="whitepaper__lead"><p>{c.agP1}</p></div>
        <Prose>{[c.agP2, c.agP3]}</Prose>
        <DocFacts title={c.agFacts} facts={[
          { label: c.agF1, value: c.agF1v, text: c.agF1t },
          { label: c.agF2, value: c.agF2v, text: c.agF2t },
          { label: c.agF3, value: c.agF3v, text: c.agF3t },
        ]} />
        <Prose>{[c.agP4, c.agP5]}</Prose>
        <AgentIntelligence />
        <Reference id="documentacao-referencia-agentes" label={c.refAg} parts={[
          { id: 'documentacao-rede', title: 'Starknet, Arbitrum e ativos' }, { id: 'documentacao-acesso', title: 'Acesso ao aplicativo' },
          { id: 'documentacao-arquitetura', title: 'Arquitetura e integrações' }, { id: 'documentacao-agentes-detalhe', title: 'Agentes de IA' },
        ]} />
      </>;
    case 'documentacao-emissao':
      return <>
        <Head id="documentacao-direitos-token">{c.tk1}</Head><Prose>{c.tk1p}</Prose>
        <Head id="documentacao-oferta">{c.tk2}</Head><Prose>{c.tk2p}</Prose>
        <TokenAllocationSchematic />
        <Head id="documentacao-financiamento">{c.tk3}</Head><Prose>{c.tk3p}</Prose>
        <Head id="documentacao-vesting-resumo">{c.tk4}</Head><Prose>{c.tk4p}</Prose>
        <VestingSchedule />
        <Head id="documentacao-tesouraria-manutencao">{c.tk5}</Head><Prose>{c.tk5p}</Prose>
        <Head id="documentacao-resultados">{c.tk6}</Head><Prose>{c.tk6p}</Prose>
        <DocFacts title={c.tk6f} cols={3} tone="accent" facts={[
          { label: c.tk6l1, value: '50%', text: c.tk6a }, { label: c.tk6l2, value: '25%', text: c.tk6b }, { label: c.tk6l3, value: '25%', text: c.tk6c },
        ]} />
        <Head id="documentacao-recompra-queima">{c.tk7}</Head><Prose>{c.tk7p}</Prose>
        <Head id="documentacao-custos-servicos">{c.tk8}</Head><Prose>{c.tk8p}</Prose>
        <Reference id="documentacao-referencia-tokenomics" label={c.refTok} parts={[{ id: 'documentacao-emissao-detalhe' }, { id: 'documentacao-servicos' }]} />
      </>;
    case 'documentacao-staking':
      return <>
        <Head id="documentacao-participar">{c.pt1}</Head><Prose>{c.pt1p}</Prose>
        <BettexFlow figure="3" />
        <Head id="documentacao-entrada">{c.pt2}</Head><Prose>{c.pt2p}</Prose>
        <Head id="documentacao-calculo-pagamento">{c.pt3}</Head><Prose>{c.pt3p}</Prose>
        <StakingDistribution />
        <Head id="documentacao-saida">{c.pt4}</Head><Prose>{c.pt4p}</Prose>
        <Head id="documentacao-fracoes">{c.pt5}</Head><Prose>{c.pt5p}</Prose>
        <Head id="documentacao-exemplo">{c.pt6}</Head><Prose>{c.pt6p}</Prose>
        <DocumentationAppIntroduction />
        <Head id="documentacao-regras-demo">{c.pt7}</Head><Prose>{c.pt7p}</Prose>
        <></>
        <Reference id="documentacao-referencia-participacao" label={c.refPart} parts={[{ id: 'documentacao-staking-detalhe' }]} />
      </>;
    case 'documentacao-roadmap':
      return <>
        <></>
        <div className="whitepaper__lead"><p>{c.rmP}</p></div>
        <div className="whitepaper__status-grid" data-testid="documentation-roadmap-milestones">
          {roadmapStops.map((stop, i) => <div key={stop.title}><span>{String(i + 1).padStart(2, '0')} / {stop.tag}</span><strong>{stop.title}</strong><p>{stop.date}. {stop.description}</p>{i === 0 && <DemoAppLink>{t('Abrir o demo')}</DemoAppLink>}</div>)}
        </div>
      </>;
    case 'documentacao-riscos':
      return <>
        <></>
        <Head id="documentacao-governanca">{c.rk1}</Head><Prose>{[c.rk1p, c.rk1q]}</Prose>
        <Head id="documentacao-seguranca">{c.rk2}</Head><Prose>{c.rk2p}</Prose>
        <Head id="documentacao-riscos-materiais">{c.rk3}</Head><Prose>{c.rk3p}</Prose>
        <Head id="documentacao-adequacao">{c.rk4}</Head><Prose>{c.rk4p}</Prose>
        <Reference id="documentacao-referencia-riscos" label={c.refRisk} parts={[
          { id: 'documentacao-adequacao-legal', title: 'Adequação legal e jurídica' }, { id: 'documentacao-controles', title: 'Controles de risco' },
          { id: 'documentacao-implantacao', title: 'Requisitos operacionais e de segurança' }, { id: 'documentacao-riscos-detalhe' },
          { id: 'documentacao-governanca-detalhe', title: 'Governança, multisig e mandatos' },
        ]} />
      </>;
    default:
      return <>
        <></>
        <DocumentationAppWalkthrough />
        <div className="whitepaper__lead"><p>{c.visaoLead}</p><p>{c.visaoIndependencia}</p></div>
        <Head id="documentacao-linha-base">{intelligenceCopy.baselineTitle}</Head>
        <Prose>{intelligenceCopy.baseline}</Prose>
        <Head id="documentacao-agente-subagentes">{intelligenceCopy.agentDefinitionTitle}</Head>
        <Prose>{[intelligenceCopy.agentDefinition, intelligenceCopy.subagentDefinition]}</Prose>
        <DocTerms id="schematic-overview" label={c.visaoEsquema} items={[
          [c.vTes, c.vTesT], [c.vAg, c.vAgT], [c.vTok, c.vTokT], [c.vPar, c.vParT],
        ]} />
        <div className="whitepaper__aside-callout"><span>{c.visaoEstadoK}</span><p>{c.visaoEstado}</p></div>
        <></>
      </>;
  }
}

function Subhead({ children }: { children: ReactNode }) {
  return <h3 className="whitepaper__subhead">{children}</h3>;
}

function Flow({ label, steps }: { label: string; steps: string[] }) {
  return <div className="whitepaper__flow" role="group" aria-label={label}>
    <span>{label}</span>
    <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
  </div>;
}

function LegacyBody({ id }: { id: string }) {
  switch (id) {
    case 'documentacao-entidade':
      return <EntityOrganisation />;
    case 'documentacao-adequacao-legal':
      return <LegalCompliance />;
    case 'documentacao-governanca':
    case 'documentacao-governanca-detalhe':
      return <DocumentationGovernance includeBuyback={false} />;
    case 'documentacao-servicos':
      return <ServiceFees />;
    case 'documentacao-staking-detalhe':
      return <>
        <h3 className="whitepaper__subhead" id="documentacao-mecanismo-staking">Participação automática e elegibilidade</h3>
        <div className="whitepaper__prose"><p>A piscina é fechada e exige acesso ao aplicativo, mas não uma sessão continuamente aberta. Exportar chaves preserva autocustódia, não torna a piscina independente. Tokens não liberados e estoque institucional de venda não participam.</p></div>
        <ProfitAccounting />
        <DistributionSettlement />
        <DistributionCorrections />
        <DocumentationGames />
      </>;
    case 'documentacao-como-funciona':
      return <>
        <div className="whitepaper__lead"><span>COMUNIDADE ABERTA · TECNOLOGIA DEFI</span><p>{thesis.purpose}</p><p>BETTEX é o token da comunidade. A tecnologia reúne aplicativo e agentes de IA, com recursos comunitários na tesouraria e regras públicas. As carteiras pessoais pertencem aos seus titulares; o token não dá propriedade resgatável da tesouraria nem voto automático.</p><p>O fundador e o time organizam a administração inicial. Agentes de IA assumirão gradualmente funções até tornar o agente BETTEX operacionalmente independente e autônomo. A autonomia é um objetivo futuro, com mandatos e controles verificáveis, não uma capacidade já disponível.</p></div>
        <div className="whitepaper__prose"><p><a href="#documentacao-publico">Ler a tese e a oportunidade</a></p></div>
        <div className="whitepaper__status-grid">
          <div><span>01 / ECONOMIA DO TOKEN</span><strong>BETTEX e participação</strong><p>Um bilhão de tokens: 10% mint inicial, 55% comunidade, 20% fundador/equipe e 15% investidores. Os 90% posteriores seguem vesting de 24 meses. <a href="#documentacao-staking">Staking automático</a> por quantidade e tempo elegíveis.</p></div>
          <div><span>02 / OPERAÇÃO FINANCEIRA</span><strong>Tesouraria multimercado</strong><p>O mint inicial financia o projeto. As vendas da parcela de 55% da comunidade destinam o preço em USDC à tesouraria.</p><p>{growthStrategy.launch.angelFundingUse}</p><p>Reservas e parcela investível seguem as políticas aprovadas, com alocação dinâmica e controle de liquidez.</p></div>
          <div><span>03 / ARQUITETURA E CONTROLES</span><strong>Registros conciliados</strong><p>O modelo separa responsabilidades entre aplicativo, serviços, agente, conectores e operação, com registros auditáveis, autorizações explícitas e reconciliação de ativos e obrigações.</p></div>
        </div>
        <DocFacts title="Resumo do modelo" facts={[
          { label: 'OPERAÇÃO', value: 'USDC', text: 'Saldos, compras, distribuições e saques.' },
          { label: 'TOKEN', value: 'BETTEX', text: 'Participação no staking; resultados recebidos em USDC.' },
          { label: 'TESOURARIA', value: '50% / 25% / 25%', text: 'Split do lucro elegível: tesouraria, staking e carteira de recompra.' },
        ]} />
        <DocImage src="agents/bettex-intelligence-brain.webp" alt="Escultura realista de um cérebro sobre fundo escuro." caption="A IA BETTEX orquestra agentes de análise e execução." />
        <DocTerms id="schematic-cycle" label="Ciclo do investimento" items={[
          ['Carteira USDC', 'Compra BETTEX com USDC'],
          ['BETTEX na carteira', 'Participa automaticamente'],
          ['Tesouraria e agentes', 'Investem nos quatro mercados'],
          ['Lucro da própria rodada', 'Após custos conciliados, sujeito aos controles'],
          ['Crédito em USDC', 'Após transferência confirmada e conciliação'],
        ]} note="Agentes e apuração seguem as rodadas diárias UTC" />
        <BettexFlow figure="1" />
        <Subhead>Camadas do sistema</Subhead>
        <div className="whitepaper__prose">
          <p><strong>USDC é o ativo financeiro; BETTEX é o token de participação.</strong> A interface pode mostrar uma estimativa em moeda local, mas saldo, crédito e saque continuam em USDC. Entrada fiat ocorre por on-ramp externo, sem conta fiduciária ou off-ramp próprio da BETTEX.</p>
          <p><strong>Capital e recursos operacionais são separados.</strong> O mint inicial financia o projeto; o preço dos tokens da comunidade liberados no vesting vai à tesouraria. No ALFA, apenas <a href="#documentacao-taxas">custos de rede</a>; o custeio de manutenção permanece em aberto. Os tokens não são capital das estratégias. Todo BETTEX adquirido na <a href="#documentacao-recompras">recompra</a> é queimado permanentemente.</p>
          <p><strong>Aplicativo e carteiras → API e livro contábil → tesouraria → agentes e conectores.</strong> As análises comparam probabilidades, preços, liquidez, custos e risco. Operações automáticas respeitam mandatos e controles independentes; mudanças de política exigem aprovação humana. Os quatro mercados são o escopo do projeto, não a obrigação de investir em todos ou a confirmação de conectores ativos.</p>
        </div>
        <div className="whitepaper__aside-callout"><span>QUANDO HÁ DISTRIBUIÇÃO</span><p>O split usa o lucro líquido realizado e conciliado, após custos conciliados, com reservas, liquidez e elegibilidade atendidas: 50% tesouraria, 25% staking e 25% carteira de recompra. Perdas são permanentes, sem déficit a compensar em rodadas futuras.</p><p><a href="#documentacao-entrada-proxima-rodada">Quem entra durante a rodada espera a próxima e não recebe nenhum lucro da rodada atual.</a></p><p>Qualquer saída de BETTEX, mesmo parcial, cancela todos os créditos anteriores ainda não pagos do ciclo e zera o peso acumulado. Autorizar o direito e confirmar o recebimento em USDC são etapas distintas.</p></div>
      </>;
    case 'documentacao-rede':
      return <>
        <DocFacts title="Rede e ativos em resumo" facts={[
          { label: 'REDES EM AVALIAÇÃO', value: 'Starknet / Arbitrum One', text: 'Alternativas de segunda camada do Ethereum; escolha de lançamento em aberto.' },
          { label: 'SALDO FINANCEIRO', value: 'USDC', text: 'Compras, distribuições e saques em USDC.' },
          { label: 'PARTICIPAÇÃO', value: 'BETTEX', text: 'Staking por saldo elegível na abertura; pagamento em USDC.' },
        ]} />
        <Subhead>Escolha da rede e captação de grants</Subhead>
        <div className="whitepaper__prose">
          <p>A BETTEX está em fase de planejamento e captação de grants. Starknet e Arbitrum One são alternativas em avaliação, sem rede de lançamento definida. A presença das marcas na área de parceiros não comprova grant aprovado, parceria contratual ou integração operacional.</p>
          <p>A escolha depende de custos, segurança, disponibilidade de USDC, liquidez em DEX, carteiras, auditoria e suporte do ecossistema. Não há compromisso de operar nas duas redes ao mesmo tempo. Grants apoiam o desenvolvimento e não são lucro de trading nem entram na distribuição aos participantes.</p>
        </div>
        <Subhead>Starknet: provas de validade e contas nativas</Subhead>
        <div className="whitepaper__prose">
          <p><strong>A Starknet</strong>{' '}é uma rede de segunda camada do Ethereum que utiliza provas de validade STARK. Seus contratos são desenvolvidos em Cairo e as contas possuem abstração nativa. A alternativa exige implementação, carteiras e testes próprios; contratos Solidity e endereços EVM não são transferidos automaticamente.</p>
          <p>Na Starknet, o percurso previsto é: assinatura pela conta compatível → execução na segunda camada → geração da prova de validade → verificação e liquidação no Ethereum. O aplicativo deverá acompanhar eventos confirmados, conciliar USDC e BETTEX separadamente e validar a disponibilidade dos ativos na rede escolhida.</p>
          <p>Referências oficiais: <a href="https://docs.starknet.io/" target="_blank" rel="noopener noreferrer">documentação da Starknet</a> · <a href="https://www.starknet.io/grants/" target="_blank" rel="noopener noreferrer">programas de grants da Starknet</a>.</p>
        </div>
        <Subhead>Arbitrum One: contratos EVM e rollup otimista</Subhead>
        <div className="whitepaper__prose">
          <p><strong>A Arbitrum One</strong>{' '}é uma rede de segunda camada do Ethereum. Ela amplia a capacidade de processamento e reduz os custos das transações em relação à rede principal, oferecendo uma infraestrutura para contratos inteligentes, tokens e carteiras.</p>
          <p>Utiliza <strong>optimistic rollups</strong>: executa transações na segunda camada e publica os dados em lotes no Ethereum. A compatibilidade com contratos e carteiras desse ecossistema permite emissão e transferências de BETTEX; o backend acompanha confirmações e concilia os eventos com os registros da conta. As chaves e os dados da carteira do titular são exportáveis.</p>
          <p>Conheça a tecnologia: <a href="https://docs.arbitrum.io/" target="_blank" rel="noopener noreferrer">documentação oficial da Arbitrum</a>.</p>
        </div>
        <ArbitrumFlowDiagram />
        <div className="whitepaper__lead" id="documentacao-operacao-usdc"><span>OPERAÇÃO EM USDC · VISÃO DE VALOR LOCAL</span><p>Os saldos financeiros, depósitos, saques e distribuições da pessoa são denominados e movimentados em <strong>USDC</strong>. A interface mostra uma <strong>estimativa desse valor na moeda fiduciária da pessoa</strong> para facilitar a leitura. O saque continua em USDC, com referência em dólar: a estimativa não é saldo fiduciário nem valor a receber em moeda local. A entrada com fiat ocorre por provedores externos de on-ramp. Distribuições exigem lucro elegível ao split, considerando posições abertas, conciliação e reservas atendidas.</p></div>
        <div className="whitepaper__currency-grid">
          <div><span>01 / SALDO E VISÃO DE VALOR</span><strong>USDC</strong><p>Saldo efetivo em USDC, com valor estimado na moeda fiduciária da pessoa na interface. A estimativa não altera o ativo nem a moeda do saque.</p></div>
          <div><span>02 / ENTRADA COM FIAT</span><strong>On-ramp externo</strong><p>O provedor converte a moeda da pessoa em USDC, com sua cotação e seus custos. A BETTEX credita somente o valor líquido recebido e confirmado.</p></div>
          <div><span>03 / SAÍDA DA PLATAFORMA</span><strong>Saques em USDC</strong><p>Transferência cripto para uma carteira compatível, com custos e valor líquido informados. Não há venda de USDC nem pagamento em moeda local pela BETTEX.</p></div>
        </div>
        <BettexFlow figure="2" />
        <Subhead>O que cada ativo representa</Subhead>
        <div className="whitepaper__prose"><p><strong>BETTEX</strong> é o token de participação no staking. Os tokens pertencem ao titular; enviá-los a outra carteira não significa vendê-los ou sacar USDC. <strong>USDC</strong> é o ativo dos saldos financeiros, movimentações e créditos de distribuição. Os ativos têm registros separados.</p><p>Os serviços devem validar contrato, rede, origem, destino e confirmações antes de reconhecer um depósito ou concluir um saque. O fluxo exige rede e versão compatíveis de USDC; um comprovante fiat do on-ramp não substitui a confirmação do recebimento. Divergências mantêm o movimento pendente até conciliação.</p></div>
        <DocImage src="technology/token-acesso.png" alt="Ilustração tridimensional de um token de acesso." caption="O token BETTEX dá acesso ao programa de resultados, sem representar ações ou propriedade da tesouraria." />
        <DocTerms id="schematic-asset-roles" label="Papéis dos ativos" items={[
          ['USDC', <Dot items={['Ativo financeiro', 'Saldos e compras', 'Distribuições e saques']} />],
          ['BETTEX', <Dot items={['Token de participação', 'Participação automática no staking', 'Não paga taxas nem é capital das estratégias']} />],
        ]} />
        <div className="whitepaper__aside-callout"><span>BETTEX BANK · PROPOSTA FUTURA</span><p>A conversão de USDC para a moeda da pessoa e pagamentos ou saques fiduciários pertencem à proposta futura do BETTEX Bank, distante da operação inicial. Esse fluxo exigirá venda de USDC, cotação, liquidez, taxas, descontos aplicáveis, conciliação e estrutura jurídica própria. A versão inicial não oferece esse serviço nem opera uma exchange de fiat.</p></div>
      </>;
    case 'documentacao-acesso':
      return <>
        <DocFacts title="Carteira e acesso em resumo" facts={[
          { label: 'CARTEIRA PESSOAL', value: 'Do titular', text: 'Criada com a conta, com chaves e dados exportáveis.' },
          { label: 'ACESSO', value: 'Controle da carteira', text: 'Sem enviar chave privada ou frase de recuperação ao servidor.' },
          { label: 'STAKING', value: 'No aplicativo', text: 'Piscina fechada; não exige manter a sessão aberta continuamente.' },
        ]} />
        <div className="whitepaper__lead"><span>ACESSO PELA CARTEIRA</span><p>A área pessoal é vinculada à <strong>Carteira BETTEX, gerada na criação da conta</strong>. O acesso comprova controle da carteira, não identidade civil. A elegibilidade para atividades financeiras depende dos controles exigidos pela atividade e pelo território.</p></div>
        <DocumentationConsistency area="identity" />
        <Flow label="Autenticação e autorização" steps={['Criar a conta com dados básicos; a carteira da pessoa é gerada na criação da conta. Depois, acessar a área pessoal com os dados dessa carteira.', 'O servidor verifica que a pessoa controla a carteira, sem receber chave privada nem frase de recuperação, e abre uma sessão protegida, com expiração, revogação e trilha de auditoria.', 'Depósitos em USDC exigem recebimento e confirmação on-chain. Saques exigem autorização, saldo disponível, destino e rede compatíveis, além de conciliação da transferência.', 'Uma compra debita USDC e credita BETTEX uma única vez, após confirmação da liquidação. O saldo recebido durante a rodada só se torna elegível na abertura da rodada seguinte.', 'A área pessoal apresenta os saldos separados em USDC e BETTEX, os custos e valores líquidos, os lançamentos conciliados e o histórico do agente.']} />
        <Subhead>Carteira, chaves e exportação</Subhead>
        <div className="whitepaper__prose">
          <p>A Carteira BETTEX é a carteira da pessoa criada com a conta no aplicativo oficial; ela pertence ao titular, não à tesouraria do projeto. Ela é livre e portátil: <strong>as chaves e os dados do usuário são exportáveis</strong> por iniciativa do próprio titular. O projeto incentiva a <strong>autocustódia</strong>. Exportar esses dados não é uma etapa do login e não movimenta, por si só, os tokens.</p>
          <p>A autenticação descrita na <strong>v1</strong> demonstra o controle da carteira sem transmitir chave privada ou frase de recuperação ao servidor. O modelo de acesso utiliza dados básicos e as credenciais da carteira, não uma identidade civil verificada. A implementação de referência EVM não define a rede de lançamento: Starknet e Arbitrum One continuam em avaliação, com carteiras e autorizações compatíveis com a rede escolhida.</p>
        </div>
        <DocImage src="app/participacao.webp" alt="Ilustração tridimensional de uma carteira e tokens." caption="A Carteira BETTEX pertence ao titular, com chaves e dados exportáveis." />
        <DocTerms id="schematic-wallet-access" items={[
          ['Conta e duas carteiras', 'Pertencem ao titular, não à tesouraria'],
          ['Autocustódia', 'Chaves e dados exportáveis por iniciativa do titular'],
          ['Acesso ao aplicativo', 'Comprova o controle da carteira, sem enviar a chave privada'],
          ['Piscina de staking', 'Fechada: exige acesso ao aplicativo'],
        ]} />

        <div className="whitepaper__prose"><p>A participação na piscina fechada e suas regras estão em <a href="#documentacao-staking">Staking e distribuição de resultados</a>.</p></div>
        <Subhead>Sessão e autorização de pagamento</Subhead>
        <div className="whitepaper__prose">
          <p>A entrada com moeda fiduciária utiliza <strong>provedores externos de on-ramp</strong>: a pessoa contrata a conversão para USDC no ambiente do provedor. Isso não cria um saldo fiat na BETTEX nem um serviço de saque fiduciário. A autenticação na BETTEX comprova o controle da carteira e não autoriza, por si só, uma movimentação.</p>
          <p>Qualquer <strong>verificação de identidade ou KYC exigido pelo provedor</strong> ocorre em seu próprio aplicativo ou ambiente, conforme suas regras. Esses processos são separados do login e da recuperação de acesso por carteira. A verificação do provedor não substitui automaticamente controles exigidos da BETTEX; acesso autenticado não é autorização para oferta ou operação financeira.</p>
          <p>A integração financeira acompanha o on-ramp e concilia o USDC efetivamente recebido na rede, sem confundir pagamento fiat ao provedor, confirmação cripto e verificação de identidade. O backend valida a solicitação, o vínculo com a conta, a autorização e o saldo antes de registrar o efeito financeiro. Cada confirmação deve ser processada de forma idempotente, para que mensagens repetidas ou retomadas de serviço não creditem nem transfiram duas vezes.</p>
          <p>Troca de aparelho e recuperação de acesso respeitam o controle da carteira pelo titular. Compras e alterações da posição BETTEX passam pelo backend, com autorização da conta e registro dos eventos relevantes. As ordens do agente não podem ser iniciadas por uma sessão comum de usuário nem contornar as autorizações próprias da operação. Autenticação da carteira, autorização financeira e autorização de operações do agente permanecem controles distintos.</p>
        </div>
      </>;
    case 'documentacao-arquitetura':
      return <>
        <ArchitectureCatalogue />
        <div className="whitepaper__lead"><span>UM AGENTE, RESPONSABILIDADES SEPARADAS</span><p>A arquitetura separa apresentação, registros em USDC e BETTEX, operação do agente, conectores de mercado e supervisão. A entrada fiat é convertida por on-ramp externo; o restante do fluxo financeiro da pessoa é cripto. Nenhum conector pode aprovar ou executar uma operação fora dos controles centrais. Um saldo só deve ser exibido como disponível após conciliação.</p></div>
        <BettexFlow figure="4" />
        <div className="whitepaper__system">
          <div><span>01 / INTERFACE</span><strong>Saldos USDC e BETTEX</strong><p>Exibe os ativos separados e a estimativa do valor financeiro em moeda local, além de custos, valores líquidos e participação automática. A visualização não converte o saldo USDC.</p></div>
          <div><span>02 / SERVIDOR</span><strong>API e livro contábil</strong><p>Autentica a conta, registra lançamentos em USDC e BETTEX corrigíveis por ajuste identificado, calcula limites e saldos elegíveis, processa compras e impede pedidos repetidos.</p></div>
          <div><span>03 / AGENTE BETTEX</span><strong>Análises, contratos e conectores</strong><p>Análises e conectores operam fora da rede; contratos aplicam as permissões executáveis on-chain. O núcleo de risco verifica cada operação dentro do mandato. A apuração concilia resultados, posições abertas e obrigações antes de autorizar o split 50%/25%/25%. Esse split define a destinação do resultado, não uma nova entrada de capital: reter os 50% não exige uma transferência fictícia, e atribuir os 25% não confirma seu recebimento. O crédito só fica disponível após liquidação conciliada em USDC.</p></div>
          <div><span>04 / LIQUIDAÇÃO E SUPERVISÃO</span><strong>Serviços operacionais</strong><p>O backend concilia transferências de USDC e BETTEX e o recebimento do on-ramp externo; controles independentes verificam ordens e operadores autorizados aprovam intervenções críticas, pausas e conciliações.</p></div>
        </div>
        <></>
        <Subhead>Dados que precisam bater</Subhead>
        <div className="whitepaper__prose">
          <p><strong>BETTEX determina a participação no staking; os ganhos são creditados em USDC.</strong> Entradas durante a rodada aguardam a próxima; não recebem nenhum lucro da rodada atual. Qualquer saída de BETTEX, mesmo parcial, zera o peso e cancela os créditos anteriores ainda não pagos. BETTEX não é capital das estratégias dos agentes nem participação societária.</p>
          <p>Cada movimento financeiro em <strong>USDC</strong> deve conter identificador único, conta, ativo, rede, origem, destino, valor bruto, custos, valor líquido, estado e referência externa. Após confirmação da liquidação, os lançamentos correspondentes devem ser registrados juntos e uma única vez. Uma mensagem repetida não pode duplicar os efeitos: o mesmo identificador tem um único efeito contábil. Registrar um movimento não confirma uma transferência on-chain ainda pendente.</p>
          <p><strong>A venda dos tokens da comunidade em vesting</strong> no aplicativo ou diretamente a corretoras entrega apenas tokens liberados. 100% do preço pago em USDC vai à tesouraria. O mint inicial financia o projeto e fica separado dessa destinação. A venda a corretoras exige entrega e conciliação específicas, não uma integração presumida.</p><p>{growthStrategy.launch.angelFundingUse} <a href="#documentacao-financiamento-fundacao">Financiamento: origem e destino dos recursos</a></p>
          <p>A conciliação compara USDC recebido, incluindo entradas por on-ramp, saldos e movimentos dos dois ativos, resultados por mercado, custos, reservas e obrigações em USDC. Cada conector informa origem, horário e estado; a visão consolidada permite verificar o risco global. Diferenças devem congelar o fluxo afetado e gerar investigação, nunca saldo artificial. Monitoramento, auditoria e alertas são requisitos operacionais.</p>
        </div>
        <Subhead>Agentes, MCP e APIs de mercado</Subhead>
        <div className="whitepaper__prose"><p>O <strong>desenho 7</strong> apresenta os agentes, as conexões e a execução automática. O <strong>desenho 8</strong> mostra como os agentes coletam oportunidades, comparam alternativas e escolhem a melhor segundo retorno esperado, custos, liquidez, exposição e risco. A IA registra os critérios da escolha, define o investimento dentro da parcela investível autorizada e envia a ordem somente após aprovação independente de risco. O registro público acompanha todo o ciclo: oportunidades coletadas, selecionadas e descartadas, motivos da decisão, valores investidos e estados das transações.</p></div>
        <div className="whitepaper__prose"><p>A IA BETTEX coordena agentes que analisam oportunidades e executam automaticamente as operações autorizadas. Os agentes se conectam aos negócios por <strong>MCP (Model Context Protocol)</strong>, quando houver ferramentas disponíveis, ou pelas <strong>APIs</strong> de dados e execução de cada plataforma. Uma ferramenta de consulta não é uma permissão para negociar: o envio de ordens utiliza o recurso de execução autorizado, com aprovação independente de risco e registro de todo o ciclo.</p><p>Na <strong>Polymarket</strong>, a <a href="https://docs.polymarket.com/trading/overview.md" target="_blank" rel="noopener noreferrer">API de trading e o CLOB</a> permitem enviar ordens assinadas e acompanhar sua execução e liquidação. Robinhood e Allora têm os papéis descritos abaixo: conexão de mercado para cripto e inferências de IA para análise, respectivamente.</p><p><strong>Todas as transações do projeto são registradas abertamente</strong>, incluindo vendas de BETTEX, operações nos mercados, movimentações da tesouraria, distribuições e saques. A trilha pública contém horários, ativos, quantidades, valores, custos, estados e referências verificáveis; acompanha falhas, cancelamentos e ajustes, além das execuções concluídas. Correções são novos registros identificados, nunca alterações invisíveis. Chaves privadas, credenciais e dados pessoais ficam fora do registro público. A execução automática respeita reservas, permissões e risco. As quantidades e os meses de liberação dos tokens são definidos pelo cronograma de vesting, não por decisões discricionárias da gestão.</p></div>
        <Subhead>Robinhood: dados e execução de mercado</Subhead>
        <div className="whitepaper__prose">
          <p>A <strong>Robinhood</strong> faz parte da apresentação técnica como uma possibilidade de conector para o mercado de ações e criptoativos. O conector deve separar leitura de preços e posições, proposta de ordem, aprovação pelo núcleo de risco, execução e conciliação do resultado. A conta operacional do projeto não é a carteira pessoal do titular.</p>
          <p>A <a href="https://docs.robinhood.com/crypto/trading" target="_blank" rel="noopener noreferrer">Robinhood Crypto Trading API</a> documenta consultas e ordens de <strong>criptoativos</strong>, com disponibilidade para clientes nos Estados Unidos; não estabelece acesso equivalente para ações. Cada canal precisa de autorização e custódia e liquidação compatíveis com a operação cripto inicial. Um conector que exija caixa fiduciário próprio não integra esse escopo.</p>
        </div>
        <RobinhoodFlowDiagram />
        <Subhead>Allora: integração possível de inferências</Subhead>
        <div className="whitepaper__prose">
          <p>A <strong>Allora</strong> pode fornecer inferências agregadas para enriquecer a análise da BETTEX. Um adaptador de dados pode consultar os tópicos relevantes por API, registrar origem e horário e normalizar os valores recebidos. Intervalos de confiança devem ser tratados quando estiverem disponíveis no tópico, sem pressupor que todas as respostas os contenham.</p>
          <p>Esses sinais entram na camada de análise junto de preços, probabilidades, liquidez e exposição. A decisão permanece no núcleo BETTEX, com aprovação independente de risco antes de qualquer ordem. Allora não controla a carteira, não executa pagamentos ou ordens e não autentica o usuário. A consulta por API é uma integração possível do backend, não uma afirmação de integração on-chain já validada na Starknet ou na Arbitrum.</p>
          <p>Referência técnica: <a href="https://docs.allora.network/get-started/quickstart-consume" target="_blank" rel="noopener noreferrer">consumo de inferências na documentação oficial da Allora</a>.</p>
        </div>
        <Subhead>Expansão futura das integrações e dos agentes</Subhead>
        <div className="whitepaper__prose" id="documentacao-expansao-integracoes">
          <p>As integrações com <strong>plataformas de trading e casas de apostas</strong> serão ampliadas futuramente, junto com o desenvolvimento de agentes mais complexos e especializados. Essa expansão inclui conectores de dados e execução para os mercados atendidos pela BETTEX.</p>
          <p>Serão desenvolvidos agentes específicos para <strong>surebet (surebetting) nos esportes</strong>, com comparação de odds e coordenação de apostas entre casas para cobrir os resultados do evento, e para <strong>bonus hunting (mineração de bônus) no iGaming</strong>, com análise de promoções, condições de cada oferta, requisitos de aposta e regras de elegibilidade.</p>
          <p>Esses desenvolvimentos fazem parte da expansão futura, não de integrações já ativas. Os novos agentes e conectores seguirão os mesmos controles de autorização, risco e reservas, com regras e transações públicas. <strong>BETTEX serve para staking</strong>. BETTEX não será usado como capital de trading, apostas ou promoções.</p>
        </div>
      </>;
    case 'documentacao-agentes-detalhe':
      return <InvestmentAgents />;
    case 'documentacao-emissao-detalhe':
      return <>
        <div className="whitepaper__supply">
          <div className="whitepaper__supply-top"><span>EMISSÃO TOTAL</span><strong data-testid="text-documentacao-max-supply">{formatTokenCount(tokenomics.maxSupply)}</strong><small>BETTEX · teto total da emissão aprovada.</small></div>
          <div className="whitepaper__supply-bar" role="img" aria-label="10% mint inicial, 55% comunidade, 20% fundador e equipe, 15% investidores"><span /><span /><span /><span /></div>
          <div className="whitepaper__supply-key"><span><i />Mint inicial · {formatTokenCount(tokenomics.initialMintAllocation)} (10%)</span><span><i />Comunidade · {formatTokenCount(tokenomics.communityAllocation)} (55%)</span><span><i />Fundador e equipe · {formatTokenCount(tokenomics.teamAllocation)} (20%)</span><span><i />Investidores · {formatTokenCount(tokenomics.investorAllocation)} (15%)</span></div>
        </div>
        <DocFacts title="Economia do token em resumo" tone="accent" cols={4} facts={[
          { label: 'EMISSÃO', value: '1 bilhão', text: 'Teto total de BETTEX.' },
          { label: 'ALOCAÇÃO', value: '10 / 55 / 20 / 15', text: 'Mint inicial, comunidade, fundador/equipe e investidores.' },
          { label: 'VESTING', value: '24 meses', text: '900 milhões de BETTEX; mint inicial separado.' },
          { label: 'MINT INICIAL', value: 'Preço fixo', text: 'Aberto à comunidade para financiar o projeto.' },
        ]} />
        <Subhead>Regras e requisitos de emissão</Subhead>
        <div className="whitepaper__rule-pair" data-testid="documentacao-novas-vendas">
          <div><span>EMISSÃO E VENDA / CRONOGRAMA DE VESTING</span><p><strong>O mint inicial tem teto de 100 milhões de BETTEX e preço fixo.</strong> Qualquer pessoa pode participar, observadas as condições legais da oferta. O mint financia o projeto e pode ser executado pela BETTEX ou por um launchpad parceiro. Valor do preço, janela, plataforma e destino dos tokens não mintados ainda serão definidos. Não presumir venda integral, pool aberto ou parceria contratada.</p></div>
          <div><span>PREÇO DOS TOKENS DA VENDA PÚBLICA → TESOURARIA</span><p><strong>Os 55% da comunidade são uma destinação separada dos 10% do mint.</strong> A venda dos tokens da comunidade já liberados destina 100% do preço em USDC à tesouraria. O mint inicial é captação para financiar o projeto, não lucro distribuível. Sua aplicação e prestação de contas devem identificar origem e destino dos recursos, sem presumir que todo o valor será usado em operações dos agentes.</p></div>
        </div>
        <div className="whitepaper__prose">
          <p>A compra no aplicativo é liquidada em USDC após confirmação conciliada. O preço destinado à tesouraria e a quantidade de BETTEX creditada são registrados juntos e uma única vez. A aquisição não é investimento dos agentes. A compra credita a carteira gerada com a conta, não um endereço externo escolhido na hora; a venda direta a corretoras tem fluxo próprio. O recibo identifica preço, cotação pertinente, custos externos, tokens adquiridos, destinos e conta.</p>
          <p><strong>BETTEX serve para staking, não pagamento de taxas ou participação societária.</strong> Não é capital das estratégias. O fundador pode vender ou distribuir sua parcela liberada. Novas versões aprofundarão custódia das chaves administrativas, aprovação de mudanças e atualização. Auditoria independente permanece requisito da implementação.</p>
        </div>
        <SaleChannels />
        <TechnicalDetails title="Canais de venda: entrega e conciliação com corretoras">
        <div id="documentacao-venda-corretoras">
          <Subhead>Venda direta a corretoras para formar a tesouraria</Subhead>
          <div className="whitepaper__prose">
            <p>A parcela de <strong>55% da comunidade pode ser vendida diretamente a corretoras após a liberação no vesting</strong>. Esse canal não substitui o mint inicial aberto a preço fixo nem exige um pool de liquidez.</p>
            <p><strong>100% dos recursos dessas vendas em USDC vão à tesouraria.</strong> O canal não altera as quatro destinações nem o vesting de 24 meses. Vendas pessoais do fundador têm livre destinação e ficam separadas da captação do projeto.</p>
            <p>O fluxo de venda à corretora deve identificar a contraparte, a quantidade de BETTEX, o pagamento em USDC e a carteira de entrega, com confirmação, conciliação e registro público da transação. A previsão desse canal não significa parceria, listagem ou integração com uma corretora já ativa.</p>
          </div>
        </div>
        </TechnicalDetails>
        <div id="documentacao-aportes-investidores">
          <Subhead>Dinheiro dos investidores e liberdade do fundador</Subhead>
          <div className="whitepaper__aside-callout">
            <div><span>APORTES DOS INVESTIDORES</span><p>{growthStrategy.launch.angelFundingUse}</p></div>
          </div>
          <div className="whitepaper__rule-pair">
            <div><span>FUNDADOR / 20% DE LIVRE DESTINAÇÃO</span><p><strong>{formatTokenCount(tokenomics.teamAllocation)} BETTEX</strong> pertencem ao fundador. Após cada liberação do vesting, ele pode usar os tokens como quiser: distribuir ao time, manter em staking, transferir ou vender. Não existe uma divisão obrigatória dessa parcela com o time. A destinação de suas vendas pessoais é livre.</p></div>
            <div><span>INVESTIDORES / 15%</span><p><strong>{formatTokenCount(tokenomics.investorAllocation)} BETTEX</strong> para investidores, com liberação mensal durante 24 meses. Aportes, liberação de tokens e resultados de staking são movimentos distintos.</p></div>
          </div>
        </div>
        <TokenHolderRights />
        <div className="whitepaper__aside-callout"><span>REQUISITOS DE VENDA</span><p>A compra é paga em USDC confirmado. Quem entra com fiat primeiro adquire USDC por on-ramp externo, sujeito à cotação e aos custos do provedor. A oferta deve informar o preço em USDC e os custos aplicáveis antes da confirmação, sem presumir equivalência entre valores nominais de moedas diferentes. O processamento depende de controles operacionais e autorização jurídica.</p></div>
      </>;
    case 'documentacao-controles':
      return <>
        <div className="whitepaper__lead"><span>TESOURARIA · AJUSTES SUJEITOS À APROVAÇÃO</span><p><strong>A IA sugere ajustes nas regras da tesouraria e nos controles de risco; as sugestões entram em uma fila para execução e precisam de aprovação da administração do projeto.</strong>{' '}O agente da tesouraria propõe otimizações em conjunto com os agentes de investimento, considerando reservas, liquidez e exposição. Essa evolução pode incluir os limites e percentuais apresentados nesta seção, mas nenhuma sugestão altera as regras antes de sua aprovação e execução.</p></div>
        <ReservePolicy />
        <InvestmentRiskBase />
        <BettexFlow figure="5" />
        <div className="whitepaper__prose">
          <p>Os controles aplicam as regras vigentes em cada momento. Enquanto uma sugestão aguarda aprovação ou execução, continuam valendo as regras anteriores. Cada mudança deve registrar a proposta, a justificativa, a aprovação da administração do projeto, a execução e o momento de vigência. As verificações independentes de risco continuam obrigatórias para as operações dos agentes.</p>
          <p>Os percentuais abaixo são <strong>parâmetros iniciais, cuja alteração depende de aprovação da administração do projeto e execução registrada</strong>, e usam como base o <strong>patrimônio líquido atualizado da parcela investível</strong>, conforme a definição acima, não o patrimônio inteiro nem apenas o caixa livre. São tetos de risco, não percentuais fixos de distribuição dos investimentos entre mercados. Uma verificação central independente das estratégias deve recusar qualquer nova ordem de investimento que ultrapasse um limite vigente. Reduções de posições na pausa por perda diária seguem a <a href="#documentacao-reducao-na-pausa">regra específica de fechamento</a>, sem dispensar os demais controles. <strong>Ordens pendentes contam</strong> nos compromissos e na exposição; registrar a ordem apenas depois de executá-la não basta. O total de exposições correlacionadas é consolidado entre mercados, mesmo quando conectores diferentes estejam envolvidos.</p>
        </div>
        <div className="whitepaper__limits">
          <div><span>01 / NOVOS COMPROMISSOS POR DIA</span><strong>2% <em>global</em> / 0,5% <em>por mercado</em></strong><p>Soma dos novos compromissos autorizados e com reserva registrada no dia UTC, uma vez por operação. Cancelamento não reduz o acumulado; pedidos recusados antes da autorização e reserva não entram.</p></div>
          <div><span>02 / OPERAÇÃO INDIVIDUAL</span><strong>0,05%</strong><p>Máximo comprometido pelo conjunto das partes coordenadas de uma única proposta, não por cada ordem isolada.</p></div>
          <div><span>03 / EXPOSIÇÃO EM ABERTO</span><strong>10% <em>global</em> / 2,5% <em>por mercado</em></strong><p>Inclui posições abertas e compromissos que aguardam resultado, consolidados pelo núcleo central.</p></div>
          <div><span>04 / EXPOSIÇÃO CORRELACIONADA</span><strong>0,5%</strong><p>Conjunto de posições em quaisquer mercados afetadas pelo mesmo evento ou risco.</p></div>
          <div><span>05 / PERDA REALIZADA DIÁRIA</span><strong>0,5% <em>global</em> / 0,125% <em>por mercado</em></strong><p>Perda líquida do resultado realizado e conciliado no dia UTC, após custos, apurada globalmente e por mercado. Ao atingir o teto, a pausa permanece até o próximo dia UTC, mesmo com ganhos posteriores.</p></div>
        </div>
        <Subhead>Como o bloqueio funcionaria</Subhead>
        <div className="whitepaper__prose"><p>A API de execução não deve aceitar ordens diretas de uma estratégia ou conector. O núcleo central verifica caixa livre, reservas existentes, exposição por mercado e correlação, perdas realizadas e autorização da integração; a verificação dos limites e o registro da reserva da operação são indivisíveis e devem concluir <strong>antes</strong> de enviá-la. Ordens distintas e simultâneas consideram as reservas umas das outras, sem reutilizar o mesmo capital ou exceder os limites conjuntos. Repetir o mesmo pedido não pode consumir o limite duas vezes nem gerar duas ordens. Falta de cotação confiável, divergência de saldo ou perda de comunicação impede novas ordens até reconciliação.</p><p>Não há alavancagem. Uma pausa de emergência, controlada por pessoas autorizadas e registrada em auditoria, pode impedir novas operações independentemente dos limites; a política de cancelamento de ordens pendentes também precisa ser testada. Limites reduzem exposição, mas não evitam perdas nem autorizam atuação onde a lei, as regras do mercado ou a plataforma proíbem. Operações de iGaming mantêm os mesmos tetos e podem perder rapidamente por acaso, variância e vantagem da casa.</p></div>
        <DocTerms id="schematic-risk-authorization" label="Autorização de cada ordem" items={[
          ['Estratégia ou conector', 'Propõe a operação'],
          ['Núcleo de risco', 'Verifica limites, reserva e caixa livre'],
          ['Reserva de capital', 'Registrada de forma indivisível'],
          ['Execução automática', 'Somente após validação automática do risco'],
          ['Conciliação', 'Resultado e estado registrados'],
          ['Limite ou reserva não atendidos', 'Ordem não enviada'],
        ]} />
        <TechnicalDetails title="Autorizar e executar: reservas, integridade, custos e propostas coordenadas">
          <OrderReservations />
          <AuthorizedRequestIntegrity />
          <CoordinatedProposals />
          <AuthorizedOperationCosts />
          <RiskPrecision />
          <QuoteValidity />
          <ExecutionConditions />
          <CoordinatedContinuation />
        </TechnicalDetails>
        <TechnicalDetails title="Limites e calendário: mudança de regras, compromissos e perdas diárias">
          <RiskRuleTransitions />
          <DailyCommitments />
          <DailyRealizedLosses />
          <RiskReducingClosures />
          <FinancialEventTiming />
        </TechnicalDetails>
        <TechnicalDetails title="Conciliação de ordens: respostas tardias e fora de ordem">
          <OrderReconciliation />
          <OutOfOrderResponses />
        </TechnicalDetails>
      </>;
    case 'documentacao-implantacao':
      return <>
        <div className="whitepaper__lead"><span>REQUISITOS DE OPERAÇÃO SEGURA</span><p>Os componentes financeiros, o agente BETTEX e a infraestrutura de ativos devem operar com controles verificáveis, separação de responsabilidades e capacidade de interromper fluxos inseguros sem perder o histórico contábil.</p></div>
        <FundSecurity />
        <div className="whitepaper__steps">
          <div><span>01</span><p>Aplicar controle de acesso mínimo, autenticação forte para operadores e segregação de funções. Sugestões da IA para alterar regras da tesouraria ou limites de risco entram em uma fila e só podem ser executadas após aprovação da administração do projeto, com trilha auditável. Mudanças em contratos, permissões e destinos de ativos exigem aprovação por múltiplos responsáveis autorizados pela liderança e registro auditável.</p></div>
          <div><span>02</span><p>Proteger chaves com armazenamento e procedimentos de recuperação definidos; estabelecer limites de assinatura e política de revogação. Endereços de contratos, ativos e tesouraria devem ser verificados por fontes independentes antes de serem usados.</p></div>
          <div><span>03</span><p>Testar contratos, integrações, indexadores, conectores de mercado e livro contábil contra duplicidade, reordenação de blocos, falha de rede, divergência de saldo, repetição de mensagens e recuperação. Exigir auditoria independente dos contratos e controles de custódia.</p></div>
          <div><span>04</span><p>Monitorar saldos, obrigações, limites globais e por mercado e integrações; emitir alertas acionáveis e manter procedimentos de resposta a incidentes. A pausa de emergência deve bloquear novas ordens sem apagar obrigações já atribuídas; retomada após incidente depende de conciliação e autorização registrada.</p></div>
        </div>
        <TechnicalDetails title="Continuidade: recuperar controles e conciliar fundos em trânsito">
          <RiskStateRecovery />
          <TreasuryFundsInTransit />
        </TechnicalDetails>
        <div className="whitepaper__prose reading-keep"><p> A compra deve registrar débito de USDC e crédito de BETTEX juntos e uma única vez após a liquidação; cada distribuição é lançada uma única vez em USDC. A continuidade preserva registros imutáveis com ajustes identificados, backups testados e conciliação entre transferências on-chain, recebimentos de on-ramp, saldos dos dois ativos, custos, resultados por mercado, tesouraria e saques. Falhas resultam em estado pendente ou bloqueio, nunca confirmação presumida. Custódia, permissões, integrações e conformidade exigem validação técnica e jurídica. A operação inicial cripto não pressupõe autorização de exchange ou banco; a proposta fiduciária do BETTEX Bank demanda estrutura própria antes de qualquer oferta.</p></div>
      </>;
    case 'documentacao-riscos-detalhe':
    default:
      return <>
        <div className="whitepaper__prose"><p>As regras econômicas e os controles descritos aqui <strong>não garantem retorno ou proteção do capital</strong>. Serviços, ativos e redes podem falhar ou ficar indisponíveis; stablecoins podem perder valor ou desviar-se de uma paridade de referência. A versão inicial utiliza USDC nos saldos e saques e não oferece resgate fiduciário pela BETTEX. Permanecem riscos de liquidez do token, perdas em qualquer mercado, execução inadequada, custódia, tecnologia e mudança regulatória.</p></div>
        <div className="whitepaper__risk-list">
          <div><span>MERCADOS E MODELOS</span><p>Dados atrasados ou incorretos, vieses de modelo, baixa liquidez, volatilidade, correlação imprevista e execução ruim podem causar perdas. Um limite reduz exposição, mas não cria lucro nem impede resultados adversos simultâneos em mercados diferentes.</p></div>
          <div><span>ESPORTES E EVENTOS</span><p>Eventos podem ser adiados, cancelados, resolvidos segundo regras específicas ou produzir resultados imprevisíveis; disponibilidade, liquidez e regras de liquidação variam conforme o mercado.</p></div>
          <div><span>iGaming</span><p>Jogos de iGaming envolvem acaso, vantagem da casa e alta variância, podendo gerar perdas rápidas. Só podem ser considerados onde forem legalmente permitidos e mediante autorização do provedor; nenhuma estratégia ou automação elimina esses riscos.</p></div>
          <div><span>LIQUIDAÇÃO E ATIVOS INTERNOS</span><p>Falhas de integração, confirmação ou conciliação, desvalorização de stablecoins e divergência entre livro e reserva exigem bloqueio e investigação.</p></div>
          <div><span>CONTAS E CUSTÓDIA</span><p>Acesso indevido, desvio de fundos, destino ou rede incompatível e divergências entre saldos USDC, obrigações e reservas exigem bloqueio e investigação.</p></div>
          <div><span>LEI E TERCEIROS</span><p>Uma plataforma pode não permitir automação; uma jurisdição pode vedar depósito, venda, distribuição ou operação em determinado mercado, inclusive esportes ou iGaming.</p></div>
        </div>
        <Subhead>Escolhas sujeitas a validação</Subhead>
        <div className="whitepaper__prose"><p>Autenticação por carteira, custódia, contrato e rede de USDC, controles da tesouraria, conciliação on-chain, tratamento de custos, on-ramp externo, emissão e gestão da posição BETTEX, conectores autorizados, arredondamento e resposta a incidentes devem ser validados pelos responsáveis técnicos e jurídicos. Nenhum requisito técnico substitui autorização legal ou controles independentes. A conversão para fiat da proposta futura do BETTEX Bank exige validação separada e não integra o escopo inicial.</p></div>
        <div className="whitepaper__glossary"><span>GLOSSÁRIO BREVE</span><p><strong>Agente BETTEX:</strong> sistema que analisa e opera mercados sob risco e supervisão comuns. <strong>Estratégia:</strong> análise especializada de mercado. <strong>Conector:</strong> integração autorizada para dados ou execução. <strong>USDC:</strong> stablecoin usada para saldos financeiros, compras, depósitos, distribuições e saques da versão inicial. <strong>Visão de valor:</strong> equivalente estimado do saldo USDC na moeda fiduciária da pessoa, sem conversão executada ou alteração do ativo de saque. <strong>Moeda fiduciária:</strong> moeda local da estimativa exibida na interface e da entrada por on-ramp externo; pagamento efetivo nessa moeda pertence à proposta futura do BETTEX Bank, não ao saldo inicial. <strong>On-ramp:</strong> provedor externo que converte fiat em cripto. <strong>Off-ramp:</strong> conversão de cripto para fiat, não oferecida pela BETTEX inicial. <strong>Lucro elegível ao split:</strong> máximo entre zero e o menor valor entre o lucro realizado líquido da própria rodada e o ganho patrimonial líquido elegível acima da base de referência, considerando posições abertas, custos e obrigações. Não inclui lucro retido de rodadas encerradas. <strong>Dia de lucro:</strong> apuração conciliada em USDC com lucro elegível positivo; a distribuição também depende das reservas atendidas. <strong>Carteira da pessoa:</strong> gerada com a conta, pertencente ao titular, com chaves e dados exportáveis; não é identidade civil verificada. <strong>Participação automática:</strong> saldo BETTEX confirmado e elegível na abertura participa sem ativação adicional. Entradas durante a rodada recebem zero dela e aguardam a próxima. Qualquer saída, mesmo parcial, cancela todos os créditos anteriores ainda não pagos e zera o peso; o retorno só ocorre na próxima rodada. Ganhos são creditados apenas na Carteira USDC. <strong>Peso de participação:</strong> saldo BETTEX elegível na abertura multiplicado pela duração integral da rodada, sem saída. Novos saldos não alteram o peso da rodada atual. O peso não passa para a seguinte. <strong>Conciliação:</strong> comparação de registros, confirmações e fundos, sem reabrir rateios encerrados. <strong>Idempotência:</strong> repetir o pedido sem repetir o efeito.</p></div>
        <div className="whitepaper__prose"><p><strong>Contas separadas:</strong> tesouraria, recompra e carteiras dos usuários têm finalidades distintas. <strong>Captação:</strong> não é lucro distribuível.</p></div>
        <div className="whitepaper__lead whitepaper__lead--dark whitepaper__closing"><span>ANTES DE DECIDIR</span><p>Não há rendimento prometido, capital protegido ou aprovação implícita. Considere os riscos de mercado, liquidez, tecnologia, custódia e regulação antes de qualquer decisão financeira.</p></div>
      </>;
  }
}
const topicTitles = new Map<unknown, string>([
  [DocumentationGames, 'Loteria e Double 2X'],
  [StakingDistribution, 'Distribuição do staking'],
  [BuybackPolicy, 'Recompras de BETTEX'],
  [SaleChannels, 'Canais de venda'],
  [ServiceFees, 'Custos de rede'],
  [VestingSchedule, 'Cronograma de vesting'],
  [TokenHolderRights, 'Direitos dos titulares'],
  [ArbitrumFlowDiagram, 'Referência técnica: fluxo EVM na Arbitrum'],
  [RobinhoodFlowDiagram, 'Fluxo Robinhood'],
  [ReservePolicy, 'Política de reservas'],
  [InvestmentRiskBase, 'Base de risco do investimento'],
  [OrderReservations, 'Reservas de ordens'],
  [OrderReconciliation, 'Conciliação de ordens'],
  [DailyCommitments, 'Compromissos diários'],
  [DailyRealizedLosses, 'Perdas realizadas diárias'],
  [FinancialEventTiming, 'Tempo dos eventos financeiros'],
  [RiskRuleTransitions, 'Transições de regras de risco'],
  [CoordinatedProposals, 'Propostas coordenadas'],
  [AuthorizedOperationCosts, 'Custos de operações autorizadas'],
  [QuoteValidity, 'Validade de cotações'],
  [ExecutionConditions, 'Condições de execução'],
  [CoordinatedContinuation, 'Continuação coordenada'],
  [RiskReducingClosures, 'Encerramentos que reduzem risco'],
  [RiskPrecision, 'Precisão de risco'],
  [AuthorizedRequestIntegrity, 'Integridade de pedidos autorizados'],
  [OutOfOrderResponses, 'Respostas fora de ordem']
]);

function titleOf(el: ReactElement<{ children?: ReactNode; className?: string; id?: string }>): TopicInfo {
  if (el.type === BettexFlow) {
    const figure = (el.props as { figure: ArchitectureFigureNumber }).figure;
    return { title: architectureFigureTitles[figure], drop: false };
  }
  if (el.type === Subhead) return { title: el.props.children, drop: true };
  if (el.type === DocFacts || el.type === FundSecurity) return 'bare';
  const t = topicTitles.get(el.type);
  if (t) return { title: t, drop: false };
  return defaultTopicOf(el);
}

export function ChapterContent({ index }: { index: number }) {
  const parts = (node: ReactNode) => isValidElement(node) && node.type === Fragment
    ? Children.toArray((node as ReactElement<{ children: ReactNode }>).props.children)
    : Children.toArray(node);
  return <DocumentationOwnedContent id={chapters[index]?.id ?? ''}
    main={id => parts(MainBody({ id }))}
    legacy={id => parts(LegacyBody({ id }))} />;
}
