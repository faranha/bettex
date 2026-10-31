# BETTEX

BETTEX is an open community building DeFi technology and a community token, without salaries or BETTEX service fees. The visual demo has no charges. This repository preserves the approved mint, allocations and technical tokenomics.

The planned application coordinates AI-agent
proposals, deterministic risk controls, treasury activity and cycle-based
participation. This repository includes the public site, Pitch, product
documentation, development application and a test-only smart-contract library.

**Not a production financial service, an audited investment product, or evidence
of realized trading performance.** Repository preparation does not change the
current network-evaluation direction, economics or alpha agent architecture.

## Actual implementation status

Developer entry point: [documentation index](docs/README.md), [current project
status](docs/project-status.md), [demo model](docs/demo/README.md),
[testnet limitations](docs/testnets/README.md) and
[final GitHub integration checklist](docs/github-finalization.md).
Use [verification profiles](docs/testing.md) to distinguish the current product
from preserved operational reference code. Historical reports are not current
readiness certificates.

Only the public site and local visual demo are currently exposed. Development adapters, database models, test contracts and operational infrastructure listed below are preserved reference implementations, not active features of the public app or proof of a chosen launch network. Starknet and Arbitrum One remain alternatives under evaluation during planning and grant fundraising.

| Capability | State and limitations |
| --- | --- |
| Public site, Pitch and documentation | Implemented; Portuguese is the first-visit default, with saved English/Spanish preferences preserved |
| Public app/demo | Canonical `/app` is an exclusively visual demonstration with local fictitious data; no live market reads, authentication, financial execution or persistence |
| Clerk identity and sessions | Existing adapter; tenant configuration is an external dependency |
| Native development test accounts | Implemented; consent, isolated sessions and browser-encrypted EVM wallet vaults |
| PostgreSQL persistence and HTTP contracts | Drizzle, OpenAPI/Orval, generated React clients and Zod validators |
| Alpha hierarchy and deterministic policies | Existing BETTEX/prediction-market/BTC-ETH-SOL structure; model/data/approval gaps remain |
| Simulation and paper infrastructure | Isolated scenarios and budgets; not live financial execution |
| Treasury/local settlement and accounting evidence | Implemented/tested with local mock assets; not external trading profit |
| Solidity contracts | Source, compilation and isolated local-EVM tests; no public deployment/mainnet claim |
| Public-testnet observation | Arbitrum Sepolia adapter/association; deployment/funding and end-to-end evidence remain separate |
| Allora / live trading providers | Research/read capabilities and explicit unresolved integration gates; no invented connectivity |
| Hosting | Vercel Build Output API from `faranha/bettex` `main`; see [Vercel deployment](docs/deployment-vercel.md) |

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
lib/api-spec/             OpenAPI source and code generator
lib/api-client-react/     Generated hooks/types
lib/api-zod/              Generated transport validators
lib/db/                   Database schema and migration material
lib/bettex-contracts/     Test-only Solidity sources, compilation and EVM tests
docs/                     Architecture, decisions, limitations and review guides
tools/technical-docs/     Official-reference research tooling, not a financial agent
scripts/vercel/           Vercel build and Build Output API packaging
scripts/neon/             Database backup restore helper (no data in Git)
.github/workflows/        Verification only; deployment is Vercel's Git integration
```

## Installation and execution

The verified clean-clone platform is Linux x64. Use `.node-version`, the pinned
pnpm version and the external services described in [development.md](docs/development.md).

```sh
corepack enable
pnpm install --frozen-lockfile
python3 -m pip install "xlsxwriter==3.2.9"
cp .env.example .env
pnpm dev:local
```

The current public demo does not require authentication or a database.
Historical operational reference tests have separate requirements; see
[development.md](docs/development.md) before preparing an isolated database.
Do not connect a production database or real funds.
The launcher does not start/fund an EVM. Operational runtime scripts remain disabled.

Production runs on Vercel; see [Vercel deployment](docs/deployment-vercel.md).

## Verification

```sh
pnpm quality:current
PORT=5173 BASE_PATH=/ pnpm build
pnpm build:vercel
pnpm --filter @workspace/bettex-contracts test
```

`quality:current` is the CI profile for the visual product. `quality` retains the
full historical reference checks, including three integrations whose operational
prerequisites are currently disabled. Reports list exclusions rather than calling
them passes. See [testing.md](docs/testing.md). Test-only contract transactions
stay on isolated local EVMs. Passing tests are not an independent audit.

## Deployment

`bettex.ai` is served by Vercel. `pnpm build:vercel` builds the site exactly as
before (same static prerender and the same `serve.mjs` routing, headers and
redirects), then packages two Node 24 functions with the Build Output API: the
static site server and the Express `/api` app. Preview hosts on `*.vercel.app`
are sent `X-Robots-Tag: noindex`. No secrets are required; see
[Vercel deployment](docs/deployment-vercel.md).

The public demo does not read a database. A PostgreSQL backup restore helper
for Neon is documented in [Neon restore](docs/neon-restore.md); backups are
never stored in this repository.

## Technical and grant review

1. [Canonical architecture](docs/architecture.md) and [architectural decisions](docs/decisions/README.md).
2. [Agents](docs/agents.md), [networks/integrations](docs/integrations.md) and [simulation](docs/simulation.md).
3. [Engineering roadmap](docs/roadmap.md) and [grant-readiness limitations](docs/grant-readiness.md).
4. [Development](docs/development.md), [contribution rules](CONTRIBUTING.md), [mandatory AI instructions](AGENTS.md).
5. [Security policy](SECURITY.md), [threat model](threat_model.md) and [security operations](docs/security-operations.md).
6. [Preparation and verification report](docs/github-readiness-report.md).

Public product/app destination: [bettex.ai/en/app](https://bettex.ai/en/app).
It is an ALFA demonstration, not live financial execution.

The owner explicitly authorized public upload to `faranha/bettex` only. Preserve
that destination, its visibility and `main`. Do not generalize this permission to other repositories.
No repository-wide license file was found; existing package `license` metadata
is preserved, not treated as proof of redistribution rights. Uploaded assets,
third-party research and source material require provenance/ownership review
before public distribution. No grant application, audit or provider partnership
is claimed.
