# Test round and local settlement

## Sources and resolution

Treasury prompts, full path and histories in attached_assets, current full review; PROJECT.md (single rounds, exits, fractions, split), docs/architecture.md and decisions 0007/0009.

Participation follows BETTEX balance × confirmed time, without a new custody contract. Calculation/payments belong to ledger; execution uses the existing executor and journal; operational signature remains in the local wallets adapter. No personal key passes to the server.

## Exclusive reversible test hypotheses

- A synthetic result injection of **1 test USDC** per UTC round and epoch. The reserve→treasury transfer is evidence of funding, not proof of external profit.
- No hidden simulated external costs/taxes/positions: zero, identified as a hypothesis. Primary sale is not to be confused with result.
- Zero defensive requirement exclusively in this fixture without open strategies; risk blocks split without liquidity after other obligations. Never use this mandate for production policies.
- Split approved 50% retention, 25% participants, 25% repurchase; whole micro-units, remainders retained. Zero weight does not split.
- Repurchase destination: seventh operational account of the local EVM, disclosed as a test destination, without automatic token purchase. It is not company revenue.
- Snapshot of weights only after funding confirmed; pending obligation does not become balance. Exit validation before each submission. Closed round does not authorize new submission; only reconciles those initiated.

Basis: user authorized reversible test configurations for undefined parameters, but not new economic rules. It does not allow real money, real trading, or claiming deployment on Arbitrum Sepolia.

## Security

Only development + attested runtime 31337, explicit association, valid session/CSRF/origin. User may trigger the limited test mandate, not choose value, destination, network, owner, or balance. Journal/nonce persisted before broadcast; uncertain result blocks resubmission. Only the holder sees their payments. Reserves, principal, and result have distinct records.

## Accounting and reconciliation

USDC/BETTEX transfers have double-entry bookkeeping by asset in `ledger`, with micro-units/18 decimals, source/destination, epoch, hash/block/log, and event time. Test mints are issuer origin, not commercial result. Wallet and treasury balance is reconstructed by the journal and compared to the on-chain snapshot; divergence blocks financial response, without artificial balance. Verified reorganizations produce reversing entries linked to the original, not editing the past. Gas ETH remains discriminated in receipts, without invented conversion into USDC cost. This is local environment accounting, not accounting of external production orders.

References: Ethereum JSON-RPC `eth_sendTransaction` and receipts, official source `github.com/ethereum/execution-apis`, revision consulted by local base on 2026-10-05; ethers installed 6.17.0. Technical source is documentation, not proof of a BETTEX operation.
