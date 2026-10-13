import { intelligenceCopy as c } from '@/lib/documentation-intelligence';
import { presentationCopy as p } from '@/lib/documentation-intelligence-presentation';
import './agent-intelligence.css';

/** Research direction, intentionally separate from operational mandates. */
export function AgentIntelligence() {
  const support = [
    ['documentacao-inteligencia-risco', p.riskRole, c.riskTitle, c.risk, 'Exposição, perdas, liquidez, limites e propostas.'],
    ['documentacao-inteligencia-governanca', p.governanceRole, c.governanceTitle, c.governance, 'Versões, mandatos, limites, desvios e trilha de operações.'],
    ['documentacao-inteligencia-tesouraria', p.treasuryRole, c.treasuryTitle, c.treasury, 'Patrimônio, reservas, posições, compromissos e obrigações conciliados.'],
  ];
  return <section id="documentacao-inteligencia" data-testid="documentation-agent-intelligence" className="agent-intel">
    <h3 className="whitepaper__subhead">{c.intelligenceTitle}</h3>
    <p className="agent-intel__label">{p.mapLabel}</p>

    <div className="agent-intel__map">
      <section id="documentacao-inteligencia-bettex" className="agent-intel__core">
        <span className="agent-intel__tag">{p.centerTag}</span>
        <h4>{c.coordinationTitle}</h4>
        <strong className="agent-intel__role">{p.centerRole}</strong>
        <div className="whitepaper__prose"><p>{c.coordination}</p></div>
        <div className="agent-intel__context"><span>{p.initialContext}</span><p>{p.centralContext}</p></div>
      </section>

      <div className="agent-intel__links" aria-hidden="true">
        <span>{p.feedbackUp}</span>
        <span>{p.feedbackDown}</span>
      </div>

      <p className="agent-intel__label agent-intel__label--sub">{p.supportTag}</p>
      <div className="agent-intel__support">
        {support.map(([id, role, title, text, context]) => <section key={id} id={id} className="agent-intel__agent">
          <strong className="agent-intel__role">{role}</strong>
          <h4>{title}</h4>
          <div className="whitepaper__prose">
            <p>{text}</p>
            {id === 'documentacao-inteligencia-governanca' && <p>{c.governanceDocumentation}</p>}
          </div>
          <div className="agent-intel__context"><span>{p.initialContext}</span><p>{context}</p></div>
        </section>)}
      </div>

      <section className="agent-intel__markets">
        <h4>{p.marketsTitle}</h4>
        <div className="whitepaper__prose"><p>{p.markets}</p></div>
      </section>
    </div>

    <div className="agent-intel__rel">
      <section className="agent-intel__panel">
        <h4>{p.paramsTitle}</h4>
        <div className="whitepaper__prose"><p>{p.params}</p></div>
      </section>
      <section className="agent-intel__panel agent-intel__panel--loop">
        <h4>{p.feedbackTitle}</h4>
        <ol>
          <li>{p.feedbackUp}</li>
          <li>{p.feedbackDown}</li>
          <li>{p.feedbackLoop}</li>
        </ol>
      </section>
    </div>
    <p className="agent-intel__note">{p.researchNote}</p>

    <h3 className="whitepaper__subhead" id="documentacao-aprendizado">{c.learningTitle}</h3>
    <div className="whitepaper__prose"><p>{c.learning}</p><p>{c.evaluation}</p></div>
  </section>;
}
