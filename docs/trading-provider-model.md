# BETTEX trading model: official API research

Documentation consulted on October 5, 2026. This is the specification for the next engine evolution, not a declaration of already implemented integrations. The current engine remains emulated and does not send orders to external platforms.

## Product direction

- Sports and predictions: Polymarket, with separate specialized agents on the same connector.
- Meme coins: Robinhood or FOMO. Confirm the identity of FOMO before defining its connector.
- AI Hub and Live Trading are a single experience, without avatars or user chat.
- Transparency enters into the details and the path of operations; it does not constitute a navigation area.
- Navigation: My dashboard and AI Hub; My Account as an icon on the right, next to the community. Treasury, personal participation, and project results remain directly on the dashboard, without alternative destinations or tabs.
- Do not rewrite the homepage, Pitch, or commercial documentation as a result of this research.

## Polymarket

### Documented surfaces

- Gamma: events, markets, rules, state, results, and token identifiers.
- CLOB REST: order books, prices, orders, and restrictions per market.
- Market WebSocket: book, prices, trades, tick change, and market lifecycle.
- User WebSocket: authenticated orders and executions of an account.
- Sports WebSocket: scoreboard, period, progress/end of match, slug, and update time. Connecting does not require authentication or subscription frame. Respond to the server ping with pong.
- Data API: positions and activity. Check the version and pagination form before implementing; the documentation includes v1 → v2 migration.

### Domain model

Separate Event, Market, OutcomeToken, BookSnapshot, Order, Fill, Position, and Resolution. Do not confuse event with market or condition with tradable token. Keep the original external identifiers and the version of the consumed contract.

Each outcome has a tradable token. The price is a price per share; its interpretation as a market probability is not the agent's confidence. A model's confidence/estimate needs origin, version, and its own evaluation.

Orders are limit orders. GTC/GTD may remain in the book; FOK requires full execution or cancellation; FAK allows partial and cancels the remainder. A post-only order that crosses the spread is rejected. Do not complete an order just because six seconds have elapsed.

Keep limit price, requested/executed/remaining quantity, validity, maker/taker, fills, costs, external state, and normalized state. Cancel only the unexecuted balance; never undo already confirmed fills.

Do not assume that bids/asks are ordered with the best price first: the REST documentation describes ascending bids and descending asks. Normalize and sort explicitly before calculating best price, depth, and impact.

Respect tick_size, min_order_size, neg_risk, market availability, and fee parameters. The documentation consulted includes 0.005 and 0.0025 ticks, in addition to the most common sizes; do not reduce validation to the number of decimal places.

Some sports markets have a configured execution delay. During the pending delay, cancellation may not be allowed. Do not confuse these cases with the 250 ms delay indicated for some crypto/finance markets.

Orders and trades have different states:

- Order: live, matched, delayed, unmatched, as well as rejection/cancellation according to the surface.
- Trade: MATCHED → MINED → CONFIRMED, or RETRYING/FAILED.
- Event result: proposed, contested, and resolved, according to rules/oracle.

Final scoreboard does not equate to confirmed resolution. Keep position open until confirmed sale or valid redemption after resolution. Winning position normally redeems $1 per token; losing $0; the documentation provides for exceptional 50/50 resolution. Do not invent resolution based on title or clock.

### Collateral and fees

The documentation consulted identifies **pUSD** as trading collateral and describes wrapping/unwrapping of USDC.e on Polygon. Distinguish USDC of the BETTEX account, USDC.e, and pUSD of the provider; presentation conversion is not executed transfer/conversion. Revalidate contracts, accepted asset, and funding route before any authenticated integration.

Fees vary by market. The consulted page presents `shares × feeRate × price × (1 − price)` for takers, with parameters by category, while makers do not pay this fee. Read the effective market parameters and keep their origin/time; do not treat the editorial table as a permanent universal fee.

Position marking uses executable price and estimated costs, not arbitrary last price. Realized profit only arises from confirmed and reconciled sale/redemption. Keep exposure, reserves, and unrealized results out of the distributable result.

### Information and possible charts

- Sports: event, score/period when available, price of each outcome, volume/liquidity, book, deadline/rules, and position state.
- Predictions: question, outcomes, historical price, liquidity, resolution date, and rules.
- Charts: price/probability per outcome; book depth; exposure per market; cost and estimated net value of the position. Agent estimate does not come from the price API and must not be manufactured.

## Robinhood Crypto Trading API

