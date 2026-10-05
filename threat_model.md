# Threat Model

## Project Overview

BETTEX uses React/Vite, Express, Clerk and PostgreSQL/Drizzle. Identity is real; persistent financial experience is emulated. This model covers the current base and the boundaries required for future crypto infrastructure; it does not claim that target protections already exist.

## Assets

- Identity, sessions, ownership binding and account data.
- Integrity of commands, proposals, decisions and persisted results.
- Infrastructure secrets and authentication provider credentials.
- Personal keys already exist: persisted encrypted vault, client-side decryption/signing/export. Local resources are assets of no value; funds, mandates and production obligations are not yet operated.

## Trust Boundaries

1. Untrusted browser → API: authentication, ownership, schema and authorization.
2. API → Clerk: verified external identity; client does not provide authoritative identity.
3. API/engine → PostgreSQL: current transactions; future atomic ledger and outbox.
4. External agents/data → BTEX/risk: data are not execution instructions.
5. Executor → signer: restricted authorization; no arbitrary signing requests.
6. Blockchain/providers → reconciliation: external responses may delay, duplicate or diverge.

## Threat Categories

| Category | Specific threat | Required guarantee |
| --- | --- | --- |
| Spoofing | Hijacking the account via ID/cookie/claims provided by the client | Server-side verified ownership; invalid session does not become verified identity |
| Tampering | Altering amounts, destination, price, proposal or policy | Schema, semantics, quote/TTL and mandate verified; authoritative money does not come from React |
| Repudiation | Losing history, decision, retry or result | Durable and correlated audit; UI limit never clears pending command |
| Information disclosure | Exposing sessions, PII or future keys in logs/repos/prompts | Redaction, minimal access and signer isolation; history review before public GitHub |
| Denial of service | Creating load of accounts/queries and blocking the shared engine | Distributed limits, worker isolation and metrics; in-memory limiter is not enough in production |
| Elevation of privilege | Agent exceeding mandate or requesting arbitrary transfer | Agent only proposes; independent authorization and signing, allowlists and revocation |

## Required Security Guarantees

- Account writes require valid identity/ownership; anonymity only authorizes the demonstration experience.
- Idempotency reuse with a different payload is an error. Retries do not duplicate transactions or orders.
- Provider failure/timeout is not proof that the operation did not happen.
- Reserves persist while execution is uncertain; divergences halt secure execution.
- Blockchain reorganizations and confirmations are modeled and reconciled by policy.
- Importing emulated data to real balance is prohibited.
- Risk changes require approved, versioned and auditable policy.
- Custody/export/recovery and mainnet authorization require explicit decisions/reviews.

## Scan Anchors

- `artifacts/api-server/src/lib/account-identity.ts`: identity verification.
- `artifacts/api-server/src/routes/demo.ts`: cookie, mutations, limits and HTTP boundary.
- `artifacts/api-server/src/lib/demo-store.ts`: binding, transactions and idempotency.
- `artifacts/api-server/src/lib/orchestrator.ts`: proposals and illustrative policy.
- `lib/db/src/schema/demo.ts`: demonstrative persistence, not ledger.

## Limits

Internal security review performed according to [report](docs/security-review-2026-10-05.md): scanners, secrets/Git, HTTP controls, isolated negative tests and fixture restoration. This is not an external penetration test nor an independent on-chain audit. Distributed controls, external IAM, production signer/ledger and public infrastructure recovery remain gates; real money remains unauthorized.
