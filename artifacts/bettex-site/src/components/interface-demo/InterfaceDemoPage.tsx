/** @jsxImportSource react */
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useX } from '../demo/ui';
import { Rates } from '../demo/fin';
import { demoView } from '../demo/demo-navigation';
import { DemoWalletsCard } from '../demo/DemoWalletsCard';
import { StakingCorridor } from '../demo/StakingCorridor';
import { CentralDemo } from './CentralDemo';
import { MockProfilePanel } from './MockProfilePanel';
import { MockHistoryPanel } from './MockHistoryPanel';
import { TreasuryHomeEntry } from './TreasuryHomeEntry';
import { MockTreasuryPanel } from './MockTreasuryPanel';
import { openDemoNotice, visualDashboard } from './runtime';
import { MOCK_WALLET_ADDRESSES } from './mock-addresses';
import { DemoSubmenu, useSection } from './DemoSubmenu';
import '../demo/demo.css';

function HomeAreas({ d }: { d: ReturnType<typeof visualDashboard> }) {
  const { x } = useX();
  const [sec, setSec] = useSection(['wallets', 'participation'] as const);
  const items = [{ id: 'wallets' as const, label: x('Carteiras', 'Wallets', 'Carteras') }, { id: 'participation' as const, label: x('Participação', 'Participation', 'Participación') }];
  return <>
    <DemoSubmenu items={items} value={sec} onChange={setSec} panelId="home-panel" testIdPrefix="tab-home" label={x('Área do painel', 'Dashboard area', 'Área del panel')} />
    <div id="home-panel" role="tabpanel" aria-labelledby={`home-panel-tab-${sec}`} className="grid min-w-0 gap-4">
      {sec === 'wallets' && <DemoWalletsCard d={d} addresses={MOCK_WALLET_ADDRESSES} onWallet={openDemoNotice} onExport={openDemoNotice} />}
      {sec === 'participation' && <><StakingCorridor d={d} showAgents /><TreasuryHomeEntry d={d} /></>}
    </div>
  </>;
}

export function InterfaceDemoPage() {
  const { x } = useX();
  const [path] = useLocation();
  const view = demoView(path) ?? 'home';
  const [d] = useState(visualDashboard);
  return <Rates.Provider value={{ r: d.balances.brlPerUsdc, bu: d.balances.bettexUsdc }}>
    <main className="demo-root min-h-[calc(100dvh-var(--site-header-h))] pb-10" data-testid="interface-demo-page">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-3 pt-5 sm:px-5">
        {view === 'account' && <h1 className="sr-only">{x('Perfil', 'Profile', 'Perfil')}</h1>}
        {view === 'home' && <><h1 className="sr-only">{x('Dashboard', 'Dashboard', 'Dashboard')}</h1>
          <HomeAreas d={d} />
        </>}
        {view === 'central' && <CentralDemo onAction={openDemoNotice} />}
        {view === 'wallet' && <MockHistoryPanel key={path} d={d} />}
        {view === 'treasury' && <MockTreasuryPanel d={d} />}
        {view === 'account' && <MockProfilePanel onAction={openDemoNotice} />}
      </div>
    </main>
  </Rates.Provider>;
}
