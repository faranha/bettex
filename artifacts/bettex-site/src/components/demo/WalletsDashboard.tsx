/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { AccountPanel } from '@/components/account/account-ui/AccountPanel';
import { ProtectedDemoWallets } from '@/components/account/ProtectedDemoWallets';
import { StakingCorridor } from './StakingCorridor';
import { WalletPage } from './WalletPage';
import { TreasurySlider } from './TreasurySlider';
import { useX } from './ui';
import type { Asset, Kind } from './fin';

export function WalletsDashboard({ d, onWallet }: { d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void }) {
  const { x } = useX();
  return <div className="grid min-w-0 gap-4" data-testid="page-wallets-dashboard">
    <h1 className="sr-only">{x('Carteiras', 'Wallets', 'Carteras')}</h1>
    {d.profile.provider === 'native'
      ? <AccountPanel section="wallets" walletContent={<StakingCorridor d={d} showAgents />} />
      : <><ProtectedDemoWallets key={d.profile.accountId} d={d} onWallet={onWallet} /><StakingCorridor d={d} showAgents /></>}
    <TreasurySlider d={d} />
  </div>;
}

export function AccountHistoryPage({ d }: { d: DemoDashboard }) {
  return d.profile.provider === 'native'
    ? <AccountPanel section="history" renderHistory={panel => <WalletPage d={d} historyPanel={panel} />} />
    : <WalletPage d={d} />;
}
