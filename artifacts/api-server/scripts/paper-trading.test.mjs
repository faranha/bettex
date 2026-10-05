import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';

const built=await build({stdin:{contents:`
  export {paperTrading} from "./src/modules/execution";
  export {emptyPaperLedger,availablePaperUnits,reconcilePaper} from "./src/modules/ledger";
  export {reconcilePaperExecution} from "./src/modules/reconciliation";
  export {predictionPolicy,predictionEntry} from "./src/modules/risk";`,
  resolveDir:new URL('..',import.meta.url).pathname},platform:'node',format:'cjs',
  bundle:true,write:false,logLevel:'silent'});
const mod={exports:{}};
new Function('require','module','exports',built.outputFiles[0].text)
  ((await import('node:module')).createRequire(import.meta.url),mod,mod.exports);
const {paperTrading,emptyPaperLedger,availablePaperUnits,reconcilePaper,reconcilePaperExecution,predictionPolicy}=mod.exports;
const policy={...predictionPolicy,version:"fixture-simulation-policy/1",
  maxOrderUnits:"250000",maxCorrelatedUnits:"250000",maxPortfolioUnits:"500000",defensiveUnits:"500000",
  maxAssetUnits:"250000",maxEventUnits:"250000",maxStrategyUnits:"500000",maxCounterpartyUnits:"500000"};
const t=Date.parse("2026-10-05T12:00:00Z");
function candidate(id,asset="btc",extra={}){
  return {id,asset,event:`Will ${asset.toUpperCase()} close above threshold?`,eventId:`event-${id}`,
    instrumentId:`token-${id}`,outcome:"Yes",counterparty:"polymarket",correlationGroup:"crypto-correlated",
    sourceNature:"internal_fixture",policyVersion:policy.version,strategyVersion:policy.strategyVersion,
    quantityUnits:"300000",capitalUnits:"120000",feesUnits:"0",priceUnits:"400000",
    probabilityBps:8000,lowerBps:7500,upperBps:8500,calibrated:true,
    expectedUnits:"120000",lossUnits:"120000",source:"https://clob.polymarket.com/book?token_id=fixture",
    producedAt:new Date(t).toISOString(),validUntil:new Date(t+60000).toISOString(),horizonSeconds:600,
    exitPlan:"Hold to resolution; reduce if advantage disappears; exit if invalidated, subject to actual liquidity.",...extra};
}
function session({funded=true,fixtures=true,fundingUnits="1000000"}={}){
  let time=t;
  const ledger=emptyPaperLedger(policy.defensiveUnits);
  if(funded){ledger.fundingUnits=fundingUnits;ledger.cashUnits=fundingUnits;ledger.status="reconciled";}
  let database={ledger,decisions:[],orders:[],positions:[],events:[]};
  const ports={
    now:()=>time,allowFixtures:fixtures,reconcile:s=>reconcilePaperExecution(s,policy.defensiveUnits),policy,
    async atomic(fn){
      // Simulates a serializable commit; JSONB persistence/restore also reorders object keys.
      const working=structuredClone(database);const result=await fn(working);
      database=JSON.parse(JSON.stringify(working));return structuredClone(result);
    },
  };
  return {engine:paperTrading(ports),restore:()=>paperTrading(ports),snapshot:()=>structuredClone(database),
    corrupt:fn=>fn(database),
    advance:ms=>{time+=ms;},at:()=>time};
}
const auth={id:"approved-paper-mandate",mode:"simulation_only",policyVersion:policy.version,
  strategyVersion:policy.strategyVersion,expiresAt:new Date(t+120000).toISOString(),approved:true};
