# Modular contexts and gradual service extraction

**Status:** adopted as a development rule; structural migration pending.

## Context

The existing API is monolithic and the financial state is demonstrative. Distributing processes without precision, authorization, and recovery only increases risk.

## Decision

Adopt the contexts and dependencies from [architecture.md](../architecture.md), with public interfaces, data ownership, and incremental migration. Preserve artifacts, database, and routes during evolution.

Isolate signature before any real transaction. Extract other services for proven safety, load, or availability, with outbox, idempotency, and observability.

## Alternatives and consequences

Rejected immediate total decomposition: would require distributed operation before a reliable financial core exists. Modules do not authorize keys with agents. Future extractions require their own deployment and verification.
