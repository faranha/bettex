import { NewsClipping } from './hero/NewsClipping';
import './HumanStorySection.css';

export function HumanStorySection() {
  return (
    <section id="historia" className="hs-section" aria-labelledby="hs-heading" data-testid="section-narrativa-humana">
      <img className="hs-photo" src={`${import.meta.env.BASE_URL}story/man-loss-background.jpg`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="hs-wrap">
        <div className="hs-topline">
          <span className="hs-kicker">Antes do próximo palpite</span>
          <span className="hs-topline-detail">Uma conversa franca sobre dinheiro e risco</span>
        </div>

        <div className="hs-grid">
          <div className="hs-left">
            <div className="hs-asterisk" aria-hidden="true" />
            <h2 id="hs-heading">Admita: você <em>perde mais do que ganha.</em></h2>
            <div className="hs-risk-card">
              <p className="hs-risk-label">Como a BETTEX opera</p>
              <h3>Na BETTEX, a operação não depende do impulso de apostar.</h3>
              <ul>
                <li><strong>Análise, não palpite</strong><span>Nossa IA cruza análises de diferentes mercados antes de operar.</span></li>
                <li><strong>Sua participação em BETTEX</strong><span>Acompanhe as operações e os resultados pelo app.</span></li>
              </ul>
            </div>
          </div>

          <div className="hs-right">
            <p className="hs-right-label">A IA do outro lado da aposta</p>
            <p className="hs-explanation"><strong>Deixe de ser uma vítima do sistema.</strong></p>
            <div className="hs-collage">
              <NewsClipping className="hs-news" showSource />
            </div>
            <p className="hs-next">USE IA CONTRA<br /><strong>O SISTEMA.</strong></p>
          </div>
        </div>
      </div>
    </section>
  );
}