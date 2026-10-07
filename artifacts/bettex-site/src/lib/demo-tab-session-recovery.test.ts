import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoTabToken } from './demo-tab-session.ts';

test('temporary iframe storage and lock failures do not poison the saved demo session', async t => {
  const descriptors = ['sessionStorage', 'navigator'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  t.after(() => {
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  });
  const saved = 'a'.repeat(64);
  const storageError = new DOMException('Storage temporarily unavailable', 'SecurityError');
  const lockError = new DOMException('Locks temporarily unavailable', 'SecurityError');
  let reads = 0, claims = 0;
  const writes: string[] = [];
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
    getItem: () => { if (++reads === 1) throw storageError; return saved; },
    setItem: (_key: string, token: string) => { writes.push(token); },
  } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { locks: {
    request: (_name: string, _options: unknown, callback: (lock: object) => Promise<void>) => {
      if (++claims === 1) return Promise.reject(lockError);
      void callback({});
      return Promise.resolve();
    },
  } } });
  await assert.rejects(demoTabToken(), error => error === storageError);
  await assert.rejects(demoTabToken(), error => error === lockError);
  assert.equal(await demoTabToken(), saved);
  assert.equal(await demoTabToken(), saved);
  assert.deepEqual(writes, [saved]);
  assert.equal(claims, 2);
});
