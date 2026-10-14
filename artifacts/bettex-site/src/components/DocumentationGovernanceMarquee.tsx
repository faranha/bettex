import { intelligenceCopy } from '@/lib/documentation-intelligence';

const notice = intelligenceCopy.governanceNotice;
const deterministicNotice = intelligenceCopy.deterministicNotice;

export function DocumentationGovernanceMarquee() {
  return (
    <div className="whitepaper__governance-marquee" role="note" data-testid="documentation-governance-notice">
      <span className="sr-only"><span>BETTEX / DOCUMENTAÇÃO · v1</span>{' · '}{notice}{' · '}{deterministicNotice}</span>
      <div className="whitepaper__governance-viewport" aria-hidden="true">
        <div className="whitepaper__governance-track">
          {[0, 1].map(group => (
            <div className="whitepaper__governance-group" key={group}>
              {[0, 1].map(copy => (
                <span className="whitepaper__governance-copy" key={copy}>
                  <span className="whitepaper__governance-meta">BETTEX / DOCUMENTAÇÃO · v1</span>
                  <span className="whitepaper__governance-separator">•</span>
                  <span>{notice}</span>
                  <span className="whitepaper__governance-separator">•</span>
                  <span>{deterministicNotice}</span>
                  <span className="whitepaper__governance-separator">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
