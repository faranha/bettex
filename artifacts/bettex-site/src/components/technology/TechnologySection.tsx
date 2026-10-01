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
              Uma IA, um token<br /><em>quatro mercados</em>
            </h2>
          </div>
          <p className="technology-section__intro-note">Antes de cada operação, a BETTEX cruza análises de dados, probabilidades, liquidez e risco. Compara as oportunidades e seleciona o investimento mais vantajoso segundo suas análises, respeitando os limites de risco.</p>
        </header>

        <div className="technology-section__hierarchy" aria-label="O sistema processa a compra e a ativação dos tokens BETTEX. Nos dias de lucro, sua parte é creditada em reais na conta BETTEX, com saque por Pix.">
          <div className="technology-section__entry">
            <div className="technology-section__token" data-testid="diagram-technology-token">
              <span className="technology-section__coin" aria-hidden="true"><BettexMark /></span>
              <span className="technology-section__token-copy"><strong>Compre o token BETTEX</strong><small>01 / Compra</small></span>
            </div>
            <div className="technology-section__deposit-flow">
              <p className="technology-section__deposit-label">Participação ativada</p>
              <div className="technology-section__deposit-path" aria-hidden="true" />
            </div>
            <div className="technology-section__wallet" data-testid="diagram-technology-wallet">
              <div className="technology-section__wallet-copy">
                <span className="technology-section__wallet-kicker">02 / Ative sua participação</span>
                <h3><span className="technology-section__wallet-heading-icon" aria-hidden="true"><WalletCards strokeWidth={1.7} /></span><span>Carteira <em>BETTEX</em></span></h3>
                <p>Deposite seus tokens na Carteira BETTEX para ativar sua participação. No aplicativo, você acompanha a atuação da IA nos diferentes mercados, sua participação e os lucros em reais.</p>
              </div>
              <div className="technology-section__wallet-art" role="img" aria-label="Robô da IA BETTEX com a marca BETTEX no peito">
                <img className="technology-section__ai-robot" src={`${import.meta.env.BASE_URL}agents/bettex-hunter-portrait.webp`} alt="" loading="lazy" decoding="async" />
                <span className="technology-section__ai-brand" aria-hidden="true"><BettexMark /></span>
                <span className="technology-section__ai-label" aria-hidden="true">IA BETTEX</span>
              </div>
            </div>
          </div>
          <div className="technology-section__branch" aria-hidden="true" />
          <span id="mercados" className="technology-section__agents-label">03 / Um agente BETTEX, quatro mercados</span>
          <div className="technology-section__agents" aria-label="Quatro mercados da BETTEX">{children}</div>
          <div className="technology-section__result-path" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <div className="technology-section__result" data-testid="diagram-technology-result">
            <span className="technology-section__result-arrow" aria-hidden="true"><ArrowDown size={18} /></span>
            <span className="technology-section__result-icon" aria-hidden="true"><WalletCards size={32} strokeWidth={1.7} /></span>
            <div className="technology-section__result-copy">
              <span className="technology-section__result-kicker">Dos quatro mercados para a sua conta</span>
              <h3>Lucro creditado na sua conta BETTEX.</h3>
              <p>Nos dias em que houver lucro, sua parte é creditada em reais na conta dentro da plataforma, se seus tokens estiverem ativados. Depósitos e saques são em reais, por Pix. Você pode sacar sua parte imediatamente, sem limite e sem restrições. Sem lucro, não há distribuição.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}