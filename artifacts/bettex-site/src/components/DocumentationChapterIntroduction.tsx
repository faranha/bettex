/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';

/** Explain the concepts before presenting the chapter's rules or technical reference. */
export function DocumentationChapterIntroduction({ chapterId }: { chapterId: string }) {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  const sections: Record<string, { term: string; text: string }[]> = {
    'documentacao-como-funciona': [
      { term: 'BETTEX', text: x(
        'é uma comunidade que desenvolve um sistema de regras, chamado protocolo, para coordenar operações com programas de inteligência artificial, chamados agentes, e distribuir parte dos resultados. O participante mantém BETTEX, o ativo digital da comunidade, na carteira do aplicativo; os agentes cuidam da análise e coordenação das operações. No demo atual, tudo é apenas visual, sem movimentar dinheiro real.',
        'is a community developing a system of rules, called a protocol, to coordinate operations through artificial intelligence programs, called agents, and distribute a share of the results. A participant holds BETTEX, the community’s digital asset, in the app wallet; agents handle the analysis and coordination of operations. In the current demo, everything is visual only, without moving real money.',
        'es una comunidad que desarrolla un sistema de reglas, llamado protocolo, para coordinar operaciones mediante programas de inteligencia artificial, llamados agentes, y distribuir parte de los resultados. El participante mantiene BETTEX, el activo digital de la comunidad, en la cartera de la aplicación; los agentes atienden el análisis y la coordinación de operaciones. En el demo actual, todo es solo visual, sin mover dinero real.',
      ) },
      { term: x('DeFi', 'DeFi', 'DeFi'), text: x(
        'significa finanças descentralizadas: serviços financeiros cujas regras são executadas por programas chamados contratos inteligentes em uma blockchain. A blockchain é um registro digital compartilhado; o contrato aplica as regras desse registro. Descentralização não elimina riscos nem responsabilidades.',
        'means decentralized finance: financial services whose rules are executed by programs called smart contracts on a blockchain. A blockchain is a shared digital record; a contract applies the rules recorded there. Decentralization does not eliminate risks or responsibilities.',
        'significa finanzas descentralizadas: servicios financieros cuyas reglas se ejecutan mediante programas llamados contratos inteligentes en una blockchain. La blockchain es un registro digital compartido; el contrato aplica las reglas de ese registro. La descentralización no elimina riesgos ni responsabilidades.',
      ) },
      { term: x('DEX', 'DEX', 'DEX'), text: x(
        'é uma plataforma descentralizada para trocar ativos digitais por meio de contratos. Negociar BETTEX em uma DEX significa comprar ou vender o token com outros participantes, não resgatar dinheiro da tesouraria do projeto. A possibilidade de negociação não garante compradores, preço ou liquidez.',
        'is a decentralized platform for exchanging digital assets through contracts. Trading BETTEX on a DEX means buying or selling the token with other participants, not redeeming money from the project treasury. The ability to trade does not guarantee buyers, price or liquidity.',
        'es una plataforma descentralizada para intercambiar activos digitales mediante contratos. Negociar BETTEX en una DEX significa comprar o vender el token con otros participantes, no rescatar dinero de la tesorería del proyecto. La posibilidad de negociar no garantiza compradores, precio ni liquidez.',
      ) },
      { term: x('DeFAI', 'DeFAI', 'DeFAI'), text: x(
        'combina DeFi com inteligência artificial. Na BETTEX, agentes de IA analisam informações e coordenam propostas e ações conforme permissões e controles. A IA não substitui as regras dos contratos nem torna uma operação automaticamente segura ou lucrativa.',
        'combines DeFi with artificial intelligence. In BETTEX, AI agents analyze information and coordinate proposals and actions under permissions and controls. AI does not replace contract rules or automatically make an operation safe or profitable.',
        'combina DeFi con inteligencia artificial. En BETTEX, agentes de IA analizan información y coordinan propuestas y acciones según permisos y controles. La IA no sustituye las reglas de los contratos ni convierte una operación en automáticamente segura o rentable.',
      ) },
      { term: x('BETTEX e USDC', 'BETTEX and USDC', 'BETTEX y USDC'), text: x(
        'são tokens, ativos digitais registrados na blockchain. BETTEX é o token da comunidade: o saldo disponível no aplicativo permite participar dos resultados conforme as regras, sem dar propriedade da tesouraria. USDC é um token referenciado ao dólar, usado para saldos e pagamentos; seu valor em reais pode variar.',
        'are tokens, digital assets recorded on a blockchain. BETTEX is the community token: an available balance in the app allows participation in results under the rules, without conferring treasury ownership. USDC is a dollar-referenced token used for balances and payments; its value in Brazilian reais can vary.',
        'son tokens, activos digitales registrados en la blockchain. BETTEX es el token de la comunidad: el saldo disponible en la aplicación permite participar en los resultados según las reglas, sin dar propiedad de la tesorería. USDC es un token referenciado al dólar, usado para saldos y pagos; su valor en reales brasileños puede variar.',
      ) },
    ],
    'documentacao-agentes': [
      { term: x('Agente de IA', 'AI agent', 'Agente de IA'), text: x(
        'é um software que analisa informações e organiza decisões para um objetivo. Aqui, esse objetivo é coordenar a operação do protocolo dentro de regras de mercado, risco e tesouraria. Não é uma pessoa escolhendo apostas por você, nem uma garantia de acerto.',
        'is software that analyzes information and organizes decisions toward an objective. Here, that objective is coordinating protocol operations within market, risk and treasury rules. It is not a person choosing bets for you or a guarantee of correct decisions.',
        'es un software que analiza información y organiza decisiones para un objetivo. Aquí, ese objetivo es coordinar la operación del protocolo dentro de reglas de mercado, riesgo y tesorería. No es una persona eligiendo apuestas por ti ni una garantía de acierto.',
      ) },
      { term: x('Agente central e subagentes', 'Central agent and subagents', 'Agente central y subagentes'), text: x(
        'dividem o trabalho. BETTEX coordena o conjunto; subagentes cuidam de tarefas específicas, como analisar BTC, ETH e SOL. Risco verifica limites e tesouraria verifica os recursos. Por exemplo, uma sugestão de compra pode ser recusada por exceder um limite: identificar uma oportunidade não significa autorizar sua execução.',
        'divide the work. BETTEX coordinates the whole; subagents handle specific tasks, such as analyzing BTC, ETH and SOL. Risk checks limits and treasury checks resources. For example, a purchase suggestion can be rejected for exceeding a limit: identifying an opportunity does not mean authorizing execution.',
        'dividen el trabajo. BETTEX coordina el conjunto; subagentes atienden tareas específicas, como analizar BTC, ETH y SOL. Riesgo verifica límites y tesorería verifica recursos. Por ejemplo, una sugerencia de compra puede rechazarse por superar un límite: identificar una oportunidad no significa autorizar su ejecución.',
      ) },
    ],
    'documentacao-emissao': [
      { term: 'Tokenomics', text: x(
        'é o conjunto de regras econômicas do token: quantos tokens existem, para quem são destinados, quando ficam disponíveis e para que servem. Ter BETTEX não equivale a possuir ações de uma empresa ou uma parcela da tesouraria.',
        'is the set of economic rules for the token: how many tokens exist, who receives them, when they become available and what they are used for. Holding BETTEX is not equivalent to owning company shares or a portion of the treasury.',
        'es el conjunto de reglas económicas del token: cuántos tokens existen, a quién se destinan, cuándo están disponibles y para qué sirven. Tener BETTEX no equivale a poseer acciones de una empresa ni una parte de la tesorería.',
      ) },
      { term: x('Emissão, mint e vesting', 'Issuance, mint and vesting', 'Emisión, mint y vesting'), text: x(
        'descrevem etapas diferentes. Mint é a criação de tokens; venda é sua aquisição mediante pagamento. Vesting é a liberação gradual de tokens ao longo de um calendário. Enquanto bloqueados pelo vesting, esses tokens não estão disponíveis para participar do staking.',
        'describe different stages. Mint is the creation of tokens; a sale is their acquisition through payment. Vesting is the gradual release of tokens according to a schedule. While locked by vesting, those tokens are not available to participate in staking.',
        'describen etapas diferentes. Mint es la creación de tokens; venta es su adquisición mediante pago. Vesting es la liberación gradual de tokens según un calendario. Mientras estén bloqueados por el vesting, esos tokens no están disponibles para participar en staking.',
      ) },
      { term: x('Tesouraria, recompra e queima', 'Treasury, buyback and burn', 'Tesorería, recompra y quema'), text: x(
        'tratam dos recursos do protocolo, separados dos saldos pessoais. A tesouraria reúne recursos para suas operações e obrigações. Recompra usa recursos para adquirir BETTEX no mercado; queima retira tokens definitivamente de circulação. Queimar tokens não é pagar rendimentos ao titular.',
        'concern protocol resources, separate from personal balances. The treasury holds resources for protocol operations and obligations. Buyback uses resources to acquire BETTEX on the market; burn permanently removes tokens from circulation. Burning tokens is not paying earnings to a holder.',
        'se refieren a los recursos del protocolo, separados de los saldos personales. La tesorería reúne recursos para operaciones y obligaciones del protocolo. La recompra utiliza recursos para adquirir BETTEX en el mercado; la quema retira tokens definitivamente de circulación. Quemar tokens no equivale a pagar rendimientos al titular.',
      ) },
    ],
    'documentacao-staking': [
      { term: x('Participar dos resultados', 'Participating in results', 'Participar en los resultados'), text: x(
        'significa poder receber uma parte dos lucros distribuíveis do protocolo por manter BETTEX no aplicativo. Você não precisa escolher cada operação dos agentes. O pagamento depende de haver resultado e de cumprir as regras de participação; não é salário, juros fixos nem promessa de rendimento.',
        'means being able to receive a share of the protocol’s distributable profits by holding BETTEX in the app. You do not need to choose each agent operation. Payment depends on there being a result and meeting participation rules; it is not a salary, fixed interest or a promise of earnings.',
        'significa poder recibir una parte de los beneficios distribuibles del protocolo por mantener BETTEX en la aplicación. No necesitas elegir cada operación de los agentes. El pago depende de que exista un resultado y se cumplan las reglas de participación; no es un salario, interés fijo ni una promesa de rendimiento.',
      ) },
      { term: x('Staking', 'Staking', 'El staking'), text: x(
        'no mercado cripto costuma envolver tokens usados para apoiar a segurança de uma rede e permitir recompensas. Na BETTEX, o termo designa a participação automática nos resultados pelo saldo de BETTEX disponível na carteira do aplicativo. Não exige ativar um plano, travar tokens ou validar blocos da rede. Manter BETTEX fora do aplicativo não é suficiente para participar.',
        'in crypto markets often involves tokens used to support network security and enable rewards. In BETTEX, the term refers to automatic participation in results through the available BETTEX balance in the app wallet. It does not require activating a plan, locking tokens or validating network blocks. Holding BETTEX outside the app is not sufficient to participate.',
        'en el mercado cripto suele involucrar tokens usados para apoyar la seguridad de una red y permitir recompensas. En BETTEX, el término designa la participación automática en los resultados mediante el saldo de BETTEX disponible en la cartera de la aplicación. No exige activar un plan, bloquear tokens ni validar bloques de la red. Mantener BETTEX fuera de la aplicación no basta para participar.',
      ) },
      { term: x('Rodada e saldo elegível', 'Round and eligible balance', 'Ronda y saldo elegible'), text: x(
        'definem quando e com quais tokens você participa. Uma rodada é um período de apuração das operações e dos resultados. Saldo elegível é a quantidade de BETTEX que pode participar conforme as regras de abertura da rodada; tokens bloqueados no vesting e estoque de venda ficam fora. Entradas novas aguardam a próxima rodada.',
        'define when and with which tokens you participate. A round is a period for accounting for operations and results. Eligible balance is the amount of BETTEX that can participate under the round-opening rules; tokens locked by vesting and sale inventory are excluded. New entries wait for the next round.',
        'definen cuándo y con qué tokens participas. Una ronda es un periodo de cómputo de operaciones y resultados. Saldo elegible es la cantidad de BETTEX que puede participar según las reglas de apertura de la ronda; tokens bloqueados por el vesting e inventario de venta quedan fuera. Las nuevas entradas esperan a la próxima ronda.',
      ) },
      { term: x('Lucro e pagamento', 'Profit and payment', 'Beneficio y pago'), text: x(
        'não são a mesma coisa. Lucro elegível é o resultado que pode ser distribuído depois da apuração e das condições do protocolo. A parcela do staking é 25% desse lucro, quando houver distribuição, e é repartida conforme o saldo elegível e as regras de cálculo. O pagamento ocorre em USDC, token referenciado ao dólar, não pela criação de novos BETTEX. Sair com BETTEX, mesmo parcialmente, cancela os créditos ainda não pagos; USDC já recebido e conciliado permanece seu.',
        'are not the same thing. Eligible profit is the result that can be distributed after accounting and meeting protocol conditions. The staking share is 25% of that profit when a distribution occurs, divided according to eligible balance and calculation rules. Payment is in USDC, a dollar-referenced token, not through creating new BETTEX. Exiting with BETTEX, even partially, cancels unpaid credits; USDC already received and reconciled remains yours.',
        'no son lo mismo. Beneficio elegible es el resultado que puede distribuirse después del cómputo y de cumplir las condiciones del protocolo. La parte del staking es el 25% de ese beneficio cuando hay distribución, repartida según el saldo elegible y las reglas de cálculo. El pago se realiza en USDC, un token referenciado al dólar, no creando nuevos BETTEX. Salir con BETTEX, incluso parcialmente, cancela los créditos aún no pagados; el USDC ya recibido y conciliado sigue siendo tuyo.',
      ) },
    ],
    'documentacao-roadmap': [
      { term: 'Roadmap', text: x(
        'é o plano de evolução do projeto: organiza etapas, dependências e o que se pretende entregar. Uma data prevista não significa que todas as condições técnicas, jurídicas e financeiras já estejam atendidas.',
        'is the project’s development plan: it organizes stages, dependencies and intended deliveries. A planned date does not mean all technical, legal and financial conditions have already been met.',
        'es el plan de evolución del proyecto: organiza etapas, dependencias y lo que se pretende entregar. Una fecha prevista no significa que todas las condiciones técnicas, jurídicas y financieras ya estén cumplidas.',
      ) },
      { term: x('Demo e lançamento', 'Demo and launch', 'Demo y lanzamiento'), text: x(
        'são etapas distintas. O demo atual mostra visualmente como o aplicativo organiza carteira, agentes e resultados, sem movimentar dinheiro real. Lançar uma operação exige contratos, integrações, testes, recursos e validações adequados; os marcos abaixo mostram essa evolução, não uma operação já disponível.',
        'are different stages. The current demo visually shows how the app organizes wallets, agents and results without moving real money. Launching operations requires appropriate contracts, integrations, tests, resources and validations; the milestones below show that development, not operations already available.',
        'son etapas distintas. El demo actual muestra visualmente cómo la aplicación organiza cartera, agentes y resultados, sin mover dinero real. Lanzar una operación exige contratos, integraciones, pruebas, recursos y validaciones adecuados; los hitos siguientes muestran esa evolución, no una operación ya disponible.',
      ) },
    ],
    'documentacao-riscos': [
      { term: x('Governança e administração', 'Governance and administration', 'Gobernanza y administración'), text: x(
        'definem como decisões são tomadas e quem pode autorizar mudanças. Na BETTEX, fundador e time conduzem a administração inicial, com evolução prevista para funções exercidas por IA. Ter tokens não concede automaticamente voto ou controle da tesouraria.',
        'define how decisions are made and who can authorize changes. In BETTEX, the founder and team handle initial administration, with a planned transition toward functions performed by AI. Holding tokens does not automatically confer voting rights or treasury control.',
        'definen cómo se toman decisiones y quién puede autorizar cambios. En BETTEX, el fundador y el equipo conducen la administración inicial, con evolución prevista hacia funciones ejercidas por IA. Tener tokens no concede automáticamente voto ni control de la tesorería.',
      ) },
      { term: x('Mandatos e controles', 'Mandates and controls', 'Mandatos y controles'), text: x(
        'limitam o que cada agente pode fazer. Um mandato é uma autorização com objetivo, recursos e limites definidos. Controles verificam se uma ação respeita essa autorização. Uma previsão favorável não permite ignorar limites, permissões ou exigências legais.',
        'limit what each agent can do. A mandate is an authorization with a defined objective, resources and limits. Controls check whether an action respects that authorization. A favorable forecast does not permit bypassing limits, permissions or legal requirements.',
        'limitan lo que cada agente puede hacer. Un mandato es una autorización con objetivo, recursos y límites definidos. Los controles verifican si una acción respeta esa autorización. Una previsión favorable no permite ignorar límites, permisos ni requisitos legales.',
      ) },
      { term: x('Risco e conciliação', 'Risk and reconciliation', 'Riesgo y conciliación'), text: x(
        'também fazem parte da operação. Risco inclui perdas de mercado, falhas técnicas e restrições jurídicas; usar IA ou contratos não elimina essas possibilidades. Conciliar significa conferir registros, operações e saldos antes de considerar um resultado confirmado ou um pagamento concluído.',
        'are also part of operations. Risk includes market losses, technical failures and legal restrictions; using AI or contracts does not eliminate those possibilities. Reconciliation means checking records, operations and balances before treating a result as confirmed or a payment as completed.',
        'también forman parte de la operación. El riesgo incluye pérdidas de mercado, fallos técnicos y restricciones jurídicas; usar IA o contratos no elimina esas posibilidades. Conciliar significa verificar registros, operaciones y saldos antes de considerar confirmado un resultado o completado un pago.',
      ) },
    ],
  };
  const paragraphs = sections[chapterId];
  if (!paragraphs) return null;
  return <div className="whitepaper__prose" data-i18n="translated" data-testid={`documentation-concepts-${chapterId}`}>
    {paragraphs.map(({ term, text }) => <p key={term}><strong>{term}</strong>{' '}{text}</p>)}
  </div>;
}
