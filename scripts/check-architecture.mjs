import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export const rules = JSON.parse(readFileSync(new URL('../docs/architecture-rules.json', import.meta.url), 'utf8'));
const slash = value => value.replaceAll(path.sep, '/');
const apiPrefix = 'artifacts/api-server/src/';
const modulePrefix = `${apiPrefix}modules/`;
const canonicalDocs = ['AGENTS.md', 'docs/architecture.md', 'docs/decisions/README.md'];

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file) ? [file] : [];
  });
}

function describe(file) {
  if (!file.startsWith(modulePrefix)) return undefined;
  const [context, layer, ...rest] = file.slice(modulePrefix.length).split('/');
  return { context, layer: layer === 'index.ts' && rest.length === 0 ? 'public' : layer };
}

export function inspectArchitecture(root, { checkDocuments = true } = {}) {
  root = path.resolve(root);
  const issues = [];
  if (checkDocuments) {
    for (const document of canonicalDocs) {
      if (!existsSync(path.join(root, document))) issues.push(`${document}: documento canônico ausente`);
    }
  }
  const files = walk(path.join(root, apiPrefix));
  const moduleFiles = files.filter(file => describe(slash(path.relative(root, file))));
  const moduleSet = new Set(moduleFiles);
  const graph = new Map(moduleFiles.map(file => [file, []]));
  const configuration = path.join(root, 'artifacts/api-server/tsconfig.json');
  const options = existsSync(configuration)
    ? ts.parseJsonConfigFileContent(ts.readConfigFile(configuration, ts.sys.readFile).config, ts.sys, path.dirname(configuration)).options
    : { moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext };

  for (const file of files) {
    const relative = slash(path.relative(root, file));
    if (/^artifacts\/api-server\/src\/(?:lib|utils|services)\//.test(relative) && !rules.legacyFiles.includes(relative)) {
      issues.push(`${relative}: arquivo genérico não registrado; definir domínio`);
    }
  }

  for (const file of moduleFiles) {
    const relative = slash(path.relative(root, file));
    const owner = describe(relative);
    const fail = message => issues.push(`${relative}: ${message}`);
    if (!Object.hasOwn(rules.dependencies, owner.context)) {
      fail('domínio não registrado no mapa canônico');
      continue;
    }
    if (!Object.hasOwn(rules.layers, owner.layer)) {
      fail('camada inválida; usar domain/application/infrastructure/transport ou index.ts público');
      continue;
    }
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    function check(specifier) {
      if (!ts.isStringLiteralLike(specifier)) { fail('dependência dinâmica sem contrato estático'); return; }
      const name = specifier.text;
      const external = !name.startsWith('.') && !name.startsWith('@/');
      if (external && ['domain', 'application', 'public'].includes(owner.layer) && !rules.purePackages.includes(name)) {
        fail('núcleo depende de fornecedor/infraestrutura; usar porta e adaptador');
      }
      if (external && owner.layer === 'transport' && !['express', ...rules.purePackages].includes(name)) {
        fail('fornecedor deve estar em adaptador de infraestrutura, não no transporte');
      }
      if (name === '@workspace/db') {
        const declaration = specifier.parent;
        const bindings = ts.isImportDeclaration(declaration) ? declaration.importClause?.namedBindings : undefined;
        if (owner.layer !== 'infrastructure' || !bindings || !ts.isNamedImports(bindings) ||
          bindings.elements.length === 0 || bindings.elements.some(item => (item.propertyName ?? item.name).text !== 'db')) {
          fail('importar apenas conexão db na infraestrutura; schemas pertencem ao próprio domínio');
        }
      }
      const resolved = ts.resolveModuleName(name, file, options, ts.sys).resolvedModule?.resolvedFileName;
      const target = resolved ? path.resolve(resolved) : name.startsWith('.') ? path.resolve(path.dirname(file), name) : undefined;
      if (!target) return; // Typecheck separately rejects unresolved imports.
      const targetRelative = slash(path.relative(root, target));
      const dependency = describe(targetRelative);
      if (moduleSet.has(target)) graph.get(file).push(target);
      if (dependency) {
        if (owner.context === dependency.context) {
          if (!rules.layers[owner.layer].includes(dependency.layer)) fail('dependência entre camadas não permitida');
        } else {
          if (owner.layer === 'domain' || !rules.dependencies[owner.context].includes(dependency.context)) {
            fail(`dependência de domínio não permitida: ${dependency.context}`);
          }
          if (dependency.layer !== 'public') fail('acesso a internos de outro módulo; usar index.ts público');
        }
      } else if (targetRelative.startsWith(apiPrefix)) {
        if (!(owner.layer === 'infrastructure' && targetRelative === `${apiPrefix}lib/logger.ts`)) {
          fail('módulo depende do legado/composição; extrair responsabilidade ou contrato');
        }
      }
      if (targetRelative.startsWith('lib/db/src/schema/')) {
        const schemaOwner = targetRelative.slice('lib/db/src/schema/'.length).split('/')[0].replace(/\.ts$/, '');
        if (owner.layer !== 'infrastructure' || schemaOwner !== owner.context) fail('acesso a schema fora do proprietário');
      }
    }
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) check(node.moduleSpecifier);
      if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) check(node.argument.literal);
      if (ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword || ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
        if (node.arguments.length !== 1) fail('dependência dinâmica sem contrato estático');
        else check(node.arguments[0]);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  const active = new Set(), visited = new Set();
  function cycle(file) {
    if (active.has(file)) { issues.push(`${slash(path.relative(root, file))}: ciclo de imports entre módulos/arquivos`); return; }
    if (visited.has(file)) return;
    active.add(file);
    for (const dependency of graph.get(file) ?? []) cycle(dependency);
    active.delete(file);
    visited.add(file);
  }
  for (const file of moduleFiles) cycle(file);
  return { issues: [...new Set(issues)], modularFiles: moduleFiles.length,
    legacyFiles: files.filter(file => rules.legacyFiles.includes(slash(path.relative(root, file)))).length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = inspectArchitecture(fileURLToPath(new URL('../', import.meta.url)));
  if (result.issues.length) {
    console.error(result.issues.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`Arquitetura: ${result.modularFiles} arquivos modulares verificados; ${result.legacyFiles} arquivos legados registrados. Migração ainda necessária; não certifica segurança financeira.`);
  }
}