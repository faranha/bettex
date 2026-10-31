# Architectural review — October 5, 2026

Independent architect review, read-only, of the identity, persistence, emulation, orchestration, schemas, contracts, and account interface files. This is not a security/smart contract audit or production certification.

## Result

The existing base is reusable for product development, but **is not ready for real money**. There are demonstrative transactions, identity verification, and idempotency; a financial ledger, custody, signing, execution integration, and full history are missing.

## Findings and treatment

| Priority | Evidence | Treatment |
| --- | --- | --- |
| Current defect | `api-server/src/lib/demo-state.ts`: history truncation discarded pending items before settlement | Fixed: preserve all pending items; 125-credit regression and settlement repetition |
| Financial blocker | `lib/db/src/schema/demo.ts`, `demo-state.ts`: JSONB, seed, and `number` | Ledger with precision per asset; do not convert demonstrative data into real resources |
| Incomplete history | `demo-state.ts`: limited event retention, closed operations, and rounds | Normalized persistence and pagination; Central queue/histories remain pending |
| Scalability | `demo-store.ts`: shared lock and query of all accounts | Measure, separate responsibilities, and redesign projections before increasing load |
| Risk policy | `orchestrator.ts`: illustrative percentages/score and emulated automatic execution | Mandates approved, versioned, and verified before real execution |
| Missing wallets | Account interface and backend without on-chain provisioning/signing | Decide on custody, export, and recovery before implementation |
| Repository | Absence of technical entry, ADRs, and comprehensive pipeline | README, architecture, rules, security, threat model, and CI added |

The abbreviated paths `api-server/...` above belong to `artifacts/api-server/...`. No claim is made of proven serious security violation.

## Deliverables of this organization

- Reviewed recorded and context boundaries defined.
- Correction of pending movement discarding, without data migration.
- `pnpm quality` command and GitHub validation workflow without publishing.
- Standards for contracts, precision, security, review, and completion criteria.
- Explicit distinction between implemented code and target architecture.

## Decisions still required

- Custody, key export, recovery, and operational responsibility.
- Effectively usable contracts and providers, networks, and permitted assets.
- Risk policy and mandates approved by the Foundation.
- Costs, taxes, obligations, and liquidity applicable to real assessment.
- Execution location of services and availability requirements.
- License/rights of assets, private security channel, and GitHub branch protection.

No broad refactoring has begun, nor has custody, trading, publishing, or financial transfer been activated.
