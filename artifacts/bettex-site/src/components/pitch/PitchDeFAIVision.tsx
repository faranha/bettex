/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';
import './PitchDeFAIVision.css';

export function PitchDeFAIVision() {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  const markets = [
    x('Esports', 'Esports', 'Esports'),
    x('iGaming', 'iGaming', 'iGaming'),
    x('Cripto', 'Crypto', 'Cripto'),
    x('Previsões', 'Predictions', 'Predicciones'),
  ];
  return <div data-testid="pitch-defai-vision" data-i18n="translated" className="pdv">
    <span className="pdv__kicker mono">{x('Visão de longo prazo', 'Long-term vision', 'Visión a largo plazo')}</span>
    <h3 className="display pdv__title">{x('De DeFi para DeFi AI (DeFAI)', 'From DeFi to DeFi AI (DeFAI)', 'De DeFi a DeFi AI (DeFAI)')}</h3>
    <p className="pdv__lead">{x(
      'A BETTEX é uma visão de projeto descentralizado: o objetivo é um agente 100% autônomo, independente e descentralizado, sem operador centralizado. O agente BETTEX é a inteligência central que coordena os subagentes especializados, não um operador centralizado.',
      'BETTEX is a decentralized-project vision: the aim is a 100% autonomous, independent, decentralized agent with no centralized operator. The BETTEX agent is the central intelligence coordinating the specialized subagents, not a centralized operator.',
      'BETTEX es la visión de un proyecto descentralizado: el objetivo es un agente 100% autónomo, independiente y descentralizado, sin operador centralizado. El agente BETTEX es la inteligencia central que coordina a los subagentes especializados, no un operador centralizado.'
    )}</p>

    <figure className="pdv__fig" aria-label={x('Diagrama: BETTEX coordena subagentes de mercado e da tesouraria', 'Diagram: BETTEX coordinates market and treasury subagents', 'Diagrama: BETTEX coordina subagentes de mercado y de tesorería')}>
      <div className="pdv__core">
        <span className="mono">{x('Inteligência central', 'Central intelligence', 'Inteligencia central')}</span>
        <strong className="display">{x('Agente BETTEX', 'BETTEX agent', 'Agente BETTEX')}</strong>
        <small>{x('Coordena, compara propostas e respeita as decisões da comunidade', 'Coordinates, compares proposals and respects community decisions', 'Coordina, compara propuestas y respeta las decisiones de la comunidad')}</small>
      </div>
      <div className="pdv__trunk" aria-hidden="true" />
      <ul className="pdv__rail">
        {markets.map((m) => <li key={m} className="pdv__node">
          <span className="pdv__stem" aria-hidden="true" />
          <span className="mono pdv__tag">{x('Subagente de trading', 'Trading subagent', 'Subagente de trading')}</span>
          <strong className="display">{m}</strong>
        </li>)}
        <li className="pdv__node pdv__node--tre" data-testid="pitch-defai-treasury">
          <span className="pdv__stem" aria-hidden="true" />
          <span className="mono pdv__tag">{x('Subagente da tesouraria', 'Treasury subagent', 'Subagente de tesorería')}</span>
          <strong className="display">{x('Tesouraria', 'Treasury', 'Tesorería')}</strong>
          <span className="pdv__chips">
            <span>{x('Risco', 'Risk', 'Riesgo')}</span>
            <span>{x('Governança', 'Governance', 'Gobernanza')}</span>
          </span>
        </li>
      </ul>
    </figure>

    <div className="pdv__cols">
      <p><b>{x('Um subagente por mercado.', 'One subagent per market.', 'Un subagente por mercado.')}</b> {x(
        'Cada mercado de esports, iGaming, cripto e previsões terá seu próprio subagente de trading, que se comunicará com o agente BETTEX.',
        'Each esports, iGaming, crypto and predictions market will have its own trading subagent, communicating with the BETTEX agent.',
        'Cada mercado de esports, iGaming, cripto y predicciones tendrá su propio subagente de trading, que se comunicará con el agente BETTEX.'
      )}</p>
      <p><b>{x('Tesouraria com subagente próprio, futuro.', 'Treasury with its own future subagent.', 'Tesorería con subagente propio, futuro.')}</b> {x(
        'Ele trabalhará, junto aos subagentes de mercado, com risco e governança. A tesouraria não é o dinheiro pessoal dos usuários, e os tokens em staking são peso de participação, não capital que financia operações.',
        'It will work with the market subagents, risk and governance. The treasury is not users’ personal funds, and staked tokens are participation weight, not capital financing operations.',
        'Trabajará, junto a los subagentes de mercado, con riesgo y gobernanza. La tesorería no son los fondos personales de los usuarios, y los tokens en staking son peso de participación, no capital que financia operaciones.'
      )}</p>
      <p><b>{x('Evolução da tesouraria até a DeFAI.', 'Treasury evolution toward DeFAI.', 'Evolución de la tesorería hacia DeFAI.')}</b> {x(
        'No início, fundador e equipe administram os contratos. A transferência gradual para a IA depende de capacidades demonstradas e controles verificáveis, e as decisões e a autoridade da comunidade são respeitadas, sem mudanças unilaterais automáticas de permissão.',
        'Initially the founders and team administer the contracts. Gradual transfer to AI depends on demonstrated capabilities and verifiable controls, and community decisions and authority are respected, with no automatic unilateral permission changes.',
        'Al inicio, fundadores y equipo administran los contratos. La transferencia gradual a la IA depende de capacidades demostradas y controles verificables, y se respetan las decisiones y la autoridad de la comunidad, sin cambios unilaterales automáticos de permisos.'
      )}</p>
    </div>
    <p className="pdv__fine">{x(
      'A autonomia total é uma meta de desenvolvimento, não uma capacidade atual comprovada. O demo visual não movimenta fundos reais nem garante retorno. A distribuição continua exigindo as regras já apresentadas.',
      'Total autonomy is a development goal, not a proven current capability. The visual demo does not move real funds or guarantee returns. Distribution continues to require the rules already presented.',
      'La autonomía total es una meta de desarrollo, no una capacidad actual comprobada. El demo visual no mueve fondos reales ni garantiza rentabilidad. La distribución sigue exigiendo las reglas ya presentadas.'
    )}</p>
  </div>;
}
export default PitchDeFAIVision;
