import type { DemoDashboard, DemoTreasuryRound } from '@workspace/api-client-react';
import { MOCK_TREASURY_ADDRESSES } from './mock-addresses';

/** Complete a fresh local seed, never live data. No queries, writes, randomness or timers. */
export function completeDemoData(d: DemoDashboard): DemoDashboard {
  const poolUsdc = 12_000;
  const rebalance = (r: DemoTreasuryRound) => {
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
  if (burn && current) {
    const at = (minutes: number) => new Date(Date.parse(current.startedAt) + minutes * 60_000).toISOString();
    // Mock opening inventory (12,000) + purchase (12,500) − burn (5,750) = 18,750.
    burn.entries.unshift(
      { id: `SAMPLE-${current.id}-burn`, kind: 'tokens_burned', at: at(45), roundId: current.id, amountUsdc: 0, tokensBettex: 5_750, source: 'modeled_demo' },
      { id: `SAMPLE-${current.id}-purchase`, kind: 'tokens_purchased', at: at(30), roundId: current.id, amountUsdc: 1_000, tokensBettex: 12_500, source: 'modeled_demo' },
    );
    burn.walletUsdc = Math.round((burn.walletUsdc - 1_000) * 100) / 100;
    burn.walletBettex = 18_750;
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
