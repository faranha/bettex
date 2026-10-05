# Canonical base and incremental legacy migration

**Status:** adopted; complete physical organization pending.

## Context

The creator provided mandatory architectural rules. Usable documents and code already exist; duplicating normative sources or rewriting the entire application would be counterproductive.

## Decision and justification

`AGENTS.md` guides implementations, `docs/architecture.md` defines the map/dependencies/sources of truth, and `docs/decisions/` registers justifications. `replit.md` requires its consultation before changes. Previous documents are support or referrals, not concurrent records.

New rules belong to the map contexts. Current exceptions are explicit:

| File in `artifacts/api-server/src/lib/` | Current responsibility | Exception destination/removal |
| --- | --- | --- |
| `account-identity.ts` | Identity and Clerk adapter, coupled to demo types | `accounts`, separating identity port from adapter |
| `demo-state.ts` | Emulated accounts, balances, rounds and settlement | Separate emulation from `wallets`/`ledger` rules; never migrate seed to real balance |
| `orchestrator.ts` | Emulated proposals, budget and progress | `agents` and `risk`, without duplicating the authorization rule |
| `demo-store.ts` | Persistence, transactions and demo binding | Owners' repositories/use cases, preserving atomicity and isolation |
| `logger.ts` | Technical log utility, no business rule | Can remain as shared infrastructure with explicit purpose |

These files are registered debt, not examples for new domains. Maintenance changes require review and testing; do not add new generic files or remove controls silently.

## Verification and consequences

Manifest and static verifier apply the map to new modules and reject unregistered generic files. There are verifier tests and integration with `pnpm quality`/CI.

The verifier does not certify dynamic SQL, balance, security or production. Acceptance of each migration requires authorization tests, contracts, idempotency, concurrency and recovery, updating the documents and removing the corresponding exception.

Do not change database, activate real money, create empty folders or execute broad refactoring in this decision. Approved policies allow limited automation, not human signature by order.
