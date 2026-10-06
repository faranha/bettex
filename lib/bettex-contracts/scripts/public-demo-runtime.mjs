import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Wallet, JsonRpcProvider, ContractFactory, Contract, formatEther, parseEther, keccak256, toUtf8Bytes } from 'ethers';
import { compileContracts } from './compile.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = path.join(root, '.local/bettex-public-testnet');
const walletFile = path.join(directory, 'operator.enc.json');
const manifestFile = path.join(directory, 'deployment.json');
const chainId = 421614;
const rpcUrl = 'https://sepolia-rollup.arbitrum.io/rpc';
const provider = new JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });
const prepareOnly = process.argv.includes('--prepare');
const watch = process.argv.includes('--watch');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
await mkdir(directory, { recursive: true, mode: 0o700 });
if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is required to protect the generated deployment wallet.');
const encryptionKey = createHash('sha256').update(process.env.SESSION_SECRET).update('BETTEX_PUBLIC_TESTNET_OPERATOR_V1').digest();
const atomicWrite = async (file, data) => {
  await writeFile(`${file}.tmp`, JSON.stringify(data, null, 2), { mode: 0o600 });
  await rename(`${file}.tmp`, file);
};
let signer;
try {
  const stored = JSON.parse(await readFile(walletFile, 'utf8'));
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey, Buffer.from(stored.iv, 'hex'));
  decipher.setAAD(Buffer.from('BETTEX_PUBLIC_TESTNET_OPERATOR_V1'));
  decipher.setAuthTag(Buffer.from(stored.tag, 'hex'));
  const privateKey = Buffer.concat([decipher.update(Buffer.from(stored.ciphertext, 'hex')), decipher.final()]).toString();
  signer = new Wallet(privateKey, provider);
  if (signer.address !== stored.address) throw new Error('DEPLOYMENT_WALLET_MISMATCH');
} catch (error) {
  if (error.code !== 'ENOENT') throw new Error('Cannot unlock the existing testnet operator; no replacement wallet was created.');
  signer = Wallet.createRandom().connect(provider);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);
  cipher.setAAD(Buffer.from('BETTEX_PUBLIC_TESTNET_OPERATOR_V1'));
  const ciphertext = Buffer.concat([cipher.update(signer.privateKey, 'utf8'), cipher.final()]);
  await atomicWrite(walletFile, { address: signer.address, iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'), ciphertext: ciphertext.toString('hex') });
}
let manifest;
try { manifest = JSON.parse(await readFile(manifestFile, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
manifest ??= { chainId, network: 'Arbitrum Sepolia', purpose: 'public_demo_activity_registry',
  operatorAddress: signer.address, contractAddress: null, deploymentTransaction: null,
  application: 'BETTEX_PUBLIC_DEMO_V1', financialOperations: 'simulated' };
if (manifest.operatorAddress !== signer.address || manifest.chainId !== chainId) throw new Error('DEPLOYMENT_MANIFEST_MISMATCH');
await atomicWrite(manifestFile, manifest);
if (Number(BigInt(await provider.send('eth_chainId', []))) !== chainId) throw new Error('PUBLIC_CHAIN_MISMATCH');
const balance = await provider.getBalance(signer.address);
console.log(JSON.stringify({ status: manifest.contractAddress ? 'deployed' : 'awaiting_test_eth',
  chainId, operatorAddress: signer.address, balanceTestEth: formatEther(balance),
  suggestedTestEth: '0.001', contractAddress: manifest.contractAddress,
  registryOnly: true, financialOperations: 'simulated' }));
if (prepareOnly) { provider.destroy(); process.exit(0); }

if (process.argv.includes('--bridge-l1')) {
  // Official Arbitrum SDK network configuration, chain 421614 / parent 11155111.
  // This path refuses every mainnet and transfers only faucet-issued Sepolia ETH.
  const parent = new JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com', 11155111, { staticNetwork: true });
  if (Number(BigInt(await parent.send('eth_chainId', []))) !== 11155111) throw new Error('PARENT_TESTNET_MISMATCH');
  const inboxAddress = '0xaAe29B0366299461418F5324a79Afc425BE5ae21';
  const inbox = new Contract(inboxAddress, [
    'function bridge() view returns(address)', 'function depositEth() payable returns(uint256)',
  ], signer.connect(parent));
  if (await parent.getCode(inboxAddress) === '0x'
    || (await inbox.bridge()).toLowerCase() !== '0x38f918d0e9f1b721edaa41302e399fa1b79333a9') {
    throw new Error('OFFICIAL_TESTNET_INBOX_MISMATCH');
  }
  if (!manifest.parentBridgeTransaction) {
    const amount = parseEther('0.002');
    const estimatedGas = await inbox.depositEth.estimateGas({ value: amount });
    const fees = await parent.getFeeData();
    const maxFeePerGas = fees.maxFeePerGas ?? fees.gasPrice;
    if (!maxFeePerGas || amount + estimatedGas * maxFeePerGas > await parent.getBalance(signer.address)) {
      throw new Error('INSUFFICIENT_PARENT_TEST_ETH');
    }
    const transaction = await inbox.depositEth({ value: amount, gasLimit: estimatedGas * 120n / 100n });
    manifest.parentBridgeTransaction = transaction.hash;
    await atomicWrite(manifestFile, manifest);
  }
  const receipt = await parent.waitForTransaction(manifest.parentBridgeTransaction, 1, 120_000);
  if (!receipt || receipt.status !== 1) throw new Error('TESTNET_BRIDGE_NOT_CONFIRMED');
  console.log(JSON.stringify({ status: 'TEST_ETH_BRIDGE_CONFIRMED', parentChainId: 11155111,
    targetChainId: chainId, transactionHash: receipt.hash, recipient: signer.address }));
  parent.destroy(); provider.destroy(); process.exit(0);
}

let artifacts;
const getArtifacts = async () => artifacts ??= await compileContracts();
while (!manifest.contractAddress) {
  const currentBalance = await provider.getBalance(signer.address, 'pending');
  const fees = await provider.getFeeData();
  const unitPrice = fees.maxFeePerGas ?? fees.gasPrice ?? 100_000_000n;
  if (currentBalance < 1_000_000n * unitPrice) {
    if (!watch) throw new Error('TEST_ETH_REQUIRED: fund the generated operator on Arbitrum Sepolia only.');
    console.log('Waiting for Arbitrum Sepolia test ETH; no private key or real funds requested.');
    await delay(30_000); continue;
  }
  const artifact = (await getArtifacts()).BettexPublicDemo;
  if (manifest.deploymentTransaction) {
    const receipt = await provider.waitForTransaction(manifest.deploymentTransaction, 1, 120_000);
    if (!receipt) { if (watch) continue; throw new Error('PUBLIC_DEPLOYMENT_PENDING'); }
    if (receipt.status !== 1 || !receipt.contractAddress) throw new Error('PUBLIC_DEPLOYMENT_REVERTED');
    manifest.contractAddress = receipt.contractAddress;
    manifest.deploymentBlock = receipt.blockNumber;
  } else {
    const deployed = await new ContractFactory(artifact.abi, artifact.bytecode, signer).deploy();
    manifest.deploymentTransaction = deployed.deploymentTransaction().hash;
    await atomicWrite(manifestFile, manifest);
    const receipt = await deployed.deploymentTransaction().wait();
    if (receipt.status !== 1) throw new Error('PUBLIC_DEPLOYMENT_REVERTED');
    manifest.contractAddress = await deployed.getAddress();
    manifest.deploymentBlock = receipt.blockNumber;
  }
  await atomicWrite(manifestFile, manifest);
}
const artifact = (await getArtifacts()).BettexPublicDemo;
const deployedCode = await provider.getCode(manifest.contractAddress);
const normalize = code => {
  let bytes = code.slice(2).toLowerCase();
  for (const references of Object.values(artifact.immutableReferences)) {
    for (const ref of references) bytes = bytes.slice(0, ref.start * 2)
      + '0'.repeat(ref.length * 2) + bytes.slice((ref.start + ref.length) * 2);
  }
  return bytes;
};
if (deployedCode.length !== artifact.runtime.length || normalize(deployedCode) !== normalize(artifact.runtime)) {
  throw new Error('PUBLIC_CONTRACT_RUNTIME_MISMATCH');
}
const registry = new Contract(manifest.contractAddress, artifact.abi, signer);
if ((await registry.operator()).toLowerCase() !== signer.address.toLowerCase()
  || await registry.APPLICATION() !== keccak256(toUtf8Bytes(manifest.application))) {
  throw new Error('PUBLIC_CONTRACT_BINDING_MISMATCH');
}
// Public, non-personal operational observations only; never send account/profile/capability data.
do {
  let activity = { application: manifest.application, observation: 'public_testnet_connected',
    block: await provider.getBlockNumber() };
  if (process.env.BETTEX_TESTNET_ACTIVITY_URL) {
    const url = new URL(process.env.BETTEX_TESTNET_ACTIVITY_URL);
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('ACTIVITY_SOURCE_MUST_BE_INTERNAL');
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
      if (response.ok) {
        const body = await response.json();
        if (!Number.isSafeInteger(body.sessions) || body.sessions < 0
          || !Number.isSafeInteger(body.movements) || body.movements < 0) throw new Error('INVALID_PUBLIC_AGGREGATE');
        const timestamp = typeof body.updatedAt === 'string' ? Date.parse(body.updatedAt) : NaN;
        activity.appActivity = { sessions: body.sessions, movements: body.movements,
          updatedAt: Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null };
      }
    } catch { activity.appActivity = 'unavailable'; }
  }
  const digest = keccak256(toUtf8Bytes(JSON.stringify(activity)));
  const transaction = await registry.checkpoint(digest);
  const receipt = await transaction.wait();
  if (receipt.status !== 1) throw new Error('PUBLIC_CHECKPOINT_REVERTED');
  manifest.lastCheckpointTransaction = receipt.hash;
  manifest.lastCheckpointAt = new Date().toISOString();
  await atomicWrite(manifestFile, manifest);
  console.log(JSON.stringify({ status: 'PUBLIC_TESTNET_CONFIRMED', chainId,
    contractAddress: manifest.contractAddress, transactionHash: receipt.hash,
    explorer: `https://sepolia.arbiscan.io/address/${manifest.contractAddress}`,
    purpose: manifest.purpose, financialOperations: 'simulated' }));
  if (watch) await delay(300_000);
} while (watch);
provider.destroy();
