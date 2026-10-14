Source: https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders
Title: TWAP orders | CoW Protocol Documentation
Fetched: 2026-10-14T01:05:34.687Z

[Skip to main content](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders#__docusaurus_skipToContent_fallback)

On this page

**Use with LLM**

Time-Weighted Average Price (TWAP) orders are an advanced order type available on CoW Protocol that breaks up a large order into several smaller pieces.
TWAP orders are ideal for executing big trades with minimal price impact.

## How TWAP Orders Work [​](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders\#how-twap-orders-work "Direct link to How TWAP Orders Work")

TWAP orders split up a large order into a series of normal limit orders that trade at fixed intervals. When setting up a TWAP order, users specify how many parts they'd like to split their trade into, as well as the total duration of the order (can be hours, days, weeks, or even months).

TWAP orders on CoW Protocol require several inputs:

- **Assets**: Just like you would with a regular swap, begin by specifying the assets you want to swap
- **Price Protection**: One of the unique parts of TWAP orders on CoW Protocol is the "price protection" option which allows you to specify the minimum market price you'd be willing to take for your order. If the price of the asset you're buying falls below what you specify for any, that part of the TWAP order will not execute until the price recovers above your threshold
- **Number of Parts**: Here you specify how many parts you'd like to split your large order into
- **Total Duration**: Specify the total length of time that you want all parts of your order to execute over

## Benefits [​](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders\#benefits "Direct link to Benefits")

TWAP orders provide a number of benefits, especially when it comes to large orders:

- **Lower slippage**: Breaking up a large order into smaller pieces allows users to set a smaller slippage tolerance for each piece than if they had executed the large order as one
- **Lower price impact**: As with slippage, breaking up a large order into small pieces allows users to spread their liquidity needs over time, reducing price impact
- **100% of order surplus**: On CoW Swap, all order surplus is forwarded to the user. If an order executes for a price better than the quoted price - thanks to [Coincidences of Wants](https://docs.cow.fi/cow-protocol/concepts/how-it-works/coincidence-of-wants) or any other price improvement that solvers are able to find - the extra price improvement will be forwarded to the user
- **Eliminating market fluctuations**: By giving traders the time-weighted average price, TWAP orders smooth out market volatility
- **Custom order parameters**: Users can choose how many parts to split their TWAP order into, adjust the execution timeframe, and even enable a "price protection" feature which prevents execution at unfavorable prices due to market volatility

## TWAP Requirements [​](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders\#twap-requirements "Direct link to TWAP Requirements")

There are also several requirements for placing TWAP orders through CoW Protocol

- Trades on Ethereum Mainnet must be a minimum of $1,000 (the minimum is only $5 for trades on Gnosis chain, Arbitrum One and Base)
- Users must have a [Safe wallet](https://safe.global/wallet) with an [upgraded fallback handler](https://blog.cow.fi/all-you-need-to-know-about-cow-swaps-new-safe-fallback-handler-8ef0439925d1)

## Getting started [​](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders\#getting-started "Direct link to Getting started")

Wanting to place a TWAP order? Check out our [TWAP order tutorial](https://docs.cow.fi/cow-protocol/tutorials/cow-swap/twap). You can also [read about TWAP on our blog.](https://blog.cow.fi/cow-swap-launches-twap-orders-d5583135b472)

- [How TWAP Orders Work](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders#how-twap-orders-work)
- [Benefits](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders#benefits)
- [TWAP Requirements](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders#twap-requirements)
- [Getting started](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders#getting-started)