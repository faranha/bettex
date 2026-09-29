import { ArrowDownRight } from 'lucide-react';
import './HumanStorySection.css';

export function HumanStorySection() {
  return (
    <section id="historia" className="hs-section" aria-labelledby="hs-heading" data-testid="section-narrativa-humana">
      <div className="hs-wrap">
        <div className="hs-topline">
          <span className="hs-kicker">Antes do próximo palpite</span>
          <span className="hs-topline-detail">Uma conversa franca sobre dinheiro e risco</span>
        </div>

        <div className="hs-grid">
          <div className="hs-left">
            <div className="hs-asterisk" aria-hidden="true" />
            <h2 id="hs-heading">O dinheiro das contas <em>não deveria estar na mesa.</em></h2>
            <p className="hs-lead">Se você está no cassino com o dinheiro que precisa para pagar as contas, vale parar um instante. <strong>Uma aposta não é investimento.</strong> O dinheiro que sobra precisa ser investido com consciência, não apostado de forma irresponsável. Na BETTEX, você investe em um projeto de IA que atua em diferentes mercados de risco. Com seus tokens, você detém os direitos sobre a execução da nossa IA.</p>
          </div>

          <div className="hs-right">
            <div className="hs-family">
              <img
                src={`${import.meta.env.BASE_URL}family-dinner.webp`}
                alt="Família sorrindo e jantando junta em casa"
                loading="lazy"
                decoding="async"
              />
              <span className="hs-down" aria-hidden="true"><ArrowDownRight size={26} strokeWidth={1.5} /></span>
            </div>
            <p className="hs-right-label">O que muda com a BETTEX</p>
            <p className="hs-explanation">Ao comprar e ativar tokens BETTEX, você participa do projeto de IA que reúne os quatro agentes. <strong>Nos dias em que as operações gerarem lucro, titulares com tokens ativados recebem sua parte na distribuição daquele dia.</strong></p>
            <p className="hs-invitation">Seja dono do seu futuro.<br /><strong>Junte-se à BETTEX.</strong></p>
            <div className="hs-conditional">
              <span>O ponto importante</span>
              <p>Sem lucro no dia, <strong>não há distribuição.</strong></p>
            </div>
            <p className="hs-caution">Ainda é investimento de alto risco: as operações podem gerar perdas e o token pode perder valor.</p>
          </div>
        </div>
      </div>
    </section>
  );
}