test("specialist policy changes never release another specialist's reservation",async()=>{
  let state=session().snapshot();
  const reference=asset=>({effectiveId:`published-${asset}`,environment:"development",revision:5,
    versions:{treasury:`development:treasury:${policy.version}`,strategy:`development:strategy:${policy.strategyVersion}`,
      specialist:`development:specialist:prediction-${asset}/1`},
    hashes:{treasury:"a",strategy:"b",specialist:asset},
    implementations:{treasury:"treasury-paper-controls/1",strategy:"calibrated-event-lower-bound/1",
      specialist:"polymarket-event-observer/1"},exitTreatment:"preserve_original_exit_and_apply_emergency_controls"});
  const engine=(asset,extra={})=>paperTrading({now:()=>t,
    policy:{...policy,published:true,effectiveId:reference(asset).effectiveId,environment:"development",
      allowedAssets:[asset],...extra},
    reconcile:s=>reconcilePaperExecution(s,policy.defensiveUnits),
    atomic:async fn=>{const next=structuredClone(state),result=await fn(next);state=next;return structuredClone(result);}});
  const data=asset=>candidate(`${asset}:isolated`,asset,{sourceNature:"real_market_data",provider:"polymarket_gamma_clob",
    market:"prediction",sourceProducedAt:new Date(t).toISOString(),policyReference:reference(asset)});
  const btc=(await engine("btc").decide([data("btc")])).decisions[0];
  const eth=(await engine("eth").decide([data("eth")])).decisions[0];
  assert.equal(btc.state,"selected");assert.equal(eth.state,"selected");
  assert.equal(state.ledger.reservations[btc.id],"120000");
  assert.equal(state.ledger.reservations[eth.id],"120000");
  await engine("btc",{effectiveId:"new-btc-composition"}).maintain();
  assert.equal(state.ledger.reservations[btc.id],undefined);
  assert.equal(state.ledger.reservations[eth.id],"120000");
  assert.equal(state.decisions[0].policySnapshot.effectiveId,"published-btc");
  assert.ok(state.events.some(e=>e.currentPolicyId==="new-btc-composition"&&
    e.differences.some(d=>d.field==="effectiveId")));
});
function quote(c,id,at,{priceUnits="400000",availableSharesUnits="300000",side="buy",verified=true}={}){
  return {id,source:"https://clob.polymarket.com/book?token_id=fixture",
    producedAt:new Date(at).toISOString(),validUntil:new Date(at+60000).toISOString(),
    priceUnits,availableSharesUnits,feesBps:0,verified,instrumentId:c.instrumentId,side};
}
test("BTC/ETH/SOL compete; correlation, budgets, dedup, restart, and price changes cannot double-reserve",async()=>{
  const ctx=session(),cs=[candidate("btc:one"),candidate("eth:one","eth"),candidate("sol:one","sol")];
  const p=await Promise.all([ctx.engine.decide(cs),ctx.engine.decide(cs)]);
  assert.equal(p[0].decisions.filter(d=>d.state==="selected").length,2);
  assert.equal(p[0].decisions.filter(d=>d.reason==="correlated_exposure").length,1);
  assert.equal(ctx.snapshot().decisions.length,3);
  assert.equal(Object.keys(ctx.snapshot().ledger.reservations).length,2);
  assert.equal(availablePaperUnits(ctx.snapshot().ledger),260000n);
  await assert.rejects(ctx.engine.decide([candidate("btc:one","btc",{priceUnits:"390000"})]),/opportunity_identity_conflict/);
  const decision=ctx.snapshot().decisions.find(d=>d.asset==="btc");
  const order=await ctx.engine.submit(decision.id,quote(cs[0],"book-1",ctx.at()),auth);
  assert.equal(order.state,"pending");
  const again=await ctx.restore().submit(decision.id,quote(cs[0],"book-1",ctx.at()),auth);
  assert.equal(again.id,order.id);
  assert.equal(ctx.snapshot().orders.length,1);
  const eth=ctx.snapshot().decisions.find(d=>d.asset==="eth");
  const priceChange=await ctx.engine.submit(eth.id,quote(cs[1],"book-eth",ctx.at(),{priceUnits:"900000"}),auth);
  assert.equal(priceChange,null);
  assert.equal(ctx.snapshot().decisions.find(d=>d.id===eth.id).reason,"price_changed_before_execution");
  assert.equal(Object.keys(ctx.snapshot().ledger.reservations).length,1);
  assert.equal(reconcilePaper(ctx.snapshot().ledger),"paper_journal_reconciled_no_real_money");
});
test("partial fills are not positions before confirmation; cost is not loss; valuations are not distributions",async()=>{
  const ctx=session(),c=candidate("btc:partial");
  const d=(await ctx.engine.decide([c])).decisions[0];
  const o=await ctx.engine.submit(d.id,quote(c,"entry",ctx.at()),auth);
  assert.equal(ctx.snapshot().positions.length,0);
  const first=await ctx.engine.fill(o.id,quote(c,"entry",ctx.at(),{availableSharesUnits:"150000"}));
  assert.equal(first.state,"partial");
  assert.equal(ctx.snapshot().positions[0].quantityUnits,"150000");
  assert.equal(ctx.snapshot().ledger.cashUnits,"940000");
  assert.equal(ctx.snapshot().ledger.realizedUnits,"0");
  assert.equal(ctx.snapshot().ledger.reservations[d.id],"60000");
  assert.equal((await ctx.restore().fill(o.id,quote(c,"entry",ctx.at(),{availableSharesUnits:"150000"}))).fills.length,1);
  ctx.advance(31000);
  const second=await ctx.engine.fill(o.id,quote(c,"next",ctx.at(),{availableSharesUnits:"150000"}));
  assert.equal(second.state,"filled");
  assert.equal(ctx.snapshot().positions[0].committedUnits,"120000");
  assert.equal(ctx.snapshot().ledger.reservations[d.id],undefined);
  assert.equal(ctx.snapshot().positions[0].originalExpectedUnits,"120000");
  const posId=ctx.snapshot().positions[0].id;
  let valuation=await ctx.engine.evaluate(posId,{quote:quote(c,"exit",ctx.at(),
    {side:"sell",priceUnits:"500000"}),probabilityBps:8000,probabilityValidated:true});
  assert.equal(valuation.exitValueUnits,"150000");
  assert.equal(valuation.unrealizedUnits,"30000");
  assert.equal(valuation.updatedExpectedUnits,"120000");
  assert.equal(ctx.snapshot().ledger.realizedUnits,"0");
  assert.equal(ctx.snapshot().positions[0].originalExpectedUnits,"120000");
  valuation=await ctx.engine.evaluate(posId,{quote:quote(c,"thin",ctx.at(),
    {side:"sell",priceUnits:"500000",availableSharesUnits:"0"}),hypothesisValid:false});
  assert.equal(valuation.exitValueUnits,null);
  assert.equal(valuation.action,"exit");
  assert.equal(ctx.snapshot().positions[0].exitState,"blocked_liquidity");
  assert.equal(await ctx.engine.requestExit(posId,"100000",quote(c,"thin",ctx.at(),
    {side:"sell",availableSharesUnits:"0"}),auth),null);
  assert.equal(ctx.snapshot().positions[0].quantityUnits,"300000");
  const sell=await ctx.engine.requestExit(posId,"300000",quote(c,"exit",ctx.at(),
    {side:"sell",priceUnits:"500000"}),auth);
  assert.equal(sell.state,"pending");
  assert.equal(ctx.snapshot().positions[0].realizedUnits,"0");
  const partial=await ctx.engine.fill(sell.id,quote(c,"exit",ctx.at(),
    {side:"sell",priceUnits:"500000",availableSharesUnits:"100000"}));
  assert.equal(partial.state,"partial");
  assert.equal(ctx.snapshot().positions[0].realizedUnits,"10000");
  assert.equal(ctx.snapshot().positions[0].quantityUnits,"200000");
  ctx.advance(31000);
  await ctx.engine.fill(sell.id,quote(c,"exit-2",ctx.at(),
    {side:"sell",priceUnits:"500000",availableSharesUnits:"200000"}));
  assert.equal(ctx.snapshot().positions[0].state,"closed");
  assert.equal(ctx.snapshot().ledger.realizedUnits,"30000");
  assert.equal(ctx.snapshot().ledger.cashUnits,"1030000");
  assert.equal(reconcilePaper(ctx.snapshot().ledger),"paper_journal_reconciled_no_real_money");
});
test("no funding, expired candidate, stale quote, absent mandate, fixtures forbidden and cancellation fail closed",async()=>{
  const empty=session({funded:false}),c=candidate("sol:empty","sol");
  const decision=(await empty.engine.decide([c])).decisions[0];
  assert.equal(decision.reason,"paper_budget_not_authorized");
  assert.equal(empty.snapshot().ledger.cashUnits,null);
  const normal=session({fixtures:false});
  assert.equal((await normal.engine.decide([c])).decisions[0].reason,"fixture_not_allowed");
  const ctx=session(),d=(await ctx.engine.decide([candidate("btc:short")])).decisions[0],fresh=candidate("btc:short");
  await assert.rejects(ctx.engine.submit(d.id,quote(fresh,"book",ctx.at()),{...auth,approved:false}),/simulation_authorization_required/);
  assert.equal(await ctx.engine.submit(d.id,quote(fresh,"stale",ctx.at(),{verified:false}),auth),null);
  assert.equal(ctx.snapshot().ledger.reservations[d.id],undefined);
  const timed=session(),timeC=candidate("eth:time","eth");
  const td=(await timed.engine.decide([timeC])).decisions[0];
  timed.advance(60001);await timed.engine.maintain();
  assert.equal(timed.snapshot().ledger.reservations[td.id],undefined);
  assert.equal(timed.snapshot().events.filter(e=>e.reason==="selection_expired_reservation_released").length,1);
  await timed.restore().maintain();
  assert.equal(timed.snapshot().events.filter(e=>e.reason==="selection_expired_reservation_released").length,1);
});
test("resolution is separate from mark-to-market and requires verified settlement evidence",async()=>{
  const ctx=session(),c=candidate("btc:resolve"),d=(await ctx.engine.decide([c])).decisions[0];
  const o=await ctx.engine.submit(d.id,quote(c,"entry",ctx.at()),auth);
  await ctx.engine.fill(o.id,quote(c,"entry",ctx.at()));
  const pos=ctx.snapshot().positions[0];
  await assert.rejects(ctx.engine.settle(pos.id,{instrumentId:c.instrumentId,payoutUnits:"1000000",
    evidenceId:"result",source:"https://polymarket.com/event/fixture",observedAt:new Date(ctx.at()).toISOString(),verified:false}),/resolution_not_verified/);
  const result=await ctx.engine.settle(pos.id,{instrumentId:c.instrumentId,payoutUnits:"0",
    evidenceId:"result",source:"https://polymarket.com/event/fixture",observedAt:new Date(ctx.at()).toISOString(),verified:true});
  assert.equal(result.state,"settled");
  assert.equal(ctx.snapshot().ledger.realizedUnits,"-120000");
  assert.equal(ctx.snapshot().ledger.cashUnits,"880000");
  assert.equal((await ctx.restore().settle(pos.id,{instrumentId:c.instrumentId,payoutUnits:"0",
    evidenceId:"result",source:"https://polymarket.com/event/fixture",observedAt:new Date(ctx.at()).toISOString(),verified:true})).id,pos.id);
  assert.equal(ctx.snapshot().ledger.entries.length,2);
});
test("without approved capital all specialists are rejected, and a fully defensive budget selects none",async()=>{
  const cs=["btc","eth","sol"].map(asset=>candidate(`${asset}:budget`,asset));
  const missing=session({funded:false}),none=(await missing.engine.decide(cs)).decisions;
  assert.equal(none.length,3);
  assert.ok(none.every(d=>d.state==="rejected"&&d.reason==="paper_budget_not_authorized"));
  assert.deepEqual(missing.snapshot().ledger.reservations,{});
  const defensive=session({fundingUnits:"500000"}),rejected=(await defensive.engine.decide(cs)).decisions;
  assert.ok(rejected.every(d=>d.state==="rejected"&&d.reason==="insufficient_available_resources"));
  assert.equal(availablePaperUnits(defensive.snapshot().ledger),0n);
});
test("a better updated quote changes expected edge without mutating the stored expectation",async()=>{
  const ctx=session(),c=candidate("btc:improves"),d=(await ctx.engine.decide([c])).decisions[0];
  const order=await ctx.engine.submit(d.id,quote(c,"better",ctx.at(),{priceUnits:"350000"}),auth);
  assert.equal(order.state,"pending");
  await ctx.engine.fill(order.id,quote(c,"better",ctx.at(),{priceUnits:"350000"}));
  assert.equal(ctx.snapshot().positions[0].committedUnits,"105000");
  assert.equal(ctx.snapshot().positions[0].originalExpectedUnits,"120000");
  assert.equal(reconcilePaperExecution(ctx.snapshot(),policy.defensiveUnits),"paper_journal_reconciled_no_real_money");
});
test("position/subledger divergence is recorded and pauses further exits",async()=>{
  const ctx=session(),c=candidate("sol:divergence","sol");
  const d=(await ctx.engine.decide([c])).decisions[0];
  const o=await ctx.engine.submit(d.id,quote(c,"entry",ctx.at()),auth);
  await ctx.engine.fill(o.id,quote(c,"entry",ctx.at()));
  ctx.corrupt(db=>{db.positions[0].committedUnits="119999";});
  const restarted=ctx.restore();
  await restarted.maintain();
  assert.equal(ctx.snapshot().ledger.status,"divergence");
  assert.equal(await restarted.requestExit(ctx.snapshot().positions[0].id,"300000",
    quote(c,"exit",ctx.at(),{side:"sell",priceUnits:"500000"}),auth),null);
  assert.equal(ctx.snapshot().positions[0].quantityUnits,"300000");
  assert.equal(ctx.snapshot().ledger.cashUnits,"880000");
});
test("an old funded reserve policy cannot be silently reinterpreted",async()=>{
  const ctx=session();
  ctx.corrupt(db=>{db.ledger.defensiveUnits="1";});
  assert.equal(reconcilePaperExecution(ctx.snapshot(),policy.defensiveUnits),"paper_policy_reserve_mismatch");
  assert.equal((await ctx.engine.decide([candidate("btc:policy")])).decisions[0].reason,"paper_ledger_divergence");
  assert.deepEqual(ctx.snapshot().ledger.reservations,{});
});
