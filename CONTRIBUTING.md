# Development rules

Before implementing, read [AGENTS.md](AGENTS.md), [canonical architecture](docs/architecture.md),
`replit.md`, [current project status](docs/project-status.md) and the
[relevant decisions](docs/decisions/README.md).

## Mandatory principles

1. Every functionality belongs to a context of the canonical architecture; define data owner, authorization and invariants before the interface.
2. Separate domain, application, infrastructure and transport. Do not put financial decisions in React, HTTP handlers or a prompt.
3. Work through small, verifiable changes. Do not move the entire application or change database/provider as a side effect.
4. Do not confuse emulation with real integration. Emulated adapters are explicit and must not silently fall through in real execution.
5. Agents propose; policies authorize; executors execute; reconciliation confirms. No agent receives keys.
6. Custody, boundaries, contracts and financial policy require ADR and review. Credentials do not go into the ADR.
7. Do not reactivate operational routes or runtimes to accommodate historical tests. Repository preparation does not authorize an upload or deployment.

## Change process

1. Describe objective, affected context, risks, previous behavior and acceptance criteria.
2. For API: update `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`, and update all calls and interface states.
3. Do not edit generated files manually.
4. Write regression tests for defects and invariant tests for financial rules.
5. Run `pnpm quality:current` and relevant reference checks; review the diff, including regenerated sources/exports. Follow [verification profiles](docs/testing.md); exclusions are not passes.
6. Request review for authentication, money, keys, smart contracts, migrations or permissions.
7. Plan migration, compatibility, recovery and observability before deploying.

## Data and contracts

- Identity and authorization are derived on the server. Client IDs do not prove ownership.
- Financial production uses integer units and scale per asset; `number` and demonstrative JSONB state are not a ledger.
- Do not convert demonstrative balance into real balance or import fictitious history into the ledger.
- Every financial mutation has idempotency, identity scope, correlation and validated payload. Reusing a key with a different payload is an error.
- A display limit never eliminates pending operations. Durable history and pagination are required before production.
- Schema change is versioned and compatible with old versions during deployment. Automatic initialization DDL is not a production migration policy.
- Contracts between services are versioned; errors, authentication and uncertain states are part of the contract.

## Code, interface and dependencies

- Strict TypeScript; avoid `any`, unvalidated coercions, giant files and duplicated rules.
- Preserve pnpm workspace conventions, artifact paths and authentication proxy.
- Dependencies via pnpm and lockfile; do not use `latest` or update core libraries without justification.
- CI with minimum permissions and Actions pinned by commit; no automatic publication.
- Consistent selected language, keyboard/touch accessibility and mobile layout.
- Times displayed in São Paulo, without altering internal instants or cycle durations.
- Do not alter homepage, Pitch or approved economic rules to accommodate a refactoring.
- Do not log tokens, cookies, passwords, keys or unnecessary personal data.

## Definition of done

- Contract, authorization, implementation, interface and error states complete.
- Applicable tests/builds passing, with exclusions and pending checks explicit; migrations and rollback documented when applicable.
- No discarded pending commands, double counting or fictitious results presented as real.
- Documentation describes the implemented state without claiming non-existent services/integrations.
- For crypto operations: comply with architecture gates; green CI alone does not authorize mainnet.
