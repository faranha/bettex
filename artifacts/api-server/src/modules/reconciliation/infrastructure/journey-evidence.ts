import { db } from "@workspace/db";
import { testContractEvents } from "../../../../../../lib/db/src/schema/reconciliation";
import { sql } from "drizzle-orm";

export async function recordJourneyEvidence(epoch: string, token: string, wallet: string, events: {
  id: string; hash: string; blockHash: string; blockNumber: number; logIndex: number;
  from: string; to: string; value: string; timestamp: number;
}[]) {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS test_contract_events (
    id text PRIMARY KEY, chain_id integer NOT NULL, token_address text NOT NULL, address text NOT NULL,
    transaction_hash text NOT NULL, block_hash text NOT NULL, block_number integer NOT NULL,
    log_index integer NOT NULL, name text NOT NULL, values jsonb NOT NULL, observed_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(chain_id,address,transaction_hash,log_index,block_hash)
  )`);
  for (let i = 0; i < events.length; i += 100) {
    await db.insert(testContractEvents).values(events.slice(i, i + 100).map(event => ({
      id: `${epoch}:${token}:${event.id}`, chainId: 31337, tokenAddress: token, address: token.toLowerCase(),
      transactionHash: event.hash, blockHash: event.blockHash, blockNumber: event.blockNumber,
      logIndex: event.logIndex, name: "Transfer", values: { from: event.from, to: event.to,
        value: event.value, timestamp: event.timestamp, epoch, observedWallet: wallet,
        criterion: "local-evm-receipt-blockhash-v1" },
    }))).onConflictDoNothing();
  }
}

export async function recordJourneyPurchases(epoch: string, token: string, sale: string, purchases: {
  hash: string; blockHash: string; blockNumber: number; logIndex: number; buyer: string; recipient: string;
  operationId: string; tokenUnits: string; principal: string; fee: string; timestamp: number; gasWei: string;
}[]) {
  for (let i = 0; i < purchases.length; i += 100) {
    await db.insert(testContractEvents).values(purchases.slice(i, i + 100).map(p => ({
      id: `${epoch}:${sale}:${p.hash}:${p.logIndex}:${p.blockHash}`, chainId: 31337,
      tokenAddress: token, address: sale.toLowerCase(), transactionHash: p.hash,
      blockHash: p.blockHash, blockNumber: p.blockNumber, logIndex: p.logIndex, name: "PrimaryPurchase",
      values: { operationId: p.operationId, buyer: p.buyer, recipient: p.recipient,
        tokenUnits: p.tokenUnits, principalUsdc: p.principal, feeUsdc: p.fee,
        timestamp: p.timestamp, gasWei: p.gasWei, epoch, criterion: "local-evm-receipt-blockhash-v1" },
    }))).onConflictDoNothing();
  }
}
