import { readdirSync } from 'node:fs';
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
  ['Treasury and governance: authority, reserves and resumption', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:treasury']],
  ['BETTEX hierarchy, sources, validity and alpha controls', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:agents']],
  ['Allora source identity, task, horizon and failure handling', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:allora']],
  ['Agent service graph, real forecast consumption and fail-closed readiness', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:agent-operations']],
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

for (const [label, command, args] of steps) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PORT: '25336', BASE_PATH: '/' },
  });
  if (result.error) {
    console.error(`Could not execute: ${label}`, result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log("\nDevelopment checks completed. This does not certify real financial operations.");