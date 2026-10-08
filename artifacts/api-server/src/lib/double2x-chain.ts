import { createDecipheriv, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { Contract, JsonRpcProvider, Wallet, keccak256, toUtf8Bytes, parseEther } from "ethers";

let root = process.cwd();
while (!existsSync(join(root, "pnpm-workspace.yaml")) && dirname(root) !== root) root = dirname(root);
const directory = join(root, ".local/bettex-double2x");
export const doubleProvider = new JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc", 421614, { staticNetwork: true });
export const gameAbi = [
  "function operator() view returns(address)", "function treasury() view returns(address)",
  "function token() view returns(address)", "function entropy() view returns(address)",
  "function randomnessProvider() view returns(address)",
  "function play(bytes32 player,bytes32 id,uint256 stake,uint8 choice) payable returns(uint64)",
  "function plays(bytes32) view returns(bytes32 player,uint256 stake,uint64 sequence,uint64 startedAt,uint64 settledAt,uint8 choice,uint8 result,uint8 status)",
  "event PlaySettled(bytes32 indexed id,uint64 sequence,uint8 result,uint256 payout)",
];
type Manifest = { chainId: number; ready?: boolean; gameAddress: string; tokenAddress: string; operatorAddress: string; treasuryAddress: string; entropyAddress: string; randomnessProvider: string };
let cached: { at: number; value: { manifest: Manifest; game: Contract; fee: bigint; ready: boolean; reason: "ready" | "test_gas_unavailable" } } | undefined;
export async function doubleChain() {
  if (cached && Date.now() - cached.at < 10000) return cached.value;
  const manifest = JSON.parse(await readFile(join(directory, "deployment.json"), "utf8")) as Manifest;
  if (!manifest.ready || !manifest.gameAddress) return null;
  if (manifest.chainId !== 421614 || Number(BigInt(await doubleProvider.send("eth_chainId", []))) !== 421614) throw new Error("DOUBLE2X_CHAIN_MISMATCH");
  const game = new Contract(manifest.gameAddress, gameAbi, doubleProvider);
  const [operator, treasury, token, entropy, provider, code] = await Promise.all([
    game.operator(), game.treasury(), game.token(), game.entropy(), game.randomnessProvider(), doubleProvider.getCode(manifest.gameAddress),
  ]);
  if (code === "0x" || [operator, treasury, token, entropy, provider].some((value, i) => value.toLowerCase() !== [
    manifest.operatorAddress, manifest.treasuryAddress, manifest.tokenAddress, "0x549ebba8036ab746611b4ffa1423eb0a4df61440",
    "0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344",
  ][i]!.toLowerCase())) throw new Error("DOUBLE2X_DEPLOYMENT_MISMATCH");
  if ((await doubleSigner()).address.toLowerCase() !== operator.toLowerCase()) throw new Error("DOUBLE2X_OPERATOR_UNAVAILABLE");
  const oracle = new Contract(entropy, ["function getFeeV2(uint32) view returns(uint128)"], doubleProvider);
  const fee: bigint = await oracle.getFeeV2(400000);
  const ready = await doubleProvider.getBalance(operator) > fee + parseEther("0.00002");
  const value = { manifest, game, fee, ready, reason: ready ? "ready" as const : "test_gas_unavailable" as const };
  cached = { at: Date.now(), value };
  return value;
}
export async function doubleSigner() {
  if (!process.env.SESSION_SECRET) throw new Error("DOUBLE2X_OPERATOR_UNAVAILABLE");
  const stored = JSON.parse(await readFile(join(directory, "operator.enc.json"), "utf8"));
  const label = "BETTEX_DOUBLE2X_OPERATOR_V1";
  const key = createHash("sha256").update(process.env.SESSION_SECRET).update(label).digest();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(stored.iv, "hex"));
  decipher.setAAD(Buffer.from(label));
  decipher.setAuthTag(Buffer.from(stored.tag, "hex"));
  const signer = new Wallet(Buffer.concat([decipher.update(Buffer.from(stored.ciphertext, "hex")), decipher.final()]).toString(), doubleProvider);
  if (signer.address !== stored.address) throw new Error("DOUBLE2X_OPERATOR_MISMATCH");
  return signer;
}
export const gamePlayerKey = (account: string) => keccak256(toUtf8Bytes(`BETTEX_DOUBLE2X_PLAYER:${account}`));
export const gameRequestKey = (account: string, id: string) => keccak256(toUtf8Bytes(`BETTEX_DOUBLE2X_REQUEST:${account}:${id}`));
