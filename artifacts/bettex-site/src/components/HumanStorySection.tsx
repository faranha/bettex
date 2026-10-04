import { NewsClipping } from './hero/NewsClipping';
import './HumanStorySection.css';

export function HumanStorySection() {
  return (
    <section id="historia" className="hs-section" aria-labelledby="hs-heading" data-testid="section-narrativa-humana">
      <img className="hs-photo" src={`${import.meta.env.BASE_URL}story/man-loss-background.jpg`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="hs-wrap">
        <div className="hs-topline">
          <span className="hs-kicker">Uma comunidade do seu lado</span>
          <span className="hs-topline-detail">Tecnologia, decisões e participação</span>
        </div>

        <div className="hs-grid">
          <div className="hs-left">
            <div className="hs-asterisk" aria-hidden="true" />
            <h2 id="hs-heading">Admita: você <em>perde mais do que ganha.</em></h2>
            <p className="hs-market-context">O mercado está contra você o tempo todo e utiliza a tecnologia para tirar o seu dinheiro. A comunidade BETTEX reúne quem quer mudar essa relação e usar a IA do seu lado.</p>
            <div className="hs-risk-card">
              <p className="hs-risk-label">A IA opera. A comunidade participa.</p>
              <h3>Na BETTEX, não é impulso: a IA faz as operações.</h3>
              <ul>
                <li><strong>Análise, não palpite</strong><span>Nossa IA cruza análises de diferentes mercados antes de operar.</span></li>
                <li><strong>Você faz parte da comunidade</strong><span>Compartilhe ideias, acompanhe as operações e ajude nas decisões do projeto.</span></li>
              </ul>
            </div>
          </div>

          <div className="hs-right">
            <p className="hs-right-label">A IA do outro lado da aposta</p>
            <p className="hs-explanation"><strong>As casas usam IA para conhecer você.</strong></p>
            <div className="hs-collage">
              <NewsClipping className="hs-news" showSource caption="A reportagem mostra como uma casa de apostas usou IA para identificar quem tinha mais chance de perder. Na BETTEX, a comunidade acompanha a tecnologia usada nas operações e participa das decisões." />
            </div>
            <p className="hs-next">CONHEÇA A IA.<br /><strong>PARTICIPE DA COMUNIDADE.</strong></p>
          </div>
        </div>
      </div>
    </section>
  );
}