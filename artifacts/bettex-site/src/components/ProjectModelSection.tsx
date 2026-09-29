import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Eye, Infinity } from 'lucide-react';

const agents = [
  { name: 'PREDIX', role: 'Previsões', status: 'Em operação', image: 'predix', className: 'predix' },
  { name: 'TRADIX', role: 'Cripto', status: 'Em operação', image: 'tradix', className: 'tradix' },
  { name: 'SPORTIX', role: 'Esportes', status: 'Em desenvolvimento', image: 'sportix', className: 'sportix' },
  { name: 'BETTIX', role: 'Jogos', status: 'Em desenvolvimento', image: 'bettix', className: 'bettix' },
] as const;

export function ProjectModelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="participacao" className="pm-section" data-visible={visible} aria-labelledby="pm-heading" data-testid="section-modelo-projeto">
      <style>{`
        .pm-section {
          --pm-ink: #123a3b;
          --pm-mint: #a4eacb;
          --pm-muted: #526e69;
          position: relative;
          overflow: hidden;
          isolation: isolate;
          scroll-margin-top: 72px;
          color: var(--pm-ink);
          background: #dcefe5;
          padding: clamp(76px, 9vw, 136px) 0 0;
        }
        .pm-section::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 570px;
          z-index: -1;
          background: radial-gradient(circle at 83% 23%, rgba(255, 215, 171, .58), transparent 32%), radial-gradient(circle at 5% 6%, rgba(159, 219, 239, .45), transparent 36%);
          pointer-events: none;
        }
        .pm-wrap { width: min(100% - 40px, 1200px); margin-inline: auto; }
        .pm-intro { display: grid; grid-template-columns: minmax(0, 1fr) minmax(450px, .93fr); align-items: center; gap: clamp(32px, 5vw, 80px); }
        .pm-eyebrow { display: flex; align-items: center; gap: 11px; margin: 0 0 22px; font: 700 10px/1.5 var(--app-font-mono); text-transform: uppercase; letter-spacing: .16em; color: #168367; }
        .pm-eyebrow::before { content: ""; width: 25px; height: 2px; background: currentColor; }
        .pm-title { max-width: 690px; margin: 0; font: 800 clamp(3.1rem, 5.8vw, 6.2rem)/.98 var(--app-font-serif); letter-spacing: -.067em; }
        .pm-title strong { font-weight: inherit; color: #168367; }
        .pm-lead { max-width: 590px; margin: 27px 0 0; font-size: clamp(1.02rem, 1.4vw, 1.17rem); line-height: 1.7; color: #3d615b; }
        .pm-lead strong { color: var(--pm-ink); font-weight: 700; }
        .pm-small-note { display: flex; align-items: flex-start; gap: 10px; max-width: 570px; margin: 23px 0 0; font-size: 12px; line-height: 1.55; color: #53716a; }
        .pm-small-note::before { content: ""; flex: none; width: 7px; height: 7px; margin-top: 6px; border-radius: 50%; background: #db936c; }
        .pm-map { position: relative; min-width: 0; height: 475px; }
        .pm-map::before { content: ""; position: absolute; inset: 9% 5% 6%; border: 1px dashed #83b8a4; border-radius: 50%; transform: rotate(-12deg); }
        .pm-map::after { content: ""; position: absolute; inset: 22% 18% 20%; border: 1px solid #9ac8b6; border-radius: 50%; transform: rotate(18deg); }
        .pm-center { position: absolute; z-index: 3; left: 50%; top: 50%; width: 175px; height: 175px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 8px solid #dcefe5; border-radius: 43px; color: #f7f4e9; background: #123a3b; box-shadow: 0 20px 50px rgba(20, 76, 66, .17); transform: translate(-50%, -50%) rotate(-7deg); }
        .pm-center-mark { position: relative; width: 28px; height: 28px; margin-bottom: 12px; border: 3px solid var(--pm-mint); border-radius: 6px; transform: rotate(45deg); }
        .pm-center-mark::after { content: ""; position: absolute; width: 7px; height: 7px; top: 7px; left: 7px; border-radius: 50%; background: var(--pm-mint); }
        .pm-center b { font: 800 26px/1 var(--app-font-serif); letter-spacing: -.07em; }
        .pm-center b span { color: var(--pm-mint); }
        .pm-center small { margin-top: 6px; font: 700 9px/1.4 var(--app-font-mono); letter-spacing: .05em; color: #a4eacb; text-transform: uppercase; }
        .pm-agent { position: absolute; z-index: 2; display: flex; align-items: center; gap: 8px; width: 188px; height: 83px; padding: 7px 11px 7px 5px; border: 1px solid rgba(18, 58, 59, .1); border-radius: 19px; box-shadow: 0 10px 25px rgba(18, 58, 59, .07); }
        .pm-agent img { width: 68px; height: 68px; flex: none; object-fit: contain; }
        .pm-agent-text { min-width: 0; }
        .pm-agent strong { display: block; font: 800 16px/1.1 var(--app-font-serif); letter-spacing: -.035em; }
        .pm-agent small { display: block; margin-top: 3px; font-size: 10px; color: #415e58; }
        .pm-agent em { display: block; margin-top: 5px; font-size: 9px; font-style: normal; font-weight: 700; color: #14785d; }
        .pm-agent--predix { top: 16px; left: 5%; background: #d9f5e8; transform: rotate(-5deg); }
        .pm-agent--tradix { top: 33px; right: 0; background: #eee0f8; transform: rotate(5deg); }
        .pm-agent--sportix { bottom: 21px; left: 0; background: #dae9ff; transform: rotate(4deg); }
        .pm-agent--bettix { bottom: 12px; right: 4%; background: #ffe8d4; transform: rotate(-5deg); }
        .pm-agent--sportix em, .pm-agent--bettix em { color: #956349; }
        .pm-map-label { position: absolute; left: 50%; bottom: -9px; transform: translateX(-50%); white-space: nowrap; font: 700 10px/1.4 var(--app-font-mono); letter-spacing: .03em; color: #53756a; }
        .pm-model { position: relative; margin-top: clamp(68px, 9vw, 124px); padding: clamp(28px, 5vw, 66px); border-radius: 34px 34px 0 0; background: #123a3b; color: #f7f4e9; }
        .pm-model-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 32px; border-bottom: 1px solid rgba(164, 234, 203, .23); }
        .pm-model-kicker { margin: 0 0 14px; color: #a4eacb; font: 700 10px/1.5 var(--app-font-mono); text-transform: uppercase; letter-spacing: .15em; }
        .pm-model-head h3 { max-width: 730px; margin: 0; font: 800 clamp(2rem, 3.6vw, 3.9rem)/1.05 var(--app-font-serif); letter-spacing: -.055em; }
        .pm-model-head h3 span { color: #a4eacb; }
        .pm-model-head > svg { width: 30px; height: 30px; flex: none; margin-top: 4px; color: #a4eacb; }
        .pm-benefits { display: grid; grid-template-columns: 1.14fr .88fr .88fr; gap: 0; }
        .pm-benefit { position: relative; padding: 36px 28px 12px 0; }
        .pm-benefit + .pm-benefit { border-left: 1px solid rgba(164, 234, 203, .23); padding-left: 30px; }
        .pm-benefit-index { display: block; margin-bottom: 29px; color: #8ac4ae; font: 700 11px/1 var(--app-font-mono); }
        .pm-benefit-icon { display: grid; width: 44px; height: 44px; place-items: center; border: 1px solid rgba(164, 234, 203, .38); border-radius: 14px; color: #a4eacb; }
        .pm-benefit h4 { margin: 20px 0 11px; font: 800 clamp(1.35rem, 2vw, 1.85rem)/1.12 var(--app-font-serif); letter-spacing: -.045em; }
        .pm-benefit p { max-width: 350px; margin: 0; color: #c9ddd2; font-size: 13px; line-height: 1.7; }
        .pm-benefit p strong { color: #f7f4e9; }
        .pm-result { display: flex; align-items: flex-start; gap: 13px; margin-top: 38px; padding: 17px 20px; border: 1px solid rgba(255, 211, 158, .4); border-radius: 17px; background: rgba(255, 211, 158, .09); }
        .pm-result span { flex: none; width: 7px; height: 7px; margin-top: 7px; border-radius: 50%; background: #ffd39e; }
        .pm-result p { margin: 0; color: #f4e4cd; font-size: 12px; line-height: 1.6; }
        .pm-result strong { color: #ffd39e; }
        .pm-bottom { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 23px 0 27px; }
        .pm-bottom p { max-width: 670px; margin: 0; color: #496d63; font-size: 12px; line-height: 1.6; }
        .pm-bottom a { display: inline-flex; align-items: center; gap: 8px; flex: none; color: #12674f; font-size: 12px; font-weight: 700; text-decoration: none; }
        .pm-bottom a:hover { text-decoration: underline; text-underline-offset: 4px; }
        .pm-bottom a svg { transition: transform .2s ease; }
        .pm-bottom a:hover svg { transform: translateX(3px); }
        .pm-section[data-visible="true"] .pm-intro-copy { animation: pm-rise .7s cubic-bezier(.18,.72,.25,1) both; }
        .pm-section[data-visible="true"] .pm-map { animation: pm-rise .8s .12s cubic-bezier(.18,.72,.25,1) both; }
        .pm-section[data-visible="true"] .pm-model { animation: pm-rise .8s .18s cubic-bezier(.18,.72,.25,1) both; }
        @keyframes pm-rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 960px) {
          .pm-intro { grid-template-columns: minmax(0, 1fr) minmax(340px, .9fr); gap: 12px; }
          .pm-map { height: 390px; }
          .pm-agent { width: 151px; height: 72px; gap: 3px; padding: 4px; }
          .pm-agent img { width: 57px; height: 62px; }
          .pm-agent strong { font-size: 14px; }
          .pm-agent small { font-size: 9px; }
          .pm-agent em { font-size: 8px; }
          .pm-center { width: 145px; height: 145px; }
        }
        @media (max-width: 767px) {
          .pm-wrap { width: min(100% - 32px, 1200px); }
          .pm-section { padding-top: 76px; }
          .pm-intro { display: block; }
          .pm-title { font-size: clamp(2.95rem, 11.3vw, 5.2rem); }
          .pm-lead { margin-top: 22px; font-size: 16px; }
          .pm-map { width: min(100%, 470px); height: 390px; margin: 40px auto 0; }
          .pm-model { margin-top: 65px; padding: 29px 22px 30px; border-radius: 27px 27px 0 0; }
          .pm-model-head { padding-bottom: 28px; }
          .pm-model-head > svg { width: 23px; height: 23px; }
          .pm-benefits { display: block; }
          .pm-benefit, .pm-benefit + .pm-benefit { display: grid; grid-template-columns: 45px minmax(0,1fr); column-gap: 17px; padding: 24px 0; border-left: 0; border-bottom: 1px solid rgba(164, 234, 203, .23); }
          .pm-benefit-index { grid-column: 1 / -1; margin-bottom: 15px; }
          .pm-benefit-icon { grid-column: 1; grid-row: 2 / 4; }
          .pm-benefit h4 { margin: 0 0 8px; }
          .pm-benefit p { grid-column: 2; }
          .pm-result { margin-top: 24px; }
          .pm-bottom { align-items: flex-start; flex-direction: column; gap: 14px; }
        }
        @media (max-width: 400px) {
          .pm-map { height: 340px; }
          .pm-center { width: 125px; height: 125px; border-width: 6px; border-radius: 32px; }
          .pm-center b { font-size: 21px; }
          .pm-center-mark { width: 22px; height: 22px; margin-bottom: 8px; }
          .pm-center-mark::after { top: 5px; left: 5px; width: 6px; height: 6px; }
          .pm-agent { width: 132px; height: 66px; }
          .pm-agent img { width: 48px; height: 55px; }
          .pm-agent strong { font-size: 12px; }
          .pm-agent em { font-size: 7px; }
          .pm-map-label { bottom: -15px; font-size: 9px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pm-section[data-visible="true"] .pm-intro-copy,
          .pm-section[data-visible="true"] .pm-map,
          .pm-section[data-visible="true"] .pm-model { animation: none; }
          .pm-bottom a svg { transition: none; }
        }
      `}</style>
      <div className="pm-wrap">
        <div className="pm-intro">
          <div className="pm-intro-copy">
            <p className="pm-eyebrow">O que é a BTEX</p>
            <h2 id="pm-heading" className="pm-title">Em vez de apostar, invista em tecnologia. <strong>Seja dono de uma parte da IA.</strong></h2>
            <p className="pm-lead">
              A BTEX é um projeto de investimento em inteligência artificial que reúne quatro agentes. Ao comprar um token, você adquire <strong>um ativo seu, sem data de vencimento</strong>, que representa sua participação nessa tecnologia e nos resultados que ela efetivamente gerar — não uma aposta em um resultado isolado.
            </p>
            <p className="pm-small-note">PREDIX e TRADIX já operam em mercados de risco com apoio da Allora, uma rede descentralizada de IA. SPORTIX e BETTIX ainda estão em desenvolvimento.</p>
          </div>
          <div className="pm-map" role="img" aria-label="Um ecossistema BETTEX reúne PREDIX e TRADIX em operação e SPORTIX e BETTIX em desenvolvimento">
            <div className="pm-center" aria-hidden="true"><span className="pm-center-mark" /><b>BETTEX<span>.</span></b><small>Um ecossistema</small></div>
            {agents.map((agent) => (
              <div key={agent.name} className={`pm-agent pm-agent--${agent.className}`} aria-hidden="true">
                <img src={`${import.meta.env.BASE_URL}agents/${agent.image}.webp?v=role-art`} alt="" loading="lazy" />
                <span className="pm-agent-text"><strong>{agent.name}</strong><small>{agent.role}</small><em>{agent.status}</em></span>
              </div>
            ))}
            <span className="pm-map-label" aria-hidden="true">4 agentes · 1 projeto</span>
          </div>
        </div>
        <div className="pm-model">
          <div className="pm-model-head">
            <div><p className="pm-model-kicker">Por que comprar um token da BTEX?</p><h3>Um ativo seu. <span>Retorno ligado ao resultado real.</span></h3></div>
            <ArrowUpRight aria-hidden="true" strokeWidth={1.5} />
          </div>
          <div className="pm-benefits">
            <div className="pm-benefit">
              <span className="pm-benefit-index">01 / TITULARIDADE</span>
              <span className="pm-benefit-icon" aria-hidden="true"><Infinity size={22} strokeWidth={1.7} /></span>
              <h4>É seu. Não expira.</h4>
              <p>O token é <strong>um ativo perpétuo</strong>. Enquanto você for titular, sua participação no projeto é sua. Se quiser vendê-lo no futuro, dependerá de haver negociação disponível.</p>
            </div>
            <div className="pm-benefit">
              <span className="pm-benefit-index">02 / RETORNO</span>
              <span className="pm-benefit-icon" aria-hidden="true"><ArrowUpRight size={22} strokeWidth={1.7} /></span>
              <h4>Retorno se houver lucro.</h4>
              <p>Se as operações gerarem lucro, o resultado positivo é <strong>distribuído diariamente aos titulares</strong>. Sem lucro nas operações, não há distribuição.</p>
            </div>
            <div className="pm-benefit">
              <span className="pm-benefit-index">03 / INTELIGÊNCIA</span>
              <span className="pm-benefit-icon" aria-hidden="true"><Eye size={22} strokeWidth={1.7} /></span>
              <h4>Análise, não impulso.</h4>
              <p>Em vez de depender das emoções de uma aposta, você participa de um projeto cujos agentes usam IA para apoiar operações em mercados de risco. <strong>Inteligência não elimina o risco.</strong></p>
            </div>
          </div>
          <div className="pm-result"><span aria-hidden="true" /><p><strong>Retorno não é garantido:</strong> operações em mercados de risco podem gerar perdas, e o token pode perder valor.</p></div>
        </div>
        <div className="pm-bottom">
          <p>Chega de apostar no impulso: conheça as quatro frentes da BTEX e participe do projeto como investidor, sem perder de vista os riscos.</p>
          <a href="#agentes" data-testid="link-conhecer-agentes">Conheça os agentes <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}