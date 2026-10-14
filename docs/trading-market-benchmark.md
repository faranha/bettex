# BETTEX — benchmark de mercado para a lógica dos agentes

**Fontes citadas:** 22  
**Data-base:** 14 de outubro de 2026  
**Estado:** referência de pesquisa e propostas de especificação; sem implementação ou aprovação de parâmetros

## 1. Alcance e relação com as regras

Esta pesquisa compara bots, frameworks, agentes de IA e ferramentas de ordens para informar a lógica da BETTEX. **Não escolhe tecnologia, rede, modelo, fornecedor ou plataforma.** Não modifica o demo visual, a homepage, o Pitch, o mandato ou as permissões.

O mandato continua BTC/ETH/SOL spot, sem alavancagem, priorizando investigação DEX/on-chain. A [lógica de análise e decisão](trading-decision-logic.md), o [pacote único de investimento](trading-proposal-contract.md) e os [relatórios por ciclo](trading-cycle-reports.md) conservam suas funções. Os números já propostos nesses documentos não foram validados por esta pesquisa.

O [relatório completo](../research/crypto-trading-benchmark/report.md) apresenta as 25 referências, catálogo de estratégias, estudos, contradições e limitações. O [registro de fontes](../research/crypto-trading-benchmark/sources.json) e as [notas da pesquisa](../research/crypto-trading-benchmark/notes.md) preservam a trilha. “25 referências” inclui módulos e mecanismos, não 25 empresas equivalentes ou bots aprovados.

## 2. O que existe no mercado

| Classe | Referências pesquisadas | O que informa |
|---|---|---|
| Frameworks operacionais | Freqtrade, Hummingbot, Jesse, LEAN, OctoBot | Separação de componentes, testes, execução e relatórios; sem ranking de desempenho |
| Produtos comerciais | Binance, OKX, Pionex, KuCoin, 3Commas, Cryptohopper, Bitsgap, Coinrule, Gunbot | Grade, DCA, sinais, configurações e formas de apresentar resultados |
| Ordens e mecanismos on-chain | Jupiter Trigger, CoW TWAP e LP concentrada Uniswap | Condições de execução, custódia, inventário e limites por versão |
| Modelos e agentes | FreqAI, FinRL, TradingAgents, FinMem, Alpha Arena | Previsão, aprendizado, memória, debate e limites dos experimentos |
| Ferramentas de ação | AgentKit, GOAT e plugins ElizaOS | Composição com carteiras e ações; isso não fornece automaticamente estratégia ou controle financeiro |

