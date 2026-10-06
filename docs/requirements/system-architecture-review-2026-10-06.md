# BETTEX systems architecture review

Date: 2026-10-06
Scope: read-only systems analyst review requested by the creator. No application refactor, deployment, database migration or service extraction was performed.

## Evidence and limitations

The review covered representative canonical documents, transport compositions, domain/application/infrastructure boundaries and selected large frontend files. It is not whole-repository certification. Source line count, byte size and compressed formatting were distinguished from actual business complexity. Third-party Starknet documentation and generated clients were not treated as oversized authored product logic.

The main agent ran the library declaration build and architecture check successfully: 70 modular backend files, five registered legacy files, and 21 passing verifier tests. The latest existing frontend build contained a 2,871,042-byte JavaScript asset (846,882 bytes gzip); this was not a fresh runtime or production benchmark. Selected runtime polling, transaction and startup citations were checked directly against current source after the analyst response.

## Analyst findings

**FAIL against the creator’s distributed-service target:** BETTEX has meaningful modular controls, but financial workflows still run in one Express deployment with shared database and route-level coordination. This is **not** a failure of adopted ADR 0001: it deliberately chooses incremental modularization over immediate extraction (`docs/decisions/0001-service-boundaries.md:7-17`).

**Positive controls:** The canonical ownership/dependency map distinguishes modules from services (`docs/architecture.md:15-30`); paper orders require risk and authorization checks (`artifacts/api-server/src/modules/execution/application/paper-trading.ts:93-145`), and uncertain native transactions are reconciled rather than resent (`artifacts/api-server/src/modules/execution/application/native-journey.ts:41-70`). The agent reports `typecheck:libs` and 21 architecture checks passing; I did not rerun them.

**Prioritized findings** (confidence high unless stated):
1. **High — No independently deployed domain services.** Routes share the API process, which also starts demo and alpha workloads (`artifacts/api-server/src/index.ts:21-30`; `artifacts/api-server/src/routes/index.ts:19-32`). Independent scaling/failure isolation is absent. Keep the monolith until a specific extraction meets ADR 0001’s safety/load/availability threshold.
2. **High — Boundary checks miss composition ownership.** The checker analyzes module imports, not route SQL or frontend rules (`scripts/check-architecture.mjs:34-50,83-106`); treasury composition joins reservation, journey, and round tables directly (`artifacts/api-server/src/routes/treasury-resources.ts:28-79`). Move cross-context reads behind owner contracts and test ownership/authorization beyond imports.
3. **High — Extraction would break atomic assumptions.** Demo settlement locks a global engine and account rows in one transaction (`artifacts/api-server/src/lib/demo-store.ts:26-68`); native account composition also coordinates contexts transactionally (`artifacts/api-server/src/routes/test-accounts.ts:101-127`). Preserve this atomicity; require outbox, idempotency, recovery and reconciliation before splitting writers.
4. **Medium — Agent cycle holds a transaction during external evidence collection** (`artifacts/api-server/src/routes/agent-operations-runtime.ts:18-41,86-120`). This ties a DB connection/advisory lock to network delays. Fetch bounded evidence before the transaction, then validate freshness and persist atomically.
5. **Medium — Native journey GET repeats chain reconciliation and full event/receipt work on an eight-second poll** (`artifacts/bettex-site/src/components/account/account-ui/NativeJourney.tsx:63-66`; `artifacts/api-server/src/routes/native-journey.ts:110-160`). Incrementalize journal updates and measure RPC calls/p95 latency before scaling claims.
6. **Medium — Demonstration rules also execute in browser** (`artifacts/bettex-site/src/components/demo/model.ts:88-148`; `artifacts/bettex-site/src/components/investor/walletDemo.ts:621-672`). Keep these explicitly illustrative and contract-test any displayed financial assertions against authoritative server rules; do not treat UI calculations as authorization.
7. **Medium — Eager page imports concentrate frontend delivery** (`artifacts/bettex-site/src/App.tsx:12-37,371-375`). Supplied build has one 2,871,042-byte JS chunk (846,882 gzip). Split heavy routes and compare chunk sizes; no runtime-speed conclusion is established.

**Current → desired map:** React/Vite → Express routes plus in-process accounts, wallets, ledger, agents, risk, execution, reconciliation and audit → separately deploy only evidenced hotspots; isolate signing before real funds. Sequence: enforce ownership, measure load/recovery, isolate signing, then extract one bounded capability. Acceptance: owner-contract tests, zero unauthorized cross-context writes, replay/idempotency and crash-recovery tests, and measured p95/RPC/DB baselines. Scope excludes production financial certification and performance benchmarks.

**Security:** none observed at the reporting threshold.


## Interpretation

A high-priority gap against the desired independently deployed service target is not, by itself, a violation of ADR 0001. Current canonical guidance deliberately preserves atomic financial workflows while enforcing modular ownership and preparing gradual extraction. Route-level composition is an intended assembly point, but direct cross-context SQL and unverified ownership need explicit review; the static checker does not prove their safety. Demonstration calculations are not production financial authorization. Signing must be isolated before real financial operation, which this review does not authorize.

## Incremental acceptance gates

1. Inventory context owners, direct database access and contracts before extraction. Expand boundary checks and owner-contract tests without breaking authorized compositions.
2. Move slow evidence acquisition outside long database transactions while preserving coherent versions, freshness checks and fail-closed persistence.
3. Measure and incrementally ingest blockchain history; preserve reorganization, receipt and ledger verification.
4. Split route delivery and cohesive frontend components/copy by purpose. Keep shared UI primitives and documentary content separate from business-risk prioritization.
5. Select one service for a proven isolation/load/availability requirement. Document deployment, permissions, durable events, idempotency, reconciliation, outage behavior and restoration before splitting transactional writers.
6. Preserve deterministic risk authorization, accounting precision and current local/paper boundaries throughout every phase.
