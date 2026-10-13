/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';
import { DocumentationLinkedTerms } from './DocumentationLinkedTerms';

type Market = 'sports' | 'predictions' | 'igaming';
const useX = () => {
  const locale = useLocale();
  return (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
};

export function DocumentationFutureMarket({ part: market }: { part: Market }) {
  const x = useX();
  const visions: Record<Market, { overview: string; steps: [string, string][]; example: string }> = {
    sports: {
      overview: x(
        'A visão para Esportes é um subagente capaz de acompanhar cotações de diferentes casas autorizadas, investigar oportunidades de arbitragem (surebet) e apresentar uma proposta fundamentada ao agente BETTEX. Não bastaria encontrar uma diferença entre odds: seria necessário avaliar custos, limites e o risco de executar apenas parte da operação.',
        'The vision for Sports is a subagent capable of monitoring odds from different authorized bookmakers, investigating arbitrage opportunities (surebet) and presenting an evidence-based proposal to the BETTEX agent. Finding a difference between odds would not be enough: costs, limits and the risk of executing only part of the operation would need assessment.',
        'La visión para Deportes es un subagente capaz de seguir cuotas de distintas casas autorizadas, investigar oportunidades de arbitraje (surebet) y presentar una propuesta fundamentada al agente BETTEX. Encontrar una diferencia entre cuotas no bastaría: sería necesario evaluar costes, límites y el riesgo de ejecutar solo parte de la operación.'),
      steps: [
        [x('Observar', 'Observe', 'Observar'), x('Poderia reunir odds do mesmo evento, regras de liquidação e horários de atualização.', 'It could gather odds for the same event, settlement rules and update times.', 'Podría reunir cuotas del mismo evento, reglas de liquidación y horarios de actualización.')],
        [x('Investigar', 'Investigate', 'Investigar'), x('Compararia condições equivalentes, custos e limites, incluindo o risco de uma cotação mudar antes de concluir todas as partes.', 'It would compare equivalent conditions, costs and limits, including the risk of a quote changing before all legs are completed.', 'Compararía condiciones equivalentes, costes y límites, incluido el riesgo de que una cuota cambie antes de completar todas las partes.')],
        [x('Propor', 'Propose', 'Proponer'), x('Apresentaria a BETTEX a oportunidade, as incertezas e os recursos necessários, para análise conjunta com Risco e Tesouraria.', 'It would present BETTEX with the opportunity, uncertainties and required resources, for joint analysis with Risk and Treasury.', 'Presentaría a BETTEX la oportunidad, las incertidumbres y los recursos necesarios, para un análisis conjunto con Riesgo y Tesorería.')],
      ],
      example: x('Exemplo conceitual: duas casas oferecem condições diferentes para o mesmo evento. O subagente investigaria se a combinação continua válida depois de custos e restrições; uma diferença aparente não seria tratada como lucro garantido.', 'Conceptual example: two bookmakers offer different conditions for the same event. The subagent would investigate whether the combination remains valid after costs and restrictions; an apparent difference would not be treated as guaranteed profit.', 'Ejemplo conceptual: dos casas ofrecen condiciones distintas para el mismo evento. El subagente investigaría si la combinación sigue siendo válida después de costes y restricciones; una diferencia aparente no se trataría como beneficio garantizado.'),
    },
    predictions: {
      overview: x(
        'A visão para Previsões é um subagente que interprete a pergunta de um mercado de eventos, pesquise evidências e compare uma estimativa fundamentada de probabilidade com as condições de negociação. Prever o preço de um ativo não seria, por si só, estimar corretamente a chance de um evento específico.',
        'The vision for Predictions is a subagent that interprets an event market’s question, researches evidence and compares an evidence-based probability estimate with trading conditions. Forecasting an asset’s price would not, by itself, correctly estimate the likelihood of a specific event.',
        'La visión para Predicciones es un subagente que interprete la pregunta de un mercado de eventos, investigue evidencias y compare una estimación fundamentada de probabilidad con las condiciones de negociación. Predecir el precio de un activo no equivaldría, por sí solo, a estimar correctamente la probabilidad de un evento concreto.'),
      steps: [
        [x('Entender o evento', 'Understand the event', 'Entender el evento'), x('Identificaria a pergunta, o prazo, a fonte de resolução e o que determina cada resultado.', 'It would identify the question, deadline, resolution source and what determines each outcome.', 'Identificaría la pregunta, el plazo, la fuente de resolución y lo que determina cada resultado.')],
        [x('Construir a análise', 'Build the analysis', 'Construir el análisis'), x('Poderia pesquisar evidências e formular uma estimativa calibrada para aquele evento, explicitando incertezas e limitações.', 'It could research evidence and formulate an estimate calibrated for that event, making uncertainties and limitations explicit.', 'Podría investigar evidencias y formular una estimación calibrada para ese evento, explicitando incertidumbres y limitaciones.')],
        [x('Comparar e propor', 'Compare and propose', 'Comparar y proponer'), x('Compararia a estimativa com preços, liquidez, custos e regras de liquidação, antes de encaminhar uma proposta a BETTEX, Risco e Tesouraria.', 'It would compare the estimate with prices, liquidity, costs and settlement rules before submitting a proposal to BETTEX, Risk and Treasury.', 'Compararía la estimación con precios, liquidez, costes y reglas de liquidación antes de presentar una propuesta a BETTEX, Riesgo y Tesorería.')],
      ],
      example: x('Exemplo conceitual: um contrato pergunta se um evento acontecerá até uma data. O subagente precisaria explicar como estimou essa probabilidade e como o resultado será verificado; observar o livro de ofertas não provaria vantagem econômica.', 'Conceptual example: a contract asks whether an event will happen by a given date. The subagent would need to explain how it estimated that probability and how the outcome will be verified; observing the order book would not prove an economic edge.', 'Ejemplo conceptual: un contrato pregunta si un evento ocurrirá antes de una fecha. El subagente tendría que explicar cómo estimó esa probabilidad y cómo se verificará el resultado; observar el libro de órdenes no demostraría una ventaja económica.'),
    },
    igaming: {
      overview: x(
        'A visão para iGaming é um subagente especializado em analisar bônus e promoções de operadores autorizados, suas condições e os riscos envolvidos. O foco seria investigar se uma oferta pode fazer sentido depois das exigências, custos e restrições, sem presumir que um bônus equivale a dinheiro disponível.',
        'The vision for iGaming is a subagent specialized in analyzing bonuses and promotions from authorized operators, their conditions and associated risks. Its focus would be investigating whether an offer makes sense after requirements, costs and restrictions, without assuming a bonus is available cash.',
        'La visión para iGaming es un subagente especializado en analizar bonos y promociones de operadores autorizados, sus condiciones y los riesgos implicados. Su enfoque sería investigar si una oferta tiene sentido después de requisitos, costes y restricciones, sin suponer que un bono equivale a dinero disponible.'),
      steps: [
        [x('Ler as condições', 'Read the conditions', 'Leer las condiciones'), x('Poderia verificar elegibilidade, prazos, exigências de uso, jogos permitidos e condições de saque.', 'It could check eligibility, deadlines, wagering requirements, permitted games and withdrawal conditions.', 'Podría comprobar elegibilidad, plazos, requisitos de uso, juegos permitidos y condiciones de retirada.')],
        [x('Avaliar custos e riscos', 'Assess costs and risks', 'Evaluar costes y riesgos'), x('Analisaria o capital necessário, a exposição a perdas e o efeito das regras sobre o resultado possível, sem prometer extração ou retorno.', 'It would analyze required capital, exposure to losses and how the rules affect possible outcomes, without promising extraction or returns.', 'Analizaría el capital necesario, la exposición a pérdidas y el efecto de las reglas sobre el resultado posible, sin prometer extracción ni rentabilidad.')],
        [x('Apresentar a hipótese', 'Present the hypothesis', 'Presentar la hipótesis'), x('Encaminharia a BETTEX uma proposta com condições, evidências e limitações, sujeita à avaliação de Risco e Tesouraria e à adequação legal.', 'It would submit a proposal to BETTEX with conditions, evidence and limitations, subject to Risk and Treasury assessment and legal compliance.', 'Presentaría a BETTEX una propuesta con condiciones, evidencias y limitaciones, sujeta a la evaluación de Riesgo y Tesorería y al cumplimiento legal.')],
      ],
      example: x('Exemplo conceitual: uma promoção oferece um bônus, mas exige condições antes do saque. O subagente avaliaria essas exigências e o risco de perda antes de propor qualquer participação. Burn Lottery e Double 2X são jogos internos separados, não operações deste subagente.', 'Conceptual example: a promotion offers a bonus but imposes conditions before withdrawal. The subagent would assess those requirements and the risk of loss before proposing any participation. Burn Lottery and Double 2X are separate internal games, not operations of this subagent.', 'Ejemplo conceptual: una promoción ofrece un bono, pero exige condiciones antes de la retirada. El subagente evaluaría esos requisitos y el riesgo de pérdida antes de proponer cualquier participación. Burn Lottery y Double 2X son juegos internos separados, no operaciones de este subagente.'),
    },
  };
  const vision = visions[market];
  const contextId = market === 'sports' ? 'documentacao-subagente-esportes' : market === 'predictions' ? 'documentacao-subagente-previsoes' : 'documentacao-subagente-igaming';
  return <div data-testid={`documentation-future-market-${market}`}>
    <div className="whitepaper__aside-callout" role="note">
      <span>{x('INDISPONÍVEL NO DEMO · NÃO PREVISTO PARA A ALFA', 'UNAVAILABLE IN THE DEMO · NOT PLANNED FOR ALFA', 'NO DISPONIBLE EN EL DEMO · NO PREVISTO PARA ALFA')}</span>
      <p><strong>{x('Este subagente não está disponível nem ativo na versão demo e não está previsto para a versão ALFA.', 'This subagent is neither available nor active in the demo and is not planned for the ALFA version.', 'Este subagente no está disponible ni activo en el demo y no está previsto para la versión ALFA.')}</strong>{' '}
        {x('O conteúdo desta área apresenta uma visão conceitual de funcionamento futuro, não uma funcionalidade entregue nem um anúncio de lançamento.', 'This area presents a conceptual vision of future operation, not a delivered feature or a launch announcement.', 'Esta área presenta una visión conceptual de funcionamiento futuro, no una funcionalidad entregada ni un anuncio de lanzamiento.')}</p>
    </div>
    <div className="whitepaper__prose">
      <p><strong>{x('Visão de funcionamento futuro', 'Vision of future operation', 'Visión de funcionamiento futuro')}</strong></p>
      <p><DocumentationLinkedTerms text={vision.overview} contextId={contextId} /></p>
      <ol>{vision.steps.map(([title, description]) => <li key={title}><strong>{title}:</strong>{' '}<DocumentationLinkedTerms text={description} contextId={contextId} /></li>)}</ol>
      <p><DocumentationLinkedTerms text={vision.example} contextId={contextId} /></p>
      <p>{x('Uma eventual execução dependeria de um escopo futuro aprovado, integrações autorizadas, controles de risco, recursos e adequação legal. Esta visão não habilita operações no demo nem inclui o subagente no escopo da ALFA.', 'Any eventual execution would depend on an approved future scope, authorized integrations, risk controls, resources and legal compliance. This vision does not enable operations in the demo or include the subagent in ALFA scope.', 'Una eventual ejecución dependería de un alcance futuro aprobado, integraciones autorizadas, controles de riesgo, recursos y cumplimiento legal. Esta visión no habilita operaciones en el demo ni incluye al subagente en el alcance de ALFA.')}</p>
    </div>
  </div>;
}

export function DocumentationFutureReferencesHeading() {
  const x = useX();
  return <h3 className="whitepaper__subhead">{x('Referências conceituais para evolução futura', 'Conceptual references for future development', 'Referencias conceptuales para la evolución futura')}</h3>;
}
