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
              <p className="hs-risk-label">Quando você aposta sozinho</p>
              <h3>Sem controle, uma aposta pode custar tudo.</h3>
              <ul>
                <li><strong>Sem controle emocional</strong><span>A pressa de recuperar uma perda leva a novas apostas.</span></li>
                <li><strong>Sem controle financeiro</strong><span>Sem limites, até o dinheiro das contas pode entrar na aposta.</span></li>
              </ul>
            </div>
          </div>

          <div className="hs-right">
            <p className="hs-right-label">Como a BETTEX muda essa dinâmica</p>
            <p className="hs-explanation"><strong>Na BETTEX, a operação não depende do impulso de apostar.</strong> A BETTEX analisa diferentes mercados de risco e busca otimizar os investimentos onde identifica maior vantagem. Você acompanha saldos, movimentações e a atividade da IA no mesmo lugar.</p>
            <p className="hs-next">Seja dono do seu futuro.<br /><strong>Junte-se à BETTEX.</strong></p>
          </div>
        </div>
      </div>
    </section>
  );
}