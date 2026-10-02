import { type ReactNode } from 'react';
import { ArchitectureIntegrations, type ArchitectureFigureNumber } from './ArchitectureIntegrations';
import './BettexArchitecture.css';

type Surface = 'dark' | 'paper';
type Tone = 'blue' | 'gold' | 'teal' | 'plain';

interface Step { title: string; text: string; tone?: Tone; badge?: string; id?: string; extra?: ReactNode }

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
  return (
    <section className="ba-fig" id={id} data-testid={id} aria-labelledby={`${id}-t`}>
      <header className="ba-fig__head">
        <span className="ba-fig__num">Desenho {num} de 8</span>
        <h4 id={`${id}-t`}>{title}</h4>
        <p>{lead}</p>
      </header>
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
  { title: 'Compra BETTEX', text: 'Usa USDC da Carteira USDC. A compra confirmada entrega os tokens na Carteira BETTEX.', tone: 'gold', badge: 'Swap', id: 'node-bettex-swap',
    extra: <div className="ba-swap" aria-label="Troca de USDC por BETTEX"><span>USDC</span><span aria-hidden="true">→</span><span>BETTEX</span></div> },
];
const fig2: Step[] = [
  { title: 'Carteira USDC', text: 'A pessoa usa o USDC disponível e confirmado para pagar a compra de BETTEX.', tone: 'blue' },
  { title: 'Confirma o swap', text: 'Confere o preço em USDC, a quantidade de BETTEX, os custos e o valor líquido antes de confirmar a compra.', tone: 'gold', id: 'node-treasury-swap',
    extra: <div className="ba-swap" aria-label="Compra de BETTEX com USDC"><span>USDC</span><span aria-hidden="true">→</span><span>BETTEX</span></div> },
  { title: 'Compra liquidada', text: 'Após confirmação, o débito de USDC e o crédito de BETTEX são registrados juntos e uma única vez.', tone: 'teal',
    extra: (
      <div className="ba-entry">
        <div><strong>BETTEX → Carteira BETTEX</strong><p>Recebe os tokens comprados.</p></div>
        <div data-testid="node-bettex-treasury"><strong>USDC → Tesouraria BETTEX</strong><p>Recebe o USDC usado na compra.</p></div>
      </div>
    ) },
];
const fig3: Step[] = [
  { title: 'Carteira BETTEX', text: 'Todo BETTEX disponível na carteira oficial do projeto conta a partir da confirmação do saldo.', tone: 'blue' },
  { title: 'Auto staking', text: 'A participação na piscina fechada é automática. Sem ativação manual nem depósito adicional de tokens.', tone: 'gold', id: 'node-bettex-auto-staking' },
  { title: 'Próxima rodada de ganhos', text: 'BETTEX em staking participa da próxima rodada. Precisa permanecer em staking até o pagamento, que é creditado na Carteira USDC.', tone: 'teal' },
];
const fig4: Step[] = [
  { title: 'Tesouraria BETTEX', text: 'Mantém as reservas e a parcela investível, separadas dos saldos pessoais.', tone: 'gold' },
  { title: 'Agente de IA BETTEX', text: 'Contrato inteligente que vincula a operação da IA às regras de movimentação da tesouraria.', tone: 'blue', badge: 'Smart contract', id: 'node-bettex-ai-contract' },
  { title: 'Regras e autorizações', text: 'O contrato controla o acesso ao capital conforme reservas, limites e permissões. Não libera movimentações fora dessas regras.', tone: 'teal' },
];
const fig5: Step[] = [
  { title: 'Tesouraria BETTEX', text: 'Autoriza a parcela investível para a IA, com alocação dinâmica e respeito à reserva defensiva e aos limites de risco.', tone: 'gold' },
  { title: 'IA BETTEX', text: 'Analisa oportunidades e opera após aprovação independente de risco. Apura o lucro líquido realizado, após custos, perdas anteriores e conciliação.', tone: 'blue', badge: 'Análise e operação' },
  { title: 'Reservas antes do split', text: 'Antes de distribuir qualquer lucro, a IA verifica se as reservas exigidas da tesouraria estão atendidas.', tone: 'teal', badge: 'Prioridade às reservas', id: 'node-bettex-profit-split',
    extra: (
      <>
        <div className="ba-entry" data-testid="node-bettex-reserve-recovery">
          <div className="ba-split__treasury"><strong>Reservas insuficientes</strong><p>100% do lucro líquido retorna à tesouraria para recompor as reservas. Não há pagamento ao staking nessa apuração.</p></div>
        </div>
        <p>Somente com reservas atendidas, aplica o split:</p>
        <div className="ba-entry ba-split" aria-label="Split permitido apenas com reservas da tesouraria atendidas">
          <div className="ba-split__treasury"><strong>Tesouraria · 75%</strong><p>Recebe a parcela restante do lucro líquido.</p></div>
          <div className="ba-split__staking"><strong>Staking · 25%</strong><p>Pago na Carteira USDC dos participantes elegíveis, nunca na Carteira BETTEX.</p></div>
        </div>
      </>
    ) },
];
const fig6: Step[] = [
  { title: 'Parcela do staking', text: 'Parcela já separada pela IA no desenho 5, somente com lucro distribuível e reservas atendidas. Segue diretamente para os participantes elegíveis.', tone: 'blue' },
  { title: 'Crédito na Carteira USDC', text: 'A IA credita automaticamente a parcela individual na Carteira USDC, uma única vez. Nunca na Carteira BETTEX de staking.', tone: 'teal' },
  { title: 'Saque em USDC', text: 'Transferência para carteira compatível, com custos e valor líquido informados. Sem pagamento em moeda local.' },
];
const fig7: Step[] = [
  { title: 'Agentes de IA', text: 'A IA BETTEX coordena agentes que analisam oportunidades e propõem operações nos mercados.', tone: 'blue',
    extra: (
      <div className="ba-entry" data-testid="node-agents-allora">
        <div><strong>Oráculo · Allora</strong><p>Consulta opcional de inferências de IA para orientar estratégias de trading.</p></div>
      </div>
    ) },
  { title: 'Conexão por MCP ou API', text: 'Usam ferramentas MCP onde disponíveis ou APIs autorizadas, conforme os recursos de dados e execução de cada serviço.', tone: 'blue',
    extra: (
      <div className="ba-entry" data-testid="node-agents-market-connections">
        <div><strong>Polymarket</strong><p>API de ordens · CLOB.</p></div>
        <div><strong>Robinhood</strong><p>API de trading de cripto.</p></div>
      </div>
    ) },
  { title: 'Execução automática', text: 'As operações autorizadas são executadas automaticamente. Toda ordem passa pela aprovação independente de risco, limites e permissões antes do envio.', tone: 'gold', id: 'node-agents-automated-execution' },
];
const fig8: Step[] = [
  { title: 'Coleta de oportunidades', text: 'Os agentes coletam oportunidades nos quatro mercados: preços, probabilidades, liquidez, custos e sinais de IA, com origem e horário dos dados.', tone: 'blue', id: 'node-opportunities-collection' },
  { title: 'Escolha da melhor oportunidade', text: 'A IA compara as alternativas e escolhe a mais vantajosa segundo retorno esperado, custos, liquidez, exposição e risco. Registra os critérios e o motivo da escolha.', tone: 'blue', id: 'node-opportunities-decision' },
  { title: 'Investimento autorizado', text: 'A IA propõe o valor dentro da parcela investível autorizada. O risco valida a operação e o valor; só então o investimento é executado automaticamente, preservando reservas e limites.', tone: 'gold', id: 'node-opportunities-investment' },
  { title: 'Registro público', text: 'Todas as transações têm registro aberto: horário, plataforma, ativo, quantidade, valores, custos, estado e referência auditável.', tone: 'teal', badge: 'Todas as transações', id: 'node-agents-public-transactions',
    extra: (
      <div className="ba-entry">
        <div><strong>Da oportunidade à transação</strong><p>Coleta, comparação, decisão, investimento, execução, falhas, cancelamentos, liquidações e ajustes.</p></div>
      </div>
    ) },
];

