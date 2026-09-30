import { type ReactNode } from 'react';
import { tokenomics, formatTokenCount } from '@/lib/tokenomics';

export const chapters = [
  { id: 'documentacao-como-funciona', title: 'Visão do projeto', subtitle: 'Modelo econômico, arquitetura técnica e controles operacionais da BETTEX.' },
  { id: 'documentacao-rede', title: 'Liquidação interna e ativos', subtitle: 'Moeda fiduciária, stablecoins internas e validação de ativos e redes.' },
  { id: 'documentacao-acesso', title: 'Acesso ao aplicativo', subtitle: 'Conta, sessão e autorização de ações financeiras.' },
  { id: 'documentacao-arquitetura', title: 'Arquitetura do software', subtitle: 'Responsabilidades do aplicativo, dos serviços e da infraestrutura de ativos.' },
  { id: 'documentacao-emissao', title: 'Token e emissão', subtitle: 'Teto, parcelas, permissões e janelas de venda.' },
  { id: 'documentacao-carteiras', title: 'Saldos e custódia', subtitle: 'Saldos em reais, posição de participação e registros contábeis.' },
  { id: 'documentacao-staking', title: 'Compra e participação', subtitle: 'Compra em reais, elegibilidade e ponderação no tempo.' },
  { id: 'documentacao-tesouraria', title: 'Tesouraria e agentes', subtitle: 'Alocação de recursos e requisitos para operações supervisionadas.' },
  { id: 'documentacao-controles', title: 'Controles de risco', subtitle: 'Autorizações, limites e pausas de segurança.' },
  { id: 'documentacao-apuracao', title: 'Apuração mensal', subtitle: 'Resultado realizado, perdas anteriores e participação ponderada no tempo.' },
  { id: 'documentacao-contas', title: 'Créditos, depósitos e saques', subtitle: 'Movimentações em reais por Pix e liquidação interna pelo backend.' },
  { id: 'documentacao-implantacao', title: 'Requisitos operacionais e de segurança', subtitle: 'Controles técnicos, validações e salvaguardas para operar o modelo.' },
  { id: 'documentacao-riscos', title: 'Riscos e validações', subtitle: 'Exposições do modelo e decisões técnicas, operacionais e jurídicas.' },
] as const;

const agents = [
  { name: 'PREDIX', area: 'Mercados de previsão', reference: 'Polymarket', detail: 'Avaliar cenários, probabilidades e preços de eventos futuros.' },
  { name: 'TRADEX', area: 'Ações e criptoativos', reference: 'Robinhood', detail: 'Estudar preço, liquidez e exposição de ativos financeiros.' },
  { name: 'SPORTIX', area: 'Mercados esportivos', reference: 'Kalshi', detail: 'Analisar mercados vinculados a eventos esportivos.' },
  { name: 'BETTIX', area: 'Jogos de cassino', reference: 'Duel', detail: 'Estudar decisões de jogos somente onde forem permitidas.' },
] as const;

function Subhead({ children }: { children: ReactNode }) {
  return <h4 className="whitepaper__subhead">{children}</h4>;
}

function Flow({ label, steps }: { label: string; steps: string[] }) {
  return <div className="whitepaper__flow" role="group" aria-label={label}>
    <span>{label}</span>
    <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
  </div>;
}

