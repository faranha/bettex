import { intelligenceCopy } from '@/lib/documentation-intelligence';

const notice = intelligenceCopy.governanceNotice;

export function DocumentationGovernanceMarquee({ total }: { total: string }) {
  const metadata = intelligenceCopy.governanceMetadata.replace('{0}', total);
  return (
    <div className="whitepaper__governance-marquee" role="note" data-testid="documentation-governance-notice">
      <span className="sr-only"><span>BETTEX / DOCUMENTAÇÃO · v1</span>{' · '}{notice}{' · '}{metadata}</span>
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
                  <span className="whitepaper__governance-meta">{metadata}</span>
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
