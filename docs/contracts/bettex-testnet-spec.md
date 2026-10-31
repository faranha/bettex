# Historical test evidence — not current community policy

This document records an earlier test implementation, not the current launch
specification. Its service fee and 36-month vesting assumptions are obsolete.
The current direction in [PROJECT.md](../../PROJECT.md) is no BETTEX service fees,
24-month vesting forecast from March 2027, and a visual-only demo. Preserve
historical test receipts and implementation facts; do not use them as permission
to deploy, charge users, or reactivate financial operations.

# Short Specification — BETTEX test contracts

Research registered on 2026-10-05, **before writing the contracts**.

## Sources and precedence

The prevailing creator rules in `PROJECT.md` take precedence over old whitepapers. The external technical source guides code, it does not change economics. The current request allows implementing and verifying test contracts; it does not authorize mainnet, real payments, or automatic publication.

| Requirement | Internal source, section | Decision and proposed implementation |
| --- | --- | --- |
| Arbitrum for the token | `WhitepaperChapters.tsx`, `documentacao-rede`; `docs/personal-test-accounts.md`, network | Public test target: Arbitrum Sepolia 421614. Execution in this delivery only local EVM 31337 |
| Supply 1,000,000,000; 65/20/15 | `src/lib/tokenomics.ts`; `documentacao-emissao` | ERC-20, single issuance in the constructor; 650/200/150 million allocations fully locked |
| All issuance under vesting | `VestingSchedule.tsx`, `documentacao-vesting` | Three destinations since issuance; none receive everything in advance |
| Installment 1 at opening; 36 installments | `VestingSchedule.tsx`, paragraphs 1–3; `src/lib/vesting.ts` | Immutable dates; cumulative `floor(50,000,000 × month / 36) × 13/4/3` in whole tokens. Do not use continuous release of standard VestingWallet |
| Public inventory is not sold nor profit | `SaleChannels.tsx`, Public sale | 65% inventory remains in the sale contract; released quota limits sales; there is no administrative withdrawal of this inventory |
| Public price goes entirely to the treasury | `SaleChannels.tsx`; `PROJECT.md`, sale to brokerages | Distinct USDC transfers: price to treasury, fee to operational cash; atomic purchase and delivery |
| US$2.50 fee in the app | `ServiceFees.tsx`; `PROJECT.md`, fees confirmed 10/03/2026 | 2,500,000 units of the six-decimal USDC; no charge in BETTEX, no burn on purchase |
| Direct sale to brokerages | `SaleChannels.tsx`; `PROJECT.md`, public sale | Separate path authorized by administration, with price explicitly accepted by the buyer; does not automatically add the app fee |
| Founder can allocate released; investors without fourth allocation | `VestingSchedule.tsx`; `PROJECT.md`, Founder and team | Two vaults with immutable beneficiaries; individual concessions/fundraising not implemented |
| Separate yield fees | `PROJECT.md`, fees and repurchases; `DocumentationGovernance.tsx` | Contract does not call 50/25/25 split nor treat sale as profit |
| Repurchase followed by definitive burn | `PROJECT.md`, Approved repurchase policy | Voluntary burn of own/permitted balance; do not deploy repurchase engine |
| Self-custody | decision `0006-personal-test-wallets.md` | Contract does not receive passwords/keys nor maintain custody of personal wallets |
| Administration and multisig | `DocumentationGovernance.tsx`, Custody and versions | Token without administrator/mint/update; only pausable sale, two-step ownership. EOA administrator only in local tests; public requires multisig configuration and review |
| Architecture and events | `AGENTS.md`; decisions 0001–0004; `docs/architecture.md` | Contract library, not new service/context/authentication. ABI and events are boundary for wallets/execution/reconciliation/audit; no emulated balance imported |
| Future staking | `PROJECT.md`, exit cancels rights; `documentacao-staking` | Only ERC-20 Transfer/Burn events for future reconciliation. No promise that the current contract implements staking/eligibility/prorating |
| Closed pool and two wallets | attachment `Pasted-Sim-a-emiss-o-inicial-deve-separar-as-aloca-es-e-soment_1791178994163.txt`, §§5–6 | On-chain payer/recipient allowlist, revocable; `buyTo` receives USDC from payer and delivers BETTEX only to authorized destination. It is not KYC |
| Inventory distinct from allocation | same attachment, §4 | Getter `inventory` distinguishes total, locked, released, sold, and available balance; there is no AMM, USDC reserve, or buy-back |

The component and lib paths in this table are relative to `artifacts/bettex-site/src/`.

## Gaps and strictly temporary configurations

- “BTEX” identifies the primary AI in other areas; the documented token is BETTEX. Name **BETTEX Testnet**, symbol **tBETTEX** and 18 decimals are technical conventions of this trial, not a new economic ticker decision.
- Opening date and timestamps for the 36 months are not approved. The contract receives 36 immutable timestamps, strictly increasing with 28–31 day intervals. Fixtures use monthly UTC calendar with adjustment to the last day; no commercial date or definitive timezone rule is established.
- Price in USDC per whole token is not approved. Fixtures use hypothetical price; no historical fiat price is converted into supply. There is no oracle, administrative price change, or sale of fractions in this first implementation.
- Representatives, addresses, multisig quorum, and eventual timelock are not approved. Sale starts paused. Pause does not alter vesting nor freeze personal transfers.
- Contracts are not upgradeable. Evolution depends on new reviewed deployment and explicit plan, not proxy/backdoor that alters rights.
- Current **angel** contribution rule (100% product/technology/marketing, no founder withdrawal, `PROJECT.md`) prevails over old phrases of free allocation. Investor fundraising is not implemented by this contract.
- “STT” remains unidentified and is not created or equated to USDC. Test USDC used in the trials is identified separately.
- Allora is not Aurora; Robinhood and Allora are not issuance destinations of this contract. No bridge, multi-network duplicated issuance, or invented integration.
- No staking contract, ledger, funding, gas subsidy, automated risk, profit distribution, or full repurchases in this delivery.