export function ChapterContent({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <>
        <div className="whitepaper__lead"><span>MODELO DO PROJETO</span><p>A BETTEX combina um token de participação, uma tesouraria de investimentos operada sob limites e uma regra de distribuição vinculada a resultados realizados e à quantidade de BETTEX elegível ao longo do tempo.</p></div>
        <div className="whitepaper__status-grid">
          <div><span>01 / ECONOMIA DO TOKEN</span><strong>Oferta e elegibilidade</strong><p>O teto, as parcelas de emissão e as janelas de venda definem a oferta. A posição elegível em BETTEX participa da apuração e é registrada pelo backend, separadamente do saldo em reais.</p></div>
          <div><span>02 / OPERAÇÃO FINANCEIRA</span><strong>Tesouraria e agentes</strong><p>Os recursos de venda são destinados à tesouraria, divididos entre reserva defensiva e parcela investível, com limites por agente e supervisão independente.</p></div>
          <div><span>03 / ARQUITETURA E CONTROLES</span><strong>Registros conciliados</strong><p>O modelo requer responsabilidades separadas entre aplicativo, serviços, contratos e operação, com registros auditáveis, autorizações explícitas e reconciliação de ativos e obrigações.</p></div>
        </div>
        <Subhead>Camadas do sistema</Subhead>
        <div className="whitepaper__prose"><p>A arquitetura de referência conecta <strong>aplicativo web → conta da pessoa → serviços de API, livro contábil e conciliação → processamento Pix em reais → tesouraria e quatro agentes supervisionados</strong>. O aplicativo apresenta saldos e solicitações; o backend valida regras, registra obrigações em BRL e processa a compra, emissão, ativação e gestão da posição BETTEX. Stablecoins podem ser usadas somente na liquidação interna do backend, em trilha separada dos saldos e pagamentos da pessoa. Cada componente deve ter responsabilidades e controles próprios.</p><p>Os papéis dos agentes são PREDIX para mercados de previsão, TRADEX para ações e criptoativos, SPORTIX para mercados esportivos e BETTIX para jogos de cassino somente onde forem permitidos. Polymarket, Robinhood, Kalshi e Duel são referências de mercado, não afirmações de parceria ou de integração. Custódia, ativos e redes de liquidação interna, permissões e requisitos legais devem ser especificados e validados antes de qualquer operação que dependa deles.</p></div>
        <div className="whitepaper__aside-callout"><span>BASE DO MODELO</span><p>A participação acompanha o tempo em que os tokens permanecem elegíveis. A distribuição depende de resultado líquido realizado, depois de custos e perdas anteriores; não há retorno garantido.</p></div>
      </>;
    case 1:
      return <>
        <div className="whitepaper__lead"><span>MOEDA DA PESSOA E LIQUIDAÇÃO INTERNA</span><p>Os saldos, depósitos, saques e créditos da pessoa são denominados e movimentados em <strong>reais (BRL)</strong>, com depósitos e saques por Pix. Stablecoins podem apoiar a liquidação entre serviços ou na tesouraria, exclusivamente como infraestrutura interna do backend, separada da conta em reais da pessoa.</p></div>
        <div className="whitepaper__currency-grid">
          <div><span>01 / MOEDA DA CONTA</span><strong>BRL</strong><p>Unidade efetiva dos saldos, depósitos, saques e créditos da pessoa; não é mera conversão indicativa.</p></div>
          <div><span>02 / DEPÓSITOS E SAQUES</span><strong>Pix</strong><p>As movimentações da pessoa são processadas e conciliadas em reais; acesso à conta não depende de carteira externa.</p></div>
          <div><span>03 / LIQUIDAÇÃO INTERNA</span><strong>Stablecoins</strong><p>Ativos internos do backend, não destinados a pagamento ou saque cripto pela pessoa; valor e paridade não são garantidos.</p></div>
        </div>
        <Subhead>O que cada ativo representa</Subhead>
        <div className="whitepaper__prose"><p><strong>BETTEX</strong> é o token de participação do projeto, cuja compra, emissão, ativação e manipulação são processadas pelo backend. A posição em tokens exibida à pessoa é um registro informativo de elegibilidade, não um saldo cripto sacável. A contabilidade dos resultados e os créditos da pessoa são em <strong>BRL</strong>. Stablecoins são instrumentos de liquidação interna: podem perder valor ou desviar-se de uma paridade de referência, e isso não altera a moeda dos saldos da pessoa nem cria direito a pagamento em cripto.</p><p>Os serviços devem validar internamente a identidade, a rede, o ativo e as confirmações das operações de stablecoins que utilizem, com fontes independentes e reconciliação de fundos e obrigações. Nenhuma rede, stablecoin ou integração específica é pressuposta por esta arquitetura. A tela não solicita assinatura blockchain nem movimentação on-chain pela pessoa; divergências na liquidação interna devem bloquear o fluxo afetado até a conciliação.</p></div>
        <div className="whitepaper__aside-callout"><span>VALIDAÇÃO DE LIQUIDAÇÃO</span><p>Ativos e redes eventualmente utilizados pelo backend exigem validação técnica independente, monitoramento de confirmações e tratamento de divergências. Stablecoins são infraestrutura interna, não moeda de saque nem promessa de paridade.</p></div>
      </>;
    case 2:
      return <>
        <div className="whitepaper__lead"><span>IDENTIDADE E AUTORIZAÇÃO</span><p>O acesso à área pessoal depende de uma <strong>conta no aplicativo</strong>. Login e autorização de pagamentos são independentes de carteira blockchain externa; nenhuma chave privada ou assinatura on-chain da pessoa é necessária para usar a conta.</p></div>
        <Flow label="Autenticação e autorização" steps={['Criar ou acessar a conta no aplicativo por um método de identidade definido para o serviço.', 'O servidor valida as credenciais e abre uma sessão protegida, com expiração, revogação e trilha de auditoria.', 'Para depósitos e saques, o backend autoriza a solicitação da conta e concilia a confirmação do Pix em BRL antes de registrar o efeito financeiro.', 'A área pessoal apresenta saldos em reais, lançamentos conciliados e a posição de participação em tokens como registro de leitura.']} />
        <Subhead>Sessão e autorização de pagamento</Subhead>
        <div className="whitepaper__prose"><p>A autenticação não deve, por si só, autorizar um pagamento. Depósitos e saques em BRL exigem verificação própria da solicitação, vínculo com a conta, controles de acesso e conciliação da confirmação Pix. Cada confirmação deve ser processada de forma idempotente, para que mensagens repetidas ou retomadas de serviço não creditem nem paguem duas vezes.</p><p>Troca de aparelho, perda de acesso e recuperação de conta exigem política própria, controles de identidade e histórico auditável; esses processos não dependem de recuperar chave blockchain da pessoa. A compra e a gestão da posição BETTEX são ações processadas pelo backend, com autorização da conta e registro dos eventos relevantes.</p><p>O método de login, controles de autorização e eventuais requisitos de identificação devem ser definidos e validados juridicamente. A autenticação da conta e a autorização de movimentações financeiras permanecem controles distintos.</p></div>
      </>;
    case 3:
      return <>
        <div className="whitepaper__lead"><span>DIVISÃO DE RESPONSABILIDADES</span><p>A arquitetura separa apresentação, registros em reais, liquidação interna de ativos e supervisão operacional. Um saldo só deve ser exibido como disponível após a conciliação das fontes relevantes.</p></div>
        <div className="whitepaper__system">
          <div><span>01 / INTERFACE</span><strong>Aplicativo web</strong><p>Exibe saldo em reais, posição de participação e riscos; coleta solicitações da pessoa e conversa com a API, sem exigir carteira externa.</p></div>
          <div><span>02 / SERVIDOR</span><strong>API e livro contábil</strong><p>Autentica a conta, registra lançamentos em BRL corrigíveis por estorno, calcula limites e elegibilidade, processa a posição BETTEX e impede pedidos repetidos.</p></div>
          <div><span>03 / LIQUIDAÇÃO INTERNA</span><strong>Ativos e eventos</strong><p>O backend valida e reconcilia Pix em BRL e, quando aplicável, operações internas de stablecoins; a pessoa não assina transações nem movimenta tokens na tela.</p></div>
          <div><span>04 / OPERAÇÃO</span><strong>Tesouraria e supervisão</strong><p>Controles independentes examinam propostas dos agentes; pessoas autorizadas aprovam intervenções críticas, pausas e conciliações.</p></div>
        </div>
        <Subhead>Dados que precisam bater</Subhead>
        <div className="whitepaper__prose"><p>Cada movimento deve conter <strong>identificador único, conta, ativo, origem, destino, valor, estado e referência externa</strong>. A confirmação de um Pix não pode creditar duas compras ou duas emissões; mensagens repetidas após reinício de um serviço não podem duplicar um lançamento. Serviços de fila podem repetir uma mensagem, por isso a operação deve ser <strong>idempotente</strong>: o mesmo identificador tem um único efeito contábil.</p><p>O processo de conciliação deve comparar pagamentos Pix confirmados em BRL, compras e emissões autorizadas, posição de participação em tokens, liquidação interna de stablecoins e obrigações em reais. Diferenças devem congelar o fluxo afetado e gerar investigação, nunca saldo artificial. Monitoramento, registros de auditoria e alertas são requisitos operacionais.</p></div>
      </>;
    case 4:
      return <>
        <div className="whitepaper__supply">
          <div className="whitepaper__supply-top"><span>TETO MÁXIMO</span><strong data-testid="text-documentacao-max-supply">{formatTokenCount(tokenomics.maxSupply)}</strong><small>BETTEX · limite total da oferta do projeto.</small></div>
          <div className="whitepaper__supply-bar" role="img" aria-label="50% vendas públicas, 25% investidores, 25% projeto"><span /><span /><span /></div>
          <div className="whitepaper__supply-key"><span><i />Público · 500 milhões</span><span><i />Investidores · 250 milhões</span><span><i />Projeto · 250 milhões</span></div>
        </div>
        <Subhead>Regras e requisitos de emissão</Subhead>
        <div className="whitepaper__prose"><p>A implementação do token deve ter <strong>teto verificável</strong> e papéis de emissão restritos. O backend recebe uma solicitação de compra em reais, concilia a confirmação do Pix e, após controle de acesso, autoriza a emissão <strong>somente da quantidade vendida</strong> da parcela pública ou de investidores. A compra, emissão e ativação da posição são processadas pelo backend; a tela não transfere tokens para uma carteira da pessoa. Recibos e registros devem permitir conferir pagamento, quantidade emitida e conta a que a posição se refere.</p><p>A parcela do projeto, <strong>250 milhões</strong>, é destinada à emissão no Gênesis. Ela pode ser movimentada livremente pelo sistema, mas só participa da distribuição quando registrada como elegível nas mesmas condições das demais. Lotes que expiram sem venda não são emitidos. A custódia das chaves administrativas, a aprovação de mudanças por múltiplos responsáveis e a possibilidade de atualização do mecanismo exigem definição e auditoria independente.</p></div>
        <div className="whitepaper__timeline">
          <div><span>DIAS 0–30</span><h4>Pré-venda pública</h4><p><strong>50 milhões</strong> a <strong>R$ 0,08</strong> por token, contados desde o Gênesis.</p></div>
          <div><span>DIAS 31–60</span><h4>Lançamento público</h4><p><strong>50 milhões</strong> a <strong>R$ 0,10</strong> por token. A emissão depende de venda confirmada.</p></div>
          <div><span>DO DIA 61</span><h4>Vendas mensais</h4><p><strong>400 milhões</strong> em janela de <strong>40 meses</strong>, até <strong>10 milhões/mês</strong> a <strong>R$ 0,10</strong>. Tokens não vendidos no mês não são emitidos; saldo não utilizado expira ao fim da janela.</p></div>
        </div>
        <div className="whitepaper__rule-pair"><div><span>INVESTIDORES / 25%</span><p><strong>250 milhões</strong> a <strong>R$ 0,10</strong> em até <strong>24 meses desde o Gênesis</strong>. Emissão após venda confirmada; saldo não vendido expira.</p></div><div><span>PROJETO / 25%</span><p><strong>250 milhões</strong> no Gênesis; elegibilidade para resultados somente quando registrada pelo backend, sem preferência.</p></div></div>
        <div className="whitepaper__aside-callout"><span>REQUISITOS DE VENDA</span><p>A compra é solicitada em BRL e depende da confirmação conciliada do Pix antes da emissão pelo backend. A liquidação interna em stablecoins, se utilizada, permanece separada dos saldos em reais e não define paridade ou pagamento cripto à pessoa. O processamento depende de controles operacionais e autorização jurídica.</p></div>
      </>;
    case 5:
      return <>
        <div className="whitepaper__lead"><span>SALDO E POSIÇÃO DE PARTICIPAÇÃO</span><p>A conta da pessoa mantém <strong>saldos em reais</strong> e uma posição BETTEX registrada pelo backend. A posição exibida informa a elegibilidade para participação; não é uma carteira blockchain nem um ativo cripto disponível para saque.</p></div>
        <div className="whitepaper__system">
          <div><span>BETTEX</span><strong>Posição de participação</strong><p>Compra, emissão e manipulação da posição são processadas pelo backend; a pessoa consulta um registro de leitura associado à sua conta.</p></div>
          <div><span>PARTICIPAÇÃO ELEGÍVEL</span><strong>Registro temporal</strong><p>O backend registra alterações de elegibilidade e seus horários para ponderar a participação nos resultados.</p></div>
          <div><span>SALDO EM REAIS</span><strong>Conta da pessoa</strong><p>Créditos e lançamentos são contabilizados em BRL, com fundos e obrigações conciliados antes de indicar disponibilidade.</p></div>
          <div><span>LIQUIDAÇÃO INTERNA</span><strong>Stablecoins no backend</strong><p>Eventuais ativos internos são reconciliados separadamente; não constituem saldo cripto sacável nem promessa de paridade para a pessoa.</p></div>
        </div>
        <div className="whitepaper__prose"><p>A arquitetura deve definir como a tesouraria mantém e movimenta eventuais stablecoins para liquidação interna, sob controles de custódia, aprovações e limites. A pessoa não controla carteira externa nem assina movimentações de token. A escolha de ativos e redes internas, as responsabilidades legais e a prova de reservas exigem definição e validação; um extrato do aplicativo não comprova sozinho que os fundos internos existem nem garante paridade de stablecoin.</p><p>A API deve manter um <strong>livro de lançamentos em BRL</strong> para créditos, movimentações e saques da pessoa, sem confundir esse saldo com ativos de liquidação interna. O histórico de eventos exibido pode ser resumido, mas o total contábil precisa permanecer íntegro. Uma confirmação Pix não conciliada ou divergência de liquidação interna deve aparecer como pendente; não se atribui saldo disponível por antecipação.</p></div>
      </>;
    case 6:
      return <>
        <div className="whitepaper__lead"><span>COMPRA EM REAIS E PARTICIPAÇÃO</span><p>A pessoa solicita a compra em BRL; o backend concilia o pagamento, processa a emissão e mantém a posição BETTEX. Somente a <strong>posição registrada como elegível</strong> participa de uma possível distribuição.</p></div>
        <Flow label="Solicitação de compra e registro de participação" steps={['A pessoa solicita a compra em reais; o backend valida a conta, a janela e o limite aplicável.', 'Conciliar a confirmação do Pix com identificador único; uma confirmação repetida não pode gerar nova compra ou emissão.', 'Após a conciliação, o backend processa a compra, emissão e ativação da posição BETTEX associada à conta, sem transferência ou assinatura pela pessoa.', 'O serviço registra a alteração e seu horário no histórico de elegibilidade, com trilha de auditoria e possibilidade de conciliação.']} />
        <div className="whitepaper__prose"><p>A regra é <strong>mínimo de 1 BETTEX inteiro</strong> para participar e <strong>sem prazo de bloqueio</strong>. Não se recebe um mês inteiro de participação ao ativar a posição no último dia: cada alteração de elegibilidade precisa de marca temporal, e o cálculo mensal pondera o tempo em UTC. BETTEX não elegível não conta. Os tokens do projeto seguem exatamente a mesma regra.</p><p>Ao <strong>solicitar a saída da participação</strong>, encerra-se a elegibilidade futura daquela posição; a participação já acumulada até o pedido permanece no fechamento. O backend registra a solicitação de forma durável e atualiza a posição conforme os controles definidos. Não há retirada on-chain pela pessoa: a compra e a manipulação da posição são processadas pelo backend. Falhas ou divergências devem bloquear crédito duplicado e manter o estado correto, sem presumir sucesso.</p></div>
        <div className="whitepaper__formula"><span>EXEMPLO DE TEMPO ELEGÍVEL</span><p>100 BETTEX por metade do mês ≈ 50 BETTEX mantidos o mês inteiro, para efeito da fração de participação. O cálculo real usa intervalos entre mudanças de saldo, não o saldo no dia do clique.</p></div>
      </>;
    case 7:
      return <>
        <div className="whitepaper__lead whitepaper__lead--dark"><span>DESTINAÇÃO DA RECEITA PRIMÁRIA</span><p><strong>100%</strong> do dinheiro recebido nas vendas públicas e a investidores entra na tesouraria de investimentos, sem usar esses recursos para despesas operacionais do projeto.</p></div>
        <div className="whitepaper__prose"><p>A tesouraria mantém <strong>50% em stablecoins como reserva defensiva de liquidação interna</strong> e <strong>50% como parcela investível</strong>. Da metade investível, cada agente recebe reserva de <strong>25%</strong>, equivalente a 12,5% do total. Saldo não usado por um agente permanece reservado a ele, sem redistribuição aos demais. Ativos e redes de liquidação interna devem ser validados pelo backend; stablecoins podem perder valor ou desviar-se de uma paridade de referência, e não são moeda de saque da pessoa. Os registros de custódia e o livro contábil devem permitir verificar essa segregação.</p></div>
        <div className="whitepaper__agents" aria-label="Divisão da parcela investível entre agentes">
          {agents.map((agent, i) => <article key={agent.name} className="whitepaper__agent"><div className="whitepaper__agent-top"><span>0{i + 1} / 04</span><strong>25%</strong></div><h4>{agent.name}</h4><span className="whitepaper__agent-area">{agent.area}</span><p>{agent.detail}</p><small>REFERÊNCIA CONCEITUAL · {agent.reference}</small></article>)}
        </div>
        <Subhead>Fluxo de autorização de operações</Subhead>
        <Flow label="Controles de uma operação" steps={['O agente recebe dados com origem, horário e qualidade identificados; apresenta uma proposta e registra suas premissas.', 'Um motor de risco independente verifica autorização do mercado, caixa da reserva do agente, limites e ordens já pendentes.', 'Somente uma proposta aprovada pode seguir para autorização e execução por uma integração permitida.', 'A confirmação, os custos e o resultado realizado devem ser reconciliados com a tesouraria; falhas exigem investigação.']} />
        <div className="whitepaper__aside-callout"><span>ACESSO ÀS PLATAFORMAS</span><p>Polymarket, Robinhood, Kalshi e Duel são referências de mercado. Qualquer uso de dados ou integração para ordens exige autorização da plataforma, conformidade com a jurisdição aplicável e supervisão.</p></div>
      </>;
    case 8:
      return <>
        <div className="whitepaper__prose"><p>Os percentuais abaixo usam como base a <strong>metade investível da tesouraria</strong>, não o patrimônio inteiro. Uma verificação independente dos agentes deve recusar qualquer nova ordem que ultrapasse um limite. <strong>Ordens pendentes contam</strong> nos compromissos e na exposição; registrar a ordem apenas depois de executá-la não basta.</p></div>
        <div className="whitepaper__limits">
          <div><span>01 / NOVOS COMPROMISSOS POR DIA</span><strong>2% <em>global</em> / 0,5% <em>por agente</em></strong><p>Máximo somado das novas operações em cada dia UTC.</p></div>
          <div><span>02 / OPERAÇÃO INDIVIDUAL</span><strong>0,05%</strong><p>Máximo comprometido em uma única proposta.</p></div>
          <div><span>03 / EXPOSIÇÃO EM ABERTO</span><strong>10% <em>global</em> / 2,5% <em>por agente</em></strong><p>Inclui posições abertas e compromissos que aguardam resultado.</p></div>
          <div><span>04 / EXPOSIÇÃO CORRELACIONADA</span><strong>0,5%</strong><p>Conjunto de posições afetadas pelo mesmo evento ou risco.</p></div>
          <div><span>05 / PERDA REALIZADA DIÁRIA</span><strong>0,5% <em>global</em> / 0,125% <em>por agente</em></strong><p>Ao atingir o teto, novas operações param naquele escopo até o próximo dia UTC.</p></div>
        </div>
        <Subhead>Como o bloqueio funcionaria</Subhead>
        <div className="whitepaper__prose"><p>A API de execução não deve aceitar ordens diretas de um agente. Ela verifica simultaneamente caixa reservado, exposição por mercado e correlação, perdas realizadas e autorização da integração; grava a reserva da operação <strong>antes</strong> de enviá-la. Repetir o mesmo pedido não pode consumir o limite duas vezes nem gerar duas ordens. Falta de cotação confiável, divergência de saldo ou perda de comunicação impede novas ordens até reconciliação.</p><p>Não há alavancagem. Uma pausa de emergência, controlada por pessoas autorizadas e registrada em auditoria, pode impedir novas operações independentemente dos limites; a política de cancelamento de ordens pendentes também precisa ser testada. Limites reduzem exposição, mas não evitam perdas nem autorizam atuação onde a lei ou a plataforma proíbe.</p></div>
      </>;
    case 9:
      return <>
        <div className="whitepaper__lead"><span>RESULTADO ≠ CRÉDITO INDIVIDUAL</span><p>A atribuição individual depende do fechamento do período, da conciliação do resultado e do cálculo da fração de BETTEX efetivamente elegível.</p></div>
        <div className="whitepaper__steps">
          <div><span>01</span><p>Fechar o mês-calendário em <strong>UTC</strong>. No livro em BRL, somar ganhos e perdas <strong>realizados</strong> nas operações, reconhecidos em reais, e descontar custos. Ganhos ainda em posição aberta não entram.</p></div>
          <div><span>02</span><p>Compensar o saldo de perdas acumuladas de meses anteriores. Se o resultado líquido continuar zero ou negativo, não distribuir e carregar a perda remanescente.</p></div>
          <div><span>03</span><p>Se positivo, reservar <strong>50% para distribuição</strong> e manter <strong>50% na tesouraria</strong>. Apurar os intervalos de elegibilidade de cada posição entre início e fim do mês; os tokens do projeto não têm peso especial.</p></div>
          <div><span>04</span><p>No <strong>quinto dia útil do mês seguinte</strong>, conferir total de elegíveis, arredondamento, obrigações e fundos; atribuir cada crédito uma vez, com identificador de período e trilha de cálculo.</p></div>
        </div>
        <div className="whitepaper__formula"><span>FRAÇÃO MENSAL</span><p>BETTEX elegíveis da pessoa × tempo elegível <b>÷</b> soma de BETTEX elegíveis × tempo de todos os participantes</p></div>
        <div className="whitepaper__prose"><p><strong>Exemplo apenas matemático:</strong> lucro líquido realizado de R$ 1.000 depois de custos e perdas antigas; R$ 500 ficam para distribuição e R$ 500 na tesouraria. Se a pessoa representou 10% de todo o saldo-tempo elegível do mês, seu crédito seria R$ 50 em sua conta. Se não teve posição elegível em nenhum instante, o crédito é <strong>zero</strong>, mesmo com lucro dos agentes. Eventuais stablecoins usadas na liquidação interna não alteram o valor contábil em reais nem garantem paridade.</p><p>O aplicativo precisa armazenar os instantes de ativação e saída da posição elegível, uma versão do cálculo e a origem dos resultados. Registros fechados são corrigidos por ajuste identificado, nunca por uma edição invisível do saldo. A política de arredondamento em BRL, o calendário de dias úteis e a auditoria do fechamento fazem parte das regras de apuração. Trocar filtros do gráfico jamais cria crédito.</p></div>
      </>;
    case 10:
      return <>
        <div className="whitepaper__currency-grid">
          <div><span>01 / CONTABILIDADE E CRÉDITOS</span><strong>BRL</strong><p>Resultados realizados e saldos da pessoa são registrados efetivamente em reais.</p></div>
          <div><span>02 / DEPÓSITOS</span><strong>Pix em BRL</strong><p>Confirmação conciliada e processada de forma idempotente antes do crédito.</p></div>
          <div><span>03 / SAQUES</span><strong>Pix em BRL</strong><p>Solicitações de retirada são autorizadas e conciliadas em reais pelo backend.</p></div>
        </div>
        <Flow label="Percurso de depósitos, créditos e saques" steps={['A conciliação mensal atribui o crédito em BRL à conta da pessoa, com identificador de período e trilha de cálculo.', 'A pessoa consulta o saldo em reais e solicita um depósito ou saque por Pix em BRL, sem movimentar criptoativos.', 'O backend valida a solicitação, autentica a conta e concilia a confirmação Pix com identificador único antes de registrar o efeito financeiro.', 'O sistema atualiza o saldo uma única vez e apresenta o estado conciliado; mensagens repetidas ou falhas permanecem pendentes até verificação.']} />
        <div className="whitepaper__prose"><p>Depósitos e saques em BRL passam por validação da conta, autorização, saldo e conciliação da confirmação Pix. A mesma solicitação não pode ser processada duas vezes se houver repetição ou queda de conexão; efeitos financeiros devem ser idempotentes e auditáveis. A disponibilidade só é reconhecida após confirmação conciliada, sem presumir sucesso por uma resposta incompleta.</p><p>Os saldos, créditos, depósitos e saques da pessoa são em reais. Stablecoins podem existir em trilha de tesouraria ou liquidação interna do backend, com conciliação separada e riscos de desvalorização ou depeg; não são meio de pagamento ou saque cripto da pessoa e não representam paridade garantida com BRL. Não se pressupõem provedor, taxa, limite ou prazo específico.</p></div>
      </>;
    case 11:
      return <>
        <div className="whitepaper__lead"><span>REQUISITOS DE OPERAÇÃO SEGURA</span><p>Os componentes financeiros e a infraestrutura de ativos devem operar com controles verificáveis, separação de responsabilidades e capacidade de interromper fluxos inseguros sem perder o histórico contábil.</p></div>
        <div className="whitepaper__steps">
          <div><span>01</span><p>Aplicar controle de acesso mínimo, autenticação forte para operadores e segregação de funções. Mudanças em contratos, permissões, limites e destinos de ativos exigem aprovação por múltiplos responsáveis e trilha auditável.</p></div>
          <div><span>02</span><p>Proteger chaves com armazenamento e procedimentos de recuperação definidos; estabelecer limites de assinatura e política de revogação. Endereços de contratos, ativos e tesouraria devem ser verificados por fontes independentes antes de serem usados.</p></div>
          <div><span>03</span><p>Testar contratos, integrações, indexadores e livro contábil contra duplicidade, reordenação de blocos, falha de rede, divergência de saldo, repetição de mensagens e recuperação. Exigir auditoria independente dos contratos e controles de custódia.</p></div>
          <div><span>04</span><p>Monitorar saldos, obrigações, limites e integrações; emitir alertas acionáveis e manter procedimentos de resposta a incidentes. A pausa deve bloquear novas ordens sem apagar obrigações já atribuídas; retomada depende de conciliação e autorização registrada.</p></div>
        </div>
        <div className="whitepaper__prose"><p>A continuidade do serviço deve preservar registros imutáveis com correções por estorno identificado, cópias de segurança testadas e reconciliação periódica entre Pix em BRL, compras e emissão processadas pelo backend, posição de participação, tesouraria, liquidação interna de ativos e saques. Uma indisponibilidade ou falha de integração deve resultar em estado pendente ou bloqueio, nunca em confirmação presumida. As escolhas de custódia, permissões, integrações e conformidade exigem validação técnica e jurídica.</p></div>
        <div className="whitepaper__aside-callout"><span>SEQUÊNCIA DO PROJETO</span><p>O <a href="#roadmap" data-testid="link-documentacao-roadmap">Roadmap da BETTEX</a> apresenta o percurso do pré-lançamento ao acesso aos resultados.</p></div>
      </>;
    default:
      return <>
        <div className="whitepaper__prose"><p>As regras econômicas e os controles descritos aqui <strong>não garantem retorno ou proteção do capital</strong>. Serviços, ativos e redes de liquidação interna podem falhar ou ficar indisponíveis; stablecoins podem perder valor ou desviar-se de uma paridade de referência. Esses riscos de infraestrutura interna não convertem os saldos da pessoa em cripto nem definem moeda de saque. Há risco de liquidez do token, perdas dos agentes, integração inadequada, custódia e mudança regulatória.</p></div>
        <div className="whitepaper__risk-list">
          <div><span>MERCADO E IA</span><p>Dados atrasados, vieses e execução ruim podem causar perdas consecutivas; limite de risco não cria lucro.</p></div>
          <div><span>LIQUIDAÇÃO E ATIVOS INTERNOS</span><p>Falhas de integração, confirmação ou conciliação, desvalorização de stablecoins e divergência entre livro e reserva exigem bloqueio e investigação.</p></div>
          <div><span>CONTAS E CUSTÓDIA</span><p>Acesso indevido à conta, desvio de fundos e divergência entre saldos em reais e reservas exigem bloqueio e investigação.</p></div>
          <div><span>LEI E TERCEIROS</span><p>Uma plataforma pode não permitir automação; uma jurisdição pode vedar venda, distribuição ou operação em determinado mercado.</p></div>
        </div>
        <Subhead>Escolhas sujeitas a validação</Subhead>
        <div className="whitepaper__prose"><p>As especificações de identidade e verificação, custódia dos ativos de liquidação interna, controles da tesouraria, processamento e conciliação de Pix, emissão e gestão backend da posição BETTEX, validação de ativos e redes internas, calendário de dias úteis, arredondamento e resposta a incidentes devem ser validadas pelos responsáveis técnicos e jurídicos. Nenhum requisito técnico substitui autorização legal ou controles independentes.</p></div>
        <div className="whitepaper__glossary"><span>GLOSSÁRIO BREVE</span><p><strong>Backend:</strong> serviços que processam as regras e os registros da conta. <strong>API:</strong> serviço que conecta app e servidor. <strong>BRL:</strong> reais, moeda dos saldos e pagamentos da pessoa. <strong>Stablecoin:</strong> ativo digital usado eventualmente na liquidação interna, sujeito a variação e sem paridade garantida. <strong>Posição elegível:</strong> registro de BETTEX mantido pelo backend que determina a participação ao longo do tempo. <strong>Conciliação:</strong> comparação entre registros, confirmações e fundos para localizar divergências. <strong>Idempotência:</strong> repetir o mesmo pedido sem repetir seu efeito.</p></div>
        <div className="whitepaper__lead whitepaper__lead--dark whitepaper__closing"><span>ANTES DE DECIDIR</span><p>Não há rendimento prometido, capital protegido ou aprovação implícita. Considere os riscos de mercado, liquidez, tecnologia, custódia e regulação antes de qualquer decisão financeira.</p></div>
      </>;
  }
}