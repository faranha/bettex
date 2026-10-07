import { test } from 'node:test';
import assert from 'node:assert/strict';
import { customFetch, setRequestHeadersGetter } from './custom-fetch.ts';

test('browser failures are reported without tokens, bodies or query strings', async t => {
  const messages: unknown[][] = [];
  t.mock.method(console, 'warn', (...args: unknown[]) => { messages.push(args); });
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { origin: 'https://preview.example' } } });
  t.after(() => {
    setRequestHeadersGetter(null);
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  const failure = new DOMException('private-session-value', 'SecurityError');
  setRequestHeadersGetter(async () => { throw failure; });
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('must not reach fetch'); });
  await assert.rejects(customFetch('/api/demo/rounds?private=private-session-value'), error => error === failure);
  assert.equal(messages.length, 1);
  assert.deepEqual(messages[0][1], { method: 'GET', route: '/api/demo/rounds', stage: 'headers', status: undefined, errorType: 'SecurityError' });
  assert.ok(!JSON.stringify(messages).includes('private-session-value'));

  setRequestHeadersGetter(null);
  t.mock.method(globalThis, 'fetch', async () => new Response('{"error":"private-response-value"}', { status: 503, headers: { 'content-type': 'application/json' } }));
  await assert.rejects(customFetch('/api/demo/history'), error => (error as { status: number }).status === 503);
  assert.equal(messages.length, 2);
  assert.equal((messages[1][1] as { stage: string }).stage, 'http');
  assert.ok(!JSON.stringify(messages).includes('private-response-value'));
});
