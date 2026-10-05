import solc from 'solc';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
export async function compileContracts({ persist = false } = {}) {
  const sources = {};
  for (const directory of ['contracts', 'test/fixtures']) {
    for (const file of await readdir(path.join(root, directory))) {
      if (file.endsWith('.sol')) sources[`${directory}/${file}`] = { content: await readFile(path.join(root, directory, file), 'utf8') };
    }
  }
  const input = { language: 'Solidity', sources, settings: {
    optimizer: { enabled: true, runs: 200 }, viaIR: true, evmVersion: 'shanghai',
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object', 'evm.deployedBytecode.immutableReferences'] } },
  } };
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: filename => {
    try {
      return { contents: readFileSync(filename.startsWith('@openzeppelin/')
        ? require.resolve(filename) : path.join(root, filename), 'utf8') };
    } catch { return { error: `Unresolved import: ${filename}` }; }
  } }));
  const errors = output.errors?.filter(error => error.severity === 'error') ?? [];
  if (errors.length) throw new Error(errors.map(error => error.formattedMessage).join('\n'));
  const contracts = {};
  for (const [source, entries] of Object.entries(output.contracts)) {
    if (!source.startsWith('contracts/') && !source.startsWith('test/')) continue;
    for (const [name, artifact] of Object.entries(entries)) {
      const bytecode = artifact.evm.bytecode.object;
      if (bytecode.length / 2 > 49152 || artifact.evm.deployedBytecode.object.length / 2 > 24576) {
        throw new Error(`EVM size limit exceeded: ${name}`);
      }
      contracts[name] = { source, abi: artifact.abi, bytecode: `0x${bytecode}`,
        runtime: `0x${artifact.evm.deployedBytecode.object}`,
        immutableReferences: artifact.evm.deployedBytecode.immutableReferences };
    }
  }
  if (persist) {
    await mkdir(path.join(root, 'build'), { recursive: true });
    await writeFile(path.join(root, 'build/artifacts.json'), JSON.stringify({ compiler: solc.version(),
      evmVersion: 'shanghai', networkPolicy: [31337, 421614], publicDeployment: 'blocked', contracts }, null, 2));
    await mkdir(path.join(root, 'src'), { recursive: true });
    const verified = Object.fromEntries(Object.entries(contracts).filter(([, artifact]) => artifact.source.startsWith('contracts/') && artifact.bytecode !== '0x')
      .map(([name, artifact]) => [name, { abi: artifact.abi, runtime: artifact.runtime, immutableReferences: artifact.immutableReferences,
        ...(name === 'BettexTestWalletService' ? { bytecode: artifact.bytecode } : {}) }]));
    await writeFile(path.join(root, 'src/verified-artifacts.json'), JSON.stringify(verified));
    console.log(`Compiled ${Object.keys(contracts).length} test contracts with ${solc.version()}; no deployment.`);
  }
  return contracts;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await compileContracts({ persist: true });
