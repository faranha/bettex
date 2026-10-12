import { useState } from 'react';
import { Pause, Play } from 'lucide-react';

const notice = 'Conteúdo administrado pelo Agente de Governança em IA da Bettex';

export function DocumentationGovernanceMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="whitepaper__governance-marquee" role="note" data-testid="documentation-governance-notice">
      <span className="sr-only">{notice}</span>
      <div className="whitepaper__governance-viewport" aria-hidden="true">
        <div className={`whitepaper__governance-track${paused ? ' is-paused' : ''}`}>
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
      <button
        type="button"
        className="whitepaper__governance-pause"
        aria-label={paused ? 'Retomar aviso em movimento' : 'Pausar aviso em movimento'}
        aria-pressed={paused}
        onClick={() => setPaused(value => !value)}
      >
        {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
      </button>
    </div>
  );
}
