import { type ReactNode } from 'react';
import { ArchitectureIntegrations, type ArchitectureFigureNumber } from './ArchitectureIntegrations';
import './BettexArchitecture.css';

type Surface = 'dark' | 'paper';
type Tone = 'blue' | 'gold' | 'teal' | 'plain';

interface Step { title: string; text: string; tone?: Tone; badge?: string; id?: string; extra?: ReactNode }

export const architectureFigureTitles: Record<ArchitectureFigureNumber, string> = {
  '1': 'Conta, carteiras e compra de BETTEX',
  '2': 'Compra na venda pública usando USDC',
  '3': 'Auto staking na Carteira BETTEX',
  '4': 'Tesouraria conectada ao agente de IA BETTEX',
  '5': 'Tesouraria, reservas e split dos ganhos',
  '6': 'Da parcela do staking ao saque em USDC',
  '7': 'Agentes de IA e conexões com os mercados',
  '8': 'Da coleta de oportunidades ao investimento e registro público',
};

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
  { title: 'Compra BETTEX', text: 'Usa USDC na venda pública do projeto. Após confirmação, recebe os BETTEX comprados; a tarifa separada de US$ 2,50 é paga em USDC à entidade.', tone: 'gold', badge: 'Swap', id: 'node-bettex-swap',
    extra: <div className="ba-swap" aria-label="Troca de USDC por BETTEX"><span>USDC</span><span aria-hidden="true">→</span><span>BETTEX</span></div> },
];
const fig2: Step[] = [
  { title: 'Carteira USDC', text: 'A pessoa usa o USDC disponível e confirmado para comprar BETTEX da venda pública do projeto.', tone: 'blue' },
  { title: 'Confirma o swap', text: 'Confere preço dos tokens, quantidade adquirida, tarifa fixa de US$ 2,50 paga em USDC e custos externos. A tarifa vai ao caixa operacional, sem dedução ou queima de BETTEX. Valores e destinos precedem a autorização.', tone: 'gold', id: 'node-treasury-swap',
    extra: <div className="ba-swap" aria-label="Compra de BETTEX com USDC"><span>USDC</span><span aria-hidden="true">→</span><span>BETTEX</span></div> },
  { title: 'Compra liquidada', text: 'Preço e tarifa em USDC têm destinos separados; o crédito dos BETTEX comprados e os débitos são conciliados juntos uma única vez.', tone: 'teal',
    extra: (
      <div className="ba-entry">
        <div><strong>BETTEX comprado → Titular</strong><p>Recebe a quantidade comprada, sem tarifa deduzida em tokens.</p></div>
        <div><strong>Tarifa USDC → Caixa operacional</strong><p>US$ 2,50 em carteira separada, de propriedade da entidade.</p></div>
        <div data-testid="node-bettex-treasury"><strong>Preço USDC → Tesouraria BETTEX</strong><p>Recebe 100% do preço dos tokens da venda pública, separado da tarifa.</p></div>
      </div>
    ) },
];
const fig3: Step[] = [
  { title: 'Carteira BETTEX', text: 'Todo BETTEX disponível na carteira oficial do projeto conta a partir da confirmação do saldo.', tone: 'blue' },
  { title: 'Auto staking', text: 'A participação na piscina fechada é automática. Sem ativação manual nem depósito adicional de tokens.', tone: 'gold', id: 'node-bettex-auto-staking' },
  { title: 'Rateio diário dos ganhos', text: 'A participação usa BETTEX disponível × tempo elegível na rodada UTC. Qualquer saída de BETTEX, mesmo parcial, zera todo o peso anterior e cancela os créditos do ciclo acumulados até a saída e ainda não pagos. Novas entradas não recebem lucros anteriores. O recebido só fica disponível após confirmação e conciliação na Carteira USDC.', tone: 'teal' },
];
const fig4: Step[] = [
  { title: 'Tesouraria BETTEX', text: 'Mantém as reservas e a parcela investível, separadas dos saldos pessoais.', tone: 'gold' },
  { title: 'Agente de IA BETTEX', text: 'O smart contract aplica as permissões de movimentação da tesouraria. As análises da IA e os conectores de mercado operam fora da rede, respeitando essas permissões.', tone: 'blue', badge: 'Smart contract', id: 'node-bettex-ai-contract' },
  { title: 'Regras e autorizações', text: 'O contrato controla o acesso ao capital conforme reservas, limites e permissões. Não libera movimentações fora dessas regras.', tone: 'teal' },
];
const fig5: Step[] = [
  { title: 'Tesouraria BETTEX', text: 'Autoriza a parcela investível para a IA, com alocação dinâmica e respeito à reserva defensiva e aos limites de risco.', tone: 'gold' },
  { title: 'IA BETTEX', text: 'Opera dentro do mandato e após verificação independente de risco. Apura o resultado líquido conciliado, após custos e tributos, considerando posições abertas. Perdas são reconhecidas permanentemente, sem déficit a compensar com lucros de rodadas futuras.', tone: 'blue', badge: 'Análise e apuração' },
  { title: 'Reservas, liquidez e elegibilidade', text: 'Verifica reserva defensiva mínima inicial de 50% do patrimônio líquido atualizado e caixa livre suficiente, antes e após a distribuição projetada. A soma dos pesos elegíveis da rodada deve ser positiva.', tone: 'teal', badge: 'Condições antes do split', id: 'node-bettex-profit-split',
    extra: (
      <>
        <div className="ba-entry" data-testid="node-bettex-reserve-recovery">
          <div className="ba-split__treasury"><strong>Reserva ou liquidez insuficiente, ou soma dos pesos zero</strong><p>A rodada não paga. 100% do lucro fica na tesouraria, sem crédito ao staking nem liberação futura desse resultado. A rodada encerra sem acumular lucro ou pesos para outro rateio.</p></div>
        </div>
        <p>Somente com tributos aplicáveis validados e reconhecidos, reserva e liquidez atendidas antes e após a distribuição projetada, lucro elegível positivo, posições conciliadas e soma dos pesos elegíveis positiva, aplica o split sobre o valor elegível:</p>
        <div className="ba-entry ba-split" aria-label="Split permitido apenas com pesos elegíveis positivos, reserva e liquidez atendidas antes e após a distribuição projetada">
          <div className="ba-split__treasury"><strong>Tesouraria · 75%</strong><p>Recebe 75% do lucro elegível ao split.</p></div>
          <div className="ba-split__staking"><strong>Staking · 25%</strong><p>Parcela bruta rateada entre participantes elegíveis. Retenções fiscais precedem o pagamento líquido na Carteira USDC, nunca na Carteira BETTEX.</p></div>
        </div>
      </>
    ) },
];
const fig6: Step[] = [
  { title: 'Parcela do staking', text: 'Parcela de 25% já separada no desenho 5, vinculada aos resultados e participantes elegíveis. Novos participantes não recebem lucros anteriores. Não há nova apuração ou novo split neste fluxo.', tone: 'blue' },
  { title: 'Retenção e crédito na Carteira USDC', text: 'O direito bruto apurado fica identificado. Quando exigidas, retenções fiscais são reservadas antes do pagamento; a IA transfere somente o líquido. Após confirmação e conciliação, o recebido entra no saldo disponível, sem liquidar novamente o tributo reservado.', tone: 'teal' },
  { title: 'Saque de USDC do staking', text: 'Movimenta USDC recebido sem repetir a distribuição. A tarifa fixa de US$ 2,50 é paga em USDC ao caixa operacional, com dedução autorizada e líquido discriminado. Custos externos e retenções aplicáveis são separados. Sem pagamento em moeda local.' },
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
        {(!figure || figure === '1') && <Figure id="figure-bettex-wallet" num="1" title={architectureFigureTitles['1']} lead="Cria a conta, recebe as duas carteiras e compra BETTEX por swap.">
          <Steps steps={fig1} label="Criação da conta, criação das carteiras USDC e BETTEX e compra por swap" />
        </Figure>}

        {(!figure || figure === '2') && <Figure id="figure-bettex-deposit" num="2" title={architectureFigureTitles['2']} lead="Neste desenho, o vendedor é o projeto: BETTEX vai para a Carteira BETTEX; 100% do preço pago em USDC vai à tesouraria, enquanto a tarifa vai ao caixa operacional separado.">
          <Steps steps={fig2} label="Compra da venda pública: USDC disponível, cotação e confirmação do swap, entrega de BETTEX e envio de USDC à tesouraria" />
          <p className="ba-fig__foot">Este fluxo não representa revenda entre titulares. Numa revenda, o pagamento vai ao vendedor, sem nova captação para a tesouraria. As tarifas confirmadas de compra primária, saque USDC e envio autônomo BETTEX são pagas em USDC; não atribuir tarifa primária a toda revenda.</p>
          <div className="ba-flow ba-flow--treasury">
            <p className="ba-flow__label">Tesouraria BETTEX · reservas do valor recebido</p>
            <div className="ba-entry ba-reserves" data-testid="node-bettex-reserves">
              <div><strong>50% · Reserva defensiva</strong><p>Mínimo inicial sobre o patrimônio líquido atualizado. Ativos segregados de baixo risco, com objetivo de yield mensal, sem rendimento garantido.</p></div>
              <div><strong>50% · Parcela investível</strong><p>Alocada dinamicamente pelo algoritmo conforme as oportunidades e os limites de risco.</p></div>
            </div>
            <p className="ba-fig__foot">O algoritmo analisa oportunidades em previsões, ações e cripto, esportes e cassinos e distribui a parcela investível conforme as melhores oportunidades identificadas. As estratégias incluem surebet nos esportes, com comparação de odds e cobertura dos resultados entre casas, e bonus hunting (mineração de bônus) em cassinos, com análise das promoções, requisitos de aposta e elegibilidade. A alocação é dinâmica, sem percentuais fixos por mercado, preservando a reserva defensiva e a verificação independente de risco.</p>
          </div>
          <p className="ba-fig__foot">A disponibilidade de tokens para venda pública segue a liberação mensal predefinida no vesting de 36 meses, não decisões discricionárias da gestão conforme as reservas. A parcela de 65% pode ser vendida diretamente a corretoras para formar a tesouraria, sem depender de swaps; 100% do USDC recebido nessas vendas vai à tesouraria. Os aportes ligados à parcela de 15% dos investidores são separados: 50% para a tesouraria e 50% para capital inicial e desenvolvimento. O fundador decide livremente o destino de seus 20% após a liberação, inclusive distribuir ao time, manter em staking ou vender. O USDC pessoal não usado na compra continua separado da tesouraria.</p>
        </Figure>}

        {(!figure || figure === '3') && <Figure id="figure-bettex-staking" num="3" title={architectureFigureTitles['3']} lead="BETTEX disponível na carteira participa automaticamente. USDC não entra no cálculo do staking.">
          <Steps steps={fig3} label="BETTEX disponível na carteira, auto staking e rateio diário por quantidade e tempo, pago na Carteira USDC" />
          <p className="ba-fig__foot">Qualquer saída de BETTEX cancela todos os créditos anteriores ainda não pagos do ciclo, inclusive os autorizados, e zera todo o peso anterior. Entradas contam a partir da confirmação do saldo e nunca recebem lucros anteriores à sua elegibilidade. O rateio usa o peso individual elegível dividido pela soma dos pesos elegíveis correspondentes. Os ganhos são pagos sempre na Carteira USDC, nunca na Carteira BETTEX.</p>
          <p className="ba-fig__foot">A piscina exige acesso ao aplicativo, mas não uma sessão continuamente aberta.</p>
          <p className="ba-fig__foot">Soma dos pesos elegíveis zero impede o split e mantém 100% na tesouraria. Qualquer saída, mesmo parcial, cancela todos os créditos anteriores ainda não pagos do ciclo e zera o peso acumulado.</p>
          <p className="ba-fig__foot">Cada rodada é única: paga ou não paga. Lucro não distribuído fica na tesouraria e não retorna ao rateio. Resultados e pesos de rodadas diferentes nunca são somados para pagamento.</p>
        </Figure>}

        {(!figure || figure === '4') && <Figure id="figure-bettex-ai-contract" num="4" title={architectureFigureTitles['4']} lead="O smart contract do agente de IA BETTEX conecta a tesouraria às regras de operação e autorização do capital.">
          <Steps steps={fig4} label="Tesouraria BETTEX conectada ao agente de IA por contrato inteligente e suas autorizações" />
          <p className="ba-fig__foot">O contrato aplica reservas, limites e permissões à movimentação do capital.</p>
          <p className="ba-fig__foot">A IA sugere alterações de regras e limites numa fila. A liderança da Fundação BETTEX aprova as mudanças; a regra anterior permanece vigente até a execução da alteração aprovada, sem efeito retroativo em rodadas apuradas. Investimentos dentro do mandato seguem os controles independentes de risco, sem aprovação humana de cada ordem. A custódia institucional por multisig permanece separada da autocustódia das carteiras pessoais.</p>
        </Figure>}

        {(!figure || figure === '5') && <Figure id="figure-bettex-risk" num="5" title={architectureFigureTitles['5']} lead="Tesouraria → IA BETTEX → verifica reservas, liquidez e pesos elegíveis: retém o lucro ou libera o split.">
          <Steps steps={fig5} label="IA apura lucro, verifica reservas, liquidez e pesos elegíveis; se alguma condição falhar, retém 100% sem split; com condições atendidas aplica 75% para tesouraria e 25% para staking" />
          <p className="ba-fig__foot">A recomposição das reservas tem prioridade sobre o staking. Com reserva ou liquidez insuficiente, 100% do lucro líquido fica na tesouraria, sem staking nem distribuição de um saldo restante na mesma apuração. Com todas as condições atendidas, aplica o split diretamente sobre o lucro líquido conciliado, não sobre o capital: 75% tesouraria e 25% staking.</p>
          <p className="ba-fig__foot">Perdas reconhecidas são permanentes: não criam déficit a recuperar com resultados futuros. A reserva defensiva e a liquidez continuam obrigatórias. Cada lucro, perda, obrigação e pagamento é registrado uma única vez. Lucros anteriores não entram no rateio de novos participantes.</p>
        </Figure>}

        {(!figure || figure === '6') && <Figure id="figure-bettex-payout" num="6" title={architectureFigureTitles['6']} lead="Depois do split do desenho 5: parcela do staking → recebimento confirmado na Carteira USDC → saque em USDC.">
          <Steps steps={fig6} label="Parcela do staking já separada pela IA, distribuição pendente até recebimento confirmado na Carteira USDC e saque do USDC recebido" />
          <p className="ba-fig__foot">O registro do direito à distribuição não é saldo on-chain recebido. A obrigação e o posterior pagamento têm efeito único na apuração; a interface não soma o pendente ao saldo já recebido. Custos de rede são identificados separadamente.</p>
          <p className="ba-fig__foot"><a href="#figure-bettex-risk">Ver condições do split no desenho 5</a>.</p>
        </Figure>}

        {(!figure || figure === '7') && <Figure id="figure-bettex-agents" num="7" title={architectureFigureTitles['7']} lead="Agentes de IA → conexões por MCP ou API → execução automática das operações autorizadas.">
          <Steps steps={fig7} label="Agentes de IA com inferências opcionais da Allora, conexões MCP ou API com mercados e execução autorizada automática" />
          <p className="ba-fig__foot">Allora fornece inferências para análise, não executa ordens. Cada conexão usa apenas as ferramentas de consulta ou execução oferecidas e autorizadas pelo serviço.</p>
          <p className="ba-fig__foot">Antes de qualquer envio, a verificação de limites e a reserva de capital são indivisíveis no núcleo central, compartilhado pelos agentes e conectores. Ordens simultâneas não reutilizam o mesmo capital.</p>
          <p className="ba-fig__foot"><a href="#figure-bettex-opportunities">O desenho 8 detalha o ciclo de coleta de oportunidades, escolha, investimento e registro público das transações.</a></p>
        </Figure>}

        {(!figure || figure === '8') && <Figure id="figure-bettex-opportunities" num="8" title={architectureFigureTitles['8']} lead="Coleta oportunidades → compara e escolhe a melhor → investe com autorização → registra todo o ciclo abertamente.">
          <Steps steps={fig8} stacked label="Coleta de oportunidades nos mercados, comparação e decisão pela melhor oportunidade, investimento automático autorizado e registro público de todo o ciclo" />
          <p className="ba-fig__foot">O registro permite acompanhar quais oportunidades foram coletadas, quais foram selecionadas ou descartadas, os motivos da decisão e o valor investido. A escolha e a alocação são dinâmicas, sem parcelas fixas por mercado; somente operações aprovadas pelo risco seguem para investimento.</p>
          <p className="ba-fig__foot">Sem resposta conclusiva após o envio, o resultado permanece desconhecido: capital e exposição continuam comprometidos, sem reenvio automático. Cancelamento solicitado não libera recursos; somente a parcela comprovadamente livre após conciliação pode ser liberada. Execução parcial é registrada uma vez, mantendo reservado o restante incerto.</p>
          <p className="ba-fig__foot">Cada compromisso autorizado com reserva registrada conta uma vez no dia UTC original. Cancelamento confirmado pode liberar caixa e exposição, mas não devolve o teto diário consumido. A mudança do dia não libera ordens antigas nem as conta novamente.</p>
          <p className="ba-fig__foot">O registro aberto cobre todas as transações do projeto: vendas de tokens, operações de mercado, movimentações da tesouraria, distribuições e saques. Chaves privadas, credenciais e dados pessoais não são publicados.</p>
          <p className="ba-fig__foot">Resultados conciliados seguem para o desenho 5: se faltar reserva, liquidez ou peso elegível, a rodada não paga e 100% do lucro fica na tesouraria, sem liberação futura. Uma rodada posterior considera apenas seus próprios resultados. Isso não altera o vesting: quantidades e meses seguem a liberação predefinida de 36 meses, sem decisão discricionária da gestão.</p>
        </Figure>}
      </div>
    </figure>
  );
}

export function BettexFlow({ figure }: { figure: ArchitectureFigureNumber }) {
  return <BettexArchitecture surface="dark" heading={false} figure={figure} />;
}

export default BettexArchitecture;
