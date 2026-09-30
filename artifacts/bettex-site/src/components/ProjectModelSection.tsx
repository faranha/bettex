import { ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, Wallet } from 'lucide-react';
import { BettexMark } from '@/components/BettexMark';

const agents = [
  { name: 'PREDIX', specialty: 'Previsões' },
  { name: 'TRADEX', specialty: 'Ações e cripto' },
  { name: 'SPORTIX', specialty: 'Esportes' },
  { name: 'BETTIX', specialty: 'Cassinos' },
] as const;

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
         .pm-token-symbol { display: grid; width: 67px; height: 67px; place-items: center; border-radius: 50%; filter: drop-shadow(0 8px 10px rgba(0, 0, 0, .22)); }
         .pm-token-symbol img { display: block; width: 100%; height: 100%; }
         .pm-stake { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 112px; }
         .pm-stake-coin { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 50%; filter: drop-shadow(0 3px 4px rgba(0, 0, 0, .24)); }
         .pm-stake-coin img { display: block; width: 100%; height: 100%; }
         .pm-stake-arrow { height: 17px; color: #b6efca; animation: pm-drop 1.8s ease-in-out infinite; }
         .pm-stake-vault { display: grid; width: 96px; height: 23px; place-items: center; border: 1px solid #a2dcc1; border-top: 3px solid #b6efca; border-radius: 4px 4px 9px 9px; background: linear-gradient(#2d7169, #184f50); box-shadow: 0 7px 0 #0b2c31; color: #d9f4e2; font: 700 8px/1 var(--app-font-mono); letter-spacing: .09em; }
         .pm-flow { display: flex; align-items: center; gap: 8px; }
         .pm-flow-node { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; width: 70px; height: 65px; border: 1px solid rgba(182, 239, 202, .5); border-radius: 12px; background: #215452; box-shadow: 0 8px 0 rgba(3, 29, 32, .35); color: #eaf7ed; text-align: center; }
         .pm-flow-node b { font: 800 25px/1 var(--app-font-serif); }
         .pm-flow-node img { display: block; width: 27px; height: 27px; flex: none; border-radius: 50%; object-fit: contain; }
         .pm-flow-node small { display: block; width: 100%; font: 700 8px/1 var(--app-font-mono); letter-spacing: .03em; text-align: center; white-space: nowrap; }
         .pm-flow-node--market { border-color: rgba(243, 201, 166, .6); background: #53433c; }
         .pm-flow-node--market b { font-size: 22px; }
         .pm-flow-arrows { display: grid; gap: 1px; width: 60px; color: #b6efca; }
         .pm-flow-arrows svg { width: 58px; height: 21px; }
         .pm-flow-out { animation: pm-go 1.8s ease-in-out infinite; }
         .pm-flow-back { color: #f3c9a6; animation: pm-return 1.8s ease-in-out infinite; }
         .pm-profit-visual { position: relative; width: 205px; }
         .pm-profit-coin { position: absolute; display: grid; width: 39px; height: 39px; place-items: center; border: 2px solid #ffe0ad; border-radius: 50%; background: linear-gradient(135deg, #ffe8c4, #e7a974); box-shadow: inset 0 0 0 4px rgba(255, 245, 224, .65), 0 5px 0 #a56a4d; color: #8c543c; font: 800 20px/1 var(--app-font-serif); }
         .pm-profit-coin--one { left: 0; top: 32px; }
         .pm-profit-coin--two { left: 22px; top: 15px; }
         .pm-profit-coin--three { left: 44px; top: 34px; }
         .pm-profit-arrow { position: absolute; left: 88px; top: 25px; color: #f3c9a6; animation: pm-go 1.8s ease-in-out infinite; }
         .pm-profit-wallet { position: absolute; top: 23px; left: 131px; display: grid; width: 56px; height: 44px; place-items: center; border: 1px solid #a2dcc1; border-radius: 9px; background: #22605b; color: #b6efca; box-shadow: 0 7px 0 #0b2c31; }
         @keyframes pm-drop { 50% { transform: translateY(4px); } }
         @keyframes pm-go { 50% { transform: translateX(5px); } }
         @keyframes pm-return { 50% { transform: translateX(-5px); } }
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
           .pm-token-symbol { width: 58px; height: 58px; font-size: 31px; }
           .pm-stake { transform: scale(.9); transform-origin: left center; }
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
           .pm-stake-arrow, .pm-flow-out, .pm-flow-back, .pm-profit-arrow { animation: none; }
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
            <h2 id="pm-heading" className="pm-title">Compre. Ative. Receba.<br /><span>Investir é a melhor aposta.</span></h2>
          </div>
          <p className="pm-head-note">Todos os agentes em um só lugar.</p>
          <img className="pm-person" src={`${import.meta.env.BASE_URL}model-supporter-celebrating.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        </div>

        <div className="pm-panel">
          <div className="pm-panel-top">
                 <p className="pm-panel-label">Participação por BETTEX depositados · resultados sem garantia</p>
            <p className="pm-panel-count">Quatro etapas · um projeto</p>
          </div>
          <div className="pm-steps">
            <div className="pm-step">
              <span className="pm-index">01 / TOKEN</span>
              <div className="pm-visual" aria-hidden="true"><span className="pm-token-symbol"><BettexMark /></span></div>
               <h3>Conheça o <em>token BETTEX.</em></h3>
                <p className="pm-detail">A Documentação técnica explica a emissão. Esta página não vende tokens.</p>
            </div>
            <div className="pm-step">
              <span className="pm-index">02 / CARTEIRA</span>
              <div className="pm-visual" aria-hidden="true">
                <div className="pm-stake"><span className="pm-stake-coin"><BettexMark /></span><ArrowDown className="pm-stake-arrow" size={16} /><span className="pm-stake-vault">CARTEIRA</span></div>
              </div>
                <h3>Deposite o token <em>para participar.</em></h3>
                <p className="pm-detail">O depósito confirmado ativa a participação. O saque encerra a elegibilidade; ter tokens sem depositá-los não gera distribuição.</p>
            </div>
            <div className="pm-step">
              <span className="pm-index">03 / OPERAÇÕES</span>
              <div className="pm-visual" aria-hidden="true">
                <div className="pm-flow">
                  <span className="pm-flow-node"><BettexMark /><small>BETTEX</small></span>
                  <span className="pm-flow-arrows"><ArrowRight className="pm-flow-out" strokeWidth={2.3} /><ArrowLeft className="pm-flow-back" strokeWidth={2.3} /></span>
                  <span className="pm-flow-node pm-flow-node--market"><b>↗</b><small>MERCADOS</small></span>
                </div>
              </div>
               <h3>A IA da <em>BETTEX</em> propõe estratégias com quatro agentes.</h3>
              <div className="pm-agent-list" aria-label="Especialidades dos agentes BETTEX">
                {agents.map((agent) => (
                  <div className="pm-agent" key={agent.name}>
                    <strong>{agent.name}</strong><span>{agent.specialty}</span>
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
               <h3>Resultados e repasses <em>são diferentes.</em></h3>
              <div className="pm-outcomes">
                   <div className="pm-outcome pm-outcome--profit"><span>Resultado positivo</span><strong>Só lucro líquido realizado após perdas anteriores pode gerar distribuição em USDC para quem depositou BETTEX.</strong></div>
                   <div className="pm-outcome pm-outcome--none"><span>Resultado negativo</span><strong>Não há distribuição garantida. Perdas podem reduzir a tesouraria e o valor do token.</strong></div>
              </div>
            </div>
          </div>
          <div className="pm-panel-foot">
            <span className="pm-risk-mark" aria-hidden="true" />
            <p><strong>Risco:</strong> lucro não é garantido; operações podem gerar perdas e o token pode perder valor.</p>
          </div>
        </div>
        <div className="pm-bottom">
          <a href="#agentes" data-testid="link-conhecer-agentes">Conheça os quatro agentes <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}