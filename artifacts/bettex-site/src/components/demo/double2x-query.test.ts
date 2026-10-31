import test from 'node:test';
import assert from 'node:assert/strict';
import { readDouble2xWithDeadline } from './double2x-query.ts';

test('read returns the actual snapshot unchanged', async () => {
  const snapshot = { balanceUsdc: 3.68, canPlay: true };
  assert.equal(await readDouble2xWithDeadline(async () => snapshot, new AbortController().signal), snapshot);
});
test('a stalled read times out and aborts even if the reader ignores cancellation', async () => {
  let received: AbortSignal | undefined;
  await assert.rejects(readDouble2xWithDeadline(signal => {
    received = signal; return new Promise(() => {});
  }, new AbortController().signal, 10), /double2x_read_timeout/);
  assert.equal(received?.aborted, true);
});
test('closing cancels a pending read without waiting for its deadline', async () => {
  const parent = new AbortController();
  const request = readDouble2xWithDeadline(() => new Promise(() => {}), parent.signal);
  parent.abort(new Error('closed'));
  await assert.rejects(request, /closed/);
});
test('an already cancelled read does not start the request', async () => {
  const parent = new AbortController(); parent.abort(new Error('closed'));
  await assert.rejects(readDouble2xWithDeadline(async () => { throw new Error('request_started'); }, parent.signal), /closed/);
});
