/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';
import './DocumentationVision.css';

const useX = () => {
  const l = useLocale();
  return (pt: string, en: string, es: string) => l === 'en' ? en : l === 'es' ? es : pt;
};

/** Vision and objectives, shown before the POC scope callout and the concepts. */
export function DocumentationVision() {
  const x = useX();
  const subs = [
    [x('Esportes', 'Sports', 'Deportes'), x('surebet', 'surebet', 'surebet')],
    ['iGaming', x('bônus e promoções', 'bonuses and promotions', 'bonos y promociones')],
    [x('Cripto', 'Crypto', 'Cripto'), 'BTC · ETH · SOL'],
    [x('Previsões', 'Predictions', 'Predicciones'), x('mercados de eventos', 'event markets', 'mercados de eventos')],
  ];
  const support = [
    [x('Risco', 'Risk', 'Riesgo'), x('exposição e limites', 'exposure and limits', 'exposición y límites')],
    [x('Tesouraria', 'Treasury', 'Tesorería'), x('recursos e alocação', 'resources and allocation', 'recursos y asignación')],
    [x('Governança', 'Governance', 'Gobernanza'), x('políticas e decisões', 'policies and decisions', 'políticas y decisiones')],
  ];
  const feats = [x('Carteiras', 'Wallets', 'Carteras'), x('Staking', 'Staking', 'Participación en staking'), x('Histórico', 'History', 'Historial'), x('Jogos internos', 'Internal games', 'Juegos internos')];
  return <section className="dv" id="documentacao-visao" data-documentation-opening data-testid="documentation-vision">
    <h3 hidden className="whitepaper__subhead">{x('Nossa visão', 'Our vision', 'Nuestra visión')}</h3>
    <div className="whitepaper__prose">
      <p><strong>{x('A proposta da BETTEX é transformar apostadores em investidores por meio de um projeto DeFAI.', 'BETTEX’s proposal is to turn bettors into investors through a DeFAI project.', 'La propuesta de BETTEX es transformar apostadores en inversores mediante un proyecto DeFAI.')}</strong>{' '}
        {x('A visão é desenvolver um agente de orquestração BETTEX descentralizado, 100% autônomo e independente, sem operador centralizado, que coordene estratégias de mercado com subagentes inteligentes em esportes (surebet), iGaming, cripto e previsões.',
          'The vision is to develop a decentralized, 100% autonomous and independent BETTEX orchestration agent, with no centralized operator, coordinating market strategies with intelligent subagents in sports (surebet), iGaming, crypto and predictions.',
          'La visión es desarrollar un agente de orquestación BETTEX descentralizado, 100% autónomo e independiente, sin operador centralizado, que coordine estrategias de mercado con subagentes inteligentes en deportes (surebet), iGaming, cripto y predicciones.')}</p>
      <p>{x('Isto é uma ambição, não o estado do demo. O objetivo é permitir que a comunidade participe das estratégias de mercado com responsabilidades e regras claras e visibilidade sobre o funcionamento do sistema. Não se trata de rebatizar apostas individuais como investimento nem de garantir retorno.',
        'This is an ambition, not the state of the demo. The goal is to let the community take part in market strategies with clear responsibilities and rules and visibility into how the system works. It is not about rebranding individual bets as investment, nor guaranteeing returns.',
        'Esto es una ambición, no el estado del demo. El objetivo es que la comunidad participe en las estrategias de mercado con responsabilidades y reglas claras y visibilidad sobre el funcionamiento del sistema. No se trata de rebautizar apuestas individuales como inversión ni de garantizar retornos.')}</p>
    </div>
    <figure className="dv__fig" aria-labelledby="dv-vision-cap">
      <figcaption id="dv-vision-cap" className="dv__cap">{x('Mapa da visão: quem decide, quem executa regras', 'Vision map: who decides, who executes rules', 'Mapa de la visión: quién decide, quién ejecuta reglas')}</figcaption>
      <ol className="dv__stack">
        <li className="dv__layer">
          <div className="dv__node dv__node--people"><b>{x('Comunidade', 'Community', 'Comunidad')}</b><small>{x('participa das estratégias', 'takes part in strategies', 'participa en las estrategias')}</small></div>
        </li>
        <li className="dv__link" aria-hidden="true"><span>{x('participa e acompanha', 'takes part and follows', 'participa y acompaña')}</span></li>
        <li className="dv__layer">
          <div className="dv__node dv__node--core"><i>{x('AGENTE INTELIGENTE · AMBIÇÃO', 'INTELLIGENT AGENT · AMBITION', 'AGENTE INTELIGENTE · AMBICIÓN')}</i><b>{x('Agente de orquestração BETTEX', 'BETTEX orchestration agent', 'Agente de orquestación BETTEX')}</b><small>{x('autônomo, sem operador centralizado', 'autonomous, no centralized operator', 'autónomo, sin operador centralizado')}</small></div>
        </li>
        <li className="dv__link" aria-hidden="true"><span>{x('coordena e integra análises', 'coordinates and integrates analyses', 'coordina e integra análisis')}</span></li>
        <li className="dv__layer">
          <div className="dv__subagents">
            <p className="dv__group-label">{x('Subagentes de trading', 'Trading subagents', 'Subagentes de trading')}</p>
            <div className="dv__layer--row">
              {subs.map(([a, b]) => <div className="dv__node dv__node--sub" key={a}><i>{x('SUBAGENTE INTELIGENTE', 'INTELLIGENT SUBAGENT', 'SUBAGENTE INTELIGENTE')}</i><b>{a}</b><small>{b}</small></div>)}
            </div>
            <p className="dv__group-label">{x('Subagentes de apoio à decisão', 'Decision-support subagents', 'Subagentes de apoyo a las decisiones')}</p>
            <div className="dv__layer--row dv__layer--support">
              {support.map(([a, b]) => <div className="dv__node dv__node--sub" key={a}><i>{x('SUBAGENTE INTELIGENTE', 'INTELLIGENT SUBAGENT', 'SUBAGENTE INTELIGENTE')}</i><b>{a}</b><small>{b}</small></div>)}
            </div>
          </div>
        </li>
        <li className="dv__link" aria-hidden="true"><span>{x('efeitos limitados por regras', 'effects limited by rules', 'efectos limitados por reglas')}</span></li>
        <li className="dv__layer">
          <div className="dv__rules">
            <i>{x('REGRAS DETERMINÍSTICAS · NÃO SÃO IA', 'DETERMINISTIC RULES · NOT AI', 'REGLAS DETERMINÍSTICAS · NO SON IA')}</i>
            <ul>{feats.map(f => <li key={f}>{f}</li>)}</ul>
            <small>{x('Mostram saldos, verificam condições e registram o que foi autorizado.', 'They show balances, check conditions and record what was authorized.', 'Muestran saldos, verifican condiciones y registran lo autorizado.')}</small>
          </div>
        </li>
      </ol>
      <p className="dv__note">{x('O mapa representa a arquitetura pretendida. No demo off-chain, essas funções são apenas ilustradas, sem operações financeiras reais.', 'The map represents the intended architecture. In the off-chain demo, these functions are only illustrated, with no real financial operations.', 'El mapa representa la arquitectura prevista. En el demo off-chain, estas funciones solo se ilustran, sin operaciones financieras reales.')}</p>
      <p className="dv__note">{x('Esportes, Previsões e iGaming fazem parte da visão futura: não estão disponíveis nem ativos no demo e não estão previstos para a versão ALFA.', 'Sports, Predictions and iGaming are part of the future vision: they are neither available nor active in the demo and are not planned for the ALFA version.', 'Deportes, Predicciones e iGaming forman parte de la visión futura: no están disponibles ni activos en el demo y no están previstos para la versión ALFA.')}</p>
    </figure>
  </section>;
}

