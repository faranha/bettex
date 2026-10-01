import { type ReactNode } from 'react';
import { PlatformCoverage } from '@/components/technology/PlatformCoverage';
import { RobotTradingFloor } from './RobotTradingFloor';
import './MarketsFloorSection.css';

export function MarketsFloorSection({ children }: { children: ReactNode }) {
  return (
    <section id="mercados" className="markets-floor" aria-labelledby="robot-floor-title">
      <div className="markets-floor__wrap">
        <RobotTradingFloor />
        <div className="markets-floor__cards-head">
          <p className="markets-floor__eyebrow">Uma IA BETTEX, quatro mercados</p>
          <p className="markets-floor__lead">Cada mercado tem seu método, e todos seguem os limites definidos pela IA da BETTEX.</p>
        </div>
        <div className="markets-floor__cards" aria-label="Quatro mercados da BETTEX">{children}</div>
        <PlatformCoverage />
      </div>
    </section>
  );
}
