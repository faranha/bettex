Source: https://arxiv.org/html/2309.13648v2
Title: Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol
Fetched: 2026-10-14T01:05:26.267Z

Title:

Content selection saved. Describe the issue below:

Description:

![](https://arxiv.org/static/base/1.0.1/images/icons/smileybones-small.svg)arXiv is now an independent nonprofit! [Learn more](https://info.arxiv.org/about) ×

[License: CC BY 4.0](https://info.arxiv.org/help/license/index.html#licenses-available)

arXiv:2309.13648v2 \[cs.CR\] 17 Apr 2024

# Don’t Let MEV Slip:   The Costs of Swapping on the Uniswap ProtocolThanks: This work was made possible by mempool data made available to the authors by Blocknative ( [https://www.blocknative.com](https://www.blocknative.com/ "")) and BloXroute ( [https://bloxroute.com](https://bloxroute.com/ "")). We are tremendously grateful for their generosity.

Austin Adams
Affiliation: Uniswap Labs
Email: [austin@uniswap.org](mailto:)Benjamin Y Chan
††thanks: Work done while a Research Fellow at Uniswap Labs.Affiliation: Cornell University
Email: [byc@cs.cornell.edu](mailto:)Sarit Markovich
Affiliation: Northwestern University
Email: [s-markovich@kellogg.northwestern.edu](mailto:)Xin Wan
Affiliation: Uniswap Labs
Email: [xin@uniswap.org](mailto:)

###### Abstract

We present the first in-depth empirical characterization of the costs of trading on a decentralized exchange (DEX). Using quoted prices from the Uniswap Labs interface for two pools — USDC-ETH (5bps) and PEPE-ETH (30bps) — we evaluate the efficiency of trading on DEXs. Our main tool is slippage — the difference between the realized execution price of a trade, and its quoted price — which we breakdown into its benign and adversarial components. We also present
an alternative way to quantify and identify slippage due to adversarial reordering of transactions, which we call _reordering slippage_, that does not require quoted prices or mempool data to calculate. We find that the composition of transaction costs varies tremendously with the trade’s characteristics. Specifically, while for small swaps, gas costs dominate costs, for large swaps price-impact and slippage account for the majority of it. Moreover, when trading PEPE, a popular ‘memecoin’, the probability of adversarial slippage is about 80% higher than when trading a mature asset like USDC.

Overall, our results provide preliminary evidence that DEXs offer a compelling trust-less alternative to centralized exchanges for trading digital assets.

## 1 Introduction

Since its inception in 2018, the
Uniswap Protocol \[ [4](https://arxiv.org/html/2309.13648v2#bib.bib4 ""), [3](https://arxiv.org/html/2309.13648v2#bib.bib3 "")\]—the largest _decentralized exchange_ by volume today—has handled nearly $1.65 trillion (USD) in total notional transaction volume, or $1.3 billion per day in 2023 alone. While decentralized exchanges (hereafter, DEXs) still see significantly less volume than traditional exchanges such as the NYSE and the CME, in part because trading is limited to assets that live on a blockchain, they point to a larger promise. It is a compelling promise: by using cryptography (such as digital signatures \[ [20](https://arxiv.org/html/2309.13648v2#bib.bib20 "")\] or collision-resistant hash functions \[ [46](https://arxiv.org/html/2309.13648v2#bib.bib46 ""), [19](https://arxiv.org/html/2309.13648v2#bib.bib19 "")\], which power blockchains \[ [42](https://arxiv.org/html/2309.13648v2#bib.bib42 ""), [14](https://arxiv.org/html/2309.13648v2#bib.bib14 "")\]), we may design exchange protocols that allow us to transact without the need to trust a third party to offer a ‘fair’ price or to settle trades. Moreover, they are ‘permissionless’, allowing anyone to participate. In this way, decentralized exchanges promise to lower barriers to participation, boosting liquidity, whilst making trading fairer, auditable, and more efficient.

Whereas traditional exchanges typically route orders to a centralized matching engine—the opaqueness of which enables fraud \[ [38](https://arxiv.org/html/2309.13648v2#bib.bib38 ""), [25](https://arxiv.org/html/2309.13648v2#bib.bib25 ""), [52](https://arxiv.org/html/2309.13648v2#bib.bib52 "")\]—DEXs take orders from a public mempool
of pending transactions, before filling them on a blockchain using either a liquidity-pool/AMM \[ [11](https://arxiv.org/html/2309.13648v2#bib.bib11 ""), [35](https://arxiv.org/html/2309.13648v2#bib.bib35 "")\] or a decentralized order book (e.g., EtherDelta). Still, as \[ [18](https://arxiv.org/html/2309.13648v2#bib.bib18 "")\] first explored, moving things onchain does not necessarily guarantee fair and efficient trading. For example, block proposers have a monopoly on transaction ordering, due to requirements of an underlying consensus mechanism such as that of Ethereum \[ [13](https://arxiv.org/html/2309.13648v2#bib.bib13 "")\].
This combined with the transparent nature of orders allows adversaries to carry out _frontrunning_ attacks, where they reorder transactions and insert their own orders (with the help of block proposers) to extract one form of ‘miner extractable value’ (MEV) \[ [18](https://arxiv.org/html/2309.13648v2#bib.bib18 "")\] from other users. Moreover, gas costs on Ethereum remain high, around approximately ∼$5\\sim\\$5 to $25\\$25 per trade on the Uniswap v3 in 2023. A user of a DEX will have to pay these costs (in addition to LP fees and price impact costs) on top of the market price whenever they transact. Quantifying these costs is important for evaluating existing exchanges and for designing new protocols.

To the best of our knowledge, few works (if any) have studied the overall transaction costs experienced by users of DEXs.
The community has taken some initial steps \[ [2](https://arxiv.org/html/2309.13648v2#bib.bib2 ""), [37](https://arxiv.org/html/2309.13648v2#bib.bib37 "")\] towards evaluating overall costs, but there remains a need for an in-depth analysis. \[ [9](https://arxiv.org/html/2309.13648v2#bib.bib9 "")\] estimate transaction costs of fixed-size trades over time by simulating a pool using on-chain liquidity and gas price data, but do not look at real trades or account for MEV or slippage.
Some past work quantified the magnitude of sandwich attacks, arbitrages, and liquidations on DEXs such as Uniswap v2 and v3 \[ [55](https://arxiv.org/html/2309.13648v2#bib.bib55 ""), [44](https://arxiv.org/html/2309.13648v2#bib.bib44 ""), [47](https://arxiv.org/html/2309.13648v2#bib.bib47 "")\]. However, they rely on heuristics to identify attacks, or on assumptions about the structure of MEV extraction \[ [29](https://arxiv.org/html/2309.13648v2#bib.bib29 ""), [1](https://arxiv.org/html/2309.13648v2#bib.bib1 "")\], and may not capture other hidden sources of transaction costs. It is also essential to understand how the cost of MEV compares with other transaction costs, such as gas costs, LP fees, and price impact.

#### Summary of our contributions.

In this paper, we study the overall efficiency of transacting on Uniswap v3, on Ethereum mainnet:

- •


_Framework._ We present a framework for evaluating the efficiency of DEXs. Our main tool is slippage — the difference between the realized execution price of a trade, and its quoted price — which provides a direct measure of the additional cost users pay on top of the quoted price.
We also present an alternative way to quantify and identify slippage due to adversarial re-ordering of transactions, which we call _reordering slippage_, that requires only on-chain data to compute and does not depend on heuristics. (While in this work, we have the luxury of access to mempool data and quoted prices, such data is usually proprietary and difficult to obtain.)

- •


_Breakdown of transaction costs._ We analyze a dataset of 534,198 trades made through the Uniswap Labs interface for two pools that we believe are representative of trading on the Uniswap v3 — the USDC-ETH (5bps) and PEPE-ETH (30bps) pools — between January and mid-August, 2023. We present a detailed breakdown of transactions costs, the first such baseline that we know of.
We find that while for small trades, gas fees dominate the transaction cost, for large trades, on average, slippage is by far the dominant cost. The average transaction cost per dollar transacted on USDC-ETH (PEPE-ETH) is about 22 bps (140 bps).
Transaction costs vary widely depending on the pool and on the size of the trade.





We show that, controlling for a variety of market variables, the effect of order size on slippage is significant, and that most of the effect of order size is driven by adversarial behavior. In addition, higher gas prices and market momentum worsen slippage, potentially due to collisions (i.e., if many users are simultaneously trading in the same direction).

- •


_Other effects._ Slippage also strongly depends on the characteristics of the pool the user is trading against. We find that when trading PEPE, a popular ‘memecoin’, the probability of adversarial slippage is historically about 80% larger than when trading USDC, a mature asset. Finally, as an initial foray into evaluating the integrity of mev-boost participants, we find that private RPC services effectively eliminate adversarial slippage in our dataset (albeit this may change in the future).


Our work establishes the first baseline for DEX efficiency.
Moreover, our techniques may provide a way to audit trusted entities (such as builders, relays, and RPC providers) in the mev-boost ecosystem to ensure that they are behaving honestly, a task previously thought to be difficult due to the opaque and centralized nature of block building.

Looking forward, our results show early evidence that DEXs provide a sound trading experience, and offer a compelling trust-less alternative to centralized exchanges for trading digital assets. (The slippage we see is arguably _lower_ than what one would expect.)
Unsurprisingly, our work also shows that there remains ample room for improvements, and for applying new techniques in cryptography and game theory to realize the vision of decentralized finance.

## 2 Background

### 2.1 Decentralized Exchanges

The primary exchange that we analyze, Uniswap v3 \[ [4](https://arxiv.org/html/2309.13648v2#bib.bib4 ""), [3](https://arxiv.org/html/2309.13648v2#bib.bib3 "")\], is an example of an Automated Market Maker (AMM) \[ [11](https://arxiv.org/html/2309.13648v2#bib.bib11 "")\], where liquidity providers amass liquidity reserves (x,y)∈ℝ+×ℝ+(x,y)\\in\\mathbb{R}^{+}\\times\\mathbb{R}^{+} into a pool, where xx denotes the amount of the first asset and yy the amount of the second asset, and traders trade against the pool. In Uniswap v2, the pool reserves are constrained by the function

|     |     |     |
| --- | --- | --- |
|  | x​y=kxy=k |  |

for some constant kk. Thus, a trader who wishes to purchase y′y^{\\prime} units of the second asset, must deposit x′x^{\\prime} units of the first asset s.t.

|     |     |     |
| --- | --- | --- |
|  | (x+x′)⋅(y−y′)=k(x+x^{\\prime})\\cdot(y-y^{\\prime})=k |  |

in addition to paying settlement fees and additional fees set by the pool (which is 30 bps in Uniswap v2 or between 5 bps and 100 bps in Uniswap v3, which is then distributed pro-rata to liquidity providers, also known as the ‘LP fee’). Uniswap v3 additionally allows liquidity providers to specify a price range in which to deposit liquidity. For this paper, it suffices to note that the liquidity available to trade depends on the price; holding the available liquidity fixed, the protocol behaves like Uniswap v2. Automated market makers are typically implemented using a blockchain (in our case Ethereum), which manage the execution of the pool and keeps track of its state in a decentralized way. To trade with the pool, or deposit/withdraw liquidity, users send transactions to the underlying blockchain; their actions are realized only when the corresponding transaction is finalized on the blockchain.

### 2.2 Anatomy of a Swap

A trade is a tuple comprising the _input token_, or the ERC20 token that a user wishes to sell to the pool; the _output token_, or the ERC20 token that the user wishes to receive in exchange from the pool; the _fee tier_, identifying which pool to swap with; and one of either the _input amount_ or the _output amount_, specifying the amount of the input token/output token that the user wishes to exchange (the amount of the other asset is then determined by the pool).

A transaction for trading with a Uniswap pool is called a ‘swap’, and comprises a trade with two additional fields specified: one of
the _minimum amount out_ or the _maximum amount in_, which is the worst case amount of the output/input asset that the user is willing to receive/spend; and a _deadline_, specifying a deadline by which the swap must be completed, after which the swap is invalid. Even if a transaction is finalized on the blockchain, the underlying swap may fail due to a violation of the minimum amount out (resp. maximum amount in). For any given block BB in a blockchain, the trades contained in BB are defined to be the trades specified by the swaps in BB that succeed.

When transacting on the Uniswap Labs interface, users are shown a quoted output amount (resp. input amount) for the input amount (resp. output amount) that they entered into the interface, in the form of a quoted average execution price. After seeing the quoted price, users can then decide whether to sign and broadcast the swap transaction.
The _slippage tolerance_ of a swap is defined as the ratio of the quoted amount out over the minimum amount out (resp. the quoted amount in over the maximum amount in), minus 1, expressed in basis points (bps). The _price impact_ of a swap is defined as the ratio of the quoted price over the market mid price minus 1, expressed in bps.

### 2.3 The MEV Ecosystem

In order to make MEV extraction more transparent, Flashbots introduced the mev-boost library \[ [24](https://arxiv.org/html/2309.13648v2#bib.bib24 "")\], which is open source software that block proposers can run to connect them to a market of ‘block builders’. Block builders (which may eventually become enshrined in Ethereum through enshrined ‘proposer-builder separation’ \[ [12](https://arxiv.org/html/2309.13648v2#bib.bib12 "")\]) find the most profitable ways to sequence blocks of transactions, and bid for proposers to propose their blocks. The market is run by trusted relays, who send the block headers of the best bids to the block proposer; the proposer then replies with a signature of the winning block header, after which the relay sends the proposer the block (with the payment contained within). If the proposer later proposes a different block header than the one it signed initially, then it must have signed two different block headers and will be slashed. Additionally, block builders accept _bundles_ of transactions from ‘searchers’ (users who want to avoid using the public mempool), and promise not to frontrun or unpack the transactions within bundles. Bundled transactions are also referred to as _private_ transactions.

Over 80% of Ethereum validators today run a version of mev-boost\[ [1](https://arxiv.org/html/2309.13648v2#bib.bib1 "")\]. Note that mev-boost today requires many trust assumptions: proposers must trust relays to send them winning blocks, builders must trust relays to propagate their blocks/bids without publishing or frontrunning them, and searchers must trust builders not to publish or frontrun their private transactions.

## 3 Our Framework

We present a framework for evaluating the execution quality and efficiency of DEXs. In particular, any such framework should generalize even as markets evolve (as is bound to happen, evidenced by the dominance of mev-boost since its introduction by Flashbots in 2020). Combined with the empirical results in Section [4](https://arxiv.org/html/2309.13648v2#S4 "4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol"), this gives a baseline for evaluating DEXs as they become more sophisticated.

In this paper, we focus on the following costs of trading — slippage, settlement costs, exchange fees, liquidity costs — and the latency of trades:

- •


_Slippage._ 111



In the literature, slippage is sometimes referred to as implementation shortfall \[ [43](https://arxiv.org/html/2309.13648v2#bib.bib43 "")\].

Whereas many works have looked at dollar value lost specifically to sandwich attacks, backruns, etc. \[ [55](https://arxiv.org/html/2309.13648v2#bib.bib55 ""), [47](https://arxiv.org/html/2309.13648v2#bib.bib47 ""), [44](https://arxiv.org/html/2309.13648v2#bib.bib44 ""), [50](https://arxiv.org/html/2309.13648v2#bib.bib50 "")\], or dollar value earned by validators \[ [29](https://arxiv.org/html/2309.13648v2#bib.bib29 ""), [1](https://arxiv.org/html/2309.13648v2#bib.bib1 "")\], to the best of our knowledge, we are the first to characterize the efficiency of a DEX by quantifying the overall slippage experienced by trades.
Following convention, we take positive slippage to denote a price improvement for the swapper:





###### Definition 3.1(Slippage).





The slippage of swap ii (in bps) is



|     |     |     |
| --- | --- | --- |
|  | 𝗌𝗅𝗂𝗉𝗉𝖺𝗀𝖾i:=(𝗋𝖾𝖺𝗅𝗂𝗓𝖾𝖽𝖯𝗋𝗂𝖼𝖾i𝗊𝗎𝗈𝗍𝖾𝖽𝖯𝗋𝗂𝖼𝖾i−1)⋅−10000\\mathsf{slippage}\_{i}:=\\left(\\frac{\\mathsf{realizedPrice}\_{i}}{\\mathsf{quotedPrice}\_{i}}-1\\right)\\cdot-10000 |  |



where 𝗋𝖾𝖺𝗅𝗂𝗓𝖾𝖽𝖯𝗋𝗂𝖼𝖾i\\mathsf{realizedPrice}\_{i} is the average realized execution price of the swap (the amount of the input asset spent, over the amount of the output asset received), and 𝗊𝗎𝗈𝗍𝖾𝖽𝖯𝗋𝗂𝖼𝖾i\\mathsf{quotedPrice}\_{i} is the decision price shown to the user.222Here, slippage is the difference between the realized output amount and the quoted output amount, expressed as a percentage of the realized output amount. Alternatively, we may express slippage as a percentage of the quoted output amount, with no major changes in interpretation.

- •


_Settlement costs, exchange fees._ When trading, users must pay for the operation of the exchange, as well as for settlement fees. On Ethereum, this takes the form of ‘gas’ fees. Settlement and exchange fees are generally higher when volume is high and the underlying blockchain is congested; however, in Ethereum, gas costs scale sublinearly with the order size.

- •


_Liquidity fees and price impact._ For liquidity provision to be profitable, market makers take an explicit Liquidity Provider fee (LP fee) on AMMs
or construct a bid-ask spread on order books.
The _price impact_ of a swap is defined as the ratio of the quoted price over the market mid price minus 1, expressed in bps, and directly measures market depth. We assume that the quoted price incorporates LP fees and the expected liquidity consumption of the swap, as in the case with the Uniswap Labs interface.

- •


_Latency._ The latency of a trade is the time it takes the trade to be executed plus its settlement time; and should be minimized.


We further break down slippage into its benign and adversarial components:

- •


_Adversarial slippage._ Adversarial slippage refers to slippage due to adversarial or reactive behavior. This includes frontruns, or more broadly, slippage due to MEV \[ [18](https://arxiv.org/html/2309.13648v2#bib.bib18 "")\].
Usually, adversarial slippage is negative, but it may be positive, e.g., in the case of Just-in-Time liquidity provisioning (JIT) \[ [49](https://arxiv.org/html/2309.13648v2#bib.bib49 "")\].

- •


_Collision slippage._ Collision slippage refers to slippage due to benign transactions sequenced between quote time and the final execution time. It may arise, for instance, if many traders are trying to trade the same assets at once on an exchange with non-zero latency.


To measure adversarial and collision slippage, prior works relied on heuristics for classifying sandwich attacks or arbitrages \[ [44](https://arxiv.org/html/2309.13648v2#bib.bib44 ""), [47](https://arxiv.org/html/2309.13648v2#bib.bib47 "")\]. In Section [4](https://arxiv.org/html/2309.13648v2#S4 "4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol"), we will use a different heuristic: we collect data from mev-boost to identify swaps that might be in the same MEV bundle and thus adversarial.

#### Other desiderata.

The following desiderata should be kept in mind even though they do not directly impact the profit of market participants. We will include discussion on these trade-offs when appropriate:

- •


_Security._ Decentralized exchanges inherit their security from the underlying blockchain or consensus mechanism. As \[ [18](https://arxiv.org/html/2309.13648v2#bib.bib18 "")\] first observed, DeFi protocols may even erode the security of underlying blockchains by providing new incentives to deviate from honest behavior at the consensus level \[ [26](https://arxiv.org/html/2309.13648v2#bib.bib26 "")\].

- •


_Decentralization._ Protocols such as mev-boost are centralized in that players must trust individual block builders and relays to be honest and not front-run private transactions. In the context of DeFi, decentralized solutions are preferable to centralized ones (by principle), and also promise additional accountability when compared to centralized exchanges.

- •


_Fairness._ Exchanges should prioritize being _permissionless_ and avoid censoring any single user, preventing them from transacting or exchanging assets.


### 3.1 Reordering Slippage

Although a heuristical approach for identifying adversarial slippage makes sense for our empirical study, the notions of adversarial and collision slippage remain rather informal. A heuristical approach requires us to specify the exact attacks that we hope to measure (e.g. sandwich attacks or those captured by mev-boost payments), and will not capture unknown adversarial strategies; it also requires sophisticated mempool or mev-boost data that may be difficult to obtain.

As an alternative, we present a more formal notion which we call “reordering slippage”. Reordering slippage is easy to measure without mempool data, or even quoted prices, and also sidesteps the need for heuristics.
Thus, it generalizes even as the market evolves with new adversarial strategies.
Later, in Section [4](https://arxiv.org/html/2309.13648v2#S4 "4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol"), in addition to analyzing our heuristical notion of adverse slippage, we will also empirically analyze reordering slippage, and show that it indeed captures both sandwiches and arbitrages.

#### Defining reordering slippage.

Reordering slippage compares the realized price of a swap to its hypothetical price in a world where the trades in its block are randomly ordered. Intuitively, if the realized price is far from this ‘randomly ordered’ baseline, then the adversary must have explicitly ‘reordered’ the trades in that block in order to extract value:

###### Definition 3.2(Reordering Slippage).

Fix any block BB, and denote by S:=𝗍𝖽1,…,𝗍𝖽nS:={\\sf td}\_{1},\\ldots,{\\sf td}\_{n} the sequence of trades contained within BB. For each trade 𝗍𝖽i{\\sf td}\_{i}, the reordering slippage (in bps) of its corresponding swap is defined as

|     |     |     |
| --- | --- | --- |
|  | 𝗋𝖾𝗈𝗋𝖽𝖾𝗋𝗂𝗇𝗀𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i:=(𝗋𝖾𝖺𝗅𝗂𝗓𝖾𝖽𝖯𝗋𝗂𝖼𝖾i𝔼π​\[𝗁𝗒𝗉𝗈𝗍𝗁𝖾𝗍𝗂𝖼𝖺𝗅𝖯𝗋𝗂𝖼𝖾i​(π⁡(S))\]−1)⋅−10000\\mathsf{reorderingSlippage}\_{i}:=\\left(\\frac{\\mathsf{realizedPrice}\_{i}}{\\mathbb{E}\_{\\pi}\[\\mathsf{hypotheticalPrice}\_{i}(\\pi(S))\]}-1\\right)\\cdot-10000 |  |

where the expectation is taken over sampling a uniformly random permutation π\\pi of the sequence of trades in BB. Here, 𝗋𝖾𝖺𝗅𝗂𝗓𝖾𝖽𝖯𝗋𝗂𝖼𝖾i\\mathsf{realizedPrice}\_{i} is the realized price for the iith trade, and 𝗁𝗒𝗉𝗈𝗍𝗁𝖾𝗍𝗂𝖼𝖺𝗅𝖯𝗋𝗂𝖼𝖾i​(π​(S))\\mathsf{hypotheticalPrice}\_{i}(\\pi(S)) refers to the hypothetical execution price of trade 𝗍𝖽i{\\sf td}\_{i} if the trades in block BB are ordered according to π⁡(S)\\pi(S).

Note that when computing the hypothetical price, we consider a world where the actual realized trades (e.g., ‘sell 1 ETH’) in BB are reordered, as opposed the swaps or transactions (e.g., ‘sell 1 ETH if we get at least 1800 USDC’ back).333



As an example, suppose a block contains three swaps, one of which fails due to a violation of its slippage tolerance setting, and two of which succeed. Suppose that the first successful trade 𝗍𝖽1{\\sf td}\_{1}—corresponding to some swap ss—‘buys 1 ETH’ and the second trade 𝗍𝖽2{\\sf td}\_{2} ‘buys 2 ETH’. Then the reordering slippage of ss would be its realized price, divided by the average of its realized price and the hypothetical price of 𝗍𝖽1{\\sf td}\_{1} in a world that first executes ‘buy 2 ETH’ (𝗍𝖽2{\\sf td}\_{2}) and then ‘buy 1 ETH’ (𝗍𝖽1{\\sf td}\_{1}). Note that even if ss would have failed (e.g., due to slippage tolerance) had it been ordered 22nd, we can still compute a hypothetical price for executing 𝗍𝖽1{\\sf td}\_{1} after 𝗍𝖽2{\\sf td}\_{2}. Recall from Section [2](https://arxiv.org/html/2309.13648v2#S2 "2 Background ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol") that a trade is the realized interaction between a transaction and a pool. That is, only actual exchanges of assets factor into the calculation of reordering slippage, and, when reordered, they ‘‘execute’’ regardless of slippage tolerance settings or constraints set by a smart contract.444



While the ‘hypothetical’ world may not be realizable in practice, this definition allows us to quantify the effects of a broader set of adversarial strategies. In particular, those whose execution is conditional on the current state of the blockchain. To capture liquidity slippage, SS should include liquidity events in addition to trades.

#### Backruns and arbitrages.

Note that reordering slippage also captures backruns and arbitrages in the same block as the swap in question. While not directly adversarial, it seems reasonable to classify arbitrages as adversarial because arbitrages are costs born by liquidity providers \[ [41](https://arxiv.org/html/2309.13648v2#bib.bib41 ""), [40](https://arxiv.org/html/2309.13648v2#bib.bib40 "")\], which are then passed on to users in the form of a larger LP fee.

#### Achieving zero reordering slippage.

Consensus-level order fairness \[ [31](https://arxiv.org/html/2309.13648v2#bib.bib31 ""), [28](https://arxiv.org/html/2309.13648v2#bib.bib28 "")\] does not immediately guarantee zero reordering slippage. If transactions are ordered by observation time, backruns are possible and result in non-zero reordering slippage, pointing to market inefficiencies and LVR \[ [41](https://arxiv.org/html/2309.13648v2#bib.bib41 "")\].

A strawman approach to reduce reordering slippage is to randomize the order of transactions (or swaps) within each block (e.g., using an unpredictable randomness beacon). However, this also fails to achieve zero reordering slippage. The problem is that the execution of a transaction can depend on the current state of the blockchain. Thus, even if the order of transactions within a block is randomized and unpredictable, an adversarial transaction may simply refuse to carry through with a trade if executed in unfavorable conditions (via a smart contract, or simply by setting a tight slippage tolerance).555



Indeed, this exact issue caused backrunning bots to spam the Ethereum network in the past \[ [34](https://arxiv.org/html/2309.13648v2#bib.bib34 "")\]. As such, achieving zero reordering slippage remains an open question.

#### Concurrent work.

In concurrent work, \[ [6](https://arxiv.org/html/2309.13648v2#bib.bib6 "")\] present a notion that they call ‘Cost of MEV’ which is very similar to our notion of reordering slippage (Definition [3.2](https://arxiv.org/html/2309.13648v2#S3.Thmdefinition2 "Definition 3.2 (Reordering Slippage). ‣ Defining reordering slippage. ‣ 3.1 Reordering Slippage ‣ 3 Our Framework ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol")).
Their work is theoretical and
shows loose bounds on how their worst-case notion scales with the total volume of trades, when instantiated with basic models for frontrunning and sandwiching.
To use their notion still requires instantiating the metric with an appropriate model.
In contrast, we use reordering slippage to directly characterize the cost of trading on DEXs. Our choice of definition highlights the fact that even randomized transaction ordering does not eliminate adversarial slippage, since transactions can execute _adaptively_ based on their location in the block \[ [34](https://arxiv.org/html/2309.13648v2#bib.bib34 "")\]. Thus, the definition of reordering slippage seems well-equipped to capture MEV.
Moreover, we provide an empirical characterization of reordering slippage on Uniswap v3 in Section [4](https://arxiv.org/html/2309.13648v2#S4 "4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol"), quantifying realized execution costs (as opposed to the theoretical worst-case).

## 4 Empirical Findings

### 4.1 Data

We obtain transaction hashes logged from the Uniswap Labs interface666 [https://app.uniswap.org](https://app.uniswap.org/ ""), covering all swaps made through the interface (mobile and web) that were published onchain, during the period of January 21, 2023 to August 14, 2023, and for two specific target pools on Ethereum: WETH-USDC 5bps pool (284,031 swaps) and WETH-PEPE 30bps pool (230,236 swaps).
For each swap, the dataset includes a ‘log index’ which together uniquely identify the swap in question, the quoted price, and a timestamp for when the swap was relayed by the user. The quoted price is computed using onchain pool data at the time of the quote, and represents the expected execution price had the swap been executed at that time. In other words, the quoted price incorporates the estimated price impact of the swap and the LP fee. Due to caching, the quote may be one or two blocks stale.
Notably, our quoted prices comprise the actual prices shown to the user when they made the decision to swap on the interface.

We augment this dataset with additional onchain data to obtain the final average execution price, slippage tolerance setting, location in the blockchain, failure status, gas expenditure, and order size for each swap. We obtain onchain data for every swap in the target pools between January 21, 2023 to August 14, 2023, including but not limited to the interface swaps.777



The data for every onchain swap will later be used to simulate Uniswap v3 pools to compute a slippage breakdown. Onchain data is also used to compute the liquidity distribution of each target pool at the beginning of each block. We use the publicly available mevboost.pics dataset \[ [48](https://arxiv.org/html/2309.13648v2#bib.bib48 "")\] to obtain for each swap the builder that built the corresponding block.

We further augment our dataset with mempool data for every (onchain) swap, including the time that each swap was seen in the mempool, and whether a swap was seen for the first time in the public mempool, or if it was first seen as part of a finalized block onchain. The latter indicates that the swap was likely sent as part of a private mev-boost bundle of transactions. The mempool data comes from two different datasets: one assembled by bloXroute, comprising mempool data from June 22, 2023 to August 14, 2023, and one by Blocknative, comprising mempool data from January 21, 2023 to August 8, 2023. When mempool data overlaps, we take the earliest mempool observation time, and consider a swap public iff it was seen by both bloXroute and Blocknative in the public mempool. Most of the initial work was done using the bloXroute dataset, and subsequently extended to incorporate new data from Blocknative for the longer timeframe when it became available.

#### Pool choice.

We focus on two pools that we believe are representative of trading on DEXs on Ethereum mainnet --- the Uniswap v3 WETH-USDC888



WETH is an ERC20 wrapped version of ETH backed 1-1. It is used in place of ETH due to most of DeFi requiring a token be an ERC20. 5bps999



pool address: 0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640 and the Uniswap v3 WETH-PEPE 30 bps101010



pool address: 0x11950d141ecb863f01007add7d1a342041227b58 pools.
The WETH-USDC 5 bps pool is generally the largest pool by volume and liquidity in DeFi, trading mature assets that have a large market cap and good price discovery on centralized exchanges. PEPE is an archetypical high-volatility ‘memecoin’ and representative of a less mature asset being traded on Uniswap v3; notably, the 30 bps pool has enough volume for a meaningful analysis. An exploration of a wider selection of pools is well-motivated and left to future work.

### 4.2 Summary Statistics

We study transaction costs from various angles: dollar amounts, fraction of trade sizes, as well as the breakdown into cost items laid out in Section [3](https://arxiv.org/html/2309.13648v2#S3 "3 Our Framework ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol").

Our full sample includes 534,198 transactions, roughly $6B dollar of volume. Combined, the sample accounts for approximately 20% of all swaps done through the Uniswap Labs interface during the sample period, and roughly 12-15% of the USD volume. The average WETH-USDC (WETH-PEPE) transaction size is $18301.7 ($2680.6), and the average total transaction cost (relative to a gas-free swap executed at the pool price at the end of the quote block) is $40.7 ($41.4), which is 22 bps (140 bps) of the mean order size. Note that this latter number represents the average transaction cost _per dollar_ transacted in each respective pool.
Swap sizes in our sample skew to the right, and the median swap size is only $1,650 ($407). For the median swap, gas cost is about $7.3 ($14.9), which is 44 bps (366 bps) of its order size.

### 4.3 Cost Composition: High Level Patterns

We compare the magnitude of the different transaction cost components: gas costs, slippage, LP fees, and the price impact of swaps.

Total CostGas CostSlippageLP FeePrice ImpactToken PairSizeETH<⁣><>USDCAll$40.7 (22bps)$10.1 (5bps)$12.3 (7bps)$9.3 (5bps)$9.0 (5bps)Large$698.2 (24bps)$16.9 (0.6bps)$308.4 (11bps)$145.4 (5bps)$227.5 (8bps)Medium$18.9 (14bps)$10.6 (8bps)$1.0 (0.7bps)$6.7 (5bps)$0.6 (0.4bps)Small$8.7 (250bps)$8.5 (245bps)$0.0 (0bps)$0.2 (5bps)$0.0 (0bps)ETH<⁣><>PEPEAll$41.4 (140bps)$19.5 (66bps)$3.0 (10bps)$8.9 (30bps)$10.1 (34bps)Large$2847.9 (212bps)$52.7 (4bps)$190.8 (14bps)$403.5 (30bps)$2200.9 (164bps)Medium$67.9 (98bps)$22.6 (33bps)$8.3 (12bps)$20.7 (30bps)$16.3 (24bps)Small$19.2 (526bps)$17.4 (478bps)$0.5 (14bps)$1.1 (30bps)$0.2 (6bps)

Table 1: Mean Transaction Cost Composition by Pair & Size;
Each dollar item is computed by total item cost divided by number of swaps in that bucket;
each bps item is computed by total item cost divided by the total dollar volume for swaps in that bucket. Large Size group includes swaps larger than $100,000; Medium Size group includes swaps between $1,000 and $100,000; Small Size Group includes swaps less than $1,000.

Summing over all swaps, each of the four cost items accounts for between 20-35% of the total transaction cost, with no item dominating costs, as shown in Figure [1(a)](https://arxiv.org/html/2309.13648v2#A2.F1.sf1 "In Figure 1 ‣ Appendix B Additional Charts ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol").
Yet, this breakdown varies with order size and across the different assets. Specifically, for the median sized transaction, gas cost completely dominates other cost, accounting for more than 90% of total cost. Excluding gas costs, which are specific to the underlying blockchain, the overall cost of transacting in a decentralized market is on average 23bps (compared to 36bps including gas costs). Below we detail how the composition of total costs varies significantly with the size of the swap, across different assets, and over time:

#### Order Size.

Transaction costs vary significantly with the size of the swap: the larger the swap, the lower the gas cost as a percentage of the swap size. In our WETH-USDC pool sample, gas cost is relatively tightly distributed around a median of $7.3, with 75th and 25th percentile of $5.0 and $11.0, and a low correlation with swap size at ∼\\sim0.21. As a result, for small swaps with size below $1000, over 98% of total transaction cost is paid as gas cost; in contrast, for large swaps with size above $100,000, gas cost accounts for 2.4% of total transaction cost. That is, as swap size increases, other cost items start to dominate. In particular, for swaps larger than $100,000, price-impact and slippage together account for ∼\\sim77% of overall transaction cost on a per dollar basis. This makes sense because price impact and slippage usually increase faster than swap size. Specifically, since marginal price impact is inversely related to liquidity depth, and Uniswap v3 pools tend to have thinner liquidity farther away from current pool price, then larger swaps should see increasing price-impact as a fraction of total order size. LP fees scale linearly with swap size, so their fraction of swap size remains fixed.

#### USDC vs PEPE.

In our sample, the mean transaction cost for WETH-PEPE is about 140 bps, which is six times larger than the mean transaction cost for WETH-USDC swaps, at 22 bps. Several factors contribute to this large difference. PEPE is a relatively recent launched token, which means it has shallower liquidity, higher volatility, and smaller trade sizes. Specifically, the average and median transaction sizes for WETH-USDC pair is $18,302 and $1,650, respectively, while those of WETH-PEPE are only $2,681 and $407. Larger swap sizes mean that the relatively fixed gas cost will have a larger volume base to be amortized over, but at the same time adversaries like sandwich attackers could also have a strong motivation to attack. This is consistent with what we see in the data: for WETH-USDC swaps, summed slippage costs account for 30.1% of total transaction cost111111



This is mainly driven by a few large swaps and is not a realistic average cost per swap., yet accounts for only 8.1% for WETH-PEPE swaps. In contrast, gas costs account for 24.5% of WETH-USDC cost, but 47.1% of WETH-PEPE cost. Shallower liquidity also translates into higher price-impact and higher slippage. In our sample, the amount of liquidity within a 5% price range (𝗅𝗂𝗊𝗎𝗂𝖽𝗂𝗍𝗒i\\mathsf{liquidity}\_{i}) is on average 70-80 times deeper for the WETH-USDC pool. Finally, WETH-PEPE has higher price volatility, on average 10x times higher than WETH-USDC. As we will demonstrate below in our regression analysis, higher volatility, in general, leads to higher slippage cost.

#### Time effects.

Transaction costs vary significantly based on the time period. We observe a significant reduction in total transaction cost as a fraction of trade size in the initial months of trading for WETH-PEPE. MEV related costs such as slippage and price-impact also spike during highly volatile periods. For the month of March, during the Silicon Valley Bank incident, the mean slippage and price-impact total 22.5 bps for the WETH-USDC pair and over 71% of total transaction cost, more than five times the lowest point in the month of April, which saw a mean of 3.8 bps, accounting for only 25% of total transaction cost.

#### Latency and fill rate.

We also present baseline data for latency and fill-rate of transactions. Latency and fill-rate measure how quickly and reliably can traders get into their desired positions. Our dataset indicates that roughly 90% of transactions wait less than 12 seconds before their signed transactions are confirmed in a block. As we move out farther in the distribution, waiting time gets much longer—the 99.5th percentile waiting time is more than 20 blocks. Of the USDC-WETH swaps in our dataset, fewer than 0.5% fail onchain. In PEPE-WETH, interface swaps saw an onchain fail rate of nearly 10% at launch in mid-April, dropping to 5% by the end of April, and approximately 3% in August.

#### Comparison with Traditional Markets.

Many works have assessed transaction costs (slippage, commission, broker fees, bid ask spreads, price impact) on traditional markets.
Depending on the region and asset class, transaction costs can vary widely \[ [5](https://arxiv.org/html/2309.13648v2#bib.bib5 ""), [17](https://arxiv.org/html/2309.13648v2#bib.bib17 ""), [22](https://arxiv.org/html/2309.13648v2#bib.bib22 "")\].
For example, \[ [5](https://arxiv.org/html/2309.13648v2#bib.bib5 "")\] finds that transaction costs for equities range from 100 bps for emerging markets to 40 bps for US large cap companies. \[ [17](https://arxiv.org/html/2309.13648v2#bib.bib17 "")\] finds that institutional investors pay in the range of 40-70 bps in total transaction costs. The average transaction costs that we observe in the PEPE-WETH and USDC-WETH pools are remarkably competitive in comparison.

### 4.4 Factors Affecting Slippage

We now shift our focus to understanding slippage on Uniswap v3, for two main reasons. First, of the four cost items above, gas used by a swap and LP fees are relatively static and do not change much with the swap’s characteristics.
In contrast, price-impact and slippage directly affect execution price on a per-trade basis. While the factors required to minimize price-impact are well understood, this is not the case for slippage. Second, slippage attracts the most adversarial attention. Thus, for any given swap, slippage arguably matters the most to execution quality.

We start by analyzing how different transaction and market factors affect slippage. To this end, we run a set of linear regressions on a broad set of market variables, for various measures of slippage, described by the equation

|     |     |     |     |
| --- | --- | --- | --- |
|  | yi=β0+β1⋅𝗈𝗋𝖽𝖾𝗋𝖲𝗂𝗓𝖾i+β2⋅𝗀𝖺𝗌𝖯𝗋𝗂𝖼𝖾i+β3⋅𝗅𝗈𝗀𝖫𝖺𝗍𝖾𝗇𝖼𝗒i+β4⋅𝗌𝗅𝗂𝗉𝗉𝖺𝗀𝖾𝖳𝗈𝗅𝖾𝗋𝖺𝗇𝖼𝖾i+β5⋅𝗅𝖺𝗌𝗍𝖧𝗈𝗎𝗋𝖱𝖾𝗍𝗎𝗋𝗇i+β6⋅𝗅𝗂𝗊𝗎𝗂𝖽𝗂𝗍𝗒i+β7⋅𝗏𝗈𝗅𝖺𝗍𝗂𝗅𝗂𝗍𝗒i+𝗐𝖾𝖾𝗄𝖥𝖤+ei,\\displaystyle\\begin{split}y\_{i}=\\beta\_{0}&+\\beta\_{1}\\cdot\\mathsf{orderSize}\_{i}+\\beta\_{2}\\cdot\\mathsf{gasPrice}\_{i}+\\beta\_{3}\\cdot\\mathsf{logLatency}\_{i}\\\<br>&+\\beta\_{4}\\cdot\\mathsf{slippageTolerance}\_{i}+\\beta\_{5}\\cdot\\mathsf{lastHourReturn}\_{i}+\\beta\_{6}\\cdot\\mathsf{liquidity}\_{i}\\\<br>&+\\beta\_{7}\\cdot\\mathsf{volatility}\_{i}+\\mathsf{weekFE}+e\_{i},\\end{split} |  | (1) |

where for each swap ii, yiy\_{i} corresponds to one of the measures of slippage described above. In order to further control for market conditions, we control for weekly fixed effects. The results for the WETH-USDC 5 bps pool is presented in Table [2](https://arxiv.org/html/2309.13648v2#S4.T2 "Table 2 ‣ 4.4 Factors Affecting Slippage ‣ 4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol"), along with definitions for the above variables.

Table 2: Factors Affecting Slippage (USDC-WETH 5 bps)Slippage(1)AdversarialSlippage(2)CollisionSlippage(3)ReorderingSlippage(4)TopOfBlockSlippage(5)LiquiditySlippage(6)orderSize-14.0176∗∗∗-12.3729∗∗∗-2.2378∗∗∗-18.0085∗∗∗-0.5170∗∗∗0.6208∗∗∗(0.1670)(0.0793)(0.1511)(0.0940)(0.1306)(0.0169)gasPrice-0.0043∗∗∗-0.0004∗-0.0038∗∗∗-0.0011∗∗∗-0.0028∗∗∗-0.0001∗∗∗(0.0004)(0.0002)(0.0003)(0.0002)(0.0003)(0.0000)logLatency-0.0251+0.0042-0.0251∗0.0091-0.0399∗∗∗-0.0038∗∗(0.0141)(0.0067)(0.0128)(0.0079)(0.0110)(0.0014)slippageTolerance0.0000+-0.0001∗∗∗0.0001∗∗∗-0.0001∗∗∗0.0001∗∗∗0.0000(0.0000)(0.0000)(0.0000)(0.0000)(0.0000)(0.0000)lastHourReturn-0.0115∗∗∗0.0008∗∗∗-0.0123∗∗∗-0.0004∗∗∗-0.0087∗∗∗0.0000∗(0.0002)(0.0001)(0.0002)(0.0001)(0.0002)(0.0000)liquidity0.0244∗∗∗0.0110∗∗∗0.0144∗∗∗0.0102∗∗∗0.0179∗∗∗-0.0009∗∗(0.0034)(0.0016)(0.0030)(0.0019)(0.0026)(0.0003)volatility-0.0051∗∗∗-0.0004-0.0046∗∗∗-0.0022∗∗∗-0.0022∗∗∗-0.0001(0.0007)(0.0003)(0.0007)(0.0004)(0.0006)(0.0001)Intercept-0.2951-0.0639-0.30570.0412-0.3399∗0.0726∗∗∗(0.2164)(0.1027)(0.1958)(0.1217)(0.1692)(0.0217)Obs258925258906258906258925258925255392Adj. R20.04710.08980.02350.13060.01520.0057F-stat356.5146710.5045174.44381081.6725112.116141.6709Every regression includes weekly fixed effects. \*\*\*, \*\*, \*, and + denote statistical significance at the 0.1%, 1%, 5%, and 10% levels.
The number of observations is less than reported in our summary statistics, due to some rows with missing latency or slippage tolerance information. All slippage notions are in units of bps.

#### Variables Definition.

The 𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i\\mathsf{Slippage}\_{i} of swap ii is computed according to Definition [1](https://arxiv.org/html/2309.13648v2#footnote1 "footnote 1 ‣ 1st item ‣ 3 Our Framework ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol"). Note that slippage for failed transactions (i.e. due to a violation of their slippage tolerance setting) is not well defined. Dropping these swaps from the analysis would bias the overall slippage. Instead, we simulate the execution price for each failed swap, and compute its hypothetical slippage in a world where the trade was executed.
𝖠𝖽𝗏𝖾𝗋𝗌𝖺𝗋𝗂𝖺𝗅𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i\\mathsf{AdversarialSlippage}\_{i} and 𝖢𝗈𝗅𝗅𝗂𝗌𝗂𝗈𝗇𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i\\mathsf{CollisionSlippage}\_{i} are calculated using a heuristic (see below). 𝖱𝖾𝗈𝗋𝖽𝖾𝗋𝗂𝗇𝗀𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i\\mathsf{ReorderingSlippage}\_{i} is computed according to Definition [3.2](https://arxiv.org/html/2309.13648v2#S3.Thmdefinition2 "Definition 3.2 (Reordering Slippage). ‣ Defining reordering slippage. ‣ 3.1 Reordering Slippage ‣ 3 Our Framework ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol"). We calculate two additional slippage measures: 𝖳𝗈𝗉𝖮𝖿𝖡𝗅𝗈𝖼𝗄𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i\\mathsf{TopOfBlockSlippage}\_{i} is the slippage calculated were the trade executed at the top of the block, comparing the top of block execution price to the quoted price, and 𝖫𝗂𝗊𝗎𝗂𝖽𝗂𝗍𝗒𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i\\mathsf{LiquiditySlippage}\_{i} is the slippage attributable to transactions that deposit or withdraw liquidity in the same block as swap ii. 𝗈𝗋𝖽𝖾𝗋𝖲𝗂𝗓𝖾i\\mathsf{orderSize}\_{i} is the size of the swap, in units of millions of USDC. 𝗀𝖺𝗌𝖯𝗋𝗂𝖼𝖾i\\mathsf{gasPrice}\_{i} is expressed in units of 1e-6 USDC, using the ETH price at the time of quote. 𝗌𝗅𝗂𝗉𝗉𝖺𝗀𝖾𝖳𝗈𝗅𝖾𝗋𝖺𝗇𝖼𝖾i\\mathsf{slippageTolerance}\_{i} is the slippage tolerance setting of the swap, in non-negative basis points. The Uniswap Labs interface adds the slippage tolerance on top of the quoted price-impact of the swap to compute a minimum output (or input) amount. 𝗅𝗂𝗊𝗎𝗂𝖽𝗂𝗍𝗒i\\mathsf{liquidity}\_{i} denotes the dollar value of the liquidity that would need to be consumed to increase the current price of the pool by 500 bps in the same direction as swap ii.
𝗅𝖺𝗌𝗍𝖧𝗈𝗎𝗋𝗅𝗒𝖱𝖾𝗍𝗎𝗋𝗇i\\mathsf{lastHourlyReturn}\_{i} is the change in the pool price (in bps) in the hour prior to the corresponding swap, where a positive change corresponds to a worse price for the swapper (compared to if their trade executed an hour ago). 𝖵𝗈𝗅𝖺𝗍𝗂𝗅𝗂𝗍𝗒i\\mathsf{Volatility}\_{i} is the standard deviation of one-minute log returns over a six hour sample. Finally, 𝗅𝗈𝗀𝖫𝖺𝗍𝖾𝗇𝖼𝗒i\\mathsf{logLatency}\_{i} is the logarithm of the time the swap ’sat’ in the mempool, that is, the time between when the swap is signed/broadcast by the user, and the time swap ii is finalized onchain.

_Identifying Adversarial Slippage._ 𝖠𝖽𝗏𝖾𝗋𝗌𝖺𝗋𝗂𝖺𝗅𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i\\mathsf{AdversarialSlippage}\_{i} for swap ii is computed using the following heuristic: first, consider the two transactions directly preceding ii in the same block BB (if any). For any trade executed within those two transactions, if the parent transaction is additionally private (i.e., part of an mev-boost bundle), then that trade is labeled ‘adversarial’. A ‘collision execution price’ is then computed as the hypothetical average execution price of swap ii, when starting with the pool state at the top of block BB, then executing only the non-adversarial trades preceding swap ii in BB, and then executing ii’s trade. The 𝖠𝖽𝗏𝖾𝗋𝗌𝖺𝗋𝗂𝖺𝗅𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i\\mathsf{AdversarialSlippage}\_{i} is the realized price (removing the effects of liquidity transactions in BB) over the ‘collision execution price’ (minus 1, times −10000-10000). The 𝖢𝗈𝗅𝗅𝗂𝗌𝗂𝗈𝗇𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i\\mathsf{CollisionSlippage}\_{i} is the ‘collision execution price’ over the quoted price (minus 1, times −10000-10000). A more principled heuristic is to label swaps in the same mev-boost bundle as ii as adversarial, but requires comprehensive bundle data across all builders, which is hard to obtain. Using a limited sample of Flashbots bundle data from June to August 2023, we verified that adversarial slippage computed using our heuristic closely tracks adversarial slippage computed using bundle data, for swaps in blocks built by Flashbots during said time period.

Recall that for every notion of slippage that we consider, slippage is negative (by convention) if the realized execution price is worse than the quoted execution price, and positive if the realized price is better.

As Table [2](https://arxiv.org/html/2309.13648v2#S4.T2 "Table 2 ‣ 4.4 Factors Affecting Slippage ‣ 4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol") shows, consistent with the high-level pattern observed in Section [4.3](https://arxiv.org/html/2309.13648v2#S4.SS3 "4.3 Cost Composition: High Level Patterns ‣ 4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol"), we observe in Model (1) that larger swaps (in terms of USDC size) are associated with substantially worse slippage: for every extra 11 million dollars in additional order size, the swap costs an additional 1414 bps on top of its quoted price. That is, larger swaps pay a large penalty on top of their price-impact. While caution is needed when interpreting these numbers, this suggests that adversaries find larger swaps — controlling for market volatility — more profitable to sandwich or otherwise exploit (in the form of MEV). To test this, in models (2) & (3) we run the same regression on the adverse and benign components of slippage. We break down slippage into adversarial, collision, and liquidity components (the methodology is presented in Table [2](https://arxiv.org/html/2309.13648v2#S4.T2 "Table 2 ‣ 4.4 Factors Affecting Slippage ‣ 4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol")):

|     |     |     |
| --- | --- | --- |
|  | 𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i≈𝖠𝖽𝗏𝖾𝗋𝗌𝖺𝗋𝗂𝖺𝗅𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i+𝖢𝗈𝗅𝗅𝗂𝗌𝗂𝗈𝗇𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i+𝖫𝗂𝗊𝗎𝗂𝖽𝗂𝗍𝗒𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i\\mathsf{Slippage}\_{i}\\approx\\mathsf{AdversarialSlippage}\_{i}+\\mathsf{CollisionSlippage}\_{i}+\\mathsf{LiquiditySlippage}\_{i} |  |

As expected, most of the effect of order size on slippage is driven by adversarial slippage. Moreover, increased liquidity reduces adversarial slippage. We also evaluate reordering slippage in model (4), and find that it behaves similarly to our heuristical notion of adverse slippage.
Interestingly, the effect of order size on reordering slippage is larger than the effect in our original slippage and adversarial slippage models. This may be due to back-running transactions that are captured in reordering slippage, but not in adverse slippage. Note that when the number of swaps in the same block is high enough to make computing the reordering slippage computationally infeasible, we approximate it by sampling a constant number of permutations (e.g. 16) and taking the average.

One interesting question is whether collision slippage is due to benign swaps in the same block as the target swap, or swaps from previous blocks (in which case latency might matter more).
As shown in model (5), putting the transaction at the top of the block does not completely eliminate slippage. While the coefficient is significantly smaller than the coefficient in models (1)-(4), it might take 2-3 blocks between the quote time and the time the transaction becomes onchain, so the price at the top of the block may be different than the quoted price (either due to collision or adversarial transactions), thereby creating slippage. Still, it seems like cross-block slippage is smaller than within-block slippage.

Another important factor affecting slippage is gas price. As the results show, higher gas prices are also negatively associated with slippage. Here, however, the association is mostly driven by collision slippage (see models 2 & 3). The intuition is simple: gas price is higher when the networks is more congested and there is more activity. Since, typically, during high activity periods, users trade in the same directions, this results in higher negative slippage. This same intuition can explain the negative coefficient in models (4) & (5).

Slippage is also expected to be affected by the time transactions sit in the mempool – the longer it takes for the transaction to become onchain, the higher the expected slippage; due to higher probability of collision and higher probability of the transaction being identified as a profitable MEV opportunity. Our results show that indeed slippage increases with the time the transaction spends in the mempool. Interestingly, most of the effect comes from collision rather than adversarial slippage. This suggests that searchers respond quickly to MEV opportunities. As before, the negative effect in the case where the transaction is executed at the top of the block is due to inter-block slippage.

The hourly returns variable captures, in essence, the effect of market momentum. It is positive if the market moves in the same direction as the swap, and negative otherwise. As expected, market momentum negatively affects slippage and is mostly driven by collision. All other control variables – e.g., volatility and liquidity – are in the expected direction. Finally, note that the effect of the slippage tolerance set by the user is economically insignificant. This is driven by the fact that most users do not change the default tolerance of 50bps. Indeed, both the 25th percentile and the median slippage tolerance levels are 50bps.

### 4.5 Comparison with the WETH-PEPE pool

As mentioned above, the WETH-USDC pool is a mature and highly liquid pool. One would expect it to perform much more efficiently than younger, mostly speculative pools with high volatility. To this end, we choose the WETH-PEPE pool which is a highly active pool with 1/1001/100 the liquidity of USDC (median of 0.24​M0.24M vs 22.5​M22.5M dollars) and about 1010 times the volatility of USDC. Table [3](https://arxiv.org/html/2309.13648v2#A1.T3 "Table 3 ‣ Appendix A Tables and Regressions ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol") presents the regression results.

In general, the direction of the effects of the different factors on slippage is similar to what we see in the WETH-USDC pool, with the notable exception that the effect of gas price on adversarial slippage is positive and significant and the effect of slippage tolerance is significant and economically meaningful. The positive and significant coefficient on gas price for adversarial slippage is likely due to the fact that an increase in the cost of a transaction makes some adversarial strategies unprofitable. If, on average, the availability of profitable MEV opportunities does not change during high gas price, then we should expect to see less adversarial activity during times when gas price is high. Since, unlike the WETH-USDC pool, network congestion is likely not closely associated with profitable MEV opportunities in the PEPE pool, we see that adversarial slippage for PEPE is positively correlated with gas price. As for slippage tolerance, the 25th percentile and median slippage tolerance values for the PEPE pool are 100 and 300, respectively. This suggests that users (or the Uniswap Labs interface) are actively choosing risk tolerance levels with the expectation that slippage would be quite high, likely, due to the high price volatility.

Given the large differences in overall activity, transaction size, etc. between the two pools, the coefficients in the regressions in Table [2](https://arxiv.org/html/2309.13648v2#S4.T2 "Table 2 ‣ 4.4 Factors Affecting Slippage ‣ 4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol") and Table [3](https://arxiv.org/html/2309.13648v2#A1.T3 "Table 3 ‣ Appendix A Tables and Regressions ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol") cannot be directly compared. In order to examine whether there is more adversarial activity in the PEPE pool relative to the USDC pool, we run a logit regression on adversarial slippage. Specifically, we run the same regression as in Equation [1](https://arxiv.org/html/2309.13648v2#S4.E1 "In 4.4 Factors Affecting Slippage ‣ 4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol") where now yiy\_{i} takes on the value of 11 if swap ii experienced a negative adversarial slippage larger than $5\\$5, and 00 otherwise.121212



To avoid the case of swaps being mistakenly identified as adverse because of a small negative adversarial slippage (which may be spurious due to our heuristic), we classify transactions in the logit regression as being adversarial only if their adversarial slippage (in bps) multiplied by the order size is worse than negative $5\\$5. The results are presented in Table [4](https://arxiv.org/html/2309.13648v2#A1.T4 "Table 4 ‣ Appendix A Tables and Regressions ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol"). (Note that liquidity in range is quite correlated with week number for PEPE, and much less so for USDC).

As the table shows, the likelihood of adversarial slippage for PEPE is about 80%80\\% larger than for USDC. Furthermore, the increased likelihood is enhanced by the size of the transaction–i.e., for a certain increase in transaction size, the increase in the likelihood of adversarial slippage for PEPE is larger than the corresponding increase for USDC.

The results above suggest that slippage in mature markets that are highly active, liquid, and with low volatility is minor. More generally, the results suggests that, despite the decentralization and transparency that characterize DeFi market, mature markets behave efficiently and may be even considered to be close in their efficiency to traditional financial markets. In order to further examine the impact of the fundamental characteristics of DeFi market—decentralization and transparency—next, we break down our analysis to public and private transactions. Specifically, while decentralization is core to the functioning of the Uniswap Protocol, nowadays many transactions (including MEV transactions) are sent as private transactions. This allows us to better study the effect of transparency on market efficiency in mature markets as WETH-USDC as well as in younger markets like the WETH-PEPE pool.

## 5 The Impact of MEV Infrastructure on Slippage

We examine two important components of the MEV ecosystem: the usage of private RPCs and trust in builders’ neutrality.

### 5.1 Private RPCs

Sending a transaction to a private RPC (putting it in a mev-boost bundle) should prevent other searchers from sandwiching transactions, as the private transaction does not appear in the mempool before becoming onchain. Consequently, private transactions should have much smaller negative slippage, that is only driven by collision. Nevertheless, since these transactions typically are sent to specific RPCs, they might suffer from higher latency and consequently wider collision slippage.

Table [5](https://arxiv.org/html/2309.13648v2#A1.T5 "Table 5 ‣ Appendix A Tables and Regressions ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol") presents the results for the same regression as in Equation [1](https://arxiv.org/html/2309.13648v2#S4.E1 "In 4.4 Factors Affecting Slippage ‣ 4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol") with the addition of a dummy variable that takes on the value of 11 if transaction ii is public, and 00 otherwise. As expected, the coefficient on Public is negative and significant for both USDC and PEPE. In fact, out of the 8294 (8629) private interface swaps in USDC (PEPE), only 3 (12) have negative adverse slippage that is larger than $5. That is, private RPCs seem to completely eliminate adverse slippage. Of the 3 (12) swaps with adverse slippage worse than $5\\$5, none are obviously sandwiched when manually checked on Etherscan, and the slippage appears accidental. Furthermore, the coefficient on collision slippage is not significant, meaning that the potential increase in latency has no effect on average collision slippage. We note that while this shows evidence that private RPCS are reliable in the present day, it does not guarantee that the trust assumptions that underpin private RPCs will continue to be valid in the future.131313



We further interact 𝖯𝗎𝖻𝗅𝗂𝖼\\mathsf{Public} with our other explanatory and control variables. We find that the effect of order size on adversarial slippage is stronger for public transactions, yet gas price interacted with 𝖯𝗎𝖻𝗅𝗂𝖼\\mathsf{Public} has no significant effect. For brevity, we do not present these results here.

### 5.2 Builder Trust

When participating in the mev-boost ecosystem, searchers and users of private RPCs must trust that builders do not frontrun or ‘unpack’ the mev-boost bundles that are sent to builders. While in traditional markets, it is the regulator that audits the intermediaries, in DeFi this trust relies on incentives (or even on goodwill). It is, therefore, important to audit this trust assumption. Our reordering slippage provides a way for the public to monitor builders’ behavior, without the need to acquire private data.

As Table [6](https://arxiv.org/html/2309.13648v2#A1.T6 "Table 6 ‣ Appendix A Tables and Regressions ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol") shows, we do not find conclusive evidence that any of the top 5 builders (by private transaction count) are misbehaving, at least from a cursory examination. This may suggest that the penalties associated with breaking users’ trust are large enough to incentivize builders not to defect. Investigating the validity of trust assumptions required by the MEV ecosystem remains an important open question.

## 6 Related work

Quantifying MEV on Ethereum is an active area of research. Daian et al. \[ [10](https://arxiv.org/html/2309.13648v2#bib.bib10 ""), [18](https://arxiv.org/html/2309.13648v2#bib.bib18 "")\] introduced the notion of MEV and were the first to demonstrate its impact on decentralized markets, in turn giving rise to projects such as mev-boost\[ [24](https://arxiv.org/html/2309.13648v2#bib.bib24 "")\]. More recently, a series of works \[ [47](https://arxiv.org/html/2309.13648v2#bib.bib47 ""), [44](https://arxiv.org/html/2309.13648v2#bib.bib44 "")\] quantify frontrunning attacks and MEV extraction using historical data. \[ [50](https://arxiv.org/html/2309.13648v2#bib.bib50 "")\] further extend this to analyze the impact of Flashbots on overall MEV extraction. Many of their techniques rely on identifying specific strategies for extracting value from users, and then designing heuristics for identifying those strategies. More recently, \[ [45](https://arxiv.org/html/2309.13648v2#bib.bib45 ""), [7](https://arxiv.org/html/2309.13648v2#bib.bib7 ""), [8](https://arxiv.org/html/2309.13648v2#bib.bib8 "")\] explore more automated approaches for identifying value-extraction mechanisms.

Few works have analyzed slippage or overall transaction costs of trading on decentralized exchanges. 0x \[ [2](https://arxiv.org/html/2309.13648v2#bib.bib2 "")\] analyze the slippage of trades sent through the 0x Swap API, and show that setting an appropriate slippage tolerance is essential for bounding the cost of MEV experienced by any single swap. \[ [37](https://arxiv.org/html/2309.13648v2#bib.bib37 "")\] show that transactions sent to private RPCs may have on average higher transaction costs than public transactions. \[ [9](https://arxiv.org/html/2309.13648v2#bib.bib9 "")\] estimate the transaction costs for various fixed-size trades over time by simulating pools using onchain liquidity data, and gas price data. Their analysis does not incorporate slippage, MEV, or onchain execution prices, relying entirely on simulated execution.

A number of works measure the dynamics of liquidity provisioning on decentralized exchanges, sometimes through the lenses of transaction costs. \[ [16](https://arxiv.org/html/2309.13648v2#bib.bib16 "")\] show that lower gas fees increase liquidity repositioning and concentration, reducing price impact for small trades. They use a notion of slippage that incorporates price impact, comparing realized prices to the market mid price. \[ [27](https://arxiv.org/html/2309.13648v2#bib.bib27 "")\] show that higher LP fees may reduce price impact.
\[ [33](https://arxiv.org/html/2309.13648v2#bib.bib33 "")\] show that the cost of price impact on AMMS may be lower than on centralized exchanges for highly liquid pools.

_Transaction costs on traditional markets._ In contrast, a number of works have quantified overall trading costs on traditional markets (such as equities markets). We point to
\[ [23](https://arxiv.org/html/2309.13648v2#bib.bib23 ""), [22](https://arxiv.org/html/2309.13648v2#bib.bib22 ""), [21](https://arxiv.org/html/2309.13648v2#bib.bib21 ""), [17](https://arxiv.org/html/2309.13648v2#bib.bib17 ""), [5](https://arxiv.org/html/2309.13648v2#bib.bib5 "")\] as examples, but this list is by no means comprehensive.

_Mitigating MEV._ Much work has focused on mitigating MEV extraction through protocol design. At the consensus layer, \[ [31](https://arxiv.org/html/2309.13648v2#bib.bib31 "")\] propose an order-fair consensus algorithm, where transactions are ordered in the time they arrive in the view of validators. Order-fair consensus has seen substantial follow-up work \[ [54](https://arxiv.org/html/2309.13648v2#bib.bib54 ""), [32](https://arxiv.org/html/2309.13648v2#bib.bib32 ""), [15](https://arxiv.org/html/2309.13648v2#bib.bib15 ""), [30](https://arxiv.org/html/2309.13648v2#bib.bib30 "")\]. Time-based order-fairness may not eliminate backruns or arbitrage and may incentivize latency wars. An alternative approach, as described by \[ [36](https://arxiv.org/html/2309.13648v2#bib.bib36 "")\], is to force block proposers to ‘commit’ to an ordering of a block, before they learn the contents of the transactions. Such an approach is reminiscent of those used by MPC protocols \[ [53](https://arxiv.org/html/2309.13648v2#bib.bib53 ""), [39](https://arxiv.org/html/2309.13648v2#bib.bib39 "")\] and asynchronous byzantine agreement algorithms; the downside is that it requires more sophisticated cryptography (e.g. threshold cryptography, secret sharing) that is harder to adapt to a permissionless setting.

At the block builder level, \[ [51](https://arxiv.org/html/2309.13648v2#bib.bib51 "")\] propose a verifiable block sequencing rule that block builders can follow and that observers can audit. Such a rule may mitigate MEV whilst being accountable to the general public.

## References

- \[1\]
Flashbots transparency dashboard. [https://transparency.flashbots.net](https://transparency.flashbots.net/ "")
(2022)

- \[2\]
0x.org: Measuring the impact of hidden dex costs.
[https://0x.org/post/measuring-the-impact-of-hidden-dex-costs](https://0x.org/post/measuring-the-impact-of-hidden-dex-costs "") (2022)

- \[3\]
Adams, H., Salem, M., Zinsmeister, N., Reynolds, S., Adams, A., Pote, W., Toda,
M., Henshaw, A., Williams, E., Robinson, D.: Uniswap v4 core \[draft\].
[https://github.com/Uniswap/v4-core/blob/ffa4af8759aa416497c94c1693dc53c6e9961f89/whitepaper-v4-draft.pdf](https://github.com/Uniswap/v4-core/blob/ffa4af8759aa416497c94c1693dc53c6e9961f89/whitepaper-v4-draft.pdf "")
(2023)

- \[4\]
Adams, H., Zinsmeister, N., Salem, M., Keefer, R., Robinson, D.: Uniswap v3
core. [https://uniswap.org/whitepaper-v3.pdf](https://uniswap.org/whitepaper-v3.pdf "") (2021)

- \[5\]
Angel, J.J., Harris, L.E., Spatt, C.S.: Equity trading in the 21st century: An
update. The Quarterly Journal of Finance 5(01), 1550002 (2015)

- \[6\]
Angeris, G., Chitra, T., Diamandis, T., Kulkarni, K.: The specter (and spectra)
of miner extractable value (2023)

- \[7\]
Babel, K., Daian, P., Kelkar, M., Juels, A.: Clockwork finance: Automated
analysis of economic security in smart contracts. In: 2023 IEEE Symposium on
Security and Privacy (SP). pp. 2499–2516. IEEE (2023)

- \[8\]
Babel, K., Javaheripi, M., Ji, Y., Kelkar, M., Koushanfar, F., Juels, A.:
Lanturn: Measuring economic security of smart contracts through adaptive
learning. Cryptology ePrint Archive (2023)

- \[9\]
Barbon, A., Ranaldo, A.: On the quality of cryptocurrency markets: Centralized
versus decentralized exchanges (2023)

- \[10\]
Bentov, I., Breidenbach, L., Daian, P., Juels, A., Li, Y., Zhao, X.: The cost
of decentralization in 0x and etherdelta.
[http://hackingdistributed.com/2017/08/13/cost-of-decent/](http://hackingdistributed.com/2017/08/13/cost-of-decent/ "") (2017)

- \[11\]
Buterin, V.: Let’s run on-chain decentralized exchanges the way we run
prediction markets.
[https://www.reddit.com/r/ethereum/comments/55m04x/lets\_run\_onchain\_decentralized\_exchanges\_the\_way](https://www.reddit.com/r/ethereum/comments/55m04x/lets_run_onchain_decentralized_exchanges_the_way "")
(2016)

- \[12\]
Buterin, V.: Proposer/block builder separation-friendly fee market designs.
[https://ethresear.ch/t/proposer-block-builder-separation-friendly-fee-market-designs/9725](https://ethresear.ch/t/proposer-block-builder-separation-friendly-fee-market-designs/9725 "")
(2021)

- \[13\]
Buterin, V., Hernandez, D., Kamphefner, T., Pham, K., Qiao, Z., Ryan, D., Sin,
J., Wang, Y., Zhang, Y.X.: Combining ghost and casper. arXiv preprint
arXiv:2003.03052 (2020)

- \[14\]
Buterin, V., et al.: A next-generation smart contract and decentralized
application platform. white paper 3(37),  2–1 (2014)

- \[15\]
Cachin, C., Mićić, J., Steinhauer, N., Zanolini, L.: Quick order
fairness. In: International Conference on Financial Cryptography and Data
Security. pp. 316–333. Springer (2022)

- \[16\]
Caparros, B., Chaudhary, A., Klein, O.: Blockchain scaling and liquidity
concentration on decentralized exchanges. Available at SSRN 4475460 (2023)

- \[17\]
Chiyachantana, C.N., Jain, P.K., Jiang, C., Wood, R.A.: International evidence
on institutional trading behavior and price impact. The Journal of Finance
59(2), 869–898 (2004)

- \[18\]
Daian, P., Goldfeder, S., Kell, T., Li, Y., Zhao, X., Bentov, I., Breidenbach,
L., Juels, A.: Flash boys 2.0: Frontrunning in decentralized exchanges, miner
extractable value, and consensus instability. In: 2020 IEEE Symposium on
Security and Privacy (SP). pp. 910–927. IEEE (2020)

- \[19\]
Damgård, I.B.: Collision free hash functions and public key signature
schemes. In: Workshop on the Theory and Application of of Cryptographic
Techniques. pp. 203–216. Springer (1987)

- \[20\]
Diffie, W., Hellman, M.E.: New directions in cryptography. IEEE Transactions on
Information Theory (1976)

- \[21\]
Domowitz, I., Glen, J., Madhavan, A.: Global equity trading costs. ITG White
Paper, May 8 (2001)

- \[22\]
Domowitz, I., Glen, J., Madhavan, A.: Liquidity, volatility and equity trading
costs across countries and over time. International Finance 4(2),
221–255 (2001)

- \[23\]
Domowitz, I., Steil, B.: Automation, trading costs, and the structure of the
securities trading industry. Brookings-Wharton papers on financial services
2, 33–92 (1999)

- \[24\]
flashbots: flashbots/mev-boost: Mev-boost.
[https://github.com/flashbots/mev-boost/](https://github.com/flashbots/mev-boost/ ""), accessed in 2023.

- \[25\]
Gandal, N., Hamrick, J., Moore, T., Oberman, T.: Price manipulation in the
bitcoin ecosystem. Journal of Monetary Economics 95, 86–96 (2018)

- \[26\]
Gupta, T., Pai, M.M., Resnick, M.: The centralizing effects of private order
flow on proposer-builder separation. arXiv preprint arXiv:2305.19150 (2023)

- \[27\]
Hasbrouck, J., Rivera, T.J., Saleh, F.: The need for fees at a dex: How
increases in fees can increase dex trading volume. Available at SSRN (2022)

- \[28\]
Heimbach, L., Wattenhofer, R.: Sok: Preventing transaction reordering
manipulations in decentralized finance. arXiv preprint arXiv:2203.11520
(2022)

- \[29\]
Hu, E.: Modelling realised extractable value in proof of stake ethereum - an
update of validator return post-merge.
[https://collective.flashbots.net/t/modelling-realised-extractable-value-in-proof-of-stake-ethereum/290](https://collective.flashbots.net/t/modelling-realised-extractable-value-in-proof-of-stake-ethereum/290 "")
(2022)

- \[30\]
Kelkar, M., Deb, S., Kannan, S.: Order-fair consensus in the permissionless
setting. In: Proceedings of the 9th ACM on ASIA Public-Key Cryptography
Workshop. pp. 3–14 (2022)

- \[31\]
Kelkar, M., Zhang, F., Goldfeder, S., Juels, A.: Order-fairness for byzantine
consensus. In: Advances in Cryptology–CRYPTO 2020: 40th Annual International
Cryptology Conference, CRYPTO 2020, Santa Barbara, CA, USA, August 17–21,
2020, Proceedings, Part III 40. pp. 451–480. Springer (2020)

- \[32\]
Kursawe, K.: Wendy grows up: More order fairness. In: Financial Cryptography
and Data Security. FC 2021 International Workshops: CoDecFin, DeFi, VOTING,
and WTSC, Virtual Event, March 5, 2021, Revised Selected Papers 25. pp.
191–196. Springer (2021)

- \[33\]
Liao, G., Robinson, D.: The dominance of uniswap v3 liquidity (2022)

- \[34\]
Livnev, L.: Github issues, ethereum/go-ethereum: Random ordering of
equally-priced transactions incentivises competitive spam.
[https://github.com/ethereum/go-ethereum/issues/21350](https://github.com/ethereum/go-ethereum/issues/21350 "") (2020)

- \[35\]
Lu, A., Köppelmann, M.: Building a decentralized exchange in ethereum.
(mar. 2017).
[https://blog.gnosis.pm/building-a-decentralized-exchange-in-ethereum-eea4e7452d6e](https://blog.gnosis.pm/building-a-decentralized-exchange-in-ethereum-eea4e7452d6e "")
(2017)

- \[36\]
Malkhi, D., Szalachowski, P.: Maximal extractable value (mev) protection on a
dag. arXiv preprint arXiv:2208.00940 (2022)

- \[37\]
Marshall, B.: The false narrative of MEV protection: How private transactions
can result in a poorer settlement than sending publicly. Blocknative (2023),
[https://www.blocknative.com/blog/mev-protection-negative-settlement](https://www.blocknative.com/blog/mev-protection-negative-settlement "")
- \[38\]
McMillan, A.: The inside story of Mt. Gox, Bitcoin’s $460 million
disaster. Wired (2014),
[https://www.wired.com/2014/03/bitcoin-exchange/](https://www.wired.com/2014/03/bitcoin-exchange/ "")
- \[39\]
Micali, S., Goldreich, O., Wigderson, A.: How to play any mental game. In:
Proceedings of the Nineteenth ACM Symp. on Theory of Computing, STOC. pp.
218–229. ACM New York, NY, USA (1987)

- \[40\]
Milionis, J., Moallemi, C.C., Roughgarden, T.: Automated market making and
arbitrage profits in the presence of fees. arXiv preprint arXiv:2305.14604
(2023)

- \[41\]
Milionis, J., Moallemi, C.C., Roughgarden, T., Zhang, A.L.: Automated market
making and loss-versus-rebalancing. arXiv preprint arXiv:2208.06046 (2022)

- \[42\]
Nakamoto, S.: Bitcoin: A peer-to-peer electronic cash system. Decentralized
business review (2008)

- \[43\]
Perold, A.F.: The implementation shortfall: Paper versus reality. Journal of
Portfolio Management 14(3),  4 (1988)

- \[44\]
Qin, K., Zhou, L., Gervais, A.: Quantifying blockchain extractable value: How
dark is the forest? In: 2022 IEEE Symposium on Security and Privacy (SP). pp.
198–214. IEEE (2022)

- \[45\]
Qin, K., Zhou, L., Livshits, B., Gervais, A.: Attacking the defi ecosystem with
flash loans for fun and profit. In: International conference on financial
cryptography and data security. pp. 3–32. Springer (2021)

- \[46\]
Rabin, M.O.: Digitalized signatures and public-key functions as intractable as
factorization (1979)

- \[47\]
Torres, C.F., Camino, R., et al.: Frontrunner jones and the raiders of the dark
forest: An empirical study of frontrunning on the ethereum blockchain. In:
30th USENIX Security Symposium (USENIX Security 21). pp. 1343–1359 (2021)

- \[48\]
Wahrstätter, A., Zhou, L., Qin, K., Svetinovic, D., Gervais, A.: Time to
bribe: Measuring block construction market. arXiv preprint arXiv:2305.16468
(2023)

- \[49\]
Wan, X., Adams, A.: Just-in-time liquidity on the uniswap protocol.
[https://blog.uniswap.org/jit-liquidity](https://blog.uniswap.org/jit-liquidity "") (2022)

- \[50\]
Weintraub, B., Torres, C.F., Nita-Rotaru, C., State, R.: A flash (bot) in the
pan: measuring maximal extractable value in private pools. In: Proceedings of
the 22nd ACM Internet Measurement Conference. pp. 458–471 (2022)

- \[51\]
Xavier Ferreira, M.V., Parkes, D.C.: Credible decentralized exchange design via
verifiable sequencing rules. In: Proceedings of the 55th Annual ACM Symposium
on Theory of Computing. pp. 723–736 (2023)

- \[52\]
Yaffe-Bellany, D., Goldstein, M., Flitter, E.: Prosecutors say FTX was
engaged in a ‘massive, yearslong fraud’. The New York Times (2022),
[https://www.nytimes.com/2022/12/13/business/ftx-sam-bankman-fried-fraud-charges.html](https://www.nytimes.com/2022/12/13/business/ftx-sam-bankman-fried-fraud-charges.html "")
- \[53\]
Yao, A.C.C.: How to generate and exchange secrets. In: 27th annual symposium on
foundations of computer science (Sfcs 1986). pp. 162–167. IEEE (1986)

- \[54\]
Zhang, Y., Setty, S., Chen, Q., Zhou, L., Alvisi, L.: Byzantine ordered
consensus without byzantine oligarchy. In: 14th USENIX Symposium on Operating
Systems Design and Implementation (OSDI 20). pp. 633–649 (2020)

- \[55\]
Zhou, L., Qin, K., Torres, C.F., Le, D.V., Gervais, A.: High-frequency trading
on decentralized on-chain exchanges. In: 2021 IEEE Symposium on Security and
Privacy (SP). pp. 428–445. IEEE (2021)


## Appendix A Tables and Regressions

In this section, we present additional tables that are used in Section [4](https://arxiv.org/html/2309.13648v2#S4 "4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol").

Table 3: Factors Affecting Slippage (PEPE-WETH 30 bps)Slippage(1)AdversarialSlippage(2)CollisionSlippage(3)ReorderingSlippage(4)TopOfBlockSlippage(5)LiquiditySlippage(6)orderSize-240.5533∗∗∗-298.8950∗∗∗3.3267-407.8857∗∗∗-2.268766.8170∗∗∗(22.8863)(10.4824)(20.8326)(12.6344)(18.4876)(3.2512)gasPrice-0.0427∗∗∗0.0038∗-0.0479∗∗∗-0.0060∗∗-0.0333∗∗∗0.0014∗(0.0040)(0.0018)(0.0036)(0.0022)(0.0032)(0.0006)logLatency-0.7973∗∗∗0.0882-0.8462∗∗∗0.4903∗∗∗-1.6148∗∗∗-0.0589+(0.2324)(0.1064)(0.2116)(0.1283)(0.1877)(0.0334)slippageTolerance-0.0117∗∗∗-0.0053∗∗∗-0.0067∗∗∗-0.0058∗∗∗-0.0058∗∗∗0.0002∗∗(0.0004)(0.0002)(0.0004)(0.0002)(0.0004)(0.0001)lastHourReturn-0.0142∗∗∗-0.0011∗∗∗-0.0137∗∗∗-0.0015∗∗∗-0.0103∗∗∗0.0007∗∗∗(0.0004)(0.0002)(0.0004)(0.0002)(0.0004)(0.0001)liquidity21.8502∗∗∗3.8909∗∗∗20.3436∗∗∗6.9135∗∗∗13.8188∗∗∗-2.1611∗∗∗(2.4339)(1.1150)(2.2160)(1.3436)(1.9661)(0.3442)volatility-0.0259∗∗∗-0.0019∗∗∗-0.0244∗∗∗-0.0051∗∗∗-0.0177∗∗∗0.0007∗∗∗(0.0010)(0.0005)(0.0009)(0.0006)(0.0008)(0.0001)Intercept-26.8079∗∗∗-12.1405∗∗∗-12.9395∗∗∗-15.4330∗∗∗-8.6243∗∗∗-0.7573∗∗(1.7050)(0.7809)(1.5520)(0.9413)(1.3773)(0.2469)Obs170417170405170405170417170417162493Adj. R20.03090.01230.02570.01580.01790.0049F-stat237.029493.4615196.3155120.1161136.016335.6470Every regression includes weekly fixed effects. \*\*\*, \*\*, \*, and + denote statistical significance at the 0.1%, 1%, 5%, and 10% levels. The methodology is the same as for the USDC-WETH analysis in Table [2](https://arxiv.org/html/2309.13648v2#S4.T2 "Table 2 ‣ 4.4 Factors Affecting Slippage ‣ 4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol"). The number of observations is less than reported in our summary statistics, due to some rows with missing latency or slippage tolerance information, inherited from the quality of our interface data.

Table 4: Comparing PEPE-WETH with USDC-WETH(AdverseSlippagei<−5\\textsf{AdverseSlippage}\_{i}<-5)USDC only (1)(AdverseSlippagei<−5\\textsf{AdverseSlippage}\_{i}<-5)PEPE only (2)(AdverseSlippagei<−5\\textsf{AdverseSlippage}\_{i}<-5)combined (3)orderSize7.0657∗∗∗37.1310∗∗∗7.1853∗∗∗(0.1335)(0.9355)(0.2973)gasPrice-0.0011+0.00030.0031(0.0006)(0.0003)(0.0025)logLatency-0.0624-0.0451+0.0354(0.0430)(0.0246)(0.1012)slippageTolerance-0.0006∗∗-0.0001-0.0041∗∗(0.0002)(0.0000)(0.0015)lastHourReturn-0.0006+0.0003∗∗∗0.0017(0.0004)(0.0000)(0.0010)liquidity-0.1109∗∗∗-4.2594∗∗∗-0.1175∗∗∗(0.0102)(0.2938)(0.0217)volatility0.0087∗∗∗0.0003∗∗∗0.0121∗(0.0017)(0.0001)(0.0055)isPepe2.0327∗(0.9200)isPepe:orderSize29.9457∗∗∗(0.9816)isPepe:gasPrice-0.0027(0.0025)isPepe:logLatency-0.0805(0.1042)isPepe:slippageTolerance0.0040∗∗(0.0015)isPepe:lastHourReturn-0.0014(0.0010)isPepe:liquidity-4.1419∗∗∗(0.2946)isPepe:volatility-0.0117∗(0.0055)Intercept-4.6234∗∗∗-4.5203∗∗∗-6.5530∗∗∗(0.2830)(0.1342)(0.9101)Obs258906170405276177Adj. R2F-statThis table presents the coefficients of running a logistic regression to estimate the following model:yi={1if wi>00otherwisey\_{i}=\\begin{cases}1&\\text{if $w\_{i}>0$}\\\
0&\\text{otherwise}\\end{cases}wi=β0+β1⋅𝗈𝗋𝖽𝖾𝗋𝖲𝗂𝗓𝖾i+β2⋅𝗀𝖺𝗌𝖯𝗋𝗂𝖼𝖾i+β3⋅𝗅𝗈𝗀𝖫𝖺𝗍𝖾𝗇𝖼𝗒i+β4⋅𝗌𝗅𝗂𝗉𝗉𝖺𝗀𝖾𝖳𝗈𝗅𝖾𝗋𝖺𝗇𝖼𝖾i+β5⋅𝗅𝖺𝗌𝗍𝖧𝗈𝗎𝗋𝖱𝖾𝗍𝗎𝗋𝗇i+β6⋅𝗅𝗂𝗊𝗎𝗂𝖽𝗂𝗍𝗒i+β7⋅𝗏𝗈𝗅𝖺𝗍𝗂𝗅𝗂𝗍𝗒i+𝖻𝗂𝗐𝖾𝖾𝗄𝖥𝖤+ei,\\displaystyle\\begin{split}w\_{i}=\\beta\_{0}&+\\beta\_{1}\\cdot\\mathsf{orderSize}\_{i}+\\beta\_{2}\\cdot\\mathsf{gasPrice}\_{i}+\\beta\_{3}\\cdot\\mathsf{logLatency}\_{i}+\\beta\_{4}\\cdot\\mathsf{slippageTolerance}\_{i}\\\
&+\\beta\_{5}\\cdot\\mathsf{lastHourReturn}\_{i}+\\beta\_{6}\\cdot\\mathsf{liquidity}\_{i}+\\beta\_{7}\\cdot\\mathsf{volatility}\_{i}+\\mathsf{biweekFE}+e\_{i},\\end{split}where wiw\_{i} is an unobserved latent variable.
Here, yiy\_{i} is a dummy variable that is equal to
1 if AdversarialSlippagei<−5\\textsf{AdversarialSlippage}\_{i}<-5 and is 0 otherwise. Model (1) shows the results for only swaps in the USDC-WETH 5 bps pool. Model (2) shows the results for the PEPE-WETH 30 bps pool. In model (3), we further interact every term with a dummy variable isPepei\\textsf{isPepe}\_{i} denoting whether a swap came from the USDC or the PEPE dataset.
Models (1) and (2) include biweekly fixed effects (for every two weeks). Model (3) includes a fixed effect for each pool/biweek pair. The variables are defined as in Table [2](https://arxiv.org/html/2309.13648v2#S4.T2 "Table 2 ‣ 4.4 Factors Affecting Slippage ‣ 4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol").

Table 5: Evaluating Private RPCsSlippageUSDC only (1)AdversarialSlippageUSDC only (2)CollisionSlippageUSDC only (3)SlippagePEPE only (4)AdversarialSlippagePEPE only (5)CollisionSlippagePEPE only (6)Public-0.3179∗∗-0.1892∗∗∗-0.1472+-10.2028∗∗∗-4.3599∗∗∗-6.8655∗∗∗(0.0969)(0.0460)(0.0876)(1.4884)(0.6817)(1.3548)orderSize-14.0278∗∗∗-12.3789∗∗∗-2.2425∗∗∗-254.0085∗∗∗-304.6394∗∗∗-5.7190(0.1671)(0.0793)(0.1511)(22.9679)(10.5195)(20.9075)gasPrice-0.0043∗∗∗-0.0004∗-0.0038∗∗∗-0.0432∗∗∗0.0036+-0.0482∗∗∗(0.0004)(0.0002)(0.0003)(0.0040)(0.0018)(0.0036)logLatency-0.0285∗0.0020-0.0267∗-1.0264∗∗∗-0.0098-1.0006∗∗∗(0.0142)(0.0067)(0.0128)(0.2348)(0.1075)(0.2137)slippageTolerance0.0000-0.0001∗∗∗0.0001∗∗∗-0.0120∗∗∗-0.0054∗∗∗-0.0069∗∗∗(0.0000)(0.0000)(0.0000)(0.0004)(0.0002)(0.0004)lastHourReturn-0.0115∗∗∗0.0008∗∗∗-0.0123∗∗∗-0.0142∗∗∗-0.0011∗∗∗-0.0137∗∗∗(0.0002)(0.0001)(0.0002)(0.0004)(0.0002)(0.0004)liquidity0.0244∗∗∗0.0110∗∗∗0.0144∗∗∗21.9822∗∗∗3.9439∗∗∗20.4271∗∗∗(0.0034)(0.0016)(0.0030)(2.4342)(1.1149)(2.2159)volatility-0.0051∗∗∗-0.0004-0.0046∗∗∗-0.0259∗∗∗-0.0019∗∗∗-0.0244∗∗∗(0.0007)(0.0003)(0.0007)(0.0010)(0.0005)(0.0009)Intercept0.02950.1294-0.1553-16.1428∗∗∗-7.5826∗∗∗-5.7623∗∗(0.2380)(0.1129)(0.2153)(2.3081)(1.0571)(2.1011)Obs258906258906258906170405170405170405Adj. R20.04710.08990.02360.03110.01260.0258F-stat347.1956691.8020169.8065229.172591.2927189.2329In this table, we present coefficients for regressions following Equation [1](https://arxiv.org/html/2309.13648v2#S4.E1 "In 4.4 Factors Affecting Slippage ‣ 4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol") but with an extra dummy variable 𝖯𝗎𝖻𝗅𝗂𝖼i\\mathsf{Public}\_{i} which denotes whether swap ii is first seen in the public mempool (else we consider it a private swap). Models (1), (2), and (3) are run for the USDC-WETH dataset, and models (4), (5), and (6) are run for the PEPE-WETH dataset. Every regression includes weekly fixed effects. \*\*\*, \*\*, \*, and + denote statistical significance at the 0.1%, 1%, 5%, and 10% levels.

Table 6: Evaluating Builder TrustSlippageUSDC only (1)AdverseSlippageUSDC only (2)ReorderingSlippageUSDC only (3)SlippagePEPE only (4)AdverseSlippagePEPE only (5)ReorderingSlippagePEPE only (6)Public-18.5635-22.4139-37.7070+-6.1565-15.5461∗-27.1810∗∗(15.3030)(15.9791)(20.3006)(9.3542)(7.8429)(10.4917)Flashbots15.027710.768819.41995.4474-1.46341.0724(16.4966)(17.2254)(21.8839)(9.7062)(8.1380)(10.8865)beaverbuild.org7.38034.10187.85148.296410.598325.4452∗(16.6729)(17.4096)(22.1179)(10.0328)(8.4119)(11.2529)builder0x696.50011.91462.96171.238211.891824.1788∗(17.0873)(17.8423)(22.6677)(10.1194)(8.4845)(11.3501)rsync-builder.xyz3.4111-0.9587-1.12726.08984.784717.1691(17.2274)(17.9886)(22.8534)(10.2704)(8.6111)(11.5194)Titan Builder0.4353-2.2372-3.7383-0.7663-0.8555-0.6282(22.1798)(23.1598)(29.4232)(13.8219)(11.5889)(15.5028)Public:Flashbots-18.9569-14.5283-25.3347-6.4908-1.0603-2.7282(16.5873)(17.3202)(22.0043)(9.7748)(8.1955)(10.9635)Public:beaverbuild.org8.704711.742420.8716-10.5897-13.7707-24.6458∗(16.7521)(17.4922)(22.2229)(10.0834)(8.4543)(11.3097)Public:builder0x69-19.3083-12.9409-18.5683-5.7843-18.1672∗-28.5244∗(17.1636)(17.9219)(22.7688)(10.1669)(8.5244)(11.4033)Public:rsync-builder.xyz-7.5911-1.8739-5.5371-4.8459-4.7420-18.6074(17.3371)(18.1031)(22.9990)(10.3242)(8.6562)(11.5797)Public:Titan Builder-9.4851-6.3563-11.38520.30290.1535-2.4457(22.5443)(23.5404)(29.9068)(13.9849)(11.7255)(15.6856)orderSize-2222.1129∗∗∗-2107.8426∗∗∗-3676.2999∗∗∗-1835.8060∗∗∗-3179.3877∗∗∗-6503.4761∗∗∗(6.0287)(6.2951)(7.9975)(27.0581)(22.6866)(30.3487)gasPrice0.01480.0540∗∗∗0.1377∗∗∗-0.0284∗∗∗0.0354∗∗∗0.0573∗∗∗(0.0129)(0.0135)(0.0172)(0.0047)(0.0039)(0.0053)logLatency-0.9401+-0.4698-1.5135∗-0.3921-0.2385-0.2213(0.5130)(0.5357)(0.6805)(0.2785)(0.2335)(0.3124)slippageTolerance-0.0137∗∗∗-0.0140∗∗∗-0.0238∗∗∗-0.0051∗∗∗-0.0063∗∗∗-0.0113∗∗∗(0.0009)(0.0009)(0.0011)(0.0005)(0.0004)(0.0006)lastHourReturn0.0196∗∗0.0714∗∗∗0.0904∗∗∗-0.0036∗∗∗0.0000-0.0000(0.0071)(0.0074)(0.0094)(0.0005)(0.0004)(0.0006)liquidity-0.12170.1090-0.3161∗4.9746+4.7885+8.8098∗∗(0.1211)(0.1265)(0.1607)(2.9144)(2.4436)(3.2688)volatility0.0951∗∗∗0.1199∗∗∗0.2654∗∗∗-0.0081∗∗∗-0.0025∗-0.0038∗∗(0.0265)(0.0277)(0.0351)(0.0012)(0.0010)(0.0013)Intercept44.2156∗39.5196∗76.3465∗∗∗14.182420.6180∗∗34.1672∗∗(17.1715)(17.9302)(22.7793)(9.5459)(8.0036)(10.7068)Obs258370258370258370169903169903169903Adj. R20.34870.30590.45270.02920.10460.2139F-stat2944.24812423.23044548.6162151.5305585.06311360.5539In this table, we present coefficients for regressions for the model in Equation [1](https://arxiv.org/html/2309.13648v2#S4.E1 "In 4.4 Factors Affecting Slippage ‣ 4 Empirical Findings ‣ Don’t Let MEV Slip:The Costs of Swapping on the Uniswap Protocol"), but where the endogenous variables are dollar notion of slippage, namely yi:=𝖲𝗅𝗂𝗉𝗉𝖺𝗀𝖾i⋅𝗈𝗋𝖽𝖾𝗋𝖲𝗂𝗓𝖾iy\_{i}:=\\mathsf{Slippage}\_{i}\\cdot\\mathsf{orderSize}\_{i}. We also add two new variables. First, 𝖯𝗎𝖻𝗅𝗂𝖼i\\mathsf{Public}\_{i} is a dummy variable that denotes whether swap ii is first seen in the public mempool. Second, 𝖡𝗎𝗂𝗅𝖽𝖾𝗋i\\mathsf{Builder}\_{i} is set to the name of the builder that built the block containing swap ii, if the builder is one of the top 5 builders by total number of private transactions in the sample, else it is set to ‘Other’.
We further interact 𝖯𝗎𝖻𝗅𝗂𝖼\\mathsf{Public} with 𝖡𝗎𝗂𝗅𝖽𝖾𝗋\\mathsf{Builder}. Note that most swaps do not experience adversarial slippage, so here we use a dollar notion of slippage may help to amplify the effect of adversarial slippage.
Models (1) and (2) are run for the USDC-WETH dataset, whereas models (3) and (4) are run for the PEPE-WETH dataset. All regressions include weekly fixed effects. \*\*\*, \*\*, \*, and + denote statistical significance at the 0.1%, 1%, 5%, and 10% levels.

## Appendix B Additional Charts

In this section, we present some additional charts that we did not have a chance to present in the main body. They characterize overall confirmation times, as well as transaction cost breakdowns, and may be useful as a reference.

Table 7: Transaction Confirmation Time Percentiles

|     |     |
| --- | --- |
| Percentile | Seconds |
| 50th | 6.2 |
| 80th | 10.2 |
| 90th | 12.1 |
| 95th | 17.9 |
| 97th | 24.1 |
| 99th | 104.0 |
| 99.5th | 259.9 |

The transaction confirmation time is defined as the difference between user signature time and the timestamp of the block in which the transaction is realized. For context, the time interval between two consecutive blocks in Ethereum (assume no missing block) is 12 seconds. So roughly 90% of all transactions get confirmed immediately in the next block after the users sign and broadcast their transaction.

Figure 1: Transaction Cost Composition For Different Transaction Types

![Refer to caption](https://arxiv.org/html/2309.13648v2/images/FullSampleCostBreakdown.png)(a)Full Sample

![Refer to caption](https://arxiv.org/html/2309.13648v2/images/USDCSwapsCostBreakdown.png)(b)WETH-USDC Swaps

![Refer to caption](https://arxiv.org/html/2309.13648v2/images/PEPESwapsCostBreakdown.png)(c)WETH-PEPE Swaps

![Refer to caption](https://arxiv.org/html/2309.13648v2/images/LargeSwapsCostBreakdown.png)(d)Large-sized Swaps (≥\\geq$100k)

![Refer to caption](https://arxiv.org/html/2309.13648v2/images/MediumSwapsCostBreakdown.png)(e)Medium-sized Swaps ($1k - $100k)

![Refer to caption](https://arxiv.org/html/2309.13648v2/images/SmallSwapsCostBreakdown.png)(f)Small-sized Swaps (≤\\leq$1k)

Here we show the percentage composition of the transaction costs within different groups.