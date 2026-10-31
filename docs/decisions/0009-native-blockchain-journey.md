# Blockchain journey with existing personal wallets

**Status:** local development; no public deployment.

The end-to-end order replaces delivery limited to observation. Existing Solidity contracts will be reused, without new token, AMM, custodial staking, or authentication.

The journey uses the native session and the personal vault already existing in `/testes/conta`: these are the wallets from this registry that can pay and receive without requiring manual import into another wallet. This does not migrate or delete Clerk accounts. Cancelled forms do not represent choices.

Participation is the available balance model in the BETTEX Wallet, without additional deposit: PROJECT.md, “all BETTEX available in the official wallet”, and exit/round rules. The start comes from confirmed events, not from USD balance or the instant the screen is opened. Yields remain without assessment while there is no reconciled liquidation; do not reuse emulated yields.

There is no public deployment/funded operational reserve in the current configuration. To demonstrate real operations without faking Sepolia transactions, a local development EVM executes the existing contracts and the MockUSDC restricted to network 31337. The application explicitly identifies this network as local, not as Arbitrum Sepolia. Its RPC is not exposed to the browser: reads and retransmission of signed personal transactions pass through existing native access and CSRF.

The local EVM operator uses the node's unlocked account to supply dummy USDC/ETH; no operational or personal key is loaded into code, logs, or AI context. Personal keys remain encrypted and are used only by the holder in the browser, with password and explicit authorization for the exact transaction data.

Operations and steps belong to `execution`, with nonce/executor reservation persisted before submission. Hash known before broadcast and/or origin+nonce allow reconciling a lost response. Restart/timeout does not authorize resubmission. Evidence/participation and balances are confirmed by RPC, without demonstrative projection.

The local EVM does not promise persistence after the node itself restarts. Each execution has its own identification; operations from another execution are preserved but not presented as confirmation on the current chain. Publication and public testing depend on contracts/address/funded reserve/authorized operational signer, and are not replaced by this demonstration.

Internal sources: AGENTS.md §§ Flow/Integrity; decisions 0002, 0003, 0006–0008; PROJECT.md §§ automatic participation, cancellations, reservations; Solidity BettexPrimarySale §§ inventory/buyTo; existing personal registry and vault. External references: Ethereum JSON-RPC (eth_sendRawTransaction, eth_getTransactionReceipt, eth_getLogs), ethers 6 documentation (Transaction, Wallet, Provider), Hardhat 3 EDR and PostgreSQL locks/transactions. No movement on mainnet is implemented.
