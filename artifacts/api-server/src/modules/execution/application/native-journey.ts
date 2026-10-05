// Concrete SDK logic is in wallet infrastructure. These are injected ports only.
type Receipt = { hash: string; status: number | null };
type Metadata = { epoch: string; chainId: number; environment: string; reserve: string; treasury: string;
  operating: string; usdc: string; token: string; sale: string; deploymentBlock: number; distributionGuard?: string };
type PayoutCondition = { holder: string; nonce: string; roundStart: number };
type Draft = Record<string, string | number>;
type Stage = { id: string; operationId: string; name: string; state: string; sender: string; nonce: number;
  transactionHash: string | null; draft: unknown; startBlock: number };
export type WithdrawalIntent = { asset: "USDC" | "BETTEX"; destination: string; units: string;
  executor: string; deposit: string; holder: string };
type Operation = { id: string; kind: string; quantity: string; principal: string; fee: string; stages: Stage[];
  intent?: WithdrawalIntent };
interface JourneyPorts {
  store: {
    create(account: string, epoch: string, id: string, kind: string, quantity?: string, principal?: string, fee?: string): Promise<unknown>;
    owned(account: string, epoch: string, id: string): Promise<Omit<Operation, "stages">>;
    list(account: string, epoch: string): Promise<{ archivedCount: number; operations: Operation[] }>;
    stage(operation: string, name: string): Promise<Stage | undefined>;
    plan(operation: string, epoch: string, name: string, sender: string, nonce: number, block: number, draft: Draft): Promise<Stage>;
    arm(id: string, executor: string, hash?: string): Promise<Stage | null>;
    state(id: string, state: string, hash?: string): Promise<void>;
    intent?(id: string, intent: WithdrawalIntent): Promise<void>;
  };
  chain: {
    draft(sender: string, to: string, data: string, value?: string): Promise<{ nonce: number; block: number; draft: Draft }>;
    allowance(meta: Metadata, address: string, token?: string, spender?: string): Promise<bigint>;
    sendOperator(draft: Draft, sender: string): Promise<string>;
    validateSigned(raw: string, sender: string, draft: Draft): string;
    sendSigned(raw: string): Promise<string>;
    verifyReceipt(hash: string, sender: string, draft: Draft): Promise<Receipt | null>;
    recover(sender: string, nonce: number, block: number): Promise<{ hash: string } | null>;
    encode(kind: "approve" | "buy" | "authorize" | "transfer" | "withdraw" | "guard-pay", values: unknown[]): string;
  };
  executorId: string;
  hashId(value: string): string;
  /** Network-specific validation of effects (transfers, approval, buyer binding). */
  verifyEffects(stage: Stage, receipt: Receipt, meta: Metadata, operation: Omit<Operation, "stages">): Promise<void>;
}
export function nativeJourney(ports: JourneyPorts) {
  const { store, chain } = ports;
  async function reconcile(stage: Stage, meta: Metadata, operation: Omit<Operation, "stages">) {
    if (stage.state === "requested") return;
    const hash = stage.transactionHash ?? (await chain.recover(stage.sender, stage.nonce, stage.startBlock))?.hash;
    if (!hash) return; // Absence is NOT permission to resend.
    try {
      const receipt = await chain.verifyReceipt(hash, stage.sender, stage.draft as Draft);
      if (!receipt) { await store.state(stage.id, "uncertain", hash); return; }
      if (receipt.status !== 1) { await store.state(stage.id, "failed", hash); return; }
      await ports.verifyEffects(stage, receipt, meta, operation);
      await store.state(stage.id, "confirmed", hash);
    } catch { await store.state(stage.id, "reconciliation_required", hash); }
  }
  async function operatorStage(operation: Omit<Operation, "stages">, meta: Metadata, name: string, to: string, data: string, value = "0", sender = meta.reserve, submit = true) {
    let stage = await store.stage(operation.id, name);
    if (!stage) {
      if (!submit) return false;
      const draft = await chain.draft(sender, to, data, value);
      stage = await store.plan(operation.id, meta.epoch, name, sender, draft.nonce, draft.block, draft.draft);
    }
    if (stage.state !== "requested") { await reconcile(stage, meta, operation); return (await store.stage(operation.id, name))?.state === "confirmed"; }
    if (!submit) return false;
    const armed = await store.arm(stage.id, ports.executorId);
    if (armed) {
      try {
        const hash = await chain.sendOperator(armed.draft as Draft, armed.sender);
        await store.state(stage.id, "sent", hash);
      } catch { await store.state(stage.id, "uncertain"); }
      await reconcile((await store.stage(operation.id, name))!, meta, operation);
    }
    return (await store.stage(operation.id, name))?.state === "confirmed";
  }
  return {
    async transferTest(accountId: string, meta: Metadata, id: string, sender: string, recipient: string, units: string,
      submit: boolean, condition?: PayoutCondition) {
      if (meta.chainId !== 31337 || !/^[1-9]\d*$/.test(units)
        || ![meta.reserve, meta.treasury].some(a => a.toLowerCase() === sender.toLowerCase())) throw new Error("invalid_test_transfer");
      await store.create(accountId, meta.epoch, id, "distribution", "0", units);
      const operation = await store.owned(accountId, meta.epoch, id);
      if (operation.principal !== units) throw new Error("operation_conflict");
      if (condition && (!meta.distributionGuard || sender.toLowerCase() !== meta.treasury.toLowerCase())) throw new Error("invalid_test_transfer");
      const target = condition ? meta.distributionGuard! : meta.usdc;
      const data = condition ? chain.encode("guard-pay", [id, condition.roundStart, condition.holder,
        recipient, BigInt(condition.nonce), BigInt(units)]) : chain.encode("transfer", [recipient, BigInt(units)]);
      const existing = await store.stage(id, "distribution");
      if (existing) {
        const draft = existing.draft as Draft;
        if (draft.to !== target || draft.data !== data) throw new Error("operation_conflict");
      }
      const confirmed = await operatorStage(operation, meta, "distribution", target, data, "0", sender, submit);
      return { confirmed, stage: await store.stage(id, "distribution") };
    },
    async reconcileAll(accountId: string, meta: Metadata) {
      const list = await store.list(accountId, meta.epoch);
      for (const operation of list.operations) for (const stage of operation.stages) await reconcile(stage, meta, operation);
    },
    async fund(accountId: string, meta: Metadata, deposit: string, bettex: string, reserveUsdc: string, acknowledged: boolean) {
      if (!acknowledged) throw new Error("local_acknowledgement_required");
      const id = ports.hashId(`fund:${accountId}:${meta.epoch}:${new Date().toISOString().slice(0, 10)}`);
      const amount = 25_000_000n;
      await store.create(accountId, meta.epoch, id, "fund");
      const operation = await store.owned(accountId, meta.epoch, id);
      const existing = await store.stage(id, "usdc-deposit");
      if (!existing && BigInt(reserveUsdc) < amount) throw new Error("reserve_insufficient");
      // Recipient registration uses only the restricted local-node administrator.
      if (!await operatorStage(operation, meta, "authorize", meta.sale, chain.encode("authorize", [deposit, bettex]))) return;
      if (!await operatorStage(operation, meta, "gas-deposit", deposit, "0x", "3000000000000000")) return;
      if (!await operatorStage(operation, meta, "gas-bettex", bettex, "0x", "1000000000000000")) return;
      await operatorStage(operation, meta, "usdc-deposit", meta.usdc, chain.encode("transfer", [deposit, amount]));
    },
    async quote(accountId: string, meta: Metadata, deposit: string, bettex: string, id: string,
      quantity: string, sale: { price: string; fee: string; paused: boolean; available: string }, balanceUsdc: string) {
      if (!/^[1-9][0-9]{0,8}$/.test(quantity) || !/^0x[0-9a-f]{64}$/i.test(id)) throw new Error("invalid_quantity");
      const count = BigInt(quantity), principal = count * BigInt(sale.price), total = principal + BigInt(sale.fee);
      if (sale.paused) throw new Error("sale_paused");
      if (count * 10n ** 18n > BigInt(sale.available)) throw new Error("inventory_insufficient");
      if (total > BigInt(balanceUsdc)) throw new Error("usdc_insufficient");
      const list = await store.list(accountId, meta.epoch);
      const pending = list.operations.find(o => o.kind === "purchase" && o.id !== id
        && !o.stages.some(s => s.name === "buy" && s.state === "confirmed")
        && !o.stages.some(s => s.state === "failed"));
      if (pending) throw new Error("previous_purchase_pending");
      await store.create(accountId, meta.epoch, id, "purchase", quantity, String(principal), sale.fee);
      const operation = await store.owned(accountId, meta.epoch, id);
      if (operation.principal !== String(principal) || operation.fee !== sale.fee) throw new Error("quote_changed");
      if ((await store.stage(id, "buy"))?.state === "confirmed") return;
      const allowed = await chain.allowance(meta, deposit);
      const name = allowed < total ? "approve" : "buy";
      const existing = await store.stage(id, name);
      if (existing) return; // Same immutable transaction after reload; do not regenerate nonce.
      const data = name === "approve" ? chain.encode("approve", [meta.sale, total])
        : chain.encode("buy", [bettex, count, total, id]);
      const draft = await chain.draft(deposit, name === "approve" ? meta.usdc : meta.sale, data);
      await store.plan(id, meta.epoch, name, deposit, draft.nonce, draft.block, draft.draft);
    },
    async withdrawal(accountId: string, meta: Metadata, id: string, intent: WithdrawalIntent,
      balances: { usdc: string; bettex: string }) {
      if (meta.chainId !== 31337 || !/^0x[0-9a-f]{64}$/i.test(id) || !store.intent
        || !/^[1-9]\d{0,77}$/.test(intent.units) || BigInt(intent.units) >= 2n ** 256n
        || !["USDC", "BETTEX"].includes(intent.asset)
        || !/^0x[0-9a-f]{40}$/i.test(intent.destination)
        || [intent.deposit, intent.holder, intent.executor, meta.usdc, meta.token, meta.sale,
          meta.operating, meta.treasury, meta.reserve, "0x" + "0".repeat(40)]
          .some(a => a.toLowerCase() === intent.destination.toLowerCase())) throw new Error("invalid_destination");
      const fee = 2_500_000n, units = BigInt(intent.units);
      const total = fee + (intent.asset === "USDC" ? units : 0n);
      const existing = await store.stage(id, "withdraw");
      if (existing?.state === "confirmed") {
        await store.owned(accountId, meta.epoch, id);
        await store.intent(id, intent);
        return;
      }
      if (BigInt(balances.usdc) < total) throw new Error("usdc_insufficient");
      if (intent.asset === "BETTEX" && BigInt(balances.bettex) < units) throw new Error("bettex_insufficient");
      const list = await store.list(accountId, meta.epoch);
      if (list.operations.some(o => o.id !== id && o.kind === "withdrawal"
        && !o.stages.some(s => s.name === "withdraw" && s.state === "confirmed")
        && !o.stages.some(s => s.state === "failed"))) throw new Error("previous_withdrawal_pending");
      await store.create(accountId, meta.epoch, id, "withdrawal", intent.units,
        intent.asset === "USDC" ? intent.units : "0", String(fee));
      await store.intent(id, intent);
      const steps = [
        ...(intent.asset === "BETTEX" ? [{ name: "approve-bettex-withdraw", sender: intent.holder,
          token: meta.token, amount: units }] : []),
        { name: "approve-usdc-withdraw", sender: intent.deposit, token: meta.usdc, amount: total },
      ];
      for (const step of steps) {
        if (await chain.allowance(meta, step.sender, step.token, intent.executor) >= step.amount) continue;
        const stage = await store.stage(id, step.name);
        if (!stage) {
          const draft = await chain.draft(step.sender, step.token, chain.encode("approve", [intent.executor, step.amount]));
          await store.plan(id, meta.epoch, step.name, step.sender, draft.nonce, draft.block, draft.draft);
        }
        return;
      }
      if (!existing) {
        const draft = await chain.draft(intent.deposit, intent.executor, chain.encode("withdraw", [
          intent.asset === "USDC" ? meta.usdc : meta.token, intent.destination, units, id,
        ]));
        await store.plan(id, meta.epoch, "withdraw", intent.deposit, draft.nonce, draft.block, draft.draft);
      }
    },
    async sign(accountId: string, meta: Metadata, id: string, name: string, raw: string) {
      const operation = await store.owned(accountId, meta.epoch, id);
      const stage = await store.stage(id, name);
      const permitted = operation.kind === "purchase" ? ["approve", "buy"]
        : operation.kind === "withdrawal" ? ["approve-usdc-withdraw", "approve-bettex-withdraw", "withdraw"] : [];
      if (!stage || !permitted.includes(name)) throw new Error("operation_not_found");
      const hash = chain.validateSigned(raw, stage.sender, stage.draft as Draft);
      const armed = await store.arm(stage.id, ports.executorId, hash);
      if (armed) {
        try { await chain.sendSigned(raw); await store.state(stage.id, "sent", hash); }
        catch { await store.state(stage.id, "uncertain", hash); }
      }
      await reconcile((await store.stage(id, name))!, meta, operation);
    },
  };
}
