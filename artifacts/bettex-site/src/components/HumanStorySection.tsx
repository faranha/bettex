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
            <h2 id="hs-heading">O dinheiro das contas <em>não deveria estar na mesa.</em></h2>
            <p className="hs-lead">Sem controle emocional, uma perda pode virar outra tentativa de recuperar o dinheiro. Sem controle financeiro, até o dinheiro das contas entra na aposta. É esse ciclo que a BETTEX enfrenta: agentes de IA executam as operações, enquanto você acompanha saldos, histórico e resultados em uma interface única.</p>
          </div>

          <div className="hs-right">
            <div className="hs-risk-card">
              <p className="hs-risk-label">Quando você aposta sozinho</p>
              <h3>Sem controle, uma aposta pode custar tudo.</h3>
              <ul>
                <li><strong>Sem controle emocional</strong><span>A pressa de recuperar uma perda leva a novas apostas.</span></li>
                <li><strong>Sem controle financeiro</strong><span>Sem limites, até o dinheiro das contas pode entrar na aposta.</span></li>
              </ul>
            </div>
            <p className="hs-right-label">Como a BETTEX muda essa dinâmica</p>
            <p className="hs-explanation"><strong>Na BETTEX, a operação não depende do impulso de apostar.</strong> Os agentes de IA atuam em mercados de risco, e você acompanha saldos, movimentações e a atividade dos agentes no mesmo lugar.</p>
            <p className="hs-next">Menos impulso. Mais visibilidade. O risco de perda continua.</p>
          </div>
        </div>
      </div>
    </section>
  );
}