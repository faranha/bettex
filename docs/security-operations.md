# BETTEX Security Runbook

Applicable to the existing stack. Does not authorize production or custody.

## Backup and restoration

- Production backup: database administrator must configure retention, encryption, restricted access and off-site storage. No production bucket/backup was provisioned in this review.
- Use `pg_dump`/`pg_restore` with credentials via protected environment, never arguments, Git, or logs. Files outside the public directory/repository, 0600 permissions, encrypted storage; no availability via HTTP.
- Cover accounts, links, encrypted vaults, permissions, history, operations/steps/nonces, metadata and schema. Encrypted vault does not recover lost password.
- Restore first in a separate database/environment. Check quantities, referential integrity, uniqueness/idempotency, vaults, append-only audit and uncertain operations before enabling writes.
- Revoke restored sessions before reopening authentication. Old tokens may have been compromised; preserve the revocation audit.
- `pnpm --filter @workspace/api-server check:security` creates empty schema and its own sequences, generates fixtures and verifies HTTP, `pg_dump` and `pg_restore`. Does not copy client rows. Destroys only its schema and temporary file.
- This test proves the restoration of PostgreSQL fixtures, not a production disaster plan or blockchain restoration. Restarting the local EVM creates a new epoch; never treat the previous balance as confirmed.

## Session and credential revocation

- Native logout revokes its session hash; password change revokes all account sessions and preserves wallets through re-encryption on the client. If Clerk is also connected, logout in the app terminates both.
- Native incident: authorized administrator revokes `test_account_sessions` only for the affected holder and records the incident. Do not zero out wallet, change owner, or reset password_hash to “recover” the vault.
- Clerk incident: revoke sessions in the correct provider/tenant; use Replit's Auth/Clerk for managed tenant, without migrating identities.
- Exposed credential: identify owner/provider and uses, revoke/rotate in the provider, update the secret in the correct environment and verify invalidation of the previous one. Remove exposure from workspace, bundles and logs; deleting Git does not revoke a key.
- Do not rewrite Git history or invalidate user keys without coordination. Personal key compromise requires action from the holder, as the server does not possess it.
- Record incident IDs and steps, never credential values. New secret does not go to chat, arguments or versioned configuration files.

## Pause

- `BETTEX_EXECUTION_PAUSED=true`, applied via the protected variables flow and restart of the API server only, blocks new demonstrative/local financial mutations and both broadcast points.
- Maintain reading/reconciliation, login and logout. Submitted operations may confirm during pause; do not resubmit or assume cancellation. Resume using the same operationId after verifying state/nonce/epoch.
- Sales contract: `pause()` only by current owner; `unpause()` only after diagnosis. API pause does not pause the blockchain, and contract pause does not revoke wallet allowances.
- Do not restart the local node as a pause mechanism. Agents do not approve their own resumption.

## External access to be verified by the administrator

- Private repository when appropriate, minimum collaborators, branch approval/protection, secret scanning and private vulnerability reporting.
- Read-only CI, without automatic publishing or production secrets in PRs. Pinned lockfile, firewall and minimum package age preserved.
- Application role in the database without administration/IAM and separated from migration/backup identity. Restrict network and access to copies.
- Separate environments, Clerk tenant, database, networks and credentials. `NODE_ENV` is a configuration barrier, not an IAM substitute.
- This review did not change GitHub permissions, infrastructure, backups or published environments: they require external administrative access. No GitHub connection is attached in this session.
