import type { DemoDashboard, DemoRound, DemoTreasuryRound } from '@workspace/api-client-react';

export type RoundSelection =
  | { kind: 'current'; id: string; snapshot: DemoTreasuryRound }
  | { kind: 'closed'; id: string; round: DemoRound; snapshot: DemoTreasuryRound | undefined }
  | { kind: 'unknown'; id: string }
  | { kind: 'unavailable' };

export function selectTreasuryRound(
  d: Pick<DemoDashboard, 'profile' | 'treasury' | 'rounds'>,
  requestedId: string | null,
): RoundSelection {
  if (d.profile.provider === 'native') return { kind: 'unavailable' };
  const current = d.treasury.currentRound;
  const id = requestedId ?? current?.id ?? d.rounds[0]?.id;
  if (id === undefined) return { kind: 'unavailable' };
  if (current?.id === id) return { kind: 'current', id, snapshot: current };
  const round = d.rounds.find(r => r.id === id);
  return round ? { kind: 'closed', id, round, snapshot: round.treasurySnapshot } : { kind: 'unknown', id };
}

export function roundHistoryQuery(id: string, search = ''): string {
  const params = new URLSearchParams(search);
  params.set('round', id);
  return `?${params.toString()}`;
}

/** Draws belong to the round in which they were scheduled, not a delayed execution. */
export function timestampInRound(at: string, round: { startedAt: string; endsAt: string }): boolean {
  const time = Date.parse(at), start = Date.parse(round.startedAt), end = Date.parse(round.endsAt);
  return Number.isFinite(time) && Number.isFinite(start) && Number.isFinite(end) &&
    start < end && time >= start && time < end;
}
