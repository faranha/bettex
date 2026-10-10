import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '../src/components/demo');
const files = fs.readdirSync(root).filter(f => /\.(ts|tsx)$/.test(f) && !f.endsWith('.test.ts')).map(f => path.join(root, f));
const interfaceRoot = path.resolve(root, '../interface-demo');
files.push(...fs.readdirSync(interfaceRoot).filter(f => /\.(ts|tsx)$/.test(f)).map(f => path.join(interfaceRoot, f)));
files.push(path.resolve(root, '../../pages/demo.tsx'));
files.push(path.resolve(root, '../../pages/auth.tsx'));
files.push(path.resolve(root, '../history/WalletStatement.tsx'));
for (const file of ['RoundHistory.tsx', 'RoundFacts.tsx', 'RoundTabs.tsx', 'RoundPositions.tsx']) {
  files.push(path.resolve(root, '../history', file));
}
files.push(path.resolve(root, '../app/AppHeader.tsx'));
for (const file of ['wallet-history-model.ts', 'wallet-history-export.ts', 'wallet-history-examples.ts', 'use-wallet-history.ts', 'history-pagination.ts']) {
  files.push(path.resolve(root, '../history', file));
}
const accountRoot = path.resolve(root, '../account');
files.push(...fs.readdirSync(accountRoot).filter(f => /\.(ts|tsx)$/.test(f)).map(f => path.join(accountRoot, f)));
const tradingRoot = path.resolve(root, '../alpha-trading');
files.push(...fs.readdirSync(tradingRoot).filter(f => /\.(ts|tsx)$/.test(f)).map(f => path.join(tradingRoot, f)));
const simulationRoot = path.resolve(root, '../simulation');
files.push(...fs.readdirSync(simulationRoot).filter(f => /\.(ts|tsx)$/.test(f) && !f.endsWith('.test.ts')).map(f => path.join(simulationRoot, f)));
const operationsRoot = path.resolve(root, '../agent-operations');
files.push(...fs.readdirSync(operationsRoot).filter(f => /\.(ts|tsx)$/.test(f)).map(f => path.join(operationsRoot, f)));
const liveMarketsRoot = path.resolve(root, '../live-markets');
files.push(...fs.readdirSync(liveMarketsRoot).filter(f => /\.(ts|tsx)$/.test(f)).map(f => path.join(liveMarketsRoot, f)));
const failures = [];
let tuples = 0;
const universal = /^(?:[\d\s.,%+\-–—×÷=:$€£/()[\]<>→·•…✓✗]+|(?:·\s*)?x\s*·\s*y\s*=\s*k(?:\s*·)?|2X|BETTEX|USDC|BTC|ETH|SOL|Hydra|BETTEX Bank:|Live Trading|Tokenomics|UTC|SAMPLE[-_A-Z0-9]*|ILLUSTRATIVE-NOT-A-CREDENTIAL)$/;
// SI units, hierarchy entities and stable example policy IDs are not prose.
// JSX may split a machine identifier around an interpolated version number.
const protocolText = /^(?:demo-policy-|-effective-\d+|:\s*demo-policy-v\d+\s*\/\s*demo-strategy-v\d+)$/;
const neutral = text => universal.test(text) || protocolText.test(text) || /^(?:ID|Hash):$/.test(text) || !/[A-Za-zÀ-ÿ]/.test(text.replace(/&(?:gt|lt);|\b(?:USD|BRL|USDC|BETTEX|BTC|ETH|SOL|UTC|D|T|h|s|ms|v)\b|\b\d+h\b|São Paulo|T\+/g, ''));
const forbidden = new Set(['generateKey', 'signTransaction', 'signMessage']);
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.tsx')) assert.ok(raw.startsWith('/** @jsxImportSource react */'), `Demo JSX must use its isolated locale runtime: ${file}`);
  const source = ts.createSourceFile(file, raw, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function report(node, message) {
    failures.push(`${path.basename(file)}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}: ${message}`);
  }
  function walk(node) {
    if (file === path.join(operationsRoot, 'copy.ts') && ts.isArrayLiteralExpression(node) &&
      node.elements.every(e => ts.isStringLiteral(e))) {
      const owner = ts.isAsExpression(node.parent) ? node.parent.parent : node.parent;
      if (!(ts.isVariableDeclaration(owner) && owner.name.getText(source) === 'IDS')) {
        tuples++;
        if (node.elements.length !== 3 || node.elements.some(e => !e.text.trim())) report(node, 'Agent copy must provide non-empty PT, EN, ES tuples.');
      }
    }
    if (ts.isIdentifier(node) && forbidden.has(node.text)) {
      let owner = node.parent;
      while (owner && !ts.isFunctionDeclaration(owner)) owner = owner.parent;
      // Approved isolated native-test signer, not a general demo-wallet exception.
      const localPurposeSigner = node.text === 'signTransaction'
        && file === path.join(accountRoot, 'wallet-vault.ts')
        && ['signPersonalTestPurchase', 'signPersonalTestWithdrawal'].includes(owner?.name?.text)
        && owner.getText(source).includes('draft.chainId !== 31337');
      // AES-GCM device encryption only, not a transaction-signing or custody exemption.
      const deviceEncryptionKey = node.text === 'generateKey'
        && file === path.join(accountRoot, 'device-wallet-store.ts')
        && owner?.name?.text === 'createOrRead'
        && ts.isCallExpression(node.parent.parent)
        && node.parent.parent.expression.getText(source) === 'crypto.subtle.generateKey'
        && node.parent.parent.arguments[0]?.getText(source).includes("'AES-GCM'")
        && node.parent.parent.arguments[1]?.getText(source) === 'false';
      if (!localPurposeSigner && !deviceEncryptionKey) report(node, `Forbidden real wallet operation: ${node.text}`);
    }
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
console.log(`Demo: ${tuples} explicit PT/EN/ES translation calls; isolated JSX, no untranslated text nodes or direct key/signing APIs in UI.`);