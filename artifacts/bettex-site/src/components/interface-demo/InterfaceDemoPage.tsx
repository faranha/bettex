/** @jsxImportSource react */
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useX } from '../demo/ui';
import { Rates } from '../demo/fin';
import { demoView } from '../demo/demo-navigation';
import { DemoWalletsCard } from '../demo/DemoWalletsCard';
import { StakingCorridor } from '../demo/StakingCorridor';
import { DemoEnvironmentBanner } from '../demo/DemoEnvironmentBanner';
import { MockCentralPanel } from './MockCentralPanel';
import { MockProfilePanel } from './MockProfilePanel';
import { MockHistoryPanel } from './MockHistoryPanel';
import { MockTreasuryPanel } from './MockTreasuryPanel';
import { openDemoNotice, visualDashboard } from './runtime';
import '../demo/demo.css';

export function InterfaceDemoPage() {
  const { x } = useX();
  const [path] = useLocation();
  const view = demoView(path) ?? 'home';
  const [d] = useState(visualDashboard);
  return <Rates.Provider value={{ r: d.balances.brlPerUsdc, bu: d.balances.bettexUsdc }}>
    <main className="demo-root min-h-[calc(100dvh-var(--site-header-h))] pb-10" data-testid="interface-demo-page">
      <DemoEnvironmentBanner />
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-3 pt-5 sm:px-5">
        {view === 'account' && <h1 className="sr-only">{x('Perfil', 'Profile', 'Perfil')}</h1>}
        {view === 'home' && <><h1 className="sr-only">{x('Dashboard', 'Dashboard', 'Dashboard')}</h1>
          <DemoWalletsCard d={d} onWallet={openDemoNotice} onExport={openDemoNotice} />
          <StakingCorridor d={d} showAgents />
          <MockCentralPanel compact onAction={openDemoNotice} />
        </>}
        {view === 'central' && <MockCentralPanel onAction={openDemoNotice} />}
        {view === 'wallet' && <MockHistoryPanel key={path} d={d} />}
        {view === 'treasury' && <MockTreasuryPanel d={d} />}
        {view === 'account' && <MockProfilePanel onAction={openDemoNotice} />}
      </div>
    </main>
  </Rates.Provider>;
}
