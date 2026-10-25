import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { orderStandardTranslations } from '../src/lib/documentation-order-standard.ts';
import { trainingSourceMessages } from '../src/lib/documentation-training.ts';
const root = path.resolve(import.meta.dirname, '../src');
const keys = new Set();
const templates = new Set();
const normalize = value => value.replace(/\s+/g, ' ').trim();
function add(value) {
  value = normalize(value);
  if (value === 'non-scaling-stroke') return; // SVG vector-effect protocol value.
  if (/^[Mm][\s\d.,eE+\-MmZzLlHhVvCcSsQqTtAa]+$/.test(value)) return; // SVG path data, not interface copy.
  if (/^--[a-z\d_-]+$/i.test(value)) return; // CSS custom-property names are not copy.
  if (/^[a-z][a-z\d-]*__[a-z\d_-]+$/i.test(value)) return; // BEM CSS class names are structural, not prose.
  if (value === 'correlationId') return; // History URL/API field name, never user-facing copy.
  if (/^documentacao-[\w-]+$|^documentation-(?:reading|menu)-group-|^-(en|es)$/.test(value)) return; // Routing ids and localized filename suffixes.
  if (!value || !/[A-Za-zÀ-ÿ]/.test(value) || /^https?:|^[/#@]\S|^\.[a-z]|^#[a-f\d]{3,8}$/i.test(value) || /^[a-z\d_-]+:[^\s]+$/i.test(value)) return;
  if (!value.includes(' ') && /[/[\]{}=]/.test(value)) return;
  if (/(?:bg-|text-|grid-|flex-|border-|rounded-|min-h-|max-w-|aria-|data-testid)/.test(value)) return;
  keys.add(value);
}
// These typed tuples supply all their localized prose directly; protocol codes,
// field paths and editorial replacements are not translation source messages.
Object.keys(orderStandardTranslations).forEach(add);
trainingSourceMessages.forEach(add);
function scan(file) {
  if (/\/lib\/documentation-order-(?:standard|terminology)\.ts$/.test(file)) return;
  if (file.endsWith('/lib/documentation-training.ts')) return; // Typed PT/EN/ES passages and technical profile IDs are audited separately.
  if (file.endsWith('/lib/documentation-outline.json')) return; // Generated localized navigation metadata, not source copy.
  if (file.endsWith('/lib/pitch-hero-media.generated.json') || file.endsWith('/lib/pitch-hero-media.ts')) return; // Image resolutions, provenance and srcset URLs, not interface copy.
  if (file.endsWith('/components/documentationReadingPages.ts')) return; // DOM tag/attribute protocol names, no interface copy.
  if (file.endsWith('/components/documentationAccordions.ts')) return; // DOM accordion mechanics; translated labels supplied by its caller.
  if (file.endsWith('/components/documentationSectionPresentation.ts')) return; // DOM presentation metadata; excerpts come from already localized prose.
  if (file.endsWith('/lib/documentation-agent-terminology.ts')) return; // Editorial normalization, audited separately.
  // Documentation research passages own PT/EN/ES tuples; only PT is a source key.
  // The isolated demo owns three-language tuples, not the site catalogue.
  // Its JSX bypasses the site's runtime and is audited by check-demo-locales.
  if (file.includes('/components/demo/') || file.includes('/components/interface-demo/') || file.includes('/components/account/') ||
    file.includes('/components/alpha-trading/') || file.includes('/components/simulation/') ||
    file.includes('/components/agent-operations/') || file.includes('/components/live-markets/') ||
    file.endsWith('/pages/demo.tsx') || file.endsWith('/pages/auth.tsx') ||
     file.endsWith('/components/history/WalletStatement.tsx') ||
     (file.includes('/components/history/') && /\/(?:RoundHistory|RoundFacts|RoundTabs|RoundPositions)\.tsx$/.test(file)) ||
     file.endsWith('/components/app/AppHeader.tsx') ||
      (file.includes('/components/history/') && /\/(?:wallet-history-(?:model|export|examples)|use-wallet-history|history-pagination|history-selection|round-history-selection)\.ts$/.test(file)) ||
     file.endsWith('/lib/round-terminology.ts') ||
    file.endsWith('/lib/demo-tab-session.ts') || /\.test\.tsx?$/.test(file)) return;
  if (file.endsWith('.json') && !file.includes('/locales/')) {
    function visit(value, key) {
      if (file.endsWith('/lib/documentation-consistency.json') && ['id', 'area'].includes(key)) return; // Policy routing metadata, not reader-facing copy.
      if (file.endsWith('/lib/site-seo.json') && key === 'image') return; // Social asset filenames, not copy.
      if (typeof value === 'string') add(value);
      else if (value && typeof value === 'object') Object.entries(value).forEach(([key, value]) => visit(value, key));
    }
    visit(JSON.parse(fs.readFileSync(file, 'utf8'))); return;
  }
  if (!/\.tsx?$/.test(file) || file.includes('/lib/localized/') || file.endsWith('/i18n.ts')) return;
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(node) {
    if (file.endsWith('/components/OrderStandard.tsx') && ts.isCallExpression(node) &&
        node.expression.getText(source) === 'text') return; // Typed catalog keys, not prose.
    // DOM event names are protocol identifiers, not displayed labels.
    if (ts.isStringLiteral(node) && ts.isCallExpression(node.parent) && node.parent.arguments[0] === node &&
        ts.isPropertyAccessExpression(node.parent.expression) &&
        ['addEventListener', 'removeEventListener'].includes(node.parent.expression.name.text)) return;
    // Regex syntax/flags and internal reference-registry assertions are not UI copy.
    if (ts.isNewExpression(node) && node.expression.getText(source) === 'RegExp') return;
    if (file.endsWith('/DocumentationFeaturesIntroduction.tsx') &&
        ts.isNewExpression(node) && node.expression.getText(source) === 'Error') return;
    if (file.endsWith('/AgentIntelligence.tsx') && ts.isStringLiteral(node) &&
      ['bettex', 'risk', 'treasury', 'governance', 'crypto', 'sports', 'predictions', 'igaming', 'relations', 'learning', 'context', 'support', 'markets'].includes(node.text)) return;
    // Documentation ownership selectors are implementation metadata, not prose.
    if ((file.endsWith('/AgentIntelligence.tsx') || file.endsWith('/ArchitectureCatalogue.tsx')) &&
      ((ts.isVariableDeclaration(node) && ['allOwners', 'supportOwner'].includes(node.name.getText(source))) ||
       (ts.isCallExpression(node) && ['has', 'on', 'show'].includes(node.expression.getText(source))) ||
       (ts.isBinaryExpression(node) && ['part', 'group'].includes(node.left.getText(source))))) return;
    if (ts.isJsxAttribute(node) && ['owners', 'only', 'groups', 'connectorNames', 'integrationId', 'part'].includes(node.name.getText(source))) return;
    // Closing an SVG path is drawing syntax, not a translatable label.
    if (file.endsWith('/components/VestingPlot.tsx') && ts.isStringLiteral(node) && node.text === 'Z') return;
    // Rule-table presentation inspects an HTML tag name, not reader-facing copy.
    if (file.endsWith('/components/DocumentationRulesTable.tsx') && ts.isStringLiteral(node) && node.text === 'strong') return;
    // Agent artwork filenames are asset references, not translatable copy.
    if (file.endsWith('/components/DocumentationAgentArtwork.tsx') && ts.isStringLiteral(node) && node.text.endsWith('.webp')) return;
    if (/\/lib\/documentation-(?:intelligence(?:-presentation)?|order-standard)\.ts$/.test(file) && ts.isArrayLiteralExpression(node) &&
      node.elements.length === 3 && node.elements.every(ts.isStringLiteral)) {
      add(node.elements[0].text);
      return;
    }
    // Order field tuples: path/type/lifecycle are identifiers; prose is PT/EN/ES.
    if (file.endsWith('/lib/documentation-order-standard.ts') && ts.isCallExpression(node) &&
        node.expression.getText(source) === 'f' && node.arguments.length === 6 &&
        node.arguments.slice(3).every(ts.isStringLiteral)) {
      add(node.arguments[3].text);
      return;
    }
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    // Compiler-only literal types (e.g. financial field names in Pick<T, K>)
    // are erased and never passed to the page's translation runtime.
    if (ts.isLiteralTypeNode(node)) return;
    if (ts.isArrayLiteralExpression(node) && node.elements.length === 3 &&
        node.elements.every(ts.isStringLiteral) &&
        ['og:type', 'twitter:card'].includes(node.elements[1].text)) return; // Social protocol enums, not labels.
    if (ts.isPropertyAssignment(node) && node.name.getText(source).replace(/^['"]|['"]$/g, '') === '@type') return; // Schema.org types are protocol identifiers.
    // PitchSlider.label and PitchSlide.label are explicit PT/EN/ES tuples.
    // Their UI translations are exercised by the slider browser check.
    if (source.text.includes("import { PitchSlider }") && ts.isArrayLiteralExpression(node) &&
      node.elements.length === 3 && node.elements.every(ts.isStringLiteral) &&
      ((ts.isPropertyAssignment(node.parent) && node.parent.name.getText(source) === 'label') ||
       (ts.isJsxExpression(node.parent) && ts.isJsxAttribute(node.parent.parent) &&
        node.parent.parent.name.getText(source) === 'label'))) return;
    // Explicit PT/EN/ES labels already have their translations; media queries
    // are browser configuration, not prose passed to the JSX translator.
    if (ts.isCallExpression(node) && (
      (ts.isIdentifier(node.expression) && node.expression.text === 'x' &&
         node.arguments.length === 3 && node.arguments.every(arg => ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg) || ts.isTemplateExpression(arg))) ||
       (ts.isPropertyAccessExpression(node.expression) && ['matchMedia', 'getElementById', 'querySelector', 'querySelectorAll', 'closest', 'matches'].includes(node.expression.name.text))
    )) return;
    if (file.endsWith('/pitch/PitchSlider.tsx') && ts.isPropertyAssignment(node) &&
      ['event', 'func'].includes(node.name.getText(source)) && ts.isStringLiteral(node.initializer) &&
      ['command', 'pauseVideo'].includes(node.initializer.text)) return;
    if (ts.isJsxAttribute(node) && node.name.getText(source) === 'labels' &&
      node.parent.parent.tagName?.getText(source) === 'MobileDataCarousel') return;
    if (ts.isJsxAttribute(node) && node.name.getText(source) === 'area' &&
      node.parent.parent.tagName?.getText(source) === 'DocumentationConsistency') return; // Policy selection, not displayed copy.
    if (ts.isPropertyAssignment(node) && node.name.getText(source).replace(/^['"]|['"]$/g, '') === 'id' && ts.isStringLiteral(node.initializer)) return;
    if (ts.isJsxElement(node) && ['style', 'script'].includes(node.openingElement.tagName.getText(source))) return;
    if (ts.isJsxAttribute(node) && ['className','id','key','href','src','srcSet','sizes','d','viewBox','transform','style','align','textAnchor','preserveAspectRatio','allow','referrerPolicy','loading','aria-controls','aria-labelledby','aria-describedby','data-testid','data-i18n','role','type','xmlns','fill','stroke','filter','clipPath','mask','maskUnits'].includes(node.name.getText(source))) return;
    // Quoted object property names identify messages; their values are copy.
    if (ts.isStringLiteral(node) && ts.isPropertyAssignment(node.parent) && node.parent.name === node) return;
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