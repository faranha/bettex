import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ACTIVE_AGENT_IDS, CONTROL_IDS, INACTIVE_IDS, defaultSelection, idsForScope, inScope, roleOf, scopeItems } from './roles.ts';

test('BETTEX is independent from agents and control services', () => {
  assert.deepEqual(idsForScope('orchestrator'), ['bettex']);
  assert.equal(roleOf('bettex'), 'orchestrator');
  assert.equal(defaultSelection('agents'), 'predictions');
  assert.equal(inScope('agents', 'bettex'), false);
});
test('ALFA agent jobs contain only Prediction Markets and its three specialists', () => {
  assert.deepEqual(ACTIVE_AGENT_IDS, ['predictions', 'btc', 'eth', 'sol']);
  for (const id of [...CONTROL_IDS, ...INACTIVE_IDS]) assert.equal(inScope('agents', id), false);
  const workers = ['bettex', ...ACTIVE_AGENT_IDS, ...CONTROL_IDS, ...INACTIVE_IDS].map(id => ({ id }));
  assert.deepEqual(scopeItems('agents', workers).map(w => w.id), [...ACTIVE_AGENT_IDS]);
  assert.deepEqual(scopeItems('controls', workers).map(w => w.id), [...CONTROL_IDS]);
});
test('ALFA layout places orchestration before individual jobs and controls separately', () => {
  const source = readFileSync(new URL('../alpha-trading/AlphaTradingPanel.tsx', import.meta.url), 'utf8');
  assert.ok(source.indexOf('scope="orchestrator"') < source.indexOf('scope="agents"'));
  assert.ok(source.indexOf('scope="agents"') < source.indexOf('scope="controls"'));
  const dashboard = readFileSync(new URL('./AgentOperationsDashboard.tsx', import.meta.url), 'utf8');
  assert.ok(dashboard.includes('!isCtl && <AgentReasoningPanel'));
  assert.ok(dashboard.includes('inScope(scope, r.agentId)'));
});
