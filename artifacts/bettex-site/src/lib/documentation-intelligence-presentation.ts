/** Documentation-only labels for the agent hierarchy. Research direction, not delivered capability. */
const passages = {
  mapLabel: ['Hierarquia de pesquisa dos agentes', 'Agent research hierarchy', 'Jerarquía de investigación de los agentes'],
  centerTag: ['Inteligência central', 'Central intelligence', 'Inteligencia central'],
  centerRole: ['Sintetiza, compara hipóteses e pede novas investigações', 'Synthesizes, compares hypotheses and requests further investigation', 'Sintetiza, compara hipótesis y solicita nuevas investigaciones'],
  supportTag: ['Agentes de apoio', 'Supporting agents', 'Agentes de apoyo'],
  initialContext: ['Contexto inicial do agente', 'Initial agent context', 'Contexto inicial del agente'],
  centralContext: ['Objetivos, oportunidades, evidências e respostas dos agentes.', 'Objectives, opportunities, evidence and agent responses.', 'Objetivos, oportunidades, evidencias y respuestas de los agentes.'],
  riskRole: ['Cenários e premissas', 'Scenarios and assumptions', 'Escenarios y premisas'],
  governanceRole: ['Interpretação e propostas', 'Interpretation and proposals', 'Interpretación y propuestas'],
  treasuryRole: ['Capital, liquidez e alternativas', 'Capital, liquidity and alternatives', 'Capital, liquidez y alternativas'],
  marketsTitle: ['Subagentes de trading por mercado', 'Trading subagents by market', 'Subagentes de trading por mercado'],
  markets: [
    'Cada mercado tem seu próprio subagente de trading, que se comunica diretamente com o agente BETTEX. Cada especialidade interpreta seus dados, formula hipóteses e apresenta propostas com evidências e incertezas. BETTEX confronta essas análises com o apoio dos subagentes de risco e tesouraria. A pesquisa também inclui ações. A linha de base demonstrativa não executa operações reais; a abertura de cada mercado depende de integração e adequação legal.',
    'Each market has its own trading subagent, which communicates directly with the BETTEX agent. Each specialty interprets its data, formulates hypotheses and presents proposals with evidence and uncertainties. BETTEX weighs these analyses with support from risk and treasury subagents. Research also includes equities. The demonstration baseline does not execute real operations; opening each market depends on integration and legal compliance.',
    'Cada mercado tiene su propio subagente de trading, que se comunica directamente con el agente BETTEX. Cada especialidad interpreta sus datos, formula hipótesis y presenta propuestas con evidencias e incertidumbres. BETTEX contrasta estos análisis con apoyo de los subagentes de riesgo y tesorería. La investigación también incluye acciones. La línea de base demostrativa no ejecuta operaciones reales; la apertura de cada mercado depende de integración y adecuación legal.',
  ],
  cryptoTitle: ['Subagente Cripto', 'Crypto subagent', 'Subagente Cripto'],
  crypto: [
    'Analisa preços, volume, liquidez, volatilidade e relações entre ativos digitais. Compara hipóteses sobre tendências, mudanças de regime e arbitragem, distinguindo sinal de mercado de ruído. BTC, ETH e SOL são especialidades internas dessa família, não mercados independentes.',
    'Analyzes prices, volume, liquidity, volatility and relationships between digital assets. Compares hypotheses about trends, regime changes and arbitrage, distinguishing market signals from noise. BTC, ETH and SOL are internal specialties of this family, not independent markets.',
    'Analiza precios, volumen, liquidez, volatilidad y relaciones entre activos digitales. Compara hipótesis sobre tendencias, cambios de régimen y arbitraje, distinguiendo señales de mercado del ruido. BTC, ETH y SOL son especialidades internas de esta familia, no mercados independientes.',
  ],
  cryptoProposal: [
    'Apresenta a BETTEX teses por ativo, evidências, cenários alternativos, custos e condições de liquidez que sustentam ou invalidam uma proposta.',
    'Presents BETTEX with asset theses, evidence, alternative scenarios, costs and liquidity conditions that support or invalidate a proposal.',
    'Presenta a BETTEX tesis por activo, evidencias, escenarios alternativos, costes y condiciones de liquidez que sostienen o invalidan una propuesta.',
  ],
  sportsTitle: ['Subagente de Esportes', 'Sports subagent', 'Subagente de Deportes'],
  sports: [
    'Interpreta dados de equipes, jogadores, competições e eventos, relacionando contexto esportivo e probabilidades implícitas nas odds. Investiga divergências entre estimativas e preços, value betting e surebetting, sem confundir uma hipótese de vantagem com retorno garantido.',
    'Interprets team, player, competition and event data, relating sporting context to probabilities implied by odds. Investigates differences between estimates and prices, value betting and surebetting, without confusing a hypothesis of an edge with guaranteed returns.',
    'Interpreta datos de equipos, jugadores, competiciones y eventos, relacionando el contexto deportivo con las probabilidades implícitas en las cuotas. Investiga diferencias entre estimaciones y precios, value betting y surebetting, sin confundir una hipótesis de ventaja con rentabilidad garantizada.',
  ],
  sportsProposal: [
    'Apresenta a BETTEX a tese do evento, fontes, odds comparadas e incertezas, incluindo limites, mudanças de preço e riscos de execução entre plataformas.',
    'Presents BETTEX with the event thesis, sources, compared odds and uncertainties, including limits, price changes and execution risks across platforms.',
    'Presenta a BETTEX la tesis del evento, fuentes, cuotas comparadas e incertidumbres, incluidos límites, cambios de precio y riesgos de ejecución entre plataformas.',
  ],
  predictionsTitle: ['Subagente Predictions', 'Predictions subagent', 'Subagente Predictions'],
  predictions: [
    'Analisa contratos vinculados ao resultado de eventos, suas regras de resolução, prazos e fontes de verificação. Confronta probabilidades estimadas com os preços e a liquidez do livro, questionando premissas e ambiguidades do evento antes de formular uma proposta.',
    'Analyzes contracts tied to event outcomes, their resolution rules, deadlines and verification sources. Weighs estimated probabilities against prices and order-book liquidity, questioning assumptions and event ambiguities before formulating a proposal.',
    'Analiza contratos vinculados al resultado de eventos, sus reglas de resolución, plazos y fuentes de verificación. Contrasta probabilidades estimadas con precios y liquidez del libro, cuestionando premisas y ambigüedades del evento antes de formular una propuesta.',
  ],
  predictionsProposal: [
    'Apresenta a BETTEX a hipótese do evento, evidências, condições de resolução, custos e cenários de saída. Observar um mercado não comprova vantagem nem autoriza uma operação.',
    'Presents BETTEX with the event hypothesis, evidence, resolution conditions, costs and exit scenarios. Observing a market does not prove an edge or authorize a trade.',
    'Presenta a BETTEX la hipótesis del evento, evidencias, condiciones de resolución, costes y escenarios de salida. Observar un mercado no demuestra una ventaja ni autoriza una operación.',
  ],
  igamingTitle: ['Subagente iGaming', 'iGaming subagent', 'Subagente iGaming'],
  igaming: [
    'Investiga mineração de bônus e métodos de extração a partir das regras de jogos e promoções. Analisa requisitos de aposta, elegibilidade, limites, probabilidades, variância e condições de saque para avaliar se uma hipótese permanece válida após custos e restrições.',
    'Investigates bonus mining and extraction methods through game and promotion rules. Analyzes wagering requirements, eligibility, limits, probabilities, variance and withdrawal conditions to assess whether a hypothesis remains valid after costs and restrictions.',
    'Investiga minería de bonos y métodos de extracción a partir de reglas de juegos y promociones. Analiza requisitos de apuesta, elegibilidad, límites, probabilidades, varianza y condiciones de retiro para evaluar si una hipótesis sigue siendo válida tras costes y restricciones.',
  ],
  igamingProposal: [
    'Apresenta a BETTEX a oportunidade, condições contratuais, exposição e cenários de perda. Não altera a aleatoriedade dos jogos nem presume lucro por participar de uma promoção.',
    'Presents BETTEX with the opportunity, contractual conditions, exposure and loss scenarios. Does not alter game randomness or assume profit from taking part in a promotion.',
    'Presenta a BETTEX la oportunidad, condiciones contractuales, exposición y escenarios de pérdida. No altera la aleatoriedad de los juegos ni presupone beneficios por participar en una promoción.',
  ],
  contributionLabel: ['Contribuição para BETTEX', 'Contribution to BETTEX', 'Contribución a BETTEX'],
  paramsTitle: ['Contexto e parâmetros iniciais', 'Initial context and parameters', 'Contexto y parámetros iniciales'],
  params: [
    'Regras, contratos de referência e controles atuais alimentam cada agente como contexto de partida para inferir, não como limite da inteligência. As referências detalhadas preservam as condições econômicas e de segurança vigentes.',
    'Current rules, reference contracts and controls feed each agent as starting context for inference, not as the limit of intelligence. Detailed references preserve current economic and security conditions.',
    'Las reglas, los contratos de referencia y los controles actuales alimentan a cada agente como contexto de partida para inferir, no como límite de la inteligencia. Las referencias detalladas preservan las condiciones económicas y de seguridad vigentes.',
  ],
  feedbackTitle: ['Relações de feedback', 'Feedback relationships', 'Relaciones de feedback'],
  feedbackUp: ['Análises seguem dos agentes para BETTEX', 'Analyses flow from agents to BETTEX', 'Los análisis fluyen de los agentes hacia BETTEX'],
  feedbackDown: ['Perguntas e pedidos de evidência retornam aos agentes', 'Questions and evidence requests return to agents', 'Las preguntas y solicitudes de evidencia regresan a los agentes'],
  feedbackLoop: ['Resultados observados retornam à memória e ao contexto', 'Observed outcomes return to memory and context', 'Los resultados observados regresan a la memoria y al contexto'],
  researchNote: [
    'Direção de pesquisa: nenhuma capacidade descrita aqui está entregue.',
    'Research direction: no capability described here has been delivered.',
    'Dirección de investigación: ninguna capacidad descrita aquí está entregada.',
  ],
} as const satisfies Record<string, readonly [string, string, string]>;

export const presentationCopy = Object.fromEntries(
  Object.entries(passages).map(([id, [pt]]) => [id, pt]),
) as { [K in keyof typeof passages]: (typeof passages)[K][0] };

export const presentationTranslations = Object.fromEntries(
  Object.values(passages).map(([pt, en, es]) => [pt, { pt, en, es }]),
);
