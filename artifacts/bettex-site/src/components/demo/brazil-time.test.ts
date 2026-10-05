import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatBrazilDateTime, formatBrazilTime } from './brazil-time.ts';

test('UTC instants display as São Paulo time, including the previous calendar day', () => {
  assert.equal(formatBrazilTime('2026-10-05T01:30:00Z'), '22:30:00');
  assert.equal(formatBrazilDateTime('2026-10-05T01:30:00Z'), '04/10/2026, 22:30');
  assert.equal(formatBrazilTime('2026-10-05T03:00:00Z'), '00:00:00');
});

test('Brazil time is independent of language and preserves the source instant', () => {
  const instant = Date.parse('2026-10-05T12:34:56Z');
  for (const locale of ['pt-BR', 'en-US', 'es-ES']) {
    assert.equal(formatBrazilTime(instant, locale), '09:34:56');
  }
  assert.equal(new Date(instant).toISOString(), '2026-10-05T12:34:56.000Z');
});

test('IANA rules handle historical São Paulo daylight saving, not a hardcoded offset', () => {
  assert.equal(formatBrazilTime('2018-12-01T12:00:00Z'), '10:00:00');
});