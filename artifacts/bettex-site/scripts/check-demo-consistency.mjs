import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const temp = await mkdtemp(join(tmpdir(), 'bettex-consistency-'));
try {
  const dir = resolve(import.meta.dirname, '../src/components/interface-demo');
  await build({ entryPoints: [join(dir, 'runtime.ts'), join(dir, 'treasury-demo-data.ts'), join(dir, 'history-demo-data.ts'), join(dir, 'complete-demo-data.ts')],
    outdir: temp, outExtension: { '.js': '.mjs' }, bundle: true, platform: 'node', format: 'esm' });
  const { visualDashboard } = await import(pathToFileURL(join(temp, 'runtime.mjs')));
  const { roundActivity, statementEntries, statementBalances } = await import(pathToFileURL(join(temp, 'treasury-demo-data.mjs')));
  const { historyEntries, historyPage } = await import(pathToFileURL(join(temp, 'history-demo-data.mjs')));
  const { completeDemoData } = await import(pathToFileURL(join(temp, 'complete-demo-data.mjs')));
  const d = visualDashboard();
  const original = JSON.parse(await readFile(join(dir, 'fixture.json'), 'utf8')).dashboard;
  const cents = n => Math.round(n * 100);
  for (const entry of original.history) {
    const preserved = d.history.find(m => m.id === entry.id);
    for (const field of ['amount', 'kind', 'asset', 'status']) assert.equal(preserved[field], entry[field]);
  }
  assert.deepEqual(completeDemoData(structuredClone(d)), d, 'Population is idempotent; reopening cannot duplicate samples');
  assert.ok(d.history.some(m => m.status === 'pending'));
  assert.ok(d.history.some(m => m.status === 'failed'));
  assert.ok(d.history.some(m => m.kind === 'swap' && m.asset === 'USDC'));
  const cash = d.history.filter(m => m.status === 'confirmed' && m.kind !== 'distribution').reduce((s, m) =>
    s + (m.asset === 'USDC' ? (['withdraw', 'send'].includes(m.kind) ? -m.amount : m.amount) : 0)
      - (m.kind === 'swap' && m.sourceAsset === 'USDC' ? m.sourceAmount : 0), 0);
  assert.equal(Math.round(cash * 1e6), Math.round(d.balances.usdc * 1e6));
  assert.equal(Math.round(d.history.filter(m => m.kind === 'distribution').reduce((s, m) => s + m.amount, 0) * 1e6), Math.round(d.balances.receivedYield * 1e6));
  for (const r of [d.treasury.currentRound, ...d.rounds.map(r => r.treasurySnapshot)]) {
    assert.equal(cents(r.reserveUsdc + r.poolUsdc + r.workingUsdc), cents(r.assetsUsdc));
    assert.equal(cents(r.availableUsdc + r.committedUsdc), cents(r.workingUsdc));
    const items = roundActivity(r, r === d.treasury.currentRound ? d.serverNow : r.endsAt).filter(i => i.kind === 'position_closed');
    assert.equal(items.length, r.closedOperations);
    assert.equal(cents(items.reduce((s, i) => s + i.netUsdc, 0)), cents(r.realizedNetUsdc));
    assert.equal(cents(items.reduce((s, i) => s + i.costUsdc, 0)), cents(r.executionCostsUsdc));
    assert.ok(items.some(i => i.netUsdc < 0) && items.some(i => i.netUsdc > 0));
    assert.ok(items.every(i => ['BTC/USDC', 'ETH/USDC', 'SOL/USDC'].includes(i.market)));
  }
  const b = d.treasury.burn;
  assert.equal(b.totalBurnedBettex, b.entries.filter(e => e.kind === 'tokens_burned').reduce((s, e) => s + e.tokensBettex, 0));
  const purchase = b.entries.find(e => e.id.endsWith('-purchase'));
  assert.equal(cents(purchase.tokensBettex * b.referencePriceUsdc), cents(purchase.amountUsdc));
  const balances = statementBalances(d, statementEntries(d), { account: 'all', asset: 'all', from: '2000-01-01', to: '2099-12-31' });
  for (const [account, asset, closing] of [['treasury', 'USDC', d.treasury.assetsUsdc], ['buyback', 'USDC', b.walletUsdc], ['buyback', 'BETTEX', b.walletBettex]]) {
    assert.equal(Number(balances.find(v => v.account === account && v.asset === asset).closing), closing);
  }
  const all = historyEntries(d);
  const sample = { ...all[0], id: 'DATE-BOUNDARY', occurredAt: '2026-10-12T02:59:59.999Z' };
  const outside = { ...sample, id: 'NEXT-DAY', occurredAt: '2026-10-12T03:00:00.000Z' };
  const result = historyPage([sample, outside], new URLSearchParams('from=2026-10-11&to=2026-10-11'));
  assert.deepEqual(result.items.map(i => i.id), ['DATE-BOUNDARY'], 'Include the entire final São Paulo calendar day, exclude next day');
  console.log(`Demo consistency: ${d.history.length} movements, ${all.length} audit entries, ${d.rounds.length} archived rounds; originals preserved, samples idempotent, balances/costs/burn reconcile, mixed outcomes and date boundaries verified.`);
} finally { await rm(temp, { recursive: true, force: true }); }
