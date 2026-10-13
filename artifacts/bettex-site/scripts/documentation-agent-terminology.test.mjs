import assert from 'node:assert/strict';
import { test } from 'node:test';
import { documentationAgentTerminology as terms, isDocumentationPath } from '../src/lib/documentation-agent-terminology.ts';

test('central agent stays distinct from specialized subagents in all languages', () => {
  assert.equal(terms('Agente BETTEX coordena agentes de risco. Agente de governança.', 'pt'),
    'Agente BETTEX coordena subagentes de risco. Subagente de governança.');
  assert.equal(terms('BETTEX AI coordinates agents. Risk agent and governance agent.', 'en'),
    'BETTEX agent coordinates subagents. Risk subagent and governance subagent.');
  assert.equal(terms('La IA BETTEX coordina agentes. Agente de riesgo.', 'es'),
    'El agente BETTEX coordina subagentes. Subagente de riesgo.');
});

test('normalization is idempotent and preserves spacing, amounts and identifiers', () => {
  for (const language of ['pt', 'en', 'es']) {
    const source = '  BETTEX · 50% / 25% / 25% · USDC · documentacao-agentes · agentes agents  ';
    const once = terms(source, language);
    assert.equal(terms(once, language), once);
    assert.ok(once.startsWith('  ') && once.endsWith('  '));
    assert.ok(once.includes('50% / 25% / 25% · USDC · documentacao-agentes'));
  }
});

test('central agent labels and their articles never duplicate the word agent', () => {
  assert.equal(terms('Tesouraria conectada ao agente de IA BETTEX; análises da IA BETTEX.', 'pt'),
    'Tesouraria conectada ao agente BETTEX; análises do agente BETTEX.');
  assert.equal(terms('BETTEX AI agent', 'en'), 'BETTEX agent');
  assert.equal(terms('Agente de IA BETTEX', 'es'), 'Agente BETTEX');
});

test('agent agreement is masculine, while intelligence agreement stays feminine', () => {
  assert.equal(terms('A IA BETTEX será desenvolvida. Sua inteligência será desenvolvida.', 'pt'),
    'O agente BETTEX será desenvolvido. Sua inteligência será desenvolvida.');
  assert.equal(terms('IA BETTEX · orquestradora', 'pt'), 'agente BETTEX · orquestrador');
  assert.equal(terms('IA BETTEX · orquestadora', 'es'), 'agente BETTEX · orquestador');
});

test('terminology applies only to documentation routes, including artifact prefixes', () => {
  for (const path of ['/documentacao', '/en/documentation/', '/es/documentacion#documentacao-agentes', '/bettex/documentacao']) {
    assert.equal(isDocumentationPath(path), true);
  }
  for (const path of ['/', '/pitch', '/en/pitch', '/app', '/app/documentacao-extra']) {
    assert.equal(isDocumentationPath(path), false);
  }
});