A matriz e as fontes de cada item estão no relatório completo. A cobertura é representativa e muitas descrições são declarações de fonte única do fornecedor, não funcionamento reproduzido. FreqAI é módulo do Freqtrade; Uniswap LP é mecanismo de liquidez, não bot direcional. [[1]](https://docs.freqtrade.io/en/2026.7/freqai/) [[2]](https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity) AgentKit documenta ferramentas sem limites de gasto, destinos permitidos ou aprovação humana obrigatória embutidos. [[3]](https://github.com/coinbase/agentkit)

## 3. Comparações que a BETTEX não deve confundir

**Automação não prova inteligência nem retorno.** Hummingbot documenta a separação controlador/executor. [[4]](https://hummingbot.org/strategies/v2-strategies/controllers) TradingAgents distribui análise, debate e risco, mas seu paper avalia ações em simulação histórica, não BTC/ETH/SOL produtivo. [[5]](https://arxiv.org/html/2412.20138v5) Um estudo DRL que inclui esses três ativos apresenta retornos acumulados negativos em todos os métodos da tabela examinada, apesar da vantagem relativa do agente escolhido. [[6]](https://arxiv.org/html/2209.05559v6)

**Previsão não é proposta completa.** FreqAI documenta modelos e retreinamento, mas avisa que a estratégia-exemplo não serve para produção. [[1]](https://docs.freqtrade.io/en/2026.7/freqai/) Para a BETTEX, o especialista continua responsável por entregar entrada, saída, invalidação, duração, tamanho, risco e evidência, não apenas uma direção prevista.

**Técnica de execução não é tese de investimento.** TWAP divide uma intenção já tomada; a proteção de preço pode impedir o preenchimento. [[7]](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders) A documentação Jupiter V2 descreve ordens condicionais, preenchimentos parciais e vault custodial por Privy. [[8]](https://developers.jup.ag/docs/trigger) Priorizar execução on-chain não equivale a aprovar custódia, rede ou ausência de componentes off-chain.

## 4. Famílias de estratégia

Continuam como hipóteses direcionais: tendência com correção, rompimento, reversão à média e rotação long-only por força relativa. O benchmark não seleciona uma vencedora. O estudo NBER histórico descreve momentum em BTC/Ripple/ETH. [[9]](https://www.nber.org/papers/w24877) A pesquisa de 2026 sobre sobreviventes mostra dependência de amostra, custos e seleção retrospectiva. [[10]](https://www.sciencedirect.com/science/article/pii/S1544612326001339) O experimento DRL tem outra janela e ignora slippage. [[6]](https://arxiv.org/html/2209.05559v6) Nenhum dos três certifica nossos alvos ou durações.

| Família adicional | Tratamento proposto na especificação |
|---|---|
| Acumulação periódica | Separar finalidade de acumular da tese de um trade com prazo |
| DCA condicionado à queda/averaging | Declarar orçamento máximo, reserva futura, exposição e encerramento; não chamar tudo de compra periódica |
| Grid | Avaliar faixa, inventário restante, perdas não realizadas, custos e cenário fora da faixa |
| Market making e arbitragem | Investigações próprias; não inserir automaticamente no pacote direcional |
| ML, LLM e reforço | Métodos para produzir análise ou decisão; não dispensam instrumento elegível, proposta e controles |
| TWAP | Método de execução, não fonte autônoma de vantagem econômica |
| LP e derivativos | Não importar para o mandato spot direcional; exigem escopo e regras próprios |

A distinção entre compra periódica e averaging é material: o Spot DCA OKX documenta multiplicadores e compras na queda, com capital reservado. [[11]](https://www.okx.com/en-us/help/whats-the-spot-dca-bot-and-how-to-use-it) Grid tem regras de faixa e estoque, enquanto a posição LP tem estrutura própria. [[12]](https://www.binance.com/en/support/faq/what-is-spot-grid-trading-and-how-does-it-work-d5f441e8ab544a5b98241e00efb3a4ab) [[2]](https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity) Os demais tratamentos da tabela são recomendações analíticas, não funcionalidades aprovadas.

## 5. Aprendizados para proposta, fila e decisão

As linhas abaixo são **propostas de refinamento**, sem substituir o contrato atual ou criar limites numéricos novos.

| Etapa | Refinamento proposto | Motivo/evidência |
|---|---|---|
| Identificar instrumento | Ativo, representação, cotação, mercado elegível, tamanho e data da evidência | WBTC/cbBTC/tBTC descrevem arranjos distintos; ticker não identifica risco. [[13]](https://docs.wbtc.network/how-wbtc-works/mint-burn-mechanism) [[14]](https://www.coinbase.com/en-gb/cbbtc) [[15]](https://www.threshold.network/blog/august-2026-recap-tbtc-verifiable-bitcoin) |
| Qualificar tese | Regime permitido, condição observável, invalidação, prazos e definição fixa da estratégia | Evitar aplicar resultado de uma amostra a outra sem teste. [[10]](https://www.sciencedirect.com/science/article/pii/S1544612326001339) |
| Dimensionar | Somar exposição existente, compras condicionais e capital reservado | Averaging pode consumir capital ainda não aplicado. [[11]](https://www.okx.com/en-us/help/whats-the-spot-dca-bot-and-how-to-use-it) |
| Comparar | Retorno líquido, risco, correlação, possibilidade de saída e alternativa de aguardar | Melhor resultado relativo pode continuar sendo prejuízo. [[6]](https://arxiv.org/html/2209.05559v6) |
| Separar autorização | Acesso a ferramenta não cria permissão; preservar controles independentes | AgentKit explicita controles não embutidos; IOSCO trata validação e governança como referências de supervisão. [[3]](https://github.com/coinbase/agentkit) [[16]](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD823.pdf) |
| Acompanhar execução | Intenção, tentativa, preenchimento, restante, cancelamento, expiração, falha e reconciliação | Não presumir execução integral nem saída garantida. [[8]](https://developers.jup.ag/docs/trigger) [[7]](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders) |

Risco e Tesouraria continuam alimentando e limitando a decisão conforme sua autoridade existente; não são substituídos pelo “risk agent” de um exemplo externo. A BETTEX não deve preencher termos ausentes nem converter várias estratégias correlacionadas no mesmo ativo em capital independente.

## 6. Aprendizados para os relatórios

**Resultado da posição inteira.** A página de estatísticas Grid 3Commas distingue realizado e não realizado, taxas e períodos. [[17]](https://help.3commas.io/en/articles/11388471-grid-bot-statistics-page) A consequência contábil proposta é mostrar também inventário, patrimônio e movimentações: vendas lucrativas não demonstram lucro total se o estoque restante perdeu mais.

**Histórico sem reinício financeiro.** A mesma documentação informa reinício de estatísticas de lucro após mudanças de configuração. [[17]](https://help.3commas.io/en/articles/11388471-grid-bot-statistics-page) BETTEX deve preservar versões, momento e razão da alteração sem apagar o histórico consolidado ou criar outro investimento artificialmente.

**Experimento não é ciclo financeiro.** Backtest, teste fora da amostra, paper/dry-run e execução real devem ser tipos de evidência distintos. Freqtrade explicita hipóteses de simulação e limites do backtest. [[18]](https://docs.freqtrade.io/en/2026.3/backtesting) Um experimento pode sustentar uma proposta por vínculo consultável, mas seu resultado não entra na apuração como lucro real.

**Continuidade.** O [documento de relatórios](trading-cycle-reports.md) mantém a posição através de ciclos, separa realizado/não realizado e evita dupla contagem. A pesquisa complementa a origem das evidências e a preservação de parâmetros; não muda o ciclo das 16h em São Paulo nem cria novos relógios financeiros.

## 7. Como avaliar as hipóteses antes de aprovar números

Proposta de protocolo, ainda sem execução:

1. Congelar a definição de estratégia, regime, entrada, saída e universo disponível em cada data.
2. Registrar dados, versão de modelo/prompt/memória quando houver, parâmetros e número de variantes experimentadas.
3. Separar treino, validação e teste não visto; não ajustar o método olhando o teste final.
4. Simular custos de ida e volta, tamanho, liquidez de saída, slippage, falhas e limitações da rota; documentar o que não foi modelado.
5. Comparar resultado líquido, exposição, perdas, estabilidade entre regimes e alternativas na mesma janela, incluindo não operar.
6. Preservar resultados ruins e razões de rejeição; separar a pesquisa de qualquer autorização futura.

O estudo DRL aborda overfitting, mas ignora slippage. [[6]](https://arxiv.org/html/2209.05559v6) O estudo Uniswap v3 mede custos em pools específicos e não fornece uma tabela universal atual. [[19]](https://arxiv.org/html/2309.13648v2) O artigo de sobrevivência alerta sobre escolhas retrospectivas e sensibilidade a custos. [[10]](https://www.sciencedirect.com/science/article/pii/S1544612326001339) Essas limitações justificam o protocolo; não aprovam uma ferramenta de validação ou um valor mínimo de retorno.

## 8. Limites e pontos em aberto

Não há neste levantamento comparação independente suficiente para ordenar todos os produtos por retorno líquido atual em BTC/ETH/SOL spot on-chain. Não foram confirmados suporte por par/rede/região/conta, custos atuais, liquidez por tamanho, reservas, segurança de carteira ou execução em estresse. Excertos não equivalem a leitura integral.

Jupiter V1/V2 explica parte da aparente divergência de preenchimentos parciais. [[8]](https://developers.jup.ag/docs/trigger) CoW permanece com divergência documental: página TWAP exige Safe, enquanto recap oficial anuncia EOA; não houve teste de suporte. [[7]](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders) [[20]](https://cow.fi/learn/cow-dao-monthly-recap-september-2026) GOAT foi consultado como snapshot marcado arquivado. [[21]](https://github.com/goat-sdk/goat/blob/main/README.md) Alpha Arena permanece caso divulgado sem auditoria comparável nesta coleta. [[22]](https://www.kucoin.com/news/flash/nof1-s-alpha-arena-pits-ai-models-in-live-trading-backed-by-sui-group-and-karatage)

O toolkit IOSCO é não vinculante e não determina sozinho obrigações legais BETTEX. [[16]](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD823.pdf) Pesquisa histórica, declaração de fornecedor, hipótese analítica e evidência operacional devem continuar identificadas separadamente.

**Efeito desta revisão:** acrescentar benchmark e critérios de avaliação. **Sem efeito:** aprovar parâmetros, implementar agentes, escolher infraestrutura, alterar receitas/governança ou ativar dinheiro e operações no demo.

## Fontes citadas

1. [Introduction - Freqtrade](https://docs.freqtrade.io/en/2026.7/freqai/) — Publicação/atualização: 2026-07 (versão da documentação); Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/ai-01-freqai-docs.md). Consulta: 14/10/2026.
2. [Concentrated Liquidity | Uniswap Developers](https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity) — Publicação/atualização: não informada; Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/onchain-2-uniswap-range.md). Consulta: 14/10/2026.
3. [Coinbase AgentKit — repositório oficial](https://github.com/coinbase/agentkit) — Publicação/atualização: não informada; Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/main-agentkit-repository.md). Consulta: 14/10/2026.
4. [Controllers - Hummingbot](https://hummingbot.org/strategies/v2-strategies/controllers) — Publicação/atualização: não informada; Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/open-02-hummingbot-v2-controllers.md). Consulta: 14/10/2026.
5. [TradingAgents: Multi-Agents LLM Financial Trading Framework](https://arxiv.org/html/2412.20138v5) — Publicação/atualização: 2025-03-02; Tier 1; [página arquivada](../research/crypto-trading-benchmark/sources/ai-02-tradingagents-paper.md). Consulta: 14/10/2026.
6. [Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting](https://arxiv.org/html/2209.05559v6) — Publicação/atualização: 2023-01-31 (versão v6); Tier 1; [página arquivada](../research/crypto-trading-benchmark/sources/gap-eval-01-drl-crypto-overfit.md). Consulta: 14/10/2026.
7. [TWAP orders | CoW Protocol Documentation](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders) — Publicação/atualização: não informada; Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/onchain-3-cow-twap.md). Consulta: 14/10/2026.
8. [Trigger Order API Overview - Jupiter Developers](https://developers.jup.ag/docs/trigger) — Publicação/atualização: não informada; Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/onchain-1-jupiter-trigger.md). Consulta: 14/10/2026.
9. [Risks and Returns of Cryptocurrency](https://www.nber.org/papers/w24877) — Publicação/atualização: 2018-08 (working paper; versão publicada em periódico em 2021); Tier 1; [página arquivada](../research/crypto-trading-benchmark/sources/gap-eval-02-liu-tsyvinski.md). Consulta: 14/10/2026.
10. [On survivor cryptocurrency momentum](https://www.sciencedirect.com/science/article/pii/S1544612326001339) — Publicação/atualização: 2026-03; Tier 1; [página arquivada](../research/crypto-trading-benchmark/sources/gap-eval-03-survivor-momentum-2026.md). Consulta: 14/10/2026.
11. [What's the Spot DCA bot and how do I use it? | OKX United States](https://www.okx.com/en-us/help/whats-the-spot-dca-bot-and-how-to-use-it) — Publicação/atualização: 2026-08-27 (atualizada; publicada 2025-10-03); Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/commercial-01-okx-spot-dca.md). Consulta: 14/10/2026.
12. [What Is Spot Grid Trading and How Does It Work? | Binance](https://www.binance.com/en/support/faq/what-is-spot-grid-trading-and-how-does-it-work-d5f441e8ab544a5b98241e00efb3a4ab) — Publicação/atualização: 2026-08-13 (atualizada; publicada 2022-01-06); Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/commercial-02-binance-spot-grid.md). Consulta: 14/10/2026.
13. [Mint/Burn Mechanism - WBTC Docs](https://docs.wbtc.network/how-wbtc-works/mint-burn-mechanism) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](../research/crypto-trading-benchmark/sources/onchain-snippets.md). Consulta: 14/10/2026.
14. [Coinbase cbBTC](https://www.coinbase.com/en-gb/cbbtc) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](../research/crypto-trading-benchmark/sources/onchain-snippets.md). Consulta: 14/10/2026.
15. [August 2026 Recap: Securing the Next Phase of tBTC](https://www.threshold.network/blog/august-2026-recap-tbtc-verifiable-bitcoin) — Publicação/atualização: 2026-08 (dia não informado); Tier 3; [excerto arquivado](../research/crypto-trading-benchmark/sources/onchain-snippets.md). Consulta: 14/10/2026.
16. [FR/02/2026 Supervisory Toolkit for AI Use in Capital Markets](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD823.pdf) — Publicação/atualização: 2026 (dia exato não confirmado no texto arquivado); Tier 1; [página arquivada](../research/crypto-trading-benchmark/sources/ai-03-iosco-toolkit.md). Consulta: 14/10/2026.
17. [Grid Bot: Statistics Page | 3Commas Help Center](https://help.3commas.io/en/articles/11388471-grid-bot-statistics-page) — Publicação/atualização: 2026-07-31; Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/commercial-03-3commas-grid-reporting.md). Consulta: 14/10/2026.
18. [Backtesting - Freqtrade](https://docs.freqtrade.io/en/2026.3/backtesting) — Publicação/atualização: não informada; Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/open-01-freqtrade-backtesting.md). Consulta: 14/10/2026.
19. [Don’t Let MEV Slip: The Costs of Swapping on the Uniswap Protocol](https://arxiv.org/html/2309.13648v2) — Publicação/atualização: 2023 (arXiv v2; dataset Jan–Aug 2023); Tier 1; [página arquivada](../research/crypto-trading-benchmark/sources/validation-02-uniswap-mev-slippage.md). Consulta: 14/10/2026.
20. [CoW DAO Monthly Recap: September 2026](https://cow.fi/learn/cow-dao-monthly-recap-september-2026) — Publicação/atualização: 2026-10-05; Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/gap-tools-03-cow-september-2026.md). Consulta: 14/10/2026.
21. [goat-sdk/goat README](https://github.com/goat-sdk/goat/blob/main/README.md) — Publicação/atualização: não informada; Tier 3; [página arquivada](../research/crypto-trading-benchmark/sources/gap-tools-02-goat-toolkit-readme.md). Consulta: 14/10/2026.
22. [Nof1's Alpha Arena Pits AI Models in Live Trading, Backed by SUI Group and Karatage](https://www.kucoin.com/news/flash/nof1-s-alpha-arena-pits-ai-models-in-live-trading-backed-by-sui-group-and-karatage) — Publicação/atualização: 2026-05-15; Tier 3; [excerto arquivado](../research/crypto-trading-benchmark/sources/ai-snippets.md). Consulta: 14/10/2026.
