import { type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, WalletCards } from 'lucide-react';
import { BettexMark } from '@/components/BettexMark';
import './TechnologySection.css';

export function TechnologySection({ children }: { children: ReactNode }) {
  return (
    <section id="agentes" className="technology-section scroll-mt-[72px]" aria-labelledby="technology-title">
      <div className="technology-section__wrap">
        <header className="technology-section__intro">
          <div>
            <p className="technology-section__eyebrow">Sua participação na BETTEX</p>
            <h2 id="technology-title" className="technology-section__title" data-testid="text-technology-title">
              Uma BETTEX.<br /><em>Quatro especialidades.</em>
            </h2>
          </div>
          <p className="technology-section__intro-note">Compre tokens BETTEX, mova-os para sua Carteira BETTEX e participe das operações dos quatro agentes.</p>
        </header>

        <div className="technology-section__hierarchy" aria-label="Compre tokens BETTEX, mova-os para sua carteira e participe das operações dos quatro agentes. Nos dias de lucro, sua parte é creditada na conta BETTEX.">
          <div className="technology-section__deposit-flow">
            <div className="technology-section__token" data-testid="diagram-technology-token">
              <span className="technology-section__coin" aria-hidden="true"><BettexMark /></span>
              <span className="technology-section__token-copy"><strong>Compre o token BETTEX</strong><small>01 / Compra</small></span>
            </div>
            <p className="technology-section__deposit-label">Mova para sua carteira</p>
            <div className="technology-section__deposit-path" aria-hidden="true">
              <span className="technology-section__moving-coin"><BettexMark /></span>
              <span className="technology-section__moving-coin"><BettexMark /></span>
              <span className="technology-section__moving-coin"><BettexMark /></span>
              <ArrowDown size={20} strokeWidth={2.4} />
            </div>
          </div>
          <div className="technology-section__wallet" data-testid="diagram-technology-wallet">
            <span className="technology-section__wallet-slot" aria-hidden="true" />
            <span className="technology-section__wallet-falling-coin" aria-hidden="true"><BettexMark /></span>
            <span className="technology-section__wallet-falling-coin" aria-hidden="true"><BettexMark /></span>
            <span className="technology-section__wallet-falling-coin" aria-hidden="true"><BettexMark /></span>
            <div className="technology-section__wallet-copy">
              <span className="technology-section__wallet-kicker">02 / Ative sua participação</span>
              <h3>Carteira <em>BETTEX</em></h3>
              <p>Ao mover seus tokens para sua Carteira BETTEX, você ativa sua participação nas operações dos quatro agentes. Seus tokens continuam na carteira.</p>
            </div>
            <div className="technology-section__wallet-art" aria-hidden="true">
              <WalletCards size={126} strokeWidth={1.25} />
              <span className="technology-section__wallet-coin"><BettexMark /></span>
            </div>
          </div>
          <div className="technology-section__branch" aria-hidden="true" />
          <span id="tecnologia" className="technology-section__agents-label scroll-mt-[88px]">03 / Operações dos quatro agentes BETTEX</span>
          <div className="technology-section__agents" aria-label="Quatro agentes da BETTEX">{children}</div>
          <div className="technology-section__result-path" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <div className="technology-section__result" data-testid="diagram-technology-result">
            <span className="technology-section__result-arrow" aria-hidden="true"><ArrowDown size={18} /></span>
            <span className="technology-section__result-icon" aria-hidden="true"><WalletCards size={32} strokeWidth={1.7} /></span>
            <div className="technology-section__result-copy">
              <span className="technology-section__result-kicker">Dos quatro agentes para a sua conta</span>
              <h3>Lucro creditado na sua conta BETTEX.</h3>
              <p>Nos dias em que houver lucro, sua parte é creditada na conta dentro da plataforma, se seus tokens estiverem ativados. Você pode sacar sua parte imediatamente, sem limite e sem restrições. Sem lucro, não há distribuição.</p>
            </div>
          </div>
        </div>

        <div className="technology-section__after">
          <p className="technology-section__clarity"><strong>Um token, participação no sistema inteiro.</strong> O token representa a participação na BETTEX; não executa operações. Mercados de risco podem gerar perdas e lucros não são garantidos.</p>
          <div className="technology-section__allora">
            <span className="technology-section__allora-label">REDE EXTERNA / ALLORA</span>
            <p>A Allora é uma rede descentralizada de inteligência externa que apoia PREDIX e TRADEX.</p>
            <a href="https://docs.allora.network/home/overview" target="_blank" rel="noopener noreferrer" data-testid="link-allora-documentation">
              Documentação da Allora <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}