There is official v1 and v2 version documentation. The documentation and support consulted inform availability for Robinhood Crypto customers in the United States, according to account/jurisdiction eligibility.

Market queries also require authentication. There is, in this research, no basis for treating its quotes API as an anonymous public source. Do not request or create keys for this prototyping.

### Relevant model and differences

- Pairs: `symbol`, `asset_code`, `quote_code`, increments, maximum, minimum, state, and `is_api_tradable`. In v2, the endpoints consulted accept enabled USD pairs. Do not infer support for any meme coin or use BTC/USDC as if it were a confirmed Robinhood pair.
- Quote v2: bid/ask does not necessarily include size and fee. Consult estimated_price for specific quantity; it is still an estimate, not a guarantee.
- Quote v1: fields describe embedded spread. Do not add again a spread already included.
- Account: buying power, currency, state, eligibility, and, in v2, fee tier.
- Order: `client_order_id` for idempotency, buy/sell, market/limit/stop_loss/stop_limit, corresponding settings, fills, average price, executed quantity, and effective fee.
- Holdings: total and available for trading; do not sell already committed quantities.
- Documented order states include open, pending, filled, canceled, and failed. Keep separate executions; partial quantity does not become zero because the remainder was canceled.

Using a common execution interface does not mean leveling all platforms: Robinhood USD account is not pUSD wallet on Polygon. Funding, prices, fees, restrictions, settlement, and reconciliation need their own adapters.

Sustainable charts: series of own quotes with date/origin; entry/exit; quantity and exposure per asset; realized/unrealized result; estimated price × effective average price. OHLC/volume must not be invented from a single bid/ask: require appropriate source and its identification.

## FOMO: point not yet confirmed

The trading product `fomo.family` was found, whose official page describes meme coin and token trading, multichain platform, and social functions. No official public documentation that authorizes inferring an execution API was located in this research.

Results such as fomoapi.io and getfomoapi.fun identify themselves as independent/unofficial social data services. Do not present them as an official FOMO API nor as authorization to execute trades.

`fomo.com` and its documentation belong to another marketing/social proof product; do not use this API to model cryptocurrency trading.

Confirm the address of the intended FOMO. If it is fomo.family, keep execution as an unverified capability until official documentation or provider confirmation is obtained. Do not automate private app/web, capture sessions, or bypass access controls to create a connector.

## Bank and communication

Keep durable history in tables of instruments, snapshots, proposals, decisions, orders, fills, positions, reconciliations, and messages. The dashboard's short window must not exclude the historical financial trail. Do not replace the current account/transaction structure or erase data when evolving the engine.

Message between agents: id, operation correlationId, causationId, origin/destination, type, validated payload, createdAt, deadline, state, and attempts. Examples: opportunity detected → risk assessment → reserve → order → fill → confirmation → reconciliation.

Idempotent consumers, conditional transitions, deadline for quotation, and expired data blocking. Message repetition does not repeat debit, reserve, or execution. Order sent with unknown result requires reconciliation before new attempt.

Conserve limited mandates approved by humans. Operational AI approval within the mandate is not human approval of every order. Display blocks, rejections, losses, and times without opportunities; do not produce only positive stories.

## Prototyping and promotion to the application

First, implement read adapters, validated contracts, and paper execution. Data must carry `sourceMode` (live/replay/emulated), provider, origin time, collection time, and update state. Do not mix simulated profit with real position or hide failures with manufactured numbers.

Separate strategic proposals, risk/treasury gating, and executor. The prototype executor has no credentials or path for real submission. Authenticated connection, financial access, and real trading require an explicit subsequent stage, in addition to account/jurisdiction, terms, security, reconciliation, and failure testing.

Do not copy old memory SDK: the Polymarket documentation consulted includes unified clients and migration pages. Verify effective interfaces and HTTP contract before installing dependencies.

## Sources consulted

- https://docs.polymarket.com/getting-started/api
- https://docs.polymarket.com/market-data/overview
- https://docs.polymarket.com/market-data/prices-order-books
- https://docs.polymarket.com/concepts/order-lifecycle
- https://docs.polymarket.com/trading/place-orders
- https://docs.polymarket.com/concepts/resolution
- https://docs.polymarket.com/concepts/pusd
- https://docs.polymarket.com/trading/fees
- https://docs.polymarket.com/asyncapi-sports.json
- https://docs.robinhood.com/crypto/trading/
- https://robinhood.com/us/en/support/articles/crypto-api/
- https://production.fomo.family/
