import type { DemoRound, DemoTreasuryRound } from '@workspace/api-client-react';

export type AllocationWallet = 'operational' | 'reserve' | 'crypto_agent';

export function walletAllocation(snapshot: DemoTreasuryRound | null | undefined, wallet: AllocationWallet): number | null {
  const value = wallet === 'reserve' ? snapshot?.reserveUsdc
    : wallet === 'operational' ? snapshot?.operationalWalletUsdc
    : snapshot?.agentAllocations?.find(a => a.agent === 'crypto')?.allocatedUsdc;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function walletAllocationRows(current: DemoTreasuryRound | undefined, rounds: DemoRound[]) {
  const seen = new Set<string>();
  const rows: { id: string; at: string; current: boolean; snapshot?: DemoTreasuryRound }[] = [];
  if (current) {
    seen.add(current.id);
    rows.push({ id: current.id, at: current.startedAt, current: true, snapshot: current });
  }
  for (const round of rounds) {
    if (seen.has(round.id)) continue;
    seen.add(round.id);
    rows.push({ id: round.id, at: round.endedAt, current: false, snapshot: round.treasurySnapshot });
  }
  return rows;
}
