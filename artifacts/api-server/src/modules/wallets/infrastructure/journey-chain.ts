import { JsonRpcProvider, Contract, Interface, Transaction, keccak256, toQuantity } from "ethers";
import { matchesContractRuntime } from "@workspace/bettex-contracts/runtime";

// Per-process disposable EVM fixture; never redirect production or workspace config.
const URL = process.env.NODE_ENV === "development" && process.env.BETTEX_LOCAL_FIXTURE_URL
  ? process.env.BETTEX_LOCAL_FIXTURE_URL : "http://127.0.0.1:3001";
const provider = new JsonRpcProvider(URL, undefined, { cacheTimeout: -1 });
const erc = new Interface([
  "function balanceOf(address) view returns(uint256)", "function allowance(address,address) view returns(uint256)",
  "function approve(address,uint256) returns(bool)", "function transfer(address,uint256) returns(bool)",
  "event Transfer(address indexed from,address indexed to,uint256 value)",
  "event Approval(address indexed owner,address indexed spender,uint256 value)",
]);
const saleInterface = new Interface([
  "function authorizeBuyer(address,address)", "function authorizedRecipient(address) view returns(address)",
  "function buyTo(address,uint256,uint256,bytes32)",
  "event PrimaryPurchase(bytes32 indexed operationId,address indexed buyer,address indexed recipient,bool appChannel,uint256 tokenUnits,uint256 principalUsdc,uint256 feeUsdc)",
  "function paused() view returns(bool)", "function inventory() view returns(uint256,uint256,uint256,uint256,uint256)",
  "function pricePerWholeTokenUsdc() view returns(uint256)", "function APP_FEE_USDC() view returns(uint256)",
  "function sold() view returns(uint256)",
  "event BuyerAuthorization(address indexed payer,address indexed recipient)",
]);
export type LocalMetadata = {
  epoch: string; environment: string; chainId: number; token: string; sale: string; usdc: string;
  treasury: string; operating: string; reserve: string; deploymentBlock: number; distributionGuard?: string;
};
export const journeyChain = {
  provider, erc, saleInterface,
  encode(kind: "approve" | "buy" | "authorize" | "transfer" | "withdraw" | "guard-pay", values: unknown[]) {
    if (kind === "guard-pay") return new Interface(["function pay(bytes32,uint256,address,address,uint256,uint256)"])
      .encodeFunctionData("pay", values);
    if (kind === "withdraw") return new Interface(["function withdraw(address,address,uint256,bytes32)"])
      .encodeFunctionData("withdraw", values);
    return (kind === "buy" || kind === "authorize" ? saleInterface : erc)
      .encodeFunctionData({ approve: "approve", buy: "buyTo", authorize: "authorizeBuyer", transfer: "transfer" }[kind], values);
  },
  async verifyEffects(name: string, hash: string, meta: LocalMetadata, draft: Record<string, string | number>,
    operation: { id: string; quantity: string; principal: string; fee: string;
      intent?: { asset: "USDC" | "BETTEX"; destination: string; units: string; executor: string; deposit: string; holder: string } }) {
    const receipt = await provider.getTransactionReceipt(hash);
    if (!receipt || receipt.status !== 1) throw new Error("receipt_pending");
    const matches = (token: string, from: string, to: string, value: string) => receipt.logs.some(log => {
      if (log.address.toLowerCase() !== token.toLowerCase()) return false;
      try {
        const parsed = erc.parseLog(log);
        return parsed?.name === "Transfer" && String(parsed.args[0]).toLowerCase() === from.toLowerCase()
          && String(parsed.args[1]).toLowerCase() === to.toLowerCase() && String(parsed.args[2]) === value;
      } catch { return false; }
    });
    if (["withdraw", "approve-usdc-withdraw", "approve-bettex-withdraw"].includes(name)) {
      const intent = operation.intent;
      if (!intent) throw new Error("withdrawal_intent_missing");
      if (name === "withdraw") {
        const iface = new Interface(["event Withdrawal(bytes32 indexed operationId,address indexed payer,address indexed recipient,address asset,address holder,uint256 amount,uint256 fee)"]);
        const events = receipt.logs.filter(l => l.address.toLowerCase() === intent.executor.toLowerCase())
          .map(l => { try { return iface.parseLog(l); } catch { return null; } });
        const event = events.find(e => e?.name === "Withdrawal");
        const asset = intent.asset === "USDC" ? meta.usdc : meta.token;
        const sender = intent.asset === "USDC" ? intent.deposit : intent.holder;
        if (!event || String(event.args[0]) !== operation.id
          || String(event.args[1]).toLowerCase() !== intent.deposit.toLowerCase()
          || String(event.args[2]).toLowerCase() !== intent.destination.toLowerCase()
          || String(event.args[3]).toLowerCase() !== asset.toLowerCase()
          || String(event.args[4]).toLowerCase() !== intent.holder.toLowerCase()
          || String(event.args[5]) !== intent.units || String(event.args[6]) !== operation.fee
          || !matches(meta.usdc, intent.deposit, meta.operating, operation.fee)
          || !matches(asset, sender, intent.destination, intent.units)) throw new Error("withdrawal_effects_mismatch");
      } else {
        const asset = name === "approve-bettex-withdraw" ? meta.token : meta.usdc;
        const sender = name === "approve-bettex-withdraw" ? intent.holder : intent.deposit;
        const expected = name === "approve-bettex-withdraw" ? intent.units
          : String(BigInt(operation.fee) + (intent.asset === "USDC" ? BigInt(intent.units) : 0n));
        if (!receipt.logs.some(l => {
          if (l.address.toLowerCase() !== asset.toLowerCase()) return false;
          try { const e = erc.parseLog(l); return e?.name === "Approval"
            && String(e.args[0]).toLowerCase() === sender.toLowerCase()
            && String(e.args[1]).toLowerCase() === intent.executor.toLowerCase()
            && String(e.args[2]) === expected; } catch { return false; }
        })) throw new Error("approval_effects_mismatch");
      }
    } else if (name === "buy") {
      const intent = saleInterface.parseTransaction({ data: String(draft.data) })!;
      const purchase = receipt.logs.filter(log => log.address.toLowerCase() === meta.sale.toLowerCase())
        .map(log => { try { return saleInterface.parseLog(log); } catch { return null; } })
        .find(log => log?.name === "PrimaryPurchase");
      const units = String(BigInt(operation.quantity) * 10n ** 18n);
      if (!purchase || String(purchase.args[0]) !== operation.id || !purchase.args[3]
        || String(purchase.args[2]).toLowerCase() !== String(intent.args[0]).toLowerCase()
        || String(purchase.args[4]) !== units || String(purchase.args[5]) !== operation.principal
        || String(purchase.args[6]) !== operation.fee
        || !matches(meta.token, meta.sale, String(intent.args[0]), units)
        || !matches(meta.usdc, String(purchase.args[1]), meta.treasury, operation.principal)
        || !matches(meta.usdc, String(purchase.args[1]), meta.operating, operation.fee)) throw new Error("purchase_effects_mismatch");
    } else if (name === "distribution") {
      if (meta.distributionGuard && String(draft.to).toLowerCase() === meta.distributionGuard.toLowerCase()) {
        const iface = new Interface(["function pay(bytes32,uint256,address,address,uint256,uint256)",
          "event Paid(bytes32 indexed id,uint256 indexed roundStart,address indexed holder,address recipient,uint256 units)"]);
        const intent = iface.parseTransaction({ data: String(draft.data) })!;
        const event = receipt.logs.filter(l => l.address.toLowerCase() === meta.distributionGuard!.toLowerCase())
          .map(l => { try { return iface.parseLog(l); } catch { return null; } }).find(e => e?.name === "Paid");
        if (!event || String(event.args[0]) !== operation.id || String(event.args[1]) !== String(intent.args[1])
          || String(event.args[2]).toLowerCase() !== String(intent.args[2]).toLowerCase()
          || String(event.args[3]).toLowerCase() !== String(intent.args[3]).toLowerCase()
          || String(event.args[4]) !== operation.principal
          || !matches(meta.usdc, meta.treasury, String(intent.args[3]), operation.principal)) throw new Error("distribution_effects_mismatch");
        return;
      }
      const intent = erc.parseTransaction({ data: String(draft.data) })!;
      const tx = await provider.getTransaction(hash);
      if (!tx || String(intent.args[1]) !== operation.principal
        || ![meta.reserve, meta.treasury].some(a => a.toLowerCase() === tx.from.toLowerCase())
        || !matches(meta.usdc, tx.from, String(intent.args[0]), operation.principal)) throw new Error("distribution_effects_mismatch");
    } else if (name === "usdc-deposit") {
      const intent = erc.parseTransaction({ data: String(draft.data) })!;
      if (!matches(meta.usdc, meta.reserve, String(intent.args[0]), String(intent.args[1]))) throw new Error("deposit_effects_mismatch");
    } else if (name === "approve") {
      const intent = erc.parseTransaction({ data: String(draft.data) })!;
      const valid = receipt.logs.some(log => {
        if (log.address.toLowerCase() !== meta.usdc.toLowerCase()) return false;
        try { const p = erc.parseLog(log); return p?.name === "Approval" && String(p.args[1]).toLowerCase() === meta.sale.toLowerCase()
          && String(p.args[2]) === String(intent.args[1]); } catch { return false; }
      });
      if (!valid) throw new Error("approval_effects_mismatch");
    } else if (name === "authorize") {
      const intent = saleInterface.parseTransaction({ data: String(draft.data) })!;
      const actual = await new Contract(meta.sale, saleInterface, provider).getFunction("authorizedRecipient")(intent.args[0], { blockTag: receipt.blockNumber });
      if (String(actual).toLowerCase() !== String(intent.args[1]).toLowerCase()) throw new Error("recipient_mismatch");
    }
  },
  async metadata(): Promise<LocalMetadata> {
    const response = await fetch(`${URL}/metadata`, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw new Error("reserve_unavailable");
    const result = await response.json() as LocalMetadata;
    if (result.chainId !== 31337 || result.environment !== "local_evm" || (await provider.getNetwork()).chainId !== 31337n) {
      throw new Error("wrong_network");
    }
    if (result.distributionGuard) {
      if (!matchesContractRuntime(await provider.getCode(result.distributionGuard), "BettexTestDistributionGuard")
        || !matchesContractRuntime(await provider.getCode(result.token), "BettexGuardedTestToken")) throw new Error("invalid_source");
      const guard = new Contract(result.distributionGuard, [
        "function token() view returns(address)", "function usdc() view returns(address)",
        "function treasury() view returns(address)", "function owner() view returns(address)",
      ], provider);
      const values = await Promise.all(["token", "usdc", "treasury", "owner"].map(n => guard.getFunction(n)()));
      if (values.some((v, i) => String(v).toLowerCase() !== [result.token, result.usdc, result.treasury, result.treasury][i]!.toLowerCase())) throw new Error("invalid_source");
    }
    return result;
  },
  async exitNonce(meta: LocalMetadata, holder: string, blockTag: number) {
    return String(await new Contract(meta.token, ["function exitNonce(address) view returns(uint256)"], provider)
      .getFunction("exitNonce")(holder, { blockTag }));
  },
  async authorizeRound(meta: LocalMetadata, start: number, budget: string) {
    if (!meta.distributionGuard || process.env.NODE_ENV !== "development"
      || process.env.BETTEX_EXECUTION_PAUSED === "true") throw new Error("operations_paused");
    const guard = new Contract(meta.distributionGuard, ["function budgets(uint256) view returns(uint256)",
      "function authorizeRound(uint256,uint256)"], await provider.getSigner(meta.treasury));
    const existing = BigInt(await guard.getFunction("budgets")(start));
    if (existing > 0n) { if (existing !== BigInt(budget)) throw new Error("operation_conflict"); return; }
    const receipt = await (await guard.getFunction("authorizeRound")(start, BigInt(budget))).wait();
    if (!receipt || receipt.status !== 1) throw new Error("receipt_pending");
  },
  async draft(sender: string, to: string, data: string, value = "0") {
    const request = { from: sender, to, data, value: BigInt(value) };
    const [nonce, block, gasLimit, gasPrice] = await Promise.all([
      provider.getTransactionCount(sender, "pending"), provider.getBlockNumber(), provider.estimateGas(request).catch(async error => {
        if (await provider.getBalance(sender) === 0n) throw new Error("gas_insufficient");
        throw error;
      }),
      provider.send("eth_gasPrice", []),
    ]);
    if (await provider.getBalance(sender) < BigInt(value) + gasLimit * 12n / 10n * BigInt(gasPrice)) throw new Error("gas_insufficient");
    return { nonce, block, draft: { chainId: 31337, to, data, value, gasLimit: String(gasLimit * 12n / 10n), gasPrice: String(BigInt(gasPrice)) } };
  },
  async sendOperator(draft: Record<string, string | number>, sender: string) {
    if (process.env.BETTEX_EXECUTION_PAUSED === "true") throw new Error("operations_paused");
    return provider.send("eth_sendTransaction", [{
      from: sender, to: draft.to, data: draft.data, value: toQuantity(BigInt(draft.value)),
      gas: toQuantity(BigInt(draft.gasLimit)), gasPrice: toQuantity(BigInt(draft.gasPrice)), nonce: toQuantity(Number(draft.nonce)),
    }]) as Promise<string>;
  },
  validateSigned(raw: string, sender: string, draft: Record<string, string | number>) {
    const tx = Transaction.from(raw);
    if (tx.from?.toLowerCase() !== sender.toLowerCase() || tx.chainId !== 31337n
      || tx.to?.toLowerCase() !== String(draft.to).toLowerCase() || tx.data !== draft.data
      || tx.value !== BigInt(draft.value) || tx.nonce !== Number(draft.nonce)
      || tx.gasLimit !== BigInt(draft.gasLimit) || tx.gasPrice !== BigInt(draft.gasPrice)) throw new Error("transaction_mismatch");
    return keccak256(raw);
  },
  async sendSigned(raw: string) {
    if (process.env.BETTEX_EXECUTION_PAUSED === "true") throw new Error("operations_paused");
    return (await provider.broadcastTransaction(raw)).hash;
  },
  async receipt(hash: string) { return provider.getTransactionReceipt(hash); },
  async recover(sender: string, nonce: number, from: number) {
    const end = await provider.getBlockNumber();
    if (end - from > 2000) throw new Error("reconciliation_required");
    for (let height = from; height <= end; height++) {
      const block = await provider.getBlock(height, true);
      const tx = block?.prefetchedTransactions.find(t => t.from.toLowerCase() === sender.toLowerCase() && t.nonce === nonce);
      if (tx) return tx;
    }
    return null;
  },
  async balance(token: string, address: string, blockTag: number) {
    return String(await new Contract(token, erc, provider).getFunction("balanceOf")(address, { blockTag }));
  },
  async allowance(meta: LocalMetadata, address: string, token = meta.usdc, spender = meta.sale) {
    return BigInt(await new Contract(token, erc, provider).getFunction("allowance")(address, spender));
  },
  async sale(meta: LocalMetadata, blockTag: number) {
    const contract = new Contract(meta.sale, saleInterface, provider);
    const [inventory, price, fee, paused] = await Promise.all([
      contract.getFunction("inventory")({ blockTag }), contract.getFunction("pricePerWholeTokenUsdc")({ blockTag }),
      contract.getFunction("APP_FEE_USDC")({ blockTag }), contract.getFunction("paused")({ blockTag }),
    ]);
    return { price: String(price), fee: String(fee), available: String(inventory[4]), sold: String(inventory[3]), paused: Boolean(paused) };
  },
  async purchases(meta: LocalMetadata, blockTag: number) {
    const logs = await provider.getLogs({ address: meta.sale, fromBlock: meta.deploymentBlock, toBlock: blockTag,
      topics: [saleInterface.getEvent("PrimaryPurchase")!.topicHash] });
    return logs.map(log => {
      const event = saleInterface.parseLog(log)!;
      return { hash: log.transactionHash, blockNumber: log.blockNumber, blockHash: log.blockHash, logIndex: log.index,
        operationId: String(event.args[0]), buyer: String(event.args[1]), recipient: String(event.args[2]),
        tokenUnits: String(event.args[4]), principal: String(event.args[5]), fee: String(event.args[6]) };
    });
  },
  async verifyReceipt(hash: string, sender: string, draft: Record<string, string | number>) {
    const [receipt, tx] = await Promise.all([provider.getTransactionReceipt(hash), provider.getTransaction(hash)]);
    if (!receipt || !tx) return null;
    const block = await provider.getBlock(receipt.blockNumber);
    if (block?.hash !== receipt.blockHash) throw new Error("chain_reorganized");
    if (tx.from.toLowerCase() !== sender.toLowerCase() || tx.to?.toLowerCase() !== String(draft.to).toLowerCase()
      || tx.nonce !== Number(draft.nonce) || tx.data !== draft.data || tx.value !== BigInt(draft.value)) throw new Error("transaction_mismatch");
    return receipt;
  },
  async logs(meta: LocalMetadata, token: string, address: string, blockTag: number) {
    const result = await provider.getLogs({ address: token, fromBlock: meta.deploymentBlock, toBlock: blockTag,
      topics: [erc.getEvent("Transfer")!.topicHash] });
    const events = [];
    for (const log of result) {
      const parsed = erc.parseLog(log);
      if (!parsed || log.removed) continue;
      const from = String(parsed.args[0]), to = String(parsed.args[1]);
      if (address !== "*" && ![from.toLowerCase(), to.toLowerCase()].includes(address.toLowerCase())) continue;
      const block = await provider.getBlock(log.blockNumber);
      if (!block?.hash || block.hash !== log.blockHash) throw new Error("chain_reorganized");
      events.push({ id: `${log.transactionHash}:${log.index}:${log.blockHash}`, hash: log.transactionHash,
        from, to, value: String(parsed.args[2]), timestamp: block.timestamp,
        blockNumber: log.blockNumber, logIndex: log.index, blockHash: log.blockHash });
    }
    return events;
  },
};
