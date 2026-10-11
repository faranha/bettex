/** @jsxImportSource react */
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useX } from '../demo/ui';
import { Rates } from '../demo/fin';
import { demoView } from '../demo/demo-navigation';
import { DemoWalletsCard } from '../demo/DemoWalletsCard';
import { StakingCorridor } from '../demo/StakingCorridor';
import { DemoEnvironmentBanner } from '../demo/DemoEnvironmentBanner';
import { CentralDemo } from './CentralDemo';
import { MockProfilePanel } from './MockProfilePanel';
import { MockHistoryPanel } from './MockHistoryPanel';
import { TreasuryHomeEntry } from './TreasuryHomeEntry';
import { MockTreasuryPanel } from './MockTreasuryPanel';
import { openDemoNotice, visualDashboard } from './runtime';
import { MOCK_WALLET_ADDRESSES } from './mock-addresses';
import '../demo/demo.css';

export function InterfaceDemoPage() {
  const { x } = useX();
  const [path] = useLocation();
  const view = demoView(path) ?? 'home';
  const [d] = useState(visualDashboard);
  return <Rates.Provider value={{ r: d.balances.brlPerUsdc, bu: d.balances.bettexUsdc }}>
    <main className="demo-root min-h-[calc(100dvh-var(--site-header-h))] pb-10" data-testid="interface-demo-page">
      <DemoEnvironmentBanner />
      <div className={view === 'central' ? 'mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-3 px-2 pt-3 sm:px-4' : 'mx-auto grid max-w-5xl grid-cols-1 gap-4 px-3 pt-5 sm:px-5'}>
        {view === 'account' && <h1 className="sr-only">{x('Perfil', 'Profile', 'Perfil')}</h1>}
        {view === 'home' && <><h1 className="sr-only">{x('Dashboard', 'Dashboard', 'Dashboard')}</h1>
          <DemoWalletsCard d={d} addresses={MOCK_WALLET_ADDRESSES} onWallet={openDemoNotice} onExport={openDemoNotice} />
          <StakingCorridor d={d} showAgents />
          <TreasuryHomeEntry d={d} />
        </>}
        {view === 'central' && <CentralDemo onAction={openDemoNotice} />}
        {view === 'wallet' && <MockHistoryPanel key={path} d={d} />}
        {view === 'treasury' && <MockTreasuryPanel d={d} />}
        {view === 'account' && <MockProfilePanel onAction={openDemoNotice} />}
      </div>
    </main>
  </Rates.Provider>;
}
