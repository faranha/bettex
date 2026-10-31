/** Read-only coverage of the fixed backup filter against existing disposable browser evidence. */
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import assert from 'node:assert/strict';
const requireDb=createRequire(new URL('../../../lib/db/package.json',import.meta.url));
const {Pool}=requireDb('pg'),admin=new Pool({connectionString:process.env.DATABASE_URL});
const meta=await(await fetch('http://127.0.0.1:13001/metadata')).json();
let schema,owner;
for(const {nspname} of (await admin.query("SELECT nspname FROM pg_namespace WHERE nspname LIKE 'journey_fixture_%'")).rows){
  if(!(await admin.query("SELECT 1 FROM information_schema.tables WHERE table_schema=$1 AND table_name='local_test_rounds'",[nspname])).rowCount)continue;
  const rows=(await admin.query(`SELECT p.account_id FROM "${nspname}".local_test_payouts p JOIN "${nspname}".local_test_rounds r ON r.id=p.round_id WHERE r.epoch=$1 AND p.state='paid'`,[meta.epoch])).rows;
  if(rows.length){assert.ok(!schema);schema=nspname;owner=rows[0].account_id;}
}
assert.ok(schema);
const url=new URL(process.env.DATABASE_URL);url.searchParams.set('options',`-csearch_path=${schema},pg_catalog`);
process.env.DATABASE_URL=url.toString();
const compiled=await build({stdin:{contents:'export {historyPage} from "./src/modules/audit/infrastructure/history-store";export {pool} from "@workspace/db";',
  resolveDir:new URL('..',import.meta.url).pathname},bundle:true,platform:'node',format:'cjs',write:false,external:['pg'],logLevel:'silent'});
const mod={exports:{}};new Function('require','module','exports',compiled.outputFiles[0].text)(requireDb,mod,mod.exports);
const {historyPage,pool}=mod.exports;
const backups=await historyPage(`native:${owner}`,{view:'activity',kind:'wallet_backup',limit:50});
assert.equal(backups.items.length,4);
assert.ok(backups.items.every(r=>['private_export_authorized','private_export_result'].includes(r.kind)));
const other=(await pool.query('SELECT id FROM test_accounts WHERE id<>$1',[owner])).rows[0].id;
assert.equal((await historyPage(`native:${other}`,{view:'activity',kind:'wallet_backup'})).items.length,0);
assert.ok(!backups.limitations.includes('distributions_unavailable'));
console.log(JSON.stringify({evidence:'updated_backup_filter_actual_browser_records',firstOwnerRows:4,secondOwnerRows:0,scope:'same_disposable_schema'}));
await pool.end();await admin.end();
