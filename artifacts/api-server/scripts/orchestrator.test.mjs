import { test } from "node:test";
import assert from "node:assert/strict";
import { seedEngine } from "../src/lib/demo-state.ts";
import { createProposalOperation, eligibility, orchestratorBudget, progressOrchestration, proposalScore } from "../src/lib/orchestrator.ts";

const now = Date.UTC(2026, 9, 5, 10);
const emit = () => {};
const empty = () => { const e = seedEngine(now); e.operations = []; return e; };
const advance = (e, n) => { e.sequence++; progressOrchestration(e, now + n * 6000, emit); };

test("specific stored proposals expose crypto quantities and three fictional match moves", () => {
  const crypto = createProposalOperation("C", "crypto", 250, now);
  assert.equal(crypto.proposal.legs[0].instrument, "BTC/USDC");
  assert.ok(crypto.proposal.legs[0].quantity > 0 && crypto.proposal.legs[0].quantity < .01);
  const sports = createProposalOperation("S", "sports", 120, now);
  assert.equal(sports.proposal.homeTeam, "Aurora FC");
  assert.deepEqual(sports.proposal.legs.map(l => l.selection), ["home", "draw", "away"]);
  assert.equal(eligibility(sports, empty(), now), null);
  assert.ok(Math.abs(sports.proposal.legs.reduce((s,l) => s + l.amountUsdc, 0) + sports.proposal.feesUsdc - 120) < .00001);
});
test("comparison selects the highest eligible score, not first arrival", () => {
  const e = empty();
  e.operations = [createProposalOperation("C", "crypto", 250, now), createProposalOperation("S", "sports", 120, now)];
  advance(e, 1); assert.ok(e.operations.every(o => o.status === "analyzing"));
  advance(e, 2); assert.ok(e.operations.every(o => o.status === "comparing"));
  advance(e, 3);
  assert.ok(proposalScore(e.operations[1]) > proposalScore(e.operations[0]));
  assert.equal(e.operations[1].status, "approved");
  assert.equal(e.operations[0].status, "comparing");
  assert.deepEqual(e.operations[1].assessment.comparedWith, ["C"]);
  assert.equal(orchestratorBudget(e).reservedUsdc, 120);
});
test("budget includes reserved approvals and cannot be oversubscribed", () => {
  const e = empty(); e.treasury.assetsUsdc = 1000; e.treasury.reserveUsdc = 200;
  e.operations = Array.from({length:8}, (_,i) => ({...createProposalOperation(`O${i}`, i % 2 ? "sports" : "crypto", 80, now), status:"approved"}));
  const candidate = {...createProposalOperation("N", "bonus", 80, now),status:"comparing"};
  e.operations.push(candidate);
  assert.equal(orchestratorBudget(e).availableUsdc,160);
  advance(e, 1);
  assert.equal(candidate.status,"approved");
  assert.equal(orchestratorBudget(e).reservedUsdc,720);
  const next = {...createProposalOperation("N2","bonus",80,now),status:"comparing"};
  e.operations.push(next); advance(e,2);
  assert.equal(next.status,"approved");
  assert.equal(orchestratorBudget(e).availableUsdc,0);
  const blocked = {...createProposalOperation("B","predictions",80,now),status:"comparing"};
  e.operations.push(blocked); advance(e,3);
  assert.equal(blocked.status,"awaiting_budget");
  assert.equal(orchestratorBudget(e).availableUsdc,0);
});
test("invalid, stale, unprofitable and oversized suggestions are not approved", () => {
  const e = empty(), op = createProposalOperation("X","crypto",250,now);
  assert.equal(eligibility({...op,proposal:undefined},e,now),"missing_data");
  assert.equal(eligibility({...op,capitalUsdc:Infinity},e,now),"invalid_proposal");
  assert.equal(eligibility(op,e,now+600001),"expired_quote");
  assert.equal(eligibility(createProposalOperation("BAD","sports",120,now,true),e,now),"non_positive_estimate");
  assert.equal(eligibility(createProposalOperation("BIG","crypto",19000,now),e,now),"allocation_limit");
  e.operations = [{...op,proposal:undefined,status:"analyzing"}]; advance(e,1);
  assert.equal(e.operations[0].status,"awaiting_data");
});
test("reserve stays locked through result and reconciliation; net result is booked once", () => {
  const e = empty(), op = {...createProposalOperation("A","crypto",250,now),status:"approved"};
  e.operations=[op]; const start = e.treasury.realizedUsdc;
  advance(e,1); assert.equal(op.status,"executing");
  advance(e,2); assert.equal(op.status,"open");
  advance(e,3); assert.equal(op.status,"result");
  assert.equal(e.treasury.realizedUsdc,start);
  advance(e,4); assert.equal(op.status,"reconciling");
  assert.equal(orchestratorBudget(e).reservedUsdc,250);
  advance(e,5); assert.equal(op.status,"closed");
  assert.equal(orchestratorBudget(e).reservedUsdc,0);
  const settled = e.treasury.realizedUsdc;
  assert.ok(Math.abs(settled - start - (op.pnlUsdc-op.proposal.feesUsdc)) < .00001);
  advance(e,6); assert.equal(e.treasury.realizedUsdc,settled);
});
test("equal scores prefer earlier validity, and expired approvals release their reservation", () => {
  const e = empty();
  const a = {...createProposalOperation("A","crypto",250,now),status:"comparing"};
  const b = {...createProposalOperation("B","crypto",250,now),status:"comparing"};
  b.proposal.validUntil = new Date(now+60000).toISOString();
  e.operations=[a,b]; advance(e,1); assert.equal(b.status,"approved");
  progressOrchestration(e,now+61000,emit); assert.equal(b.status,"expired");
  assert.equal(orchestratorBudget(e).reservedUsdc,250); // A wins the freed capital.
});