export function BettexArchitecture({ surface = 'dark', heading = true }: { surface?: Surface; heading?: boolean }) {
  return (
    <figure className={`ba ba--${surface}`} data-testid="diagram-bettex-architecture" aria-labelledby="ba-caption">
      {heading && (
        <header className="ba__head">
           <p className="ba__eyebrow">Documentação v1 · arquitetura</p>
           <h3 className="ba__title">Oito fluxos da operação BETTEX.</h3>
        </header>
      )}
       <figcaption id="ba-caption" className="ba__note">Modelo descrito na v1: conta e carteiras, compra de BETTEX, auto staking, conexão da tesouraria com a IA, operação dos mercados, distribuição dos ganhos, agentes e conexões, coleta de oportunidades, decisão de investimento e registro público de todas as transações.</figcaption>

      <div className="ba__figs">
        <Figure id="figure-bettex-wallet" num="1" title="Conta, carteiras e compra de BETTEX" lead="Cria a conta, recebe as duas carteiras e compra BETTEX por swap.">
          <Steps steps={fig1} label="Criação da conta, criação das carteiras USDC e BETTEX e compra por swap" />
        </Figure>

        <Figure id="figure-bettex-deposit" num="2" title="Como comprar BETTEX usando USDC" lead="O swap usa a Carteira USDC: BETTEX vai para a Carteira BETTEX e o USDC da compra vai para a tesouraria.">
          <Steps steps={fig2} label="USDC disponível, cotação e confirmação do swap, entrega de BETTEX e envio de USDC à tesouraria" />
          <div className="ba-flow ba-flow--treasury">
            <p className="ba-flow__label">Tesouraria BETTEX · reservas do valor recebido</p>
            <div className="ba-entry ba-reserves" data-testid="node-bettex-reserves">
              <div><strong>50% · Reserva defensiva</strong><p>Aplicada em estratégias de baixo risco para gerar yield mensal.</p></div>
              <div><strong>50% · Parcela investível</strong><p>Alocada dinamicamente pelo algoritmo conforme as oportunidades e os limites de risco.</p></div>
            </div>
            <p className="ba-fig__foot">O algoritmo analisa oportunidades em previsões, ações e cripto, esportes e cassinos e distribui a parcela investível conforme as melhores oportunidades identificadas. As estratégias previstas incluem surebet nos esportes, com comparação de odds e cobertura dos resultados entre casas, e bonus hunting (mineração de bônus) em cassinos, com análise das promoções, requisitos de aposta e elegibilidade. A alocação é ajustada segundo as análises, sem percentuais fixos por mercado, preservando a reserva defensiva e a aprovação independente de risco.</p>
          </div>
          <p className="ba-fig__foot">A disponibilidade de tokens para venda pública segue a liberação mensal predefinida no vesting de 36 meses, não decisões discricionárias da gestão conforme as reservas. 100% do USDC da venda pública vai à tesouraria. Os aportes ligados à parcela de 15% dos investidores são separados: 50% para a tesouraria e 50% para capital inicial e desenvolvimento. O fundador decide livremente o destino de seus 20% após a liberação, inclusive distribuir ao time, manter em staking ou vender. O USDC pessoal não usado na compra continua separado da tesouraria.</p>
        </Figure>

        <Figure id="figure-bettex-staking" num="3" title="Auto staking na Carteira BETTEX" lead="BETTEX disponível na carteira participa automaticamente. USDC não entra no cálculo do staking.">
          <Steps steps={fig3} label="BETTEX disponível na carteira, auto staking e próxima rodada paga na Carteira USDC" />
          <p className="ba-fig__foot">Se o BETTEX for retirado antes do pagamento, não recebe essa rodada. Se entrar depois, participa da próxima, sem receber rodadas anteriores. Os ganhos são pagos sempre na Carteira USDC, nunca na Carteira BETTEX de staking.</p>
          <p className="ba-fig__foot">A piscina exige acesso ao aplicativo, mas não uma sessão continuamente aberta.</p>
        </Figure>

        <Figure id="figure-bettex-ai-contract" num="4" title="Tesouraria conectada ao agente de IA BETTEX" lead="O smart contract do agente de IA BETTEX conecta a tesouraria às regras de operação e autorização do capital.">
          <Steps steps={fig4} label="Tesouraria BETTEX conectada ao agente de IA por contrato inteligente e suas autorizações" />
          <p className="ba-fig__foot">O contrato aplica reservas, limites e permissões à movimentação do capital.</p>
        </Figure>

        <Figure id="figure-bettex-risk" num="5" title="Tesouraria, reservas e split dos ganhos" lead="Tesouraria → IA BETTEX → verifica reservas: retorna o lucro à tesouraria ou libera o split.">
          <Steps steps={fig5} label="IA apura lucro, verifica reservas e retorna 100% à tesouraria se insuficientes; só com reservas atendidas aplica o split de 75% para tesouraria e 25% para staking" />
          <p className="ba-fig__foot">A recomposição das reservas tem prioridade sobre o staking. Se a tesouraria estiver abaixo das reservas exigidas, todo o lucro líquido dessa apuração retorna à tesouraria, sem pagamento ao staking. Somente com as reservas atendidas e as demais condições cumpridas, a IA aplica o split diretamente, sem enviar todo o lucro primeiro à tesouraria. O lucro líquido é realizado e conciliado, após custos e perdas anteriores; o capital investido não entra no split.</p>
        </Figure>

        <Figure id="figure-bettex-payout" num="6" title="Da parcela do staking ao saque em USDC" lead="Depois do split do desenho 5: parcela do staking → Carteira USDC → saque em USDC.">
          <Steps steps={fig6} label="Parcela do staking já separada pela IA, crédito na Carteira USDC e saque em USDC" />
        </Figure>

        <Figure id="figure-bettex-agents" num="7" title="Agentes de IA e conexões com os mercados" lead="Agentes de IA → conexões por MCP ou API → execução automática das operações autorizadas.">
          <Steps steps={fig7} label="Agentes de IA com inferências opcionais da Allora, conexões MCP ou API com mercados e execução autorizada automática" />
          <p className="ba-fig__foot">Allora fornece inferências para análise, não executa ordens. Cada conexão usa apenas as ferramentas de consulta ou execução oferecidas e autorizadas pelo serviço.</p>
          <p className="ba-fig__foot">O desenho 8 detalha o ciclo de coleta de oportunidades, escolha, investimento e registro público das transações.</p>
        </Figure>

        <Figure id="figure-bettex-opportunities" num="8" title="Da coleta de oportunidades ao investimento e registro público" lead="Coleta oportunidades → compara e escolhe a melhor → investe com autorização → registra todo o ciclo abertamente.">
          <Steps steps={fig8} stacked label="Coleta de oportunidades nos mercados, comparação e decisão pela melhor oportunidade, investimento automático autorizado e registro público de todo o ciclo" />
          <p className="ba-fig__foot">O registro permite acompanhar quais oportunidades foram coletadas, quais foram selecionadas ou descartadas, os motivos da decisão e o valor investido. A escolha e a alocação são dinâmicas, sem parcelas fixas por mercado; somente operações aprovadas pelo risco seguem para investimento.</p>
          <p className="ba-fig__foot">O registro aberto cobre todas as transações do projeto: vendas de tokens, operações de mercado, movimentações da tesouraria, distribuições e saques. Chaves privadas, credenciais e dados pessoais não são publicados.</p>
          <p className="ba-fig__foot">Resultados conciliados seguem para a verificação de reservas do desenho 5: se insuficientes, o lucro retorna integralmente à tesouraria; somente com reservas atendidas há split para o staking. Essa verificação rege a distribuição do lucro, não a liberação de tokens: as quantidades e os meses seguem o vesting predefinido de 36 meses, sem decisão discricionária da gestão.</p>
        </Figure>
      </div>
    </figure>
  );
}

export default BettexArchitecture;
