import { PlatformCoverage } from '@/components/technology/PlatformCoverage';
import { RobotTradingFloor } from './RobotTradingFloor';
import { CommunityCTA } from '@/components/CommunityCTA';
import './MarketsFloorSection.css';

export function MarketsFloorSection() {
  return (
    <section id="mercados" className="markets-floor" aria-labelledby="robot-floor-title">
      <div className="markets-floor__hero">
        <div className="markets-floor__wrap markets-floor__hero-grid">
          <div className="markets-floor__hero-copy">
            <p className="robot-floor__eyebrow">Mercados BETTEX</p>
            <h2 id="robot-floor-title" className="robot-floor__title"><span className="mf-line">A IA da BETTEX coordena.</span><em className="mf-line">Os agentes executam.</em></h2>
            <p className="robot-floor__note"><span className="mf-line">A IA analisa e autoriza.</span><span className="mf-line">Os agentes executam dentro dos limites.</span></p>
          </div>
          <div className="markets-floor__hero-art" aria-hidden="true">
            <svg className="mf-rings" viewBox="0 0 400 400" fill="none">
              <circle cx="200" cy="200" r="190" stroke="rgba(95,134,255,.35)" strokeDasharray="2 8" />
              <circle cx="200" cy="200" r="145" stroke="rgba(95,134,255,.5)" />
              <circle cx="200" cy="200" r="100" stroke="rgba(95,134,255,.3)" strokeDasharray="14 10" />
              <path d="M200 10V390M10 200H390" stroke="rgba(95,134,255,.18)" />
            </svg>
            <img className="mf-agent mf-agent--a" src={`${import.meta.env.BASE_URL}agents/sportix-serious.webp`} width={1024} height={1024} alt="" loading="lazy" />
            <img className="mf-agent mf-agent--b" src={`${import.meta.env.BASE_URL}agents/tradix-serious.webp`} width={1024} height={1024} alt="" loading="lazy" />
            <img className="mf-agent mf-agent--c" src={`${import.meta.env.BASE_URL}agents/predix-serious.webp`} width={1024} height={1024} alt="" loading="lazy" />
            <img className="mf-brain" src={`${import.meta.env.BASE_URL}agents/bettex-intelligence-brain.webp`} width={640} height={640} alt="" loading="lazy" />
          </div>
        </div>
      </div>
      <div className="markets-floor__wrap">
        <RobotTradingFloor />
        <PlatformCoverage />
        <CommunityCTA source="mercados" note="Veja de perto o que a IA acompanha." />
      </div>
    </section>
  );
}
