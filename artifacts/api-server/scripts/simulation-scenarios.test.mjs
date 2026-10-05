import test from "node:test";
import assert from "node:assert/strict";
import {build} from "esbuild";
const built=await build({stdin:{contents:`export {createScenario,commandScenario,scenarios} from "./src/modules/simulation";
export {reconcilePaper} from "./src/modules/ledger";`,resolveDir:new URL("..",import.meta.url).pathname},
  bundle:true,write:false,platform:"node",format:"cjs",logLevel:"silent"});
const m={exports:{}};new Function("require","module","exports",built.outputFiles[0].text)
  ((await import("node:module")).createRequire(import.meta.url),m,m.exports);
const {createScenario,commandScenario,scenarios,reconcilePaper}=m.exports;
async function step(r,n=1){for(let i=0;i<n;i++)await commandScenario(r,{action:"advance"});return r;}
test("complete seeded journey uses shared engines, keeps positions open and reconciles split and account balances",async()=>{
  const r=createScenario("simulation-unit-complete","complete");
  await step(r,5);
  assert.equal(r.stage,5);
  assert.equal(r.opportunities.length,3);
  assert.equal(r.paper.positions.filter(x=>x.state==="open").length,1);
  assert.equal(r.paper.ledger.realizedUnits,"0");
  const position=r.paper.positions[0],expectation=position.originalExpectedUnits;
  assert.equal(position.valuations.at(-1).unrealizedUnits,"30000000");
  assert.notEqual(position.valuations.at(-1).updatedExpectedUnits,expectation);
  assert.ok(r.events.some(x=>x.kind==="risk"&&x.state==="selected"));
  await step(r,2);
  assert.equal(r.stage,7);
  assert.equal(r.paper.positions[0].state,"closed");
  assert.equal(r.paper.positions[0].originalExpectedUnits,expectation);
  assert.equal(r.paper.ledger.realizedUnits,"30000000");
  assert.equal(r.rounds[0].paymentUnits,"7500000");
  assert.equal(r.rounds[0].buybackUnits,"7500000");
  assert.equal(r.account.usdcUnits,"507500000");
  assert.equal(r.paper.ledger.cashUnits,"1515000000");
  assert.equal(reconcilePaper(r.paper.ledger),"paper_journal_reconciled_no_real_money");
  assert.ok(r.events.every(x=>x.environment==="simulation"&&x.runId===r.id));
  assert.ok(r.paper.decisions.every(x=>x.runId===r.id));
  const before=r.events.length;await commandScenario(r,{action:"deposit",amountUnits:"5000000"});
  assert.ok(r.events.length>before);
});
test("all named failure scenarios produce explicit outcomes without fictitious confirmed transfers",async()=>{
  for(const scenario of scenarios.filter(s=>!["complete","partial_fill","no_liquidity","payment_failure","restart"].includes(s))){
    const r=createScenario(`simulation-unit-${scenario}`,scenario);await step(r,7);
    assert.ok(r.events.some(e=>["rejected","expired","failed","needs_update"].includes(e.state)),scenario);
    assert.equal(r.paper.positions.length,0,scenario);
    assert.equal(r.account.receivedUnits,"0",scenario);
  }
});
test("partial fill persists, later fill is not duplicated; illiquid exits preserve open positions",async()=>{
  const partial=createScenario("simulation-unit-partial","partial_fill");await step(partial,5);
  assert.equal(partial.paper.orders[0].state,"partial");
  assert.equal(partial.paper.positions[0].quantityUnits,"150000000");
  assert.equal(Object.keys(partial.paper.ledger.reservations).length,1);
  await step(partial);
  assert.equal(partial.paper.positions[0].state,"closed");
  assert.equal(partial.paper.orders[0].fills.length,2);
  const illiquid=createScenario("simulation-unit-illiquid","no_liquidity");await step(illiquid,5);
  await step(illiquid);
  assert.ok(illiquid.paper.positions.some(x=>x.state==="open"));
  assert.equal(illiquid.stage,5);
  await commandScenario(illiquid,{action:"market"});await step(illiquid);
  assert.ok(illiquid.paper.positions.every(x=>x.state==="closed"));
});
test("payment failure is pending liability, retries once and BETTEX exits cancel unpaid rights",async()=>{
  const r=createScenario("simulation-unit-payment","payment_failure");await step(r,7);
  assert.equal(r.rounds[0].status,"failed");assert.equal(r.paper.ledger.obligationsUnits,"7500000");
  const saved=JSON.parse(JSON.stringify(r));await commandScenario(saved,{action:"market"});await step(saved,2);
  assert.equal(saved.account.receivedUnits,"7500000");assert.equal(saved.paper.ledger.obligationsUnits,"0");
  const cancel=createScenario("simulation-unit-cancel","payment_failure");await step(cancel,7);
  await commandScenario(cancel,{action:"withdraw",amountUnits:"1000000"});
  assert.equal(cancel.rounds[0].status,"cancelled");await commandScenario(cancel,{action:"market"});await step(cancel);
  assert.equal(cancel.account.receivedUnits,"0");
});
test("controlled clock, pause, persisted interruption and execution identity remain isolated",async()=>{
  const a=createScenario("simulation-unit-a","restart"),b=createScenario("simulation-unit-b","complete");
  await step(a,4);assert.equal(a.paused,true);assert.equal(a.stage,3);
  await assert.rejects(commandScenario(a,{action:"advance"}),/simulation_paused/);
  const saved=JSON.parse(JSON.stringify(a));await commandScenario(saved,{action:"resume"});await step(saved,4);
  assert.equal(saved.stage,7);assert.equal(b.stage,0);assert.equal(b.paper.ledger.cashUnits,null);
  const timed=createScenario("simulation-unit-clock","complete");await step(timed,3);
  await commandScenario(timed,{action:"clock",seconds:61});await step(timed);
  assert.equal(Object.keys(timed.paper.ledger.reservations).length,0);
  assert.ok(timed.paper.events.some(e=>e.reason==="selection_expired_reservation_released"));
});
