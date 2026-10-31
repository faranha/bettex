# Treasury and Governance as a cross-cutting capability

**Source:** Treasury and Governance agent implementation instruction of October 5, 2026; canonical architecture and Foundation rules.

**Decision:** distribute the capability among agents/risk/ledger/execution/accounts/audit. Agent proposes; risk decides deterministically with versioned policy. Two human identities segregate proposal/approval. Administrative changes have explicit activation. Add persisted accounting reserves, epoch-based serialization shared with local rounds, and reuse the existing executor's journal/nonce/receipts.

**Why:** LLM is not a financial authority; in-memory process or screen-only approval does not prevent double-spending, permission revocation, or duplicate submission after failure.

**Test Hypotheses:** initial policy paused, 0.50 USDC defensive, 0.25 individual maximum, 0.50 per UTC day, destination is the eighth account of the local node; no production/multisig/assumed vote. Versionable values, not definitive economic terms. Do not automatically assign roles to existing accounts.

**Components:** public risk/agent API, reserves ledger, existing accounts permissions, HTTP composition with existing ports/adapters, generated OpenAPI, durable history.

**Verification:** HTTP/database/receipt cycle in a disposable environment; denials, concurrency, pause, uncertainty, and resumption. Public testnet depends on authorized operation/custody/funding; do not fake public execution using localhost.
