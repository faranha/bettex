/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { brazilDate } from '../history/TreasuryStatement';
import { AssetAllocation } from '../demo/TreasuryOverview';
import { TreasuryWallets } from '../demo/TreasuryWallets';
import { TreasurySwapPool } from '../demo/TreasurySwapPool';
import { BurnWalletPanel } from '../demo/BurnWalletPanel';
import { TreasuryCycle } from '../demo/TreasuryCycle';
import { TreasuryDemoProvider } from './TreasuryDemoProvider';
import { TreasuryDemoActivity } from './TreasuryDemoActivity';
import { DemoStatementOverview } from './TreasuryDemoStatement';

/** Complete Treasury presentation recovered with local illustrative data only. */
export function MockTreasuryPanel({ d }: { d: DemoDashboard }) {
  const { x } = useX();
  const r = d.treasury.currentRound;
  return <TreasuryDemoProvider><div className="grid min-w-0 gap-4" data-testid="page-treasury-mock">
    <header className="grid gap-1"><h1 className="display text-2xl font-extrabold">{x('Tesouraria', 'Treasury', 'Tesorería')}</h1>
      <p className="text-xs text-[#5B6B85]" data-testid="treasury-demo-note">{x('Valores, carteiras e registros de exemplo ilustrativos. Endereços fictícios que não recebem fundos; nenhuma rede blockchain ou operação real.', 'Illustrative sample values, wallets and records. Fictitious addresses that accept no funds; no blockchain network or real operation.', 'Valores, carteras y registros de ejemplo ilustrativos. Direcciones ficticias que no reciben fondos; ninguna red blockchain ni operación real.')}</p></header>
    {r ? <section data-testid="treasury-overview" className="grid min-w-0 gap-4">
      <AssetAllocation r={r} />
      <TreasuryWallets visualDemo d={d} r={r} layout="vertical" />
      <TreasurySwapPool visualDemo d={d} />
      <DemoStatementOverview d={d} from={brazilDate(r.startedAt)} />
      <BurnWalletPanel visualDemo d={d} />
      <TreasuryCycle d={d} />
      <section className="dcard p-4 sm:p-5" data-testid="treasury-current-activity"><h2 className="display mb-2 text-lg font-extrabold">{x('Atividade da rodada atual', 'Current round activity', 'Actividad de la ronda actual')}</h2><TreasuryDemoActivity snapshot={r} endAt={d.serverNow} /></section>
    </section> : <TreasuryCycle d={d} />}
  </div></TreasuryDemoProvider>;
}
