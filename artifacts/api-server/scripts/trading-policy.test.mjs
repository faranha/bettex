import test from "node:test";
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {build} from "esbuild";
import {randomUUID} from "node:crypto";
const built=await build({stdin:{contents:`
  export {tradingPolicyRegistry} from "./src/modules/risk/application/policy-registry";
  export {composeControls,resolvePolicy} from "./src/modules/risk/domain/policy-composition";
  export {policyHash,validateDefinition,sourceAtCommit,workingSources} from "./src/modules/risk/infrastructure/policy-sources";
  export {predictionEntry,predictionPolicy} from "./src/modules/risk";
  export {canonical} from "./src/modules/risk/domain/policy-model";`,
  resolveDir:new URL("..",import.meta.url).pathname},platform:"node",format:"cjs",
  bundle:true,write:false,logLevel:"silent"});
const mod={exports:{}};
new Function("require","module","exports",built.outputFiles[0].text)
  ((await import("node:module")).createRequire(import.meta.url),mod,mod.exports);
const {tradingPolicyRegistry,composeControls,resolvePolicy,policyHash,validateDefinition,
  sourceAtCommit,workingSources,predictionEntry,predictionPolicy}=mod.exports;
const commit=execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim();
const clone=x=>structuredClone(x);
const source=async key=>sourceAtCommit(key,commit);
const definitions=Object.fromEntries(await Promise.all(["global","strategy","btc","eth","sol"].map(async key=>
  [key,(await source(key)).definition])));
