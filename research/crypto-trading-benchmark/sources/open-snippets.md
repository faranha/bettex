# Open frameworks research snippets
Research date: 2026-10-14

## Sources (snippet-only; complete snippets as returned by webSearch)

### open-S01 — Freqtrade backtesting
- URL: https://docs.freqtrade.io/en/2026.3/backtesting
- Title: Backtesting - Freqtrade
- Publication date: não informada
- Snippet: freqtrade backtesting --strategy AwesomeStrategy --timeframe 1m
Providing a custom starting balance of 1000 (in stake currency)
freqtrade backtesting --strategy AwesomeStrategy --dry-run-wallet 1000
Using a different on-disk historical candle (OHLCV) data source
Trading limits in backtesting ¶
- Tier: 3 (project documentation)

### open-S02 — Freqtrade backtest current release output/fees
- URL: https://docs.freqtrade.io/en/2026.3/backtesting
- Title: Backtesting - Freqtrade
- Publication date: não informada
- Snippet: All profit calculations include fees, and freqtrade will use the exchange's default fees for the calculation.
Using dynamic pairlists for backtesting
The exported trades can be used for further analysis or can be used by the plotting sub-command (freqtrade plot-dataframe) in the scripts directory.
- Tier: 3 (project documentation)

### open-S03 — Freqtrade supported markets
- URL: https://docs.freqtrade.io/en/latest
- Title: Freqtrade
- Publication date: não informada
- Snippet: Supported exchange marketplaces ¶
Please read the exchange specific notes to learn about eventual, special configurations needed for each exchange.
Supported Spot Exchanges ¶
- Tier: 3 (project documentation)

### open-S04 — Freqtrade spot/futures scope
- URL: https://docs.freqtrade.io/en/2026.3/faq
- Title: Freqtrade FAQ ¶
- Publication date: não informada
- Snippet: Freqtrade supports spot trading, as well as futures trading for some selected exchanges. Please refer to the documentation start page for an up-to-date list of supported exchanges.
Can my bot open short positions? ¶
- Tier: 3 (project documentation)

### open-S05 — Freqtrade lookahead analysis
- URL: https://www.freqtrade.io/en/stable/lookahead-analysis/
- Title: Lookahead analysis - Freqtrade
- Publication date: não informada
- Snippet: lookahead-analysis also supports freqai strategies.
This command internally chains backtests and pokes at the strategy to provoke it to show lookahead bias. This is done by not looking at the strategy code itself, but at changed indicator values and moved entries/exits compared to the full backtest.
- Tier: 3 (project documentation)

### open-S06 — Hummingbot V2 controllers
- URL: https://hummingbot.org/strategies/v2-strategies/controllers
- Title: Controllers - Hummingbot
- Publication date: não informada
- Snippet: A controller interfaces with the MarketDataProvider (OrderBook, Trades, Candles) and emits ExecutorActions that instruct the parent script to create or stop executors. Controllers are not started directly — they are loaded by the special v2_with_controllers.py script, which
- Tier: 3 (project documentation)

### open-S07 — Hummingbot V2 executors
- URL: https://hummingbot.org/strategies/v2-strategies/executors
- Title: Executors - Hummingbot
- Publication date: não informada
- Snippet: Executors in Hummingbot are self-managing components that handle the execution of orders according to predefined conditions set by Controllers, which, in turn, utilize data from the MarketDataProvider (Candles, Orderbook, Trades).
- Tier: 3 (project documentation)

### open-S08 — Hummingbot Gateway
- URL: https://hummingbot.org/gateway
- Title: Gateway DEX Middleware - Hummingbot
- Publication date: não informada
- Snippet: What is Gateway? ¶
Hummingbot Gateway is a Typescript-based API server that standardizes interactions with blockchain networks and decentralized exchanges (DEXs). It acts as a middleware layer, providing a unified interface for
- Tier: 3 (project documentation)

### open-S09 — Hummingbot recent security change
- URL: https://hummingbot.org/release-notes/2.15.1/
- Title: 2.15.1 - Hummingbot
- Publication date: 2026-06-17 (release; snippet states Gateway update June 22, 2026)
- Snippet: Note
Gateway was updated to v2.15.1 on June 22, 2026 to remove insecure wallet endpoints. Pull the latest Hummingbot API main branch to get the matching API changes.
Released on June 17, 2026
- Tier: 3 (project release notes)

### open-S10 — Jesse backtest
- URL: https://docs.jesse.trade/docs/backtest
- Title: Backtest | Jesse - docs.jesse.trade
- Publication date: não informada
- Snippet: Backtesting is the process of simulating your trading strategy against historical data to evaluate its performance before risking real money. Jesse's backtest engine is the most accurate available, simulating market conditions as faithfully as possible including
- Tier: 3 (project documentation; accuracy is vendor claim)

