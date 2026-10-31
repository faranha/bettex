import { test } from 'node:test';
import assert from 'node:assert/strict';
import { minuteRows, minuteWindow, hourlyRows, hourlyWindow, barColor, fmtClock } from './staking-minute-chart.ts';

const start = Date.UTC(2026, 9, 7, 19);
test('hour windows retain all minute points, including both cycle boundaries', () => {
  assert.deepEqual(minuteWindow('1h', 0), [0, 60]);
  assert.deepEqual(minuteWindow('1h', 100), [55, 115]);
  assert.deepEqual(minuteWindow('1h', 1440), [1380, 1440]);
  assert.deepEqual(minuteWindow('6h', 400), [130, 490]);
  assert.deepEqual(minuteWindow('24h', 800), [0, 1440]);
  const points = Array.from({ length: 1441 }, (_, m) => ({ at: start + m * 60000, profit: m <= 100 ? -m : null, allocated: m <= 100 ? 0 : null, forecast: m >= 100 ? -m : null }));
  const rows = minuteRows(points, start, minuteWindow('1h', 100));
  assert.equal(rows.length, 61);
  assert.equal(rows[0].minute, 55);
  assert.equal(rows.at(-1)!.minute, 115);
  assert.equal(rows[46].profit, null);
  assert.equal(rows[46].forecast, -101);
  assert.equal(minuteRows(points, start, [0, 1440]).length, 1441);
});
test('duplicate polling readings occupy one minute, gaps are not fabricated', () => {
  const rows = minuteRows([
    { at: start, profit: 0, allocated: 0 },
    { at: start + 4000, profit: -10, allocated: 0 },
    { at: start + 59000, profit: -20, allocated: 0 },
    { at: start + 120000, profit: null, allocated: null },
  ], start, [0, 60]);
  assert.deepEqual(rows.map(r => r.minute), [0, 2]);
  assert.equal(rows[0].profit, -20);
  assert.equal(rows[0].at, start);
  assert.equal(rows[1].profit, null);
  assert.deepEqual(minuteRows([], start, [0, 60]), []);
});
test('financial sign, not a random movement or future estimate, controls the bar color', () => {
  assert.equal(barColor(1), '#0E7C6B');
  assert.equal(barColor(-1), '#C44B45');
  assert.equal(barColor(0), '#9AA3B2');
  assert.equal(barColor(null), 'transparent');
});
test('minute labels use Sao Paulo independently of browser time zone', () => {
  assert.equal(fmtClock(start, 'pt-BR'), '16:00');
  assert.equal(fmtClock(start + 60000, 'en-US'), '16:01');
  assert.equal(fmtClock(start + 8 * 3600000, 'es-ES'), '00:00');
});

test('hourly bars use interval changes: an underwater round can have a positive hour', () => {
  const points = [0, -100, -50, -80].map((profit, h) => ({ at: start + h * 3600000, profit, allocated: 0 }));
  const rows = hourlyRows(points, start, [0, 240]);
  assert.deepEqual(rows.map(p => p.profit), [-100, 50, -30]);
  assert.equal(barColor(rows[1].profit), '#0E7C6B');
  assert.ok(rows.every(p => !p.partial));
  assert.equal(rows.reduce((sum, p) => sum + p.profit, 0), -80);
});

test('partial hour readings remain partial, forecasts and missing hours are never fabricated', () => {
  const at = (m: number) => start + m * 60000;
  const rows = hourlyRows([
    { at: at(10), profit: -100, allocated: 0 },
    { at: at(40), profit: -50, allocated: 0 },
    { at: at(60), profit: null, allocated: null, forecast: 500 },
    { at: at(120), profit: null, allocated: null, forecast: 1000 },
    { at: at(180), profit: -200, allocated: 0 },
    { at: at(200), profit: -210, allocated: 0 },
  ], start, [0, 240]);
  assert.deepEqual(rows.map(p => [p.minute, p.profit, p.partial]), [[0, 50, true], [180, -10, true]]);
  assert.equal(rows[0].fromAt, at(10));
  assert.equal(rows[0].toAt, at(40));
  assert.deepEqual(hourlyRows([{ at: start, profit: 0, allocated: 0 }], start, [0, 60]), []);
});

test('hourly views align to cycle-hour boundaries and exclude later hours', () => {
  assert.deepEqual(hourlyWindow('1h', 185), [180, 240]);
  assert.deepEqual(hourlyWindow('6h', 405), [60, 420]);
  assert.deepEqual(hourlyWindow('24h', 1440), [0, 1440]);
});
