import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
const built=await build({stdin:{contents:'export {treasuryGovernance,treasuryPermissions} from "./src/modules/risk";',
  resolveDir:new URL('..',import.meta.url).pathname},platform:'node',format:'cjs',bundle:true,write:false,logLevel:'silent'});
const mod={exports:{}};new Function('module','exports',built.outputFiles[0].text)(mod,mod.exports);
const {treasuryGovernance,treasuryPermissions}=mod.exports;
const destination='0x'+'7'.padStart(40,'0'),human=id=>({id,type:'human'}),agent={id:'tg-agent',type:'agent'};
function fixture(){
  const proposals=new Map(),holds=new Map(),roles=new Map(['alice','bob','executor'].map(id=>[id,[...treasuryPermissions]]));
  let policy={version:1,paused:false,defensiveUnits:'500000',maxAllocationUnits:'250000',dailyLimitUnits:'500000',destinations:[destination]};
  const state={cash:'5000000',obligations:'0',started:new Set(),sends:0,submit:[],events:[],confirmed:true};
  const copy=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const tx={permissions:async id=>roles.get(id)??[],policy:async()=>copy(policy),setPolicy:async p=>{policy=copy(p);},
    proposal:async id=>copy(proposals.get(id)),proposals:async()=>[...proposals.values()].map(copy),save:async p=>{proposals.set(p.id,copy(p));},
    resources:async except=>({cashUnits:state.cash,obligationUnits:state.obligations,
      reservedUnits:String([...holds].filter(([id])=>id!==except).reduce((v,[,n])=>v+BigInt(n),0n)),
      dailyCommittedUnits:String([...holds].filter(([id])=>id!==except).reduce((v,[,n])=>v+BigInt(n),0n)),
      capitalUnits:'5000000',allocatedUnits:'0',syntheticIncomingUnits:'0',unclassifiedIncomingUnits:'0',
      blockNumber:5,blockHash:'fixture',timestamp:86400}),
    reserve:async p=>{holds.set(p.id,p.units);},release:async id=>{holds.delete(id);},spent:async()=>{},
    changePermission:async c=>{roles.set(c.target,c.grant?[...(roles.get(c.target)??[]),c.permission]:(roles.get(c.target)??[]).filter(p=>p!==c.permission));},
    event:async(...args)=>{state.events.push(args);},started:async id=>state.started.has(id),
    execute:async(p,submit)=>{state.submit.push(submit);if(submit){state.sends++;state.started.add(p.id);}
      return {confirmed:state.confirmed,state:state.confirmed?'confirmed':'uncertain',hash:'test-hash',confirmedDay:1};}};
  let queue=Promise.resolve();
  const service=treasuryGovernance({atomic:run=>{
    const work=queue.then(()=>run(tx));queue=work.catch(()=>{});return work;
  }});
  const command=(actor,action,id,extra={})=>service.command(actor,{action,id,reason:'test justification',...extra});
  const propose=(id,units='250000',actor=human('alice'))=>command(actor,'propose',id,{kind:'allocation',units,destination});
  return {service,state,roles,holds,command,propose};
}
test('agent suggests but cannot approve, execute, pause, alter policy or grant authority',async()=>{
  const f=fixture();await f.propose('a','250000',agent);
  for(const action of ['approve','execute','pause','resume'])await assert.rejects(f.command(agent,action,'a'),/agent_proposal_only/);
  await assert.rejects(f.command(agent,'propose','policy',{kind:'policy'}),/agent_proposal_only/);
  assert.equal(f.state.sends,0);
});
test('segregated human approval reserves, executes, confirms and repeated request never duplicates',async()=>{
  const f=fixture();await f.propose('a');
  await assert.rejects(f.command(human('alice'),'approve','a'),/self_approval_forbidden/);
  await f.command(human('bob'),'approve','a');
  assert.equal(f.holds.get('a'),'250000');
  assert.equal((await f.command(human('executor'),'execute','a')).proposal.state,'confirmed');
  await f.command(human('executor'),'execute','a');assert.equal(f.state.sends,1);
});
test('daily budget counts other concurrent reservations; rejection retains explanation',async()=>{
  const f=fixture();for(const id of ['a','b','c'])await f.propose(id);
  const out=await Promise.all(['a','b','c'].map(id=>f.command(human('bob'),'approve',id)));
  assert.deepEqual(out.map(r=>r.proposal.state),['approved','approved','rejected']);
  assert.equal(out[2].proposal.result,'daily_limit');
  assert.equal(f.holds.size,2);
});
test('single limit, defensive reserve and reconciled obligations cannot be spent',async()=>{
  let f=fixture();await f.propose('a','250001');
  assert.equal((await f.command(human('bob'),'approve','a')).proposal.result,'allocation_limit');
  f=fixture();f.state.obligations='4400000';await f.propose('a');
  assert.equal((await f.command(human('bob'),'approve','a')).proposal.result,'insufficient_available_resources');
});
test('pause after authorization, revoked approver and changed balance each block a new send',async()=>{
  for(const failure of ['pause','permission','balance']){
    const f=fixture();await f.propose('a');await f.command(human('bob'),'approve','a');
    if(failure==='pause')await f.command(human('executor'),'pause','pause');
    if(failure==='permission')f.roles.set('bob',[]);
    if(failure==='balance')f.state.cash='600000';
    await assert.rejects(f.command(human('executor'),'execute','a'));
    assert.equal(f.state.sends,0);assert.equal(f.holds.size,1);
  }
});
test('uncertain execution conserves funds; paused/revoked approval allows reconciliation only',async()=>{
  const f=fixture();await f.propose('a');await f.command(human('bob'),'approve','a');
  f.state.confirmed=false;assert.equal((await f.command(human('executor'),'execute','a')).proposal.state,'uncertain');
  assert.equal(f.holds.size,1);await f.command(human('executor'),'pause','pause');
  f.roles.set('bob',[]);f.state.confirmed=true;
  assert.equal((await f.command(human('executor'),'execute','a')).proposal.state,'confirmed');
  assert.deepEqual(f.state.submit,[true,false]);assert.equal(f.state.sends,1);
});
test('policy requires separate approval and activation; old authorization needs fresh approval',async()=>{
  const f=fixture();await f.propose('allocation');await f.command(human('bob'),'approve','allocation');
  const policy={defensiveUnits:'500001',maxAllocationUnits:'250000',dailyLimitUnits:'500000',destinations:[destination]};
  await f.command(human('alice'),'propose','policy',{kind:'policy',policy});
  await f.command(human('bob'),'approve','policy');
  assert.equal((await f.service.observe(human('alice'))).policy.version,1);
  await f.command(human('executor'),'execute','policy');
  assert.equal((await f.service.observe(human('alice'))).policy.version,2);
  await assert.rejects(f.command(human('executor'),'execute','allocation'),/policy_version_changed/);
  await f.command(human('bob'),'approve','allocation');await f.command(human('executor'),'execute','allocation');
  assert.equal(f.state.sends,1);
});
test('same id cannot change amount/destination or gain privileges through its proposal',async()=>{
  const f=fixture();await f.propose('a');
  await assert.rejects(f.propose('a','200000'),/proposal_conflict/);
  await f.command(human('alice'),'propose','grant',{kind:'permission',permission:{target:'other',permission:'treasury_view',grant:true}});
  await f.command(human('bob'),'approve','grant');
  assert.equal(f.roles.has('other'),false);
  await f.command(human('executor'),'execute','grant');
  assert.deepEqual(f.roles.get('other'),['treasury_view']);
});
test('policy activation does not require movement authority; orphaned confirmation fails closed',async()=>{
  const f=fixture();
  await f.command(human('alice'),'propose','grant',{kind:'permission',permission:{target:'other',permission:'treasury_view',grant:true}});
  await f.command(human('bob'),'approve','grant');
  f.roles.set('executor',['treasury_activate']);
  assert.equal((await f.command(human('executor'),'execute','grant')).proposal.state,'confirmed');
  f.roles.set('executor',[...treasuryPermissions]);
  await f.propose('allocation');await f.command(human('bob'),'approve','allocation');
  await f.command(human('executor'),'execute','allocation');
  f.state.confirmed=false;
  await assert.rejects(f.command(human('executor'),'execute','allocation'),/allocation_reconciliation_required/);
  assert.equal(f.state.sends,1);
});
