# BETTEX

BETTEX is an alpha-stage technology application for coordinating AI-agent
proposals, deterministic risk controls, treasury activity and cycle-based
participation. This repository includes the public site, Pitch, product
documentation, development application and a test-only smart-contract library.

**Not a production financial service, an audited investment product, or evidence
of realized trading performance.** Repository preparation does not change the
approved blockchain, economics or alpha agent architecture.

## Actual implementation status

| Capability | State and limitations |
| --- | --- |
| Public site, Pitch and documentation | Implemented; English is the first-visit default, with Portuguese/Spanish preserved |
| Public app/demo | Canonical `/app` dashboard with live market reads and explicitly emulated financial activity; native account checks are development-only |
| Clerk identity and sessions | Existing adapter; tenant configuration is an external dependency |
| Native development test accounts | Implemented; consent, isolated sessions and browser-encrypted EVM wallet vaults |
| PostgreSQL persistence and HTTP contracts | Drizzle, OpenAPI/Orval, generated React clients and Zod validators |
| Alpha hierarchy and deterministic policies | Existing BETTEX/prediction-market/BTC-ETH-SOL structure; model/data/approval gaps remain |
| Simulation and paper infrastructure | Isolated scenarios and budgets; not live financial execution |
| Treasury/local settlement and accounting evidence | Implemented/tested with local mock assets; not external trading profit |
| Solidity contracts | Source, compilation and isolated local-EVM tests; no public deployment/mainnet claim |
| Public-testnet observation | Arbitrum Sepolia adapter/association; deployment/funding and end-to-end evidence remain separate |
| Allora / live trading providers | Research/read capabilities and explicit unresolved integration gates; no invented connectivity |
| GitHub synchronization | Configured for the creator-authorized public `faranha/bettex`, branch `development/bettex`; authenticated push remains required |

See [simulation](docs/simulation.md) and [integration blockers](docs/integration-pendencies.md)
before interpreting balances, histories, transactions, approvals or performance.

## Stack and structure

- TypeScript/JavaScript, React 19, Vite 7, Tailwind, React Query and Clerk.
- Express 5, PostgreSQL 16, Drizzle, OpenAPI/Orval and Zod.
- Solidity 0.8.37, OpenZeppelin, ethers 6 and Hardhat 3 for test-only contracts.
- Node 24, pnpm 10.26.1, Python 3.13 and XlsxWriter for editorial/export tooling.

```text
artifacts/bettex-site/     Public content and development web application
artifacts/api-server/      HTTP API and existing domain modules
artifacts/mockup-sandbox/  Isolated component design previews
lib/api-spec/             OpenAPI source and code generator
lib/api-client-react/     Generated hooks/types
lib/api-zod/              Generated transport validators
lib/db/                   Database schema and migration material
lib/bettex-contracts/     Test-only Solidity sources, compilation and EVM tests
docs/                     Architecture, decisions, limitations and review guides
tools/technical-docs/     Official-reference research tooling, not a financial agent
scripts/github-sync/      Coordinated task/background synchronization
.github/workflows/        Verification only; no automatic deployment
```

## Installation and execution

The verified clean-clone platform is Linux x64. Use `.node-version`, the pinned
pnpm version and the external services described in [development.md](docs/development.md).

```sh
corepack enable
pnpm install --frozen-lockfile
python -m pip install "xlsxwriter==3.2.9"
cp .env.example .env
# Configure a NEW development PostgreSQL database privately.
node --env-file=.env --run db:prepare
pnpm dev:local
```

Clerk-dependent account features require the correct tenant configuration.
Public-site builds and native development test accounts do not require
production credentials. Do not connect a production database or real funds.
The launcher does not start/fund the optional local EVM.

In Replit, use the existing managed API/site workflows rather than replacing
them with the clean-clone launcher. Their artifact proxy supplies routing and
scoped environment variables.

## Verification

```sh
pnpm sync:test
pnpm sync:check
pnpm quality
PORT=5173 BASE_PATH=/ pnpm build
pnpm --filter @workspace/bettex-contracts test
```

`quality` includes database-isolation checks requiring a development database
and PostgreSQL client tools. CI supplies an ephemeral database and runs without
production credentials or real funds. Test-only transactions stay on isolated
local EVMs. Passing tests are not an independent audit.

## Automatic development synchronization

```sh
pnpm sync:watch
pnpm sync:once -- "Summarize the completed development change in English"
pnpm sync:status
pnpm sync:pause
pnpm sync:resume
```

The watcher and task-completion command share one lock, wait for stable writes,
check staged content, run verification, create nonempty development checkpoints,
fetch/push safely and verify the resulting remote commit. Failed pushes preserve
work and retry. Divergence requires explicit human recovery.

**Automatic synchronization implemented locally; activation pending native Git
push authentication.** The API connector alone does not authorize Git transport.
GitHub Actions does not upload local Replit edits. A stopped
workspace cannot run the watcher. See [activation and operations](docs/github-sync.md).

## Technical and grant review

1. [Canonical architecture](docs/architecture.md) and [architectural decisions](docs/decisions/README.md).
2. [Agents](docs/agents.md), [networks/integrations](docs/integrations.md) and [simulation](docs/simulation.md).
3. [Engineering roadmap](docs/roadmap.md) and [grant-readiness limitations](docs/grant-readiness.md).
4. [Development](docs/development.md), [contribution rules](CONTRIBUTING.md), [mandatory AI instructions](AGENTS.md).
5. [Security policy](SECURITY.md), [threat model](threat_model.md) and [security operations](docs/security-operations.md).
6. [Preparation and verification report](docs/github-readiness-report.md).

Public product/app destination: [bettex.ai/en/app](https://bettex.ai/en/app).
It is an ALFA demonstration, not live financial execution. The managed
workspace preview is the development surface.

The owner explicitly authorized public upload to `faranha/bettex` only. Preserve
that destination, its visibility and `main`; synchronization targets only
`development/bettex`. Do not generalize this permission to other repositories.
No repository-wide license file was found; existing package `license` metadata
is preserved, not treated as proof of redistribution rights. Uploaded assets,
third-party research and source material require provenance/ownership review
before public distribution. No grant application, audit or provider partnership
is claimed.
