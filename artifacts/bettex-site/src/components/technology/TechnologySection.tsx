import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, WalletCards } from 'lucide-react';
import { BettexMark } from '@/components/BettexMark';
import { BrainEnergy } from './BrainEnergy';
import './TechnologySection.css';

const SLIDE_LABELS = [
  'Ir para o slide 1: Previsões',
  'Ir para o slide 2: Ações e cripto',
  'Ir para o slide 3: Esportes',
  'Ir para o slide 4: iGaming',
  'Ir para o slide 5: Carteira USDC',
];
const COUNT = SLIDE_LABELS.length;

export function TechnologySection({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [mobile, setMobile] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const n = Math.max(0, Math.min(COUNT - 1, i));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    activeRef.current = n;
    setActive(n);
    el.scrollTo({ left: n * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const mq = window.matchMedia('(max-width: 767px)');
    let raf = 0;
    const onMq = () => { setMobile(mq.matches); if (!mq.matches) { el.scrollLeft = 0; activeRef.current = 0; setActive(0); } };
    const onScroll = () => {
      if (!mq.matches) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.max(0, Math.min(COUNT - 1, Math.round(el.scrollLeft / (el.clientWidth || 1))));
        if (i !== activeRef.current) { activeRef.current = i; setActive(i); }
      });
    };
    const onResize = () => { if (mq.matches) el.scrollTo({ left: activeRef.current * el.clientWidth, behavior: 'auto' }); };
    onMq();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    mq.addEventListener('change', onMq);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); mq.removeEventListener('change', onMq); };
  }, []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!mobile || e.target !== e.currentTarget) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(activeRef.current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(activeRef.current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(COUNT - 1); }
  };

  return (
    <section id="tecnologia" className="technology-section" aria-labelledby="technology-title">
      <div className="technology-section__wrap">
        <header className="technology-section__intro">
          <div>
            <p className="technology-section__eyebrow">Sua participação na BETTEX</p>
            <h2 id="technology-title" className="technology-section__title" data-testid="text-technology-title">
              Um token.<br /><em>Múltiplos mercados.</em>
            </h2>
          </div>
          <p className="technology-section__intro-note">Antes de cada operação, a BETTEX cruza análises de dados, probabilidades, liquidez e risco. Compara as oportunidades e seleciona o investimento mais vantajoso segundo suas análises, respeitando os limites de risco.</p>
        </header>

          <div className="technology-section__entry">
            <div className="technology-section__token" data-testid="diagram-technology-token">
              <span className="technology-section__coin" aria-hidden="true"><BettexMark /></span>
              <span className="technology-section__token-copy"><strong>Compra concluída</strong><small>01 / BETTEX</small></span>
            </div>
            <div className="technology-section__deposit-flow">
              <p className="technology-section__deposit-label">Saldo BETTEX participa automaticamente</p>
              <div className="technology-section__deposit-path" aria-hidden="true" />
            </div>
            <div className="technology-section__wallet" data-testid="diagram-technology-wallet">
              <div className="technology-section__wallet-copy">
                <span className="technology-section__wallet-kicker">02 / Participação automática</span>
                <h3><span className="technology-section__wallet-heading-icon" aria-hidden="true"><WalletCards strokeWidth={1.7} /></span><span>Carteira <em>BETTEX</em></span></h3>
              <p>Ao concluir a compra, seus tokens entram na Carteira BETTEX com participação automática. Você acompanha o saldo e os lucros pelo aplicativo. A Carteira USDC recebe depósitos cripto, serve para compras e recebe os créditos de lucro. A interface mostra o valor estimado em moeda fiduciária.</p>
              </div>
              <div className="technology-section__wallet-art" role="img" aria-label="Cérebro representando a inteligência artificial da BETTEX">
                <img className="technology-section__ai-brain" src={`${import.meta.env.BASE_URL}agents/bettex-intelligence-brain.webp`} alt="" width={640} height={640} loading="lazy" decoding="async" />
                <BrainEnergy />
                <span className="technology-section__ai-label" aria-hidden="true">IA BETTEX</span>
              </div>
            </div>
          </div>
        <div className="technology-section__hierarchy" ref={trackRef} onKeyDown={onKey} tabIndex={mobile ? 0 : undefined} role="group" data-testid="slider-tecnologia" aria-label="Mercados da BETTEX e crédito de lucro elegível na Carteira USDC.">
          <div className="technology-section__branch" aria-hidden="true" />
          <span className="technology-section__agents-label">03 / Uma IA BETTEX, quatro mercados</span>
          <div className="technology-section__agents" aria-label="Quatro mercados da BETTEX">{children}</div>
          <div className="technology-section__result-path" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <div className="technology-section__result" data-testid="diagram-technology-result">
            <span className="technology-section__result-arrow" aria-hidden="true"><ArrowDown size={18} /></span>
            <span className="technology-section__result-icon" aria-hidden="true"><WalletCards size={32} strokeWidth={1.7} /></span>
            <div className="technology-section__result-copy">
              <span className="technology-section__result-kicker">Dos mercados para a Carteira USDC</span>
              <h3>Crédito de lucro em USDC.</h3>
              <p>Nos dias com lucro elegível e condições de distribuição atendidas, sua parte é creditada na Carteira USDC, sem venda de BETTEX. Você vê a estimativa em moeda fiduciária. Sem lucro elegível, não há distribuição.</p>
            </div>
          </div>
        </div>
        <div className="technology-section__nav" data-testid="controls-tecnologia">
          <button type="button" className="technology-section__nav-btn" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Slide anterior" data-testid="button-tecnologia-anterior"><ArrowLeft size={18} aria-hidden="true" /></button>
          <div className="technology-section__dots">
            {SLIDE_LABELS.map((label, i) => (
              <button type="button" key={label} className="technology-section__dot" onClick={() => goTo(i)} aria-label={label} aria-current={active === i ? 'step' : undefined} data-active={active === i} data-testid={`button-tecnologia-${i + 1}`} />
            ))}
          </div>
          <button type="button" className="technology-section__nav-btn" onClick={() => goTo(active + 1)} disabled={active === COUNT - 1} aria-label="Próximo slide" data-testid="button-tecnologia-proximo"><ArrowRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
}