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
  ['Lint e prevenção de regressões de segurança', 'pnpm', ['run', 'lint']],
  ['Segredos no código, bundles e histórico Git', 'python', ['scripts/check-secrets.py', '--history']],
  ['Dependências: bloquear alertas altos/críticos não aceitos', 'pnpm', ['run', 'check:dependencies']],
  ['Fronteiras e regras arquiteturais', 'pnpm', ['run', 'check:architecture']],
  ['Base de referências técnicas e recuperação', 'pnpm', ['run', 'check:technical-docs']],
  ['Contratos e clientes gerados', 'pnpm', ['--filter', '@workspace/api-spec', 'run', 'codegen']],
  ['TypeScript do workspace', 'pnpm', ['run', 'typecheck']],
  ['Regras do backend e orquestração', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:demo']],
  ['Cadastro, consentimento e idempotência', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:accounts']],
  ['Autorização, sessões e restauração isolada', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:security']],
  ['Execução, replay, destinos e conciliação', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:journey']],
  ['Histórico: isolamento, dados permitidos e precisão', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:history']],
  ['Tesouraria e governança: autoridade, reservas e retomada', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:treasury']],
  ['Hierarquia BETTEX, fontes, validade e controles do alpha', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'check:agents']],
  ['Criptografia e preservação das carteiras', 'pnpm', ['--filter', '@workspace/bettex-site', 'run', 'check:wallets']],
  ['Contratos de teste, tokenomia e transações EVM locais', 'pnpm', ['--filter', '@workspace/bettex-contracts', 'test']],
  ['Compilação reproduzível e ABI dos contratos de teste', 'pnpm', ['--filter', '@workspace/bettex-contracts', 'build']],
  ['Regras, navegação e horários do app', process.execPath, ['--test', ...demoTests]],
  ['Build do backend', 'pnpm', ['--filter', '@workspace/api-server', 'run', 'build']],
  ['Build, localização e documentos do frontend', 'pnpm', ['--filter', '@workspace/bettex-site', 'run', 'build']],
  ['Servidor e política de saques', process.execPath, ['--test',
    'artifacts/bettex-site/scripts/serve.test.mjs',
    'artifacts/bettex-site/scripts/wallet-withdrawal-policy.test.mjs']],
  ['Segredos nos bundles recém-gerados', 'python', ['scripts/check-secrets.py']],
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