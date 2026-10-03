import { type ReactNode } from 'react';
import { ArrowDown, WalletCards } from 'lucide-react';
import { BettexMark } from '@/components/BettexMark';
import { BrainEnergy } from './BrainEnergy';
import './TechnologySection.css';

export function TechnologySection({ children }: { children: ReactNode }) {
  return (
    <section id="tecnologia" className="technology-section" aria-labelledby="technology-title">
      <div className="technology-section__wrap">
        <header className="technology-section__intro">
          <div>
            <p className="technology-section__eyebrow">Sua participação na BETTEX</p>
            <h2 id="technology-title" className="technology-section__title" data-testid="text-technology-title">
              Um token.<br /><em>Múltiplos mercados.</em>
            </h2>
          </div>
          <p className="technology-section__intro-note">Antes de cada operação, a BETTEX cruza análises de dados, probabilidades, liquidez e risco. Compara as oportunidades e seleciona o investimento mais vantajoso segundo suas análises, respeitando os limites de risco.</p>
        </header>

        <div className="technology-section__hierarchy" aria-label="compra concluída de BETTEX, participação automática do saldo, uma IA analisando vários mercados e crédito de lucro elegível na Carteira USDC.">
          <div className="technology-section__entry">
            <div className="technology-section__token" data-testid="diagram-technology-token">
              <span className="technology-section__coin" aria-hidden="true"><BettexMark /></span>
              <span className="technology-section__token-copy"><strong>Compra concluída</strong><small>01 / BETTEX</small></span>
            </div>
            <div className="technology-section__deposit-flow">
              <p className="technology-section__deposit-label">Saldo BETTEX participa automaticamente</p>
              <div className="technology-section__deposit-path" aria-hidden="true" />
            </div>
            <div className="technology-section__wallet" data-testid="diagram-technology-wallet">
              <div className="technology-section__wallet-copy">
                <span className="technology-section__wallet-kicker">02 / Participação automática</span>
                <h3><span className="technology-section__wallet-heading-icon" aria-hidden="true"><WalletCards strokeWidth={1.7} /></span><span>Carteira <em>BETTEX</em></span></h3>
              <p>Ao concluir a compra, seus tokens entram na Carteira BETTEX com participação automática. Você acompanha o saldo e os lucros pelo aplicativo. A Carteira USDC recebe depósitos cripto, serve para compras e recebe os créditos de lucro. A interface mostra o valor estimado em moeda fiduciária.</p>
              </div>
              <div className="technology-section__wallet-art" role="img" aria-label="Cérebro representando a inteligência artificial da BETTEX">
                <img className="technology-section__ai-brain" src={`${import.meta.env.BASE_URL}agents/bettex-intelligence-brain.webp`} alt="" width={640} height={640} loading="lazy" decoding="async" />
                <BrainEnergy />
                <span className="technology-section__ai-label" aria-hidden="true">IA BETTEX</span>
              </div>
            </div>
          </div>
          <div className="technology-section__branch" aria-hidden="true" />
          <span className="technology-section__agents-label">03 / Uma IA BETTEX, quatro mercados</span>
          <div className="technology-section__agents" aria-label="Quatro mercados da BETTEX">{children}</div>
          <div className="technology-section__result-path" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <div className="technology-section__result" data-testid="diagram-technology-result">
            <span className="technology-section__result-arrow" aria-hidden="true"><ArrowDown size={18} /></span>
            <span className="technology-section__result-icon" aria-hidden="true"><WalletCards size={32} strokeWidth={1.7} /></span>
            <div className="technology-section__result-copy">
              <span className="technology-section__result-kicker">Dos mercados para a Carteira USDC</span>
              <h3>Crédito de lucro em USDC.</h3>
              <p>Nos dias com lucro elegível e condições de distribuição atendidas, sua parte é creditada na Carteira USDC, sem venda de BETTEX. Você vê a estimativa em moeda fiduciária. Sem lucro elegível, não há distribuição.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
