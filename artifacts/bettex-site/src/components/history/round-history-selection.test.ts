import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectTreasuryRound, roundHistoryQuery, timestampInRound } from './round-history-selection.ts';

type Input = Parameters<typeof selectTreasuryRound>[0];
function fixture(): Input {
  return {
    profile: { provider: 'demo' } as Input['profile'],
    treasury: { currentRound: { id: '2026-10-06', assetsUsdc: 1234 } } as Input['treasury'],
    rounds: [
      { id: '2026-10-05', treasurySnapshot: { id: '2026-10-05', assetsUsdc: 241295 } },
      { id: '2026-10-04' },
    ] as Input['rounds'],
  };
}

test('round links select immutable archived facts rather than current treasury values', () => {
  const d = fixture(), before = JSON.stringify(d);
  const selected = selectTreasuryRound(d, '2026-10-05');
  assert.equal(selected.kind, 'closed');
  if (selected.kind !== 'closed') return;
  assert.equal(selected.round, d.rounds[0]);
  assert.equal(selected.snapshot, d.rounds[0].treasurySnapshot);
  assert.equal(selected.snapshot?.assetsUsdc, 241295);
  assert.equal(JSON.stringify(d), before);
});

test('absent past snapshot remains absent, never replaced with the current snapshot', () => {
  const selected = selectTreasuryRound(fixture(), '2026-10-04');
  assert.equal(selected.kind, 'closed');
  if (selected.kind === 'closed') assert.equal(selected.snapshot, undefined);
});

test('default selection is current, falling back to a recorded closed round only when current is absent', () => {
  const d = fixture();
  assert.equal(selectTreasuryRound(d, null).kind, 'current');
  delete d.treasury.currentRound;
  assert.equal(selectTreasuryRound(d, null).kind, 'closed');
  d.rounds = [];
  assert.deepEqual(selectTreasuryRound(d, null), { kind: 'unavailable' });
});

test('unknown and empty explicit round IDs do not silently open a different round', () => {
  for (const id of ['unknown', '', '2026-12-31']) {
    assert.deepEqual(selectTreasuryRound(fixture(), id), { kind: 'unknown', id });
  }
});

test('native accounts never consume simulated round history', () => {
  const d = fixture();
  d.profile.provider = 'native';
  assert.deepEqual(selectTreasuryRound(d, null), { kind: 'unavailable' });
  assert.deepEqual(selectTreasuryRound(d, '2026-10-05'), { kind: 'unavailable' });
});

test('round navigation encodes IDs, replaces the old selection and keeps wallet filters', () => {
  const query = new URLSearchParams(roundHistoryQuery('ROUND & #1', '?wallet=earnings&type=deposit&round=old'));
  assert.equal(query.get('round'), 'ROUND & #1');
  assert.equal(query.getAll('round').length, 1);
  assert.equal(query.get('wallet'), 'earnings');
  assert.equal(query.get('type'), 'deposit');
});

test('scheduled lottery draws use the exact São Paulo round window, start-inclusive/end-exclusive', () => {
  const round = { startedAt: '2026-10-05T16:00:00-03:00', endsAt: '2026-10-06T16:00:00-03:00' };
  assert.equal(timestampInRound('2026-10-05T18:59:59.999Z', round), false);
  assert.equal(timestampInRound('2026-10-05T19:00:00.000Z', round), true);
  assert.equal(timestampInRound('2026-10-06T07:00:00.000Z', round), true);
  assert.equal(timestampInRound('2026-10-06T18:59:59.999Z', round), true);
  assert.equal(timestampInRound('2026-10-06T19:00:00.000Z', round), false);
  assert.equal(timestampInRound('invalid', round), false);
  assert.equal(timestampInRound(round.startedAt, { ...round, endsAt: round.startedAt }), false);
});
