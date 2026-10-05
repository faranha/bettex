import test from "node:test";
import assert from "node:assert/strict";
import {build} from "esbuild";
const bundle=await build({entryPoints:["src/modules/agents/application/operations.ts"],bundle:true,write:false,platform:"node",format:"esm"});
const {assessAgent,assessAllAgents}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const {agentDefinitions,workerActivity}=await import("../src/modules/agents/domain/operations.ts");
const now=Date.parse("2026-10-06T12:00:00Z");
function context(){
  return {now,specialists:Object.fromEntries(["btc","eth","sol"].map(a=>[a,{
    forecast:{price:"85000.125",source:"https://allora-api.mainnet.allora.network/source",producedAt:"2026-10-06T11:55:00Z",
      targetAt:"2026-10-06T19:55:00Z",blockHeight:"100",status:"current"},
    market:{status:"observed",attemptedAt:"2026-10-06T11:59:30Z",opportunityCount:3},
    marketEvidence:[{source:`polymarket:${a}`,url:"https://polymarket.com/event/example",producedAt:"2026-10-06T11:59:30Z",
      targetAt:"",blockHeight:"",value:"Original source market title",unit:"market"}],
  }])),policies:{active:3,blocked:0,paused:0},
  paper:{status:"reconciled",availableUnits:"100000000",reservedUnits:"1000000",obligationsUnits:"0",orders:1,pendingOrders:1,positions:0},
  opportunities:{total:3,qualified:0,selected:0},sports:[]};
}
test("all 13 workers are distinct, linked to known dependencies, and cannot execute funds",()=>{
  assert.equal(agentDefinitions.length,13);
  const ids=new Set(agentDefinitions.map(a=>a.id));
  assert.equal(ids.size,13);
  for(const a of agentDefinitions){
    assert.equal(a.executionAllowed,false);
    assert.ok(a.rules.includes("no_real_money"));
    assert.ok(a.rules.includes("no_key_access"));
    if(a.parentId)assert.ok(ids.has(a.parentId));
    for(const id of a.dependencies)assert.ok(ids.has(id));
    assert.ok(assessAgent(a.id,context()).findings.length);
  }
});
test("BTC/ETH/SOL actually consume forecast identity and original market evidence; price is never a probability",()=>{
  for(const a of ["btc","eth","sol"]){
    const r=assessAgent(a,context());
    assert.equal(r.status,"healthy");assert.equal(r.decision,"hold");
    assert.ok(r.findings.includes("allora_connected"));
    assert.ok(r.findings.includes("allora_event_model_required"));
    assert.equal(r.evidence[0].blockHeight,"100");assert.equal(r.evidence[0].value,"85000.125");
    assert.equal(r.evidence[1].source,`polymarket:${a}`);
    assert.equal(r.facts.find(f=>f.code==="markets_observed").value,"3");
    assert.equal(r.probability,undefined);
  }
});
test("source failure is explicit, not a manufactured price or a previous healthy status",()=>{
  const c=context();c.specialists.btc={};
  const r=assessAgent("btc",c);
  assert.equal(r.status,"degraded");assert.equal(r.decision,"hold");assert.equal(r.evidence.length,0);
  assert.ok(r.findings.includes("allora_source_unavailable"));
  assert.equal(r.facts.find(f=>f.code==="forecast_usd"),undefined);
});
test("a forecast expires at target time even if the cached source said current",()=>{
  const c=context();c.now=Date.parse(c.specialists.btc.forecast.targetAt);
  const r=assessAgent("btc",c);assert.equal(r.status,"degraded");
  assert.ok(r.findings.includes("allora_horizon_elapsed"));
});
test("old or future market collections are not called fresh or linked to a current forecast",()=>{
  for(const at of ["2026-10-06T11:00:00Z","2026-10-06T12:05:00Z","bad"]){
    const c=context();c.specialists.btc.market.attemptedAt=at;
    const r=assessAgent("btc",c);
    assert.ok(r.findings.includes("polymarket_source_unavailable"));assert.equal(r.evidence.length,1);
    assert.equal(r.facts.find(f=>f.code==="markets_observed"),undefined);
  }
});
test("a successful empty discovery is zero markets, not source failure",()=>{
  const c=context();c.specialists.btc.market.status="no_eligible_markets";c.specialists.btc.market.opportunityCount=0;
  const r=assessAgent("btc",c);assert.equal(r.status,"healthy");
  assert.ok(r.findings.includes("no_eligible_markets"));assert.equal(r.facts.find(f=>f.code==="markets_observed").value,"0");
});
test("missing approved policy and pauses remain blocking even with real source evidence",()=>{
  for(const [blocked,paused] of [[1,0],[0,1]]){
    const c=context();c.policies={active:2,blocked,paused};
    assert.equal(assessAgent("governance",c).decision,"block");
    assert.equal(assessAgent("risk",c).status,"degraded");
    assert.equal(assessAgent("risk",c).decision,"block");
  }
});
test("unfunded or unavailable financial sources are not a zero-dollar reconciled treasury",()=>{
  const c=context();c.paper.status="unfunded";c.paper.availableUnits=undefined;
  const r=assessAgent("treasury",c);
  assert.ok(r.findings.includes("paper_budget_required"));
  assert.equal(r.facts.find(f=>f.code==="available_usdc_units"),undefined);
  delete c.paper;assert.equal(assessAgent("reconciliation",c).status,"failed");
});
test("executor cannot sign or automatically retry unknown orders",()=>{
  const r=assessAgent("execution",context());
  assert.equal(r.decision,"hold");
  assert.ok(r.findings.includes("no_automatic_retry"));
  assert.ok(r.findings.includes("execution_requires_authorized_model"));
});
test("crypto and bonus have explicit unconfigured provider diagnosis, never fake trades",()=>{
  assert.equal(assessAgent("crypto",context()).decision,"block");
  assert.ok(assessAgent("bonus",context()).findings.includes("bonus_source_not_configured"));
});
test("worker activity requires a persisted recent run, never a static registry flag",()=>{
  assert.equal(workerActivity(null,now),"not_started");
  assert.equal(workerActivity({completedAt:"2026-10-06T11:59:30Z"},now),"running");
  for(const completedAt of ["2026-10-06T11:56:59Z","2026-10-06T12:05:00Z","bad"])
    assert.equal(workerActivity({completedAt},now),"stale");
});
test("unknown workers fail explicitly",()=>assert.throws(()=>assessAgent("pretend",context()),/unknown_agent/));
test("parents evaluate actual specialist outputs in dependency order",()=>{
  const c=context();delete c.specialists.sol.forecast;
  const reports=assessAllAgents(c);
  assert.equal(Object.keys(reports).length,13);
  assert.ok(reports.predictions.findings.includes("allora_source_unavailable"));
  assert.equal(reports.predictions.status,"degraded");
  assert.equal(reports.sol.status,"degraded");
  assert.equal(reports.btc.status,"healthy");
  assert.equal(reports.bettex.facts.find(f=>f.code==="upstream_assessments").value,"8");
  assert.ok(Number(reports.bettex.facts.find(f=>f.code==="blocked_dependencies").value)>0);
});
test("every operational role, permission, rule and fact has complete three-language dashboard documentation",async()=>{
  const copy=await build({entryPoints:["../bettex-site/src/components/agent-operations/copy.ts"],bundle:true,write:false,format:"esm"});
  const ui=await import(`data:text/javascript;base64,${Buffer.from(copy.outputFiles[0].text).toString("base64")}`);
  assert.deepEqual([...ui.IDS].sort(),agentDefinitions.map(d=>d.id).sort());
  for(const d of agentDefinitions){
    assert.ok(ui.AGENT[d.id]?.role);
    for(const [field,table] of [["inputs","INPUT"],["outputs","OUTPUT"],["rules","RULE"],["permissions","PERM"]])
      for(const code of d[field])assert.ok(ui[table][code],`${table}: ${code}`);
    const report=assessAgent(d.id,context());
    for(const fact of report.facts)assert.ok(ui.FACT[fact.code],fact.code);
    for(const finding of report.findings)assert.ok(ui.FINDING[finding],finding);
  }
});
