# BETTEX — internal security and organization review

## Scope and sources

Review of the current implementation, with corrections to the existing architecture. Homepage, economy, existing accounts, real money, and app EVM runtime were not changed by tests.

Official references consulted:
- [OWASP ASVS 5.0.0](https://owasp.org/www-project-application-security-verification-standard/): authentication/session, authorization, validation, data protection, communication, and configuration. Partial coverage oriented by risks; not certification by requirement.
- [OpenZeppelin 5.x: permissions](https://docs.openzeppelin.com/contracts/5.x/access-control), applied to the installed version **5.6.1**.
- [Express: production security](https://expressjs.com/en/advanced/best-practice-security.html).
- Internal official base: version inventory and Robinhood query; examples published in the [official documentation](https://docs.robinhood.com/crypto/trading/) are not BETTEX operational credentials.

## Verified map and boundaries

| Component | Responsibility / boundary |
|---|---|
| React/Vite and inline account | Untrusted browser; wallet decrypted and signed only locally; does not determine balance/authorization |
| Express / OpenAPI-Zod | Authentication, origin, schema, property, and HTTP translation; composition of existing adapters |
| Accounts / Clerk | Opaque native session/hash/TTL/scrypt and verified Clerk identity; do not merge users by email |
| Wallets | Two addresses/encrypted vault/metadata; explicit local association; no private key on the backend |
| PostgreSQL / audit | Transactions, revisions, uniqueness, nonces/idempotence, and journal append-only; statement does not become a real ledger |
| Execution / reconciliation | Operations belong to the account; signature linked to draft; receipts/blocks/effects/epoch checked |
| Current ledger | Participation × time with integers; not yet a patrimonial ledger nor real profit distribution |
| Agents / Allora / risk | Inference and proposals do not authorize signature; current execution emulated, without real trading |
| Test contracts | Fixed supply, vesting, sale in exact units, authorized buyer/destination, reentrancy/replay/pause/owner |
| Infrastructure | Public frontend, API, local auxiliary EVM; Git/IAM/provider/production are external administrative boundaries |

## Problems and corrections

| Severity | Component/evidence | Impact | Correction | Verification |
|---|---|---|---|---|
| High | `app.ts`: CORS reflected any origin with credentials; various mutations depended only on Sec-Fetch-Site | Undue reading in eligible cookie/hostile origin scenarios; uneven HTTP protection | Exact allowlist, reject hostile/absent origin in writes, JSON in app, Clerk authorizedParties; proxy protocol preserved | HTTP and negative tests, fake/HTTP/suffix/port/form/CSRF origins |
| High (scanner) | 5 high/3 moderate alerts in dependencies, initially | DoS and other failures in direct/transitive packages | ethers 6.17.0, Orval 8.39.0, and compatible overrides tmp 0.2.7, fast-uri 3.1.8, brace-expansion 5.0.12; firewall/age preserved | Continuous audit and build/tests |
| Medium | `demo.ts` logged raw Error; Express parser could return details | SQL/params/input/stack in failures | Logs by code and sanitized JSON handler; 64 KiB limit | Errors 400/413/500 without sensitive content |
| Medium | Vault/wallet without FK to the owner in the database | Orphans and loss of integrity guarantee outside transport | FKs and versioned additive migration; orphan fails, is not deleted | FK 23503 in fixture; validation in development |
| Medium | Native logout could preserve simultaneous Clerk session | Involuntary return to another identity on shared device | Terminate Clerk before native session and block local private material | Session/HTTP regression; explicit callback in app |
| Medium | Frontend without CSP/headers and explicit protection of internal files | Insufficient defense against injection/accidental exposure of artifacts | CSP without eval/event handlers, approved inline hash, nosniff/referrer/permissions; deny dotfiles/backups/maps/external symlinks | Static server and regression |
| Medium | No global pause on broadcasts | Pending operations could continue to send after a transport pause | Pause in financial HTTP and before both broadcasts, maintaining reconciliation | Pause tests and sending points |
| Organization | Verifier failed in facade with infrastructure and transport DTO | Inconsistent boundaries/outdated documentation | Composition in the existing adapter; DTO only in transport; map/canonicals updated | `check:architecture` and regressions |

## Permanent and executed checks

- Three scanners: dependencies, SAST, and privacy/dataflow. Initial: 5 high/3 moderate dependencies, 1 medium SAST, 0 dataflow.
- Conservative offline secret pattern scan: workspace, builds, all text blobs accessible in Git and local logs; only metadata, never values. Does not detect all PII/entropy. A public documentation example was classified by exact hash, not allowed generically in execution code.
- `pnpm quality`: lint, architecture, official documentation, codegen, types, account/vault/execution/history tests, disposable EVM, backend/frontend, localization, and bundles.
- Real HTTP over separate empty schema: own data, history of another owner not returned, 403 foreign wallet export, 403 admin, 403 CSRF, 401 incorrect password, and revoked session.
- Real backup/restore `pg_dump`/`pg_restore`: fixtures only; encrypted vaults, session hashes, and journal preserved. Serial defaults have own sequences; FKs are reapplied, as LIKE does not copy foreign keys/triggers.
- Contracts: supply/vesting, owner/two-step transfer/pause, recipient, limit/price, rollback on failure, reentrancy, and replay by buyer; signature, nonce, idempotence, effects, and reorganization in execution rules.
- Vault tests: password/tamper, integrity of the same addresses after password change, and absence of plaintext in persisted structures.
- Complete local regression: **148 automated tests** passed, in addition to HTTP checks and PostgreSQL restoration. Additional static server hardening verified separately. CI prepared with ephemeral PostgreSQL/client 16; GitHub runner not executed in this session. Synthetic SDK bootstrap in keyless environment covers native session, not real Clerk authentication.

## Remaining risks and limitations

1. **Braces 3.0.3 / GHSA-vfj7-8cjw-p6xm (high upstream, no patch)**: official source confirms recursion on deeply nested patterns. Proxy uses filter-function, not glob; fast-glob/codegen receive patterns from code/developer, not requests. Exception only for this advisory, expires **2026-11-05**. Forbidden to accept user/AI glob. Reevaluate if changing usage/dependencies. Scanner continues to show this high; it was not “fixed” or hidden.
2. Medium SAST of fixation in demo cookie: cookie identifies anonymous experience, not authenticated session. Verified identity and browser blocking already claimed prevent use of this token as authorization. Native session is random/hash/expires/revokes. Internal triage, not proof of resistance to all forms of cookie tossing.
3. Abuse limits for some paths continue in proxy memory/IP; native authentication uses persisted limits. Do not scale/publish sensitive resources without distributed limiter and proxy identity validation.
4. JavaScript does not guarantee zeroization of strings/clipboard. XSS/compromised device can expose decrypted material; intentional export is the holder's responsibility, with warning and re-authentication.
5. IAM/branches/DB roles/production backups/external revocation were not changed, due to lack of connected administrative access. Runbook defines actions.
6. Native accounts/local execution follow development-only. No password recovery/KYC as per version decision; legacy Clerk preserved. Do not enable this in production by merely changing NODE_ENV.
7. Demonstration still has floating-point numbers for emulated balances/quotes; do not migrate these values to real money. On-chain contracts/execution/participation/financial history use exact integers/strings. Patrimonial ledger, financial staking/real distribution, deep reorg, and public disaster recovery are not delivered.
8. Direct contracts, without proxy/upgrades or external initializer; mint only constructor, vesting protected. Internal review/tests do not replace independent audit, public multisig control, and deployment/funding validation.
9. Closing of two simultaneous real sessions (Clerk+native) not exercised in the browser in this review; composition checked and native logout verified by HTTP.

## Conditions to continue

Demonstrative development may continue if `pnpm quality` passes, there is no pending exploitable high/critical, and the expired exception is not being ignored. Changing imports/globs, authentication, vault, or finance requires proportional regression and update of these canonicals.

Before new financial services/production: limiter/IAM/external backup tested, exact ledger, isolated signer/mandates, approved networks/contracts/destinations, reconciliation/recovery verified, and independent audit. Green CI does not authorize mainnet.
