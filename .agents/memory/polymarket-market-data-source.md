---
name: Polymarket market-data source
description: Distinguishes the official documentation MCP from the public market-data API for BETTEX simulations.
---

The official Polymarket MCP is scoped to searching and reading their documentation; it does not supply current market prices or execute trades. The public Gamma API is the documented source for discovering markets and their metadata. Do not present data from Gamma as though it came through the MCP, and do not imply simulated PREDIX operations are real trades.

**Why:** A request for realistic Polymarket-based sample trades specifically mentioned the MCP. The provider's published MCP description limits it to documentation, while its API overview identifies Gamma as the market-data service. The alternative data source was offered, but the source choice was not confirmed.

**How to apply:** If adding live market context to a demonstration, first agree on Gamma or another named source with the user. Distinguish real public market facts from invented transaction sizes, balances, and results, and label any examples as simulated.