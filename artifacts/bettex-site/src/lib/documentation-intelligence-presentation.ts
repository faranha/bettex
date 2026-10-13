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
    'Cada mercado terá seu próprio subagente de trading, que se comunicará diretamente com o agente BETTEX. A pesquisa inclui análises e hipóteses em ações e cripto, esportes e esports, previsões e iGaming. A linha de base demonstrativa não executa operações reais; a abertura de cada mercado depende de integração e adequação legal.',
    'Each market will have its own trading subagent, which will communicate directly with the BETTEX agent. Research includes analyses and hypotheses across equities and crypto, sports and esports, predictions and iGaming. The demonstration baseline does not execute real operations; opening each market depends on integration and legal compliance.',
    'Cada mercado tendrá su propio subagente de trading, que se comunicará directamente con el agente BETTEX. La investigación incluye análisis e hipótesis en acciones y cripto, deportes y esports, predicciones e iGaming. La línea de base demostrativa no ejecuta operaciones reales; la apertura de cada mercado depende de integración y adecuación legal.',
  ],
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
