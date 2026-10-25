import { ArrowRight } from 'lucide-react';
import { EarningsWalletIllustration } from '@/components/EarningsWalletIllustration';
import './HomeRevisionSections.css';

export function HomeEarningsSection() {
  return (
    <section id="mercados" className="hr-section ew-sec" aria-labelledby="hr-focus-title">
      <span id="tecnologia" className="absolute top-0" aria-hidden="true" />
      <img className="ew-bg" src={`${import.meta.env.BASE_URL}earnings-bg.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="hr-wrap ew-grid">
        <div className="ew-offer ew-top">
          <p className="hr-eyebrow">Ganhos diários</p>
          <h2 id="hr-focus-title" className="ew-h"><span className="ew-h-top">Até{' '}<strong>1%</strong></span>{' '}<span className="ew-h-sub">de lucro por dia.</span></h2>
          <p className="ew-rhythm">Todo dia, um novo ciclo.</p>
          <p className="ew-p">Receba sua parte dos lucros no Pix. Você não precisa saber operar cripto.</p>
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
