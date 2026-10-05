# Local withdrawals, atomic entitlement gate and read-only Allora

## Context

The engineering review identified two independently executable gaps: native withdrawals and a race between reading token exits and submitting USDC payouts. Allora public research also needed an actual runtime consumer. None of these gaps authorizes a real-money launch, a redemption price, a trading mandate or resetting the existing chain.

## Decision

- Local USDC withdrawals and BETTEX sends use an attested service contract. Exact asset delivery and the separate 2.50 USDC operating fee either both succeed or both revert. Users sign exact approvals and the final transaction in their browser; gas is separate. Immutable intents, ownership checks, durable nonces and receipt effects govern retries.
- There is no BETTEX → USDC redemption without approved executable pricing and liquidity.
- New local test runtimes use the guarded token, which increments an exit nonce for every positive non-self outflow. A bounded daily payout contract checks the snapshot nonce in the same transaction as delivery, so an outflow cannot slip between the backend check and payment. UTC expiry, budget and one-shot payout identifiers remain enforced.
- The existing token and chain are not replaced. Legacy runtimes retain balances and history, but cannot start new distributions without atomic protection. Adopting a new chain requires a deliberate migration decision, not an implicit restart.
- Runtime bytecode matching belongs to the shared contract library, not an internal dependency from wallets to reconciliation. Masked immutable slots still require link validation.
- Allora is a read-only public LCD/RPC consumer. BTC/ETH/SOL price topics are separately verified against metadata, activity, labeled consensus and the source block on `allora-mainnet-1`. The UI distinguishes source production time, observation time, target horizon and stale data. History preserves source identity; failures have no synthetic replacement.
- These unsigned public price estimates do not provide calibrated Polymarket event probabilities, executable candles/volume, consumer signatures, confidence intervals or trading authority. They remain separate from emulated operations.

## Alternatives and consequences

Resetting the running chain would remove valid test balances and evidence. Retrofitting the existing immutable token with an exit hook is not possible. Off-chain rechecking alone leaves the payout race open. These options were rejected.

The public Allora interface permits real observation without requesting credentials. A signed consumer interface or calibrated event model remains a separate integration and approval gate. Public reading does not spend real funds.

## Verification and migration gates

Contract tests cover exact fees/delivery, rollback, binding, replay, exit-and-return invalidation, operator authority, expiry and budget. Orchestration tests cover immutable destinations, insufficient balance, progressive approval and duplicate signing. Browser verification uses a separate database schema and EVM, never the app's balances.

Public deployment, independent security review, institutional authority, economic policies, production reconciliation and key operations remain unapproved. Local proofs must not be reported as public or production readiness.
