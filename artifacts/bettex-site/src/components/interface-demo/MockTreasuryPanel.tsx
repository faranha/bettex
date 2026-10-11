/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { brazilDate } from '../history/TreasuryStatement';
import { AssetAllocation } from '../demo/TreasuryOverview';
import { Money } from '../demo/fin';
import { WalletHelp } from '../demo/WalletHelp';
import { TreasuryWallets } from '../demo/TreasuryWallets';
import { TreasurySwapPool } from '../demo/TreasurySwapPool';
import { BurnWalletPanel } from '../demo/BurnWalletPanel';
import { TreasuryCycle } from '../demo/TreasuryCycle';
import { TreasuryDemoProvider } from './TreasuryDemoProvider';
import { TreasuryDemoActivity } from './TreasuryDemoActivity';
import { DemoFold } from './DemoFold';
import { DemoStatementOverview } from './TreasuryDemoStatement';
import { DemoSubmenu, useSection } from './DemoSubmenu';

const IDS = ['summary', 'assets', 'statement', 'buyback', 'round'] as const;

/** Complete Treasury presentation recovered with local illustrative data only. */
export function MockTreasuryPanel({ d, embedded = false }: { d: DemoDashboard; embedded?: boolean }) {
  const { x } = useX();
  const [sec, setSec] = useSection(IDS, embedded ? 'treasurySection' : 'section');
  const r = d.treasury.currentRound;
  const items = [
    { id: 'summary' as const, label: x('Resumo', 'Summary', 'Resumen') },
    { id: 'assets' as const, label: x('Ativos e pool', 'Assets and pool', 'Activos y pool') },
    { id: 'statement' as const, label: x('Extrato', 'Statement', 'Extracto') },
    { id: 'buyback' as const, label: x('Recompra e queima', 'Buyback and burn', 'Recompra y quema') },
    { id: 'round' as const, label: x('Rodada', 'Round', 'Ronda') },
  ];
  return <TreasuryDemoProvider><div className="grid min-w-0 gap-4" data-testid="page-treasury-mock">
    {embedded ? <h2 className="display text-lg font-extrabold">{x('Tesouraria', 'Treasury', 'Tesorería')}</h2> : <h1 className="sr-only">{x('Tesouraria', 'Treasury', 'Tesorería')}</h1>}
    {r ? <>
      <DemoSubmenu items={items} value={sec} onChange={setSec} panelId="treasury-panel" testIdPrefix="tab-treasury" label={x('Área da tesouraria', 'Treasury area', 'Área de la tesorería')} />
      <section data-testid="treasury-overview" id="treasury-panel" role="tabpanel" aria-labelledby={`treasury-panel-tab-${sec}`} className="grid min-w-0 gap-4">
        {sec === 'summary' && <>
          <section className="dcard grid min-w-0 gap-3 p-4 sm:p-5" data-testid="treasury-essentials">
            <h2 className="display text-lg font-extrabold"><WalletHelp id="treasury-essentials" label={x('Visão essencial', 'Essential overview', 'Visión esencial')}>
              <p>{x('Os ativos incluem reserva, capital de trabalho e liquidez do pool; a recompra fica separada. O capital de trabalho se divide em comprometido e disponível. O resultado realizado considera operações encerradas, não uma distribuição garantida. Consulte os detalhes em Composição dos ativos.', 'Assets include reserves, working capital and pool liquidity; buyback stays separate. Working capital splits into committed and available funds. Realized result counts closed operations, not a guaranteed distribution. See Asset allocation for details.', 'Los activos incluyen reserva, capital de trabajo y liquidez del pool; la recompra queda separada. El capital de trabajo se divide en comprometido y disponible. El resultado realizado considera operaciones cerradas, no una distribución garantizada. Consulta Composición de activos para los detalles.')}</p>
            </WalletHelp></h2>
            <div className="grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-4">
              {([
                ['assets', x('Ativos totais', 'Total assets', 'Activos totales'), r.assetsUsdc, false],
                ['free', x('Capital livre', 'Free capital', 'Capital libre'), r.availableUsdc, false],
                ['committed', x('Comprometido', 'Committed', 'Comprometido'), r.committedUsdc, false],
                ['result', x('Resultado realizado', 'Realized result', 'Resultado realizado'), r.realizedNetUsdc, true],
              ] as const).map(([k, label, v, signed]) => <div key={k} data-testid={`treasury-essential-${k}`} className="min-w-0 rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-3">
                <p className="text-xs font-bold text-[#1B2A41]">{label}</p><div className="mt-1 break-words"><Money v={v} a="USDC" signed={signed} /></div></div>)}
            </div>
          </section>
          <TreasuryWallets visualDemo d={d} r={r} layout="vertical" />
        </>}
        {sec === 'assets' && <>
          <DemoFold id="composition" title={x('Composição dos ativos', 'Asset allocation', 'Composición de activos')} hint={x('Reserva, capital operacional e liquidez', 'Reserves, working capital and liquidity', 'Reserva, capital operativo y liquidez')}><AssetAllocation r={r} className="min-w-0" /></DemoFold>
          <DemoFold id="swap" title={x('Pool de troca', 'Swap pool', 'Pool de intercambio')} hint={x('Liquidez e preços', 'Liquidity and prices', 'Liquidez y precios')}><TreasurySwapPool visualDemo d={d} /></DemoFold>
        </>}
        {sec === 'statement' && <DemoFold id="statement" title={x('Extrato da tesouraria', 'Treasury statement', 'Extracto de tesorería')} hint={x('Movimentos e saldos por período', 'Movements and balances by period', 'Movimientos y saldos por período')}><DemoStatementOverview d={d} from={brazilDate(r.startedAt)} /></DemoFold>}
        {sec === 'buyback' && <DemoFold id="burn" title={x('Recompra e queima', 'Buyback and burn', 'Recompra y quema')} hint={x('Carteira de queima e resultado', 'Burn wallet and result', 'Cartera de quema y resultado')}><BurnWalletPanel visualDemo d={d} /></DemoFold>}
        {sec === 'round' && <>
          <DemoFold id="round" title={x('Detalhes da rodada', 'Round details', 'Detalles de la ronda')} hint={x('Ciclo e etapas', 'Cycle and stages', 'Ciclo y etapas')}><TreasuryCycle d={d} /></DemoFold>
          <DemoFold id="activity" title={x('Atividade da rodada atual', 'Current round activity', 'Actividad de la ronda actual')} hint={x('Registros e filtros', 'Records and filters', 'Registros y filtros')}><section data-testid="treasury-current-activity"><TreasuryDemoActivity snapshot={r} endAt={d.serverNow} /></section></DemoFold>
        </>}
      </section></> : <TreasuryCycle d={d} />}
  </div></TreasuryDemoProvider>;
}
