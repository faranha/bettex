import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState, currentWeight, demoReducer, reservedBETTEX, reservedUSDC, treasuryAvailable } from './model.ts';
import type { DemoAction, DemoState, MovementKind, RoundScenario } from './types.ts';

const reduce = (s: DemoState, ...actions: DemoAction[]) => actions.reduce(demoReducer, s);
const tick = (s: DemoState, times = 1) => reduce(s, ...Array.from({ length: times }, () => ({ type: 'TICK' } as const)));
const cycle = () => tick(createInitialState(), 8);
function review(s: DemoState, kind: MovementKind, amount: number, outcome: 'success' | 'failure' | 'uncertain' = 'success', destination = 'SAMPLE-WALLET-DESTINO') {
  return demoReducer(s, { type: 'REVIEW_MOVEMENT', kind, amount, destination, outcome, quoteAt: s.clock });
}
function complete(s: DemoState, kind: MovementKind, amount: number) {
  s = review(s, kind, amount); assert.equal(s.error, null);
  const id = s.movements[0].id;
  return reduce(s, { type: 'AUTHORIZE_MOVEMENT', id }, { type: 'RESOLVE_MOVEMENT', id });
}
function assess(scenario: RoundScenario = 'profit') {
  const s = demoReducer(cycle(), { type: 'ASSESS_ROUND', scenario });
  assert.equal(s.error, null); return s;
}
function payout(s: DemoState) {
  const id = s.rounds[0].id;
  return reduce(s, { type: 'AUTHORIZE_ROUND', id }, { type: 'PAY_ROUND', id });
}
test('initial state is a fresh, independent fictional account; reset erases every domain', () => {
  const initial = createInitialState();
  let s = cycle();
  s = complete(s, 'receive', 20);
  s = reduce(s, { type:'MESSAGE',text:'local' }, { type:'VOTE',option:1 }, { type:'REACTION',id:'MSG-1' }, { type:'CLOSE_POLL' }, { type:'POLICY_NEXT' }, { type:'INCIDENT_NEXT' }, { type:'SESSION',state:'expired' }, { type:'PROFILE',state:'recovery' }, { type:'BUYBACK_NEXT' });
  assert.deepEqual(demoReducer(s,{type:'RESET'}), initial);
  assert.notEqual(createInitialState().operations, initial.operations);
});
test('pure reducer and shared scenario have exactly-once commitments, results and correction', () => {
  const initial = createInitialState(); const snapshot = JSON.stringify(initial);
  let s=tick(initial,2); assert.equal(s.treasury.committed,2300);
  s=tick(s); assert.equal(s.treasury.committed,2000);
  s=tick(s); assert.equal(s.operations[1].status,'uncertain'); assert.equal(s.treasury.committed,2000);
  s=tick(s,2); assert.equal(s.treasury.committed,0); assert.equal(s.treasury.assets,100080);
  s=tick(s,2); assert.equal(s.treasury.assets,100075); assert.equal(s.treasury.transit,0); assert.equal(s.operations[1].result,-35);
  const after=tick(s); assert.equal(after.treasury.assets,s.treasury.assets);
  assert.equal(JSON.stringify(initial),snapshot);
  assert.ok(s.publicEvents.some(e=>e.status==='rejected'));
  assert.ok(s.publicEvents.some(e=>e.text[1].includes('correction')));
});
test('receive and external onramp credit only confirmed net USDC once, without service fees', () => {
  let s=review(createInitialState(),'onramp',10);
  const id=s.movements[0].id;
  assert.equal(s.usdc,1200);assert.equal(s.movements[0].fee,0);
  s=demoReducer(s,{type:'AUTHORIZE_MOVEMENT',id}); assert.equal(s.usdc,1200);
  s=demoReducer(s,{type:'RESOLVE_MOVEMENT',id}); assert.equal(s.usdc,1209.5);
  assert.deepEqual(demoReducer(s,{type:'RESOLVE_MOVEMENT',id}),s);
  s=complete(s,'receive',10);assert.equal(s.usdc,1219.5);
});
test('official swap credits BETTEX once; price to treasury, single fee to separate operating wallet', () => {
  let s=tick(createInitialState(),2);assert.equal(currentWeight(s),20000);
  s=complete(s,'swap',20);
  assert.equal(s.usdc,1177.5);assert.equal(s.bettex,11000);
  assert.equal(s.treasury.operating,2.5);assert.equal(s.treasury.assets,100020);
  assert.equal(s.buyback.burned,0);assert.equal(currentWeight(s),20000);
  s=tick(s);assert.equal(currentWeight(s),31000);
});
test('invalid destinations, nonpositive amounts, expired quotes and concurrent balance requests fail explicitly', () => {
  assert.ok(review(createInitialState(),'send',1,'success','0x1234').error);
  assert.ok(review(createInitialState(),'swap',0).error);
  let s=review(createInitialState(),'swap',1000);const id=s.movements[0].id;
  s=tick(s,3);s=demoReducer(s,{type:'AUTHORIZE_MOVEMENT',id});
  assert.ok(s.error);assert.equal(s.usdc,1200);
  s=review(createInitialState(),'swap',1000);const first=s.movements[0].id;
  s=review(s,'swap',1000);const second=s.movements[0].id;
  s=demoReducer(s,{type:'AUTHORIZE_MOVEMENT',id:first});assert.equal(reservedUSDC(s),1002.5);
  s=demoReducer(s,{type:'AUTHORIZE_MOVEMENT',id:second});assert.ok(s.error);assert.equal(s.movements[0].status,'rejected');
});
test('failure has no presumed charge or refund; uncertainty preserves reservations until evidence', () => {
  let s=review(createInitialState(),'send',100,'uncertain');
  const id=s.movements[0].id;
  s=demoReducer(s,{type:'AUTHORIZE_MOVEMENT',id});
  assert.equal(reservedBETTEX(s),100);assert.equal(reservedUSDC(s),3);
  assert.equal(s.bettex,10000);
  assert.deepEqual(demoReducer(s,{type:'RESOLVE_MOVEMENT',id}),s);
  s=demoReducer(s,{type:'RESOLVE_MOVEMENT',id,received:false});
  assert.equal(reservedBETTEX(s),0);assert.equal(s.bettex,10000);assert.equal(s.treasury.operating,0);
  s=review(s,'swap',20,'failure');const next=s.movements[0].id;
  s=reduce(s,{type:'AUTHORIZE_MOVEMENT',id:next},{type:'RESOLVE_MOVEMENT',id:next});
  assert.equal(s.usdc,1200);assert.equal(s.movements[0].status,'failed');
});
test('any partial BETTEX exit cancels assessed and authorized unpaid rights, all prior weight, but not received USDC', () => {
  for(const authorized of [false,true]) {
    let s=assess();const id=s.rounds[0].id;
    if(authorized)s=demoReducer(s,{type:'AUTHORIZE_ROUND',id});
    assert.ok(s.rounds[0].netPersonal>0);
    s=complete(s,'send',1);
    assert.equal(s.rounds[0].status,'cancelled');assert.equal(currentWeight(s),0);
    assert.equal(s.participationRevision,1);assert.equal(s.bettex,9999);
    assert.equal(demoReducer(s,{type:'PAY_ROUND',id}).usdc,s.usdc);
    assert.equal(currentWeight(tick(s)),9999);
  }
  let s=payout(assess());const received=s.receivedYield;
  s=complete(s,'send',100);assert.equal(s.receivedYield,received);assert.equal(s.rounds[0].status,'paid');
});
test('distribution respects entity taxes, reserve/liquidity and quantity-time formula before net personal receipt', () => {
  let s=assess();const r=s.rounds[0];
  assert.equal(s.clock,24);assert.equal(r.utcDay,0);assert.equal(r.weight,240000);
  assert.equal(r.gross,95);assert.equal(r.eligible,r.gross-r.costs-r.entityTax);
  assert.equal(r.buyback,r.eligible*.25);assert.ok(Math.abs(r.treasury-r.fraction-r.eligible*.5)<1e-8);
  assert.ok(Math.abs(r.staking+r.fraction-r.eligible*.25)<1e-8);
  assert.equal(r.grossPersonal,Math.floor((r.eligible/4)*r.weight/r.totalWeight*100)/100);
  assert.equal(s.usdc,1200);
  s=payout(s);assert.equal(s.usdc,1200+r.netPersonal);assert.equal(s.receivedYield,r.netPersonal);
  const id=r.id;
  assert.deepEqual(demoReducer(s,{type:'PAY_ROUND',id}),s);
});
test('zero weight, reserve failure and permanent loss never apply split or create deferred credits', () => {
  for(const scenario of ['zero','reserve','loss'] as const) {
    const s=assess(scenario); const r=s.rounds[0];
    assert.equal(r.staking,0);assert.equal(r.buyback,0);assert.equal(r.grossPersonal,0);
    assert.equal(r.treasury,Math.max(0,r.eligible));assert.equal(s.buyback.wallet,1000);
    assert.equal(payout(s).usdc,1200);
    if(scenario==='loss')assert.ok(s.treasury.assets<100000);
  }
});
test('daily UTC weights reset, independent rounds never reopen or reuse earlier profit', () => {
  const s=assess();const duplicate=demoReducer(s,{type:'ASSESS_ROUND',scenario:'profit'});
  assert.ok(duplicate.error);assert.equal(duplicate.rounds.length,1);
  let next=tick(s);assert.equal(currentWeight(next),10000);
  next=demoReducer(next,{type:'ASSESS_ROUND',scenario:'zero'});
  assert.equal(next.rounds.length,2);assert.equal(next.rounds[0].utcDay,1);
  assert.equal(next.rounds[0].weight,0);assert.equal(next.rounds[0].gross,100);
  const rollover=tick(createInitialState(),24);assert.equal(currentWeight(rollover),0);
});
test('unexecutable fractions return to treasury without carry; closing releases all unpaid obligations', () => {
  let s=assess('fraction');const r=s.rounds[0];assert.equal(r.grossPersonal,0);assert.equal(r.fraction,.004);
  assert.equal(s.usdc,1200);assert.equal(r.totalWeight,r.eligible/4*r.weight/.004);
  s=demoReducer(s,{type:'CLOSE_ROUND',id:r.id});assert.equal(s.treasury.obligations,3000);
  assert.equal(s.rounds[0].remainingObligation,0);assert.equal(payout(s).usdc,1200);
});
test('uncertain payout can reconcile once, never resend; closed or cancelled rounds cannot gain new credit', () => {
  let s=payout(assess('uncertain'));const id=s.rounds[0].id;
  assert.equal(s.rounds[0].status,'uncertain');assert.equal(s.usdc,1200);
  const paid=demoReducer(s,{type:'RECONCILE_ROUND',id});assert.ok(paid.usdc>1200);
  assert.deepEqual(demoReducer(paid,{type:'RECONCILE_ROUND',id}),paid);
  s=demoReducer(s,{type:'CLOSE_ROUND',id});const obligations=s.treasury.obligations;
  assert.ok(obligations>3000);assert.equal(s.rounds[0].remainingObligation,s.rounds[0].grossPersonal);
  s=demoReducer(s,{type:'RECONCILE_ROUND',id});assert.equal(s.usdc,1200);assert.equal(s.treasury.obligations,3000);assert.equal(s.rounds[0].status,'closed');
});
test('USDC yield withdrawal charges single service fee and does not cancel participation', () => {
  let s=payout(assess());const weight=currentWeight(s), revision=s.participationRevision;
  const amount=s.receivedYield;assert.ok(amount>3);
  const usdc=s.usdc;
  s=complete(s,'withdraw',amount);
  assert.equal(s.usdc,Math.round((usdc-amount)*100)/100);assert.equal(s.receivedYield,0);
  assert.equal(s.movements[0].fee,2.5);assert.equal(s.treasury.operating,2.5);
  assert.equal(s.participationRevision,revision);assert.equal(currentWeight(s),weight);
});
test('policy changes wait 24h with competent approval; participant polls cannot control investments', () => {
  let s=reduce(createInitialState(),{type:'POLICY_NEXT'},{type:'POLICY_NEXT'});
  assert.equal(s.policy.signatures,2);assert.equal(s.policy.version,1);
  s=demoReducer(s,{type:'POLICY_NEXT'});assert.ok(s.error);
  s=tick(s,24);s=demoReducer(s,{type:'POLICY_NEXT'});assert.equal(s.policy.version,2);
  const op=structuredClone(s.operations);
  s=reduce(s,{type:'VOTE',option:0},{type:'VOTE',option:1},{type:'MESSAGE',text:'Buy now'});
  assert.deepEqual(s.operations,op);assert.deepEqual(s.poll.votes,[19,12,7]);
  s=reduce(s,{type:'INCIDENT_NEXT'});assert.equal(s.policy.paused,true);
  s=reduce(s,{type:'INCIDENT_NEXT'},{type:'INCIDENT_NEXT'});assert.equal(s.policy.paused,false);
});
test('exclusive buyback accumulates, checks costs, buys then permanently burns all acquired tokens once', () => {
  let s=createInitialState();
  for(let i=0;i<4;i++)s=demoReducer(s,{type:'BUYBACK_NEXT'});
  assert.equal(s.buyback.wallet,180);assert.equal(s.buyback.burned,40000);assert.equal(s.buyback.acquired,0);
  assert.equal(s.bettex,10000);assert.equal(s.treasury.assets,100000);assert.equal(s.treasury.operating,0);
  assert.deepEqual(demoReducer(s,{type:'BUYBACK_NEXT'}),s);
});
test('session expiry blocks movement authorization, not automatic BETTEX eligibility', () => {
  let s=review(createInitialState(),'swap',20);const id=s.movements[0].id;
  s=demoReducer(s,{type:'SESSION',state:'expired'});
  assert.ok(demoReducer(s,{type:'AUTHORIZE_MOVEMENT',id}).error);
  s=tick(s);assert.equal(currentWeight(s),10000);
});
test('treasury available excludes obligations and commitments; personal deposit is never project capital', () => {
  const s=createInitialState();assert.equal(treasuryAvailable(s),69000);
  const received=complete(s,'receive',500);assert.deepEqual(received.treasury,s.treasury);
});
test('midnight assessment belongs to the finished UTC day and preserves only that daily weight', () => {
  let s=tick(createInitialState(),24);
  assert.equal(currentWeight(s),0);assert.equal(s.roundWeights[0],240000);
  s=demoReducer(s,{type:'ASSESS_ROUND',scenario:'profit'});
  assert.equal(s.rounds[0].utcDay,0);assert.equal(s.rounds[0].weight,240000);
  let next=tick(s,24);next=demoReducer(next,{type:'ASSESS_ROUND',scenario:'profit'});
  assert.equal(next.rounds[0].utcDay,1);assert.equal(next.rounds[0].weight,240000);
  assert.equal(next.clock,48);
});
test('reserve failure appears consistently in treasury; replenishment does not reopen the rejected round', () => {
  let s=assess('reserve');const r=s.rounds[0];
  assert.ok(s.treasury.reserve<s.treasury.requiredReserve);assert.ok(s.treasury.transit>0);
  s=demoReducer(s,{type:'RECONCILE_RESERVE'});
  assert.ok(s.treasury.reserve>=s.treasury.requiredReserve);assert.equal(s.treasury.transit,0);
  assert.equal(s.rounds[0].reservesPass,false);assert.equal(s.rounds[0].staking,0);
  s=tick(s);s=demoReducer(s,{type:'ASSESS_ROUND',scenario:'profit'});
  assert.equal(s.rounds[0].reservesPass,true);assert.ok(s.rounds[0].staking>0);
  assert.equal(s.rounds[1].id,r.id);assert.equal(s.rounds[1].staking,0);
});
test('incident pauses new execution but continues already-started reconciliation', () => {
  let s=tick(createInitialState(),3);
  s=demoReducer(s,{type:'INCIDENT_NEXT'});s=tick(s,5);
  assert.equal(s.step,8);assert.equal(s.treasury.committed,0);
});
test('a quote keeps its original timestamp after review; review does not silently renew it', () => {
  let s=tick(createInitialState());
  s=demoReducer(s,{type:'REVIEW_MOVEMENT',kind:'swap',amount:20,destination:'SAMPLE-WALLET-OWN',outcome:'success',quoteAt:0});
  s=tick(s,2);s=demoReducer(s,{type:'AUTHORIZE_MOVEMENT',id:s.movements[0].id});
  assert.equal(s.movements[0].status,'rejected');assert.equal(s.usdc,1200);
});
test('insufficient liquidity uses real in-memory transit amounts, blocks split, and never releases earlier profit', () => {
  let s=assess('liquidity');const r=s.rounds[0];
  assert.equal(r.liquidityPass,false);assert.equal(r.staking,0);assert.equal(r.treasury,r.eligible);
  assert.ok(s.treasury.liquidityTransit>0);assert.equal(s.treasury.transit,s.treasury.liquidityTransit);
  const assets=s.treasury.assets;
  s=demoReducer(s,{type:'RECONCILE_LIQUIDITY'});assert.equal(s.treasury.transit,0);assert.equal(s.treasury.assets,assets);
  assert.equal(s.rounds[0].staking,0);assert.equal(s.usdc,1200);
  assert.ok(treasuryAvailable(s)>r.eligible);assert.deepEqual(demoReducer(s,{type:'RECONCILE_LIQUIDITY'}),s);
});
test('a pause before submission requires a fresh proposal version without double reservation', () => {
  let s=tick(createInitialState(),2);s=demoReducer(s,{type:'INCIDENT_NEXT'});
  s=tick(s,5);assert.equal(s.step,2);assert.equal(s.treasury.committed,2300);
  s=reduce(s,{type:'INCIDENT_NEXT'},{type:'INCIDENT_NEXT'});s=tick(s);
  assert.equal(s.step,3);assert.equal(s.treasury.committed,2000);
  assert.equal(s.operations[0].version,2);assert.ok(s.operations[0].quoteUntil>=s.clock);
});