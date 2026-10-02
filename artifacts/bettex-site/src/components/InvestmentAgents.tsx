export function InvestmentAgents() {
  return (
    <>
      <div className="whitepaper__lead"><span>GESTÃO DO CAPITAL · ANÁLISE · EXECUÇÃO</span><p>A BETTEX organiza seus agentes de IA em duas funções complementares: gerir a tesouraria e identificar, comparar e executar oportunidades de investimento. Os agentes compartilham informações, mas têm responsabilidades distintas. A escolha de uma oportunidade e a disponibilidade de capital precisam ser avaliadas em conjunto, antes da execução.</p></div>

      <section id="documentacao-agente-tesouraria" aria-labelledby="agente-tesouraria-title">
        <h4 id="agente-tesouraria-title" className="whitepaper__subhead">Agente da tesouraria: gestão e evolução dos regimentos</h4>
        <div className="whitepaper__prose">
          <p><strong>O agente da tesouraria cuida da capacidade financeira do projeto como um todo.</strong> Acompanha os recursos conciliados, a reserva defensiva, a parcela investível, os valores comprometidos em ordens e posições e as obrigações de pagamento. Seu papel não é escolher isoladamente uma aposta ou um ativo, mas coordenar quanto capital pode ser disponibilizado, em quais condições e com qual impacto sobre a liquidez e o risco global.</p>
          <p><strong>Todas as regras da tesouraria e dos controles de risco são iniciais e podem ser ajustadas pela própria IA.</strong> O agente ajusta e otimiza seus regimentos internos em conjunto com os agentes de investimento, considerando a situação das reservas, as necessidades de liquidez, os custos de execução, a exposição acumulada e os resultados realizados. Os limites e percentuais apresentados em <a href="#documentacao-controles">Controles de risco</a> são parâmetros de partida, não regras permanentemente fixas.</p>
          <p>Essa gestão distingue dinheiro disponível de capital já comprometido e de ganhos ainda não realizados. Uma oportunidade pode ser atrativa para um agente de investimento e, mesmo assim, não receber capital se comprometer a tesouraria ou concentrar exposição. A distribuição dos recursos entre mercados é dinâmica, sem obrigação de investir em todos eles nem parcelas fixas por mercado.</p>
        </div>
        <h4 className="whitepaper__subhead">Ciclo de atuação da tesouraria</h4>
        <div className="whitepaper__steps">
          <div><span>01</span><p><strong>Consolidar.</strong> Reunir saldos conciliados, reservas, ordens pendentes, posições abertas, custos e obrigações. Separar a tesouraria das carteiras pessoais e identificar o capital efetivamente disponível.</p></div>
          <div><span>02</span><p><strong>Coordenar.</strong> Receber as oportunidades e necessidades de capital dos agentes de investimento. Comparar o uso dos recursos com a liquidez necessária, a exposição conjunta e as regras vigentes.</p></div>
          <div><span>03</span><p><strong>Ajustar.</strong> Ajustar os regimentos e parâmetros internos conforme a análise da IA. O registro de cada alteração deve identificar a regra anterior, a nova regra, o motivo e o momento de vigência, para que os agentes e o núcleo de risco utilizem a mesma versão.</p></div>
          <div><span>04</span><p><strong>Acompanhar.</strong> Acompanhar a execução e a liquidação, atualizar compromissos e reservas e incorporar os resultados conciliados à próxima avaliação. No modelo inicial, reservas insuficientes têm prioridade de recomposição antes da distribuição ao staking.</p></div>
        </div>
        <div className="whitepaper__prose">
          <p>A autonomia para ajustar regras não é uma permissão para movimentar capital fora das regras vigentes. O smart contract, os serviços de conciliação e o núcleo independente de risco aplicam as permissões e os parâmetros correspondentes. O mecanismo de atualização desses componentes deve ser especificado e validado para que um ajuste da IA não exista apenas no texto de sua decisão.</p>
        </div>
      </section>

      <section id="documentacao-agentes-investimento" aria-labelledby="agentes-investimento-title">
        <h4 id="agentes-investimento-title" className="whitepaper__subhead">Agentes de investimento: especialização por mercado</h4>
        <div className="whitepaper__prose">
          <p>Os agentes de investimento transformam dados de mercado em propostas comparáveis: oportunidade identificada, hipótese da operação, retorno esperado, custos, liquidez, capital necessário e riscos. A IA BETTEX coordena a comparação entre os quatro mercados; os agentes especializados aprofundam a análise de cada ambiente e acompanham suas operações. <strong>BETTEX não é capital dessas estratégias</strong>: a operação utiliza os recursos autorizados da tesouraria, com apuração conciliada em USDC.</p>
        </div>
        <div className="whitepaper__risk-list">
          <div><span>PREVISÕES · PROBABILIDADES E PREÇOS</span><p>Compara a probabilidade estimada de um evento com o preço das posições disponíveis, considerando liquidez, custos, prazo e regras de resolução. O agente acompanha mudanças relevantes e a exposição a eventos relacionados. Na Polymarket, consulta dados de mercado e utiliza a API de trading e o CLOB para ordens autorizadas; uma estimativa favorável não garante que o evento ocorrerá nem que a ordem será executada nas condições esperadas.</p></div>
          <div><span>AÇÕES E CRIPTO · ANÁLISE E TRADING</span><p>Cruza preços, liquidez, volatilidade, custos e sinais de análise para avaliar operações e acompanhar posições. Inferências opcionais da Allora enriquecem a análise, mas não substituem a decisão BETTEX nem executam ordens. A Robinhood Crypto Trading API é uma possibilidade de conector para cripto, sujeita à disponibilidade para clientes nos Estados Unidos; operações em ações exigem um canal autorizado próprio, não pressuposto por essa API.</p></div>
          <div><span>ESPORTES · ODDS E SUREBET</span><p>Compara odds, mercados e condições de liquidação entre casas de apostas. A especialização futura em surebet busca combinações que cubram os resultados de um evento, calculando valores por aposta e custos da operação conjunta. A análise deve considerar odds que mudam, limites das casas, apostas recusadas e regras diferentes de cancelamento: a cobertura calculada pode não se concretizar se alguma parte não for executada ou liquidada como previsto.</p></div>
          <div><span>CASSINOS · PROMOÇÕES E BONUS HUNTING</span><p>A especialização futura em bonus hunting analisa bônus, requisitos de aposta, jogos elegíveis, prazos, limites de saque e demais condições das promoções. Compara o benefício esperado com o capital necessário, os custos e o risco de cumprir a oferta. Não presume que todo bônus seja vantajoso ou utilizável, nem que uma promoção elimine a variância e a vantagem da casa. A execução depende da elegibilidade e das regras do provedor.</p></div>
        </div>
        <div className="whitepaper__prose">
          <p>As especializações e conexões descrevem o modelo e sua expansão, não integrações já ativas. Ferramentas <strong>MCP</strong> são usadas onde estiverem disponíveis; nos demais casos, os agentes utilizam as <strong>APIs autorizadas</strong> de cada serviço. Acesso a dados não equivale a permissão para enviar ordens, apostar ou movimentar fundos.</p>
        </div>
      </section>

      <section id="documentacao-ciclo-agentes" aria-labelledby="ciclo-agentes-title">
        <h4 id="ciclo-agentes-title" className="whitepaper__subhead">Da oportunidade ao resultado: um ciclo compartilhado</h4>
        <div className="whitepaper__steps">
          <div><span>01</span><p><strong>Coletar e analisar.</strong> Registrar origem e horário dos dados; reunir preços, probabilidades, odds, condições das ofertas, liquidez e custos. O agente especializado identifica a oportunidade e explicita os pressupostos da análise.</p></div>
          <div><span>02</span><p><strong>Comparar e definir capital.</strong> A IA BETTEX compara oportunidades entre mercados segundo retorno esperado, custos, liquidez, exposição e risco. Em conjunto com o agente da tesouraria, define o valor proposto dentro da parcela investível disponível. Selecionar uma oportunidade não obriga sua execução.</p></div>
          <div><span>03</span><p><strong>Validar e executar.</strong> O núcleo independente de risco valida a operação, o valor e as permissões segundo as regras vigentes. O capital comprometido é reservado antes do envio; somente então o conector autorizado executa. Pedidos repetidos não podem gerar novas ordens ou consumir o mesmo limite duas vezes.</p></div>
          <div><span>04</span><p><strong>Conciliar e reavaliar.</strong> Acompanhar execução, falhas, cancelamentos e liquidação; apurar os resultados realizados e os custos. Devolver à tesouraria os dados conciliados para atualizar recursos, exposição e regimentos, e aos agentes de investimento os resultados necessários para reavaliar suas estratégias.</p></div>
        </div>
        <h4 className="whitepaper__subhead">Decisões e ajustes verificáveis</h4>
        <div className="whitepaper__prose">
          <p>O registro público acompanha oportunidades coletadas, selecionadas e descartadas, motivos da escolha, valor investido, regra aplicada e estado da operação. Os ajustes realizados pela IA devem ser identificados e rastreáveis, sem reescrever decisões anteriores. Chaves privadas, credenciais e dados pessoais não integram esse registro.</p>
          <p>O histórico de resultados permite revisar a análise e o uso do capital, mas desempenho passado e otimização dos regimentos não garantem ganhos futuros. Os <a href="#documentacao-arquitetura">desenhos 7 e 8 da arquitetura</a> apresentam as conexões e o fluxo de oportunidades que fundamentam este ciclo.</p>
        </div>
      </section>
    </>
  );
}