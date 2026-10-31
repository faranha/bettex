import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liveCapital } from './live-capital.ts';

test('only placed and reconciling capital appears in live stake', () => {
  assert.equal(liveCapital([
    { status: 'analyzing', capitalUsdc: 100 },
    { status: 'validated', capitalUsdc: 200 },
    { status: 'open', capitalUsdc: 250 },
    { status: 'reconciling', capitalUsdc: 90 },
    { status: 'closed', capitalUsdc: 500 },
    { status: 'rejected', capitalUsdc: 600 },
  ]), 340);
});
test('live stake drops to zero with no placed positions', () => {
  assert.equal(liveCapital([]), 0);
  assert.equal(liveCapital([{ status: 'closed', capitalUsdc: 250 }]), 0);
});