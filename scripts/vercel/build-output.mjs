// Packages the production site server and API as Vercel functions
// (Build Output API v3). Run after the site build (dist/public exists).
import { cp, mkdir, rm, writeFile, readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const site = path.join(root, 'artifacts/bettex-site');
const output = path.join(root, '.vercel/output');
const runtime = 'nodejs24.x';

await stat(path.join(site, 'dist/public/index.html')).catch(() => {
  throw new Error('Build the site first: artifacts/bettex-site/dist/public/index.html is missing');
});
await rm(output, { recursive: true, force: true });

const vcConfig = (extra = {}) => JSON.stringify({
  runtime, handler: 'index.mjs', launcherType: 'Nodejs', shouldAddHelpers: false,
  supportsResponseStreaming: true, maxDuration: 30, ...extra,
}, null, 2);

// 1. Site function: the unchanged production server and its built files,
//    laid out exactly as in the repository so its relative paths resolve.
const siteFunc = path.join(output, 'functions/index.func');
const siteFiles = [
  'scripts/serve.mjs', 'scripts/seo.mjs', 'scripts/crawler-policy.mjs',
  'src/lib/seo-schema.ts', 'src/components/demo/demo-navigation.ts',
  'src/lib/site-seo.json', 'src/lib/locales/translations.json',
];
for (const file of siteFiles) {
  await mkdir(path.dirname(path.join(siteFunc, 'artifacts/bettex-site', file)), { recursive: true });
  await cp(path.join(site, file), path.join(siteFunc, 'artifacts/bettex-site', file));
}
await cp(path.join(site, 'dist/public'), path.join(siteFunc, 'artifacts/bettex-site/dist/public'), { recursive: true });
await cp(path.join(root, 'scripts/vercel/deployment-headers.mjs'), path.join(siteFunc, 'deployment-headers.mjs'));
await cp(path.join(root, 'scripts/vercel/site-handler.mjs'), path.join(siteFunc, 'index.mjs'));
await writeFile(path.join(siteFunc, 'package.json'), JSON.stringify({ type: 'module' }) + '\n');
await writeFile(path.join(siteFunc, '.vc-config.json'), vcConfig({ memory: 1024 }));

// 2. API function: the same Express app as the production API, bundled.
const apiFunc = path.join(output, 'functions/api.func');
const apiRequire = createRequire(path.join(root, 'artifacts/api-server/package.json'));
globalThis.require = apiRequire;
const { build } = apiRequire('esbuild');
const esbuildPluginPino = apiRequire('esbuild-plugin-pino');
await build({
  entryPoints: { index: path.join(root, 'scripts/vercel/api-handler.mjs') },
  absWorkingDir: path.join(root, 'artifacts/api-server'),
  nodePaths: [path.join(root, 'artifacts/api-server/node_modules')],
  platform: 'node', target: 'node24', bundle: true, format: 'esm',
  outdir: apiFunc, outExtension: { '.js': '.mjs' }, logLevel: 'warning',
  external: ['*.node', 'pg-native'],
  plugins: [esbuildPluginPino({ transports: ['pino-pretty'] })],
  banner: { js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);` },
});
await writeFile(path.join(apiFunc, 'package.json'), JSON.stringify({ type: 'module' }) + '\n');
await writeFile(path.join(apiFunc, '.vc-config.json'), vcConfig({ memory: 1024 }));

// 3. Routing: /api → Express app, everything else → production site server.
await writeFile(path.join(output, 'config.json'), JSON.stringify({
  version: 3,
  routes: [
    { src: '^/api(?:/.*)?$', dest: '/api' },
    { src: '^/(.*)$', dest: '/index' },
  ],
}, null, 2) + '\n');

const pkg = JSON.parse(await readFile(path.join(site, 'package.json'), 'utf8'));
console.log(`Vercel output ready for ${pkg.name}: functions index (site) and api.`);
