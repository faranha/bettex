import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { EarningsWalletIllustration } from '@/components/EarningsWalletIllustration';
import { EarningsFreedomIllustration } from '@/components/EarningsFreedomIllustration';
import { EarningsReturnChart } from '@/components/EarningsReturnChart';
import { t, useLocale } from '@/lib/i18n';
import './HomeRevisionSections.css';

const slideTitles = ['Como funciona?', 'Rendimentos', 'Liberdade de entrar e sair'] as const;

export function HomeEarningsSection() {
  useLocale();
  const [i, setI] = useState(0);
  const x0 = useRef<number | null>(null);
  const go = (n: number) => setI((n + slideTitles.length) % slideTitles.length);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
  };
  const down = (e: PointerEvent) => { x0.current = e.clientX; };
  const up = (e: PointerEvent) => {
    if (x0.current === null) return;
    const d = e.clientX - x0.current; x0.current = null;
    if (Math.abs(d) > 48) go(i + (d < 0 ? 1 : -1));
  };
  return (
    <section id="mercados" className="hr-section ew-sec" aria-labelledby="hr-focus-title">
      <span id="tecnologia" className="absolute top-0" aria-hidden="true" />
      <img className="ew-bg" src={`${import.meta.env.BASE_URL}earnings-bg.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" width="1024" height="1024" />
      <div role="region" aria-roledescription={t('Carrossel')} aria-label={t('Carrossel de ganhos diários')} onKeyDown={onKey} data-testid="carousel-earnings" data-active-slide={i + 1}>
        <div className="ew-track" onPointerDown={down} onPointerUp={up} onPointerCancel={() => { x0.current = null; }}>
          <div className="ew-slide" role="group" aria-roledescription={t('Slide')} aria-label="1 / 3" data-active={i === 0} aria-hidden={i !== 0} inert={i !== 0} data-testid="slide-earnings-1">
            <div className="hr-wrap ew-grid">
              <div className="ew-offer ew-top">
                <p className="hr-eyebrow">Ganhos diários</p>
                <h2 id="hr-focus-title" className="ew-h"><span className="ew-h-top">Até{' '}<strong>1%</strong></span>{' '}<span className="ew-h-sub">de lucro por dia.</span></h2>
                <p className="ew-rhythm">Os lucros podem variar de 0 a 1% ao dia, conforme a rentabilidade do agente BETTEX.</p>
                <p className="ew-p">Receba sua parte dos lucros no Pix. Você não precisa saber operar cripto.</p>
                <p className="ew-free">Você decide quando vender e sair.</p>
              </div>
              <EarningsWalletIllustration />
            </div>
          </div>
          <div className="ew-slide" role="group" aria-roledescription={t('Slide')} aria-label="2 / 3" data-active={i === 1} aria-hidden={i !== 1} inert={i !== 1} data-testid="slide-earnings-2">
            <div className="hr-wrap ew-s2">
              <div className="ew-offer">
                <p className="hr-eyebrow">{t('Retorno diário ilustrativo')}</p>
                <h3 className="ew-h2">{t('Limite diário, não rendimento fixo.')}</h3>
                <p className="ew-p2">{t('1% é o limite distribuível por dia, não um rendimento fixo. O lucro depende da operação real.')}</p>
                <p className="ew-rhythm">{t('Sem lucro, não há distribuição.')}</p>
                <p className="ew-p2">{t('Havendo lucro distribuível, todos os detentores elegíveis do token recebem sua parte automaticamente, em reais, na conta BETTEX, conforme as regras de participação.')}</p>
              </div>
              <div className="ew-card">
                <EarningsReturnChart />
                <p className="ew-foot" data-testid="text-earnings-illustrative">{t('Valores ilustrativos, não são histórico real de operações. Demonstração visual, sem pagamentos reais. Sem retorno garantido.')}</p>
              </div>
            </div>
          </div>
          <div className="ew-slide" role="group" aria-roledescription={t('Slide')} aria-label="3 / 3" data-active={i === 2} aria-hidden={i !== 2} inert={i !== 2} data-testid="slide-earnings-3">
            <div className="hr-wrap ew-s2">
              <div className="ew-offer">
                <p className="hr-eyebrow">{t('Liberdade para sair')}</p>
                <h3 className="ew-h2">{t('Você não fica preso.')}</h3>
                <p className="ew-rhythm">{t('Venda seus tokens quando quiser, ao preço de mercado.')}</p>
                <ul className="ew-paths">
                  <li><strong>{t('Pelo aplicativo BETTEX')}</strong><span>{t('Venda seus tokens diretamente pelo aplicativo.')}</span></li>
                  <li><strong>{t('Pela sua própria carteira')}</strong><span>{t('Retire os tokens para a sua carteira e venda em corretoras compatíveis.')}</span></li>
                </ul>
                <p className="ew-foot">{t('Venda sujeita a compradores, liquidez e disponibilidade de mercado. Sem preço mínimo ou recompra garantidos.')}</p>
                <p className="ew-foot">{t('Demonstração visual: nenhum saque ou venda de tokens é realizado de verdade.')}</p>
              </div>
              <EarningsFreedomIllustration />
            </div>
          </div>
        </div>
        <div className="hr-wrap ew-ctrl">
          <button type="button" className="ew-nav ew-nav--prev" onClick={() => go(i - 1)} data-testid="button-earnings-prev">
            <ArrowLeft size={20} aria-hidden="true" />
            <span className="ew-nav-copy"><span className="ew-nav-direction">{t('Anterior')}</span><span>{t(slideTitles[(i + 2) % 3])}</span></span>
          </button>
          <div className="ew-dots">
            {[0, 1, 2].map(n => (
              <button key={n} type="button" className="ew-dot" aria-label={t(n === 2 ? 'Ir para o slide 3' : n ? 'Ir para o slide 2' : 'Ir para o slide 1')} aria-current={i === n} data-active={i === n} onClick={() => go(n)} data-testid={`button-earnings-slide-${n + 1}`} />
            ))}
          </div>
          <button type="button" className="ew-nav ew-nav--next" onClick={() => go(i + 1)} data-testid="button-earnings-next">
            <span className="ew-nav-copy"><span className="ew-nav-direction">{t('Próximo')}</span><span>{t(slideTitles[(i + 1) % 3])}</span></span>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
