import test from 'node:test';
import assert from 'node:assert/strict';
import { readAllora } from '../src/modules/agents/infrastructure/allora-public.ts';

const now = Date.parse('2026-10-06T12:00:00Z');
function source({ metadata = 'BTC/USD - Price Prediction - 8h', price = '85000.125',
  time = '2026-10-06T11:55:00Z', chain = 'allora-mainnet-1', height = '100', active = true } = {}) {
  return async url => new Response(JSON.stringify(
    url.includes('/topics/') ? { topic: { id: '14', metadata } }
      : url.includes('is_topic_active') ? { is_active: active }
        : url.includes('latest_network_inferences') ? { inference_block_height: '100', network_inferences: { combined_value: [{ label_name: 'y', value: price }] } }
          : { result: { block: { header: { height, chain_id: chain, time } } } }
  ), { status: 200 });
}
test('Allora normalizes only verified price topic and preserves actual production time', async () => {
  const result = await readAllora('BTC', source(), now);
  assert.equal(result.price, '85000.125');
  assert.equal(result.producedAt, '2026-10-06T11:55:00.000Z');
  assert.equal(result.targetAt, '2026-10-06T19:55:00.000Z');
  assert.equal(result.authentication, 'public_unsigned');
  assert.equal(result.uncertainty, 'unavailable');
});
test('an expired inference remains expired despite a new successful query', async () => {
  const result = await readAllora('BTC', source({ time: '2026-10-05T11:55:00Z' }), now);
  assert.equal(result.status, 'stale');
  assert.equal(result.producedAt, '2026-10-05T11:55:00.000Z');
});
test('wrong task, inactive topic, network, height, future time or malformed price fail closed', async () => {
  for (const change of [{ metadata: 'BTC/USD - Log Returns - 8h' }, { active: false },
    { chain: 'allora-testnet-1' }, { height: '101' }, { time: '2027-01-01T00:00:00Z' },
    { price: 'NaN' }, { price: '-1' }, { price: '0' }]) {
    await assert.rejects(readAllora('BTC', source(change), now));
  }
});
test('source failures do not generate a replacement inference', async () => {
  await assert.rejects(readAllora('BTC', async () => new Response('{}', { status: 503 }), now), /source_unavailable/);
});
