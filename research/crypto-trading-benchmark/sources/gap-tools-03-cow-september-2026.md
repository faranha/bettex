Source: https://cow.fi/learn/cow-dao-monthly-recap-september-2026
Title: CoW DAO Monthly Recap: September 2026 - CoW DAO
Fetched: 2026-10-14T01:08:27.811Z

[Go to: CoW DAO](https://cow.fi/)

- About
- Products
- Learn

[Trade on CoW Swap](https://swap.cow.fi/#/1/swap/USDC/COW)

- [Knowledge Base](https://cow.fi/learn)
- [Crypto Basics](https://cow.fi/learn/topic/crypto-basics)
- [News](https://cow.fi/learn/topic/news)
- [Governance](https://cow.fi/learn/topic/governance)
- [Guides](https://cow.fi/learn/topic/guides)
- [MEV](https://cow.fi/learn/topic/mev)
- [Product Info](https://cow.fi/learn/topic/product-info)

[Home](https://cow.fi/) [Knowledge Base](https://cow.fi/learn) CoW DAO Monthly Recap: September 2026

# CoW DAO Monthly Recap: September 2026

4 min read

·

Published Oct 5, 2026, 11:11 AM

Some months the headline is a single product launch. This month, TWAP orders opened up to EOAs, so you no longer need a Safe to use them. Two new features shipped alongside it: partial approvals for Limit and TWAP orders, and trade notifications on Telegram. New integrations landed on Plasma and Gate Web3, and governance went to two votes: one on how solvers compete on quotes, and one on unwinding the Balancer arrangement.

Here's everything.

September by the Numbers

- Monthly Volume: $3.5B

- Monthly Trades: 612,679

- Active Wallets: 110.2k (83.5k new · 26.7k returning)

- Cumulative All-Time Volume: $216.4B

- DEX aggregator market share: 16.1%, 3rd across all supported chains


Chain breakdown - top 5 (September):

- Ethereum led at $3.2b

- Base ($128.3m)

- Arbitrum ($105.4m)

- BNB ($79.5m)

- Gnosis ($19.4m)


## TWAP for EOAs

TWAP orders have so far been Safe-only, which suited DAOs, treasuries, and whales but left out anyone trading from a plain externally owned account. That changed in September, when TWAP launched for EOAs directly. Many individual traders don't run a Safe, and this closes that gap. Splitting a trade over time reduces price impact, and everyone deserves that option, not just treasuries and whales.

## Partial Approvals

Every order type on CoW Swap now supports partial approvals, with Limit and TWAP orders finally included. Users approve exactly the amount they're trading, instead of a blanket allowance sitting open indefinitely. Removing the need for unlimited approvals by default is a quiet but meaningful security upgrade.

## Trade Alerts on Telegram

## Trade notifications are live via Telegram. This feature allows users to monitor Swap orders, Limit orders (including partial fills), and TWAP orders, with pings for both trades and expirations.

Aave collateral/debt position swaps, powered by CoW Protocol

Asset swaps and collateral/debt position swaps are now live directly on the Aave UI on Plasma, powered by CoW Protocol. Users can swap any asset, or swap collateral and debt through available liquidity, with MEV protection built in.

## Gate Web3 Swaps

CoW Protocol now powers solver competition and batch-auction execution directly inside the Gate Web3 swap experience. That’s another exchange choosing CoW Protocol's execution model over building (or licensing) its own.

## rTokens on Bitget Wallet

CoW Protocol now supports RealityFi's rTokens, bringing access to 1,700+ tokenized RWA equities to Bitget Wallet users through the same execution infrastructure that powers every other CoW Swap trade.

## Governance

CIP-88, Quote Competition Redesign

The big governance story this month is [CIP-88](https://snapshot.org/#/s:cow.eth/proposal/0x3fc7dc270f3e315e9bc2449bf9f5d0288046125f82b9b140b5866c2886fe71ac), and it aims to fix a funny quirk in how solvers compete.

Right now, several of the solvers that do best in the solve auction barely participate in the quote competition, the part that happens before an order is even placed. The CIP's authors point to their own data showing that gap.

CIP-88 sets up a new way to reward quotes:

- A dedicated quote reward budget, targeting 10% of protocol revenue. That's roughly triple what's spent on quote rewards today.

- A mandate for the core team to design and iterate on how that budget is shared among solvers.


The goal: make quote competition just as strong as solve competition, so the solver that offers the best price up front is usually the one that wins the auction too. Better quotes up front should mean better prices for traders.

The vote has passed on Snapshot on September 25th.

## CIP-89, Unwinding the Balancer Arrangement

A second proposal would wrap up CoW DAO's arrangement with Balancer DAO.

Quick refresher: two years ago, CIP-69 set up a deal between the two DAOs around launching CoW AMM on Balancer's infrastructure. Each side made commitments to the other. But Balancer DAO is now voting on its own orderly winddown, so those commitments don't really have anything to hold onto anymore, on either side.

Here's the proposed swap:

- CoW DAO returns 200,000 BAL to Balancer DAO.

- CoW DAO's hold on 631,850.82 COW is released early. It was originally locked until January 2027.


Think of it as tidying up a joint account when one account holder is closing shop. It also closes out CoW DAO's claim on a treasury that's winding down anyway.

A mirrored proposal is running on Balancer's own forum, so both DAOs are working through it in parallel. [Voting on Snapshot](https://snapshot.org/#/s:cow.eth/proposal/0xe40a5923b1f28bcbfe71e242b754112b116b62c53f1fc771010ce537bc1d7ee8) ends on October 7th.

## See You in October

September put TWAP in everyone's hands and tightened the rest of the product around it.

See you in October.

CoW DAO 🐮

Share

Copy

**Featured Articles**

- [TWAP Orders for DAO Treasuries: A Practical Guide](https://cow.fi/learn/twap-orders-for-dao-treasuries-a-practical-guide)
- [Introducing x402.cow.fi: No Keys, No Sign-Up. Pay-Per-Quote for Bots and Agents](https://cow.fi/learn/introducing-x402-cow-fi-no-keys-no-sign-up-pay-per-quote-for-bots-and-agents)
- [CoW DAO Monthly Recap: September 2026](https://cow.fi/learn/cow-dao-monthly-recap-september-2026)
- [Combining TWAP and Limit Orders: Advanced Execution Strategies](https://cow.fi/learn/combining-twap-and-limit-orders-advanced-execution-strategies)
- [CoW Swap Brings TWAP Orders to Every EVM Wallet](https://cow.fi/learn/cow-swap-brings-twap-orders-to-every-evm-wallet)
- [Limit Order Strategies for DeFi Traders: Scaling In, Scaling Out, and Beyond](https://cow.fi/learn/limit-order-strategies-for-de-fi-traders-scaling-in-scaling-out-and-beyond)
- [5 Common TWAP Order Mistakes (and How to Avoid Them)](https://cow.fi/learn/5-common-twap-order-mistakes-and-how-to-avoid-them)

### Read more

[![Cover image for article: TWAP Orders for DAO Treasuries: A Practical Guide](https://cow.fi/_next/image?url=https%3A%2F%2Fcelebrated-gift-f83e5c9419.media.strapiapp.com%2FTWAP_Orders_for_DAO_Treasuries_a06925fb15.png&w=1920&q=75)\\
**TWAP Orders for DAO Treasuries: A Practical Guide**](https://cow.fi/learn/twap-orders-for-dao-treasuries-a-practical-guide) [![Cover image for article: Introducing x402.cow.fi:  No Keys, No Sign-Up. Pay-Per-Quote for Bots and Agents](https://cow.fi/_next/image?url=https%3A%2F%2Fcelebrated-gift-f83e5c9419.media.strapiapp.com%2F402_e604cc77a7.png&w=1920&q=75)\\
**Introducing x402.cow.fi: No Keys, No Sign-Up. Pay-Per-Quote for Bots and Agents**](https://cow.fi/learn/introducing-x402-cow-fi-no-keys-no-sign-up-pay-per-quote-for-bots-and-agents) [![Cover image for article: CoW DAO Monthly Recap: September 2026](https://cow.fi/_next/image?url=https%3A%2F%2Fcelebrated-gift-f83e5c9419.media.strapiapp.com%2FCOW_DAO_Monthly_Recap_September_f9d0acc66e.png&w=1920&q=75)\\
**CoW DAO Monthly Recap: September 2026**](https://cow.fi/learn/cow-dao-monthly-recap-september-2026)