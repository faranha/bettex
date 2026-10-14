import { intelligenceCopy as c } from '@/lib/documentation-intelligence';
import { presentationCopy as p } from '@/lib/documentation-intelligence-presentation';
import './agent-intelligence.css';

/** Research direction, intentionally separate from operational mandates. */
export type AgentOwner = 'bettex' | 'risk' | 'treasury' | 'governance' | 'crypto' | 'sports' | 'predictions' | 'igaming' | 'relations' | 'learning' | 'context';
const allOwners: AgentOwner[] = ['bettex', 'risk', 'treasury', 'governance', 'crypto', 'sports', 'predictions', 'igaming', 'relations', 'learning', 'context'];
const supportOwner: Record<string, AgentOwner> = { 'documentacao-inteligencia-risco': 'risk', 'documentacao-inteligencia-governanca': 'governance', 'documentacao-inteligencia-tesouraria': 'treasury' };
const marketOwner: Record<string, AgentOwner> = { 'documentacao-subagente-crypto': 'crypto', 'documentacao-subagente-sports': 'sports', 'documentacao-subagente-predictions': 'predictions', 'documentacao-subagente-igaming': 'igaming' };

/** Without `owners` renders the full map unchanged; with `owners` renders only those sections, each with its original id. */
export function AgentIntelligence({ owners, introduction = false }: { owners?: AgentOwner[]; introduction?: boolean } = {}) {
  const full = !owners;
  const has = (o: AgentOwner) => !owners || owners.includes(o);
  if (!full) return <div className={`agent-intel${introduction ? ' agent-intel--introduction' : ''}`} data-documentation-opening={introduction ? '' : undefined} data-testid="documentation-agent-intelligence">
    {has('context') && <AgentIntelligenceParts part="context" introduction={introduction} />}
    {has('bettex') && <AgentIntelligenceParts part="bettex" introduction={introduction} />}
    {owners.some(o => o in { risk: 1, treasury: 1, governance: 1 }) && <AgentIntelligenceParts part="support" owners={owners} introduction={introduction} />}
    {owners.some(o => o in { crypto: 1, sports: 1, predictions: 1, igaming: 1 }) && <AgentIntelligenceParts part="markets" owners={owners} introduction={introduction} />}
    {has('relations') && <AgentIntelligenceParts part="relations" />}
    {has('learning') && <AgentIntelligenceParts part="learning" />}
  </div>;
  return <AgentIntelligenceFull />;
}

