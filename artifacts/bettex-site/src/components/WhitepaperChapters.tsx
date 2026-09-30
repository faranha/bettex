import { type ReactNode } from 'react';
import { tokenomics, formatTokenCount } from '@/lib/tokenomics';

export const chapters = [
  { id: 'documentacao-como-funciona', title: 'Visão do projeto', subtitle: 'Modelo econômico, arquitetura técnica e controles operacionais da BETTEX.' },
  { id: 'documentacao-rede', title: 'Rede e ativos', subtitle: 'Arbitrum One, BETTEX, USDC e custos de transação.' },
  { id: 'documentacao-acesso', title: 'Acesso ao aplicativo', subtitle: 'Conta, sessão, vínculo com carteira e autorização de ações.' },
  { id: 'documentacao-arquitetura', title: 'Arquitetura do software', subtitle: 'Responsabilidades do aplicativo, dos serviços e da blockchain.' },
  { id: 'documentacao-emissao', title: 'Token e emissão', subtitle: 'Teto, parcelas, permissões e janelas de venda.' },
  { id: 'documentacao-carteiras', title: 'Carteiras e custódia', subtitle: 'Propriedade de ativos, registros contábeis e requisitos de custódia.' },
  { id: 'documentacao-staking', title: 'Compra e participação', subtitle: 'Elegibilidade, ponderação no tempo e retirada de BETTEX.' },
  { id: 'documentacao-tesouraria', title: 'Tesouraria e agentes', subtitle: 'Alocação de recursos e requisitos para operações supervisionadas.' },
  { id: 'documentacao-controles', title: 'Controles de risco', subtitle: 'Autorizações, limites e pausas de segurança.' },
  { id: 'documentacao-apuracao', title: 'Apuração mensal', subtitle: 'Resultado realizado, perdas anteriores e participação ponderada no tempo.' },
  { id: 'documentacao-contas', title: 'Distribuição e saque', subtitle: 'Do crédito contábil em USDC à transferência na Arbitrum One.' },
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
          <div><span>01 / ECONOMIA DO TOKEN</span><strong>Oferta e elegibilidade</strong><p>O teto, as parcelas de emissão e as janelas de venda definem a oferta. Somente BETTEX mantido em staking participa da apuração, sem confundir tokens com saldo em USDC.</p></div>
          <div><span>02 / OPERAÇÃO FINANCEIRA</span><strong>Tesouraria e agentes</strong><p>Os recursos de venda são destinados à tesouraria, divididos entre reserva defensiva e parcela investível, com limites por agente e supervisão independente.</p></div>
          <div><span>03 / ARQUITETURA E CONTROLES</span><strong>Registros conciliados</strong><p>O modelo requer responsabilidades separadas entre aplicativo, serviços, contratos e operação, com registros auditáveis, autorizações explícitas e reconciliação de ativos e obrigações.</p></div>
        </div>
        <Subhead>Camadas do sistema</Subhead>
        <div className="whitepaper__prose"><p>A arquitetura de referência conecta <strong>aplicativo web → conta e carteira do usuário → contratos na Arbitrum One → serviços de API e conciliação → tesouraria e quatro agentes supervisionados</strong>. O aplicativo apresenta dados e solicitações; os serviços validam regras e registram obrigações; contratos executam as funções on-chain definidas para o token e a participação. Cada componente deve ter responsabilidades e controles próprios.</p><p>Os papéis dos agentes são PREDIX para mercados de previsão, TRADEX para ações e criptoativos, SPORTIX para mercados esportivos e BETTIX para jogos de cassino somente onde forem permitidos. Polymarket, Robinhood, Kalshi e Duel são referências de mercado, não afirmações de parceria ou de integração. Contratos, custódia, provedores, permissões e requisitos legais devem ser especificados e validados antes de qualquer operação que dependa deles.</p></div>
        <div className="whitepaper__aside-callout"><span>BASE DO MODELO</span><p>A participação acompanha o tempo em que os tokens permanecem elegíveis. A distribuição depende de resultado líquido realizado, depois de custos e perdas anteriores; não há retorno garantido.</p></div>
      </>;
    case 1:
      return <>
        <div className="whitepaper__lead"><span>REDE E ATIVOS</span><p>O modelo especifica <strong>Arbitrum One</strong> para saídas em USDC, uma rede de segunda camada que executa transações compatíveis com Ethereum e registra seus dados conforme o protocolo de rollup na rede Ethereum.</p></div>
        <div className="whitepaper__currency-grid">
          <div><span>01 / REDE</span><strong>42161</strong><p>Identificador da Arbitrum One. Não é Arbitrum Nova, Arbitrum Sepolia nem Ethereum principal.</p></div>
          <div><span>02 / TAXAS DE REDE</span><strong>ETH</strong><p>Ativo usado para pagar gás na Arbitrum One; não confundir com taxa própria da BETTEX.</p></div>
          <div><span>03 / ATIVO DE SAÍDA</span><strong>USDC</strong><p>O requisito é usar a versão nativa emitida pela Circle, sem presumir que USDC.e transferido por ponte seja o mesmo ativo.</p></div>
        </div>
        <Subhead>O que cada ativo representa</Subhead>
        <div className="whitepaper__prose"><p><strong>BETTEX</strong> é o token fungível do projeto, com implementação ERC-20 como requisito técnico. Seus tokens em staking medem elegibilidade; não representam USDC no saldo da pessoa. <strong>USDC</strong> é o ativo digital definido para a distribuição e uma eventual saída externa; seu preço pode se desviar do dólar. <strong>USD</strong> é a unidade da contabilidade dos resultados. <strong>BRL</strong> aparece nos preços de venda e como conversão indicativa: não há saque bancário ou em reais no modelo descrito.</p><p>A interface deve consultar o identificador da rede conectada, o endereço do contrato do token e o endereço do USDC nativo publicados em um registro oficial do projeto, conferido contra fontes independentes. Um endereço EVM começando com “0x” <strong>não prova</strong> que a carteira aceita Arbitrum One ou o ativo correto. Antes de assinar ou enviar, a interface deve mostrar rede, ativo, destino, quantidade e custo estimado; se houver divergência, deve bloquear a ação. Endereços de contratos e ativos precisam de validação independente antes de serem tratados como oficiais.</p></div>
        <div className="whitepaper__aside-callout"><span>FONTES TÉCNICAS</span><p>Rede e identificador: <a href="https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info" target="_blank" rel="noopener noreferrer">documentação oficial da Arbitrum</a>; ETH como gás: <a href="https://docs.arbitrum.io/learn-more/faq" target="_blank" rel="noopener noreferrer">perguntas frequentes da Arbitrum</a>. Diferença entre USDC nativo e versões transferidas por ponte: <a href="https://www.circle.com/multi-chain-usdc/arbitrum" target="_blank" rel="noopener noreferrer">Circle sobre USDC na Arbitrum</a>. Estes links descrevem a rede, não certificam um contrato BETTEX; endereços oficiais do projeto exigem implantação e verificação independente.</p></div>
      </>;
    case 2:
      return <>
        <div className="whitepaper__lead"><span>IDENTIDADE E AUTORIZAÇÃO</span><p>O acesso à área pessoal deve combinar <strong>conta no aplicativo vinculada a uma carteira externa</strong>. A arquitetura deve manter a chave privada sob controle da pessoa, sem armazená-la no aplicativo.</p></div>
        <Flow label="Autenticação e autorização" steps={['Criar ou acessar uma conta no aplicativo por um método de identidade aprovado.', 'Conectar uma carteira compatível com Arbitrum One; assinar um desafio único e com prazo para provar controle do endereço.', 'O servidor confere assinatura, domínio e prazo, vincula o endereço e abre uma sessão de acesso.', 'A área pessoal apresenta saldos e lançamentos verificados; operações exigem autorização adicional apropriada.']} />
        <Subhead>Sessão não é assinatura de pagamento</Subhead>
        <div className="whitepaper__prose"><p>Uma assinatura de desafio de login não deve movimentar fundos nem conceder permissão ilimitada. A autenticação deve usar <strong>desafio de uso único</strong>, válido para o domínio correto, e sessão protegida com expiração e revogação. Depositar BETTEX em contrato exige confirmação específica na carteira; solicitar saída em USDC exige autenticação, verificações do servidor e confirmação explícita de rede, destino e custo antes do envio.</p><p>Troca de aparelho, perda de acesso e múltiplos endereços exigem política própria: recuperar a conta do aplicativo <strong>não recupera a chave privada</strong> perdida. Um novo endereço não herda automaticamente BETTEX em staking nem créditos de outra carteira. Vincular ou remover carteiras requer nova prova de controle e histórico auditável.</p><p>O método de login, o modelo de custódia e eventuais requisitos de identificação devem ser definidos e validados juridicamente. A recuperação de conta e a titularidade de ativos on-chain devem permanecer processos distintos.</p></div>
      </>;
    case 3:
      return <>
        <div className="whitepaper__lead"><span>DIVISÃO DE RESPONSABILIDADES</span><p>A arquitetura separa apresentação, registros contábeis, execução on-chain e supervisão operacional. Um saldo só deve ser exibido como disponível após a conciliação das fontes relevantes.</p></div>
        <div className="whitepaper__system">
          <div><span>01 / INTERFACE</span><strong>Aplicativo web</strong><p>Exibe posição e riscos; coleta confirmação da pessoa; conversa com a carteira conectada e com a API. Não decide sozinha quem recebeu USDC.</p></div>
          <div><span>02 / SERVIDOR</span><strong>API e livro contábil</strong><p>Autentica a conta, registra lançamentos imutáveis/corrigíveis por estorno, calcula limites e elegibilidade, expõe extratos e impede pedidos repetidos.</p></div>
          <div><span>03 / REDE</span><strong>Contratos e eventos</strong><p>Token, staking e transferências externas geram eventos e hashes de transação; um indexador os acompanha, espera confirmação e reconcilia divergências.</p></div>
          <div><span>04 / OPERAÇÃO</span><strong>Tesouraria e supervisão</strong><p>Controles independentes examinam propostas dos agentes; pessoas autorizadas aprovam intervenções críticas, pausas e conciliações.</p></div>
        </div>
        <Subhead>Dados que precisam bater</Subhead>
        <div className="whitepaper__prose"><p>Cada movimento deve conter <strong>identificador único, conta, ativo, origem, destino, valor, estado e referência externa</strong>. O registro de uma venda não pode creditar duas emissões; o evento de depósito não pode contar duas vezes após reinício do indexador. Serviços de fila podem repetir uma mensagem, por isso a operação deve ser <strong>idempotente</strong>: o mesmo identificador tem um único efeito contábil.</p><p>O processo de conciliação deve comparar pagamentos confirmados, emissão, eventos de staking, saldo de custódia e total de obrigações em USDC. Diferenças devem congelar o fluxo afetado e gerar investigação, nunca saldo artificial. Monitoramento, registros de auditoria e alertas são requisitos operacionais.</p></div>
      </>;
    case 4:
      return <>
        <div className="whitepaper__supply">
          <div className="whitepaper__supply-top"><span>TETO MÁXIMO</span><strong data-testid="text-documentacao-max-supply">{formatTokenCount(tokenomics.maxSupply)}</strong><small>BETTEX · limite total da oferta do projeto.</small></div>
          <div className="whitepaper__supply-bar" role="img" aria-label="50% vendas públicas, 25% investidores, 25% projeto"><span /><span /><span /></div>
          <div className="whitepaper__supply-key"><span><i />Público · 500 milhões</span><span><i />Investidores · 250 milhões</span><span><i />Projeto · 250 milhões</span></div>
        </div>
        <Subhead>Regras e requisitos de emissão</Subhead>
        <div className="whitepaper__prose"><p>O contrato deve implementar um token <strong>ERC-20 com teto verificável</strong> e papéis de emissão restritos. O sistema de venda deve confirmar a compra e, após conciliação e controle de acesso, autorizar emissão <strong>somente da quantidade vendida</strong> da parcela pública ou de investidores. O contrato não pode ultrapassar nem o teto global nem as parcelas autorizadas. Recibos e eventos devem permitir conferir venda, quantidade emitida e destinatário.</p><p>A parcela do projeto, <strong>250 milhões</strong>, é destinada à emissão no Gênesis. Ela pode ser movimentada livremente, mas só participa da distribuição enquanto estiver em staking nas mesmas condições das demais. Lotes que expiram sem venda não são emitidos. A custódia das chaves administrativas, a aprovação de mudanças por múltiplos responsáveis e a possibilidade de atualização do contrato exigem definição e auditoria independente.</p></div>
        <div className="whitepaper__timeline">
          <div><span>DIAS 0–30</span><h4>Pré-venda pública</h4><p><strong>50 milhões</strong> a <strong>R$ 0,08</strong> por token, contados desde o Gênesis.</p></div>
          <div><span>DIAS 31–60</span><h4>Lançamento público</h4><p><strong>50 milhões</strong> a <strong>R$ 0,10</strong> por token. A emissão depende de venda confirmada.</p></div>
          <div><span>DO DIA 61</span><h4>Vendas mensais</h4><p><strong>400 milhões</strong> em janela de <strong>40 meses</strong>, até <strong>10 milhões/mês</strong> a <strong>R$ 0,10</strong>. Tokens não vendidos no mês não são emitidos; saldo não utilizado expira ao fim da janela.</p></div>
        </div>
        <div className="whitepaper__rule-pair"><div><span>INVESTIDORES / 25%</span><p><strong>250 milhões</strong> a <strong>R$ 0,10</strong> em até <strong>24 meses desde o Gênesis</strong>. Emissão após venda confirmada; saldo não vendido expira.</p></div><div><span>PROJETO / 25%</span><p><strong>250 milhões</strong> no Gênesis; elegibilidade para resultados apenas mediante staking, sem preferência.</p></div></div>
        <div className="whitepaper__aside-callout"><span>REQUISITOS DE VENDA</span><p>O meio de pagamento e a conversão da receita em USDC exigem definição. Preço em BRL não cria saldo ou saque em reais. A venda depende de autorização jurídica e de processadores compatíveis com o produto.</p></div>
      </>;
    case 5:
      return <>
        <div className="whitepaper__lead"><span>DUAS CAMADAS DIFERENTES</span><p>Uma <strong>carteira blockchain</strong> controla chaves e recebe ativos on-chain. A “Carteira BETTEX” e a “carteira pessoal” são conceitos de subcontas internas para organizar os registros do aplicativo, não endereços blockchain com saldo próprio.</p></div>
        <div className="whitepaper__system">
          <div><span>BETTEX LIVRE</span><strong>Carteira externa</strong><p>A pessoa assina movimentos do token com sua própria carteira; a arquitetura deve evitar que o site custodie sua chave privada.</p></div>
          <div><span>BETTEX ELEGÍVEL</span><strong>Contrato de staking</strong><p>Depósito confirmado altera a posição elegível registrada por eventos e comprovada contra a rede.</p></div>
          <div><span>USDC ATRIBUÍDO</span><strong>Conta alocada</strong><p>Direito calculado e registrado no livro da aplicação, com fundos suficientes e conciliação da tesouraria antes de liberar saques reais.</p></div>
          <div><span>USDC TRANSFERIDO</span><strong>Conta pessoal</strong><p>Movimentação interna no livro contábil. Só o saque externo autorizado gera transação blockchain para um endereço.</p></div>
        </div>
        <div className="whitepaper__prose"><p>A arquitetura deve definir como a tesouraria mantém e movimenta USDC destinado aos créditos. Responsáveis autorizados devem assinar saídas sob políticas de múltiplas aprovações e limites. A pessoa controla sua própria carteira externa. Custodiante, responsabilidades legais, prova de reservas e mecanismo de liberação exigem definição e validação; um extrato do aplicativo não substitui uma prova de saldo no contrato nem comprova sozinho que os fundos de USDC existem.</p><p>A API deve manter um <strong>livro de lançamentos</strong> que soma créditos, transferências entre subcontas e retiradas sem criar USDC do nada: total atribuído = disponível alocado + disponível pessoal + total já retirado. O histórico de eventos exibido pode ser resumido, mas o total contábil precisa permanecer íntegro. Um erro de indexação ou depósito não confirmado deve aparecer como pendente; não se atribui saldo disponível por antecipação.</p></div>
      </>;
    case 6:
      return <>
        <div className="whitepaper__lead"><span>DO TOKEN À PARTICIPAÇÃO</span><p>Comprar, guardar e depositar são ações diferentes. Somente <strong>BETTEX em staking elegível</strong> participa de uma possível distribuição.</p></div>
        <Flow label="Requisitos para entrada e depósito" steps={['Confirmar a venda por meio de pagamento aprovado; conciliar recibo, janela e limite antes de autorizar a emissão de BETTEX.', 'Emitir e entregar o token ao endereço correto após confirmação; compra cancelada ou duplicada não autoriza emissão.', 'A pessoa conecta sua carteira, confere rede e contrato e assina aprovação limitada e depósito no staking.', 'O indexador aguarda a confirmação definida para o evento; a partir desse instante os tokens entram no histórico de elegibilidade.']} />
        <div className="whitepaper__prose"><p>A regra é <strong>mínimo de 1 BETTEX inteiro</strong> para participar e <strong>sem prazo de bloqueio</strong>. Não se recebe um mês inteiro de participação por depositar no último dia: cada alteração de saldo elegível precisa de marca temporal, e o cálculo mensal pondera o tempo em UTC. BETTEX fora do staking não conta. Os tokens do projeto seguem exatamente a mesma regra.</p><p>Ao <strong>pedir a retirada</strong>, encerra-se a elegibilidade futura daqueles tokens; a participação já acumulada até o pedido permanece no fechamento. O pedido deve ser registrado de forma durável antes de liberar uma retirada on-chain. Se uma transação falhar ou a rede reorganizar blocos, o serviço deve conciliar o pedido e o evento, bloquear crédito duplo e mostrar o estado correto em vez de presumir sucesso. Os tokens disponíveis podem ser retirados sem bloqueio do projeto, sujeitos à confirmação da rede.</p></div>
        <div className="whitepaper__formula"><span>EXEMPLO DE TEMPO ELEGÍVEL</span><p>100 BETTEX por metade do mês ≈ 50 BETTEX mantidos o mês inteiro, para efeito da fração de participação. O cálculo real usa intervalos entre mudanças de saldo, não o saldo no dia do clique.</p></div>
      </>;
    case 7:
      return <>
        <div className="whitepaper__lead whitepaper__lead--dark"><span>DESTINAÇÃO DA RECEITA PRIMÁRIA</span><p><strong>100%</strong> do dinheiro recebido nas vendas públicas e a investidores entra na tesouraria de investimentos, sem usar esses recursos para despesas operacionais do projeto.</p></div>
        <div className="whitepaper__prose"><p>A tesouraria mantém <strong>50% em USDC líquido como reserva defensiva</strong> e <strong>50% como parcela investível</strong>. Da metade investível, cada agente recebe reserva de <strong>25%</strong>, equivalente a 12,5% do total. Saldo não usado por um agente permanece reservado a ele, sem redistribuição aos demais. Os registros de custódia e o livro contábil devem permitir verificar essa segregação.</p></div>
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
          <div><span>01</span><p>Fechar o mês-calendário em <strong>UTC</strong>. No livro em USD, somar apenas ganhos e perdas <strong>realizados</strong> em USDC e descontar custos. Ganhos ainda em posição aberta não entram.</p></div>
          <div><span>02</span><p>Compensar o saldo de perdas acumuladas de meses anteriores. Se o resultado líquido continuar zero ou negativo, não distribuir e carregar a perda remanescente.</p></div>
          <div><span>03</span><p>Se positivo, reservar <strong>50% para distribuição</strong> e manter <strong>50% na tesouraria</strong>. Apurar os intervalos de staking de cada endereço entre início e fim do mês; os tokens do projeto não têm peso especial.</p></div>
          <div><span>04</span><p>No <strong>quinto dia útil do mês seguinte</strong>, conferir total de elegíveis, arredondamento, obrigações e fundos; atribuir cada crédito uma vez, com identificador de período e trilha de cálculo.</p></div>
        </div>
        <div className="whitepaper__formula"><span>FRAÇÃO MENSAL</span><p>BETTEX elegíveis da pessoa × tempo em staking <b>÷</b> soma de BETTEX elegíveis × tempo de todos os participantes</p></div>
        <div className="whitepaper__prose"><p><strong>Exemplo apenas matemático:</strong> lucro líquido realizado de US$ 1.000 depois de custos e perdas antigas; US$ 500 ficam para distribuição e US$ 500 na tesouraria. Se a pessoa representou 10% de todo o saldo-tempo elegível do mês, seu crédito seria 50 USDC. Se não teve tokens elegíveis em nenhum instante, o crédito é <strong>zero</strong>, mesmo com lucro dos agentes.</p><p>O aplicativo precisa armazenar instantes de depósitos e pedidos de retirada, uma versão do cálculo e a origem dos resultados. Registros fechados são corrigidos por ajuste identificado, nunca por uma edição invisível do saldo. A política de arredondamento de frações de USDC, o calendário de dias úteis e a auditoria do fechamento fazem parte das regras de apuração. Trocar filtros do gráfico jamais cria crédito.</p></div>
      </>;
    case 10:
      return <>
        <div className="whitepaper__currency-grid">
          <div><span>01 / CONTABILIDADE</span><strong>USD</strong><p>Resultados e riscos são reconciliados com operações efetivas em USDC.</p></div>
          <div><span>02 / EXIBIÇÃO</span><strong>BRL</strong><p>Valor convertido apenas para referência; não cria saldo sacável em reais.</p></div>
          <div><span>03 / SAÍDA</span><strong>USDC</strong><p>Ativo digital definido para envio externo somente na Arbitrum One.</p></div>
        </div>
        <Flow label="Percurso contábil e de saída" steps={['O fechamento atribui USDC à Carteira BETTEX (saldo alocado), com registro de período.', 'A pessoa transfere parte ou todo esse USDC para a carteira pessoal dentro do aplicativo; trata-se de lançamento interno.', 'A pessoa informa endereço de destino e rede Arbitrum One, confere valor e custos de terceiros e confirma o pedido de saída.', 'O sistema deve reservar o saldo, autorizar uma única transação, acompanhar hash e confirmação e conciliar o saque.']} />
        <div className="whitepaper__prose"><p>Um pedido externo deve passar por validação de saldo, sessão, endereço, rede, contrato USDC correto, limites e revisão de risco. O registro fica <strong>pendente</strong> enquanto é preparado; a mesma solicitação não pode ser paga duas vezes se houver repetição ou queda de conexão. Uma transação enviada recebe hash, passa por confirmação e só então se torna <strong>concluída</strong>. Falhas exigem estorno contábil e investigação; o aplicativo não deve tratar um hash enviado como prova definitiva de recebimento.</p><p>A <strong>taxa própria BETTEX é zero</strong> para depósito e retirada de staking, transferência interna de lucro e saque de USDC. Taxas da rede e de terceiros são variáveis, separadas e precisam ser mostradas antes da confirmação; a definição de quem paga o gás na retirada é um requisito operacional. Envio à rede errada pode causar perda irreversível. <strong>Não há saque bancário ou em reais.</strong></p></div>
      </>;
    case 11:
      return <>
        <div className="whitepaper__lead"><span>REQUISITOS DE OPERAÇÃO SEGURA</span><p>Os componentes financeiros e on-chain devem operar com controles verificáveis, separação de responsabilidades e capacidade de interromper fluxos inseguros sem perder o histórico contábil.</p></div>
        <div className="whitepaper__steps">
          <div><span>01</span><p>Aplicar controle de acesso mínimo, autenticação forte para operadores e segregação de funções. Mudanças em contratos, permissões, limites e destinos de ativos exigem aprovação por múltiplos responsáveis e trilha auditável.</p></div>
          <div><span>02</span><p>Proteger chaves com armazenamento e procedimentos de recuperação definidos; estabelecer limites de assinatura e política de revogação. Endereços de contratos, ativos e tesouraria devem ser verificados por fontes independentes antes de serem usados.</p></div>
          <div><span>03</span><p>Testar contratos, integrações, indexadores e livro contábil contra duplicidade, reordenação de blocos, falha de rede, divergência de saldo, repetição de mensagens e recuperação. Exigir auditoria independente dos contratos e controles de custódia.</p></div>
          <div><span>04</span><p>Monitorar saldos, obrigações, limites e integrações; emitir alertas acionáveis e manter procedimentos de resposta a incidentes. A pausa deve bloquear novas ordens sem apagar obrigações já atribuídas; retomada depende de conciliação e autorização registrada.</p></div>
        </div>
        <div className="whitepaper__prose"><p>A continuidade do serviço deve preservar registros imutáveis com correções por estorno identificado, cópias de segurança testadas e reconciliação periódica entre pagamentos, emissão, staking, tesouraria e saídas. Uma indisponibilidade ou falha de integração deve resultar em estado pendente ou bloqueio, nunca em confirmação presumida. As escolhas de custódia, permissões, integrações e conformidade exigem validação técnica e jurídica.</p></div>
        <div className="whitepaper__aside-callout"><span>SEQUÊNCIA DO PROJETO</span><p>O <a href="#roadmap" data-testid="link-documentacao-roadmap">Roadmap da BETTEX</a> apresenta o percurso do pré-lançamento ao acesso aos resultados.</p></div>
      </>;
    default:
      return <>
        <div className="whitepaper__prose"><p>As regras econômicas e os controles descritos aqui <strong>não garantem retorno ou proteção do capital</strong>. Contratos e carteiras podem falhar, a rede pode ficar congestionada, chaves podem ser perdidas e USDC pode perder sua referência ao dólar. Há risco de liquidez do token, perdas dos agentes, integração inadequada, custódia e mudança regulatória.</p></div>
        <div className="whitepaper__risk-list">
          <div><span>MERCADO E IA</span><p>Dados atrasados, vieses e execução ruim podem causar perdas consecutivas; limite de risco não cria lucro.</p></div>
          <div><span>REDE E CONTRATOS</span><p>Erros de contrato, transações irreversíveis, congestionamento, eventos reorganizados e endereço ou ativo errado podem impedir ou perder uma saída.</p></div>
          <div><span>CARTEIRAS E CUSTÓDIA</span><p>Perda de chave privada não é resolvida por recuperação da conta do aplicativo. Desvio de fundos e divergência entre livro e reserva exigem bloqueio e investigação.</p></div>
          <div><span>LEI E TERCEIROS</span><p>Uma plataforma pode não permitir automação; uma jurisdição pode vedar venda, distribuição ou operação em determinado mercado.</p></div>
        </div>
        <Subhead>Escolhas sujeitas a validação</Subhead>
        <div className="whitepaper__prose"><p>As especificações de identidade e verificação, custódia de USDC e assinaturas da tesouraria, contratos e endereços oficiais, meio de pagamento e conversão de receita, provedores autorizados, confirmações de rede, pagamento de gás, calendário de dias úteis, arredondamento e resposta a incidentes devem ser validadas pelos responsáveis técnicos e jurídicos. Nenhum requisito técnico substitui autorização legal ou controles independentes.</p></div>
        <div className="whitepaper__glossary"><span>GLOSSÁRIO BREVE</span><p><strong>On-chain:</strong> registrado na blockchain. <strong>API:</strong> serviço que conecta app e servidor. <strong>ERC-20:</strong> interface comum de token fungível. <strong>Gás:</strong> custo de executar transação. <strong>Staking:</strong> depósito que torna BETTEX elegível. <strong>Conciliação:</strong> comparação entre registros, transações e fundos para localizar divergências. <strong>Idempotência:</strong> repetir o mesmo pedido sem repetir seu efeito.</p></div>
        <div className="whitepaper__lead whitepaper__lead--dark whitepaper__closing"><span>ANTES DE DECIDIR</span><p>Não há rendimento prometido, capital protegido ou aprovação implícita. Considere os riscos de mercado, liquidez, tecnologia, custódia e regulação antes de qualquer decisão financeira.</p></div>
      </>;
  }
}