# Simulation, local EVM and real-service separation

## Environment distinctions

| Environment | Meaning |
| --- | --- |
| Public production demo | In-development landing with explicitly illustrative legacy screens; operational development demo/API activity is blocked |
| Development demo | Persisted illustrative balances, operations, quotations and orchestration; not real account wealth or investment performance |
| Isolated simulation / paper | Separate scenario runs, clock, evidence and simulated budgets; no live financial execution |
| Local EVM, chain 31337 | Actual transactions on an ephemeral local chain using free mock assets; synthetic test settlement, not real revenue |
| Arbitrum Sepolia | Public test-network observation/association; public deployment and purchase evidence are not established by a local test |
| Mainnet / real-provider execution | Not enabled or authorized by this workflow |

Authentication and PostgreSQL persistence can be real while displayed
financial activity remains simulated. A browser-generated wallet address does
not prove production funding, execution, recovery or custody implementation.

The existing UI labels and public-demo restrictions are preserved. Local EVM
evidence explicitly carries its environment/epoch; scenario histories must not
be merged with real financial records.

## Running safely

Use [development.md](development.md) with a fresh development database.
`pnpm dev:local` starts development services with execution paused and does not
start/fund a chain. The optional local-runtime command starts only loopback
31337. See [contracts/native-test-journey.md](contracts/native-test-journey.md)
for the existing test journey and its restrictions.

`pnpm --filter @workspace/bettex-contracts test` executes an isolated local EVM.
CI and synchronization checks do not start the application's mainnet/provider
execution. Never supply production funds or production credentials to tests.

## What remains unproven

Paper orders and synthetic settlements are not external fills or realized
profit. Allora topic data is not automatically a calibrated event probability.
Observable CLOB books do not alone establish net edge or executable size.
Existing model/data/approval blockers remain in
[integration-pendencies.md](integration-pendencies.md).
