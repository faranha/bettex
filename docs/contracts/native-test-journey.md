# BETTEX integrated test path

> Historical operational test path, not the current visual demo or launch
> policy. Fees, pricing, custody and execution evidence below describe that
> earlier implementation. The community rules in [PROJECT.md](../../PROJECT.md)
> take precedence; this record does not authorize charges or reactivation.

## Sources and decisions

| Requirement | Source and section | Status |
| --- | --- | --- |
| Personal wallets, session, vault and ownership | `docs/decisions/0006-personal-test-wallets.md`, §§ account, vault and initial association; `PROJECT.md` §102 | Approved. Reuse; no Clerk migration. |
| Principal of the purchase in the treasury and separate fee | `PROJECT.md` §§89, 92, 115; `BettexPrimarySale.sol`, `_purchase` and `APP_FEE_USDC` | Approved. Effects confirmed in ERC-20 events of the same purchase. |
| Predefined public vesting | `docs/contracts/bettex-testnet-spec.md`; `TestnetSchedule.sol`, `releasedGroups`; `BettexPrimarySale.sol`, `inventory` | Approved; the local fixture uses 36 monthly dates, not additional issuance. |
| Quantity × time, official wallet, UTC round | `PROJECT.md` §§101, 104; §105 for outputs | Approved: balance-based model, no custodial deposit; entries are not retroactive, partial exit cancels previous weight. |
| Use whole units and reconciled source | `docs/architecture.md`, Sources of truth/Operation/Failures; decision 0002 | Applied to path values. Does not equate to a complete equity ledger. |
| Repetition/restart/lost response | `PROJECT.md` §172; `docs/architecture.md` §§72, 82 | A step reserves nonce/executor before the connector. Confirmed/uncertain is not resent. |
| Reserves/clearing/distribution | `PROJECT.md` §§90, 95, 154–174 | Approved rules, controller/clearing of this previous delivery still incomplete. Unavailable, no invented zeros. |
| USDC in earnings wallet | `PROJECT.md` §90 vs old annex §157 | Divergence identified. This path does not perform staking payments nor choose a new destination. |

“STC” is not an asset found in current documentation/configuration. The implemented asset is test USDC with 6 decimals, separate from BETTEX with 18 decimals. The local fixture is not the public Circle USDC.

## Environment and limits

- Session: existing registration in `/testes/conta`, development only.
- Network available for the verified path: **local EVM 31337**, not public testnet.
- Local association requires explicit consent upon receipt of test balance. Registration continues creating the original Arbitrum Sepolia association.
- Local reserve: MockUSDC already issued in the fixture (100,000 fictional USDC) and node genesis ETH. Receiving balance transfers from the reserve, it does not change SQL balance nor mint coins at each request.
- Supply: 25 USDC, 0.003 ETH in the payer wallet and 0.001 ETH in the BETTEX Wallet; one request per account/day/local execution. The values are exclusively fixture parameters, not a tariff or production financial policy.
- Initial local quote: 0.05 USDC per BETTEX; the screen reads the contract price, not an interface constant. Application channel fee: 2.50 USDC, per existing contract.
- To check receipts, the local criterion is successful execution, exact contract/asset/origin/destination/value and event, canonical block/index/hash. Do not apply this criterion to public Sepolia without its own policy.
- Exit and reentry to the application and backend restart preserve PostgreSQL records and reconciliation with the same node. Restarting the **local EVM node** starts another chain; previous records are preserved/identified as another execution, without presuming current balance.
- Public deployment, funded public reserve, authorized institutional signature and public confirmation policy remain pending.

## Repeat via interface

1. Open `/testes/conta`, create account, save password and accept the warning of absence of recovery.
2. In the Operations tab, check network, address, asset and Deposit QR.
3. Accept the use of the local EVM and click **Receive test balance**. Wait for the confirmed events and check USDC/gas.
4. Inform **100 BETTEX**, click Quote purchase: principal **5 USDC**, fee **2.50 USDC**, total **7.50 USDC**, separate gas and recipient BETTEX Wallet.
5. Confirm the data and password for the exact approval; it does not buy tokens.
6. Confirm the final purchase again after the purchase gas estimate is available.
7. Check remaining **17.50 USDC**, **100 BETTEX** received/eligible, start and temporal weight, principal **5 USDC** effectively received by the treasury and separate fee.
8. Consult hashes/blocks/indices in history. Log out and log in again; the same records must remain.

9. Execute/resume **Test distribution**: global synthetic result limited to 1 USDC per UTC round. If this is the only eligible weight, it receives 0.25 USDC; re-executing does not duplicate the hash or the balance. Consult the entry in Distributions in the shared history.

The USDC/BETTEX journal reconstructs and reconciles wallet/treasury balances in whole units, with reversals audited in reorganization. It does not offer automatic repurchase, on-chain inverse conversion or real trading profit. See [local settlement limits](../decisions/0010-local-round-settlement.md) and `review matrix`. Emulated demo values are not evidence of the EVM. Local payment via EOA does not guarantee atomicity against concurrent BETTEX exit or round flip during submission; it is not authorized for public finance.

## Official technical references

- https://ethereum.org/en/developers/docs/apis/json-rpc/ — balances, logs, receipts, nonce and raw transactions.
- https://docs.ethers.org/v6/api/providers/ — queries and receipts; `/api/wallet/` and `/api/transaction/` — browser signing and transactions.
- https://hardhat.org/docs/reference/network-manager — simulated development EVM.
- https://www.postgresql.org/docs/current/explicit-locking.html — durable executor and nonce deletion/locks.
- https://developers.circle.com/stablecoins/usdc-contract-addresses — identification of existing Sepolia configuration, not MockUSDC fixture.

Internal sources are normative for economics; external references explain technical integration, they do not approve new percentages.
