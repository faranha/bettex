# Snippet-only evidence — on-chain DEX execution

Research date: 2026-10-14. These records preserve the complete search-result snippets available at collection time. They are snippet evidence, not full-page verification. Publication dates are recorded only when present in the snippet; retrieval date is not treated as publication date.

## Jupiter

### Jupiter Developers — Order History (Trigger)
- URL: https://developers.jup.ag/docs/trigger/order-history
- Publication date: não informada
- Tier: 3 (project documentation)
- Complete snippet: “Users can adjust slippage settings via the update endpoint if execution keeps failing due to slippage.
​
Event Types
Each order includes an events array tracking its lifecycle:
* expired | Order expired before execution
* failed | Execution failed”

### Jupiter Developer Platform — Trigger Order API Overview
- URL: https://developers.jup.ag/docs/trigger
- Publication date: não informada
- Tier: 3 (project documentation)
- Complete snippet: “* Edit orders | Must cancel and recreate | Edit trigger price and slippage in-place
* Partial fills | Not supported | Orders fill partially for optimal execution prices
* Output amount | Guaranteed (fixed pool rate) | Not guaranteed (prioritises trigger execution, pool price may vary)”

### Jupiter Developers — Order & Execute
- URL: https://developers.jup.ag/docs/swap/order-and-execute
- Publication date: não informada
- Tier: 3 (project documentation)
- Complete snippet: “```typescript expandable title="@solana/kit" theme={null}
Jupiter handles:
* Optimised slippage via RTSE (Real-Time Slippage Estimator), applied at order time to balance trade success and price protection
* Optimised priority fee strategy for current network conditions
```”

### Jupiter Documentation — DCA Orders
- URL: https://docs.jup.ag/user-docs/trade/spot/recurring-orders
- Publication date: não informada
- Tier: 3 (project documentation)
- Complete snippet: “DCA Orders - Jupiter Documentation - docs.jup.ag
Use DCA V2 instead, which supports advanced features including optional USD price ranges, dynamic fees, and full order history. Existing V1 orders remain viewable on the web at jup.ag/recurring via the Legacy toggle, and in Jupiter Mobile.”

### Jupiter Developer Platform — Changelog: July 2026
- URL: https://developers.jup.ag/changelog/2026-07
- Publication date: July 21, 2026
- Tier: 3 (project documentation)
- Complete snippet: “Changelog: July 2026 | Changelog | Developer Platform
What shipped across Jupiter's developer APIs in July 2026. The Trigger API gains a whole DCA order family, Jupiter Forecast brings 15-minute BTC markets to the Prediction API, and the hosted Jupiter Trading MCP server opens Jupiter's trading infr”

## Uniswap

### Uniswap Developers — Concentrated Liquidity
- URL: https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity
- Publication date: não informada
- Tier: 3 (project documentation)
- Complete snippet: “With v3, liquidity providers may concentrate their liquidity to smaller price intervals than (0, ∞). In a stablecoin/stablecoin pair, for example, an LP may choose”

### Uniswap Developers — v4 Deployments
- URL: https://developers.uniswap.org/docs/protocols/v4/deployments
- Publication date: não informada
- Tier: 3 (project documentation)
- Complete snippet: “The latest version of @uniswap/v4-core , @uniswap/v4-periphery , and @uniswap/universal-router are deployed at the addresses listed below. Integrators should no longer assume that they are deployed to the same addresses across chains and be extremely careful to confirm mappings below.”

### ACM — Concentrated Liquidity Analysis in Uniswap V3
- URL: https://dl.acm.org/doi/abs/10.1145/3560832.3563438
- Publication date: não informada in the snippet; source was surfaced as a 2022 proceedings paper in search results and is older than 18 months as of research date
- Tier: 1 (peer-reviewed academic proceedings)
- Complete snippet: “In this paper, we analyze the effect of concentrated liquidity on the return of the liquidity providers and present an approximation for the expected fees and the impermanent loss of a liquidity provider. First, we provide analytical results and then ver”

## CoW Protocol

### CoW Protocol Documentation — Intents
- URL: https://docs.cow.fi/cow-protocol/concepts/introduction/intents
- Publication date: não informada
- Tier: 3 (project documentation)
- Complete snippet: “In addition, solvers submit all orders in a batch at a uniform clearing price, meaning there is no advantage to re-ordering trades (the basis of all MEV exploitation).
Technical Benefits of Intents ​
The intent-based architecture of CoW Protocol also provides a number of technical benefits:”

### CoW DAO — September 2026 Monthly Recap
- URL: https://cow.fi/learn/cow-dao-monthly-recap-september-2026
- Publication date: October 5, 2026
- Tier: 3 (project publication)
- Complete snippet: “Trade on CoW Swap
Knowledge Base
Crypto Basics
News
Governance
Guides
MEV
Product Info Home Knowledge Base CoW DAO Monthly Recap: September 2026
CoW DAO Monthly Recap: September 2026
4 min read · Published Oct 5, 2026, 11:11 AM Some months the headline is a single product launch. This month, TWAP”

### CoW Swap TWAP EOA availability — PR Newswire
- URL: https://www.prnewswire.com/apac/news-releases/cow-swap-opens-twap-orders-to-every-eoa-wallet-removing-the-safe-only-barrier-302894332.html
- Publication date: September 30, 2026
- Tier: 2 (press release distribution; vendor-originated claim)
- Complete snippet: “30, 2026 /PRNewswire/ -- CoW DAO today announced that CoW Swap users can now place, edit, and cancel TWAP (time-weighted average price) orders directly from any externally owned account (EOA) wallet , closing a gap that previously restricted the feature to multisig wallet users.”

