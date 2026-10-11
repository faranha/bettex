---

Os títulos dos mercados e as mensagens recebidas da fonte também devem aparecer
no idioma selecionado, não apenas os controles do painel. Não repetir o título
original em inglês dentro da interface em português ou espanhol.

**Why:** O criador reiterou: “tudo tem que ser traduzido amigo, veja, tem coisas
em ingles aqui”, apontando a pergunta do mercado e sua repetição em inglês.

**How to apply:** Traduzir a condição sem alterar ativo, limiar, direção,
prazo, identificadores, preços ou link da fonte. Manter nomes próprios como
Polymarket e Ethereum. Falhas de tradução devem ser explícitas no idioma
selecionado, nunca uma troca silenciosa para inglês ou um evento inventado.
name: Polymarket market-data source
description: Distinguishes documentation tools, market-data APIs, execution, and provider settlement from BETTEX wallets.
---

The official Polymarket MCP is scoped to searching and reading their documentation; it does not supply current market prices or execute trades. The public Gamma API is the documented source for discovering markets and their metadata. Do not present data from Gamma as though it came through the MCP, and do not imply simulated PREDIX operations are real trades.

**Why:** A request for realistic Polymarket-based sample trades specifically mentioned the MCP. The provider's published MCP description limits it to documentation, while its API overview identifies Gamma as the market-data service. The alternative data source was offered, but the source choice was not confirmed.

**How to apply:** If adding live market context to a demonstration, first agree on Gamma or another named source with the user. Distinguish real public market facts from invented transaction sizes, balances, and results, and label any examples as simulated.

Treat the execution API and its settlement network/asset as independent of BETTEX's USDC and Arbitrum wallet model. Verify current provider documentation before connecting funds; do not infer execution capability from a documentation MCP.

**Why:** The provider's trading guide describes CLOB orders and settlement on a different network, with its own settlement asset. BETTEX's accounting currency does not determine a market platform's settlement mechanics.

**How to apply:** Start with https://docs.polymarket.com/llms.txt when old documentation paths fail. Verify trading, signing, settlement and conversion separately before implementing any real connector.