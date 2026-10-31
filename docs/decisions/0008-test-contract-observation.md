# Observation of test contracts in the existing application

**Status:** development; public deployment still depends on approval and funding.

The issuance attachment also requires a bank and dashboard. The observation belongs to `reconciliation`, not the demonstration ledger. Transport uses the Clerk identity already verified in the application; no parallel login, wallet, or financial service will be created. The previous native registration remains isolated and will not be migrated or deleted without the creator's decision.

The authenticated user can link a public test contract address to their own account. Reading is exclusively Arbitrum Sepolia on the official RPC, validates bytecode against this version of the contracts, and queries state in an identified block. Registration of an address does not grant administration, custody, or purchase authorization.

The bank stores configuration and observed evidence (network, address, version, block/hash, transaction/log), with idempotent keys. Presented state is read from the blockchain; do not reuse demonstration balances. Events are provisional and require reconciliation, not L1 finality proof or a financial ledger.

Without a configured contract, present the absence of deployment, not simulated zeros. Blockchain unavailability blocks results; do not return an old snapshot as a new confirmation. Do not issue, deploy, authorize payers, or move funds automatically. The contract already supports purchases signed by the holder with two wallets, but public execution depends on deployment, authorization, and free funding which are still absent.
