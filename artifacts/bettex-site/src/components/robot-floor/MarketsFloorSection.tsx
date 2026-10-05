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
            <h2 id="robot-floor-title" className="robot-floor__title">A IA da BETTEX coordena.<br /><em>Os robôs executam.</em></h2>
            <p className="robot-floor__note">Nenhuma equipe age sozinha. Cada pedido passa pela IA da BETTEX, nossa IA central. Ela analisa as oportunidades e autoriza os robôs a executar.</p>
          </div>
          <div className="markets-floor__hero-art" aria-hidden="true">
            <img src={`${import.meta.env.BASE_URL}agents/bettex-intelligence-brain.webp`} alt="" loading="lazy" />
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
