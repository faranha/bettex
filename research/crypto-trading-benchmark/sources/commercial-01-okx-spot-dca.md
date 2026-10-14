Source: https://www.okx.com/en-us/help/whats-the-spot-dca-bot-and-how-to-use-it
Title: What's the Spot DCA bot and how do I use it? | OKX United States
Fetched: 2026-10-14T01:05:38.979Z

Not all products mentioned are available in all jurisdictions.

[Support center](https://www.okx.com/en-us/help)

[FAQ](https://www.okx.com/en-us/help/category/faq)

[Trading](https://www.okx.com/en-us/help/section/faq-trading)

Article

# What's the Spot DCA bot and how do I use it?

Published on Oct 3, 2025Updated on Aug 27, 202617 min read16

This information may not apply to all customers

Log in to check if the products, features, rules, and terms in this article apply to you.

A **Spot DCA Bot** buys an asset at your chosen starting price, then automatically places extra buy orders (“safety orders”) if the price falls. It aims to sell it for a profit if your target is reached. This bot aims to help you achieve a better average buying price by automatically placing additional buy orders if the price falls. When the price later hits your profit target, the bot sells everything, closes the cycle, and can start again. As with all bots, there's no guarantee that this aim will be achieved. The bot will only operate according to the parameters you set.

## How does the Spot DCA bot work and how do I set it up?

The bot begins by placing a buy order at a specific price. If the price falls, based on your settings, the bot executes another buy order, and this cycle continues until you hit your maximum number of orders, take profit level, or stop loss level.

**Cycles:** if the price reaches your take profit level, the bot sells your crypto holdings and then starts another cycle starting from the first buy order. However, if the price hits your stop loss level, the bot halts all activity and won't start a new cycle.Please note that DCA bots don't guarantee profits and may result in losses, especially in declining markets where the stop loss level could trigger. Additionally, the incremental buying approach may limit gains in rising markets.

## What are the Spot DCA trading parameters?

Each Spot DCA bot contains initial order and safety orders:

- **Initial Order**: The strategy will start with an initial order that is programmed to execute a certain number of times. If the asset price drops by a designated percentage, the bot will start executing safety orders.

- **Safety Order**: These are user-defined , strategic buy orders that execute if the asset's price drops after the bot's initial purchase. The primary purpose of these orders is to execute the core DCA principle: buying more of an asset at a lower price to reduce your overall average entry price.

- **Cycle:** A complete cycle includes the initial order to buy, optional filling of one or many safety orders and the final execution of take profit order.

- You can create a DCA bot by setting the following key parameters:

- **Price steps**: defines the percentage difference at which safety orders will be executed. The percentage is always based on the initial order price. For example, if set to 1%, the bot will place safety orders at 1% price drops.

- **Take profit (TP) target per cycle**: specify the percentage profit the bot should aim for in each cycle. When the bot achieves this target price, it ends the current cycle, completes the order, and starts a new cycle as specified.

- **Initial order amount**: the starting investment amount for each cycle, placed by the bot to initiate the DCA strategy.

- **Safety order amount**: the amount used for each safety order within a cycle. These incremental orders are placed at your configured price steps to lower the average entry price.

- **Maximum safety orders**: determine the maximum number of safety orders the bot can place per cycle. The actual number depends on available funds.


Other optional parameters:

- **Stop loss (SL)**: another optional setting to limit losses. If the price drops to this level, the bot will stop trading and sell all base assets at the market price.

- **Amount multiplier**: set a multiplier to increase the size of each subsequent safety order as the price moves against the initial order. For example, a multiplier of 1.5 will make each safety order 50% larger than the previous one.



Below is how the value multiplier shapes safety order size in a Spot DCA Bot.



In a Spot DCA bot, the **safety order amount** decides how much capital is allocated to each additional buy when the price falls. The **value multiplier** lets you scale those amounts as the market moves, helping you decide how aggressively (or conservatively) to average down.

Let’s assume:

  - Base **safety order amount** = **100 USDT**

  - Up to **five safety orders** allowed

Here’s how the bot distributes funds for different multipliers:

|     |     |     |     |
| --- | --- | --- | --- |
| Safety Order | Multiplier = 1 (Flat) | Multiplier = 2 (Doubling) | Multiplier = 0.5 (Halving) |
| 1 | 100 | 100 | 100 |
| 2 | 100 | 200 | 50 |
| 3 | 100 | 400 | 25 |
| 4 | 100 | 800 | 12.5 |
| 5 | 100 | 1,600 | 6.25 |

**Here’s what these profiles mean:**

- **Multiplier = 1 (Flat Allocation):** each safety order uses the same amount — 100 USDT. This is simple and predictable, keeping your exposure steady as the market dips.

- **Multiplier = 2 (Aggressive Scaling):** each new order doubles in size, quickly increasing your position. This approach lowers your average entry price fast and maximises profit potential if the asset rebounds — but it also ties up capital rapidly and exposes you to larger losses if the price keeps dropping.

- **Multiplier = 0.5 (Conservative Scaling):** each order halves in size. You spend less as the price falls, preserving funds for deeper drops. The downside is that your average entry price won’t drop as quickly, so profits on recovery will be smaller.

- **Price steps multiplier**: adjusts the price gap between each safety order. Used to multiply the price steps of the last safety order to calculate the deviation percentage of the new safety order. A higher value may lower capital utilization, but may cover a larger price movement. This setting incrementally increases or decreases the gap between safety orders as the price changes. For example, with a 1% initial price step and a multiplier of 2, the safety orders will be placed at 1%, 3%, 7%, and so on (doubling the gap after each order).



Below is how the price-step multipliers shape safety order placement in a Spot DCA Bot.



Let’s look at how a Spot DCA bot distributes **safety orders** when you use different **price-step multipliers**. Suppose your **initial order price** is **$110,609.90**, the **price step** is set at **1%**, and you allow up to **five safety orders**. The bot will calculate where to place those orders depending on the multiplier you choose:



Here’s how the cumulative percentage gap from the entry price evolves under different multipliers:


|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| Safety Order | Multiplier = 1.0 | Multiplier = 1.1 | Multiplier = 0.9 | Multiplier = 1.5 |
| 1 | 1.00% | 1.00% | 1.00% | 1.00% |
| 2 | 2.00% | 2.10% | 1.90% | 2.50% |
| 3 | 3.00% | 3.31% | 2.71% | 4.75% |
| 4 | 4.00% | 4.64% | 3.44% | 8.13% |
| 5 | 5.00% | 6.11% | 4.10% | 13.19% |

The bot will calculate where to place those orders depending on the multiplier you choose:

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| Safety Order | Multiplier = 1.0 | Multiplier = 1.1 | Multiplier = 0.9 | Multiplier = 1.5 |
| 1 | 109,503.80 | 109,503.80 | 109,503.80 | 109,503.80 |
| 2 | 108,397.70 | 108,287.09 | 108,508.31 | 107,844.65 |
| 3 | 107,291.60 | 106,948.71 | 107,612.37 | 105,355.93 |
| 4 | 106,185.50 | 105,476.49 | 106,806.03 | 101,622.85 |
| 5 | 105,079.41 | 103,857.05 | 106,080.31 | 96,023.22 |

Here’s what’s happening:

- **Multiplier = 1.0 (Standard):** Every safety order is placed at a uniform 1% below the previous price. This creates evenly spaced buy levels, ideal for stable markets where you expect steady dips and rebounds.

- **Multiplier = 1.1 (Widening):** Each step increases by 10% compared to the last one. Orders get progressively further apart, leaving more room for deeper pullbacks before the bot commits more funds. This helps preserve capital in volatile or trending markets but means fewer buys in shallow corrections.

- **Multiplier = 0.9 (Tightening):** The gap between orders shrinks by 10% each time. Safety orders cluster closer to the entry price, allowing you to average down aggressively in minor dips — but at the cost of using up funds faster.

- **Multiplier = 1.5 (Aggressive Widening):** Steps expand quickly, with buy levels set much lower than the standard 1%. This is a capital-efficient approach for catching sharp drops, but it might leave wide gaps where no orders are placed if the market only falls moderately.


## How does each parameter affect the bot’s performance?

Each parameter shapes how the bot trades and how profitable or risky it can be.

- **Price steps:** determine the distance between buy orders.

  - Smaller steps trigger more often, averaging your entry price faster but consuming funds quickly and incurring more fees,

  - Larger steps require less capital and reduce churn but may miss shallow rebounds.
- **Take-profit target** defines how much gain you want per cycle:

  - **Lower TP** means quick, smaller wins and more frequent trades (ideal in sideways markets),

  - **Higher TP** aims for larger profits but may take longer to hit and carries greater risk if prices reverse.
- **Initial order amount:** sets your starting exposure. A larger size increases potential profit if the price rebounds quickly, but it also amplifies unrealised losses if the price keeps dropping.

- **Safety order amount:** controls how aggressively you average down—higher amounts lower your average entry price faster and boost profits on recovery, but they also demand more capital and heighten drawdown risk.

- **Maximum safety orders:** limits how far the bot will average into dips; more orders improve recovery chances during deep pullbacks but lock up more funds, while fewer orders reduce capital usage but might leave you stuck if the price falls beyond your last buy.

- **Amount multiplier:** increases the size of each new safety order, speeding up recovery after drops but quickly consuming balance if the market keeps falling.

- **Price-step multiplier:** widens or narrows the gap between safety orders dynamically, giving more flexibility but requiring careful management.

- **Stop-loss:** protects your capital in extreme downtrends by closing positions at a preset loss level, though it also means locking in that loss if triggered.


## How do I manage my Spot DCA bots?

From the trading bot dashboard, you can monitor and manage your Spot DCA bots:

1. **Stop your bot**: when you stop the bot, all pending orders are cancelled. You can choose to either sell any available crypto at the market price or keep it. In both cases, funds or crypto are transferred to your trading account.

2. **View details**: check the bot details page to monitor performance, including active cycles and profit/loss metrics.

3. **Replicate setup:** recreate a bot with the same parameters.


## What are the potential risks of using Spot DCA bots?

While the Spot DCA bot helps automate your trading strategy, it comes with inherent risks:

- **Declining markets:** if the market continues to fall beyond your safety orders or triggers your stop loss, the bot will stop trading, potentially locking in losses.

- **Overexposure:** increasing safety orders or using multipliers can quickly consume more funds than intended, leading to higher risk exposure.

- **Missed gains:** in a rapidly rising market, the bot may place fewer buy orders, meaning you might earn less compared to simply holding.

- **Execution risks:** factors such as slippage, network delays, or low liquidity can impact order execution and final outcomes.


## What are some examples of trading with Spot DCA bots?

### Success scenario:

Imagine you set up a DCA bot for ETH at $3,000 with 1% price steps and a take-profit target of 2%. The price falls to $2,970, triggering additional buy orders, lowering your average entry price. When ETH rebounds to $3,060, the bot sells at your profit target, netting you a gain. Over several cycles, these small, repeated profits can add up.

### Loss scenario:

Suppose you use the same setup, but ETH keeps falling sharply from $3,000 to $2,500. Even after maxing out your safety orders, the price never recovers to your take-profit target and instead triggers your stop loss at $2,600. The bot sells your holdings at a loss, preventing further downside but locking in the loss.

### Example of execution:

![spotdca-web-1](https://www.okx.com/cdn/assets/plugins/announcements/contentful/tofttmniq0qv/6Zfc6nfl7f3rkgXBt4SU6L/24610c845384888d7f0083fe693d006b/spotdca-web-1.png)

_Example of an order filled at 100,000 USDT: Buying 0.1 BTC with 10,000 USDT in the bot order book_

|     |     |
| --- | --- |
| Time | Description |
| t=0 | Trading Pair: BTC/USDT<br>Price step : 1%<br>Price step multiplier : 1.1<br>Maximum Safety Orders : 3<br>Initial Order: 10000 USDT<br>Safety Order Amount : 5000 USDT<br>Amount multiplier: 2<br>Take Profit: 5%<br>Stop loss: 3%<br>Current price: 100000 USDT |

After the initial trade is filled, the bot places safety orders and take profit order.

![spotdca-web-2](https://www.okx.com/cdn/assets/plugins/announcements/contentful/tofttmniq0qv/BKGMvt7y79qAqRNXPk8PR/0cdf49b837c3be4f5799edc83f9f6648/spotdca-web-2.png)

_Example of a bot order with safety and take profit levels: Buy at 100,000 USDT with safety orders below and a take profit at 105,000 USDT_

|     |     |
| --- | --- |
| Time | Description |
| t=1 | The bot places 3 limit buy safety orders and a take profit limit order<br>Note that the stop loss at the moment is 97000. |

Let's say the price falls to 97900 which means that 2 of the safety orders are filled. In addition, we assume that the limit order gets filled at 97900.

![spotdca-web-3](https://www.okx.com/cdn/assets/plugins/announcements/contentful/tofttmniq0qv/4kUiKQCeIzRGUMl4WGygI5/2c2606e12870a4807877b7a47199fae9/spotdca-web-3.png)

_Example of multiple buy orders filled: Initial buy at 100,000 USDT, with safety orders filled at 97,900 USDT, building a BTC position in the bot order book_

|     |     |
| --- | --- |
| Time | Description |
| t=2 | Price drops to 97900 resulting in the 2 safety orders getting filled. <br>Both take profit and stop loss are re calculated.<br>The average BTC price is now 98729 USDT. |

After a while, the market jumps to 105000. The take profit will get filled. Let's assume it gets filled at 105000. This will mark the end of the cycle. Any outstanding orders will be cancelled and the bot will get ready for the next cycle.

![spotdca-web-4](https://www.okx.com/cdn/assets/plugins/announcements/contentful/tofttmniq0qv/1ZwHMEOCcsftTikWo6LA4W/e7def0cb24a6296d798dcd1733efb1f4/spotdca-web-4.png)

_Example of DCA trading execution: Initial buy at 100,000 USDT, safety orders filled at 97,900 USDT, and final take profit sell at 105,000 USDT, resulting in a net profit of 1,588 USDT_

|     |     |
| --- | --- |
| Time | Description |
| t=3 | Market jumps to 105000. The Cycle ends.<br>Average BTC Price 98,729.33<br>Take Profit Price 105,000.00<br>BTC Position 0.2532<br>Realized Profit 1,587.84 |

We have assumed 0 trading fees in this example.

## Can I terminate the bot?

The user can terminate the Bot at any time during its execution. If you choose to terminate your bot, all your pending orders generated by the Bot will be canceled and your positions will be closed at the then current market price. Your assets will be credited automatically to your Trading account.

## Risk disclosure

Trading bots let users automatically place orders based on user-set parameters. Using a trading bot can be a useful tool for users to enhance their trading, but as with all trade, it involves risk.

**No guaranteed returns or investment advice:** the use of Trading Bots doesn't guarantee or ensure positive returns. All information and materials we provide concerning Trading Bots are for informational purposes only and do not constitute financial, trading, or investment advice. Investors should be aware that all investments are inherently risky and may result in the partial or complete loss of the principal amount invested.

Furthermore, any examples or references to the past performance of trading strategies are provided for illustrative purposes only and shouldn't be considered a reliable indicator of future results. There's no assurance or warranty, express or implied, from us that the use of Trading Bots will be profitable for any user.

**High market risk and price volatility:** the crypto market is highly volatile and subject to significant price fluctuations. Although a trading bot may include built-in mechanisms like **stop-loss** and **take-profit** for risk management, the user remains responsible for actively managing and observing its performance in line with their personal risk appetite.

**Inherent risks of trading strategies:** each specific trading strategy has its own risks. You're responsible for understanding these risks and ensuring the bot is suitable for you.

**Your sole responsibility:** you're fully responsible for how you use trading bots, including, but not limited to, the setting of all relevant parameters. The bots execute instructions based on parameters you set, and you're responsible for monitoring market conditions and complying with all applicable rules. We're not liable for any losses.

**Additional fees:** all trades executed through bots incur the same fees as trades placed manually by the user. There are no additional charges for using bots.

**Execution is not guaranteed:** it's not guaranteed that orders will be fully or partially filled, or executed at a specific time or price. During extreme market conditions, your instructions may be canceled or executed at a different price than intended. Failed execution or partial execution might expose the user to sudden and unexpected market risk.

**Market exposure:** you'll be exposed to market risk while the Bot is active and in any resulting holdings. Also, in multi leg execution, such as in Spot DCA bot, the market movement might force the execution of only one leg of the strategy. It's your responsibility to monitor this exposure and manage it based on your own risk tolerance.

**Fund availability**: the bot may reserve the use of capital in user's account as calculated based on parameters set by the user. These funds might not be available to the user for any other purpose while the bot is active. Also, certain features of the bot if enabled by the user might require additional funds in the future. If the funds aren't available or reserved, the bot might terminate.

**Bot termination**: a bot may end based on parameters set by the users, lack of funds in the user account, market condition, or specific events such as delisting or halt on trading of the traded assets. This termination might be temporary or permanent. In either case, it's the sole responsibility of the user to monitor the performance and exposure of the bot.

**Change of parameters:** user can modify the parameters of a running Bot. This can result in buying or selling of underlying assets in prevalent conditions, resulting in realized loss or profit. The multiplier for both price steps and investment amount should be carefully monitored in a volatile or strongly trending market. Please take this into consideration before modifying an active Bot.

**No trading, tax, or legal advice:** please consult your own tax, legal and other advisers if you're unsure of the risks of using Trading Bots. Your use of Trading Bots should be based on your own independent review, discretion and assessment of its suitability for you, taking into account your specific objectives, financial situation, investment experience, knowledge, and needs.

For more queries on the trading bot, feel free to head over to [Support center](https://www.okx.com/en-us/help) or reach out to our OK Assistant for further assistance.

**Disclaimer**

_Digital Assets subject to volatility and not insured. Not financial/investment advice. Not all products and services offered in all regions. Exclusions and T&Cs apply._

This content may cover products that are not available in your region. It is not (i) investment advice or recommendations; (ii) an offer or solicitation to buy, sell, or hold digital assets, or (iii) financial, accounting, legal, or tax advice. Digital asset holdings, including stablecoins and NFTs, involve high risk, can fluctuate greatly, and are not FDIC insured. You should consider whether trading or holding crypto/digital assets is suitable for you and consult your advisors for questions about your circumstances. While reasonable care has been taken in preparing informational data and graphs, no responsibility or liability is accepted for any errors or omissions.

Certain cryptocurrencies, services, and products are not available to users located in the United States and may be restricted depending on the state in which you reside. See [OKX's US Risk & Compliance Disclosures](https://app.okx.com/en-us/help/us-risk-and-compliance-disclosures) for more information. OKX INC. ("OKX US") operates under the OKX brand and is a federally registered money service business and a state licensed money transmitter (NMLS ID: 1767779). Users of OKX US are subject to the restrictions and terms contained in the [U.S. Terms of Service](https://app.okx.com/en-us/help/terms-of-service-us). Foreign entities affiliated with OKX US use the OKX brand to offer services and products to non-US users. US users are expressly prohibited from accessing any of those foreign products and services.

Expand

Was this helpful?

YesNo

![empty](https://9kqz97865scf36bhncpad6mdyq5pyxfqe6nr3beu678c04f25f72495ealp.g.aa.online-metrix.net/1fxb6--msx3LKirb?e9d2b68de497bf07=4xhYanhPnf-mIS6Quh7HZjHrkQ1qP8595521ZvQI6nL8ChMSp1Sqkf2F6xgkTNS0Umeg2TxkvKh-b-MsYzjXfQceMUyAFmYXzadeT6k0yYxQ7Bziq3GGTmd0MWEXU1Bxs9IYMlf4qortamrFgxwzzA)![empty](https://contentmx.okcoin.com/Gb4g7OvEUdK1gpBW?3ae0e80198ce50a1=OqFQAe5oIrAGjnFS3cFTGsEPIV_S7lxRzfBYMU8oLO7Z3bBVUtABI4DqKC7q4E6Yy8lv0-v8wQExoTnqT4uDjm6CDGK-YhGMUpYV7_2GGe2l_yt_pGa641pWEa1wtoL2pzjHc_ecPkbDg7_hBJQn2Xp3-SdeNpW9H_j_bPKiimpBTt65sOI_1Lx4vpISCk6kfsA2&jf=3c313826796b6457706e6c3774667a5f495865633b37317063314369766453302e71696c5564637c6535333f31333b3339393b37267363665f7c7b706d3777676a3a6d616c7b6324736964576b65793731303d3b33383b33323e303f30693034363863653b6430323a33303e32383a6b38343c386b673b6c32313031303f3033343832303836373c6b656039633b673d3c60666566366e6334616930646b63653f3b34313c353e326d3866336537323a3462643f37316966646a33656369613c3b3d3a3136633561693761636936316d33653d6c333a30373e63393e3a30386566693230383a34363c6463383831333d643c613c3066363862366b3862613c6737393462386e267161645771616f3f31303436383232313a32613a3b316a6835333f636a35386c633b3866316b3434376c32353b32613c3e613a3a353064313936663231316a3865363e35616e33643039313a6c656b313f3c3230323130386434363e37343b6162393c313a3b3469356c6d6060393364393736323367313f31326b3c61613d303a6731383a673664636e3530323d66623e31623f3f363038267b6b6e7a3f32)

![empty](https://contentmx.okcoin.com/XsntKiezR6IBewAQ?7dfe58f7b29fc6c2=7yUXgsOQzUC9-67fDmLd05Dv9ozdLeIQ_kbxn_d4csk2Z-H2cWT0VkG949dCqpfmGwkSwSBSb2MyhG2t8AFamt8uuoED16YW6Tv_peYFnPxagFDPhtu6jYk4S6rGh-kpEm1IhNGZwrRX2EztaRB62U-E)

empty

h.online-metrix.net

# h.online-metrix.net is blocked

This page has been blocked by an extension

- Try disabling your extensions.

ERR\_BLOCKED\_BY\_CLIENT

Reload


This page has been blocked by an extension

![](<Base64-Image-Removed>)![](<Base64-Image-Removed>)

empty

empty

Chat with us