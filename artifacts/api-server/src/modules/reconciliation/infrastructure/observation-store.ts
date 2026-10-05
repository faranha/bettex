import { db } from "@workspace/db";
import { testContractLinks, testContractEvents } from "../../../../../../lib/db/src/schema/reconciliation";
import { eq } from "drizzle-orm";
import { TEST_CONTRACT_CHAIN, TEST_CONTRACT_VERSION, type ContractObservationStore } from "../application/test-contracts";

export const observationStore: ContractObservationStore = {
  async addressFor(accountId) {
    const [link] = await db.select().from(testContractLinks).where(eq(testContractLinks.accountId, accountId));
    return link?.address ?? null;
  },
  async link(accountId, address) {
    await db.insert(testContractLinks).values({
      accountId, address, chainId: TEST_CONTRACT_CHAIN, version: TEST_CONTRACT_VERSION,
    }).onConflictDoUpdate({ target: testContractLinks.accountId,
      set: { address, version: TEST_CONTRACT_VERSION, updatedAt: new Date() } });
  },
  async record(observation) {
    if (!observation.events.length) return;
    // Block hash is part of identity; evidence from a reorg is preserved, not overwritten.
    await db.transaction(async tx => {
      for (let offset = 0; offset < observation.events.length; offset += 100) {
        await tx.insert(testContractEvents).values(observation.events.slice(offset, offset + 100).map(event => ({
          id: `${TEST_CONTRACT_CHAIN}:${event.address.toLowerCase()}:${event.transactionHash}:${event.logIndex}:${event.blockHash}`,
          chainId: TEST_CONTRACT_CHAIN, tokenAddress: observation.address, address: event.address.toLowerCase(),
          transactionHash: event.transactionHash, blockHash: event.blockHash, blockNumber: event.blockNumber,
          logIndex: event.logIndex, name: event.name, values: JSON.parse(event.values),
        }))).onConflictDoNothing();
      }
    });
  },
};
