Source: https://arxiv.org/html/2209.05559v6
Title: Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting
Fetched: 2026-10-14T01:08:28.405Z

Title:

Content selection saved. Describe the issue below:

Description:

![](https://arxiv.org/static/base/1.0.1/images/icons/smileybones-small.svg)arXiv is now an independent nonprofit! [Learn more](https://info.arxiv.org/about) ×

[License: arXiv.org perpetual non-exclusive license](https://info.arxiv.org/help/license/index.html#licenses-available)

arXiv:2209.05559v6 \[q-fin.ST\] 31 Jan 2023

# Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting

Berend Jelmer Dirk Gort
††thanks: B. Gort finished this project as a research assistant at Columbia University.Xiao-Yang Liu
Jiechao Gao
Shuaiyu Chen
Christina Dan Wang

###### Abstract

Designing profitable and reliable trading strategies is challenging in the highly volatile cryptocurrency market. Existing works applied deep reinforcement learning methods and optimistically reported increased profits in backtesting, which may suffer from the false positive issue due to model overfitting. In this paper, we propose a practical approach to address backtest overfitting for cryptocurrency trading using deep reinforcement learning. First, we formulate the detection of backtest overfitting as a hypothesis test. Then, we train DRL agents, estimate the probability of overfitting, and reject overfitted agents, increasing the chance of good trading performance. Finally, on 10 cryptocurrencies over a testing period from 05/01/2022 to 06/27/2022 (during which the crypto market crashed twice), we show that less overfitted deep reinforcement learning agents have a higher return than that of more overfitted agents, an equal weight strategy, and the S&P DBM Index (market benchmark), offering confidence in possible deployment in a real market.

1Department of Electrical Engineering, Columbia University

2Department of Computer Science, University of Virginia

3Department of Finance at Krannert School of Management, Purdue University

4Department of Business and Finance, New York University (Shanghai)

## Introduction

A profitable and reliable trading strategy in the cryptocurrency market is critical for hedge funds and investment banks. Deep reinforcement learning methods prove to be a promising approach ( [Fang et al. 2022](https://arxiv.org/html/2209.05559v6#bib.bib14 "")), including crypto portfolio allocation ( [Jiang and Liang 2017](https://arxiv.org/html/2209.05559v6#bib.bib23 ""); [Ang, Morris et al. 2022](https://arxiv.org/html/2209.05559v6#bib.bib2 "")) and trade execution ( [Hambly, Xu, and Yang 2021](https://arxiv.org/html/2209.05559v6#bib.bib20 "")). However, three major challenges prohibit the adoption in a real market: 1) the cryptocurrency market is highly volatile ( [Yang et al. 2019](https://arxiv.org/html/2209.05559v6#bib.bib47 "")); 2) the historical market data have a low signal-to-noise ratio ( [Conrad, Custovic, and Ghysels 2018](https://arxiv.org/html/2209.05559v6#bib.bib10 "")); and 3) there are large fluctuations (e.g., market crash) in the cryptocurrency market.

Existing works may suffer from the backtest overfitting issue, which is a false positive issue. Many methods ( [Liu et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib33 ""); [Liu et al. 2021b](https://arxiv.org/html/2209.05559v6#bib.bib34 ""); [Yang et al. 2020](https://arxiv.org/html/2209.05559v6#bib.bib46 "")) adopted a walk-forward method and optimistically reported increased profits in backtesting. The walk-forward method divides data in a training-validation-testing split, but using a single validation set can easily result in model overfitting. Another approach ( [Jiang and Liang 2017](https://arxiv.org/html/2209.05559v6#bib.bib23 "")) considered a KK-fold cross-validation method (leaving one period out) with an underlying assumption that the training and validation sets are drawn from an IID process, which does not hold in financial tasks. For example, ( [Liu and Tsyvinski 2021](https://arxiv.org/html/2209.05559v6#bib.bib35 "")) showed that there is a strong momentum effect in crypto returns. Finally, DRL algorithms are highly sensitive to hyperparameters ( [Li et al. 2021](https://arxiv.org/html/2209.05559v6#bib.bib27 "")), resulting in high variability of DRL algorithms’ performance ( [Clary et al. 2019](https://arxiv.org/html/2209.05559v6#bib.bib9 ""); [Henderson et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib21 ""); [Mania, Guy, and Recht 2018](https://arxiv.org/html/2209.05559v6#bib.bib36 "")). A researcher may get ‘lucky’ during the backtest process and obtain an overoptimistic agent (overfitted one). A key question from practitioners is that “does the trained agent generalize to different market situations?”

This paper proposes a practical approach to address the backtest overfitting issue. Researchers in the cryptocurrency trading niche submit papers containing overfitted backtest results. A practical and quantitative approach for detecting model overfitting is valuable. First, we formulate the detection of backtest overfitting as a hypothesis test. Such a test employs an estimated probability of overfitting to determine whether a trained agent is acceptable. Second, we provide detailed steps to estimate the probability of backtest overfitting. If the probability exceeds a preset threshold, we reject it. Finally, on 10 cryptocurrencies over a testing period from 05/01/2022 to 06/27/2022 (during which the crypto market crashed twice), we show that less overfitted deep reinforcement learning agents have a higher return than that of more overfitted agents, an equal weight strategy, and the S&P DBM Index (market benchmark), offering confidence in possible deployment in a real market. We hope DRL practitioners may apply the proposed method to ensure that their chosen agents are not just false positive results.

The remainder of this paper is organized as follows. We first review related works. Then, we describe the cryptocurrency trading task, and further propose a practical approach to address the backtest overfitting issue. Finally, we present performance evaluations that are followed by conclusions.

## Related Works

Existing works can be classified into three categories: 1) backtest using the walk-forward method, 2) backtest using the cross-validation method, and 3) backtest with hyperparameter tuning.

### Backtest Using Walk-Forward

The Walk-Forward (WF) method is the most widely applied backtest scheme. WF trains a DRL agent over a training period and then evaluates its performance over a subsequent validation period. However, WF validates in one market situation, which can easily result in overfitting ( [Agarwal et al. 2021](https://arxiv.org/html/2209.05559v6#bib.bib1 ""); [Lin et al. 2021](https://arxiv.org/html/2209.05559v6#bib.bib30 ""); [Chan et al. 2019](https://arxiv.org/html/2209.05559v6#bib.bib8 "")). WF may not reflect future performance, since the validation period can be biased, e.g., a significant market uptrend. Therefore, we want to train and validate under various market situations to avoid overfitting and make the agent more robust.

### Backtest Using Cross-Validation

Conventional methods ( [Jiang and Liang 2017](https://arxiv.org/html/2209.05559v6#bib.bib23 "")) used KK-fold cross-validation (KCV) to backtest agents’ trading performance. The KCV method partitions the dataset into KK subsets, generating KK folds. Then, for each trial, select one subset as the testing set and the rest K−1K-1 subsets as the training set. However, there are still risks of overfitting. First, a KK-fold cross-validation method splits data by drawing from an IID process, which is a bold assumption for financial markets ( [Robinson and Sims 1994](https://arxiv.org/html/2209.05559v6#bib.bib43 "")). Second, the testing set generated by a cross-validation method could have a substantial bias ( [De Prado 2018](https://arxiv.org/html/2209.05559v6#bib.bib11 "")). Finally, informational leakage is possible because the training and testing sets are correlated ( [Farokhi and Kaafar 2020](https://arxiv.org/html/2209.05559v6#bib.bib15 "")). The researcher should be cautious about leaking testing knowledge into the training set.

We employ an improved approach. Existing research overlooked the backtest overfitting issue and gave the false impression that DRL-based trading strategies may be ready to deploy on markets ( [Varoquaux and Cheplygina 2021](https://arxiv.org/html/2209.05559v6#bib.bib45 ""); [Bouthillier et al. 2021](https://arxiv.org/html/2209.05559v6#bib.bib6 ""); [Dodge et al. 2020](https://arxiv.org/html/2209.05559v6#bib.bib13 "")). WF only tests a single market situation with high statistical uncertainty, and KCV takes a false IID assumption without control for leakage. Therefore, we employ a combinatorial cross-validation method that tracks the degree of overfitting during the backtest process. This method simulates a large number of market situations and estiamtes the probability of overfitting.

### Backtest with Hyperparameter Tuning

DRL agents are highly sensitive to hyperparameters, as can be seen from the implementations of Stable Baselines3 ( [Raffin et al. 2021](https://arxiv.org/html/2209.05559v6#bib.bib42 "")), RLlib ( [Liang et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib28 ""))( [Liaw et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib29 "")), UnityML ( [Juliani et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib24 "")) and TensorForce ( [Kuhnle, Schaarschmidt, and Fricke 2017](https://arxiv.org/html/2209.05559v6#bib.bib25 "")). The selection of hyperparameters takes a lot of time and strongly influences the learning result. Several cloud platforms provide hyperparameter tuning services.

In finance, FinRL-Podracer ( [Li et al. 2021](https://arxiv.org/html/2209.05559v6#bib.bib27 "")) employed an evolutionary strategy for training a trading agent on a cloud platform, which ranks agents with different hyperparameters and then selects the one with the highest return as the resulting agent. Essentially, this method carried out a hyperparameter tuning process. Further, ElegantRL-Podracer ( [Liu et al. 2021a](https://arxiv.org/html/2209.05559v6#bib.bib31 "")) generalized it to a tournament-based method that is a highly scalable and cloud-native scheduling scheme for a GPU cloud.

## Cryptocurrency Trading Using Deep Reinforcement Learning

First, we model a cryptocurrency trading task as a Markov Decision Process (MDP). Then, we build a market environment using historical market data and describe the general setting for training a trading agent. Finally, we discuss the backtest overfitting issue.

![Refer to caption](https://arxiv.org/html/2209.05559v6/Images/high_correlation_filter.png)Figure 1: The correlation matrix of features.

### Modeling Cryptocurrency Trading

Assuming that there are DD cryptocurrencies and TT time slots, t=0,1,…,T−1t=0,1,...,T-1. We use a deep reinforcement learning agent to make trading actions, which can be either _buy, sell, or hold_. An agent observes the market situation, e.g., prices and technical indicators, and takes actions to maximize the cumulative return.
We model a trading task as a Markov Decision Process (MDP) as follows

- •


State 𝒔t=\[bt,𝒉t,𝒑t,𝒇t\]∈ℝ1+(I+2)​D\\bm{s}\_{t}=\[b\_{t},\\bm{h}\_{t},\\bm{p}\_{t},\\bm{f}\_{t}\]\\in\\mathbb{R}^{1+(I+2)D}, where bt∈ℝ+b\_{t}\\in\\mathbb{R}\_{+} is the cash amount in the account, 𝒉t∈ℝ+D\\bm{h}\_{t}\\in\\mathbb{R}\_{+}^{D} denotes the share holdings, 𝒑𝒕∈ℝ+D\\bm{p\_{t}}\\in\\mathbb{R}\_{+}^{D} denotes the prices at time tt, 𝒇t∈ℝI​D\\bm{f}\_{t}\\in\\mathbb{R}^{ID} is a feature vector for DD cryptocurrencies and each has II technical indicators, and ℝ+\\mathbb{R}\_{+} denotes non-negative real numbers.

- •


Action 𝒂t∈ℝD\\bm{a}\_{t}\\in\\mathbb{R}^{D} changes the non-negative share holdings 𝒉t∈ℝ+D\\bm{h}\_{t}\\in\\mathbb{R}\_{+}^{D}, i.e., 𝒉t+1=𝒉t+𝒂t\\bm{h}\_{t+1}=\\bm{h}\_{t}+\\bm{a}\_{t}, where positive actions increase 𝒉t\\bm{h}\_{t}, negative actions decrease 𝒉t\\bm{h}\_{t}, and zero actions keep ht{h}\_{t} unchanged.

- •


Reward r⁡(𝒔𝒕,𝒂𝒕,𝒔𝒕+𝟏)∈ℝr(\\bm{s\_{t},\\bm{a\_{t}},\\bm{s\_{t+1}}})\\in\\mathbb{R} is defined as a return when taking action 𝒂t\\bm{a}\_{t} at state 𝒔t\\bm{s}\_{t} and arriving at a new state 𝒔t+1\\bm{s}\_{t+1}. Here, we set it as the change of portfolio value, i.e., r⁡(𝒔𝒕,𝒂𝒕,𝒔𝒕+𝟏)=vt+1−vtr(\\bm{s\_{t},\\bm{a\_{t}},\\bm{s\_{t+1}}})=v\_{t+1}-v\_{t}, where vt=𝒑t⊤​𝒉t+bt∈ℝ+v\_{t}=\\bm{p}\_{t}^{\\top}\\bm{h}\_{t}+b\_{t}\\in\\mathbb{R}\_{+}.

- •


Policy π⁡(𝒂t\|𝒔t)\\pi(\\bm{a}\_{t}\|\\bm{s}\_{t}) is the trading strategy, which is a probability distribution over actions at state 𝒔t\\bm{s}\_{t}.


We consider 1515 features that are used by existing papers ( [Liu et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib33 ""); [Zhang, Zohren, and Roberts 2020](https://arxiv.org/html/2209.05559v6#bib.bib48 ""); [Yang et al. 2020](https://arxiv.org/html/2209.05559v6#bib.bib46 ""); [Liu et al. 2021b](https://arxiv.org/html/2209.05559v6#bib.bib34 "")), e.g., open-high-low-close-volume (OHLCV) and 99 technical indicators. Over the training period (from 02/02/2022 to 04/30/2022, as shown in Fig. [3](https://arxiv.org/html/2209.05559v6#Sx5.F3 "Figure 3 ‣ Experimental Settings ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting")), we compute Pearson correlations of the features and obtain a correlation matrix in Fig. [1](https://arxiv.org/html/2209.05559v6#Sx3.F1 "Figure 1 ‣ Cryptocurrency Trading Using Deep Reinforcement Learning ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting"). We list the 99 technical indicators as follows:

- •


Relative Strength Index (RSI) measures price fluctuation.

- •


Moving Average Convergence Divergence (MACD) is a momentum indicator for moving averages.

- •


Commodity Channel Index (CCI) compares the current price to the average price over a period.

- •


Directional Index (DX) measures the trend strength by quantifying the amount of price movement.

- •


The rate of change (ROC) is the speed at which variable changes over a period ( [Gerritsen et al. 2020](https://arxiv.org/html/2209.05559v6#bib.bib17 "")).

- •


Ultimate Oscillator (ULTSOC) measures the price momentum of an asset across multiple timeframes ( [Gudelek, Boluk, and Ozbayoglu 2017](https://arxiv.org/html/2209.05559v6#bib.bib18 "")).

- •


Williams %R (WILLR) measures overbought and oversold levels ( [Ni and Yin 2009](https://arxiv.org/html/2209.05559v6#bib.bib40 "")).

- •


On Balance Volume (OBV) measures buying and selling pressure as a cumulative indicator that adds volume on up-days and subtracts volume on down-days ( [Gerritsen et al. 2020](https://arxiv.org/html/2209.05559v6#bib.bib17 "")).

- •


The Hilbert Transform Dominant (HT) is used to generate in-phase and quadrature components of a detrended real-valued signal to analyze variations of the instantaneous phase and amplitude ( [Nava, Di Matteo, and Aste 2016](https://arxiv.org/html/2209.05559v6#bib.bib38 "")).


As shown in Fig. [1](https://arxiv.org/html/2209.05559v6#Sx3.F1 "Figure 1 ‣ Cryptocurrency Trading Using Deep Reinforcement Learning ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting"), if two features have a correlation coefficient exceeding ±0.6\\pm 0.6, we drop either one of the two. Finally, I=6I=6 features are kept in the feature vector 𝒇t∈ℝ6​D\\bm{f}\_{t}\\in\\mathbb{R}^{6D}, which are trading volume, RSI, DX, ULTSOC, OBV, and HT. Since the OHLC prices are highly correlated, 𝒑t\\bm{p}\_{t} in 𝒔t\\bm{s}\_{t} is chosen to be the close price over the period \[t,t+1\]\[t,t+1\]. Note that the close price of period \[t,t+1\]\[t,t+1\] equals to the open price of period \[t+1,t+2\]\[t+1,t+2\]. The feature vector 𝒇t\\bm{f}\_{t} characterizes the market situation. For the case D=10D=10, 𝒔t\\bm{s}\_{t} has size 8181.

### Building Market Environment

We build a market environment by replaying historical data ( [Liu et al. 2022](https://arxiv.org/html/2209.05559v6#bib.bib32 "")), following the style of OpenAI Gym ( [Brockman et al. 2016](https://arxiv.org/html/2209.05559v6#bib.bib7 "")). A trading agent interacts with the market environment in multiple episodes, where an episode replays the market data (time series) in a time-driven manner from t=0t=0 to t=T−1t=T-1. At the beginning (t=0t=0), the environment sends an initial state 𝒔0\\bm{s}\_{0} to the agent that returns an action 𝒂0\\bm{a}\_{0}. Then, the environment executes the action 𝒂t\\bm{a}\_{t} and sends a reward value rtr\_{t} and a new state 𝒔t+1\\bm{s}\_{t+1} to the agent, for t=0,…,T−1t=0,...,T-1. Finally, 𝒔T−1\\bm{s}\_{T-1} is set to be the terminal state.

The market environment has the following three functions:

- •


reset function resets the environment to 𝒔0=\[b0,𝒉0,𝒑0,𝒇0\]\\bm{s}\_{0}=\[b\_{0},\\bm{h}\_{0},\\bm{p}\_{0},\\bm{f}\_{0}\] where b0b\_{0} is the investment capital and 𝒉0=0\\bm{h}\_{0}=0 (zero vector) since there are no shareholdings yet.

- •


step function takes an action ata\_{t} and updates state 𝒔t\\bm{s}\_{t} to 𝒔t+1\\bm{s}\_{t+1}. For 𝒔t+1\\bm{s}\_{t+1} at time t+1t+1, 𝒑t+1\\bm{p}\_{t+1} and 𝒇t+1\\bm{f}\_{t+1} are accessible by looking up the time series of market data, and update bt+1b\_{t+1} and 𝒉t+1\\bm{h}\_{t+1} as follows:



|     |     |     |     |
| --- | --- | --- | --- |
|  | bt+1=bt−𝒑t⊤​𝒂t,𝒉t+1=𝒉t+𝒂t.\\begin{split}b\_{t+1}&=b\_{t}-\\bm{p}\_{t}^{\\top}\\bm{a}\_{t},\\\<br>\\bm{h}\_{t+1}&=\\bm{h}\_{t}+\\bm{a}\_{t}.\\end{split} |  | (1) |

- •


reward function computes r⁡(𝒔𝒕,𝒂𝒕,𝒔𝒕+𝟏)=vt+1−vtr(\\bm{s\_{t},\\bm{a\_{t}},\\bm{s\_{t+1}}})=v\_{t+1}-v\_{t} as follows:



|     |     |     |     |
| --- | --- | --- | --- |
|  | r⁡(𝒔t,𝒂t,𝒔t+1)=(bt+1+𝒑𝒕+𝟏⊤​𝒉𝒕+𝟏)−(bt+𝒑𝒕⊤​𝒉𝒕).r\\left(\\bm{s}\_{t},\\bm{a}\_{t},\\bm{s}\_{t+1}\\right)=\\left(b\_{t+1}+\\bm{p}\_{\\bm{t}+\\mathbf{1}}^{\\top}\\bm{h}\_{\\bm{t}+\\mathbf{1}}\\right)-\\left(b\_{t}+\\bm{p}\_{\\bm{t}}^{\\top}\\bm{h}\_{\\bm{t}}\\right). |  | (2) |


Trading constraints

1). Transaction fees. Each trade has transaction fees, and different brokers charge varying commissions. For cryptocurrency trading, we assume that the transaction cost is 0.3%0.3\\% of the value of each trade.
Therefore, ( [2](https://arxiv.org/html/2209.05559v6#Sx3.E2 "In 3rd item ‣ Building Market Environment ‣ Cryptocurrency Trading Using Deep Reinforcement Learning ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting")) becomes

|     |     |     |     |
| --- | --- | --- | --- |
|  | r⁡(𝒔t,𝒂t,𝒔t+1)=(bt+1+𝒑𝒕+𝟏⊤​𝒉𝒕+𝟏)−(bt+𝒑𝒕⊤​𝒉𝒕)−ct,r\\left(\\bm{s}\_{t},\\bm{a}\_{t},\\bm{s}\_{t+1}\\right)=\\left(b\_{t+1}+\\bm{p}\_{\\bm{t}+\\mathbf{1}}^{\\top}\\bm{h}\_{\\bm{t}+\\mathbf{1}}\\right)-\\left(b\_{t}+\\bm{p}\_{\\bm{t}}^{\\top}\\bm{h}\_{\\bm{t}}\\right)-c\_{t}, |  | (3) |

and the transactions fee ctc\_{t} is

|     |     |     |     |
| --- | --- | --- | --- |
|  | ct=𝒑t⊤​\|𝒂t\|×0.3%,c\_{t}=\\bm{p}\_{t}^{\\top}\|\\bm{a}\_{t}\|\\times 0.3\\%, |  | (4) |

where \|𝒂t\|\|\\bm{a}\_{t}\| means taking entry-wise absolute value of 𝒂t\\bm{a}\_{t}.

2). Non-negative balance. We do not allow short, thus we make sure that bt+1∈ℝ+b\_{t+1}\\in\\mathbb{R}\_{+} is non-negative,

|     |     |     |     |
| --- | --- | --- | --- |
|  | bt+1=bt+𝒑t⊤𝒂tS+𝒑t⊤𝒂tB≥0,fort=0,…,T−1,b\_{t+1}=b\_{t}+\\bm{p}\_{t}^{\\top}\\bm{a}\_{t}^{S}+\\bm{p}\_{t}^{\\top}\\bm{a}\_{t}^{B}\\geq 0,~~~\\text{for}~~t=0,...,T-1, |  | (5) |

where 𝒂tS∈ℝ−D\\bm{a}\_{t}^{S}\\in\\mathbb{R}\_{-}^{D} and 𝒂tB∈ℝ+D\\bm{a}\_{t}^{B}\\in\\mathbb{R}\_{+}^{D} denote the selling orders and buying orders, respectively, such that 𝒂t=𝒂tS+𝒂tB\\bm{a}\_{t}=\\bm{a}\_{t}^{S}+\\bm{a}\_{t}^{B}. Therefore, action 𝒂t\\bm{a}\_{t} is executed as follows: first execute the selling orders 𝒂tS∈ℝ−D\\bm{a}\_{t}^{S}\\in\\mathbb{R}\_{-}^{D} and then the buying orders 𝒂tB∈ℝ+D\\bm{a}\_{t}^{B}\\in\\mathbb{R}\_{+}^{D}; and if there is not enough cash, a buying order will not be executed.

3). Risk control. The cryptocurrency market regularly drops in terms of market capitalization, sometimes even ≥70%\\geq 70\\%. To control the risk for these market situations, we employ the Cryptocurrency Volatility Index, CVIX ( [Bonaparte 2021](https://arxiv.org/html/2209.05559v6#bib.bib5 "")). Extreme market situations increase the value of CVIX. Once the CVIX exceeds a certain threshold, we stop buying and then sell all our cryptocurrency holdings. We resume trading once the CVIX returns under the threshold.

### Training a Trading Agent

A trading agent learns a policy π⁡(𝒂t\|𝒔t)\\pi(\\bm{a}\_{t}\|\\bm{s}\_{t}) that maximizes the discounted cumulative return R=∑t=0∞γt​r​(𝒔t,𝒂t,𝒔t+1)R=\\sum\_{t=0}^{\\infty}\\gamma^{t}r\\left(\\bm{s}\_{t},\\bm{a}\_{t},\\bm{s}\_{t+1}\\right), where γ∈(0,1\]\\gamma\\in(0,1\] is a discount factor and r⁡(𝒔t,𝒂t,𝒔t+1)r\\left(\\bm{s}\_{t},\\bm{a}\_{t},\\bm{s}\_{t+1}\\right) is given in ( [3](https://arxiv.org/html/2209.05559v6#Sx3.E3 "In Building Market Environment ‣ Cryptocurrency Trading Using Deep Reinforcement Learning ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting")). The Bellman equation gives the optimality condition for an MDP problem, which takes a recursive form as follows:

|     |     |     |     |
| --- | --- | --- | --- |
|  | Qπ​(𝒔𝒕,𝒂𝒕)=r⁡(𝒔𝒕,𝒂𝒕,𝒔𝒕+𝟏)+γ​𝔼𝒂𝒕+𝟏​\[Qπ​(𝒔𝒕+𝟏,𝒂𝒕+𝟏)\].Q^{\\pi}(\\bm{s\_{t}},\\bm{a\_{t}})=r(\\bm{s\_{t},\\bm{a\_{t}},\\bm{s\_{t+1}}})+\\gamma\\mathbb{E}\_{\\bm{a\_{t+1}}}\\left\[Q^{\\pi}(\\bm{s\_{t+1},a\_{t+1}})\\right\]. |  | (6) |

There are dozens of DRL algorithms that can be adapted to crypto trading. Popular ones are TD3 ( [Fujimoto, Van Hoof, and Meger 2018](https://arxiv.org/html/2209.05559v6#bib.bib16 "")), SAC ( [Haarnoja et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib19 "")), and PPO ( [Schulman et al. 2017](https://arxiv.org/html/2209.05559v6#bib.bib44 "")).

Next, we describe a general flow of agent trading. At the beginning of training, we set hyperparameters such as the learning rate, batch size, etc. DRL algorithms are highly sensitive to hyperparameters, meaning that an agent’s trading performance may vary significantly. We have multiple sets of hyperparameters in the training stage for different trials. Each trial trains with one set of hyperparameters and obtains a trained agent. Then, we pick the DRL agent with the best-performing hyperparameters and re-train the agent on the whole training data.

### Backtest Overfitting Issue

Backtest( [De Prado 2018](https://arxiv.org/html/2209.05559v6#bib.bib11 "")) uses historical data to simulate the market and evaluates the performance of an agent, namely, how would an agent have performed should it have been run over a past time period. Researchers often perform backtests by splitting the data into two chronological sets: one training set and one validation set. However, a DRL agent usually overfits an individual validation set that represents one market situation, thus, the actual trading performance is in question.

Backtest overfitting occurs when a DRL agent fits the historical training data to a harmful extent. The DRL agent adapts to random fluctuations in the training data, learning these fluctuations as concepts. However, these concepts do not exist, damaging the performance of the DRL agent on unseen states.

![Refer to caption](https://arxiv.org/html/2209.05559v6/Images/CV_splits_group.jpg)Figure 2: Illustration of combinatorial splits. Split the data into N=5N=5 groups, k=2k=2 groups for the train set (red) and the rest N−k=3N-k=3 groups for the second set (blue).

## Practical Approach to Address Backtest Overfitting

We propose a practical approach to address the backtest overfitting issue ( [Bailey et al. 2016](https://arxiv.org/html/2209.05559v6#bib.bib3 "")). First, we formulate the problem as a hypothesis test and reject agents that do not pass the test. Then, we describe the detailed steps to estimate the probability of overfitting, p∈\[0,1\]p\\in\[0,1\].

### Hypothesis Test to Reject Overfitted Agents

We formulate a hypothesis test to reject overfitted agents. Mathematically, it is expressed as follows

|     |     |     |     |
| --- | --- | --- | --- |
|  | {ℋ0:p<α,NOT overfitted,ℋ1:p≥α,overfitted.\\begin{cases}\\mathcal{H}\_{0}:&p<\\alpha,\\quad\\quad\\text{NOT overfitted},\\\<br>\\mathcal{H}\_{1}:&p\\geq\\alpha,\\quad\\quad\\text{overfitted}.\\end{cases} |  | (7) |

where α>0\\alpha>0 is the level of significance.

The hypothesis test ( [7](https://arxiv.org/html/2209.05559v6#Sx4.E7 "In Hypothesis Test to Reject Overfitted Agents ‣ Practical Approach to Address Backtest Overfitting ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting")) is expected to reject two types of false-positive DRL agents. 1) Existing methods may have reported overoptimistic results since many authors were tempted to go back and forth between training and testing periods. This type of information leakage is a common reason for backtest overfitting. 2). Agent training is likely to overfit since DRL algorithms are highly sensitive to hyperparameters ( [Clary et al. 2019](https://arxiv.org/html/2209.05559v6#bib.bib9 ""); [Henderson et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib21 ""); [Mania, Guy, and Recht 2018](https://arxiv.org/html/2209.05559v6#bib.bib36 "")). For example, one can train agents with PPO, TD3, or SAC algorithm and then reject agents that do not pass the test. We set the level of significance α\\alpha according to the Neyman-Pearson framework ( [Neyman and Pearson 1933](https://arxiv.org/html/2209.05559v6#bib.bib39 "")).

### Estimating the Probability of Overfitting

Combinatorial Cross-validation allows for training-and-validating on different market situations. Given a training time period, we perform the following steps:

- •


Step 1 (Training-validation data splits): as shown in Fig. [2](https://arxiv.org/html/2209.05559v6#Sx3.F2 "Figure 2 ‣ Backtest Overfitting Issue ‣ Cryptocurrency Trading Using Deep Reinforcement Learning ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting"), divide the training period with TT data points into NN groups of equal size, kk out of NN groups construct a validation set and the rest N−kN-k groups as a training set, resulting in J=(NN−k)J=\\left(\\begin{array}\[\]{c}N\\\
N-k\\end{array}\\right) combinatorial splits. The training and validation sets have (N−k)​(T/N)(N-k)(T/N) and T′=k⁡(T/N)T^{\\prime}=k(T/N) data points, respectively.

- •


Step 2 (One trial of hyperparameters): set a new set of parameters for hyperparameter tuning.

- •


Step 3: In each training-validation data split, we train an agent using the training set and then evaluate the agent’s performance metric for each validation set, i=1,…,Hi=1,...,H. After training on all splits, we take the mean performance metric over all validation sets.


Step 2) and Step 3) constitute one hyperparameter trial. Loop for HH trials and select the set of hyperparameters (or DRL agent) that performs the best in terms of mean performance metric over all splits. This procedure considers various market situations, resulting in the best-performing DRL agent over different market situations. However, a training process involving multiple trials will result in overfitting ( [Bailey et al. 2014](https://arxiv.org/html/2209.05559v6#bib.bib4 "")).

We estimate the probability of overfitting using the return vector. The return vector is defined as 𝑹t=vt−vt−1\\bm{R}\_{t}=v\_{t}-v\_{t-1}, where vtv\_{t} is the portfolio value at time step tt. We estimate the probability of overfitting via three general steps.

- •


Step 1: For each hyperparameter trial, average the returns on the validation sets (of length T′T^{\\prime}) and obtain 𝑹avg∈ℝT′\\bm{R}\_{\\text{avg}}\\in\\mathbb{R}^{T^{\\prime}}.

- •


Step 2: For HH trials, stack 𝑹avg\\bm{R}\_{\\text{avg}} into a matrix 𝑴∈ℝT′×H\\bm{M}\\in\\mathbb{R}^{T^{\\prime}\\times H}.

- •


Step 3: Based on 𝑴\\bm{M}, we compute the probability of overfitting pp.


Consider a probability space (𝒯,ℱ,ℙ)(\\mathcal{T},\\mathcal{F},\\mathbb{P}), where 𝒯\\mathcal{T} represents the sample space, ℱ\\mathcal{F} the event space and ℙ\\mathbb{P} the probability space. A sample c∈𝒯c\\in\\mathcal{T} is a split of matrix M\\bm{M} across rows. For instance, we split 𝑴\\bm{M} into four subsets:

|     |     |     |     |
| --- | --- | --- | --- |
|  | 𝑴𝟏,𝑴𝟐,𝑴𝟑,𝑴𝟒∈ℝT′/4×H.\\displaystyle\\bm{M^{1}},\\bm{M^{2}},\\bm{M^{3}},\\bm{M^{4}}\\in\\mathbb{R}^{T^{\\prime}/4\\times H}. |  | (8) |

A sample cc could be any split of 𝑴\\bm{M}, such as:

|     |     |     |     |
| --- | --- | --- | --- |
|  | c=\[𝑴𝟏𝑴𝟐\],IS setc¯=\[𝑴𝟑𝑴𝟒\],OOS setc=\\begin{bmatrix}\\bm{M^{1}}\\\<br>\\bm{M^{2}}\\end{bmatrix},~\\text{IS set}\\quad\\quad\\quad\\quad\\quad\\bar{c}=\\begin{bmatrix}\\bm{M^{3}}\\\<br>\\bm{M^{4}}\\end{bmatrix},~\\text{OOS set} |  | (9) |

An agent is overfitted if its best performance in the IS set has an expected ranking that is lower than the median ranking in the OOS set( [Bailey et al. 2016](https://arxiv.org/html/2209.05559v6#bib.bib3 "")). For a sample c∈𝒯c\\in\\mathcal{T}, let 𝑹c∈ℝH\\bm{R}^{c}\\in\\mathbb{R}^{H} and 𝑹¯𝒄∈ℝH\\bm{\\overline{R}^{c}}\\in\\mathbb{R}^{H} denote the IS and OOS performance of the columns of a sample cc, respectively. We rank 𝑹c\\bm{R}^{c} and 𝑹¯c\\bm{\\bar{R}}^{c} from low values to high values, resulting in 𝒓c\\bm{r}^{c} and 𝒓¯c\\bm{\\bar{r}}^{c} (for example, \[1, 3, 2\], where 3 corresponds to the best performance metric). Define ϵ\\epsilon as the index of the best-performing IS strategy. Then, we check the corresponding OOS rank 𝒓¯c\[ϵ\\bm{\\bar{r}}^{c}\[\\epsilon\] and define a relative rank ωc\\omega^{c} as follows:\
\
|     |     |     |     |\
| --- | --- | --- | --- |\
|  | ωc=𝒓¯c​\[ϵ\]H+1,for​c∈𝒯.\\omega^{c}=\\frac{\\bm{\\bar{r}}^{c}\[\\epsilon\]}{H+1},~\\text{for}~c\\in\\mathcal{T}. |  | (10) |\
\
Define a logit function as follows:\
\
|     |     |     |     |\
| --- | --- | --- | --- |\
|  | λc=ln⁡ωc1−ωc,for​c∈𝒯.\\lambda^{c}=\\ln\\frac{\\omega^{c}}{1-\\omega^{c}},~\\text{for}~c\\in\\mathcal{T}. |  | (11) |\
\
If ωc<0.5\\omega^{c}<0.5, we have λc<0\\lambda^{c}<0, meaning that the best strategy IS has an expected ranking lower than the OOS set, which is overfitting. High logit values indicate coherence between IS and OOS performance, indicating a low level of overfitting. Finally, the probability of overfitting is computed as follows:\
\
|     |     |     |     |\
| --- | --- | --- | --- |\
|  | p=∫−∞0f⁡(λ)​𝑑λ,p=\\int\_{-\\infty}^{0}f(\\lambda)d\\lambda, |  | (12) |\
\
where f⁡(λ)f(\\lambda) denotes the distribution function of λ\\lambda.\
\
Finally, we discuss how to set the significance level α\\alpha. The relative OOS rank is a uniform distribution. Such a uniform’s logit is normally distributed. In accordance with the Neyman-Pearson framework, we can set the level of significance α\\alpha. Because α\\alpha is a probability, it ranges between 00 and 11. Thus, if α=10%\\alpha=10\\%, we allow a 10% probability of incorrectly rejecting the null hypothesis in favor of the alternative when the null hypothesis is true.\
\
## Performance Evaluations\
\
First, we describe the experimental settings and the compared methods and metrics. Then, we show that the proposed method can help reject two types of overfitted agents. Finally, we present the backtest performance to verify that our hypothesis test helps increase the chance of good trading performance.\
\
### Experimental Settings\
\
We select 1010 cryptocurrencies with high trading volumes: AAVE, AVAX, BTC, NEAR, LINK, ETH, LTC, MATIC, UNI, and SOL. We assume a trade can be executed at the market price and ignore the slippage issue because a higher trading volume indicates higher market liquidity.\
\
Data split: We use five-minute-level data from 02/02/2022 to 06/27/2022. We split it into a training period (from 02/02/2022 to 04/30/2022) and a testing period (from 05/01/2022 to 06/27/2022, during which the crypto market crashed two times), as shown in Fig. [3](https://arxiv.org/html/2209.05559v6#Sx5.F3 "Figure 3 ‣ Experimental Settings ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting"). The training period splits further into IS-OOS sets for estimating pp as in the previous section.\
\
Training with combinatorial cross-validation: there are in total T=25055=87​(days)×24​(hours)×60/5​(minutes)−1T=25055=87~(\\text{days})\\times 24~(\\text{hours})\\times 60/5~(\\text{minutes})-1 datapoints in the training time period, and T′=16704=58​(days)×24​(hours)×60/5​(minutes)T^{\\prime}=16704=58~(\\text{days})\\times 24~(\\text{hours})\\times 60/5~(\\text{minutes}) in the testing time period. We divide the training data set into N=5N=5 equal-sized subsets, each subset has 5011 data points. We perform the combinatorial cross-validation method with N=5N=5 and k=2k=2, where each data split has k=2k=2 validation sets and N−k=3N-k=3 training sets. Therefore, the total number of training-validation splits is J=10J=10.\
\
Hyperparameters: we list six tunable hyperparameters in Table [1](https://arxiv.org/html/2209.05559v6#Sx5.T1 "Table 1 ‣ Experimental Settings ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting"). Their values are based on the implementations of Stable Baselines3 ( [Raffin et al. 2021](https://arxiv.org/html/2209.05559v6#bib.bib42 "")), RLlib ( [Liang et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib28 "")), Ray Tune ( [Liaw et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib29 "")), UnityML ( [Juliani et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib24 "")) and TensorForce ( [Kuhnle, Schaarschmidt, and Fricke 2017](https://arxiv.org/html/2209.05559v6#bib.bib25 "")). There are in total 2700=5×4×5×3×3×32700=5\\times 4\\times 5\\times 3\\times 3\\times 3 combinations.\
\
Trials HH: for any distribution over a sample space with a finite maximum, the maximum of 50 random observations lies within the top 5% of the actual maximum, with 90% probability. Specifically, 1−(1−0.05)H≥0.91-(1-0.05)^{H}\\geq 0.9 requires H≥50H\\geq 50 assuming the optimal region of hyperparameters occupies at least 5% of the grid space.\
\
Volatility index CVIX (Crypto VIX) ( [Bonaparte 2021](https://arxiv.org/html/2209.05559v6#bib.bib5 "")): the total market capitalization of the crypto market crashed two times in our testing period, namely, 05/06/2022 - 05/12/2022 and 06/09/2022 - 06/15/2022. We take the average CVIX value over those time frames as our threshold, CVIXt=90.1\\text{CVIX}\_{t}=90.1.\
\
Level of significance α\\alpha: we allow a 10% probability of incorrectly rejecting the null hypothesis in favour of the alternative when the null hypothesis is true (type I error), α=10%\\alpha=10\\%.\
\
![Refer to caption](https://arxiv.org/html/2209.05559v6/Images/Data_Split2.jpg)Figure 3: Data split: train and validate an agent in the blue period, and test its performance in the green period.Table 1: The hyperparameters and their values.\
\
| Hyperparameter | Description | Range |\
| --- | --- | --- |\
| Learning rate | Step size during the training process | \[3​e−2,2.3​e−2,1.5​e−2,7.5​e−3,5​e−6\]\[3e^{-2},2.3e^{-2},1.5e^{-2},7.5e^{-3},5e^{-6}\] |\
| Batch size | Number of training samples in one iteration | \[512,1280,2048,3080\]\[512,1280,2048,3080\] |\
| Gamma γ\\gamma | Discount factor | \[0.95,0.96,0.97,0.98,0.99\]\[0.95,0.96,0.97,0.98,0.99\] |\
| Net dimension | Width of hidden layers of the actor network | \[29,210,211\]\[2^{9},2^{10},2^{11}\] |\
| Target step | Explored target step number in the environment | \[2.5​e3,3.75​e3,5​e3\]\[2.5e^{3},3.75e^{3},5e^{3}\] |\
| Break step | Total timesteps performed during training | \[3​e4,4.5​e4,6​e4\]\[3e^{4},4.5e^{4},6e^{4}\] |\
\
### Compared Methods and Performance Metrics\
\
We consider two cases where the proposed method helps reject overfitted agents.\
\
#### Conventional Deep Reinforcement Learning Agents\
\
First, the walk-forward method ( [Park, Sim, and Choi 2020](https://arxiv.org/html/2209.05559v6#bib.bib41 ""); [Moody and Saffell 2001](https://arxiv.org/html/2209.05559v6#bib.bib37 ""); [Deng et al. 2016](https://arxiv.org/html/2209.05559v6#bib.bib12 ""); [Yang et al. 2020](https://arxiv.org/html/2209.05559v6#bib.bib46 ""); [Li et al. 2019](https://arxiv.org/html/2209.05559v6#bib.bib26 "")) applies a training-validation-testing data split. On the same training-validation set, we train with H=50H=50 different sets of hyperparameters, all with PPO algorithm ( [Schulman et al. 2017](https://arxiv.org/html/2209.05559v6#bib.bib44 "")) and then calculate pp( [Bailey et al. 2014](https://arxiv.org/html/2209.05559v6#bib.bib4 "")). Second, we train another conventional agent using the PPO algorithm and the KK-fold cross-validation (KCV) method with k=5k=5.\
\
#### Deep Reinforcement Algorithms with Different Hyperparameters\
\
DRL algorithms are highly sensitive to hyperparameters, resulting in high variability of trading performance ( [Clary et al. 2019](https://arxiv.org/html/2209.05559v6#bib.bib9 ""); [Henderson et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib21 ""); [Mania, Guy, and Recht 2018](https://arxiv.org/html/2209.05559v6#bib.bib36 "")). We use the probability of overfitting to measure the likelihood that an agent is overfitted. We tune the hyperparameters in Table [1](https://arxiv.org/html/2209.05559v6#Sx5.T1 "Table 1 ‣ Experimental Settings ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting") for three agents, TD3 ( [Fujimoto, Van Hoof, and Meger 2018](https://arxiv.org/html/2209.05559v6#bib.bib16 "")), SAC ( [Haarnoja et al. 2018](https://arxiv.org/html/2209.05559v6#bib.bib19 "")) and PPO, and calculate pp for each agent with each set of hyperparameters for H=50H=50 trials.\
\
#### Performance Metrics\
\
We use three metrics to measure an agent’s performance:\
\
- •\
\
\
Cumulative returnR=v−v0v0R=\\frac{v-v\_{0}}{v\_{0}}, where vv is the final portfolio value, and v0v\_{0} is the original capital.\
\
- •\
\
\
VolatilityV=std​(Rt)\\text{V}=\\text{std}(R\_{t}), where Rt=vt−vt−1vt−1R\_{t}=\\frac{v\_{t}-v\_{t-1}}{v\_{t-1}}, and t=0,…,T−1t=0,...,T-1.\
\
- •\
\
\
Probability of overfitting pp. We split 𝑴\\bm{M} into 1414 submatrices, analyze all possible combinations, and set the threshold α=10%\\alpha=10\\%( [Neyman and Pearson 1933](https://arxiv.org/html/2209.05559v6#bib.bib39 "")).\
\
\
The cumulative return measures the profits. The widely used volatility measures the degree of variation of a trading price series over time; the amount of risk.\
\
#### Benchmarks\
\
We compare two benchmark methods: an equal-weight portfolio and the S&P Cryptocurrency Broad Digital Market Index (S&P BDM Index).\
\
- •\
\
\
Equal-weight strategy: at time t0t\_{0}, distribute the available cash b0b\_{0} equally over all DD available cryptocurrencies.\
\
- •\
\
\
S&P BDM index ( [Indices and Methodology 2022](https://arxiv.org/html/2209.05559v6#bib.bib22 "")): the S&P broad digital market index S&P tracks the performance of cryptocurrencies with a market capitalization greater than $10 million.\
\
\
### Rejecting Conventional Agents\
\
Fig. [4](https://arxiv.org/html/2209.05559v6#Sx5.F4 "Figure 4 ‣ Rejecting Conventional Agents ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting") shows the logit distribution function f⁡(λ)f(\\lambda) for conventional agents described in Section [Conventional Deep Reinforcement Learning Agents](https://arxiv.org/html/2209.05559v6#Sx5.SSx2.SSSx1 "Conventional Deep Reinforcement Learning Agents ‣ Compared Methods and Performance Metrics ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting"). The area under f⁡(λ)f(\\lambda) for the domain \[−∞,0\]\[-\\infty,0\] is the probability of overfitting pp. The peaks represent the outperforming DRL agents, as an agent’s success is sensitive to the hyperparameter set. These outperforming trials deliver the same relative rank more often, and the logits are a function of the relative rank. We compare our PPO approach to conventional PPO WF and PPO KCV. The WF and KCV methods have pWF=17.5%>αp\_{\\text{WF}}=17.5\\%>\\alpha and pKCV=7.9%<αp\_{\\text{KCV}}=7.9\\%<\\alpha, respectively. For the WF method, we accept the alternative hypothesis ℋ1\\mathcal{H}\_{1} and conclude that it is overfitting.\
\
![Refer to caption](https://arxiv.org/html/2209.05559v6/Images/multiple_logits_dist_53.png)Figure 4: Logit distribution f⁡(λ)f(\\lambda) of three conventional agents.![Refer to caption](https://arxiv.org/html/2209.05559v6/Images/multiple_logits_dist_54.png)Figure 5: Logit distribution f⁡(λ)f(\\lambda) of three DRL agents.\
\
### Rejecting Overfitted Agents\
\
Table [2](https://arxiv.org/html/2209.05559v6#Sx5.T2 "Table 2 ‣ Rejecting Overfitted Agents ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting") presents the hyperparameters selected for each agent. Fig. [5](https://arxiv.org/html/2209.05559v6#Sx5.F5 "Figure 5 ‣ Rejecting Conventional Agents ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting") shows the logit density function for the DRL agents in Section [Deep Reinforcement Algorithms with Different Hyperparameters](https://arxiv.org/html/2209.05559v6#Sx5.SSx2.SSSx2 "Deep Reinforcement Algorithms with Different Hyperparameters ‣ Compared Methods and Performance Metrics ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting"). The probabilities of overfitting are: pPPO=8.0%<αp\_{\\text{PPO}}=8.0\\%<\\alpha, pTD3=9.6%<αp\_{\\text{TD3}}=9.6\\%<\\alpha and pSAC=21.3%>αp\_{\\text{SAC}}=21.3\\%>\\alpha. We accept alternative hypothesis ℋ1\\mathcal{H}\_{1} and conclude that SAC is overfitted. Finally, TD3 has a dominant part of the logit distribution at a high logit domain (≈4\\approx 4). High logit values indicate coherence between IS and OOS performance.\
\
Table 2: Selected hyperparameters for each DRL algorithm.\
\
|     |     |     |     |\
| --- | --- | --- | --- |\
| Hyperparameters | PPO | TD3 | SAC |\
| Learning rate | 7.5e-3 | 3e-2 | 1.5e-2 |\
| Batch size | 512 | 3080 | 3080 |\
| Gamma | 0.95 | 0.95 | 0.97 |\
| Net dimension | 1024 | 2048 | 1024 |\
| Target step | 5e4 | 2.5e3 | 2.5e3 |\
| Break step | 4.5e4 | 6e4 | 4.5e4 |\
\
### Backtest Performance\
\
Fig. [6](https://arxiv.org/html/2209.05559v6#Sx5.F6 "Figure 6 ‣ Backtest Performance ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting") and Fig. [7](https://arxiv.org/html/2209.05559v6#Sx5.F7 "Figure 7 ‣ Backtest Performance ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting") show the backtest results. When the CVIX indicator surpasses 9090, the agent stops buying and sells all cryptocurrency holdings. Fig. [6](https://arxiv.org/html/2209.05559v6#Sx5.F6 "Figure 6 ‣ Backtest Performance ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting") and Table [3](https://arxiv.org/html/2209.05559v6#Sx5.T3 "Table 3 ‣ Backtest Performance ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting") compare conventional agents, market benchmarks and our approach. Compared to PPO WF and PPO KCV, our method outperforms the other two agents with at least a 15% increase in the cumulative return. The lower volatility of PPO indicates that our method is more robust to risk. Fig. [7](https://arxiv.org/html/2209.05559v6#Sx5.F7 "Figure 7 ‣ Backtest Performance ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting") and Table [3](https://arxiv.org/html/2209.05559v6#Sx5.T3 "Table 3 ‣ Backtest Performance ‣ Performance Evaluations ‣ Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting") show the backtest results of the DRL agents. The cumulative return of the PPO agent is significantly better (>24%>24\\%) than those of agents TD3 and SAC. Also, in terms of volatility, the PPO agent is superior.\
\
Finally, compared to the benchmarks, the performance of our approach is more excellent in terms of cumulative return and volatility. From our method and experiments, we conclude that the superior agent is PPO.\
\
Table 3: Performance comparison.\
\
|     |     |     |     |     |     |     |     |\
| --- | --- | --- | --- | --- | --- | --- | --- |\
| Metrics ×\\times Method | S&P BDM Index | Equal-weight | PPO WF | PPO KCV | PPO | TD3 | SAC |\
| Cumulative return | −50.78%-50.78\\% | −47.78%-47.78\\% | −49.39%-49.39\\% | −55.54%-55.54\\% | −34.96%-34.96\\% | −59.08%-59.08\\% | −59.48%-59.48\\% |\
| Volatility | 5.81​e−25.81\\mathrm{e}{-2} | 4.19​e−34.19\\mathrm{e}{-3} | 2.79​e−32.79\\mathrm{e}{-3} | 3.49​e−33.49\\mathrm{e}{-3} | 2.01​e−32.01\\mathrm{e}{-3} | 3.51​e−33.51\\mathrm{e}{-3} | 3.78​e−33.78\\mathrm{e}{-3} |\
| Prob. of overfitting pp | - | - | 17.5%17.5\\% | 7.9%7.9\\% | 8.0%8.0\\% | 9.6%9.6\\% | 21.3%21.3\\% |\
\
![Refer to caption](https://arxiv.org/html/2209.05559v6/Images/test_cumulative_return53.png)Figure 6: The average trading cumulative return curves for conventional agents. From 05/01/2022 to 06/27/2022, the initial capital is $1,000,000\\$1,000,000.![Refer to caption](https://arxiv.org/html/2209.05559v6/Images/test_cumulative_return54.png)Figure 7: The average trading cumulative return curves for DRL algorithms. From 05/01/2022 to 06/27/2022, the initial capital is $1,000,000\\$1,000,000.\
\
## Conclusion\
\
In this paper, we have shown the importance of addressing the backtesting overfitting issue in cryptocurrency trading with deep reinforcement learning. Results show that the least overfitting agent PPO (with combinatorial CV method) outperforms the conventional agents (WF and KCV methods), two other DRL agents (TD3 and SAC), and the S&P DBM Index in cumulative return and volatility, showing good robustness.\
\
Future work will be interesting to 1). explore the evolution of the probability of overfitting during training and for different agents; 2). test limit order setting and trade closure; 3). explore large-scale data, such as all currencies corresponding to the S&P BDM index; and 4). consider more features for the state space, including fundamentals and sentiment features.\
\
## References\
\
- Agarwal et al. (2021)\
Agarwal, R.; Schwarzer, M.; Castro, P. S.; Courville, A. C.; and Bellemare, M.\
2021.\
\
Deep reinforcement learning at the edge of the statistical precipice.\
\
_Advances in Neural Information Processing Systems_, 34:\
29304–29320.\
\
- Ang, Morris et al. (2022)\
Ang, A.; Morris, T.; et al. 2022.\
\
Asset Allocation with Crypto: Application of Preferences for Positive\
Skewness.\
\
- Bailey et al. (2016)\
Bailey, D. H.; Borwein, J.; Lopez de Prado, M.; and Zhu, Q. J. 2016.\
\
The probability of backtest overfitting.\
\
_Journal of Computational Finance, forthcoming_.\
\
- Bailey et al. (2014)\
Bailey, D. H.; Borwein, J. M.; de Prado, M. L.; and Zhu, Q. J. 2014.\
\
Pseudomathematics and financial charlatanism: The effects of backtest\
over fitting on out-of-sample performance.\
\
_Notices of the AMS_, 61(5): 458–471.\
\
- Bonaparte (2021)\
Bonaparte, Y. 2021.\
\
Introducing the Cryptocurrency VIX: CVIX.\
\
_SSRN Electronic Journal_, 1–9.\
\
- Bouthillier et al. (2021)\
Bouthillier, X.; Delaunay, P.; Bronzi, M.; Trofimov, A.; Nichyporuk, B.; Szeto,\
J.; Mohammadi Sepahvand, N.; Raff, E.; Madan, K.; Voleti, V.; et al. 2021.\
\
Accounting for variance in machine learning benchmarks.\
\
_Proceedings of Machine Learning and Systems_, 3: 747–769.\
\
- Brockman et al. (2016)\
Brockman, G.; Cheung, V.; Pettersson, L.; Schneider, J.; Schulman, J.; Tang,\
J.; and Zaremba, W. 2016.\
\
OpenAI Gym.\
\
1–4.\
\
- Chan et al. (2019)\
Chan, S. C.; Fishman, S.; Canny, J.; Korattikara, A.; and Guadarrama, S. 2019.\
\
Measuring the reliability of reinforcement learning algorithms.\
\
_arXiv preprint arXiv:1912.05663_.\
\
- Clary et al. (2019)\
Clary, K.; Tosch, E.; Foley, J.; and Jensen, D. 2019.\
\
Let’s play again: variability of deep reinforcement learning agents\
in Atari environments.\
\
_arXiv preprint arXiv:1904.06312_.\
\
- Conrad, Custovic, and Ghysels (2018)\
Conrad, C.; Custovic, A.; and Ghysels, E. 2018.\
\
Long- and short-term Cryptocurrency volatility components: A\
GARCH-MIDAS Analysis.\
\
_Journal of Risk and Financial Management_, 11(2): 23.\
\
- De Prado (2018)\
De Prado, M. L. 2018.\
\
_Advances in financial machine learning_.\
\
John Wiley & Sons.\
\
- Deng et al. (2016)\
Deng, Y.; Bao, F.; Kong, Y.; Ren, Z.; and Dai, Q. 2016.\
\
Deep direct reinforcement learning for financial signal\
representation and trading.\
\
_IEEE Transactions on Neural Networks and Learning Systems_,\
28(3): 653–664.\
\
- Dodge et al. (2020)\
Dodge, J.; Ilharco, G.; Schwartz, R.; Farhadi, A.; Hajishirzi, H.; and Smith,\
N. 2020.\
\
Fine-tuning pretrained language models: Weight initializations, data\
orders, and early stopping.\
\
_arXiv preprint arXiv:2002.06305_.\
\
- Fang et al. (2022)\
Fang, F.; Ventre, C.; Basios, M.; Kanthan, L.; Martinez-Rego, D.; Wu, F.; and\
Li, L. 2022.\
\
Cryptocurrency trading: a comprehensive survey.\
\
_Financial Innovation_, 8(1): 1–59.\
\
- Farokhi and Kaafar (2020)\
Farokhi, F.; and Kaafar, M. A. 2020.\
\
Modelling and quantifying membership information leakage in machine\
learning.\
\
_arXiv preprint arXiv:2001.10648_.\
\
- Fujimoto, Van Hoof, and Meger (2018)\
Fujimoto, S.; Van Hoof, H.; and Meger, D. 2018.\
\
Addressing Function Approximation Error in Actor-Critic Methods.\
\
_35th International Conference on Machine Learning, ICML 2018_,\
4: 2587–2601.\
\
- Gerritsen et al. (2020)\
Gerritsen, D. F.; Bouri, E.; Ramezanifar, E.; and Roubaud, D. 2020.\
\
The profitability of technical trading rules in the Bitcoin market.\
\
_Finance Research Letters_, 34: 101263.\
\
- Gudelek, Boluk, and Ozbayoglu (2017)\
Gudelek, M. U.; Boluk, S. A.; and Ozbayoglu, A. M. 2017.\
\
A deep learning based stock trading model with 2-D CNN trend\
detection.\
\
In _IEEE Symposium Series on Computational Intelligence (SSCI)_,\
1–8. IEEE.\
\
- Haarnoja et al. (2018)\
Haarnoja, T.; Zhou, A.; Hartikainen, K.; Tucker, G.; Ha, S.; Tan, J.; Kumar,\
V.; Zhu, H.; Gupta, A.; Abbeel, P.; et al. 2018.\
\
Soft actor-critic algorithms and applications.\
\
_arXiv preprint arXiv:1812.05905_.\
\
- Hambly, Xu, and Yang (2021)\
Hambly, B.; Xu, R.; and Yang, H. 2021.\
\
Recent advances in reinforcement learning in finance.\
\
_arXiv preprint arXiv:2112.04553_.\
\
- Henderson et al. (2018)\
Henderson, P.; Islam, R.; Bachman, P.; Pineau, J.; Precup, D.; and Meger, D.\
2018.\
\
Deep reinforcement learning that matters.\
\
_32nd AAAI Conference on Artificial Intelligence, AAAI 2018_,\
3207–3214.\
\
- Indices and Methodology (2022)\
Indices, D. J.; and Methodology, I. 2022.\
\
S&P Digital Market Indices Methodology.\
\
(January).\
\
- Jiang and Liang (2017)\
Jiang, Z.; and Liang, J. 2017.\
\
Cryptocurrency portfolio management with deep reinforcement learning.\
\
In _Intelligent Systems Conference (IntelliSys)_, 905–913.\
IEEE.\
\
- Juliani et al. (2018)\
Juliani, A.; Berges, V.-P.; Teng, E.; Cohen, A.; Harper, J.; Elion, C.; Goy,\
C.; Gao, Y.; Henry, H.; Mattar, M.; et al. 2018.\
\
Unity: A general platform for intelligent agents.\
\
_arXiv preprint arXiv:1809.02627_.\
\
- Kuhnle, Schaarschmidt, and Fricke (2017)\
Kuhnle, A.; Schaarschmidt, M.; and Fricke, K. 2017.\
\
Tensorforce: a TensorFlow library for applied reinforcement learning.\
\
Web page.\
\
- Li et al. (2019)\
Li, X.; Li, Y.; Zhan, Y.; and Liu, X.-Y. 2019.\
\
Optimistic bull or pessimistic bear: Adaptive deep reinforcement\
learning for stock portfolio allocation.\
\
_arXiv preprint arXiv:1907.01503_.\
\
- Li et al. (2021)\
Li, Z.; Liu, X.-Y.; Zheng, J.; Wang, Z.; Walid, A.; and Guo, J. 2021.\
\
FinRL-Podracer: High performance and scalable deep reinforcement\
learning for quantitative finance.\
\
In _Proceedings of the Second ACM International Conference on AI_\
_in Finance_, 1–9.\
\
- Liang et al. (2018)\
Liang, E.; Liaw, R.; Nishihara, R.; Moritz, P.; Fox, R.; Goldberg, K.;\
Gonzalez, J.; Jordan, M.; and Stoica, I. 2018.\
\
RLlib: Abstractions for distributed reinforcement learning.\
\
In _International Conference on Machine Learning_, 3053–3062.\
PMLR.\
\
- Liaw et al. (2018)\
Liaw, R.; Liang, E.; Nishihara, R.; Moritz, P.; Gonzalez, J. E.; and Stoica, I.\
2018.\
\
Tune: A research platform for distributed model selection and\
training.\
\
_arXiv preprint arXiv:1807.05118_.\
\
- Lin et al. (2021)\
Lin, J.; Campos, D.; Craswell, N.; Mitra, B.; and Yilmaz, E. 2021.\
\
Significant improvements over the state of the art? A case study of\
the ms marco document ranking leaderboard.\
\
In _Proceedings of the 44th International ACM SIGIR Conference_\
_on Research and Development in Information Retrieval_, 2283–2287.\
\
- Liu et al. (2021a)\
Liu, X.-Y.; Li, Z.; Yang, Z.; Zheng, J.; Wang, Z.; Walid, A.; Guo, J.; and\
Jordan, M. I. 2021a.\
\
ElegantRL-Podracer: Scalable and elastic library for cloud-native\
deep reinforcement learning.\
\
_Workshop on Deep Reinforcement Learning, NeurIPS_.\
\
- Liu et al. (2022)\
Liu, X.-Y.; Xia, Z.; Rui, J.; Gao, J.; Yang, H.; Zhu, M.; Wang, C. D.; Wang,\
Z.; and Guo, J. 2022.\
\
FinRL-Meta: Market environments and benchmarks for data-driven\
financial reinforcement learning.\
\
_Thirty-sixth Conference on Neural Information Processing_\
_Systems Datasets and Benchmarks Track_.\
\
- Liu et al. (2018)\
Liu, X.-Y.; Xiong, Z.; Zhong, S.; Yang, H.; and Walid, A. 2018.\
\
Practical deep reinforcement learning approach for stock trading.\
\
_NeurIPS Workshop on Challenges and Opportunities for AI in_\
_Financial Services_.\
\
- Liu et al. (2021b)\
Liu, X.-Y.; Yang, H.; Gao, J.; and Wang, C. D. 2021b.\
\
FinRL: Deep reinforcement learning framework to automate trading in\
quantitative finance.\
\
In _Proceedings of the Second ACM International Conference on AI_\
_in Finance_, 1–9.\
\
- Liu and Tsyvinski (2021)\
Liu, Y.; and Tsyvinski, A. 2021.\
\
Risks and returns of cryptocurrency.\
\
_The Review of Financial Studies_, 34(6): 2689–2727.\
\
- Mania, Guy, and Recht (2018)\
Mania, H.; Guy, A.; and Recht, B. 2018.\
\
Simple random search provides a competitive approach to reinforcement\
learning.\
\
_arXiv preprint arXiv:1803.07055_.\
\
- Moody and Saffell (2001)\
Moody, J.; and Saffell, M. 2001.\
\
Learning to trade via direct reinforcement.\
\
_IEEE Transactions on Neural Networks_, 12(4): 875–889.\
\
- Nava, Di Matteo, and Aste (2016)\
Nava, N.; Di Matteo, T.; and Aste, T. 2016.\
\
Time-dependent scaling patterns in high frequency financial data.\
\
_The European Physical Journal Special Topics_, 225(10):\
1997–2016.\
\
- Neyman and Pearson (1933)\
Neyman, J.; and Pearson, E. S. 1933.\
\
The testing of statistical hypotheses in relation to probabilities a\
priori.\
\
In _Mathematical proceedings of the Cambridge philosophical_\
_society_, volume 29, 492–510. Cambridge University Press.\
\
- Ni and Yin (2009)\
Ni, H.; and Yin, H. 2009.\
\
Exchange rate prediction using hybrid neural networks and trading\
indicators.\
\
_Neurocomputing_, 72(13-15): 2815–2823.\
\
- Park, Sim, and Choi (2020)\
Park, H.; Sim, M. K.; and Choi, D. G. 2020.\
\
An intelligent financial portfolio trading strategy using deep\
Q-learning.\
\
_Expert Systems with Applications_, 158: 113573.\
\
- Raffin et al. (2021)\
Raffin, A.; Hill, A.; Gleave, A.; Kanervisto, A.; Ernestus, M.; and Dormann, N.\
2021.\
\
Stable-baselines3: Reliable reinforcement learning implementations.\
\
_Journal of Machine Learning Research_.\
\
- Robinson and Sims (1994)\
Robinson, P.; and Sims, C. 1994.\
\
Time series with strong dependence.\
\
In _Advances in Econometrics, sixth World Congress_, volume 1,\
47–95.\
\
- Schulman et al. (2017)\
Schulman, J.; Wolski, F.; Dhariwal, P.; Radford, A.; and Klimov, O. 2017.\
\
Proximal policy optimization algorithms.\
\
_arXiv preprint arXiv:1707.06347_.\
\
- Varoquaux and Cheplygina (2021)\
Varoquaux, G.; and Cheplygina, V. 2021.\
\
How I failed machine learning in medical imaging–shortcomings and\
recommendations.\
\
_arXiv preprint arXiv:2103.10292_.\
\
- Yang et al. (2020)\
Yang, H.; Liu, X.-Y.; Zhong, S.; and Walid, A. 2020.\
\
Deep reinforcement learning for automated stock trading: An ensemble\
strategy.\
\
In _Proceedings of the First ACM International Conference on AI_\
_in Finance_, 1–8.\
\
- Yang et al. (2019)\
Yang, L.; Liu, X.-Y.; Li, X.; and Li, Y. 2019.\
\
Price prediction of cryptocurrency: an empirical study.\
\
In _International Conference on Smart Blockchain (SmartBlock)_,\
130–139. Springer.\
\
- Zhang, Zohren, and Roberts (2020)\
Zhang, Z.; Zohren, S.; and Roberts, S. 2020.\
\
Deep reinforcement learning for trading.\
\
_The Journal of Financial Data Science_, 2(2): 25–40.