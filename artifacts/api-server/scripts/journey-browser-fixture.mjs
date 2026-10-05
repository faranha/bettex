/**
 * Disposable HTTP/browser harness: empty isolated DB schema + separate EVM.
 * Never changes accounts, sequences, permissions or the running app EVM.
 * Browser routes /api to this internal server; frontend remains the actual app.
 */
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const requireApi = createRequire(new URL('../package.json', import.meta.url));
const requireDb = createRequire(new URL('../../../lib/db/package.json', import.meta.url));
const { Pool } = requireDb('pg');
const admin = new Pool({ connectionString: process.env.DATABASE_URL });
const schema = `journey_fixture_${randomUUID().replaceAll('-', '')}`;
const quote = s => `"${s.replaceAll('"', '""')}"`;
let appPool, server, child;
async function cleanup() {
  server?.close(); await appPool?.end(); child?.kill('SIGTERM');
  await admin.query(`DROP SCHEMA IF EXISTS ${quote(schema)} CASCADE`); await admin.end();
}
try {
  await admin.query(`CREATE SCHEMA ${quote(schema)}`);
  const tables = await admin.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
  for (const { tablename } of tables.rows.filter(r => !['local_test_rounds','local_test_payouts'].includes(r.tablename))) {
    await admin.query(`CREATE TABLE ${quote(schema)}.${quote(tablename)} (LIKE public.${quote(tablename)} INCLUDING ALL)`);
  }
  const serials = await admin.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema=$1 AND column_default LIKE 'nextval(%'", [schema]);
  for (const [i, row] of serials.rows.entries()) {
    const sequence = `fixture_sequence_${i}`;
    await admin.query(`CREATE SEQUENCE ${quote(schema)}.${quote(sequence)} OWNED BY ${quote(schema)}.${quote(row.table_name)}.${quote(row.column_name)}`);
    await admin.query(`ALTER TABLE ${quote(schema)}.${quote(row.table_name)} ALTER COLUMN ${quote(row.column_name)} SET DEFAULT nextval('${quote(schema)}.${quote(sequence)}'::regclass)`);
  }
  const isolated = new URL(process.env.DATABASE_URL);
  isolated.searchParams.set('options', `-csearch_path=${schema},pg_catalog`);
  process.env.DATABASE_URL = isolated.toString();
  process.env.NODE_ENV = 'development';
  process.env.BETTEX_LOCAL_FIXTURE_URL = 'http://127.0.0.1:13001';
  if (!process.env.CLERK_SECRET_KEY) throw new Error('existing_sdk_configuration_required');
  child = spawn('pnpm', ['--filter','@workspace/bettex-contracts','run','local:runtime'], {
    env: { ...process.env, PORT: '13001' }, stdio: ['ignore','pipe','pipe'],
  });
  child.stdout.on('data', b => { if (String(b).includes('BETTEX local EVM ready')) console.log('Isolated EVM ready on 13001'); });
  child.stderr.on('data', () => {});
  for (let n = 0; n < 100; n++) {
    if (await fetch(`${process.env.BETTEX_LOCAL_FIXTURE_URL}/metadata`).then(r => r.ok).catch(() => false)) break;
    if (n === 99) throw new Error('fixture_evm_unavailable');
    await new Promise(r => setTimeout(r, 300));
  }
  const loadApi = async () => {
  const compiled = await build({
    stdin: { contents: `export {default as app} from "./src/app"; export {pool} from "@workspace/db";
      export {ensureAccountsSchema} from "./src/modules/accounts/infrastructure/store";
      export {ensureWalletsSchema} from "./src/modules/wallets/infrastructure/store";
      export {ensureHistorySchema} from "./src/modules/audit/infrastructure/history-store";
      export {journeyChain} from "./src/modules/wallets/infrastructure/journey-chain";`,
      resolveDir: new URL('..', import.meta.url).pathname },
    platform: 'node', format: 'cjs', bundle: true, write: false, logLevel: 'silent',
    external: ['pg','express','cors','pino','pino-http','@clerk/express','@clerk/shared/keys','http-proxy-middleware'],
  });
  const mod = { exports: {} };
  new Function('require','module','exports', compiled.outputFiles[0].text)(
    name => name === 'pg' ? requireDb(name) : requireApi(name), mod, mod.exports);
  return mod.exports;
  };
  let api = await loadApi(); appPool = api.pool;
  assert.equal((await appPool.query('SELECT current_schema() s')).rows[0].s, schema);
  await api.ensureAccountsSchema(); await api.ensureWalletsSchema(); await api.ensureHistorySchema();
  await appPool.query(await readFile(new URL('../../../lib/db/migrations/20261005_wallet_integrity.sql', import.meta.url), 'utf8'));
  server = api.app.listen(18500, '127.0.0.1');
  console.log('BROWSER FIXTURE READY: API 18500; empty isolated schema; EVM 13001. Route only /api from the actual frontend.');
  const evidence = async () => {
    const meta = await api.journeyChain.metadata();
    const rows = (await appPool.query(`SELECT account_id,units,state,transaction_hash FROM local_test_payouts ORDER BY account_id`)).rows;
    let paid = 0;
    for (const row of rows) {
      if (row.state !== 'paid') continue;
      const receipt = await api.journeyChain.receipt(row.transaction_hash);
      assert.equal(receipt.status, 1); paid++;
    }
    const balance = await api.journeyChain.balance(meta.usdc, meta.treasury, await api.journeyChain.provider.getBlockNumber());
    const accounts = (await appPool.query('SELECT count(*)::int n FROM test_accounts')).rows[0].n;
    const operations = (await appPool.query('SELECT kind,count(*)::int n FROM test_journey_operations GROUP BY kind')).rows;
    console.log(JSON.stringify({ evidence: 'isolated_fixture', accounts, paidReceiptsVerified: paid,
      treasuryUsdcUnits: balance, operations, payouts: rows.map(r => ({ units:r.units,state:r.state,hash:r.transaction_hash })),
      chainId:31337, environment:'local_evm', epoch:meta.epoch }));
  };
  process.on('SIGUSR2', () => void (async () => {
    await new Promise(resolve=>server.close(resolve));
    await appPool.end(); api = await loadApi(); appPool = api.pool;
    server = api.app.listen(18500,'127.0.0.1');
    console.log('Fixture API refreshed, same schema/EVM/sessions, no restart of the chain.');
  })().catch(e=>console.log('Fixture reload failed:',e.code??e.name)));
  process.on('SIGUSR1', () => void evidence().catch(e => console.log('Evidence unavailable:', e.code ?? e.name)));
  process.on('SIGTERM', () => void cleanup().finally(() => process.exit()));
  process.on('SIGINT', () => void cleanup().finally(() => process.exit()));
} catch (error) { await cleanup(); throw error; }
