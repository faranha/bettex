import type { DemoDashboard, DemoTreasuryRound } from '@workspace/api-client-react';
import { MOCK_TREASURY_ADDRESSES } from './mock-addresses';

/** Complete a fresh local seed, never live data. No queries, writes, randomness or timers. */
export function completeDemoData(d: DemoDashboard): DemoDashboard {
  const poolUsdc = 12_000;
  const swap = d.history.find(m => m.kind === 'swap' && m.asset === 'BETTEX');
  if (swap && !d.history.some(m => m.id === 'SAMPLE-SWAP-SELL')) {
    // A completed round trip predates participation: no current-round eligibility is cancelled.
    const at = (minutes: number) => new Date(Date.parse(swap.at) + minutes * 60_000).toISOString();
    d.history.push(
      { ...swap, id: 'SAMPLE-SWAP-SELL', at: at(10), asset: 'USDC', amount: 10, sourceAsset: 'BETTEX', sourceAmount: 250, feeUsdc: 0 },
      { ...swap, id: 'SAMPLE-SWAP-BUY', at: at(20), asset: 'BETTEX', amount: 250, sourceAsset: 'USDC', sourceAmount: 10, feeUsdc: 0 },
      { id: 'SAMPLE-WITHDRAW-PENDING', kind: 'withdraw', asset: 'USDC', amount: 50, feeUsdc: 0, sourceWallet: 'dollar', at: new Date(Date.parse(d.serverNow) - 30 * 60_000).toISOString(), status: 'pending', destination: 'MOCK-PENDING-DESTINATION' },
      { id: 'SAMPLE-WITHDRAW-FAILED', kind: 'withdraw', asset: 'USDC', amount: 75, feeUsdc: 0, sourceWallet: 'dollar', at: new Date(Date.parse(d.serverNow) - 15 * 60_000).toISOString(), status: 'failed', destination: 'MOCK-FAILED-DESTINATION' },
    );
  }
  // Retired service tariffs must not survive as financial examples in the visual demo.
  for (const record of d.history) record.feeUsdc = 0;
  const balances = { USDC: 0, BETTEX: 0 };
  for (const m of d.history) {
    if (m.status !== 'confirmed' || m.kind === 'distribution') continue;
    if (m.kind === 'withdraw' || m.kind === 'send') balances[m.asset] -= m.amount;
    else {
      balances[m.asset] += m.amount;
      if (m.kind === 'swap' && m.sourceAsset && m.sourceAmount != null) balances[m.sourceAsset] -= m.sourceAmount;
    }
  }
  // Dollar and earnings wallets are separate; unsuccessful requests never debit either.
  d.balances.usdc = Math.round(balances.USDC * 1_000_000) / 1_000_000;
  d.balances.bettex = balances.BETTEX;
  d.history.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const rebalance = (r: DemoTreasuryRound) => {
    r.feesCollectedUsdc = 0;
    if (r.feeBreakdown) {
      for (const kind of Object.keys(r.feeBreakdown) as (keyof typeof r.feeBreakdown)[]) r.feeBreakdown[kind] = 0;
    }
    r.poolUsdc = poolUsdc;
    r.workingUsdc = r.assetsUsdc - r.reserveUsdc - poolUsdc;
    r.availableUsdc = r.workingUsdc - r.committedUsdc;
    const allocated = (r.agentAllocations ?? []).reduce((s, a) => s + a.allocatedUsdc, 0);
    r.operationalWalletUsdc = r.workingUsdc - allocated;
  };
  const current = d.treasury.currentRound;
  if (current) rebalance(current);
  for (const r of d.rounds) if (r.treasurySnapshot) rebalance(r.treasurySnapshot);
  d.treasury.swapPool = {
    id: 'MOCK-POOL-BETTEX-USDC', source: 'constant_product_demo',
    contract: { id: 'MOCK-AMM-BETTEX-USDC', name: 'BETTEX / USDC demo', version: 'v1', runtime: 'server_simulation', status: 'active' },
    contractAddress: null,
    reserveUsdc: poolUsdc, reserveBettex: poolUsdc / d.balances.bettexUsdc,
    initialReserveUsdc: 10_000, initialReserveBettex: 360_000,
    spotPriceUsdc: d.balances.bettexUsdc, totalVolumeUsdc: 18_760, swapCount: 124, updatedAt: d.serverNow,
  };
  const burn = d.treasury.burn;
  if (burn && current && !burn.entries.some(e => e.id === `SAMPLE-${current.id}-purchase`)) {
    const at = (minutes: number) => new Date(Date.parse(current.startedAt) + minutes * 60_000).toISOString();
    const purchased = 1_000 / burn.referencePriceUsdc;
    // Opening mock inventory + purchase at the displayed quote − permanently burned tokens.
    burn.entries.unshift(
      { id: `SAMPLE-${current.id}-burn`, kind: 'tokens_burned', at: at(45), roundId: current.id, amountUsdc: 0, tokensBettex: 5_750, source: 'modeled_demo' },
      { id: `SAMPLE-${current.id}-purchase`, kind: 'tokens_purchased', at: at(30), roundId: current.id, amountUsdc: 1_000, tokensBettex: purchased, source: 'modeled_demo' },
    );
    burn.walletUsdc = Math.round((burn.walletUsdc - 1_000) * 100) / 100;
    burn.walletBettex = 12_000 + purchased - 5_750;
    burn.totalBurnedBettex += 5_750;
    burn.address = MOCK_TREASURY_ADDRESSES.buyback;
    burn.updatedAt = d.serverNow;
  }
  if (current && d.orchestratorBudget) {
    d.orchestratorBudget.workingUsdc = current.workingUsdc;
    d.orchestratorBudget.availableUsdc = current.availableUsdc;
    d.orchestratorBudget.perOperationLimitUsdc = current.workingUsdc * d.orchestratorBudget.perOperationPercent / 100;
    d.orchestratorBudget.perAgentLimitUsdc = current.workingUsdc * d.orchestratorBudget.perAgentPercent / 100;
  }
  return d;
}
