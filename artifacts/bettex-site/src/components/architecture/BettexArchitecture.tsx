import { createContext, useContext, type ReactNode } from 'react';
import { ArchitectureIntegrations, type ArchitectureFigureNumber } from './ArchitectureIntegrations';
import './BettexArchitecture.css';
import { DocumentationTechnologyCondition } from '../DocumentationTechnologyCondition';

type Surface = 'dark' | 'paper';
type Tone = 'blue' | 'gold' | 'teal' | 'plain';

interface Step { title: string; text: string; tone?: Tone; badge?: string; id?: string; extra?: ReactNode }

export const architectureFigureTitles: Record<ArchitectureFigureNumber, string> = {
  '1': 'Conta, carteiras e compra de BETTEX',
  '2': 'Compra no swap oficial usando USDC',
  '3': 'Auto staking na Carteira BETTEX',
  '4': 'Tesouraria conectada ao agente de IA BETTEX',
  '5': 'Tesouraria, reservas e split dos ganhos',
  '6': 'Da parcela do staking ao saque em USDC',
  '7': 'Agentes de IA e conexões com os mercados',
  '8': 'Da coleta de oportunidades ao investimento e registro público',
};

const figureMetadata: Record<ArchitectureFigureNumber, { id: string; lead: string }> = {
  '1': { id: 'figure-bettex-wallet', lead: 'Cria a conta, recebe as duas carteiras e compra BETTEX por swap.' },
  '2': { id: 'figure-bettex-deposit', lead: 'Neste desenho, o vendedor é o projeto: BETTEX vai para a Carteira BETTEX; 100% do preço dos tokens da comunidade pago em USDC vai à tesouraria.' },
  '3': { id: 'figure-bettex-staking', lead: 'BETTEX disponível na carteira participa automaticamente. USDC não entra no cálculo do staking.' },
  '4': { id: 'figure-bettex-ai-contract', lead: 'O smart contract do agente de IA BETTEX conecta a tesouraria às regras de operação e autorização do capital.' },
  '5': { id: 'figure-bettex-risk', lead: 'Tesouraria → IA BETTEX → verifica reservas, liquidez e pesos elegíveis: retém o lucro ou libera o split.' },
  '6': { id: 'figure-bettex-payout', lead: 'Depois do split do desenho 5: parcela do staking → recebimento confirmado na Carteira USDC → saque em USDC.' },
  '7': { id: 'figure-bettex-agents', lead: 'Agentes de IA → conexões por MCP ou API → execução automática das operações autorizadas.' },
  '8': { id: 'figure-bettex-opportunities', lead: 'Coleta oportunidades → compara e escolhe a melhor → investe com autorização → registra todo o ciclo abertamente.' },
};
const FigureHeaderContext = createContext(true);

