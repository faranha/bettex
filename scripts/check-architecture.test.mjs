import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { inspectArchitecture } from './check-architecture.mjs';

const prefix = 'artifacts/api-server/src/';
function inspect(t, sources, checkDocuments = false) {
  const root = mkdtempSync(path.join(tmpdir(), 'bettex-architecture-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [file, source] of Object.entries(sources)) {
    const target = path.join(root, prefix, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, source);
  }
  return inspectArchitecture(root, { checkDocuments });
}

test('accepts own domain/application imports and approved public dependencies', t => {
  const result = inspect(t, {
    'modules/ledger/domain/amount.ts': 'export const amount = 1n;',
    'modules/ledger/index.ts': 'export { amount } from "./domain/amount.ts";',
    'modules/risk/application/authorize.ts': 'import { amount } from "../../ledger/index.ts"; export const limit = amount;',
  });
  assert.deepEqual(result.issues, []);
  assert.equal(result.modularFiles, 3);
});

const cases = [
  ['internal cross-module import', 'modules/risk/application/check.ts', 'import "../../ledger/domain/model.ts";',
    { 'modules/ledger/domain/model.ts': 'export {};' }, 'internos'],
  ['agent accessing wallet', 'modules/agents/application/propose.ts', 'import "../../wallets/index.ts";',
    { 'modules/wallets/index.ts': 'export {};' }, 'domínio não permitida'],
  ['domain accessing another domain', 'modules/risk/domain/check.ts', 'import "../../ledger/index.ts";',
    { 'modules/ledger/index.ts': 'export {};' }, 'domínio não permitida'],
  ['domain importing database', 'modules/ledger/domain/model.ts', 'import { db } from "@workspace/db";', {}, 'fornecedor'],
  ['application importing AI vendor', 'modules/agents/application/propose.ts', 'import Anthropic from "@anthropic-ai/sdk";', {}, 'fornecedor'],
  ['application importing infrastructure', 'modules/accounts/application/profile.ts', 'import "../infrastructure/store.ts";',
    { 'modules/accounts/infrastructure/store.ts': 'export {};' }, 'camadas'],
  ['public facade exporting infrastructure', 'modules/accounts/index.ts', 'export * from "./infrastructure/store.ts";',
    { 'modules/accounts/infrastructure/store.ts': 'export {};' }, 'camadas'],
  ['computed dynamic dependency', 'modules/agents/application/propose.ts', 'const target = "x"; import(target);', {}, 'dinâmica'],
  ['require bypass', 'modules/ledger/domain/model.ts', 'const db = require("@workspace/db");', {}, 'fornecedor'],
  ['type-only internal import', 'modules/risk/application/check.ts', 'type Amount = import("../../ledger/domain/model.ts").Amount;',
    { 'modules/ledger/domain/model.ts': 'export type Amount = bigint;' }, 'internos'],
  ['unregistered domain', 'modules/misc/domain/model.ts', 'export {};', {}, 'não registrado'],
  ['business rule in generic folder', 'lib/new-business.ts', 'export const approve = () => true;', {}, 'genérico'],
  ['module importing legacy', 'modules/accounts/application/profile.ts', 'import "../../../lib/demo-state.ts";',
    { 'lib/demo-state.ts': 'export {};' }, 'legado'],
  ['namespace exposing all tables', 'modules/ledger/infrastructure/store.ts', 'import * as database from "@workspace/db";', {}, 'schemas'],
  ['named table from global database export', 'modules/accounts/infrastructure/store.ts', 'import { db, demoAccounts } from "@workspace/db";', {}, 'schemas'],
  ['dynamic global database import', 'modules/ledger/infrastructure/store.ts', 'const database = import("@workspace/db");', {}, 'schemas'],
];
for (const [label, file, source, other, expected] of cases) {
  test(`rejects ${label}`, t => {
    const result = inspect(t, { ...other, [file]: source });
    assert.ok(result.issues.some(issue => issue.includes(expected)), result.issues.join('\n'));
  });
}

test('detects cycles even within one domain', t => {
  const result = inspect(t, {
    'modules/ledger/domain/a.ts': 'import "./b.ts";',
    'modules/ledger/domain/b.ts': 'import "./a.ts";',
  });
  assert.ok(result.issues.some(issue => issue.includes('ciclo')));
});

test('permits the explicitly registered legacy without claiming modularization', t => {
  const result = inspect(t, { 'lib/demo-state.ts': 'export {};', 'lib/logger.ts': 'export {};' });
  assert.deepEqual(result.issues, []);
  assert.equal(result.legacyFiles, 2);
  assert.equal(result.modularFiles, 0);
});

test('allows database connection without exporting tables across contexts', t => {
  const result = inspect(t, { 'modules/ledger/infrastructure/store.ts': 'import { db as connection } from "@workspace/db";' });
  assert.deepEqual(result.issues, []);
});

test('requires canonical documents', t => {
  const result = inspect(t, {}, true);
  assert.equal(result.issues.filter(issue => issue.includes('documento canônico ausente')).length, 3);
});