/** Recompile only fixture API over the existing disposable schema/chain; no account or chain reset. */
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import assert from 'node:assert/strict';
const apiRequire=createRequire(new URL('../package.json',import.meta.url));
const dbRequire=createRequire(new URL('../../../lib/db/package.json',import.meta.url));
const {Pool}=dbRequire('pg');
const admin=new Pool({connectionString:process.env.DATABASE_URL});
const metadata=await (await fetch('http://127.0.0.1:13001/metadata')).json();
const schemas=(await admin.query("SELECT nspname FROM pg_namespace WHERE nspname LIKE 'journey_fixture_%'")).rows;
let schema;
for(const {nspname} of schemas){
  const table=await admin.query("SELECT 1 FROM information_schema.tables WHERE table_schema=$1 AND table_name='local_test_rounds'",[nspname]);
  if(!table.rowCount)continue;
  const r=await admin.query(`SELECT 1 FROM "${nspname}".local_test_rounds WHERE epoch=$1 LIMIT 1`,[metadata.epoch]);
  if(r.rowCount){if(schema)throw new Error('ambiguous_fixture');schema=nspname;}
}
assert.ok(schema,'existing_fixture_required');
const isolated=new URL(process.env.DATABASE_URL);
isolated.searchParams.set('options',`-csearch_path=${schema},pg_catalog`);
process.env.DATABASE_URL=isolated.toString();process.env.NODE_ENV='development';
process.env.BETTEX_LOCAL_FIXTURE_URL='http://127.0.0.1:13001';
const compiled=await build({stdin:{contents:`export {default as app} from "./src/app";export {pool} from "@workspace/db";
export {journeyChain} from "./src/modules/wallets/infrastructure/journey-chain";
export {chainJournal} from "./src/modules/ledger/infrastructure/chain-journal";`,
resolveDir:new URL('..',import.meta.url).pathname},platform:'node',format:'cjs',bundle:true,write:false,logLevel:'silent',
external:['pg','express','cors','pino','pino-http','@clerk/express','@clerk/shared/keys','http-proxy-middleware']});
const mod={exports:{}};
new Function('require','module','exports',compiled.outputFiles[0].text)(name=>name==='pg'?dbRequire(name):apiRequire(name),mod,mod.exports);
const api=mod.exports;
assert.equal((await api.pool.query('SELECT current_schema() s')).rows[0].s,schema);
const server=api.app.listen(18501,'127.0.0.1',()=>console.log('Updated fixture API18501 ready, existing schema/chain/session preserved.'));
process.on('SIGUSR1',()=>void(async()=>{
  const meta=await api.journeyChain.metadata();
  const block=await api.journeyChain.provider.getBlock('latest');
  const book=await api.chainJournal.balance(meta.epoch,meta.usdc,meta.treasury);
  const onchain=await api.journeyChain.balance(meta.usdc,meta.treasury,block.number);
  assert.equal(book,onchain);
  const rows=(await api.pool.query('SELECT units,state,transaction_hash FROM local_test_payouts')).rows;
  for(const row of rows.filter(r=>r.state==='paid'))assert.equal((await api.journeyChain.receipt(row.transaction_hash)).status,1);
  const count=(await api.pool.query('SELECT count(*)::int n FROM local_chain_journal')).rows[0].n;
  console.log(JSON.stringify({evidence:'same_fixture_updated_ledger',entries:count,treasuryBookUnits:book,treasuryChainUnits:onchain,
    confirmedPayouts:rows.filter(r=>r.state==='paid').map(r=>({units:r.units,hash:r.transaction_hash})),chainId:31337,epoch:meta.epoch}));
})().catch(e=>console.log('Evidence check failed:',e.code??e.name)));
process.on('SIGTERM',()=>void(async()=>{server.close();await api.pool.end();await admin.end();process.exit();})());
