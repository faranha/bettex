# Separate financial ledger from emulation

**Status:** mandatory for financial operation; implementation pending.

## Context

JSONB, JavaScript numbers, seeds and limited history validate experience, not accounting integrity.

## Decision

Append-only double-entry ledger, integer units per asset/network, explicit rounding, atomic reserves and outbox. Balance is a projection of the ledger. Corrections are compensatory entries.

Blockchain/broker confirm external operations; ledger defines the reconciled internal accounting position. Timeout maintains reservation until verification. Idempotency protects against duplicate messages/webhooks and restarts.

Separate data, adapters and permissions for simulation/production. Fictitious history does not become real balance.

## Alternatives and consequences

Rejected renaming of demonstration tables and simple increase of decimal places: they do not provide an audit trail or accounting. Requires migrations, concurrency/failure tests and independent reconciliation.