function AgentIntelligenceParts({ part, owners, introduction = false }: { part: 'context' | 'bettex' | 'support' | 'markets' | 'relations' | 'learning'; owners?: AgentOwner[]; introduction?: boolean }) {
  const on = (o?: AgentOwner) => !owners || (o !== undefined && owners.includes(o));
  const support = [
    ['documentacao-inteligencia-risco', p.riskRole, c.riskTitle, c.risk, 'Exposição, perdas, liquidez, limites e propostas.'],
    ['documentacao-inteligencia-governanca', p.governanceRole, c.governanceTitle, c.governance, 'Versões, mandatos, limites, desvios e trilha de operações.'],
    ['documentacao-inteligencia-tesouraria', p.treasuryRole, c.treasuryTitle, c.treasury, 'Patrimônio, reservas, posições, compromissos e obrigações conciliados.'],
  ];
  const markets = [
    ['documentacao-subagente-crypto', p.cryptoTitle, p.crypto, p.cryptoProposal],
    ['documentacao-subagente-sports', p.sportsTitle, p.sports, p.sportsProposal],
    ['documentacao-subagente-predictions', p.predictionsTitle, p.predictions, p.predictionsProposal],
    ['documentacao-subagente-igaming', p.igamingTitle, p.igaming, p.igamingProposal],
  ];
  if (part === 'context') return <>
    <h3 hidden={introduction} className="whitepaper__subhead">{c.intelligenceTitle}</h3>
    <p id={introduction ? 'documentacao-agentes-secao-1' : undefined} className="agent-intel__label">{p.mapLabel}</p>
    <div className="agent-intel__links" aria-hidden="true"><span>{p.feedbackUp}</span><span>{p.feedbackDown}</span></div>
    <p className="agent-intel__label agent-intel__label--sub">{p.supportTag}</p>
    <h4 hidden={introduction}>{p.marketsTitle}</h4>
    <div id={introduction ? 'documentacao-agentes-secao-2' : undefined} className="whitepaper__prose"><p>{p.markets}</p></div>
  </>;
  if (part === 'bettex') return <section id="documentacao-inteligencia-bettex" className="agent-intel__core">
    <span className="agent-intel__tag">{p.centerTag}</span>
    <h4 hidden={introduction}>{c.coordinationTitle}</h4>
    <strong id={introduction ? 'documentacao-agentes-secao-3' : undefined} className="agent-intel__role">{p.centerRole}</strong>
    <div className="whitepaper__prose"><p>{c.coordination}</p></div>
    <div className="agent-intel__context"><span>{p.initialContext}</span><p>{p.centralContext}</p></div>
  </section>;
  if (part === 'support') return <div className="agent-intel__support">
    {support.filter(r => on(supportOwner[r[0]])).map(([id, role, title, text, context]) => <section key={id} id={id} className="agent-intel__agent">
      <h4 hidden={introduction}>{title}</h4>
      <strong id={introduction ? `${id.replace('inteligencia-', 'subagente-')}-secao-1` : undefined} className="agent-intel__role">{role}</strong>
      <div className="whitepaper__prose">
        <p>{text}</p>
        {id === 'documentacao-inteligencia-governanca' && <p>{c.governanceDocumentation}</p>}
      </div>
      <div className="agent-intel__context"><span>{p.initialContext}</span><p>{context}</p></div>
    </section>)}
  </div>;
  if (part === 'markets') return <section className="agent-intel__markets">
    <div className="agent-intel__market-list">
      {markets.filter(r => on(marketOwner[r[0]])).map(([market, title, analysis, proposal]) => <article key={market} id={market === 'documentacao-subagente-igaming' ? `${market}-inteligencia` : market} data-trading-market={market} className="agent-intel__market">
        <h5 hidden={introduction}>{title}</h5>
        <div className="whitepaper__prose"><p>{analysis}</p></div>
        <div className="agent-intel__context"><span>{p.contributionLabel}</span><p>{proposal}</p></div>
      </article>)}
    </div>
  </section>;
  if (part === 'relations') return <>
    <div className="agent-intel__rel">
      <section className="agent-intel__panel">
        <h3 className="whitepaper__subhead">{p.paramsTitle}</h3>
        <div className="whitepaper__prose"><p>{p.params}</p></div>
      </section>
      <section className="agent-intel__panel agent-intel__panel--loop">
        <h3 className="whitepaper__subhead">{p.feedbackTitle}</h3>
        <ol><li>{p.feedbackUp}</li><li>{p.feedbackDown}</li><li>{p.feedbackLoop}</li></ol>
      </section>
    </div>
    <p className="agent-intel__note">{p.researchNote}</p>
  </>;
  return <>
    <h3 className="whitepaper__subhead" id="documentacao-aprendizado">{c.learningTitle}</h3>
    <div className="whitepaper__prose"><p>{c.learning}</p><p>{c.evaluation}</p></div>
  </>;
}

function AgentIntelligenceFull() {
  const support = [
    ['documentacao-inteligencia-risco', p.riskRole, c.riskTitle, c.risk, 'Exposição, perdas, liquidez, limites e propostas.'],
    ['documentacao-inteligencia-governanca', p.governanceRole, c.governanceTitle, c.governance, 'Versões, mandatos, limites, desvios e trilha de operações.'],
    ['documentacao-inteligencia-tesouraria', p.treasuryRole, c.treasuryTitle, c.treasury, 'Patrimônio, reservas, posições, compromissos e obrigações conciliados.'],
  ];
  const markets = [
    ['documentacao-subagente-crypto', p.cryptoTitle, p.crypto, p.cryptoProposal],
    ['documentacao-subagente-sports', p.sportsTitle, p.sports, p.sportsProposal],
    ['documentacao-subagente-predictions', p.predictionsTitle, p.predictions, p.predictionsProposal],
    ['documentacao-subagente-igaming', p.igamingTitle, p.igaming, p.igamingProposal],
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
          <h4>{title}</h4>
          <strong className="agent-intel__role">{role}</strong>
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
        <div className="agent-intel__market-list">
          {markets.map(([market, title, analysis, proposal]) => <article key={market} data-trading-market={market} className="agent-intel__market">
            <h5>{title}</h5>
            <div className="whitepaper__prose"><p>{analysis}</p></div>
            <div className="agent-intel__context"><span>{p.contributionLabel}</span><p>{proposal}</p></div>
          </article>)}
        </div>
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
