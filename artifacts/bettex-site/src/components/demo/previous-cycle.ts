import type { DemoDashboard } from '@workspace/api-client-react';

type Source = {
  staking: Pick<DemoDashboard['staking'], 'cycleStartedAt'>;
  rounds: Pick<DemoDashboard['rounds'][number], 'id' | 'endedAt' | 'status'>[];
  history: Pick<DemoDashboard['history'][number], 'kind' | 'asset' | 'status' | 'at' | 'amount'>[];
};

export function previousCycle(d: Source) {
  const endedAt = Date.parse(d.staking.cycleStartedAt);
  const round = d.rounds.find(r => Date.parse(r.endedAt) === endedAt);
  if (!round) return null;
  const credits = d.history.filter(h => h.kind === 'distribution' && h.asset === 'USDC'
    && h.status === 'confirmed' && Date.parse(h.at) === endedAt);
  // No recorded credit is not proof of a zero payment when history is partial.
  const received = credits.length ? credits.reduce((sum, h) => sum + h.amount, 0)
    : round.status === 'retained' ? 0 : null;
  return { round, received };
}