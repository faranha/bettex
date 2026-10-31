# BETTEX — product scope

BETTEX is an open community building DeFi technology and an AI agent for multiple
markets. BETTEX is a community token, not company or foundation equity.

This file is the canonical product-scope entry point referenced by `AGENTS.md`
and the documentation. The detailed, maintained product rules live in the public
documentation under [`docs/`](docs/README.md), in particular:

- [Architecture](docs/architecture.md) and [decisions](docs/decisions/README.md)
- [Documentation map](docs/documentation-map.md) and
  [maintenance contract](docs/documentation-maintenance.md)
- [Treasury governance](docs/treasury-governance.md)
- [Testnet contract specification](docs/contracts/bettex-testnet-spec.md)

## Current boundaries

- The public site (`bettex.ai`) and its app are an interface demo: no operational
  routes, accounts or real financial transactions are active.
- Homepage and Pitch content are finalized and canonical; editorial changes are
  limited to the documentation.
- The public API only answers `/api/healthz`, `/api/demo/polymarket` and
  `/api/account/session` (always anonymous); every other `/api` route returns 410.
