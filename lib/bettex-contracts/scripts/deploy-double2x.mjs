import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Wallet, JsonRpcProvider, Contract, ContractFactory, MaxUint256, parseEther, formatEther } from 'ethers';
import { compileContracts } from './compile.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const dir = `${root}.local/bettex-double2x`;
const rpc = new JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc', 421614, { staticNetwork: true });
if (Number(BigInt(await rpc.send('eth_chainId', []))) !== 421614) throw new Error('TESTNET_ONLY');
if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET_REQUIRED');
await mkdir(dir, { recursive: true, mode: 0o700 });
const write = async (name, value) => {
    await writeFile(`${dir}/${name}.tmp`, JSON.stringify(value, null, 2), { mode: 0o600 });
    await rename(`${dir}/${name}.tmp`, `${dir}/${name}`);
};
const keyFor = label => createHash('sha256').update(process.env.SESSION_SECRET).update(label).digest();
const unlock = (stored, label) => {
    const decipher = createDecipheriv('aes-256-gcm', keyFor(label), Buffer.from(stored.iv, 'hex'));
    decipher.setAAD(Buffer.from(label));
    decipher.setAuthTag(Buffer.from(stored.tag, 'hex'));
    const signer = new Wallet(Buffer.concat([decipher.update(Buffer.from(stored.ciphertext, 'hex')), decipher.final()]).toString(), rpc);
    if (signer.address !== stored.address) throw new Error('OPERATOR_MISMATCH');
    return signer;
};
const label = 'BETTEX_DOUBLE2X_OPERATOR_V1';
let signer;
try { signer = unlock(JSON.parse(await readFile(`${dir}/operator.enc.json`, 'utf8')), label); }
catch (e) {
    if (e.code !== 'ENOENT') throw e;
    signer = Wallet.createRandom().connect(rpc);
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', keyFor(label), iv);
    cipher.setAAD(Buffer.from(label));
    const ciphertext = Buffer.concat([cipher.update(signer.privateKey, 'utf8'), cipher.final()]);
    await write('operator.enc.json', { address: signer.address, iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex'), ciphertext: ciphertext.toString('hex') });
}
let manifest = { chainId: 421614, network: 'Arbitrum Sepolia', operatorAddress: signer.address,
    treasuryAddress: signer.address, entropyAddress: '0x549ebba8036ab746611b4ffa1423eb0a4df61440',
    randomnessProvider: '0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344', purpose: 'isolated_double2x_test_token_escrow' };
try { manifest = JSON.parse(await readFile(`${dir}/deployment.json`, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
if (manifest.chainId !== 421614 || manifest.operatorAddress !== signer.address) throw new Error('MANIFEST_MISMATCH');
await write('deployment.json', manifest);
const source = unlock(JSON.parse(await readFile(`${root}.local/bettex-public-testnet/operator.enc.json`, 'utf8')), 'BETTEX_PUBLIC_TESTNET_OPERATOR_V1');
if (process.argv.includes('--top-up')) {
    const value = parseEther('0.0005');
    if (await rpc.getBalance(source.address) < value + parseEther('0.0004')) throw new Error('PRESERVE_REGISTRY_TEST_GAS');
    const tx = await source.sendTransaction({ to: signer.address, value });
    (manifest.gasTopUps ??= []).push(tx.hash);
    await write('deployment.json', manifest);
    const receipt = await tx.wait(1);
    if (!receipt || receipt.status !== 1) throw new Error('TOP_UP_NOT_CONFIRMED');
    console.log(JSON.stringify({ status: 'DOUBLE2X_TEST_GAS_REPLENISHED', transaction: tx.hash, balanceTestEth: formatEther(await rpc.getBalance(signer.address)) }));
    rpc.destroy(); process.exit(0);
}
if (process.argv.includes('--bridge')) {
    // Explicitly selected public testnet. Never transfer any mainnet currency.
    const parent = new JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com', 11155111, { staticNetwork: true });
    if (Number(BigInt(await parent.send('eth_chainId', []))) !== 11155111) throw new Error('TESTNET_ONLY');
    if (!manifest.bridgeHash) {
        const inbox = new Contract('0xaAe29B0366299461418F5324a79Afc425BE5ae21', ['function bridge() view returns(address)', 'function depositEth() payable returns(uint256)'], source.connect(parent));
        if ((await inbox.bridge()).toLowerCase() !== '0x38f918d0e9f1b721edaa41302e399fa1b79333a9') throw new Error('INBOX_MISMATCH');
        const value = parseEther('0.0015');
        const gas = await inbox.depositEth.estimateGas({ value });
        const fees = await parent.getFeeData();
        if (value + gas * (fees.maxFeePerGas ?? fees.gasPrice) * 120n / 100n > await parent.getBalance(source.address)) throw new Error('INSUFFICIENT_PARENT_TEST_ETH');
        const tx = await inbox.depositEth({ value, gasLimit: gas * 120n / 100n });
        manifest.bridgeHash = tx.hash;
        await write('deployment.json', manifest);
    }
    const receipt = await parent.waitForTransaction(manifest.bridgeHash, 1, 180000);
    if (!receipt || receipt.status !== 1) throw new Error('BRIDGE_NOT_CONFIRMED');
    console.log(JSON.stringify({ status: 'TEST_ETH_BRIDGED', transaction: manifest.bridgeHash }));
    parent.destroy();
}
if (await rpc.getBalance(signer.address) < parseEther('0.0008')) {
    for (let n = 0; await rpc.getBalance(source.address) < parseEther('0.0012') && n < 240; n++) await new Promise(r => setTimeout(r, 5000));
    if (await rpc.getBalance(source.address) < parseEther('0.0012')) throw new Error('AWAITING_L2_TEST_ETH');
    if (!manifest.fundingHash) {
        const tx = await source.sendTransaction({ to: signer.address, value: parseEther('0.0009') });
        manifest.fundingHash = tx.hash;
        await write('deployment.json', manifest);
    }
    const receipt = await rpc.waitForTransaction(manifest.fundingHash, 1, 180000);
    if (!receipt || receipt.status !== 1) throw new Error('FUNDING_NOT_CONFIRMED');
}
const artifacts = await compileContracts();
for (const [field, name, args] of [
    ['tokenAddress', 'Double2XTestUSDC', [signer.address]],
    ['gameAddress', 'BettexDouble2X', () => [manifest.tokenAddress, manifest.treasuryAddress, manifest.entropyAddress, manifest.randomnessProvider]],
]) {
    if (!manifest[field]) {
        const hashField = `${field}DeploymentHash`;
        if (!manifest[hashField]) {
            const contract = await new ContractFactory(artifacts[name].abi, artifacts[name].bytecode, signer).deploy(...(typeof args === 'function' ? args() : args));
            manifest[hashField] = contract.deploymentTransaction().hash;
            manifest[field] = await contract.getAddress();
            await write('deployment.json', manifest);
            await contract.waitForDeployment();
        }
    }
    const receipt = await rpc.getTransactionReceipt(manifest[`${field}DeploymentHash`]);
    if (!receipt || receipt.status !== 1 || await rpc.getCode(manifest[field]) === '0x') throw new Error('DEPLOYMENT_NOT_CONFIRMED');
}
const token = new Contract(manifest.tokenAddress, artifacts.Double2XTestUSDC.abi, signer);
if (await token.allowance(signer.address, manifest.gameAddress) < 1_000_000n * 1_000_000n) {
    const tx = await token.approve(manifest.gameAddress, MaxUint256);
    manifest.approvalHash = tx.hash; await write('deployment.json', manifest);
    await tx.wait(1);
}
manifest.ready = true;
await write('deployment.json', manifest);
console.log(JSON.stringify({ status: 'DOUBLE2X_PUBLIC_TESTNET_READY', game: manifest.gameAddress, token: manifest.tokenAddress,
    treasury: manifest.treasuryAddress, balanceTestEth: formatEther(await rpc.getBalance(signer.address)) }));
rpc.destroy();
