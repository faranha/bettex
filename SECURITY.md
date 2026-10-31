# Security

## Current scope

BETTEX has real identity, native accounts integrated into the app, personal EVM wallets encrypted on the client, and data persisted from an emulated financial experience. There is personal signing and execution exclusively on local EVM 31337; there is no production signer, full equity ledger, or real financial distribution. The initial Arbitrum Sepolia association does not prove deployment or public purchase. Native accounts remain blocked outside of development.

Reference for this internal review: **OWASP ASVS 5.0.0**, stable version confirmed at the official source. OpenZeppelin **5.6.1**, Solidity **0.8.37**, ethers **6.17.0**. This is not an ASVS certification or independent contract audit. Results and limits: [internal review](docs/security-review-2026-10-05.md).

## Mandatory rules for this version

- Preserve the absence of password recovery and KYC for native accounts. Password exchange requires the previous password, versioning, re-encryption of the same vault, and revocation of previous sessions. Do not change hash administratively: this does not recover keys.
- All identity/property/permission comes from the server. Current administration grants treasury reading, not export of third-party keys or unrestricted financial signing.
- Exact origins, without trusting forwarded Host; app writes require approved origin and JSON. Clerk maintains its protocol, with the same origin boundary.
- Financial identifiers, decimals, and recipients are validated against the mandate/persisted operation; AI and browser do not authorize funds.
- Secrets outside of Git/frontend/logs; public errors do not carry SQL, stacks, or bodies. Private export is an explicit local action, with re-authentication; prefer encrypted backup.
- Security tests use an isolated empty PostgreSQL schema, own sequences, keys/accounts generated for fixtures, and disposable EVM. Never restart the app's EVM runtime to run tests.
- Versioned and additive migrations; orphaned records block migration, they are not erased. History is append-only; accounting corrections require offsets.
- Do not enable real money while the financial gates and the independent review below are missing.

## Vulnerability reporting

Use GitHub's private vulnerability reporting if enabled. If not, request a private channel from the maintainers before transmitting details. Do not publish exploits, third-party data, or credentials in issues, logs, or on public Telegram.

The enablement of this channel, branch protection, and approval policy depend on repository administration; they were not activated by this change.

## Requirements for development

- Identity/property verification on the backend, not just in the interface.
- Review of CORS, CSRF, session, authorization, request limits, and proxy boundary before production.
- Cost limiting and isolation for account/agent processing; the process memory limit is not a distributed control.
- Log redaction; secrets outside code, frontend, and Git history.
- `pnpm quality` blocks security lint, types, build, boundaries, secrets in workspace/bundles/Git history, unaccepted high/critical dependencies, and regressions of accounts, wallets, execution, and contracts. CI uses the same command, without persisted Git credentials.
- The `braces` exception is specific, documented, and expires on 2026-11-05; new vulnerabilities are not ignored. SAST and privacy analysis were performed in this review, but are not automatically scheduled by this CI.
- Preserve data after failures, restarts, and retries; restore backups in test.

## Additional gates for real crypto operations

1. Approved choice of custody, export/recovery, and key responsibility.
2. Isolated agent signing, with a list of permitted networks/contracts/destinations, limits, and revocation.
3. Versioned mandates and risk policy, approved by the Foundation's leadership.
4. Double-entry ledger, whole units, atomic reserve, and immutable trail.
5. Confirmed providers and contracts; network validation, token, quote, TTL, nonce, gas, and slippage.
6. Failover, concurrency, duplication, uncertain execution, and blockchain reorganization tests.
7. Independent reconciliation and safe interruption when the external source diverges from the ledger.
8. Independent review of contracts and infrastructure before explicit authorization for mainnet.

## Operation and recovery

Procedures, limits, and test restoration: [runbook](docs/security-operations.md).

Consult [threat model](threat_model.md) and [canonical architecture](docs/architecture.md).
