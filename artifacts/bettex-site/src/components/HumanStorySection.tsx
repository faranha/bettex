import { ArrowRight } from 'lucide-react';
import { StoryPhonePreview } from './StoryPhonePreview';
import './HumanStorySection.css';

export function HumanStorySection() {
  return (
    <section id="historia" className="hs-section" aria-labelledby="hs-heading" data-testid="section-narrativa-humana">
      <div className="hs-wrap">
        <div className="hs-grid">
          <div className="hs-left">
            <h2 id="hs-heading">Você não precisa fazer as operações para <em>participar dos lucros.</em></h2>
            <p className="hs-lead">A IA opera. Seu BETTEX dá participação nos resultados. Você acompanha tudo pelo aplicativo e decide quando vender seus tokens.</p>
            <p className="hs-key">Não precisa saber operar cripto. Você recebe em reais.</p>
            <a href="#participacao" className="hs-cta" data-testid="link-historia-participacao">Veja como participar <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
          <StoryPhonePreview />
        </div>
      </div>
    </section>
  );
}
