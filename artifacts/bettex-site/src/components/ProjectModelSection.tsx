import { ArrowDownRight, ArrowRight, Wallet } from 'lucide-react';
import { TokenIllustration, DepositIllustration, CoordinationIllustration } from '@/components/ProjectModelIllustrations';

const markets = ['Previsões', 'Ações e cripto', 'Esportes', 'Cassinos'] as const;

export function ProjectModelSection() {
  return (
    <section id="participacao" className="pm-section" aria-labelledby="pm-heading" data-testid="section-modelo-projeto">
      <style>{`
        .pm-section {
          --pm-deep: #123a3b;
          --pm-lime: #b6efca;
          --pm-cream: #f9f3e9;
          position: relative;
          overflow: hidden;
          color: var(--pm-deep);
          background: #f7e8d7;
          padding: clamp(72px, 8vw, 112px) 0 clamp(60px, 7vw, 90px);
        }
        .pm-casino-wheel {
          position: absolute; top: -100px; right: max(4vw, 20px);
          width: min(46vw, 570px); aspect-ratio: 1; border-radius: 50%;
          border: 2px solid rgba(145, 66, 49, .22);
          background: repeating-conic-gradient(from -7deg, rgba(151, 67, 48, .17) 0deg 10deg, rgba(18, 58, 59, .13) 10deg 20deg);
          mask-image: radial-gradient(circle, transparent 0 15%, #000 16% 20%, transparent 21% 27%, #000 28% 81%, transparent 82%);
          opacity: .8; pointer-events: none;
        }
        .pm-casino-wheel::after { content: ""; position: absolute; top: 19%; left: calc(50% - 6px); width: 12px; height: 12px; border-radius: 50%; background: #fff3d8; box-shadow: 0 2px 7px rgba(86, 46, 32, .3); }
        .pm-casino-cards { position: absolute; top: 95px; right: 28%; width: 155px; height: 160px; opacity: .42; pointer-events: none; }
        .pm-casino-card {
          position: absolute; display: grid; place-items: center; width: 94px; height: 128px;
          border: 2px solid #9d5b48; border-radius: 11px; background: rgba(255, 248, 234, .7);
          color: #9d4c3c; font: 700 44px/1 Georgia, serif;
        }
        .pm-casino-card:first-child { left: 0; top: 17px; transform: rotate(-17deg); }
        .pm-casino-card:last-child { left: 44px; top: 0; transform: rotate(13deg); }
        .pm-sport-ball {
          position: absolute; top: 125px; right: clamp(16px, 3vw, 64px);
          width: clamp(105px, 11vw, 155px); aspect-ratio: 1; color: #2b6a60;
          opacity: .38; transform: rotate(-17deg); pointer-events: none;
        }
        .pm-sport-ball svg { display: block; width: 100%; height: 100%; }
        .pm-wrap { position: relative; z-index: 1; width: min(100% - 40px, 1200px); margin-inline: auto; }
         .pm-head { position: relative; min-height: 190px; margin-bottom: 32px; }
         .pm-eyebrow { display: flex; align-items: center; gap: 11px; margin: 0 0 18px; color: #a55538; font: 700 10px/1.5 var(--app-font-mono); letter-spacing: .15em; text-transform: uppercase; }
        .pm-eyebrow::before { content: ""; width: 24px; height: 2px; background: currentColor; }
          .pm-title { position: relative; z-index: 1; margin: 0; font: 800 clamp(2.65rem, 4.5vw, 4.7rem)/1.02 var(--app-font-serif); letter-spacing: -.065em; }
         .pm-title span { color: #a55538; }
          .pm-head-note { position: relative; z-index: 1; max-width: 340px; margin: 16px 0 0; color: #75594a; font-size: 13px; line-height: 1.55; }
          .pm-person { position: absolute; z-index: 0; right: 15px; bottom: -42px; width: 330px; height: 330px; object-fit: contain; object-position: center bottom; pointer-events: none; filter: drop-shadow(0 10px 20px rgba(64, 42, 30, .18)); }
          .pm-panel { position: relative; z-index: 1; overflow: hidden; border: 1px solid #2c5b55; border-radius: 28px; background: var(--pm-deep); color: var(--pm-cream); box-shadow: 0 20px 48px rgba(99, 55, 37, .13); }
        .pm-panel-top { display: flex; justify-content: space-between; gap: 16px; padding: 24px 32px 0; }
        .pm-panel-label, .pm-panel-count { margin: 0; color: #aee5c8; font: 700 10px/1.5 var(--app-font-mono); letter-spacing: .12em; text-transform: uppercase; }
        .pm-panel-count { color: #8ab9a9; letter-spacing: .06em; white-space: nowrap; }
         .pm-steps { display: grid; grid-template-columns: .92fr .92fr 1.48fr 1.42fr; padding: 27px 18px 32px; }
        .pm-step { position: relative; min-width: 0; padding: 9px 25px 10px 24px; }
        .pm-step + .pm-step { border-left: 1px solid rgba(174, 229, 200, .24); }
         .pm-index { display: block; margin-bottom: 12px; color: #aee5c8; font: 700 11px/1 var(--app-font-mono); }
        .pm-step h3 { margin: 0; font: 800 clamp(1.35rem, 2.15vw, 2rem)/1.12 var(--app-font-serif); letter-spacing: -.045em; }
        .pm-step h3 em { color: var(--pm-lime); font-style: normal; }
        .pm-detail { margin: 12px 0 0; color: #b9d3c9; font-size: 12px; line-height: 1.55; }
         .pm-visual { display: flex; align-items: center; height: 84px; margin-bottom: 15px; }
         .pm-profit-visual { position: relative; width: 205px; }
         .pm-profit-coin { position: absolute; display: grid; width: 39px; height: 39px; place-items: center; border: 2px solid #ffe0ad; border-radius: 50%; background: linear-gradient(135deg, #ffe8c4, #e7a974); box-shadow: inset 0 0 0 4px rgba(255, 245, 224, .65), 0 5px 0 #a56a4d; color: #8c543c; font: 800 20px/1 var(--app-font-serif); }
         .pm-profit-coin--one { left: 0; top: 32px; }
         .pm-profit-coin--two { left: 22px; top: 15px; }
         .pm-profit-coin--three { left: 44px; top: 34px; }
         .pm-profit-arrow { position: absolute; left: 88px; top: 25px; color: #f3c9a6; animation: pm-go 1.8s ease-in-out infinite; }
         .pm-profit-wallet { position: absolute; top: 23px; left: 131px; display: grid; width: 56px; height: 44px; place-items: center; border: 1px solid #a2dcc1; border-radius: 9px; background: #22605b; color: #b6efca; box-shadow: 0 7px 0 #0b2c31; }
         @keyframes pm-go { 50% { transform: translateX(5px); } }
        .pm-agent-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; margin-top: 19px; }
        .pm-agent { display: flex; flex-direction: column; gap: 2px; min-width: 0; padding: 9px 10px; border: 1px solid rgba(174, 229, 200, .19); border-radius: 9px; background: rgba(245, 246, 237, .055); }
        .pm-agent strong { color: #eaf7ed; font: 800 12px/1.1 var(--app-font-serif); letter-spacing: -.02em; }
        .pm-agent span { color: #aecdc1; font-size: 11px; }
        .pm-outcomes { display: grid; gap: 8px; margin-top: 18px; }
        .pm-outcome { padding: 12px 13px; border-radius: 10px; }
         .pm-outcome--profit { background: #f3c9a6; color: #54362b; }
        .pm-outcome--none { border: 1px solid #cb7161; background: linear-gradient(135deg, #aa4037, #91342e); color: #fff5ef; box-shadow: inset 0 1px 0 rgba(255, 226, 207, .2), 0 7px 16px rgba(3, 29, 32, .16); }
        .pm-outcome--none span { color: #ffe1d0; }
        .pm-outcome span { display: block; margin-bottom: 3px; font: 700 10px/1.3 var(--app-font-mono); letter-spacing: .04em; text-transform: uppercase; }
        .pm-outcome strong { display: block; font-size: 12px; line-height: 1.4; }
        .pm-panel-foot { display: flex; align-items: center; gap: 11px; padding: 15px 32px; border-top: 1px solid rgba(174, 229, 200, .18); background: rgba(8, 37, 39, .22); }
        .pm-risk-mark { flex: none; width: 7px; height: 7px; border-radius: 50%; background: #e9b386; }
        .pm-panel-foot p { margin: 0; color: #c8d9cc; font-size: 12px; line-height: 1.5; }
        .pm-panel-foot strong { color: #f7e3cb; }
        .pm-bottom { display: flex; justify-content: flex-end; padding-top: 19px; }
         .pm-bottom a { display: inline-flex; align-items: center; gap: 9px; border-bottom: 1px solid currentColor; padding: 3px 0 5px; color: #8d4932; font-size: 13px; font-weight: 700; text-decoration: none; }
         .pm-bottom a:hover { color: #613221; }
        .pm-bottom a svg { transition: transform .2s ease; }
        .pm-bottom a:hover svg { transform: translateX(3px); }
        @media (min-width: 768px) and (max-width: 1100px) {
          .pm-title { max-width: calc(100% - 250px); font-size: clamp(2.1rem, 3.5vw, 2.6rem); letter-spacing: -.045em; }
        }
        @media (max-width: 1000px) {
          .pm-casino-cards { display: none; }
          .pm-steps { grid-template-columns: .86fr .86fr 1.4fr 1.35fr; padding-inline: 8px; }
          .pm-step { padding-inline: 16px; }
           .pm-person { right: 0; width: 240px; height: 260px; }
        }
        @media (max-width: 767px) {
          .pm-casino-wheel { top: 65px; right: -95px; width: 350px; opacity: .58; }
          .pm-casino-wheel::after { top: 71%; left: 24%; }
          .pm-casino-cards { display: block; top: 292px; right: 180px; opacity: .52; transform: scale(.56); transform-origin: top right; }
          .pm-sport-ball { top: 12px; right: -20px; width: 96px; opacity: .42; }
          .pm-wrap { width: min(100% - 32px, 1200px); }
           .pm-head { min-height: 0; padding-bottom: 190px; margin-bottom: 25px; }
          .pm-title { font-size: clamp(2rem, 8.35vw, 3rem); letter-spacing: -.04em; }
           .pm-head-note { max-width: 190px; margin-top: 13px; }
           .pm-person { right: -5px; bottom: -26px; width: 200px; height: 205px; }
          .pm-panel { border-radius: 22px; }
          .pm-panel-top { padding: 23px 23px 0; }
          .pm-panel-count { display: none; }
          .pm-steps { display: block; padding: 12px 23px 23px; }
           .pm-step, .pm-step + .pm-step { display: block; padding: 23px 0; border-left: 0; border-bottom: 1px solid rgba(174, 229, 200, .24); }
          .pm-step:last-child { border-bottom: 0; padding-bottom: 0; }
            .pm-index { margin: 0 0 12px; }
           .pm-visual { height: 72px; margin-bottom: 13px; }
          .pm-step h3 { font-size: clamp(1.4rem, 5vw, 1.85rem); }
          .pm-detail { margin-top: 7px; }
          .pm-agent-list { margin-top: 15px; }
          .pm-outcomes { margin-top: 14px; }
          .pm-panel-foot { align-items: flex-start; padding: 17px 23px; }
          .pm-risk-mark { margin-top: 5px; }
        }
        @media (max-width: 370px) {
          .pm-casino-cards { display: none; }
          .pm-sport-ball { top: 360px; right: 172px; width: 66px; opacity: .4; }
          .pm-person { right: -25px; width: 170px; height: 180px; }
          .pm-head-note { max-width: 145px; }
          .pm-agent-list { grid-template-columns: 1fr 1fr; }
          .pm-agent { padding: 8px; }
          .pm-agent strong { font-size: 11px; }
        }
        @media (prefers-reduced-motion: reduce) {
           .pm-bottom a svg { transition: none; }
           .pm-profit-arrow { animation: none; }
        }
      `}</style>
      <div className="pm-casino-wheel" aria-hidden="true" />
      <div className="pm-casino-cards" aria-hidden="true"><span className="pm-casino-card">♠</span><span className="pm-casino-card">♦</span></div>
      <div className="pm-sport-ball" aria-hidden="true">
        <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="60" cy="60" r="54" />
          <path d="M60 34 79 48 72 70 48 70 41 48Z" fill="currentColor" fillOpacity=".12" />
          <path d="M60 34V7 M79 48l26-9 M72 70l16 29 M48 70 32 99 M41 48l-26-9 M15 39l13-22 M60 7 28 17 M60 7l32 10 M105 39 92 17 M32 99l28 14 28-14" />
        </svg>
      </div>
      <div className="pm-wrap">
        <div className="pm-head">
          <div>
            <p className="pm-eyebrow">O modelo da BETTEX</p>
            <h2 id="pm-heading" className="pm-title">Compre. Seu saldo participa.<br /><span>Renda passiva com apostas?</span></h2>
          </div>
          <p className="pm-head-note">Um agente, diferentes mercados.</p>
          <img className="pm-person" src={`${import.meta.env.BASE_URL}model-supporter-celebrating.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        </div>

        <div className="pm-panel">
          <div className="pm-panel-top">
            <p className="pm-panel-label">Como funciona a participação no projeto</p>
            <p className="pm-panel-count">Quatro etapas · um projeto</p>
          </div>
          <div className="pm-steps">
            <div className="pm-step">
              <span className="pm-index">01 / COMPRA</span>
              <div className="pm-visual" aria-hidden="true"><TokenIllustration /></div>
              <h3>Compra concluída: <em>BETTEX na carteira.</em></h3>
              <p className="pm-detail">A Carteira em reais reúne depósitos via Pix, compras e créditos de lucro.</p>
            </div>
            <div className="pm-step">
              <span className="pm-index">02 / SALDO BETTEX</span>
              <div className="pm-visual" aria-hidden="true">
                <DepositIllustration />
              </div>
              <h3>O saldo participa <em>automaticamente.</em></h3>
              <p className="pm-detail">Ao concluir a compra, seus tokens entram na Carteira BETTEX com participação automática. Você acompanha o saldo e os lucros pelo aplicativo.</p>
            </div>
            <div className="pm-step">
              <span className="pm-index">03 / ANÁLISE E OPERAÇÕES</span>
              <div className="pm-visual" aria-hidden="true">
                <CoordinationIllustration />
              </div>
              <h3>Uma IA analisa <em>e opera em vários mercados.</em></h3>
              <p className="pm-detail">Uma única IA cruza análises de diferentes mercados antes de cada operação, segundo critérios e limites de risco.</p>
              <div className="pm-agent-list" aria-label="Mercados em que a BETTEX opera">
                {markets.map((market) => (
                  <div className="pm-agent" key={market}>
                    <strong>{market}</strong>
                  </div>
                ))}
              </div>
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
              <h3>Quando houver lucro, crédito <em>em reais.</em></h3>
              <div className="pm-outcomes">
                <div className="pm-outcome pm-outcome--profit"><span>Participação no lucro</span><strong>25% do lucro líquido do projeto é distribuído entre os titulares, proporcionalmente à quantidade e ao tempo de BETTEX em carteira.</strong></div>
                <div className="pm-outcome pm-outcome--none"><span>Sem lucro</span><strong>Sem lucro, não há distribuição. O crédito é feito em reais sem venda de BETTEX.</strong></div>
              </div>
            </div>
          </div>
          <div className="pm-panel-foot">
            <span className="pm-risk-mark" aria-hidden="true" />
            <p><strong>Risco:</strong> não há garantia de lucro; operações podem gerar perdas e o token pode perder valor. Esta descrição é conceitual.</p>
          </div>
        </div>
        <div className="pm-bottom">
          <a href="#mercados" data-testid="link-conhecer-mercados">Conheça os mercados <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}