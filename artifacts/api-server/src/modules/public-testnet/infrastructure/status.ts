import { Contract, FetchRequest, JsonRpcProvider, keccak256, toUtf8Bytes } from "ethers";
import { matchesContractRuntime } from "@workspace/bettex-contracts/runtime";
import { GetDemoTestnetResponse, type DemoTestnet } from "@workspace/api-zod";

const request = new FetchRequest("https://sepolia-rollup.arbitrum.io/rpc");
request.timeout = 6_000;
const rpc = new JsonRpcProvider(request, 421614, { staticNetwork: true, cacheTimeout: -1 });
const abi = ["function APPLICATION() view returns(bytes32)", "function operator() view returns(address)",
  "function lastCheckpointAt() view returns(uint256)", "function checkpoints() view returns(uint256)"];
const validAddress = (value?: string) => value && /^0x[0-9a-fA-F]{40}$/.test(value) ? value : null;
let cached: { until: number; value: DemoTestnet } | undefined;
let pending: Promise<DemoTestnet> | undefined;

async function observe(): Promise<DemoTestnet> {
  const address = validAddress(process.env.BETTEX_PUBLIC_DEMO_CONTRACT_ADDRESS);
  const operator = validAddress(process.env.BETTEX_PUBLIC_DEMO_OPERATOR_ADDRESS);
  const result: DemoTestnet = { status: address ? "validating" : "preparing",
    chainId: 421614, network: "Arbitrum Sepolia", contractAddress: address, operatorAddress: operator,
    explorerUrl: address ? `https://sepolia.arbiscan.io/address/${address}` : null,
    latestBlock: null, lastCheckpointAt: null, checkpointCount: null,
    financialOperations: "simulated", contractPurpose: "demo_activity_registry" };
  if (!address) return result;
  try {
    const [chain, block, code] = await Promise.all([
      rpc.send("eth_chainId", []), rpc.getBlock("latest"), rpc.getCode(address),
    ]);
    if (Number(BigInt(chain)) !== 421614 || !block || Date.now() / 1000 - block.timestamp > 120
      || !matchesContractRuntime(code, "BettexPublicDemo")) throw new Error("public_registry_invalid");
    const registry = new Contract(address, abi, rpc);
    const [app, owner, last, count] = await Promise.all([
      registry.APPLICATION(), registry.operator(), registry.lastCheckpointAt(), registry.checkpoints(),
    ]);
    if (app !== keccak256(toUtf8Bytes("BETTEX_PUBLIC_DEMO_V1"))
      || !operator || owner.toLowerCase() !== operator.toLowerCase()) throw new Error("public_registry_binding_invalid");
    result.latestBlock = block.number;
    result.checkpointCount = Number(count);
    result.lastCheckpointAt = Number(last) ? new Date(Number(last) * 1000) : null;
    result.status = Number(count) > 0 && block.timestamp - Number(last) <= 900 ? "live" : "validating";
  } catch { result.status = "unavailable"; }
  return GetDemoTestnetResponse.parse(result);
}

export async function publicTestnetStatus(): Promise<DemoTestnet> {
  if (cached && cached.until > Date.now()) return cached.value;
  if (pending) return pending;
  pending = observe().then(value => { cached = { value, until: Date.now() + 15_000 }; return value; })
    .finally(() => { pending = undefined; });
  return pending;
}