### open-S11 — Jesse documented venues
- URL: https://docs.jesse.trade/docs/supported-exchanges/
- Title: Supported Exchanges | Jesse
- Publication date: não informada
- Snippet: * Binance Spot
* Binance US Spot
* Binance Perpetual Futures
* Bitfinex Spot
* Coinbase Spot (Coinbase Advanced)
* Bybit USDT Perpetual
* Bybit USDC Perpetual
* Bybit Spot
* Gate.io Perpetual Futures
* KuCoin USDT Perpetual
* KuCoin Spot
* Kraken Pro Futures
TIP
* Alpaca (coming soon)
- Tier: 3 (project documentation)

### open-S12 — Jesse spot constraints
- URL: https://docs.jesse.trade/docs/strategies/futures-vs-spot
- Title: Jesse
- Publication date: não informada
- Snippet: * Short selling is not supported in spot trading so strategies should either avoid should_short() or make sure it returns False .
* In futures mode, you can set self.take_profit and self.stop_loss in the go_long() . This means before opening a position you can set your exit targets.
- Tier: 3 (project documentation)

### open-S13 — Jesse current framework changelog
- URL: https://docs.jesse.trade/docs/changelog
- Title: Jesse Changelog | Jesse
- Publication date: 2026-09-27 (listed release entry)
- Snippet: Here you can see the changes made with each release of the main framework and the live trading plugin:
3.2.3 (27 September 2026) ​
* [IMPROVEMENT] The official Docker image ( salehmir/jesse ) is now multi-architecture, with a native linux/arm64 build published alongside linux/amd64 .
- Tier: 3 (project changelog)

### open-S14 — LEAN local backtest
- URL: https://www.quantconnect.com/docs/v2/lean-cli/api-reference/lean-backtest
- Title: lean backtest - QuantConnect.com
- Publication date: não informada
- Snippet: Runs a local backtest in a Docker container using the quantconnect/leanDocker image. The logs of the backtest are shown in real-time and the full results are stored in the <project> / backtest / <timestamp>directory.
- Tier: 3 (project documentation)

### open-S15 — LEAN recent documentation changelog
- URL: https://www.quantconnect.com/docs/v2/meta/change-log
- Title: Change Log - QuantConnect.com
- Publication date: 2026-09-09 (latest date shown in returned snippet)
- Snippet: Cloud Platform ### AI Assistance ### Writing Algorithms ### Research Environment ### Local Platform ### LEAN CLI ### LEAN Engine
2026-09-09
Cloud Platform ### AI Assistance ### Writing Algorithms ### Research Environment ### Local Platform ### LEAN CLI ### LEAN Engine
2026-09-08
- Tier: 3 (project documentation changelog)

### open-S16 — OctoBot exchange coverage (venue list only)
- URL: https://www.octobot.cloud/en/guides/exchanges
- Title: Exchanges in OctoBot - OctoBot
- Publication date: não informada
- Snippet: description: Discover the many exchanges supported by OctoBot. Trade on Binance, OKX, Kucoin, Bybit, Crypto.com, HTX, Coinbase, Bitget, HollaEx, BingX, MEXC and many more. title: Exchanges in OctoBot - OctoBot image: https://www.octobot.cloud/opengraph-image.png
- Tier: 3 (project documentation)

### open-S17 — OctoBot backtest data
- URL: https://www.octobot.cloud/en/guides/octobot-usage/backtesting
- Title: Backtesting - OctoBot Cloud
- Publication date: não informada
- Snippet: Using the data collector, available from the backtesting tab, you can download historical data from most crypto exchanges.
<octobot backtesting data collector>
You can download data from multiple trading pairs and timeframes at the same time.
Full History exchanges Permalink for this section
- Tier: 3 (project documentation)

### open-S18 — OctoBot official strategy tooling, recent dated doc
- URL: https://www.octobot.cloud/en/guides/octobot-script-docs/strategies
- Title: OctoBot script strategies
- Publication date: 2026-07-30
- Snippet: Jul 30, 2026 — Learn how to create, run and backtest your automated trading strategies using a simple TradingView Pine Script like language with OctoBot
- Tier: 3 (project documentation)

## Explicit search / evidence limitations
- Search results establish declared capabilities, not independent correctness, safety, availability, or performance.
- No source in these snippets confirms BTC, ETH, and SOL spot pair availability simultaneously on any particular connected venue, geography, account, or date.
- No first-party dated OctoBot release/changelog result was obtained; a freshness or shutdown conclusion is not supported.
- Search yielded no source for Condor; it is excluded.
- Research date is 2026-10-14; publication date remains “não informada” wherever not stated above.

### open-S19 — Freqtrade dry-run semantics
- URL: https://github.com/freqtrade/freqtrade/blob/develop/docs/strategy-101.md
- Title: freqtrade/docs/strategy-101.md at develop · freqtrade/freqtrade · GitHub
- Publication date: não informada
- Snippet: * dry run: often referred to as forward testing, dry runs use real time data from the exchange. However, any signals that would result in trades are tracked as normal by Freqtrade, but do not have any trades opened on the exchange itself.
Assessing backtesting and dry run results
- Tier: 3 (official project repository documentation)

