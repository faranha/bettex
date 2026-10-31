# Isolated signature and custody to be decided

**Status:** mandatory isolation; choice of custody/provider pending.

## Context

The product requires an Arbitrum wallet linked to identity, recovery, and export. Not yet implemented. Export depends on the account/custody model.

## Decision

AI never receives keys, signs, or sends arbitrary payloads to the signer. Isolated service validates deterministic authorization, mandate, network, contract, destination, limits, replay, and revocation.

Before implementation, approve custody, signer owner, export, recovery, enhanced authentication, and incident procedures. SDKs and providers are adapters, not the core of rules.

## Alternatives and consequences

Rejected improvised key storage in the engine or PostgreSQL. Do not choose MPC, ERC-4337, or internal custody due to novelty: validate requirements and operational responsibility.
