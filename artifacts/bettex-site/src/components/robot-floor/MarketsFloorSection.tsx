import { PlatformCoverage } from '@/components/technology/PlatformCoverage';
import { RobotTradingFloor } from './RobotTradingFloor';
import { CommunityCTA } from '@/components/CommunityCTA';
import './MarketsFloorSection.css';

export function MarketsFloorSection() {
  return (
    <section id="mercados" className="markets-floor" aria-labelledby="robot-floor-title">
      <div className="markets-floor__wrap">
        <RobotTradingFloor />
        <PlatformCoverage />
        <CommunityCTA source="mercados" note="Veja de perto o que a IA acompanha." />
      </div>
    </section>
  );
}
