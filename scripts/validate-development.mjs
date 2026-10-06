import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const demoDirectory = 'artifacts/bettex-site/src/components/demo';
const demoTests = readdirSync(new URL(`../${demoDirectory}/`, import.meta.url))
  .filter(name => name.endsWith('.test.ts'))
  .sort()
  .map(name => `${demoDirectory}/${name}`);
const steps = [
  ['Lint and security regression prevention', 'pnpm', ['run', 'lint']],
  ['Secrets in code, bundles and Git history', 'python', ['scripts/check-secrets.py', '--history']],
  ['Dependencies: block unacceptable high/critical alerts', 'pnpm', ['run', 'check:dependencies']],
  ['Architectural boundaries and rules', 'pnpm', ['run', 'check:architecture']],
  ['Technical reference base and recovery', 'pnpm', ['run', 'check:technical-docs']],
  ['Generated contracts and clients', 'pnpm', ['--filter', '@workspace/api-spec', 'run', 'codegen']],
  ['Workspace TypeScript', 'pnpm', ['run', 'typecheck']],
  ['Backend rules and orchestration', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:demo']],
  ['Registration, consent and idempotency', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:accounts']],
  ['Authorization, sessions and isolated restoration', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:security']],
  ['Execution, replay, destinations and reconciliation', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:journey']],
  ['History: isolation, allowed data and accuracy', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:history']],
  ['Isolated history HTTP, pagination and permission revocation', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:history-store']],
  ['Treasury and governance: authority, reserves and resumption', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:treasury']],
  ['BETTEX hierarchy, sources, validity and alpha controls', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:agents']],
  ['Allora source identity, task, horizon and failure handling', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:allora']],
  ['Public market prices, freshness, recovery and source limits', 'pnpm', ['--filter', '@workspace/api-server', 'exec', 'node', '--test', 'scripts/market-live.test.mjs']],
  ['Agent service graph, real forecast consumption and fail-closed readiness', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:agent-operations']],
  ['Paper trading, settlement and resumption', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:paper']],
  ['Trading policy evidence and independent approval', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:trading-policies']],
  ['Isolated simulation scenarios and payout failures', 'pnpm', ['--filter', '@workspace/api-server', 'exec', 'node', '--test', 'scripts/simulation-scenarios.test.mjs']],
  ['Isolated treasury HTTP, governance and execution integration', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:treasury-integration']],
  ['Research book precision and fail-closed depth', process.execPath, ['--test', 'tools/market-validation/book_probe.test.mjs']],
  ['Offline research model and holdout isolation', 'python', ['-m', 'unittest', 'discover', '-s', 'tools/market-validation', '-p', 'test_*.py']],
  ['Git synchronization safeguards without upload', 'pnpm', ['run', 'sync:test']],
  ['Encryption and wallet preservation', 'pnpm', ['--filter', '@workspace/bettex-site', 'run', 'check:wallets']],
  ['Test contracts, tokenomics and local EVM transactions', 'pnpm', ['--filter', '@workspace/bettex-contracts', 'test']],
  ['Reproducible build and test contract ABI', 'pnpm', ['--filter', '@workspace/bettex-contracts', 'build']],
  ['App rules, navigation and schedules', process.execPath, ['--test', ...demoTests]],
  ['Backend build', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'build']],
  ['Frontend build, localization and documents', 'pnpm', ['--filter', '@workspace/bettex-site', 'run', 'build']],
  ['Server and withdrawal policy', process.execPath, ['--test',
    'artifacts/bettex-site/scripts/serve.test.mjs',
    'artifacts/bettex-site/scripts/wallet-withdrawal-policy.test.mjs']],
  ['Secrets in newly generated bundles', 'python', ['scripts/check-secrets.py']],
];

const args = process.argv.slice(2);
const option = flag => args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined;
const reportPath = option('--report');
const retryPath = option('--only-failed');
const retryLabels = retryPath
  ? new Set(JSON.parse(readFileSync(retryPath, 'utf8')).results.filter(r => r.status !== 0).map(r => r.label))
  : null;
const results = [];
let failed = false;
for (const [label, command, args] of steps) {
  if (retryLabels && !retryLabels.has(label)) continue;
  console.log(`\n== ${label} ==`);
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    timeout: 240000,
    env: { ...process.env, PORT: '25336', BASE_PATH: '/', GIT_OPTIONAL_LOCKS: '0' },
  });
  const status = result.status ?? 1;
  results.push({ label, status, durationMs: Date.now() - started,
    ...(result.error ? { error: result.error.code ?? 'execution_failed' } : {}) });
  if (reportPath) {
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, JSON.stringify({ at: new Date().toISOString(), scope: 'development-isolated',
      complete: false, results }, null, 2) + '\n');
  }
  if (result.error) {
    console.error(`Could not execute: ${label}`, result.error.code ?? 'execution_failed');
  }
  if (status !== 0) {
    failed = true;
    if (!process.argv.includes('--continue')) break;
  }
}
if (reportPath) writeFileSync(reportPath, JSON.stringify({ at: new Date().toISOString(),
  scope: 'development-isolated', complete: results.length === (retryLabels?.size ?? steps.length), results }, null, 2) + '\n');
console.log(`\nDevelopment checks: ${results.filter(r => r.status === 0).length} passed, ${results.filter(r => r.status !== 0).length} failed. This does not certify real financial operations.`);
process.exitCode = failed ? 1 : 0;