# Test contracts as a library of the existing architecture

**Status:** local trial, public deployment blocked.

There was no Solidity, compiler configuration, or installed contracts. Creating `lib/bettex-contracts` is necessary to maintain sources, reproducible compilation, ABI, and testing of on-chain capability, without inventing another domain, service, database, or authentication.

Sources follow the [researched specification](../contracts/bettex-testnet-spec.md). Wallets maintain personal generation/signing; execution adapts the calls; reconciliation verifies network/contract/event/confirmations; audit consumes events. The library does not import internal tables nor replace the ledger with an ERC-20 balance.

Token/vaults do not have upgrades, post-constructor minting, or discretionary redemption. The sale begins paused and has explicit two-stage administration. Dates, destinations, and price remain immutable in this test version to avoid silent changes to the economy. Final calendar, price, quorum, and timelock still require a decision.

Rejected: generic token with full supply in the creator's wallet, unlimited minting, linear vesting in seconds, purchase without price/fee splitting, AI signing, and automatic deployment. Testing on a local EVM does not authorize public transactions.
