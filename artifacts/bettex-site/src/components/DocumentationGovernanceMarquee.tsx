const notice = 'Conteúdo administrado pelo Agente de Governança em IA da Bettex';

export function DocumentationGovernanceMarquee({ total }: { total: string }) {
  return (
    <div className="whitepaper__governance-marquee" role="note" data-testid="documentation-governance-notice">
      <span className="whitepaper__governance-meta">BETTEX / DOCUMENTAÇÃO · v1</span>
      <span className="sr-only">{notice}</span>
      <div className="whitepaper__governance-viewport" aria-hidden="true">
        <div className="whitepaper__governance-track">
          {[0, 1].map(group => (
            <div className="whitepaper__governance-group" key={group}>
              {[0, 1].map(copy => (
                <span className="whitepaper__governance-copy" key={copy}>
                  {notice}<span className="whitepaper__governance-separator">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <span className="whitepaper__governance-meta">UM AGENTE · {total} CAPÍTULOS</span>
    </div>
  );
}
