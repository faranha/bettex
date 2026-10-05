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
  ['Fronteiras e regras arquiteturais', 'pnpm', ['run', 'check:architecture']],
  ['Contratos e clientes gerados', 'pnpm', ['--filter', '@workspace/api-spec', 'run', 'codegen']],
  ['TypeScript do workspace', 'pnpm', ['run', 'typecheck']],
  ['Regras do backend e orquestração', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:demo']],
  ['Regras, navegação e horários do app', process.execPath, ['--test', ...demoTests]],
  ['Servidor e política de saques', process.execPath, ['--test',
    'artifacts/bettex-site/scripts/serve.test.mjs',
    'artifacts/bettex-site/scripts/wallet-withdrawal-policy.test.mjs']],
  ['Build do backend', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'build']],
  ['Build, localização e documentos do frontend', 'pnpm', ['--filter', '@workspace/bettex-site', 'run', 'build']],
];

for (const [label, command, args] of steps) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    // Artifact-scoped validation values, not persistent deployment configuration.
    env: { ...process.env, PORT: '25336', BASE_PATH: '/' },
  });
  if (result.error) {
    console.error(`Não foi possível executar: ${label}`, result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('\nVerificações de desenvolvimento concluídas. Isso não certifica operações financeiras reais.');