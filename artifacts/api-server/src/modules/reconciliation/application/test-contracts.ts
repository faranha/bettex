export const TEST_CONTRACT_CHAIN = 421614;
export const TEST_CONTRACT_VERSION = "bettex-solc-0.8.37-ir";
export interface ContractEvidence {
  name: string; transactionHash: string; blockHash: string; blockNumber: number;
  logIndex: number; address: string; values: string;
}
export interface ContractObservation {
  address: string; state: unknown; events: ContractEvidence[];
}
export interface ContractObservationStore {
  addressFor(accountId: string): Promise<string | null>;
  link(accountId: string, address: string): Promise<void>;
  record(observation: ContractObservation): Promise<void>;
}
export interface ContractReader { read(address: string): Promise<ContractObservation>; }
export class InvalidTestContract extends Error {}

export function testContractObservation(store: ContractObservationStore, reader: ContractReader) {
  return {
    async get(accountId: string) {
      const address = await store.addressFor(accountId);
      if (!address) return { configured: false, chainId: TEST_CONTRACT_CHAIN,
        version: TEST_CONTRACT_VERSION, allocations: [], events: [] };
      const observation = await reader.read(address);
      await store.record(observation);
      return observation.state;
    },
    async register(accountId: string, address: string) {
      const observation = await reader.read(address);
      // An unverifiable address never becomes a configured source.
      await store.link(accountId, observation.address);
      await store.record(observation);
      return observation.state;
    },
  };
}
