import { Contract, Interface, JsonRpcProvider, getAddress, type Provider } from "ethers";
import artifacts from "@workspace/bettex-contracts/verified-artifacts" with { type: "json" };
import type { TestContractState, TestContractAllocation } from "@workspace/api-zod";
import {
  InvalidTestContract, TEST_CONTRACT_CHAIN, TEST_CONTRACT_VERSION,
  type ContractReader, type ContractEvidence,
} from "../application/test-contracts";

type ArtifactName = keyof typeof artifacts;
const rpc = new JsonRpcProvider("https://sepolia.arbitrum.io/rpc", undefined, {
  batchMaxCount: 20, cacheTimeout: -1,
});
const usdcAddress = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

// Runtime comparison excludes only compiler-declared immutable slots.
export function matchesContractRuntime(code: string, name: ArtifactName) {
  const artifact = artifacts[name];
  if (code.length !== artifact.runtime.length) return false;
  const normalize = (value: string) => {
    let bytes = value.slice(2).toLowerCase();
    for (const references of Object.values(artifact.immutableReferences)) {
      for (const ref of references) bytes = bytes.slice(0, ref.start * 2)
        + "0".repeat(ref.length * 2) + bytes.slice((ref.start + ref.length) * 2);
    }
    return bytes;
  };
  return normalize(code) === normalize(artifact.runtime);
}

export function createTestContractReader(provider: Provider = rpc, expectedChain = TEST_CONTRACT_CHAIN): ContractReader {
  return {
    async read(rawAddress) {
      let address: string;
      try { address = getAddress(rawAddress); } catch { throw new InvalidTestContract("invalid_address"); }
      if ((await provider.getNetwork()).chainId !== BigInt(expectedChain)) throw new InvalidTestContract("wrong_network");
      const head = await provider.getBlock("latest");
      if (!head?.hash) throw new Error("block_unavailable");
      const blockTag = head.number;
      const open = async (target: string, name: ArtifactName) => {
        if (!matchesContractRuntime(await provider.getCode(target, blockTag), name)) {
          throw new InvalidTestContract("invalid_source");
        }
        return new Contract(target, artifacts[name].abi, provider);
      };
      const call = async (contract: Contract, name: string, args: unknown[] = []): Promise<any> =>
        contract.getFunction(name)(...args, { blockTag });
      const token = await open(address, "BettexTestToken");
      const [saleAddress, founderAddress, investorAddress, totalSupply, symbol, genesis] = await Promise.all([
        call(token, "publicSale"), call(token, "founderVault"), call(token, "investorVault"),
        call(token, "totalSupply"), call(token, "symbol"), call(token, "GENESIS_SUPPLY"),
      ]);
      if (genesis !== 1_000_000_000n * 10n ** 18n || totalSupply > genesis || symbol !== "tBETTEX") {
        throw new InvalidTestContract("invalid_economics");
      }
      const [sale, founder, investor] = await Promise.all([
        open(saleAddress, "BettexPrimarySale"), open(founderAddress, "BettexAllocationVault"),
        open(investorAddress, "BettexAllocationVault"),
      ]);
      // Matching runtime alone does not bind compiler-immutable constructor values.
      const links = await Promise.all([sale, founder, investor].map(c => call(c, "token")));
      const shares = await Promise.all([call(founder, "groupShare"), call(investor, "groupShare")]);
      if (links.some(target => target.toLowerCase() !== address.toLowerCase()) || shares[0] !== 4n || shares[1] !== 3n) {
        throw new InvalidTestContract("invalid_allocation");
      }
      const [inventory, treasury, operatingWallet, priceUsdc, feeUsdc, paused, currentMonth, stablecoin] = await Promise.all([
        call(sale, "inventory"), call(sale, "treasury"), call(sale, "operatingWallet"),
        call(sale, "pricePerWholeTokenUsdc"), call(sale, "APP_FEE_USDC"), call(sale, "paused"),
        call(sale, "currentMonth"), call(sale, "usdc"),
      ]);
      if (expectedChain === TEST_CONTRACT_CHAIN && stablecoin.toLowerCase() !== usdcAddress.toLowerCase()) {
        throw new InvalidTestContract("invalid_usdc");
      }
      const allocations: TestContractAllocation[] = [{
        kind: "public", address: saleAddress, beneficiary: treasury, total: String(inventory[0]),
        locked: String(inventory[1]), released: String(inventory[2]), available: String(inventory[4]),
      }];
      for (const [vault, target, kind, total] of [
        [founder, founderAddress, "founder", 200_000_000n * 10n ** 18n],
        [investor, investorAddress, "investors", 150_000_000n * 10n ** 18n],
      ] as const) {
        const [beneficiary, released, available] = await Promise.all([
          call(vault, "beneficiary"), call(vault, "released"), call(vault, "releasable"),
        ]);
        allocations.push({ kind, address: target, beneficiary, total: String(total),
          released: String(released + available), locked: String(total - released - available), available: String(available) });
      }
      const nextRelease = Number(currentMonth) < 36 ? Number(await call(sale, "releaseTime", [Number(currentMonth)])) : undefined;
      const historyFromBlock = Math.max(0, blockTag - 1999);
      const interfaces = new Map([
        [address.toLowerCase(), new Interface(artifacts.BettexTestToken.abi)],
        [saleAddress.toLowerCase(), new Interface(artifacts.BettexPrimarySale.abi)],
        [founderAddress.toLowerCase(), new Interface(artifacts.BettexAllocationVault.abi)],
        [investorAddress.toLowerCase(), new Interface(artifacts.BettexAllocationVault.abi)],
      ]);
      const events: ContractEvidence[] = [];
      const logs = await provider.getLogs({ address: [address, saleAddress, founderAddress, investorAddress],
        fromBlock: historyFromBlock, toBlock: blockTag });
      for (const log of logs) {
        const parsed = interfaces.get(log.address.toLowerCase())?.parseLog(log);
        if (!parsed || log.removed) continue;
        const values = Object.fromEntries(parsed.fragment.inputs.map((input, index) =>
          [input.name || String(index), typeof parsed.args[index] === "bigint" ? parsed.args[index].toString() : parsed.args[index]]));
        events.push({ name: parsed.name, transactionHash: log.transactionHash, blockHash: log.blockHash,
          blockNumber: log.blockNumber, logIndex: log.index, address: log.address, values: JSON.stringify(values) });
      }
      // Never mix state from an orphaned block with fresh confirmation.
      if ((await provider.getBlock(blockTag))?.hash !== head.hash) throw new Error("chain_reorganized");
      const state: TestContractState = {
        configured: true, chainId: expectedChain, version: TEST_CONTRACT_VERSION, address, symbol,
        blockNumber: blockTag, blockHash: head.hash, paused, totalSupply: String(totalSupply),
        sold: String(inventory[3]), priceUsdc: String(priceUsdc), feeUsdc: String(feeUsdc),
        treasury, operatingWallet, currentMonth: Number(currentMonth), nextRelease,
         allocations, historyFromBlock, historyPartial: historyFromBlock > 0 || events.length > 50, events: events.slice(-50).reverse(),
      };
      return { address: address.toLowerCase(), state, events };
    },
  };
}