### open-S20 — Freqtrade trade history/reports
- URL: https://www.freqtrade.io/en/stable
- Title: Freqtrade
- Publication date: não informada
- Snippet: Control/Monitor: Use Telegram or a WebUI (start/stop the bot, show profit/loss, daily summary, current open trades results, etc.). Analyze: Further analysis can be performed on either Backtesting data or Freqtrade trading history (SQL database), including automated standard plots, and
- Tier: 3 (project documentation)

### open-S21 — Freqtrade protections (official repository current branch, undated)
- URL: https://raw.githubusercontent.com/freqtrade/freqtrade/stable/docs/includes/protections.md
- Title: Freqtrade protections documentation (stable branch)
- Publication date: não informada
- Snippet: Stoploss Guard
Cooldown Period
* Locks all pairs for 2 candles that had a profit of below 0.01 (<1%) within the last 24h (24 * 1h candles), a minimum of 4 trades.
from freqtrade.strategy import IStrategy
- Tier: 3 (official project documentation)

### open-S22 — LEAN risk-to-execution separation
- URL: https://www.quantconnect.com/docs/v2/writing-algorithms/algorithm-framework/risk-management/key-concepts
- Title: Key Concepts - QuantConnect.com
- Publication date: não informada
- Snippet: The Risk Management model seeks to manage risk on the PortfolioTarget collection it receives from the Portfolio Construction model before the targets reach the Execution model. There are many creative ways to manage risk. Some examples of risk management include the
- Tier: 3 (project documentation)

### open-S23 — LEAN open source engine and multi-asset architecture
- URL: https://cdn.quantconnect.com/docs/i/Quantconnect-Lean-Engine-CSharp.pdf
- Title: QUANTCONNECT DOCUMENTATION
- Publication date: não informada
- Snippet: Learn to use QuantConnect and Explore Features
LEAN ENGINE
Radically open-source algorithmic trading engine
Multi-asset with full portfolio modeling, LEAN is data agnostic, empowering you to explore faster than ever before.
- Tier: 3 (project documentation; vendor claim)

### open-S24 — Jesse backtest results and evaluation caution
- URL: https://docs.jesse.trade/docs/backtest/results
- Title: Results | Jesse
- Publication date: não informada
- Snippet: * Largest Winning Trade | 1620.29
* Largest Losing Trade | -986.93
* Total Winning Trades | 46
* Total Losing Trades | 32
Total Net Profit ​
Do not evaluate a strategy on net profit alone — always read it alongside drawdown, win-rate, and risk-adjusted ratios.
Annual Return ​
Avg Win | Avg Loss ​
- Tier: 3 (project documentation)

### open-S25 — OctoBot architecture
- URL: https://www.octobot.cloud/en/guides/octobot-developers-environment/architecture
- Title: OctoBot architecture
- Publication date: não informada
- Snippet: OctoBot architecture
OctoBot architecture Philosophy The goal behind OctoBot is to have a very fast and scalable trading robot. To achieve this, OctoBot is entirely built around the asyncio producer-consumer async_channel framework which allows to very quickly and efficiently transmit data to
- Tier: 3 (project documentation; speed/scalability is project claim)

### open-S26 — OctoBot backtest data/modes
- URL: https://www.octobot.cloud/en/guides/octobot-usage/backtesting
- Title: Backtesting - OctoBot
- Publication date: não informada
- Snippet: In backtesting, OctoBot uses the most recent version of your selected trading mode, strategies and evaluators as well as their latest configuration. This means that you can select different trading modes & evaluators and restart backtestings without having to restart OctoBot:
- Tier: 3 (project documentation)

### open-S27 — OctoBot simulated portfolio context
- URL: https://dev.octobot.cloud/en/guides/octobot-usage/simulator
- Title: Simulator - OctoBot
- Publication date: não informada
- Snippet: * Clicking Reset history on your portfolio view
* Changing the value of your current profile Starting portfolio
  The starting portfolio is also used for backtesting.
Mode, Reference-market and Risk
- Tier: 3 (project documentation)

## Additional interpretation notes
- Documentation and release notes are vendor-authored: useful for declared design/features, not for independent validation.
- Freqtrade protection examples include old dated versions in search, so no numerical protection configuration is treated as a current default here.
- LEAN risk model and Jesse results report demonstrate software concepts only, not equivalent BETTEX proposal approval or independent Treasury/Risk authority.

### open-S28 — Freqtrade dated release and exchange change
- URL: https://github.com/freqtrade/freqtrade/releases/tag/2026.8
- Title: Release 2026.8 · freqtrade/freqtrade · GitHub
- Publication date: 2026-08-31
- Snippet: Release: 2026.8
* Page: GitHub release
* URL: https://github.com/freqtrade/freqtrade/releases/tag/2026.8
* Repository: freqtrade/freqtrade
* Tag: 2026.8
* Published: 2026-08-31T04:34:31Z
Highlighted changes
* Remove Bitmart support and references (it ceased operations end of July).
- Tier: 3 (official project release)
