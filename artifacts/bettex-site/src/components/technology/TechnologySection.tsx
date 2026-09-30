import { type ReactNode } from 'react';
import { ArrowDown, WalletCards } from 'lucide-react';
import { BettexMark } from '@/components/BettexMark';
import './TechnologySection.css';

export function TechnologySection({ children }: { children: ReactNode }) {
  return (
    <section id="tecnologia" className="technology-section" aria-labelledby="technology-title">
      <div className="technology-section__wrap">
        <header className="technology-section__intro">
          <div>
            <p className="technology-section__eyebrow">Sua participação na BETTEX</p>
            <h2 id="technology-title" className="technology-section__title" data-testid="text-technology-title">
              Uma IA de apostas<br /><em>que controla quatro agentes</em>
            </h2>
          </div>
           <p className="technology-section__intro-note">Este diagrama ilustra o modelo proposto. As regras de participação estão na documentação técnica; a infraestrutura, custódia e validação operacional ainda dependem de construção.</p>
        </header>

         <div className="technology-section__hierarchy" aria-label="Modelo proposto: token BETTEX, participação sujeita a regras, quatro agentes e possível distribuição de lucros líquidos em USDC.">
          <div className="technology-section__entry">
            <div className="technology-section__token" data-testid="diagram-technology-token">
              <span className="technology-section__coin" aria-hidden="true"><BettexMark /></span>
               <span className="technology-section__token-copy"><strong>Token BETTEX proposto</strong><small>01 / Emissão</small></span>
            </div>
            <div className="technology-section__deposit-flow">
              <p className="technology-section__deposit-label">Mova para sua carteira</p>
              <div className="technology-section__deposit-path" aria-hidden="true" />
            </div>
            <div className="technology-section__wallet" data-testid="diagram-technology-wallet">
              <div className="technology-section__wallet-copy">
                  <span className="technology-section__wallet-kicker">02 / Staking proposto</span>
                <h3><span className="technology-section__wallet-heading-icon" aria-hidden="true"><WalletCards strokeWidth={1.7} /></span><span>Carteira <em>BETTEX</em></span></h3>
                  <p>Staking de ao menos 1 BETTEX, sem período de bloqueio. O tempo em depósito determina a participação no mês UTC. A forma de custódia e a implementação ainda precisam ser validadas.</p>
              </div>
              <div className="technology-section__wallet-art" role="img" aria-label="Robô da IA BETTEX com a marca BETTEX no peito">
                <img className="technology-section__ai-robot" src={`${import.meta.env.BASE_URL}agents/bettex-hunter-portrait.webp`} alt="" loading="lazy" decoding="async" />
                <span className="technology-section__ai-brand" aria-hidden="true"><BettexMark /></span>
                <span className="technology-section__ai-label" aria-hidden="true">IA BETTEX</span>
              </div>
            </div>
          </div>
          <div className="technology-section__branch" aria-hidden="true" />
          <span id="agentes" className="technology-section__agents-label">03 / Operações dos quatro agentes BETTEX</span>
          <div className="technology-section__agents" aria-label="Quatro agentes da BETTEX">{children}</div>
          <div className="technology-section__result-path" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <div className="technology-section__result" data-testid="diagram-technology-result">
            <span className="technology-section__result-arrow" aria-hidden="true"><ArrowDown size={18} /></span>
            <span className="technology-section__result-icon" aria-hidden="true"><WalletCards size={32} strokeWidth={1.7} /></span>
            <div className="technology-section__result-copy">
               <span className="technology-section__result-kicker">Resultados possíveis · distribuição condicionada</span>
                <h3>Distribuição em USDC quando houver lucro elegível.</h3>
                <p>Após compensar perdas anteriores, metade do resultado líquido realizado é distribuída proporcionalmente aos BETTEX depositados e elegíveis. Lucro não é garantido. A saída é em USDC para carteira na rede Arbitrum One, não em reais ou por banco.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}