## Bitcoin representations and custody

### WBTC Docs — Mint/Burn Mechanism
- URL: https://docs.wbtc.network/how-wbtc-works/mint-burn-mechanism
- Publication date: não informada
- Tier: 3 (project documentation)
- Complete snippet: “Each newly minted WBTC is backed by one BTC held in custody, maintaining the protocol’s 1:1 reserve ratio.
Minting process diagram
Because WBTC is burned before BTC is released, the circulating supply always remains synchronized with the amount of Bitcoin held in custody.
Burning process diagram”

### WBTC Overview — Custody & Security
- URL: https://docs.wbtc.network/how-wbtc-works/custody-and-security
- Publication date: não informada
- Tier: 3 (project documentation)
- Complete snippet: “Custody & Security - WBTC Overview
BitGo and BiT Global are licensed custodians, and leveraging on the security technology and infrastructure supported by BitGo, WBTC is reliable and assets are”

### WBTC — BiT Global custody transition
- URL: https://wbtc.network/articles/bit-global-to-complete-next-phase-of-wbtc-custody-transition-ac4049691210
- Publication date: March 1, 2026
- Tier: 3 (project publication)
- Complete snippet: “Hong Kong — March 1, 2026 — BiT Global Trust Limited (“BiT Global”) announced a planned transition in the key management structure supporting Wrapped Bitcoin (WBTC). This transition is expected to be completed on May 1, 2026.
service@wbtc.network
Copyright © 2026 WBTC All rights reserved”

### Coinbase — cbBTC
- URL: https://www.coinbase.com/en-gb/cbbtc
- Publication date: não informada
- Tier: 3 (issuer documentation)
- Complete snippet: “Coinbase customers can use the send & receive feature to seamlessly move eligible assets on and offchain. Assets that are transferred from a Coinbase account to an address on Base automatically convert to the Coinbase wrapped asset 1:1.
How cbBTC works”

### Threshold Network — tBTC August 2026 recap
- URL: https://www.threshold.network/blog/august-2026-recap-tbtc-verifiable-bitcoin
- Publication date: August 2026 (day not present in snippet)
- Tier: 3 (project publication)
- Complete snippet: “This continues Threshold’s long standing security first approach to tBTC, particularly as the bridge develops into infrastructure capable of supporting larger volumes of Bitcoin and more demanding institutional use cases.
tBTC Roadmap (Update from ECDSA to Schnorr FROST/ROAST) by Threshold Network”

### Threshold Network — tBTC direct minting
- URL: https://www.threshold.network/blog/tbtc-simplifying-bitcoin-onchain
- Publication date: não informada
- Tier: 3 (project publication)
- Complete snippet: “What's New on the Threshold Network App | Threshold Network
Users can now mint tBTC directly to supported chains, including Ethereum,  Layer 2s, and non-EVM networks, all with a single transaction. In summary, the new features include:”

## Chain transaction cost mechanics

### Solana — Fee Structure
- URL: https://solana.com/docs/core/fees/fee-structure
- Publication date: não informada
- Tier: 3 (primary chain documentation)
- Complete snippet: “Base fee
Prioritization fee
* Provider | Priority Fee API
* Helius | Documentation
* QuickNode | Documentation
* Triton | Documentation
Transaction scheduling priority
The scheduler ranks transactions using the calculate_priority_and_cost function:
Priority = reward * 1,000,000 / (cost + 1)”

### Solana — Fees
- URL: https://solana.com/docs/core/fees
- Publication date: não informada
- Tier: 3 (primary chain documentation)
- Complete snippet: “Fees - Solana
Solana transaction fees consist of a base fee of 5,000 lamports per signature and an optional prioritization fee, priced in micro-lamports per compute unit for legacy and v0 transactions and as an absolute lamport total for v1. Fee calculation, distribution, and compute budget.”

## Automation framework (context only)

### Hummingbot — Gateway DEX Connectors
- URL: https://hummingbot.org/gateway/connectors/
- Publication date: não informada
- Tier: 3 (project documentation)
- Complete snippet: “Connector Schemas
Gateway implements three standardized schemas that define the API structure for different trading types. Each connector must implement one or more of these schemas to ensure compatibility with Hummingbot.
Router Schema”

### Hummingbot — Connectors
- URL: https://hummingbot.org/connectors/
- Publication date: não informada
- Tier: 3 (project documentation)
- Complete snippet: “Connectors - Hummingbot
Gateway connectors establish and maintain connections to automated market maker (AMM) DEXs and other protocols on various blockchain networks, interfaces with their Javascript SDKs, and exposes standard REST API endpoints for trading and liquidity provision-related actions on these DEXs.”

### Hummingbot — Order Lifecycle and Market Events
- URL: https://hummingbot.org/connectors/connectors/architecture/order_lifecycle/
- Publication date: September 22, 2026
- Tier: 3 (project documentation)
- Complete snippet: “Order Tracking
Submitting an Order
Order Being Filled
Order Cancellation or Expiry
Order Failure
If a failed order has been rejected for any reason other than cancellation or expiry, MarketOrderFailureEvent must be emitted.
September 22, 2026
Copyright © 2026 Hummingbot Foundation”
