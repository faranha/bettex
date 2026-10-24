import { ArrowRight, ChartCandlestick } from 'lucide-react';
import { CommunityCTA } from '@/components/CommunityCTA';
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

export function HomeFocusSection() {
  return (
    <section id="mercados" className="hr-section hr-focus" aria-labelledby="hr-focus-title">
      <div className="hr-wrap">
        <header className="hr-head">
          <div>
            <p className="hr-eyebrow">Foco inicial</p>
            <h2 id="hr-focus-title" className="hr-title">Começamos focados.<br /><em>Expandimos com validação.</em></h2>
          </div>
          <p className="hr-note">Começamos com um agente de IA em um mercado cripto. O ativo inicial ainda não foi escolhido. Novos ativos cripto só entram depois de validação.</p>
        </header>
        <div className="hr-focus-grid">
          <div className="hr-focus-art" role="img" aria-label="Um agente de IA focado em um mercado cripto">
            <img src={brain()} alt="" width={640} height={640} loading="lazy" decoding="async" />
            <span className="hr-focus-chip"><ChartCandlestick size={18} aria-hidden="true" />Mercado cripto</span>
          </div>
          <div className="hr-focus-list">
            <div className="hr-focus-item"><span>Agora</span><h3>Um agente, um mercado cripto</h3><p>Ativo inicial: a definir.</p></div>
            <div className="hr-focus-item"><span>Depois</span><h3>Mais ativos cripto</h3><p>Somente após validação.</p></div>
          </div>
        </div>
        <CommunityCTA source="mercados" note="Veja de perto o que a IA acompanha." />
      </div>
    </section>
  );
}