test("a reviewed Git commit and schema are mandatory; unknown fields and incompatible source are rejected",async()=>{
  const draft=await workingSources();
  assert.ok(draft.every(d=>d.sourceCommit===commit&&d.state==="committed"));
  assert.rejects(()=>sourceAtCommit("btc","0".repeat(40)),/committed_policy_source_required/);
  assert.throws(()=>validateDefinition({...definitions.btc,unreviewed:true}));
  assert.throws(()=>validateDefinition({...definitions.btc,schemaVersion:2}));
  assert.throws(()=>validateDefinition({...definitions.btc,scope:"eth"}),/invalid_policy_definition/);
});
test("lower layers may only tighten every relevant constraint",()=>{
  const layers=[definitions.global,definitions.strategy,definitions.btc];
  const p=composeControls(layers);
  assert.equal(p.maxOrderUnits,"250000000");
  assert.deepEqual(p.allowedAssets,["btc"]);
  const attempt=(field,value)=>assert.throws(()=>composeControls([layers[0],
    {...layers[1],controls:{...layers[1].controls,[field]:value}},layers[2]]),/policy_weakening|required_control/);
  attempt("maxOrderUnits","250000001");
  attempt("defensiveUnits","499999999");
  attempt("maxSourceAgeSeconds",121);
  attempt("minimumNetEdgeBps",299);
  attempt("allowedProviders",["polymarket_gamma_clob","unknown_provider"]);
  assert.throws(()=>composeControls([{...layers[0],controls:{...layers[0].controls,paused:true}},
    {...layers[1],controls:{...layers[1].controls,paused:false}},layers[2]]),/policy_weakening:paused/);
  assert.throws(()=>composeControls([layers[0],layers[1],
    {...layers[2],controls:{...layers[2].controls,allowedAssets:["eth"]}}]),/policy_weakening|specialist_asset_not_allowed/);
});
function setup(){
  let data={control:{revision:0,active:{},statuses:{}},versions:[],changes:[]};
  const roles={author:["treasury_policy","treasury_propose"],reviewer:["treasury_approve"],
    activator:["treasury_activate","treasury_pause"],agent:["treasury_propose"]};
  let alternate=null,alerts=0;
  const ports={
    hash:policyHash,id:randomUUID,now:Date.now,
    source:async(key,revision)=>alternate&&key===alternate.key?
      {definition:clone(alternate.definition),contentHash:policyHash(alternate.definition),sourcePath:`policies/${key}.v2.json`}:sourceAtCommit(key,revision),
    atomic:async(e,run)=>{
      const pending=clone(data);
      const tx={
        control:pending.control,
        registry:async()=>({revision:pending.control.revision,active:clone(pending.control.active),
          versions:pending.versions.map(v=>({...v,...pending.control.statuses[v.id]})),changes:clone(pending.changes)}),
        version:async id=>pending.versions.find(v=>v.id===id),
        append:async v=>{pending.versions.push(clone(v));},
        permissions:async id=>roles[id]??[],
        save:async()=>{},event:async c=>{pending.changes.unshift(c);alerts++},
      };
      const result=await run(tx);data=pending;return result;
    },
  };
  const registry=tradingPolicyRegistry(ports);
  const cmd=async(action,actor,extra={})=>registry.command({
    action,environment:"development",reason:"Justificativa revisada e registrada para teste.",
    expectedRevision:data.control.revision,...extra},{id:actor,type:actor==="agent"?"agent":"human"});
  const publish=key=>cmd("publish","author",{key,sourceCommit:commit});
  const approve=id=>cmd("approve","reviewer",{versionId:id});
  const activate=id=>cmd("activate","activator",{versionId:id});
  return {cmd,publish,approve,activate,registry,roles,get data(){return data;},
    set alternate(x){alternate=x},get alerts(){return alerts}};
}
test("idempotent publication, immutable versions, independent approval, atomic activation and rollback",async()=>{
  const s=setup();
  assert.throws(()=>s.registry.effective({revision:0,active:{},versions:[],changes:[]},"development","btc"),/valid_active_policy_required/);
  await assert.rejects(()=>s.cmd("publish","agent",{key:"global",sourceCommit:commit}),/human_authority_required/);
  await s.publish("global");
  const id="development:treasury:prediction-simulation-policy/1";
  assert.equal(s.data.control.revision,1);
  const events=s.alerts;
  await s.publish("global");assert.equal(s.data.control.revision,1);assert.equal(s.alerts,events);
  await assert.rejects(()=>s.cmd("approve","author",{versionId:id}),/permission_required/);
  await assert.rejects(()=>s.cmd("activate","activator",{versionId:id}),/valid_approval_required/);
  await s.approve(id);await s.activate(id);
  for(const key of ["strategy","btc","eth","sol"]){
    await s.publish(key);
    const d=definitions[key],id=`development:${d.type}:${d.id}/${d.version}`;
    await s.approve(id);await s.activate(id);
  }
  const btc=s.registry.effective({revision:s.data.control.revision,active:s.data.control.active,
    versions:s.data.versions.map(v=>({...v,...s.data.control.statuses[v.id]})),changes:s.data.changes},"development","btc");
  assert.equal(btc.configuration.published,true);
  assert.equal(btc.configuration.maxOrderUnits,"250000000");
  assert.equal(btc.reference.versions.specialist,"development:specialist:prediction-btc/1");
  assert.equal(btc.reference.hashes.treasury,policyHash(definitions.global));
  const before=clone(s.data.versions[0]);
  const newer={...clone(definitions.global),version:2,previousVersion:"prediction-simulation-policy/1",
    controls:{...definitions.global.controls,maxOrderUnits:"100000000"}};
  s.alternate={key:"global",definition:newer};
  await s.publish("global");
  const newerId="development:treasury:prediction-simulation-policy/2";
  await s.approve(newerId);await s.activate(newerId);
  assert.ok(s.data.changes[0].differences.some(d=>d.field==="maxOrderUnits"&&
    d.before==="250000000"&&d.after==="100000000"));
  assert.equal(s.data.control.statuses[id].state,"superseded");
  assert.deepEqual(s.data.versions[0],before);
  assert.notEqual(s.data.control.active.global,id);
  await s.cmd("rollback","activator",{versionId:id});
  assert.equal(s.data.control.active.global,id);
  assert.equal(s.data.control.statuses[newerId].state,"superseded");
  assert.deepEqual(s.data.versions[0],before);
  await assert.rejects(()=>s.cmd("approve","reviewer",{versionId:id,expectedRevision:0}),/policy_revision_changed/);
  await s.cmd("revoke","activator",{versionId:id});
  assert.equal(s.data.control.active.global,undefined);
  assert.throws(()=>s.registry.effective({revision:s.data.control.revision,active:s.data.control.active,
    versions:s.data.versions,changes:s.data.changes},"development","btc"),/valid_active_policy_required/);
});
test("proposed opportunities require the current resolved identity and actual data",()=>{
  const ref={effectiveId:"hash-of-published-composition",environment:"development",revision:1,
    versions:{treasury:`development:treasury:${predictionPolicy.version}`,
      strategy:`development:strategy:${predictionPolicy.strategyVersion}`,specialist:"development:specialist:prediction-btc/1"},
    hashes:{treasury:"a",strategy:"b",specialist:"c"},
    implementations:{treasury:"treasury-paper-controls/1",strategy:"calibrated-event-lower-bound/1",
      specialist:"polymarket-event-observer/1"},exitTreatment:"preserve_original_exit_and_apply_emergency_controls"};
  const p={...predictionPolicy,published:true,effectiveId:ref.effectiveId,environment:"development"};
  const now=Date.parse("2026-10-05T12:00:00Z");
  const candidate={asset:"btc",policyVersion:p.version,strategyVersion:p.strategyVersion,
    sourceNature:"real_market_data",provider:"polymarket_gamma_clob",market:"prediction",
    policyReference:ref,calibrated:true,quantityUnits:"300000",capitalUnits:"120000",
    lossUnits:"120000",feesUnits:"0",priceUnits:"400000",expectedUnits:"120000",
    probabilityBps:8000,lowerBps:7500,upperBps:8500,horizonSeconds:600,
    producedAt:new Date(now).toISOString(),sourceProducedAt:new Date(now).toISOString(),
    validUntil:new Date(now+60000).toISOString(),
    exitPlan:"Exit only on observable liquidity",correlationGroup:"crypto-correlated",
    eventId:"event-1",counterparty:"polymarket"};
  const context={now,availableUnits:"1000000",exposure:[]};
  assert.equal(predictionEntry(candidate,context,p),"qualified");
  assert.equal(predictionEntry(candidate,context,{...p,effectiveId:"new-policy-hash"}),"valid_active_policy_required");
  assert.equal(predictionEntry({...candidate,provider:"unapproved"},context,p),"instrument_or_provider_not_allowed");
  assert.equal(predictionEntry(candidate,context,{...p,paused:true}),"valid_active_policy_required");
  assert.equal(predictionEntry(candidate,context,predictionPolicy),"valid_active_policy_required");
});