export function DocumentationConceptsHeading() {
  const x = useX();
  return <div id="documentacao-conceitos-base" data-documentation-opening><h3 hidden>{x('Conceitos para entender a proposta', 'Concepts to understand the proposal', 'Conceptos para entender la propuesta')}</h3></div>;
}

/** Off-chain walkthrough of what the demo's screens show. */
export function DocumentationDemoJourney() {
  const x = useX();
  const steps = [
    [x('Carteiras', 'Wallets', 'Carteras'), x('Apresenta saldos fictícios de BETTEX e USDC.', 'Shows illustrative BETTEX and USDC balances.', 'Presenta saldos ilustrativos de BETTEX y USDC.'), x('Não há pagamento nem saldo real alterado.', 'No payment, no real balance changed.', 'Sin pagos ni saldos reales modificados.'), false],
    [x('Participação', 'Participation', 'Participación'), x('Ilustra as regras de participação no staking e de distribuição dos resultados.', 'Illustrates staking participation and result-distribution rules.', 'Ilustra las reglas de participación en el staking y de distribución de resultados.'), x('Não há participação nem distribuição financeira real.', 'No real financial participation or distribution.', 'Sin participación ni distribución financiera real.'), false],
    [x('Central da IA', 'AI center', 'Centro de IA'), x('Mostra como agentes analisariam e proporiam ações.', 'Shows how agents would analyze and propose actions.', 'Muestra cómo los agentes analizarían y propondrían acciones.'), x('Nenhuma negociação é feita; a tela é demonstrativa.', 'No trade is made; the screen is illustrative.', 'No se negocia; la pantalla es demostrativa.'), true],
    [x('Histórico', 'History', 'Historial'), x('Exibe exemplos de registros e estados.', 'Displays example records and states.', 'Muestra ejemplos de registros y estados.'), x('São exemplos visuais, não comprovantes de operações on-chain.', 'These are visual examples, not proof of on-chain operations.', 'Son ejemplos visuales, no comprobantes de operaciones on-chain.'), false],
  ] as const;
  return <section className="dv" data-testid="documentation-demo-journey">
    <h3 className="whitepaper__subhead" id="documentacao-percurso-demo">{x('O que as telas do demo mostram', 'What the demo screens show', 'Qué muestran las pantallas del demo')}</h3>
    <div className="whitepaper__prose"><p>{x('Este percurso reúne quatro telas do demo. Os dados são uma apresentação visual fora da blockchain (off-chain): nenhum passo abaixo executa operação real.', 'This walkthrough covers four demo screens. Data is a visual presentation off-chain: none of the steps below executes a real operation.', 'Este recorrido reúne cuatro pantallas del demo. Los datos son una presentación visual fuera de la blockchain (off-chain): ningún paso ejecuta una operación real.')}</p></div>
    <figure className="dv__fig" aria-labelledby="dv-demo-cap">
      <figcaption id="dv-demo-cap" className="dv__cap">{x('Percurso visual do demo · off-chain', 'Demo visual path · off-chain', 'Recorrido visual del demo · off-chain')}</figcaption>
      <ol className="dv__flow">
        {steps.map(([name, shows, not, ai], i) => <li key={name} className={ai ? 'is-ai' : ''}>
          <span className="dv__n">{i + 1}</span>{' '}
          <i>{ai ? x('ILUSTRA AGENTES DE IA', 'ILLUSTRATES AI AGENTS', 'ILUSTRA AGENTES DE IA') : x('TELA DETERMINÍSTICA', 'DETERMINISTIC SCREEN', 'PANTALLA DETERMINÍSTICA')}</i>{' '}
          <b>{name}</b>{' '}
          <p>{shows}</p>
          <p className="dv__not">{not}</p>
        </li>)}
      </ol>
      <p className="dv__note">{x('Fora do escopo do demo: pagamentos, negociações, mudança de saldos e execução on-chain.', 'Outside the demo’s scope: payments, trades, balance changes and on-chain execution.', 'Fuera del alcance del demo: pagos, negociaciones, cambios de saldo y ejecución on-chain.')}</p>
    </figure>
  </section>;
}
