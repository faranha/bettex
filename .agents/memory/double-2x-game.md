---
name: Double 2X game
description: Creator's rules for the red/black game attached to the earnings wallet.
---

Add a Double 2X icon with two cards, one red and one black, in the earnings wallet. Players open the game and choose red or black to double their reward balance. The game is on-chain and needs its own history.

Correct choices double the earnings-wallet balance, paid from the treasury. Losing choices deduct the played balance and send it to the treasury. RTP is 100%. Players may play once every 24 hours, not once per calendar day.

**Why:** The creator explicitly requested these mechanics and placement.

**How to apply:** Preserve these rules when implementing the game and its history. Use on-chain settlement when test gas is available; the creator subsequently authorized the explicit simulation fallback below.

The creator selected public Arbitrum Sepolia with test tokens, not real-money mainnet play.

**Why:** The creator explicitly selected this network and funding scope.

**How to apply:** Keep real-money and native-protocol balances isolated. The ALFA game mirrors simulated received earnings into a separate test-token escrow; an explicit later scope change is needed to move other balances.

Sponsor oracle fees and gas separately from the player's stake. Public randomness must determine the result, not the app server. Preserve the confirmed stake when received earnings change before submission.

**Why:** A 100% RTP game requires unbiased outcomes and no game fee; balance growth during confirmation must not increase the amount risked without renewed consent.

**How to apply:** Require public oracle settlement evidence before crediting an on-chain result, and reject stale-balance consent rather than silently wagering a larger balance. Explicitly simulated plays do not claim oracle evidence.

Verify test ETH after actual game execution, not only after deployment. Reserve enough for both the oracle fee and the requesting transaction; keep the existing public activity writer funded separately.

**Why:** The first publicly settled game passed, but its combined native costs left the game below the next-play threshold even though initial deployment funding had looked sufficient.

**How to apply:** Account for ongoing randomness costs and replenish only test ETH. An Ethereum Sepolia bridge receipt does not yet prove the deposit is available on Arbitrum Sepolia.

Use a mock game when sponsored test gas is unavailable. Clearly distinguish simulation from on-chain plays; do not invent transaction hashes or replace a signed/pending blockchain transaction with a simulated outcome. Keep the earnings stake, 50/50 result, treasury accounting and rolling 24-hour limit.

**Why:** The creator explicitly requested “make this mock if we dont have gas” after the gas warning blocked the demo.

**How to apply:** This changes the prior prohibition on mock outcomes only for the no-test-gas fallback, using simulated ALFA earnings and never native or real-money wallets.
