import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '../src/components/demo');
const files = fs.readdirSync(root).filter(f => /\.(ts|tsx)$/.test(f) && !f.endsWith('.test.ts')).map(f => path.join(root, f));
files.push(path.resolve(root, '../../pages/demo.tsx'));
const failures = [];
let tuples = 0;
const universal = /^(?:[\d\s.,%+\-–—×÷=:$€£/()[\]<>→·•…✓✗]+|BETTEX|USDC|Hydra|BETTEX Bank:|Live Trading|Tokenomics|UTC|SAMPLE[-_A-Z0-9]*|ILLUSTRATIVE-NOT-A-CREDENTIAL)$/;
const neutral = text => universal.test(text) || !/[A-Za-zÀ-ÿ]/.test(text.replace(/\b(?:USDC|BETTEX|UTC|D|T|h|v)\b|T\+/g, ''));
const forbidden = new Set(['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'localStorage', 'sessionStorage', 'indexedDB', 'generateKey', 'getRandomValues', 'signTransaction', 'signMessage']);
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.tsx')) assert.ok(raw.startsWith('/** @jsxImportSource react */'), `Demo JSX must use its isolated locale runtime: ${file}`);
  const source = ts.createSourceFile(file, raw, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function report(node, message) {
    failures.push(`${path.basename(file)}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}: ${message}`);
  }
  function walk(node) {
    if (ts.isIdentifier(node) && forbidden.has(node.text)) report(node, `Forbidden real operation or persistence: ${node.text}`);
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && ['x', 'tr'].includes(node.expression.text)) {
      tuples++;
      if (node.arguments.length !== 3 || node.arguments.some(a => !ts.isStringLiteral(a) && !ts.isTemplateExpression(a) && !ts.isNoSubstitutionTemplateLiteral(a))) report(node, 'Translation must explicitly provide PT, EN, ES.');
      else for (const a of node.arguments) if (!a.getText(source).slice(1,-1).trim()) report(node, 'Empty translation.');
    }
    if (ts.isJsxText(node)) {
      const text = node.text.trim();
      if (text && !neutral(text)) report(node, `Untranslated JSX text: ${text}`);
    }
    if (ts.isJsxAttribute(node) && ['title','placeholder','aria-label','alt'].includes(node.name.getText(source)) && node.initializer && ts.isStringLiteral(node.initializer) && !neutral(node.initializer.text)) report(node, `Untranslated attribute: ${node.initializer.text}`);
    ts.forEachChild(node, walk);
  }
  walk(source);
}
assert.ok(tuples > 100, 'Demo localization coverage unexpectedly missing.');
assert.deepEqual(failures, [], failures.join('\n'));
console.log(`Demo: ${tuples} explicit PT/EN/ES translation calls; isolated JSX, no untranslated text nodes, no real financial calls or account persistence.`);