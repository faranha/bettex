import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roundTerminology } from './round-terminology.ts';
test('round vocabulary is consistent in all three languages', () => {
  assert.equal(roundTerminology('Current cycle · each cycle · CYCLES', 'en'), 'Current round · each round · ROUNDS');
  assert.equal(roundTerminology('O próximo ciclo diário e os ciclos encerrados', 'pt'), 'A próxima rodada diária e as rodadas encerradas');
  assert.equal(roundTerminology('El próximo ciclo diario y los ciclos cerrados', 'es'), 'La próxima ronda diaria y las rondas cerradas');
});
test('machine identifiers, URLs and macroeconomic cycles retain their meaning', () => {
  assert.equal(roundTerminology('cycle_closed cycleResultUsdc ROUND-2026', 'en'), 'cycle_closed cycleResultUsdc ROUND-2026');
  assert.equal(roundTerminology('https://example.com/cycle', 'en'), 'https://example.com/cycle');
  assert.equal(roundTerminology('Economic cycles affect each investment cycle.', 'en'), 'Economic cycles affect each investment round.');
  assert.equal(roundTerminology('Os ciclos econômicos afetam o ciclo atual.', 'pt'), 'Os ciclos econômicos afetam a rodada atual.');
});
