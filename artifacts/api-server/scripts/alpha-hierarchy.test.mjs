import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const built=await build({stdin:{contents:`export {alphaHierarchy,assertAlphaReady,qualification,alphaAgents,treasuryGovernanceAgent} from "./src/modules/agents";
 export {polymarketBtc} from "./src/modules/agents/infrastructure/polymarket-btc";
 export {treasuryGovernance,treasuryPermissions} from "./src/modules/risk";`,resolveDir:new URL('..',import.meta.url).pathname},
 platform:'node',format:'cjs',bundle:true,write:false,logLevel:'silent',external:['node:crypto']});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(await import('node:module').then(m=>m.createRequire(import.meta.url)),mod,mod.exports);
const {alphaHierarchy,assertAlphaReady,qualification,alphaAgents,polymarketBtc,treasuryGovernance,treasuryPermissions,treasuryGovernanceAgent}=mod.exports;
const now=Date.parse('2026-10-05T13:00:00Z'),obs=value=>({kind:'observed',value});
const estimate=value=>({kind:'estimated',value,method:'internal fixture, not a calibrated model'});
function opportunity(id='btc:fixture',extra={}){
 return {id,marketAgent:'predictions',specialist:'btc',market:'prediction',
  origin:{provider:'internal_fixture',snapshotId:id,nature:'internal_fixture'},
  instrument:{id:'123',name:'BTC prediction fixture',outcome:'Yes',settlementAsset:obs('USDC')},operation:obs('buy'),
  sources:[{url:'https://example.test/fixture',producedAt:new Date(now).toISOString(),collectedAt:new Date(now).toISOString(),evidence:id}],
  model:obs({name:'fixture',methodology:'only a test',version:'1'}),executablePrice:obs('0.5'),
  costs:estimate({totalUnits:'10000',currency:'USDC',includesSlippage:true}),liquidity:obs({capitalCapacityUnits:'1000000',currency:'USDC'}),
  estimatedReturn:estimate({grossUnits:'60000'}),uncertainty:estimate({method:'fixture',lowerNetUnits:'-100000',upperNetUnits:'60000'}),
  risks:['resolution'],potentialLossUnits:estimate('100000'),capitalUnits:obs('200000'),horizonSeconds:obs(3600),
  correlation:obs({group:'BTC-prediction',exposureVerified:true,existingExposureUnits:'0'}),
  validUntil:new Date(now+60000).toISOString(),invalidationConditions:['quote_expired','book_changed'],...extra};
}
function fixture(){
 const rows=new Map(),events=[];let time=now;
 const tx={list:async()=>[...rows.values()].map(v=>structuredClone(v)),find:async id=>rows.has(id)?structuredClone(rows.get(id)):undefined,
  save:async r=>rows.set(r.opportunity.id,structuredClone(r)),event:async r=>events.push(structuredClone(r))};
 const flow=alphaHierarchy({atomic:run=>run(tx),now:()=>time,allowFixtures:true});
 const sent=[];const control={paused:false,availableUnits:'1000000',maxAllocationUnits:'250000',exposureVerified:true,
  propose:async p=>sent.push(p)};
 return {flow,rows,events,control,sent,advance:ms=>{time+=ms;}};
}
test('specialist → market → BETTEX → risk; correlated trace, no execution authority',async()=>{
 const f=fixture();await f.flow.ingest([opportunity()]);
 assert.deepEqual(f.events.map(e=>e.decisions.at(-1).layer),['specialist','market','market']);
 const d=await f.flow.decide(f.control);
 assert.equal(d.selected.length,1);assert.equal(d.heldCapitalUnits,'800000');
 assert.deepEqual(f.events.map(e=>e.decisions.at(-1).layer),['specialist','market','market','BETTEX','risk']);
 assert.equal(f.sent[0].id,'alpha:btc:fixture');assert.equal(f.rows.get('btc:fixture').state,'awaiting_authorization');
 assert.equal(new Set(f.events.map(e=>e.correlationId)).size,1);
 assertAlphaReady(f.rows.get('btc:fixture'),now,true);
 assert.throws(()=>assertAlphaReady(f.rows.get('btc:fixture'),now),/invalid_agent_decision/);
});
test('net costs, loss, uncertainty, horizon, liquidity and correlation affect comparison',async()=>{
 const f=fixture();
 const forwarded=await f.flow.ingest([opportunity('btc:slow',{horizonSeconds:obs(7200)}),opportunity('btc:fast'),
  opportunity('btc:illiquid',{liquidity:obs({capitalCapacityUnits:'1',currency:'USDC'})}),
  opportunity('btc:expensive',{costs:obs({totalUnits:'60000',currency:'USDC',includesSlippage:true})})]);
 assert.deepEqual(forwarded.filter(r=>r.state==='qualified').map(r=>r.opportunity.id),['btc:fast','btc:slow']);
 const d=await f.flow.decide(f.control);assert.equal(d.selected[0].opportunity.id,'btc:fast');
 assert.equal(d.selected.length,1);assert.equal(f.rows.get('btc:slow').reason,'correlated_exposure');
 assert.equal(f.rows.get('btc:illiquid').state,'needs_update');
 assert.equal(f.rows.get('btc:expensive').state,'needs_update');
});
test('may reject everything; pause, capital, individual limit and unknown exposure cannot be bypassed',async()=>{
 for(const change of [{paused:true},{availableUnits:'1'},{maxAllocationUnits:'1'},{exposureVerified:false}]){
  const f=fixture();await f.flow.ingest([opportunity()]);const d=await f.flow.decide({...f.control,...change});
  assert.equal(d.selected.length,0);assert.equal(f.sent.length,0);
 }
});
test('missing estimates never become zero or synthetic profit; disabled agents never qualify',async()=>{
 const f=fixture();await f.flow.ingest([opportunity('btc:missing',{estimatedReturn:{kind:'missing',reason:'no_model'}})]);
 assert.equal(f.rows.get('btc:missing').state,'needs_update');assert.equal((await f.flow.decide(f.control)).selected.length,0);
 for(const id of ['sports','crypto','bonus'])assert.equal(qualification(opportunity(id,{marketAgent:id}),now,true),'agent_disabled');
 assert.deepEqual(alphaAgents.filter(a=>a.status==='active').map(a=>a.id),['predictions']);
});
test('duplicates keep the same opportunity/events and expired quotes cannot generate an operation',async()=>{
 const f=fixture(),o=opportunity();await f.flow.ingest([o]);await f.flow.ingest([structuredClone(o)]);
 assert.equal(f.events.length,3);await f.flow.decide(f.control);await f.flow.decide(f.control);assert.equal(f.sent.length,1);
 f.advance(61000);assert.throws(()=>assertAlphaReady(f.rows.get(o.id),now+61000,true),/opportunity_expired/);
 await f.flow.ingest([]);assert.equal(f.rows.get(o.id).state,'expired');
 const g=fixture();await g.flow.ingest([opportunity('btc:expired',{validUntil:new Date(now-1).toISOString()})]);
 assert.equal((await g.flow.decide(g.control)).selected.length,0);
 await assert.rejects(f.flow.ingest([{...o,capitalUnits:obs('1')}]),/identity_conflict/);
});
test('interrupted handoff resumes with the same financial key and terms',async()=>{
 const f=fixture();await f.flow.ingest([opportunity()]);
 await assert.rejects(f.flow.decide({...f.control,propose:async()=>{throw new Error('interrupted');}}),/interrupted/);
 assert.equal(f.rows.get('btc:fixture').state,'selected');
 await f.flow.decide(f.control);assert.equal(f.sent[0].id,'alpha:btc:fixture');
 await f.flow.decide(f.control);assert.equal(f.sent.length,1);
});
test('PostgreSQL JSONB key order and a new collection time do not change evidence identity',async()=>{
 const reverse=v=>Array.isArray(v)?v.map(reverse):v && typeof v==='object'?
  Object.fromEntries(Object.entries(v).reverse().map(([k,x])=>[k,reverse(x)])):v;
 const f=fixture(),o=opportunity();await f.flow.ingest([o]);
 f.rows.set(o.id,reverse(f.rows.get(o.id)));
 const replay=structuredClone(o);replay.sources[0].collectedAt=new Date(now+1000).toISOString();
 await f.flow.ingest([replay]);assert.equal(f.events.length,3);assert.equal(f.rows.size,1);
});
test('Treasury observes controls but cannot allocate competing with BETTEX',async()=>{
 let moved=0;
 const agent=treasuryGovernanceAgent({observe:async()=>({policy:{version:1},availableUnits:'1000000'}),propose:async()=>{moved++;}});
 const result=await agent.analyze('test');assert.equal(result.proposed,false);assert.equal(moved,0);
});
test('real-source adapter preserves book timestamp, distinguishes facts/gaps, and rechecks invalidation',async()=>{
 const book={asset_id:'123',hash:'abc',timestamp:String(now),asks:[{price:'0.6',size:'5'},{price:'0.5',size:'10'}]};
 const market={id:'1',question:'Will Bitcoin be above a threshold?',active:true,closed:false,enableOrderBook:true,
  endDate:new Date(now+86400000).toISOString(),updatedAt:new Date(now).toISOString(),clobTokenIds:'[\"123\"]',outcomes:'[\"Yes\"]'};
 const fetcher=async url=>new Response(JSON.stringify(url.includes('public-search')?{events:[{markets:[market]}]}:url.includes('/markets/')?market:book));
 const p=polymarketBtc(fetcher,()=>now),batch=await p.collect(),o=batch.opportunities[0];
 assert.equal(batch.source.status,'observed');assert.equal(o.executablePrice.value,'0.5');
 assert.equal(o.estimatedReturn.kind,'missing');assert.equal(o.correlation.kind,'missing');
 assert.equal(qualification(o,now),'missing_decision_data');assert.equal(o.sources[1].producedAt,new Date(now).toISOString());
 await p.verifyCurrent(o);book.hash='changed';await assert.rejects(p.verifyCurrent(o),/invalidated/);
});
test('source errors and absent asks do not fall back to invented information',async()=>{
 const p=polymarketBtc(async()=>new Response('{}',{status:503}),()=>now);
 const b=await p.collect();assert.equal(b.source.status,'unavailable');assert.equal(b.opportunities.length,0);
 const market={id:'1',question:'Bitcoin fixture',active:true,closed:false,enableOrderBook:true,
  endDate:new Date(now+86400000).toISOString(),updatedAt:new Date(now).toISOString(),clobTokenIds:'[\"123\"]',outcomes:'[\"Yes\"]'};
 const empty=polymarketBtc(async url=>new Response(JSON.stringify(url.includes('public-search')?
  {events:[{markets:[market]}]}:{asset_id:'123',hash:'book',timestamp:String(now),asks:[]})),()=>now);
 const observation=(await empty.collect()).opportunities[0];
 assert.equal(observation.executablePrice.kind,'missing');assert.equal(observation.executablePrice.reason,'no_executable_ask');
});
test('actual risk controller blocks unauthorized execution and over-limit BETTEX decisions',async()=>{
 const proposals=new Map(),holds=new Map(),events=[];let sends=0;
 const destination='0x'+'7'.padStart(40,'0'),roles=new Map([['human',treasuryPermissions]]);
 const policy={version:1,paused:false,defensiveUnits:'500000',maxAllocationUnits:'250000',dailyLimitUnits:'500000',destinations:[destination]};
 const risk=treasuryGovernance({atomic:run=>run({
  permissions:async id=>roles.get(id)??[],policy:async()=>policy,setPolicy:async()=>{},proposal:async id=>proposals.get(id),
  proposals:async()=>[...proposals.values()],save:async p=>proposals.set(p.id,p),
  resources:async except=>({cashUnits:'5000000',obligationUnits:'0',reservedUnits:'0',dailyCommittedUnits:'0'}),
  reserve:async p=>holds.set(p.id,p.units),spent:async()=>{},release:async id=>holds.delete(id),started:async()=>false,
  changePermission:async()=>{},event:async(...e)=>events.push(e),execute:async()=>{sends++;return {confirmed:true,hash:'fixture',confirmedDay:0};}
 })});
 const f=fixture();await f.flow.ingest([opportunity()]);
 await f.flow.decide({...f.control,propose:p=>risk.command({id:'bettex',type:'agent'},{action:'propose',kind:'allocation',...p,destination})});
 assert.equal(sends,0);
 await assert.rejects(risk.command({id:'bettex',type:'agent'},{action:'execute',id:'alpha:btc:fixture',reason:'test'}),/agent_proposal_only/);
 await assert.rejects(risk.command({id:'human',type:'human'},{action:'execute',id:'alpha:btc:fixture',reason:'test'}),/approval_required/);
 await risk.command({id:'human',type:'human'},{action:'approve',id:'alpha:btc:fixture',reason:'test'});assert.equal(holds.size,1);
 await risk.command({id:'human',type:'human'},{action:'execute',id:'alpha:btc:fixture',reason:'test'});assert.equal(sends,1);
 await risk.command({id:'bettex',type:'agent'},{action:'propose',kind:'allocation',id:'over',units:'999999',destination,reason:'test'});
 const blocked=await risk.command({id:'human',type:'human'},{action:'approve',id:'over',reason:'test'});
 assert.equal(blocked.proposal.state,'rejected');assert.equal(blocked.proposal.result,'allocation_limit');assert.equal(sends,1);
});
