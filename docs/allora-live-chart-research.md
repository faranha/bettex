# Allora: inferences and charts for the BETTEX dashboard

Official documentation research and public queries performed on October 5, 2026. This document does not imply that the dashboard has already been connected to Allora.

The canonical registry of pending items, necessary decisions, and evidence for closure is at [Integrações Allora e Polymarket](integration-pendencies.md). The queries described here are evidence of that research, not presumed current availability nor authorized interface choice.

## Conclusion

Allora is an inference network, not a chat and not an exchange. Consuming an inference does not execute an order. The main visualization must show the observed market and the corresponding prediction, leaving decisions, risk, execution, and results in distinct layers.

The public mainnet reading worked in this environment without credentials:

- GET `/emissions/v10/topics/14`: BTC/USD — Price Prediction — 8h.
- GET `/emissions/v10/is_topic_active/14`: returned active.
- GET `/emissions/v10/latest_network_inferences/14`: returned consensus, individual inferences, and block.
- RPC `/block?height=<inference block>`: returned block time.

These queries were performed on the official domains `allora-api.mainnet.allora.network` and `allora-rpc.mainnet.allora.network`. Do not publish worker addresses or transform a predicted price into an automatic buy recommendation.

## Two different interfaces

### Consumption API with signature

Official base: `https://api.allora.network/v2`.

The quickstart uses `/allora/consumer/ethereum-11155111?allora_topic_id=69`, with `x-api-key`. The personal key is obtained from the developer portal. Check for an available integration before requesting secret configuration. Never expose the key to the browser.

It returns `network_inference_normalized`, a fixed integer value, `token_decimals`, topic, timestamp, and signature. The only signature format enumerated in the TypeScript documentation consulted is Ethereum Sepolia; this does not mean that the BETTEX trading operation occurs on that network.

TypeScript SDK: `@alloralabs/allora-sdk`, imported from the root, not from the `/v2` subpath. Explicitly configure baseAPIUrl to the current domain: documentation states the default still points to a legacy host.

### Cosmos LCD / Public RPC

The documentation's `/api/networks.json` manifest reports v0.17.0, namespace `emissions/v10`, for mainnet and testnet. One sentence on the general API page still mentions v9 on mainnet; use the current manifest and check the effective endpoint.

The inference is a labeled bundle: `combined_value` contains entries `{label_id,label_name,value}`; regression of an output uses `y`. `inferer_values` and `forecaster_values` are also labeled. Do not treat `combined_value` as a scalar.

There is no timestamp directly in this response; resolve the informed block and save production time separate from collection time. Successful polling does not make an old inference new.

## What is documented

The published list of topics includes price, log-return, and volatility for assets such as BTC, ETH, and SOL; there are also NEAR and XRP topics, among others. Horizons vary by task and by network. IDs are not interchangeable between testnet and mainnet.

Examples from the published list:

- Mainnet: BTC/ETH/SOL with price predicted in 8h.
- Mainnet: BTC/ETH/XRP/SOL volatility in 15 minutes.
- Testnet: price in short horizons and BTC playground, including 5 minutes.

The list is an editorial snapshot; check activity, metadata, unit, horizon, and currency on each chosen topic. Distinguish prediction horizon from update frequency. An "8h" topic may publish new inferences every epoch, not every eight hours.

No ready-made service for sports prediction or price for any arbitrary meme coin was found in this list. Allora admits proprietary tasks, including multiple outputs/classification in the documented version; creating a sports task requires a model, participants, labels, ground truth, and evaluation. Do not send a textual question as if the API were a generic LLM.

## Uncertainty limits and evaluation

The SDK declares interval fields, but its documentation states that consumer endpoints currently do not populate them. The latest inference LCD also does not return intervals or individual weights.

Do not draw an official confidence band if the response does not contain it. One may show the dispersion of individual available inferences, labeled as model dispersion, never as a probability of being correct or a calibrated interval of the future price. Do not confuse consensus with a guarantee.

To evaluate prediction versus result, preserve each prediction with origin, network, topic, block, time, horizon, units, and target value. When the horizon expires, compare it with an adequate observed price source. Do not retrospectively replace the old prediction with the new one.

## Possible charts

### 1. Market versus Allora

- Observed price in line or candles, from an identified market source.
- Inference as point/dashed line on the correct horizon.
- New inference arrival mark only when the block/epoch actually changes.
- Model dispersion, if displayed, with its own label.
- Decision/entry/exit event only when there is a corresponding record; predicted price is not an executed order.
- Open the AI Central while maintaining the context asset/topic.

Allora is not the source for candles simply because it returns a prediction. The Go SDK documents OHLC, but the TypeScript client does not present this capability. Candles require a market source or appropriate Atlas data; an isolated price query does not produce volume/OHLC.

### 2. Polymarket probabilities

- Price per outcome over time and 0–100% units.
- Market/question/event and resolution rules identified.
- Spreads and liquidity/depth in context, without calling price objective probability.
- For sports, scoreboard/period from the sports feed are context; they do not equate to market resolution.
- Proprietary estimation curve only if there is a real compatible model. Allora BTC/USD does not predict a soccer game.

### 3. Risk/volatility and performance

- Allora predicted volatility, respecting unit and horizon.
- Exposure and real constraints of the paper executor as separate information.
- Helps to show why the AI operated or stayed out; do not apply a SOL/USD prediction as if it were a prediction for a specific meme coin.

### Recommended composition

An "AI in action" area, without four summary cards as main content. Compact views of the three markets with a featured chart: crypto/Allora, sports/Polymarket, and predictions/Polymarket. Smooth updates linked to new data, positive and negative variation, time/origin, and click to deepen in the Central. Do not force random movement to look active.

## FOMO

In this research, the platform considered was fomo.family, still without explicit confirmation of the address by the creator. The official help center was found and read in its Trading and Features collections. It documents fees, PnL, history, token discovery, networks, and social feed.

No official public documentation of a data/execution API was located. The visual interface and help articles do not constitute an API contract. Do not use an independent scraping/social service as if it were an official connector. For meme coin candles, confirm the provider and market source before connecting.

## Sources

- https://docs.allora.network/get-started/quickstart-consume
- https://docs.allora.network/consume/api
- https://docs.allora.network/consume/sdk-ts
- https://docs.allora.network/consume/sdk-overview
- https://docs.allora.network/build/forge/topics
- https://docs.allora.network/reference/networks
- https://docs.allora.network/api/networks.json
- https://docs.allora.network/learn/confidence-intervals
- https://docs.polymarket.com/market-data/prices-order-books
- https://help.fomo.family/en/collections/19292780-trading
- https://help.fomo.family/en/collections/19294006-features
