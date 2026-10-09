import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../src');
const keys = new Set();
const templates = new Set();
const normalize = value => value.replace(/\s+/g, ' ').trim();
function add(value) {
  value = normalize(value);
  if (/^--[a-z\d_-]+$/i.test(value)) return; // CSS custom-property names are not copy.
  if (!value || !/[A-Za-zÀ-ÿ]/.test(value) || /^https?:|^[/#@]\S|^\.[a-z]|^#[a-f\d]{3,8}$/i.test(value) || /^[a-z\d_-]+:[^\s]+$/i.test(value)) return;
  if (!value.includes(' ') && /[/[\]{}=]/.test(value)) return;
  if (/(?:bg-|text-|grid-|flex-|border-|rounded-|min-h-|max-w-|aria-|data-testid)/.test(value)) return;
  keys.add(value);
}
function scan(file) {
  // The isolated demo owns three-language tuples, not the site catalogue.
  // Its JSX bypasses the site's runtime and is audited by check-demo-locales.
  if (file.includes('/components/demo/') || file.includes('/components/interface-demo/') || file.includes('/components/account/') ||
    file.includes('/components/alpha-trading/') || file.includes('/components/simulation/') ||
    file.includes('/components/agent-operations/') || file.includes('/components/live-markets/') ||
    file.endsWith('/pages/demo.tsx') || file.endsWith('/pages/auth.tsx') ||
     file.endsWith('/components/history/WalletStatement.tsx') ||
     (file.includes('/components/history/') && /\/(?:RoundHistory|RoundFacts|RoundTabs|RoundPositions)\.tsx$/.test(file)) ||
     file.endsWith('/components/app/AppHeader.tsx') ||
     (file.includes('/components/history/') && /\/(?:wallet-history-(?:model|export|examples)|use-wallet-history|history-pagination|round-history-selection)\.ts$/.test(file)) ||
     file.endsWith('/lib/round-terminology.ts') ||
    file.endsWith('/lib/demo-tab-session.ts') || /\.test\.tsx?$/.test(file)) return;
  if (file.endsWith('.json') && !file.includes('/locales/')) {
    function visit(value) { if (typeof value === 'string') add(value); else if (value && typeof value === 'object') Object.values(value).forEach(visit); }
    visit(JSON.parse(fs.readFileSync(file, 'utf8'))); return;
  }
  if (!/\.tsx?$/.test(file) || file.includes('/lib/localized/') || file.endsWith('/i18n.ts')) return;
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    // Compiler-only literal types (e.g. financial field names in Pick<T, K>)
    // are erased and never passed to the page's translation runtime.
    if (ts.isLiteralTypeNode(node)) return;
    // Explicit PT/EN/ES labels already have their translations; media queries
    // are browser configuration, not prose passed to the JSX translator.
    if (ts.isCallExpression(node) && (
      (ts.isIdentifier(node.expression) && node.expression.text === 'x' &&
         node.arguments.length === 3 && node.arguments.every(arg => ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg) || ts.isTemplateExpression(arg))) ||
      (ts.isPropertyAccessExpression(node.expression) && ['matchMedia', 'getElementById'].includes(node.expression.name.text))
    )) return;
    if (ts.isJsxAttribute(node) && node.name.getText(source) === 'labels' &&
      node.parent.parent.tagName?.getText(source) === 'MobileDataCarousel') return;
    if (ts.isPropertyAssignment(node) && node.name.getText(source).replace(/^['"]|['"]$/g, '') === 'id' && ts.isStringLiteral(node.initializer)) return;
    if (ts.isJsxElement(node) && ['style', 'script'].includes(node.openingElement.tagName.getText(source))) return;
    if (ts.isJsxAttribute(node) && ['className','id','key','href','src','d','viewBox','transform','style','align','allow','referrerPolicy','loading','aria-controls','aria-labelledby','aria-describedby','data-testid','data-i18n','role','type','xmlns','fill','stroke','filter','clipPath'].includes(node.name.getText(source))) return;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)) add(node.text);
    if (ts.isTemplateExpression(node)) {
      const text = node.head.text + node.templateSpans.map((span, i) => `{${i}}${span.literal.text}`).join('');
      if (/[A-Za-zÀ-ÿ]/.test(text.replace(/\{\d+\}/g, ''))) { add(text); templates.add(normalize(text)); }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
function walk(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const file = path.join(dir, entry.name); entry.isDirectory() ? walk(file) : scan(file); } }
walk(root);
const runtimeKeys = path.join(root, 'lib/locales/runtime-source.json');
if (fs.existsSync(runtimeKeys)) JSON.parse(fs.readFileSync(runtimeKeys, 'utf8')).forEach(add);
fs.writeFileSync(path.join(root,'lib/locales/source.json'), JSON.stringify([...keys].sort(), null, 2) + '\n');
console.log(`${keys.size} source messages; ${templates.size} dynamic templates; ${JSON.stringify([...keys]).length} characters`);