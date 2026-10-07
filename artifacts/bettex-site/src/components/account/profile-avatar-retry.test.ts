import test from 'node:test';
import assert from 'node:assert/strict';
import { avatarRetryPlan } from './profile-avatar-retry.ts';

test('failed default avatars retry with a fresh URL instead of keeping the broken image', () => {
  const first = avatarRetryPlan('/app/hydra-transparent.webp', 0, 100);
  const second = avatarRetryPlan('/app/hydra-transparent.webp', 1, 100);
  assert.deepEqual(first, { delayMs: 1000, src: '/app/hydra-transparent.webp?avatar_retry=100-1' });
  assert.equal(second?.delayMs, 3000);
  assert.notEqual(first?.src, second?.src);
  assert.equal(avatarRetryPlan('/app/hydra-transparent.webp', 2, 100), null);
});

test('retries preserve the artifact prefix and existing query parameters', () => {
  assert.equal(avatarRetryPlan('/bettex/app/hydra-transparent.webp', 0, 200)?.src, '/bettex/app/hydra-transparent.webp?avatar_retry=200-1');
  assert.equal(avatarRetryPlan('/app/hydra-transparent.webp?v=1', 0, 200)?.src, '/app/hydra-transparent.webp?v=1&avatar_retry=200-1');
});