## Verified external sources

- Arbitrum Corpus, `quickstart-create-a-token.mdx`, version `git-blob:f06398aa9a8f580725ee50c541f3801a08919fe2`, checked 2026-10-05: RPC `https://sepolia.arbitrum.io/rpc`, chain 421614, explorer `https://sepolia.arbiscan.io/`.
- https://docs.openzeppelin.com/contracts/5.x/erc20 — ERC-20, units and burn extension.
- https://docs.openzeppelin.com/contracts/5.x/access-control — ownership, contracts as administrators, two-step transfer.
- https://docs.openzeppelin.com/contracts/5.x/api/token/ERC20 — SafeERC20; USDC contracts can revert due to block/pause.
- https://hardhat.org/docs/reference/configuration — local EDR network; no HTTP configuration or public account.
- https://developers.circle.com/stablecoins/usdc-contract-addresses — Arbitrum Sepolia USDC `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`; do not use mainnet address.

Pinned versions: Solidity/solc **0.8.37**, OpenZeppelin Contracts **5.6.1**, Hardhat **3.18.1**, ethers **6.16.0** and esbuild **0.28.2**. Optimized IR compilation (200 runs), target EVM Shanghai, verified EIP-170/3860 limits. The official Solidity bug list was consulted (`https://docs.soliditylang.org/en/latest/bugs.html`); use current published version, not nightly. The base also returned old ERC documents; they **are not** used as the sole technical reference for current ERC-20.

## Design and verification criteria

`BettexTestToken` creates single supply, `BettexPrimarySale` holds 65%, two `BettexAllocationVault` hold 20/15%. All block deployment outside 31337/421614. MockUSDC local only; in Sepolia the sale requires the official address, existing code, six decimals, and contractual administrator.

The date of the first installment cannot be in the past at deployment. A direct sale requires explicit revocable intent from the buyer (amount/ceiling/operationId), USDC approval, and execution authorized by the administration. Public ownership cannot be transferred to EOA; administrative renunciation is blocked. Requiring contractual code **does not prove** valid quorum/multisig: its validation remains mandatory before public deployment.

Test: mainnet block; invalid constructors; supply and absence of mint; three vaults/inventory; 36-month limits and proportions; first installment; catch-up without duplication; paused sale; permissions; exact USDC split; idempotency; full rollback on failure; burn without issuance; personal transfer without fee; persistence and confirmation of local EVM events.

**Publication barrier:** do not include broadcast command or public signature. Public deployment remains pending dates, approved test price, addresses, multisig/timelock, and security review. Local tests are not equivalent to independent audit or confirmation on public explorer.

## Local verification result

On 2026-10-05: **19 tests approved**, with local EVM transactions, receipts, and events. Automatic comparison of **all 36 installments** with `src/lib/vesting.ts` compiled directly from the application. Includes rollback of price transfer when fee transfer fails, rejection of duplicate purchases, revocable brokerage intents, re-entry during payment, isolation of IDs per buyer, access authorization/revocation, and payment/delivery in two distinct wallets. The additional test exercises blockchain reader, verified runtime, account isolation, and the client's real purchase helper; a lost response after execution is reconciled without second signature/payment. The suite does not read user keys or call public RPC. The emulated EVM with Sepolia chainId is not a public deployment.

Execute `pnpm --filter @workspace/bettex-contracts test` and `pnpm --filter @workspace/bettex-contracts build`. Both were incorporated into the existing validator `scripts/validate-development.mjs`. Local execution does not create real financial balance or confirm the entire platform's operation.

## Integration and full flow limits

The second attachment also requires event persistence/processing and dashboard. The [observation decision](../decisions/0008-test-contract-observation.md) registers the integration in `reconciliation`, typed API, and dashboard on the existing balance/history page. Configuration is linked to Clerk identity already verified; EVM events are persisted idempotently by network/address/tx/log/block hash. The runtime is compared with compiled sources, ignoring only immutable slots reported by the compiler. All reads use the same block and its hash is checked again. Failure does not return demonstrative balance or old snapshot as new evidence.

The dashboard accepts already deployed address; without configured address it does not show financial numbers. Displayed history covers up to 2,000 blocks and 50 recent events, explicitly partial; the database does not replace blockchain verification or constitute a ledger. Previous/orphaned events are conserved as observations, not returned as current confirmation. The forwarded principal is calculated from `sold` and immutable price read in the verified block, equivalent to contract transfers; it does not represent treasury's free balance.

The purchase via dashboard asks for signature in the user's own wallet: mandatory network 421614, previously authorized payer/destination, free USDC/ETH, USDC approval limited to total, and `buyTo` with persisted nonce. Uncertain result blocks new submission and queries `processed`/receipt before continuing. There are no keys on server/AI, repurchase, or link to emulated ledger.

The new flow uses existing Clerk and does not create additional authentication. The previous isolated native account was not migrated/deleted; a global unification remains without creator decision, and form cancellation is not a choice. There are still **no** public addresses or purchase in explorer: before deployment, approved dates/price/addresses/administration and free supply are missing. Do not present this delivery as an already operating public flow.

The second attachment's generic claim that the cadence was undefined was confronted with the current source `VestingSchedule.tsx` and `lib/vesting.ts`, which explicitly define the 36 monthly installments and their formula. The design uses this prevailing decision, keeping only timestamps/price/accounts as test configurations.
