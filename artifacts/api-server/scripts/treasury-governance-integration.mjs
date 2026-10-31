/** True HTTP → isolated PostgreSQL → EVM, using test assets and persisted native execution. */
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {build} from 'esbuild';
const requireApi=createRequire(new URL('../package.json',import.meta.url));
const requireDb=createRequire(new URL('../../../lib/db/package.json',import.meta.url));
const {Pool}=requireDb('pg'),admin=new Pool({connectionString:process.env.DATABASE_URL});
const schema=`treasury_fixture_${randomUUID().replaceAll('-','')}`;
let child,api,server;
async function loadApi(){
  const compiled=await build({stdin:{contents:`export {default as app} from "./src/app";export {pool} from "@workspace/db";
    export {accountsStore,ensureAccountsSchema} from "./src/modules/accounts/infrastructure/store";
    export {ensureWalletsSchema} from "./src/modules/wallets/infrastructure/store";
    export {ensureHistorySchema} from "./src/modules/audit/infrastructure/history-store";
    export {journeyChain} from "./src/modules/wallets/infrastructure/journey-chain";
    export {journeyStore} from "./src/modules/execution/infrastructure/journey-store";
     export {nativeJourney} from "./src/modules/execution";
     export {alphaRecords,alphaPipeline} from "./src/routes/alpha-runtime";
     export {polymarketBtc} from "./src/modules/agents/infrastructure/polymarket-btc";
     export {startDemoScripts} from "./src/lib/demo-store";`,
    resolveDir:new URL('..',import.meta.url).pathname},platform:'node',format:'cjs',bundle:true,write:false,logLevel:'silent',
    external:['pg','express','cors','pino','pino-http','@clerk/express','@clerk/shared/keys','http-proxy-middleware']});
  const mod={exports:{}};
  new Function('require','module','exports',compiled.outputFiles[0].text)(n=>n==='pg'?requireDb(n):requireApi(n),mod,mod.exports);
  const api=mod.exports;
  assert.equal((await api.pool.query('SELECT current_schema() s')).rows[0].s,schema);
  return api;
}
try{
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const isolated=new URL(process.env.DATABASE_URL);isolated.searchParams.set('options',`-csearch_path=${schema},pg_catalog`);
  process.env.DATABASE_URL=isolated.toString();process.env.NODE_ENV='development';
  process.env.BETTEX_LOCAL_FIXTURE_URL='http://127.0.0.1:13002';
  child=spawn('pnpm',['--filter','@workspace/bettex-contracts','run','local:runtime'],{
    env:{...process.env,PORT:'13002'},detached:true,stdio:['ignore','ignore','ignore']});
  for(let n=0;n<120;n++){
    if(await fetch(`${process.env.BETTEX_LOCAL_FIXTURE_URL}/metadata`).then(r=>r.ok).catch(()=>false))break;
    if(n===119)throw new Error('fixture_evm_unavailable');await new Promise(r=>setTimeout(r,250));
  }
  api=await loadApi();
  await api.ensureAccountsSchema();await api.ensureWalletsSchema();await api.ensureHistorySchema();
  // Agent fixtures are isolated, explicitly marked and never sent to the real source or treasury.
  const agentNow=Date.now();
  const fakeSource=api.polymarketBtc(async url=>new Response(JSON.stringify(url.includes('public-search')?
    {events:[{markets:[{id:'1',question:'Bitcoin fixture',active:true,closed:false,enableOrderBook:true,
      endDate:new Date(agentNow+86400000).toISOString(),updatedAt:new Date(agentNow).toISOString(),
      clobTokenIds:'[\"123\"]',outcomes:'[\"Yes\"]'}]}]}:
    {asset_id:'123',hash:'fixture-book',timestamp:String(agentNow),asks:[{price:'0.5',size:'1'}]})),()=>agentNow);
  const observations=(await fakeSource.collect()).opportunities;
  observations.forEach(o=>{o.origin.nature='internal_fixture';});
  await api.alphaPipeline.ingest(observations);
  const agentId=observations[0].id;
  assert.equal((await api.alphaRecords.record(agentId)).state,'needs_update');
  const agentAuditBefore=(await api.pool.query("SELECT count(*)::int n FROM history_events WHERE correlation_id=$1",[`alpha:${agentId}`])).rows[0].n;
  assert.equal(agentAuditBefore,3);
  await api.journeyStore.initialize();
  const actors=[];
  for(const role of ['proposer','approver','outsider']){
    const id=randomUUID();
    // Actors and session are administratively provisioned in this empty schema, never in the app.
    await api.accountsStore().insert({id,registrationId:randomUUID(),email:`${role}@example.test`,displayName:`Test ${role}`,
      passwordHash:'nonlogin-fixture',noticeVersion:'test-no-recovery-v1',acceptedAt:new Date()});
    actors.push({id,...await api.accountsStore().newSession(id)});
  }
  server=api.app.listen(18502,'127.0.0.1');
  const request=async(actor,body)=>{
    const r=await fetch('http://127.0.0.1:18502/api/treasury/governance',{method:body?'POST':'GET',
      headers:{Cookie:`bettex_test_session=${actor.token}`,Origin:'http://localhost:25336',
        'Content-Type':'application/json'},body:body?JSON.stringify({csrf:actor.csrf,reason:'fixture authorization',...body}):undefined});
    return {status:r.status,data:await r.json()};
  };
  assert.equal((await request(actors[2])).status,403);
  const permissions=['treasury_view','treasury_propose','treasury_approve','treasury_execute','treasury_pause','treasury_policy','treasury_activate'];
  for(const actor of actors.slice(0,2))for(const p of permissions)
    await api.pool.query('INSERT INTO test_account_permissions(account_id,permission) VALUES($1,$2)',[actor.id,p]);
  const meta=await api.journeyChain.metadata();
  const {keccak256,toUtf8Bytes}=requireApi('ethers');
  const flow=api.nativeJourney({store:api.journeyStore,chain:api.journeyChain,executorId:randomUUID(),
    hashId:s=>keccak256(toUtf8Bytes(s)),verifyEffects:(s,r,m,o)=>api.journeyChain.verifyEffects(s.name,r.hash,m,s.draft,o)});
  const funded=await flow.transferTest('treasury-governance-capital',meta,keccak256(toUtf8Bytes('isolated-governance-capital')),
    meta.reserve,meta.treasury,'5000000',true);
  assert.equal(funded.confirmed,true);
  let result=await request(actors[0]);assert.equal(result.status,200);
  assert.equal(result.data.resources.cashUnits,'5000000');assert.equal(result.data.resources.capitalUnits,'5000000');
  assert.equal(result.data.realizedProfitUnits,null);assert.equal(result.data.policy.paused,true);
  assert.equal(result.data.resources.distributionSummary.paidUnits,'0');
  assert.equal(result.data.resources.distributionSummary.modeledResultUnits,'0');
  assert.equal((await request(actors[0],{action:'resume',id:'resume'})).status,200);
  // Control fixture: explicit human proposal. Treasury no longer fabricates a market opportunity.
  const destination=(await request(actors[0])).data.policy.destinations[0];
  assert.equal((await request(actors[0],{action:'propose',kind:'allocation',id:'allocation',units:'250000',destination})).status,200);
  result=await request(actors[1],{action:'approve',id:'allocation'});
  assert.equal(result.data.proposal.state,'approved');assert.equal(result.data.proposal.units,'250000');
  result=await request(actors[0]);assert.equal(result.data.resources.reservedUnits,'250000');
  assert.equal((await request(actors[0],{action:'pause',id:'pause'})).status,200);
  assert.equal((await request(actors[1],{action:'execute',id:'allocation'})).status,409);
  assert.equal((await request(actors[0],{action:'resume',id:'resume-again'})).status,200);
  // Simulate death after persisted nonce/confirmed transfer but before governance projection commit.
  const operationId=keccak256(toUtf8Bytes(`governance:${meta.epoch}:allocation`));
  const forkCheckpoint=await api.journeyChain.provider.send('evm_snapshot',[]);
  const sent=await flow.transferTest('treasury-governance-system',meta,operationId,meta.treasury,destination,'250000',true);
  assert.equal(sent.confirmed,true);
  assert.equal((await api.pool.query("SELECT proposal->>'state' state FROM treasury_governance_proposals WHERE id='allocation'")).rows[0].state,'approved');
  await new Promise(r=>server.close(r));await api.pool.end();api.journeyChain.provider.destroy();
  api=await loadApi();server=api.app.listen(18502,'127.0.0.1');
  // HTTP sees the same durable specialist/market/BETTEX trace after backend reconstruction.
  const alpha=await fetch('http://127.0.0.1:18502/api/agents/alpha').then(r=>r.json());
  assert.equal(alpha.opportunities.find(r=>r.opportunity.id===agentId).decisions.length,3);
  await api.alphaPipeline.ingest(observations);
  assert.equal((await api.pool.query("SELECT count(*)::int n FROM history_events WHERE correlation_id=$1",[`alpha:${agentId}`])).rows[0].n,agentAuditBefore);
  result=await request(actors[1],{action:'execute',id:'allocation'});assert.equal(result.status,200);
  assert.equal(result.data.proposal.state,'confirmed');assert.equal(result.data.proposal.hash,sent.stage.transactionHash);
  assert.equal((await request(actors[1],{action:'execute',id:'allocation'})).data.proposal.hash,sent.stage.transactionHash);
  const snapshot=(await request(actors[0])).data;
  assert.equal(snapshot.resources.cashUnits,'4750000');assert.equal(snapshot.resources.reservedUnits,'0');
  assert.equal(snapshot.resources.allocatedUnits,'250000');assert.equal(snapshot.resources.capitalUnits,'5000000');
  assert.equal((await api.pool.query("SELECT count(*)::int n FROM test_journey_stages WHERE operation_id=$1",[operationId])).rows[0].n,1);
  process.env.NODE_ENV='production';
  const publishedDemo=await fetch('http://127.0.0.1:18502/api/demo/dashboard');
  assert.equal(publishedDemo.status,403);assert.equal((await publishedDemo.json()).error,'app_in_development');
  assert.equal(api.startDemoScripts(),undefined);
  process.env.NODE_ENV='development';
  const receipt=await api.journeyChain.receipt(sent.stage.transactionHash);assert.equal(receipt.status,1);
  assert.equal(await api.journeyChain.balance(meta.usdc,destination,receipt.blockNumber),'250000');
  const audit=(await api.pool.query("SELECT count(*)::int n FROM history_events WHERE kind='treasury_governance_confirmed' AND transaction_hash=$1",[sent.stage.transactionHash])).rows[0].n;
  assert.equal(audit,1);
  // A direct human proposal cannot approve itself.
  await request(actors[0],{action:'propose',kind:'allocation',id:'self',units:'1',destination});
  assert.equal((await request(actors[0],{action:'approve',id:'self'})).status,403);
  // Orphaned receipts cannot remain actionable cached confirmations or restore spendable budget.
  await api.journeyChain.provider.send('evm_revert',[forkCheckpoint]);
  const quarantined=await request(actors[0]);assert.equal(quarantined.status,503);
  assert.ok(['block_unavailable','allocation_reconciliation_required'].includes(quarantined.data.code));
  assert.equal((await request(actors[1],{action:'execute',id:'allocation'})).status,503);
  assert.equal((await api.pool.query("SELECT count(*)::int n FROM test_journey_stages WHERE operation_id=$1",[operationId])).rows[0].n,1);
  console.log(JSON.stringify({evidence:'http_postgres_evm_treasury_governance',chainId:31337,environment:'local_evm',
    capitalUnits:'5000000',cashUnits:'4750000',allocationUnits:'250000',reservedUnits:'0',
    cashReportedAt:'confirmed_checkpoint_before_reorg',
    allocationHash:sent.stage.transactionHash,receiptStatus:1,journalStages:1,auditConfirmations:audit,
    sameChainAndSchemaBackendRestart:true,duplicatePrevented:true,pauseVerified:true,outsiderDenied:true,
     selfApprovalDenied:true,realizedProfitUnits:null,reorgQuarantinedAfterConfirmedCheckpoint:true,mainAppUntouched:true,
     alphaEvidenceAndAuditSurvivedRestart:true,alphaDuplicateDidNotRepeatEvents:true,
     publishedDemoApiBlocked:true,productionEmulationTimerDisabled:true}));
}finally{
  if(server)await new Promise(r=>server.close(r));
  api?.journeyChain.provider.destroy();await api?.pool.end();
  if(child?.pid){try{process.kill(-child.pid,'SIGTERM');}catch{}}
  await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);await admin.end();
}
