import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { network } from 'hardhat';
import { BrowserProvider, ContractFactory } from 'ethers';
import { compileContracts } from './compile.mjs';

if (process.env.NODE_ENV === 'production') throw new Error('DEVELOPMENT_ONLY');
const contracts = await compileContracts();
const connection = await network.create('local');
const provider = new BrowserProvider(connection.provider, undefined, { cacheTimeout: -1 });
const owner = await provider.getSigner(0);
const treasury = await (await provider.getSigner(2)).getAddress();
const operating = await (await provider.getSigner(3)).getAddress();
const deploy = async (name, args = []) => {
  const artifact = contracts[name];
  const contract = await new ContractFactory(artifact.abi, artifact.bytecode, owner).deploy(...args);
  await contract.waitForDeployment(); return contract;
};
const usdc = await deploy('MockUSDC');
await (await usdc.mint(await owner.getAddress(), 100_000n * 1_000_000n)).wait();
const first = new Date(((await provider.getBlock('latest')).timestamp + 30) * 1000);
const times = Array.from({ length: 36 }, (_, i) => {
  const month = first.getUTCMonth() + i;
  const day = Math.min(first.getUTCDate(), new Date(Date.UTC(first.getUTCFullYear(), month + 1, 0)).getUTCDate());
  return Date.UTC(first.getUTCFullYear(), month, day, first.getUTCHours(), first.getUTCMinutes(), first.getUTCSeconds()) / 1000;
});
const guarded = process.env.BETTEX_GUARDED_TEST_RUNTIME !== 'false';
const token = await deploy(guarded ? 'BettexGuardedTestToken' : 'BettexTestToken', [
  await (await provider.getSigner(4)).getAddress(), await (await provider.getSigner(5)).getAddress(),
  treasury, operating, await owner.getAddress(), await usdc.getAddress(), 50_000, times,
]);
const { Contract } = await import('ethers');
const distribution = guarded ? await deploy('BettexTestDistributionGuard', [
  await token.getAddress(), await usdc.getAddress(), treasury, treasury,
]) : null;
if (distribution) await (await usdc.connect(await provider.getSigner(2))
  .approve(await distribution.getAddress(), 100_000n * 1_000_000n)).wait();
const sale = new Contract(await token.publicSale(), contracts.BettexPrimarySale.abi, owner);
await (await sale.unpause()).wait();
await connection.provider.request({ method: 'evm_setNextBlockTimestamp', params: [times[0]] });
await connection.provider.request({ method: 'evm_mine', params: [] });
const metadata = {
  epoch: randomUUID(), environment: 'local_evm', chainId: 31337, token: await token.getAddress(),
  sale: await sale.getAddress(), usdc: await usdc.getAddress(), treasury, operating,
  reserve: await owner.getAddress(), deploymentBlock: (await token.deploymentTransaction().wait()).blockNumber,
  ...(distribution ? { distributionGuard: await distribution.getAddress() } : {}),
};
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET' && req.url === '/metadata') { res.end(JSON.stringify(metadata)); return; }
  if (req.method !== 'POST') { res.statusCode = 405; res.end('{}'); return; }
  let body = '';
  for await (const chunk of req) { body += chunk; if (body.length > 65536) { res.statusCode = 413; res.end('{}'); return; } }
  try {
    const input = JSON.parse(body);
    const handle = async item => {
      try {
        const result = await connection.provider.request({ method: item.method, params: item.params ?? [] });
        return { jsonrpc: '2.0', id: item.id, result };
      } catch { return { jsonrpc: '2.0', id: item.id, error: { code: -32000, message: 'Local EVM request failed' } }; }
    };
    res.end(JSON.stringify(Array.isArray(input) ? await Promise.all(input.map(handle)) : await handle(input)));
  } catch { res.statusCode = 400; res.end('{}'); }
});
// Internal-only development node. Never print default-account secrets.
server.listen(Number(process.env.PORT || 3001), '127.0.0.1', () => {
  process.stdout.write(`BETTEX local EVM ready on internal port ${server.address().port}; not a public testnet; no keys logged.\n`);
});
const timer = setInterval(() => {
  void connection.provider.request({ method: 'evm_mine', params: [] }).catch(() => {});
}, 4000);
process.on('SIGTERM', () => { clearInterval(timer); server.close(); provider.destroy(); void connection.close(); });
