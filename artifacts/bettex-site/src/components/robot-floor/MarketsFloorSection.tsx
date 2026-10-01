import { PlatformCoverage } from '@/components/technology/PlatformCoverage';
import { RobotTradingFloor } from './RobotTradingFloor';
import './MarketsFloorSection.css';

export function MarketsFloorSection() {
  return (
    <section id="mercados" className="markets-floor" aria-labelledby="robot-floor-title">
      <div className="markets-floor__wrap">
        <RobotTradingFloor />
        <PlatformCoverage />
      </div>
    </section>
  );
}
