import { BrowserProvider, Contract, hexlify, randomBytes, getAddress, type Eip1193Provider } from "ethers";
import { getTestContract, type TestContractState } from "@workspace/api-client-react";

const USDC = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
const saleAbi = [
  "function authorizedRecipient(address) view returns(address)",
  "function paused() view returns(bool)",
  "function processed(address,bytes32) view returns(bool)",
  "function pricePerWholeTokenUsdc() view returns(uint256)",
  "function APP_FEE_USDC() view returns(uint256)",
  "function buyTo(address,uint256,uint256,bytes32)",
];
type PendingPurchase = {
  id: string; payer: string; recipient: string; quantity: string;
  approvalHash?: string; transactionHash?: string; purchaseSubmitted?: boolean;
};

/** Only a user-owned browser wallet signs. No backend key, automatic retry or mainnet. */
export async function purchaseTestTokens(
  accountId: string, recipientInput: string, quantityInput: string,
  phase: (value: "checking" | "approval" | "purchase" | "reconciliation") => void,
): Promise<string> {
  if (!navigator.locks) throw new Error("browser_lock_required");
  return navigator.locks.request(`bettex-test-purchase:${accountId}`, async () => {
    phase("checking");
    if (!/^[1-9]\d*$/.test(quantityInput) || BigInt(quantityInput) > 650_000_000n) throw new Error("invalid_quantity");
    const recipient = getAddress(recipientInput);
    const state: TestContractState = await getTestContract();
    if (!state.configured || state.chainId !== 421614 || !state.address || state.paused) throw new Error("sale_unavailable");
    const saleAddress = state.allocations.find(a => a.kind === "public")?.address;
    if (!saleAddress) throw new Error("sale_unavailable");
    const injected = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
    if (!injected) throw new Error("wallet_missing");
    const provider = new BrowserProvider(injected);
    if ((await provider.getNetwork()).chainId !== 421614n) throw new Error("wrong_network");
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const payer = await signer.getAddress();
    const sale = new Contract(saleAddress, saleAbi, signer);
    if (await sale.getFunction("paused")()
        || getAddress(await sale.getFunction("authorizedRecipient")(payer)) !== recipient) throw new Error("unauthorized_buyer");
    const quantity = BigInt(quantityInput);
    if (quantity * 10n ** 18n > BigInt(state.allocations.find(a => a.kind === "public")!.available)) {
      throw new Error("insufficient_inventory");
    }
    const price = BigInt(await sale.getFunction("pricePerWholeTokenUsdc")());
    const fee = BigInt(await sale.getFunction("APP_FEE_USDC")());
    if (price !== BigInt(state.priceUsdc!) || fee !== 2_500_000n) throw new Error("quote_changed");
    const total = quantity * price + fee;
    const stablecoin = new Contract(USDC, [
      "function balanceOf(address) view returns(uint256)",
      "function allowance(address,address) view returns(uint256)",
      "function approve(address,uint256) returns(bool)",
    ], signer);
    const key = `bettex-test-purchase:${accountId}:421614:${state.address.toLowerCase()}:${payer.toLowerCase()}`;
    const saved = localStorage.getItem(key);
    let operation: PendingPurchase = saved ? JSON.parse(saved) : {
      id: hexlify(randomBytes(32)), payer, recipient, quantity: quantityInput,
    };
    if (operation.payer !== payer || operation.recipient !== recipient || operation.quantity !== quantityInput) {
      if (operation.transactionHash || operation.purchaseSubmitted) throw new Error("previous_operation_pending");
      if (operation.approvalHash && !(await provider.getTransactionReceipt(operation.approvalHash))) {
        throw new Error("transaction_pending");
      }
      operation = { id: hexlify(randomBytes(32)), payer, recipient, quantity: quantityInput };
    }
    const persist = () => localStorage.setItem(key, JSON.stringify(operation));
    // Persist the nonce before opening any signing dialog.
    persist();
    if (await sale.getFunction("processed")(payer, operation.id)) {
      localStorage.removeItem(key);
      return operation.transactionHash ?? "";
    }
    const reconcile = async (hash: string) => {
      phase("reconciliation");
      const receipt = await provider.getTransactionReceipt(hash);
      if (!receipt) throw new Error("transaction_pending");
      if (receipt.status !== 1) {
        localStorage.removeItem(key); // Confirmed revert, never assume refund on timeout.
        throw new Error("transaction_reverted");
      }
    };
    if (operation.transactionHash) {
      await reconcile(operation.transactionHash);
      localStorage.removeItem(key);
      return operation.transactionHash;
    }
    if (operation.purchaseSubmitted) throw new Error("unknown_transaction");
    if (operation.approvalHash) await reconcile(operation.approvalHash);
    if (BigInt(await stablecoin.getFunction("balanceOf")(payer)) < total) throw new Error("insufficient_usdc");
    if (BigInt(await stablecoin.getFunction("allowance")(payer, saleAddress)) < total) {
      phase("approval");
      const approval = await stablecoin.getFunction("approve")(saleAddress, total);
      operation.approvalHash = approval.hash;
      persist();
      await approval.wait(1);
    }
    // A network switch or revocation between dialogs must fail, not send elsewhere.
    if ((await provider.getNetwork()).chainId !== 421614n) throw new Error("wrong_network");
    phase("purchase");
    operation.purchaseSubmitted = true;
    persist();
    let purchase;
    try {
      purchase = await sale.getFunction("buyTo")(recipient, quantity, total, operation.id);
    } catch (error) {
      const cause = error as { code?: string; action?: string };
      if (cause.code === "ACTION_REJECTED" || (cause.code === "CALL_EXCEPTION" && cause.action === "estimateGas")) {
        operation.purchaseSubmitted = false;
        persist();
      }
      throw error; // Uncertain broadcast retains its original ID and blocks another send.
    }
    operation.transactionHash = purchase.hash;
    persist();
    phase("reconciliation");
    const receipt = await purchase.wait(1);
    if (receipt?.status !== 1) throw new Error("transaction_reverted");
    localStorage.removeItem(key);
    return purchase.hash;
  });
}
