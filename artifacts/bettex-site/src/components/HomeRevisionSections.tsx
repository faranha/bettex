import { ArrowRight } from 'lucide-react';
import { EarningsWalletIllustration } from '@/components/EarningsWalletIllustration';
import { HomeParticipationLogic } from '@/components/HomeParticipationLogic';
import './HomeRevisionSections.css';

const brain = () => `${import.meta.env.BASE_URL}agents/bettex-intelligence-brain.webp`;

export function HomeOperationSection() {
  return (
    <section id="tecnologia" className="hr-section hr-op" aria-labelledby="hr-op-title">
      <div className="hr-wrap">
        <header className="hr-head">
          <div>
            <p className="hr-eyebrow">Sua participação na BETTEX</p>
            <h2 id="hr-op-title" className="hr-title" data-testid="text-technology-title">Um agente.<br /><em>Análise antes de cada operação.</em></h2>
          </div>
          <p className="hr-note">Antes de cada operação, o agente BETTEX analisa carteiras, volume e liquidez para identificar padrões de manipulação do mercado. Quando identifica, investe contra quem manipula, dentro dos controles de risco. Se não houver oportunidade, ele não opera.</p>
        </header>
        <HomeParticipationLogic />
        <div className="hr-flow" data-testid="diagram-home-flow">
          <div className="hr-brain" role="img" aria-label="Cérebro representando a inteligência artificial da BETTEX">
            <img src={brain()} alt="" width={640} height={640} loading="lazy" decoding="async" />
            <span className="hr-brain__label" aria-hidden="true">IA BETTEX</span>
          </div>
          <ol className="hr-steps">
            <li className="hr-step"><span className="hr-step__n">01</span><h3>Observa</h3><p>Carteiras, volume e liquidez do mercado.</p></li>
            <li className="hr-arrow" aria-hidden="true"><ArrowRight size={20} /></li>
            <li className="hr-step"><span className="hr-step__n">02</span><h3>Identifica</h3><p>Padrões de manipulação.</p></li>
            <li className="hr-arrow" aria-hidden="true"><ArrowRight size={20} /></li>
            <li className="hr-step hr-step--hot"><span className="hr-step__n">03</span><h3>Investe</h3><p>Posições contra a manipulação, dentro dos controles de risco. Sem oportunidade, não opera.</p></li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export function HomeEarningsSection() {
  return (
    <section id="mercados" className="hr-section ew-sec" aria-labelledby="hr-focus-title">
      <div className="hr-wrap ew-grid">
        <div className="ew-offer ew-top">
          <p className="hr-eyebrow">Ganhos diários</p>
          <h2 id="hr-focus-title" className="ew-h">Até{' '}<strong>1%</strong>{' '}de lucro por dia.</h2>
          <p className="ew-p">Receba sua parte dos lucros em USDC, direto na carteira.</p>
          <p className="ew-free">Você decide quando vender e sair.</p>
        </div>
        <EarningsWalletIllustration />
        <div className="ew-offer ew-bot">
          <a href="#participacao" className="ew-link" data-testid="link-earnings-participation">Quero participar <ArrowRight size={18} aria-hidden="true" /></a>
          <p className="ew-foot">Distribuição depende de lucro. Venda sujeita à liquidez.</p>
        </div>
      </div>
    </section>
  );
}
