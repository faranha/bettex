import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowRight, Wallet } from 'lucide-react';
import { OrderFlowIllustration } from '@/components/HomeIllustrations';
import { TokenIllustration, DepositIllustration } from '@/components/ProjectModelIllustrations';


const STEP_COUNT = 4;
const dotLabels = ['Ir para a etapa 1', 'Ir para a etapa 2', 'Ir para a etapa 3', 'Ir para a etapa 4'];

export function ProjectModelSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [mobile, setMobile] = useState(false);

  const goTo = useCallback((i: number, instant = false) => {
    const el = trackRef.current;
    if (!el) return;
    const n = Math.max(0, Math.min(STEP_COUNT - 1, i));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    activeRef.current = n;
    setActive(n);
    el.scrollTo({ left: n * el.clientWidth, behavior: instant || reduce ? 'auto' : 'smooth' });
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
        const w = el.clientWidth || 1;
        const i = Math.max(0, Math.min(STEP_COUNT - 1, Math.round(el.scrollLeft / w)));
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
    if (!mobile) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(activeRef.current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(activeRef.current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(STEP_COUNT - 1); }
  };

  return (
    <section id="participacao" className="pm-section" aria-labelledby="pm-heading" data-testid="section-modelo-projeto">
      <style>{`
        .pm-section {
          --pm-deep: #13204F;
          --pm-lime: #F2B632;
          --pm-cream: #F4F1E8;
          position: relative;
          overflow: hidden;
          color: #F4F1E8;
          background: #070B1F;
          border-top: 1px solid rgba(43,89,255,.28);
          padding: clamp(72px, 8vw, 112px) 0 clamp(24px, 3vw, 40px);
        }
        .pm-casino-wheel {
          position: absolute; top: -100px; right: max(4vw, 20px);
          width: min(46vw, 570px); aspect-ratio: 1; border-radius: 50%;
          border: 2px solid rgba(43,89,255,.35);
          background: repeating-conic-gradient(from -7deg, rgba(43,89,255,.2) 0deg 10deg, rgba(19,32,79,.55) 10deg 20deg);
          mask-image: radial-gradient(circle, transparent 0 15%, #000 16% 20%, transparent 21% 27%, #000 28% 81%, transparent 82%);
          opacity: .8; pointer-events: none;
        }
        .pm-casino-wheel::after { content: ""; position: absolute; top: 19%; left: calc(50% - 6px); width: 12px; height: 12px; border-radius: 50%; background: #F2B632; box-shadow: 0 2px 7px rgba(0,0,0,.4); }
        .pm-casino-cards { position: absolute; top: 95px; right: 28%; width: 155px; height: 160px; opacity: .42; pointer-events: none; }
        .pm-casino-card {
          position: absolute; display: grid; place-items: center; width: 94px; height: 128px;
          border: 2px solid rgba(43,89,255,.7); border-radius: 11px; background: rgba(19,32,79,.8);
          color: #5F86FF; font: 700 44px/1 Georgia, serif;
        }
        .pm-casino-card:first-child { left: 0; top: 17px; transform: rotate(-17deg); }
        .pm-casino-card:last-child { left: 44px; top: 0; transform: rotate(13deg); }
        .pm-sport-ball {
          position: absolute; top: 125px; right: clamp(16px, 3vw, 64px);
          width: clamp(105px, 11vw, 155px); aspect-ratio: 1; color: #5F86FF;
          opacity: .32; transform: rotate(-17deg); pointer-events: none;
        }
        .pm-sport-ball svg { display: block; width: 100%; height: 100%; }
        .pm-wrap { position: relative; z-index: 1; width: min(100% - 40px, 1200px); margin-inline: auto; }
         .pm-head { position: relative; min-height: 190px; margin-bottom: 32px; }
         .pm-eyebrow { display: flex; align-items: center; gap: 11px; margin: 0 0 18px; color: #5F86FF; font: 700 10px/1.5 var(--app-font-mono); letter-spacing: .15em; text-transform: uppercase; }
        .pm-eyebrow::before { content: ""; width: 24px; height: 2px; background: currentColor; }
           .pm-title { position: relative; z-index: 1; max-width: calc(100% - 350px); margin: 0; font: 800 clamp(2.65rem, 4.5vw, 4.7rem)/1.02 var(--app-font-serif); letter-spacing: -.065em; }
         .pm-title span { color: #F2B632; font-size: .75em; }
          .pm-head-note { position: relative; z-index: 1; max-width: 340px; margin: 16px 0 0; color: #aebbe3; font-size: 13px; line-height: 1.55; }
          .pm-person { position: absolute; z-index: 0; right: 15px; bottom: -42px; width: 330px; height: 330px; object-fit: contain; object-position: center bottom; pointer-events: none; filter: drop-shadow(0 10px 20px rgba(14,28,66, .18)); }
          .pm-panel { position: relative; z-index: 1; overflow: hidden; border: 1px solid rgba(43,89,255,.4); border-radius: 28px; background: var(--pm-deep); color: var(--pm-cream); box-shadow: 0 20px 48px rgba(14,37,101, .13); }
        .pm-panel-top { display: flex; justify-content: space-between; gap: 16px; padding: 24px 32px 0; }
        .pm-panel-label, .pm-panel-count { margin: 0; color: #5F86FF; font: 700 10px/1.5 var(--app-font-mono); letter-spacing: .12em; text-transform: uppercase; }
        .pm-panel-count { color: #4b73cf; letter-spacing: .06em; white-space: nowrap; }
          .pm-steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 27px 12px 32px; }
        .pm-step { position: relative; min-width: 0; padding: 9px 20px 10px; }
        .pm-step + .pm-step { border-left: 1px solid rgba(121,157,241, .24); }
         .pm-index { display: block; margin-bottom: 12px; color: #5F86FF; font: 700 11px/1 var(--app-font-mono); }
        .pm-step h3 { margin: 0; font: 800 clamp(1.3rem, 1.95vw, 1.8rem)/1.18 var(--app-font-serif); letter-spacing: -.045em; overflow-wrap: anywhere; text-wrap: balance; }
        .pm-step h3 em { color: var(--pm-lime); font-style: normal; }
        .pm-step .pm-agent-title em { display: block; margin-top: .08em; }
        .pm-detail { margin: 12px 0 0; color: #87a0dd; font-size: 12px; line-height: 1.55; }
         .pm-visual { display: flex; align-items: center; height: 84px; margin-bottom: 15px; }
         .pm-profit-visual { position: relative; width: 205px; }
         .pm-profit-coin { position: absolute; display: grid; width: 39px; height: 39px; place-items: center; border: 2px solid #F2B632; border-radius: 50%; background: linear-gradient(135deg, #F2B632, #F2B632); box-shadow: inset 0 0 0 4px rgba(255, 245, 224, .65), 0 5px 0 #B8860B; color: #B8860B; font: 800 20px/1 var(--app-font-serif); }
         .pm-profit-coin--one { left: 0; top: 32px; }
         .pm-profit-coin--two { left: 22px; top: 15px; }
         .pm-profit-coin--three { left: 44px; top: 34px; }
         .pm-profit-arrow { position: absolute; left: 88px; top: 25px; color: #F2B632; animation: pm-go 1.8s ease-in-out infinite; }
         .pm-profit-wallet { position: absolute; top: 23px; left: 131px; display: grid; width: 56px; height: 44px; place-items: center; border: 1px solid #5F86FF; border-radius: 9px; background: #13204F; color: #5F86FF; box-shadow: 0 7px 0 #070B1F; }
         @keyframes pm-go { 50% { transform: translateX(5px); } }
        .pm-agent-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; margin-top: 19px; }
        .pm-agent { display: flex; flex-direction: column; gap: 2px; min-width: 0; padding: 9px 10px; border: 1px solid rgba(121,157,241, .19); border-radius: 9px; background: rgba(245, 246, 237, .055); }
        .pm-agent strong { color: #F4F1E8; font: 800 12px/1.1 var(--app-font-serif); letter-spacing: -.02em; }
        .pm-agent span { color: #7996d9; font-size: 11px; }
        .pm-outcomes { display: grid; gap: 8px; margin-top: 18px; }
        .pm-outcome { padding: 12px 13px; border-radius: 10px; }
         .pm-outcome--profit { background: #F2B632; color: #070B1F; }
        .pm-outcome h4 { margin: 0 0 8px; font: 800 16px/1.2 var(--app-font-serif); letter-spacing: -.025em; }
        .pm-outcome p { margin: 0; font-size: 13px; font-weight: 400; line-height: 1.5; }
        .pm-outcome a { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
        .pm-panel-foot { padding: 20px 32px; border-top: 1px solid rgba(95,134,255,.25); background: rgba(7,11,31,.55); color: #c9d4f5; }
        .pm-panel-foot p { margin: 0; font-size: 13px; line-height: 1.5; }
        .pm-buyback-note { margin-top: 8px !important; color: #87a0dd; font-size: 12px !important; }
        .pm-buyback-note a { color: inherit; text-underline-offset: 3px; }
        @media (min-width: 768px) {
          .pm-title span { white-space: normal; }
        }
        @media (min-width: 768px) and (max-width: 1100px) {
          .pm-title { max-width: calc(100% - 250px); font-size: clamp(2.1rem, 3.5vw, 2.6rem); letter-spacing: -.045em; }
          .pm-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .pm-step { padding: 24px; }
          .pm-step:nth-child(3) { border-left: 0; }
          .pm-step:nth-child(n + 3) { border-top: 1px solid rgba(121,157,241, .24); }
        }
        @media (max-width: 1000px) {
          .pm-casino-cards { display: none; }
          .pm-steps { padding-inline: 12px; }
          .pm-step { padding-inline: 16px; }
           .pm-person { right: 0; width: 240px; height: 260px; }
        }
        @media (max-width: 767px) {
          .pm-casino-wheel { top: 65px; right: -95px; width: 350px; opacity: .58; }
          .pm-casino-wheel::after { top: 71%; left: 24%; }
          .pm-casino-cards { display: block; top: 292px; right: 180px; opacity: .52; transform: scale(.56); transform-origin: top right; }
          .pm-sport-ball { top: 12px; right: -20px; width: 96px; opacity: .42; }
          .pm-wrap { width: min(100% - 32px, 1200px); }
           .pm-head { min-height: 180px; padding: 0; margin-bottom: 20px; display: flex; flex-direction: column; justify-content: center; }
          .pm-title { max-width: 64%; font-size: clamp(1.55rem, 6.6vw, 2.3rem); letter-spacing: -.04em; overflow-wrap: break-word; text-shadow: 0 2px 8px #070B1F, 0 0 2px #070B1F; }
           .pm-head-note { max-width: 62%; margin-top: 10px; }
           .pm-person { right: -14px; top: auto; bottom: -20px; transform: none; width: 190px; height: 190px; object-position: center; -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 42%); mask-image: linear-gradient(90deg, transparent 0%, #000 42%); }
          .pm-panel { border-radius: 22px; }
          .pm-panel-top { padding: 23px 23px 0; }
          .pm-panel-count { display: none; }
          .pm-steps { display: block; padding: 12px 23px 23px; }
           .pm-step, .pm-step + .pm-step { display: block; padding: 23px 0; border-left: 0; border-bottom: 1px solid rgba(121,157,241, .24); }
          .pm-step:last-child { border-bottom: 0; padding-bottom: 0; }
            .pm-index { margin: 0 0 12px; }
           .pm-visual { height: 72px; margin-bottom: 13px; }
          .pm-step h3 { font-size: clamp(1.4rem, 5vw, 1.85rem); }
          .pm-detail { margin-top: 7px; }
          .pm-agent-list { margin-top: 15px; }
          .pm-outcomes { margin-top: 14px; }
          .pm-panel-foot { padding: 17px 23px; }
        }
        @media (max-width: 370px) {
          .pm-casino-cards { display: none; }
          .pm-sport-ball { top: 360px; right: 172px; width: 66px; opacity: .4; }
          .pm-person { right: -22px; width: 165px; height: 165px; }
          .pm-head-note { max-width: 60%; }
          .pm-agent-list { grid-template-columns: 1fr 1fr; }
          .pm-agent { padding: 8px; }
          .pm-agent strong { font-size: 11px; }
        }
        @media (prefers-reduced-motion: reduce) {
           .pm-profit-arrow { animation: none; }
        }
        .pm-nav { display: none; }
        @media (max-width: 767px) {
          .pm-steps { display: flex; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scrollbar-width: none; padding: 12px 0 0; touch-action: pan-x pan-y; }
          .pm-steps::-webkit-scrollbar { display: none; }
          .pm-steps:focus-visible { outline-offset: -3px; }
          .pm-step, .pm-step + .pm-step, .pm-step:last-child { flex: 0 0 100%; box-sizing: border-box; scroll-snap-align: start; scroll-snap-stop: always; padding: 14px 23px 8px; border: 0; }
          .pm-nav { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 23px 20px; }
          .pm-nav-btn { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid rgba(121,157,241,.4); border-radius: 50%; background: rgba(245,246,237,.06); color: #F4F1E8; }
          .pm-nav-btn:disabled { opacity: .35; }
          .pm-dots { display: flex; align-items: center; gap: 2px; }
          .pm-dot { position: relative; width: 32px; height: 44px; border: 0; background: none; padding: 0; }
          .pm-dot::before { content: ""; position: absolute; left: 50%; top: 50%; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 999px; background: rgba(121,157,241,.45); transition: transform .25s ease, background-color .25s ease; }
          .pm-dot[data-active="true"]::before { background: #F2B632; transform: scaleX(2.2); }
        }
        @media (prefers-reduced-motion: reduce) { .pm-dot::before { transition: none; } }
      `}</style>
      <div className="pm-wrap">
        <div className="pm-head">
          <div>
            <p className="pm-eyebrow">O modelo da BETTEX</p>
            <h2 id="pm-heading" className="pm-title">Compre, participe.<br /><span>Receba sua parte dos lucros.</span></h2>
          </div>
          <img className="pm-person" src={`${import.meta.env.BASE_URL}model-supporter-drawn-cutout.svg`} width={80} height={80} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        </div>

        <div className="pm-panel">
          <div className="pm-panel-top">
            <p className="pm-panel-label">Como funciona a participação no projeto</p>
          </div>
          <div className="pm-steps" ref={trackRef} onKeyDown={onKey} tabIndex={mobile ? 0 : undefined} role="group" aria-label="Como funciona a participação no projeto" data-testid="slider-etapas">
            <div className="pm-step">
              <span className="pm-index">01 / COMPRA</span>
              <div className="pm-visual" aria-hidden="true"><TokenIllustration /></div>
              <h3>Compre{' '}<em>BETTEX.</em></h3>
              <p className="pm-detail">Compre BETTEX pelo aplicativo e acompanhe seus tokens.</p>
            </div>
            <div className="pm-step">
              <span className="pm-index">02 / SALDO BETTEX</span>
              <div className="pm-visual" aria-hidden="true">
                <DepositIllustration />
              </div>
              <h3>O token{' '}<em>é seu.</em></h3>
              <p className="pm-detail">Todo BETTEX na carteira oficial participa automaticamente, sem ativação. Quem entra durante uma rodada espera a próxima. Receber a sua parte não tira seus tokens, mas qualquer saída cancela créditos ainda não pagos.</p>
            </div>
            <div className="pm-step">
              <span className="pm-index">03 / OPERAÇÃO</span>
              <div className="pm-visual"><OrderFlowIllustration /></div>
              <h3 className="pm-agent-title">Nossa IA{' '}<em>opera por padrões.</em></h3>
              <p className="pm-detail">Nossa IA analisa padrões de manipulação do mercado para escolher os ativos e os momentos de compra e venda, respeitando limites de risco.</p>
            </div>
            <div className="pm-step">
              <span className="pm-index">04 / RESULTADO</span>
              <div className="pm-visual pm-profit-visual" aria-hidden="true">
                <span className="pm-profit-coin pm-profit-coin--one">✦</span>
                <span className="pm-profit-coin pm-profit-coin--two">✦</span>
                <span className="pm-profit-coin pm-profit-coin--three">✦</span>
                <ArrowDownRight className="pm-profit-arrow" size={31} strokeWidth={2.2} />
                <span className="pm-profit-wallet"><Wallet size={27} strokeWidth={1.8} /></span>
              </div>
              <h3>Você recebe{' '}<em>sua parte dos lucros.</em></h3>
              <p className="pm-detail">Os resultados são apurados em ciclos diários. Quando houver lucro disponível para distribuição, sua parte é entregue a você em reais. A operação e a contabilidade interna usam cripto, e você não precisa operar cripto.</p>
            </div>
          </div>
          <div className="pm-nav" data-testid="controls-etapas">
            <button type="button" className="pm-nav-btn" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Etapa anterior" data-testid="button-etapa-anterior"><ArrowLeft size={18} aria-hidden="true" /></button>
            <div className="pm-dots">
              {dotLabels.map((label, i) => (
                <button type="button" key={label} className="pm-dot" onClick={() => goTo(i)} aria-label={label} aria-current={active === i ? 'step' : undefined} data-active={active === i} data-testid={`button-etapa-${i + 1}`} />
              ))}
            </div>
            <button type="button" className="pm-nav-btn" onClick={() => goTo(active + 1)} disabled={active === STEP_COUNT - 1} aria-label="Próxima etapa" data-testid="button-proxima-etapa"><ArrowRight size={18} aria-hidden="true" /></button>
          </div>
          <div className="pm-panel-foot">
            <p>Sem lucro elegível não há distribuição, e os resultados não são garantidos.</p>
          </div>
        </div>
      </div>
    </section>
  );
}