function Steps({ steps, label, stacked = false }: { steps: Step[]; label: string; stacked?: boolean }) {
  return (
    <ol className={`ba-steps${stacked ? ' ba-steps--stacked' : ''}`} aria-label={label} style={{ ['--cols' as string]: steps.length }}>
      {steps.map((s, i) => (
        <li key={s.title} className={`ba-step ba-step--${s.tone ?? 'plain'}`} data-testid={s.id}>
          <span className="ba-step__n">{i + 1}</span>
          <div className="ba-step__body">
            <h5>{s.title}{s.badge && <em>{s.badge}</em>}</h5>
            <p>{s.text}</p>
            {s.extra}
          </div>
          {i < steps.length - 1 && (
            <svg className="ba-step__arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </li>
      ))}
    </ol>
  );
}

function Figure({ id, num, title, lead, children }: { id: string; num: ArchitectureFigureNumber; title: string; lead: string; children: ReactNode }) {
  const showHeader = useContext(FigureHeaderContext);
  return (
    <section className="ba-fig" id={id} data-testid={id} aria-labelledby={`${id}-t`}>
      {showHeader ? <header className="ba-fig__head">
        <span className="ba-fig__num">Desenho {num} de 8</span>
        <h3 id={`${id}-t`}>{title}</h3>
        <p>{lead}</p>
      </header> : <span className="ba-fig__num">Desenho {num} de 8</span>}
      {children}
      <ArchitectureIntegrations figure={num} />
    </section>
  );
}

const fig1: Step[] = [
  { title: 'Cria a conta', text: 'Cadastro no aplicativo com dados básicos.', tone: 'blue' },
  { title: 'Cria as carteiras', text: 'Duas carteiras do titular, com chaves e dados exportáveis.', tone: 'blue',
    extra: (
      <div className="ba-entry" data-testid="node-personal-wallets">
        <div><strong>Carteira USDC</strong></div>
        <div><strong>Carteira BETTEX</strong></div>
      </div>
    ) },
  { title: 'Compra BETTEX', text: 'Usa USDC no swap oficial da venda pública. Após confirmação, recebe os BETTEX; não há cobrança de serviço definida.', tone: 'gold', badge: 'Swap', id: 'node-bettex-swap',
    extra: <div className="ba-swap" aria-label="Troca de USDC por BETTEX"><span>USDC</span><span aria-hidden="true">→</span><span>BETTEX</span></div> },
];
const fig2: Step[] = [
  { title: 'Carteira USDC', text: 'A pessoa usa o USDC disponível e confirmado para comprar BETTEX da venda pública do projeto.', tone: 'blue' },
  { title: 'Confirma o swap', text: 'Confere preço, quantidade e custos externos em USDC. Valores e destinos precedem a autorização.', tone: 'gold', id: 'node-treasury-swap',
    extra: <div className="ba-swap" aria-label="Compra de BETTEX com USDC"><span>USDC</span><span aria-hidden="true">→</span><span>BETTEX</span></div> },
  { title: 'Compra liquidada', text: 'O preço em USDC vai à tesouraria; o crédito dos BETTEX comprados e os débitos são conciliados juntos uma única vez.', tone: 'teal',
    extra: (
      <div className="ba-entry">
        <div><strong>BETTEX comprado → Titular</strong><p>Recebe a quantidade comprada, sem tarifa deduzida em tokens.</p></div>
        <div><strong>Custos de rede</strong><p><a href="#documentacao-taxas">No ALFA, apenas custos externos de rede</a>; custeio de manutenção em aberto.</p></div>
        <div data-testid="node-bettex-treasury"><strong>Preço USDC → Tesouraria BETTEX</strong><p>Recebe 100% do preço dos tokens da comunidade já liberados.</p></div>
      </div>
    ) },
];
const fig3: Step[] = [
  { title: 'Carteira BETTEX', text: 'O saldo deve estar confirmado e elegível na abertura. Entradas durante a rodada aguardam a próxima.', tone: 'blue' },
  { title: 'Auto staking', text: 'A participação na piscina fechada é automática. Sem ativação manual nem depósito adicional de tokens.', tone: 'gold', id: 'node-bettex-auto-staking' },
  { title: 'Rateio diário dos ganhos', text: 'O peso usa BETTEX elegível na abertura × duração integral da rodada UTC, sem saída. Quem entra durante a rodada recebe zero nessa rodada e aguarda a próxima. Qualquer saída de BETTEX, mesmo parcial, zera o peso e cancela créditos ainda não pagos. O recebido só fica disponível após confirmação e conciliação na Carteira USDC.', tone: 'teal' },
];
const fig4: Step[] = [
  { title: 'Tesouraria BETTEX', text: 'Mantém as reservas e a parcela investível, separadas dos saldos pessoais.', tone: 'gold' },
  { title: 'Agente de IA BETTEX', text: 'O smart contract aplica as permissões de movimentação da tesouraria. As análises da IA e os conectores de mercado operam fora da rede, respeitando essas permissões.', tone: 'blue', badge: 'Smart contract', id: 'node-bettex-ai-contract' },
  { title: 'Regras e autorizações', text: 'O contrato controla o acesso ao capital conforme reservas, limites e permissões. Não libera movimentações fora dessas regras.', tone: 'teal' },
];
const fig5: Step[] = [
  { title: 'Tesouraria BETTEX', text: 'Autoriza a parcela investível para a IA, com alocação dinâmica e respeito à reserva defensiva e aos limites de risco.', tone: 'gold' },
  { title: 'IA BETTEX', text: 'Opera dentro do mandato e após verificação independente de risco. Apura o resultado líquido conciliado, após custos conciliados, considerando posições abertas. Perdas são reconhecidas permanentemente, sem déficit a compensar com lucros de rodadas futuras.', tone: 'blue', badge: 'Análise e apuração' },
  { title: 'Reservas, liquidez e elegibilidade', text: 'Verifica reservas conforme política aprovada e caixa livre antes e após staking, transferência à carteira de recompra e custos projetados. A soma dos pesos elegíveis da rodada deve ser positiva.', tone: 'teal', badge: 'Condições antes do split', id: 'node-bettex-profit-split',
    extra: (
      <>
        <div className="ba-entry" data-testid="node-bettex-reserve-recovery">
          <div className="ba-split__treasury"><strong>Reserva ou liquidez insuficiente, ou soma dos pesos zero</strong><p>A rodada não paga. 100% do lucro fica na tesouraria, sem crédito ao staking nem alocação à carteira de recompras, nem liberação futura desse resultado. A rodada encerra sem acumular lucro ou pesos para outro rateio.</p></div>
        </div>
        <p>Somente com reserva e liquidez atendidas antes e após as saídas, lucro elegível positivo, posições conciliadas e soma dos pesos elegíveis positiva, aplica o split:</p>
        <div className="ba-entry ba-split" aria-label="Split permitido apenas com pesos elegíveis positivos, reserva e liquidez atendidas antes e após staking, transferência à carteira de recompra e custos projetados">
          <div className="ba-split__treasury"><strong>Tesouraria · 50%</strong><p>Retenção e reinvestimento de 50% do lucro distribuível.</p></div>
          <div className="ba-split__staking"><strong>Staking · 25%</strong><p>Parcela rateada entre participantes elegíveis. O pagamento confirmado entra na Carteira USDC, nunca na Carteira BETTEX.</p></div>
          <div className="ba-split__buyback"><strong>Carteira de recompras · 25%</strong><p>USDC segregado → compra autorizada de BETTEX → burn permanente de todos os tokens adquiridos.</p></div>
        </div>
      </>
    ) },
];
const fig6: Step[] = [
  { title: 'Parcela do staking', text: 'Parcela de 25% do lucro distribuível já separada no desenho 5, vinculada aos resultados e participantes elegíveis. Novos participantes não recebem lucros anteriores. Não há nova apuração ou novo split neste fluxo.', tone: 'blue' },
  { title: 'Confirmação e crédito na Carteira USDC', text: 'Direito identificado e autorizado na própria rodada. Uma autorização não libera saldo disponível. USDC transferido entra no disponível após confirmação e conciliação, sem crédito duplicado.', tone: 'teal' },
  { title: 'Saque de USDC do staking', text: 'Movimenta USDC recebido sem repetir a distribuição. No ALFA, apenas custos de rede informados separadamente do valor transferido. Sem pagamento em moeda local.' },
];
const fig7: Step[] = [
  { title: 'Agentes de IA', text: 'A IA BETTEX coordena agentes que analisam oportunidades e propõem operações nos mercados.', tone: 'blue',
    extra: (
      <div className="ba-entry" data-testid="node-agents-allora">
        <div><strong>Oráculo · Allora<DocumentationTechnologyCondition name="Allora" /></strong><p>Consulta opcional de inferências de IA para orientar estratégias de trading.</p></div>
      </div>
    ) },
  { title: 'Conexão por MCP ou API', text: 'Usam ferramentas MCP onde disponíveis ou APIs autorizadas, conforme os recursos de dados e execução de cada serviço.', tone: 'blue',
    extra: (
      <div className="ba-entry" data-testid="node-agents-market-connections">
        <div><strong>Polymarket<DocumentationTechnologyCondition name="Polymarket" /></strong><p>API de ordens · CLOB.</p></div>
        <div><strong>Robinhood<DocumentationTechnologyCondition name="Robinhood" /></strong><p>API de trading de cripto.</p></div>
      </div>
    ) },
  { title: 'Execução automática', text: 'As operações autorizadas são executadas automaticamente. Toda ordem passa pela aprovação independente de risco, limites e permissões antes do envio.', tone: 'gold', id: 'node-agents-automated-execution' },
];
const fig8: Step[] = [
  { title: 'Coleta de oportunidades', text: 'Os agentes coletam oportunidades nos quatro mercados: preços, probabilidades, liquidez, custos e sinais de IA, com origem e horário dos dados.', tone: 'blue', id: 'node-opportunities-collection' },
  { title: 'Escolha da melhor oportunidade', text: 'O agente BETTEX compara as alternativas e seleciona a melhor oportunidade segundo retorno esperado, custos, liquidez, exposição e risco. Registra os critérios e o motivo da escolha.', tone: 'blue', id: 'node-opportunities-decision' },
  { title: 'Investimento autorizado', text: 'A IA propõe o valor dentro da parcela investível autorizada. O risco verifica os limites e registra a reserva em uma decisão indivisível, considerando outras ordens. Antes do envio, revalida pelas regras vigentes, sem duplicar a reserva; só então segue para execução automática.', tone: 'gold', id: 'node-opportunities-investment' },
  { title: 'Registro público', text: 'Todas as transações têm registro aberto: horário, plataforma, ativo, quantidade, valores, custos, estado e referência auditável.', tone: 'teal', badge: 'Todas as transações', id: 'node-agents-public-transactions',
    extra: (
      <div className="ba-entry">
        <div><strong>Da oportunidade à transação</strong><p>Coleta, comparação, decisão, investimento, execução, resultado desconhecido, falhas, cancelamentos, liquidações e ajustes.</p></div>
      </div>
    ) },
];

export function BettexArchitecture({ surface = 'dark', heading = true, figure }: { surface?: Surface; heading?: boolean; figure?: ArchitectureFigureNumber }) {
  const captionId = figure ? `ba-caption-${figure}` : 'ba-caption';
  return (
    <figure className={`ba ba--${surface}`} data-testid={figure ? `diagram-bettex-flow-${figure}` : 'diagram-bettex-architecture'} aria-labelledby={captionId}>
      {heading && (
        <header className="ba__head">
           <p className="ba__eyebrow">Documentação v1 · arquitetura</p>
           <h3 className="ba__title">Oito fluxos da operação BETTEX.</h3>
        </header>
      )}
        <figcaption id={captionId} className={figure ? 'sr-only' : 'ba__note'}>{figure ? architectureFigureTitles[figure] : 'Modelo descrito na v1: conta e carteiras, compra de BETTEX, auto staking, conexão da tesouraria com a IA, operação dos mercados, distribuição dos ganhos, agentes e conexões, coleta de oportunidades, decisão de investimento e registro público de todas as transações.'}</figcaption>

      <div className="ba__figs">
        {(!figure || figure === '1') && <Figure {...figureMetadata['1']} num="1" title={architectureFigureTitles['1']}>
          <Steps steps={fig1} label="Criação da conta, criação das carteiras USDC e BETTEX e compra por swap" />
        </Figure>}

        {(!figure || figure === '2') && <Figure {...figureMetadata['2']} num="2" title={architectureFigureTitles['2']}>
          <Steps steps={fig2} label="Compra da venda pública: USDC disponível, cotação e confirmação do swap, entrega de BETTEX e envio de USDC à tesouraria" />
          <p className="ba-fig__foot">Este fluxo não representa revenda entre titulares. Numa revenda, o pagamento vai ao vendedor, sem nova captação para a tesouraria.</p>
          <div className="ba-flow ba-flow--treasury">
            <p className="ba-flow__label">Tesouraria BETTEX · reservas do valor recebido</p>
            <div className="ba-entry ba-reserves" data-testid="node-bettex-reserves">
              <div><strong>Reserva defensiva</strong><p>Ativos efetivamente segregados conforme política aprovada, sem percentual geral fixado em 50%.</p></div>
              <div><strong>Parcela investível</strong><p>Alocação dinâmica conforme oportunidades, liquidez e limites de risco.</p></div>
            </div>
            <p className="ba-fig__foot">O algoritmo analisa oportunidades em previsões, ações e cripto, esportes e iGaming e distribui a parcela investível conforme as melhores oportunidades identificadas. As estratégias incluem surebet nos esportes, com comparação de odds e cobertura dos resultados entre casas, e bonus hunting (mineração de bônus) no iGaming, com análise das promoções, requisitos de aposta e elegibilidade. A alocação é dinâmica, sem percentuais fixos por mercado, preservando a reserva defensiva e a verificação independente de risco.</p>
          </div>
          <p className="ba-fig__foot">O mint inicial aberto de 10% tem preço fixo e financia o projeto. O swap oficial vende tokens da comunidade, destinação separada de 55%, já liberados no vesting de 24 meses: 100% do preço em USDC vai à tesouraria. Venda direta a corretoras respeita a mesma agenda. O fundador decide a destinação de sua parcela após liberação. Mercados externos não herdam automaticamente as condições do swap; USDC pessoal não gasto continua fora da tesouraria.</p>
        </Figure>}

        {(!figure || figure === '3') && <Figure {...figureMetadata['3']} num="3" title={architectureFigureTitles['3']}>
          <Steps steps={fig3} label="BETTEX disponível na carteira, auto staking e rateio diário por quantidade e tempo, pago na Carteira USDC" />
        </Figure>}

        {(!figure || figure === '4') && <Figure {...figureMetadata['4']} num="4" title={architectureFigureTitles['4']}>
          <Steps steps={fig4} label="Tesouraria BETTEX conectada ao agente de IA por contrato inteligente e suas autorizações" />
          <p className="ba-fig__foot">O contrato aplica reservas, limites e permissões à movimentação do capital.</p>
          <p className="ba-fig__foot">A IA propõe mudanças de políticas; a administração aprova versões que passam pelos controles e espera aplicáveis. Investimentos já mandatados seguem risco independente, sem assinatura por ordem. <a href="#documentacao-governanca">Governança</a> detalha política, custódia e execução, separadas da autocustódia pessoal.</p>
        </Figure>}

        {(!figure || figure === '5') && <Figure {...figureMetadata['5']} num="5" title={architectureFigureTitles['5']}>
          <Steps steps={fig5} label="IA apura lucro, verifica reservas, liquidez e pesos elegíveis; se alguma condição falhar, retém 100% sem split; com condições atendidas aplica 50% tesouraria, 25% staking e 25% carteira de recompras" />
          <p className="ba-fig__foot">Reserva ou liquidez insuficiente mantém 100% do lucro na tesouraria, sem split ou liberação futura. Com conciliação e condições atendidas, o resultado elegível recebe 50% tesouraria, 25% staking e 25% carteira de recompra. O USDC da recompra pode acumular; sua compra exige autorização da administração e todo BETTEX adquirido segue para queima permanente. A carteira não financia estratégias, distribuições ou despesas, nem conta como reserva defensiva.</p>
          <p className="ba-fig__foot">Perdas reconhecidas são permanentes: não criam déficit a recuperar com resultados futuros. A reserva defensiva e a liquidez continuam obrigatórias. Cada lucro, perda, obrigação e pagamento é registrado uma única vez. Lucros anteriores não entram no rateio de novos participantes.</p>
        </Figure>}

        {(!figure || figure === '6') && <Figure {...figureMetadata['6']} num="6" title={architectureFigureTitles['6']}>
          <Steps steps={fig6} label="Parcela do staking já separada pela IA, distribuição pendente até recebimento confirmado na Carteira USDC e saque do USDC recebido" />
          <p className="ba-fig__foot">O registro do direito à distribuição não é saldo on-chain recebido. A obrigação e o posterior pagamento têm efeito único na apuração; a interface não soma o pendente ao saldo já recebido. Custos de rede são identificados separadamente.</p>
          <p className="ba-fig__foot"><a href="#figure-bettex-risk">Ver condições do split no desenho 5</a>.</p>
        </Figure>}

        {(!figure || figure === '7') && <Figure {...figureMetadata['7']} num="7" title={architectureFigureTitles['7']}>
          <Steps steps={fig7} label="Agentes de IA com inferências opcionais da Allora, conexões MCP ou API com mercados e execução autorizada automática" />
          <p className="ba-fig__foot"><DocumentationTechnologyCondition name="Allora" prefix />Allora fornece inferências para análise, não executa ordens. Cada conexão usa apenas as ferramentas de consulta ou execução oferecidas e autorizadas pelo serviço.</p>
          <p className="ba-fig__foot">Antes de qualquer envio, a verificação de limites e a reserva de capital são indivisíveis no núcleo central, compartilhado pelos agentes e conectores. Ordens simultâneas não reutilizam o mesmo capital.</p>
          <p className="ba-fig__foot"><a href="#figure-bettex-opportunities">O desenho 8 detalha o ciclo de coleta de oportunidades, escolha, investimento e registro público das transações.</a></p>
        </Figure>}

        {(!figure || figure === '8') && <Figure {...figureMetadata['8']} num="8" title={architectureFigureTitles['8']}>
          <Steps steps={fig8} stacked label="Coleta de oportunidades nos mercados, comparação e decisão pela melhor oportunidade, investimento automático autorizado e registro público de toda a rodada" />
          <p className="ba-fig__foot">O registro permite acompanhar quais oportunidades foram coletadas, quais foram selecionadas ou descartadas, os motivos da decisão e o valor investido. A escolha e a alocação são dinâmicas, sem parcelas fixas por mercado; somente operações aprovadas pelo risco seguem para investimento.</p>
          <p className="ba-fig__foot">Sem resposta conclusiva após o envio, o resultado permanece desconhecido: capital e exposição continuam comprometidos, sem reenvio automático. Cancelamento solicitado não libera recursos; somente a parcela comprovadamente livre após conciliação pode ser liberada. Execução parcial é registrada uma vez, mantendo reservado o restante incerto.</p>
          <p className="ba-fig__foot">Cada compromisso autorizado com reserva registrada conta uma vez no dia UTC original. Cancelamento confirmado pode liberar caixa e exposição, mas não devolve o teto diário consumido. A mudança do dia não libera ordens antigas nem as conta novamente.</p>
          <p className="ba-fig__foot">O registro aberto cobre todas as transações do projeto: vendas de tokens, operações de mercado, movimentações da tesouraria, distribuições e saques. Chaves privadas, credenciais e dados pessoais não são publicados.</p>
          <p className="ba-fig__foot">Resultados conciliados seguem para o desenho 5: se faltar reserva, liquidez ou peso elegível, a rodada não paga e 100% do lucro fica na tesouraria, sem liberação futura. Uma rodada posterior considera apenas seus próprios resultados. Isso não altera o vesting: quantidades e meses seguem a liberação predefinida de 24 meses, sem decisão discricionária da gestão. O mint inicial fica separado dessa agenda.</p>
        </Figure>}
      </div>
    </figure>
  );
}

export function BettexFlow({ figure, children }: { figure: ArchitectureFigureNumber; children?: ReactNode }) {
  const { id, lead } = figureMetadata[figure];
  return <section className="documentation-figure-topic" data-documentation-figure-topic={figure}>
    <h3 className="whitepaper__subhead" id={`${id}-t`}>{architectureFigureTitles[figure]}</h3>
    <div className="whitepaper__prose"><p>{lead}</p></div>
    {children}
    <FigureHeaderContext.Provider value={false}>
      <BettexArchitecture surface="dark" heading={false} figure={figure} />
    </FigureHeaderContext.Provider>
  </section>;
}

export default BettexArchitecture;
