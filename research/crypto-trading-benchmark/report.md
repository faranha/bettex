# Bots e agentes de trading cripto — benchmark para a BETTEX

**Fontes citadas:** 55  
**Data da pesquisa:** 14 de outubro de 2026  
**Profundidade:** pesquisa ampla, com revisão de evidências e duas frentes de aprofundamento  
**Mandato considerado:** BTC, ETH e SOL spot, sem alavancagem; prioridade de pesquisa DEX/on-chain  
**Estado:** referência de lógica e avaliação; não é escolha tecnológica, recomendação de investimento ou autorização de operação

## Resumo executivo

O mercado pesquisado reúne produtos de naturezas diferentes. Hummingbot documenta controladores que produzem ações para executores; FreqAI documenta treinamento e retreinamento de modelos; TradingAgents estuda debate entre agentes especializados. Essas três referências não entregam a mesma função nem constituem um ranking de rentabilidade. [[1]](https://hummingbot.org/strategies/v2-strategies/controllers) [[2]](https://docs.freqtrade.io/en/2026.7/freqai/) [[3]](https://arxiv.org/html/2412.20138v5) O panorama abaixo compara **25 referências de produtos, frameworks, módulos, experimentos e ferramentas**, não 25 empresas ou alternativas equivalentes.

A conclusão mais importante é metodológica: **automação, capacidade de enviar ordens e resultado positivo são três coisas distintas**. Um estudo de aprendizado por reforço que inclui BTC, ETH e SOL apresenta vantagem relativa de seu agente selecionado, mas todos os resultados acumulados da tabela comparativa são negativos na janela histórica examinada. [[4]](https://arxiv.org/html/2209.05559v6) Uma pesquisa de 2026 sobre momentum encontra sensibilidade ao universo, à seleção posterior da amostra e aos custos. [[5]](https://www.sciencedirect.com/science/article/pii/S1544612326001339) A documentação do próprio Freqtrade adverte que backtesting não substitui dry-run nem garante desempenho futuro. [[6]](https://docs.freqtrade.io/en/2026.3/backtesting)

Para a BETTEX, a contribuição prática é melhorar a lógica: cada subagente deve entregar uma tese completa; a comparação deve considerar exposição agregada, custos e possibilidade de saída; execução deve ter estado próprio; relatórios devem preservar a posição inteira, inclusive perdas não realizadas e mudanças de parâmetros. São recomendações desta pesquisa, não funcionalidades implementadas. Nenhuma referência aprova os alvos, prazos, limites ou quantidades dos rascunhos atuais.

## 1. Escopo, método e força das evidências

O levantamento cobre frameworks abertos, bots comerciais, mecanismos de ordens on-chain, modelos de previsão, agentes de análise e ferramentas de carteira. É uma amostra representativa, não um censo de tudo que existe. Não foram contratados produtos, conectadas carteiras, executados bots ou reproduzidos experimentos.

A pesquisa começou em cinco áreas e recebeu dois aprofundamentos: validade de estratégias e diferenças entre agentes, ferramentas e ordens on-chain. Páginas e excertos foram arquivados em `sources/`; o registro `sources.json` distingue URL, publicação conhecida, data de consulta, categoria e tipo de evidência. O número no cabeçalho da versão final corresponde às fontes efetivamente citadas, não a todos os resultados de busca.

| Categoria | O que sustenta | O que não sustenta |
|---|---|---|
| Documentação ou repositório do fornecedor | Funcionalidade e limitação declaradas na versão consultada | Funcionamento reproduzido por nós, segurança ou rentabilidade independente |
| Artigo ou preprint | Método e resultado do experimento descrito | Generalização para outro ativo, período, instrumento ou execução real |
| Autoridade ou organismo de supervisão | Orientação dentro de seu próprio escopo | Obrigação jurídica automática para BETTEX ou validação de estratégia |
| Excerto de busca | Somente a afirmação que aparece no excerto salvo | Detalhes ausentes da página, suporte atual ou revisão integral |

**Tier 1** identifica origem acadêmica, regulatória ou multilateral; não significa que um preprint passou por revisão por pares. **Tier 2** identifica publicação ou análise secundária; **Tier 3**, conteúdo de projeto, fornecedor ou promoção. Uma fonte primária de produto pode ser adequada para descrever sua própria interface, mas não é avaliação independente de eficácia. Comunicados distribuídos por agências continuam sendo declarações do emissor.

As características individuais nas matrizes são, em geral, **relatos de fonte única**, explicitamente atribuídos, não constatações de funcionamento testado. As conclusões transversais são confrontadas com documentação, pesquisa quantitativa e estudos de agentes. Onde faltou confirmação, a limitação foi preservada. Publicações anteriores a 14 de abril de 2025 são referências históricas, não evidência atual de mercado; consulta recente não atualiza a idade do experimento.

## 2. Panorama comparativo

### 2.1 Frameworks abertos: como organizam o trabalho

| Referência | Estrutura ou capacidade documentada | Utilidade como benchmark da lógica | Limite da evidência |
|---|---|---|---|
| Freqtrade | Estratégias, backtests com taxas e hipóteses de execução, relatórios e exportação; diagnóstico de lookahead separado | Registrar premissas do teste e resultados por operação | Documentação de software; o diagnóstico não elimina todo viés nem prova alpha. [[6]](https://docs.freqtrade.io/en/2026.3/backtesting) [[7]](https://www.freqtrade.io/en/stable/lookahead-analysis/) |
| Hummingbot | Controladores consomem dados e emitem ações; executores cuidam do ciclo de ordens; Gateway padroniza interações DEX/blockchain | Separar tese, instrução e execução acompanhável | Suporte genérico não confirma o par, a rede ou a elegibilidade do caso BETTEX. [[1]](https://hummingbot.org/strategies/v2-strategies/controllers) [[8]](https://hummingbot.org/strategies/v2-strategies/executors) [[9]](https://hummingbot.org/gateway) |
| Jesse | Adaptadores spot/derivativos e estatísticas de backtest; documentação distingue spot sem venda a descoberto | Não avaliar apenas lucro líquido; tornar o modo do instrumento explícito | Cobertura examinada por excertos; exemplos de derivativos não autorizam presumir os mesmos recursos no spot. [[10]](https://docs.jesse.trade/docs/supported-exchanges/) [[11]](https://docs.jesse.trade/docs/strategies/futures-vs-spot) [[12]](https://docs.jesse.trade/docs/backtest/results) |
| LEAN/QuantConnect | Modelo de risco pode alterar alvos de carteira antes da execução; armazenamento de resultados de backtest | Risco e execução não precisam ficar misturados ao gerador do sinal | Evidência por excertos; multiativo não confirma disponibilidade BTC/ETH/SOL ou operação DEX. [[13]](https://www.quantconnect.com/docs/v2/writing-algorithms/algorithm-framework/risk-management/key-concepts) [[14]](https://www.quantconnect.com/docs/v2/lean-cli/api-reference/lean-backtest) [[15]](https://cdn.quantconnect.com/docs/i/Quantconnect-Lean-Engine-CSharp.pdf) |
| OctoBot | Arquitetura produtor-consumidor; coleta histórica e backtests por estratégias/configurações | Separar aquisição de dados, avaliação e consumo da decisão | Excertos não validam desempenho, suporte DEX ou cada mercado atual. [[16]](https://www.octobot.cloud/en/guides/octobot-developers-environment/architecture) [[17]](https://www.octobot.cloud/en/guides/octobot-usage/backtesting) [[18]](https://www.octobot.cloud/en/guides/exchanges) |

O padrão transferível é a separação de responsabilidades, não a cópia de uma biblioteca. A distinção controlador/executor do Hummingbot é uma implementação documentada. [[1]](https://hummingbot.org/strategies/v2-strategies/controllers) O estudo TradingAgents usa papéis de análise, debate e risco, mas em simulação histórica de ações. [[3]](https://arxiv.org/html/2412.20138v5) O experimento de reforço em cripto acrescenta treinamento e seleção de modelos, não uma certificação de execução. [[4]](https://arxiv.org/html/2209.05559v6) Na síntese proposta para BETTEX, essas referências informam camadas distintas, sem escolher nenhuma delas.

### 2.2 Produtos comerciais: o que oferecem e o que observar

| Referência | Oferta ou comportamento declarado na evidência consultada | Pergunta que interessa à BETTEX |
|---|---|---|
| Binance | Spot Grid com faixa e intervalos aritméticos/geométricos; documentação de Spot DCA separada | O que acontece fora da faixa, com o estoque restante e com as taxas? [[19]](https://www.binance.com/en/support/faq/what-is-spot-grid-trading-and-how-does-it-work-d5f441e8ab544a5b98241e00efb3a4ab) [[20]](https://www.binance.com/en/support/faq/detail/27713d3ddb3c406da52f36b9aaaa1360) |
| OKX | Spot DCA com ordem inicial, compras adicionais na queda, multiplicadores, máximo de ordens e stop opcional | Qual é a exposição máxima, incluindo compras ainda não disparadas? [[21]](https://www.okx.com/en-us/help/whats-the-spot-dca-bot-and-how-to-use-it) |
| Pionex | Grade com compras abaixo e vendas acima do preço; aviso de riscos | O ganho das vendas foi comparado à perda do inventário? Evidência limitada a excerto. [[22]](https://www.pionex.com/blog/pionex-grid-trading-bot) |
| KuCoin | Material DCA orientado a preço médio/acumulação, distinguindo-o de Grid | A finalidade é acumular ou gerar resultado de uma tese com prazo? Evidência por excerto. [[23]](https://www.kucoin.com/learn/trading-bot/dca-trading-bot) |
| 3Commas | Estatísticas Grid com realizado, não realizado, taxas e períodos; mudança de configurações reinicia estatísticas de lucro | Como preservar a série antes/depois da alteração? [[24]](https://help.3commas.io/en/articles/11388471-grid-bot-statistics-page) |
| Cryptohopper | Configurações de sinais associadas a posições abertas; lista de tipos Default, Arbitrage, Market Making, Portfolio e Copy | A posição mantém a configuração original? Quem originou o sinal? Evidência por excertos. [[25]](https://docs.cryptohopper.com/docs/trading-bot/introduction-to-cryptohoppers-trading-bot) [[26]](https://www.cryptohopper.com/api-documentation/hopper-config) |
| Bitsgap | Exibição de resultado não realizado e alocação de moedas em Grid | O relatório mostra patrimônio e exposição, não somente ganhos das operações fechadas? Evidência por excerto. [[27]](https://bitsgap.com/helpdesk/article/18010009838748-Analyzing-Your-GRID-Bot-s-Performance) |
| Coinrule | Documentação distingue estratégias spot de perpetuals | Qual instrumento foi realmente habilitado? Evidência por excerto. [[28]](https://cloud.coinrule.com/docs/getting-started/introduction) |
| Gunbot | Estratégias spot apresentadas como pontos de partida, com entradas, saídas e risco ajustados por par e período | A configuração foi validada para o caso específico ou copiada? Evidência por excerto. [[29]](https://www.gunbot.com/support/docs/guides/trading-logic-and-optimization/selecting-spot-strategies) |

Esses materiais comprovam descrições comerciais, não superioridade entre estratégias. O significado de “DCA”, por exemplo, precisa ser aberto: o produto OKX inclui compras condicionadas a quedas e multiplicadores de tamanho; isso não é a mesma regra que comprar uma quantia fixa em intervalos fixos. A própria documentação descreve capital reservado e restrições de execução. [[21]](https://www.okx.com/en-us/help/whats-the-spot-dca-bot-and-how-to-use-it)

Um cuidado contábil é especialmente útil. A página 3Commas define lucro total como combinação dos componentes realizado e não realizado, discrimina taxas e informa o reinício de estatísticas após mudanças. [[24]](https://help.3commas.io/en/articles/11388471-grid-bot-statistics-page) **Inferência contábil da pesquisa:** lucro realizado positivo não impede resultado total negativo quando a perda restante é maior. Não atribuímos esse cenário como frase explícita da página. A consequência proposta para BETTEX é nunca usar “lucro do bot” como métrica única.

### 2.3 Ordens e mecanismos on-chain: execução não é estratégia

| Referência | Funcionamento declarado | Condição importante |
|---|---|---|
| Jupiter Trigger | V2 reúne ordens de preço e DCA, tipos condicionais e preenchimentos parciais; ordens ficam privadas/off-chain e a execução usa swaps | A página descreve vault custodial gerenciado por Privy. Não confundir execução on-chain com ausência de custódia ou ausência de componentes off-chain. [[30]](https://developers.jup.ag/docs/trigger) |
| CoW TWAP | Divide uma ordem em fatias; proteção de preço pode impedir a execução de uma fatia | Documentação exige Safe, mas recap oficial recente anuncia EOA; requisitos atuais não foram reconciliados. [[31]](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders) [[32]](https://cow.fi/learn/cow-dao-monthly-recap-september-2026) |
| Uniswap: liquidez concentrada | LP fornece liquidez numa faixa; fora dela pode ficar com um ativo e deixar de receber taxas enquanto inativo | É posição de liquidez, não um bot direcional spot nem rendimento garantido. [[33]](https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity) |

Os mecanismos acima servem para comparar condição, custódia, autorização, preenchimento e reconciliação, não a qualidade de uma tese de compra. O estudo histórico sobre custos no Uniswap v3 separa gás, impacto e slippage benigna/adversária; seu universo é limitado a pools WETH específicos em Ethereum. [[34]](https://arxiv.org/html/2309.13648v2) A literatura sobre liquidez concentrada analisa outro tipo de posição, incluindo taxas e perda impermanente. [[35]](https://dl.acm.org/doi/abs/10.1145/3560832.3563438) Já o experimento DRL em cripto ignora slippage. [[4]](https://arxiv.org/html/2209.05559v6) Não é metodologicamente válido transportar seus resultados para uma execução DEX apenas trocando o nome da plataforma.

### 2.4 IA, aprendizado e ferramentas de ação

| Referência | Natureza e estrutura | O que realmente foi sustentado |
|---|---|---|
| FreqAI, módulo do Freqtrade | Pipeline de atributos/alvos, limpeza, modelos e retreinamento; backtest emula adaptação | Capacidade documentada; estratégia-exemplo explicitamente não destinada à produção. [[2]](https://docs.freqtrade.io/en/2026.7/freqai/) |
| FinRL/FinRL-Meta | Ambientes e pipeline treino–validação–trading; competições com tarefas de ações e cripto | Excertos sustentam proposta de avaliação, não suporte aos três ativos spot nem desempenho on-chain. [[36]](https://arxiv.org/html/2112.06753v2) [[37]](https://arxiv.org/abs/2504.02281) |
| TradingAgents | Analistas especializados, debate, trader e gestão de risco | Paper avalia ações em janela de 2024; implantação real é trabalho futuro naquela publicação. Referência histórica. [[3]](https://arxiv.org/html/2412.20138v5) |
| FinMem | Perfil, memória em camadas e decisão | Pesquisa em ações, consultada por excerto; não valida operação cripto. Referência histórica. [[38]](https://arxiv.org/abs/2311.13743) |
| Alpha Arena/nof1 | Caso divulgado de agentes operando mercados reais | Evidência nesta coleta é excerto de relato em veículo de exchange, sem ledger auditado, metodologia comparável ou confirmação do estado atual. O link `/about` consultado devolveu “Page not found”; não foi usado como leitura integral. [[39]](https://www.kucoin.com/news/flash/nof1-s-alpha-arena-pits-ai-models-in-live-trading-backed-by-sui-group-and-karatage) |
| Coinbase AgentKit | Ferramentas de carteira e ações; composição de provedores de carteira e de ações | Repositório declara ausência de aprovação humana obrigatória, limites de gasto e lista de destinos embutidos. Ferramenta não equivale a política de risco. [[40]](https://github.com/coinbase/agentkit) |
| GOAT | Toolkit extensível para ações financeiras | README consultado está marcado como snapshot arquivado, somente leitura e não mantido; não generalizamos isso a forks. [[41]](https://github.com/goat-sdk/goat/blob/main/README.md) |
| ElizaOS/plugins | Referência de plugin Solana com operações de tokens/trading/DeFi | README de branch histórica por excerto; migração e capacidades atuais não confirmadas em fonte primária. [[42]](https://github.com/elizaos-plugins/plugin-solana/blob/1.x/README.md) [[43]](https://elizaos.news/daily/2026-05-30) |

O ponto de segurança não depende de um ranking de modelos. O aviso do AgentKit identifica superfícies de injeção de instruções e deixa controles financeiros ao desenvolvedor. [[40]](https://github.com/coinbase/agentkit) O toolkit IOSCO descreve governança, validação independente, documentação e gestão de terceiros como ferramentas de supervisão não vinculantes. [[44]](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD823.pdf) TradingAgents, por sua vez, estuda distribuição de papéis e reconhece limitações da janela avaliada. [[3]](https://arxiv.org/html/2412.20138v5) **Recomendação da pesquisa:** texto gerado por agente, memória ou ferramenta não deve se converter diretamente em permissão financeira. Isso não cria uma obrigação legal específica nem altera a governança BETTEX.

## 3. Catálogo de estratégias e regimes de falha

A tabela é uma **taxonomia analítica proposta nesta pesquisa**, não uma lista de estratégias comprovadamente lucrativas ou disponíveis em todos os produtos. “Candidata” significa elegível para investigação lógica sob o mandato, não autorização de teste operacional ou de investimento. Os riscos são cenários a avaliar, não frequências estimadas.

| Família | Lógica econômica | Falha ou confusão a testar | Tratamento no mandato atual |
|---|---|---|---|
| Tendência/momentum com correção | Comprar continuação após recuo e confirmação | Mudança de regime; entradas atrasadas; custos | Candidata a estudo; resultado histórico depende da amostra. [[45]](https://www.nber.org/papers/w24877) [[5]](https://www.sciencedirect.com/science/article/pii/S1544612326001339) |
| Rompimento | Comprar saída sustentada de uma faixa | Falso rompimento, retorno à faixa e slippage | Candidata analítica; precisa de definição própria e teste, não mera configuração de indicador |
| Reversão à média | Comprar desvio com evidência de recuperação | Tratar queda estrutural como desconto | Candidata analítica; não presumir que exemplo Bollinger documentado prova eficácia. [[1]](https://hummingbot.org/strategies/v2-strategies/controllers) |
| Rotação por força relativa | Reduzir um ativo e considerar outro com tese própria melhor | Trocas excessivas, correlação e custos de duas pontas | Candidata long-only, sem posição vendida; não confundir com estratégia long-short acadêmica |
| Acumulação periódica | Comprar valor predefinido em calendário | Confundir aumento de quantidade com alpha ou lucro no ciclo | Referência de política de acumulação; distinta de trade com começo e fim. [[23]](https://www.kucoin.com/learn/trading-bot/dca-trading-bot) |
| Averaging/DCA com compras na queda | Aumentar posição para alterar preço médio | Capital crescente, esgotamento de reserva, queda prolongada | Não importar automaticamente; exigir orçamento total e limite de exposição. [[21]](https://www.okx.com/en-us/help/whats-the-spot-dca-bot-and-how-to-use-it) |
| Grid | Comprar/vender entre níveis de uma faixa | Tendência fora da faixa; inventário perdedor apesar de vendas lucrativas | Referência condicional; posição completa e custo líquido precisam ser medidos. [[19]](https://www.binance.com/en/support/faq/what-is-spot-grid-trading-and-how-does-it-work-d5f441e8ab544a5b98241e00efb3a4ab) [[24]](https://help.3commas.io/en/articles/11388471-grid-bot-statistics-page) |
| Market making | Cotar compra e venda e gerir inventário | Seleção adversa, estoque direcional e custos | Pesquisa separada; não presumir compatibilidade com o pacote de trade direcional. [[1]](https://hummingbot.org/strategies/v2-strategies/controllers) |
| Arbitragem spot | Capturar diferença realizável entre mercados/rotas | Latência, custos, capital fragmentado e falha de uma perna | Pesquisa separada; nome “arbitrage” em catálogo não prova oportunidade executável. [[26]](https://www.cryptohopper.com/api-documentation/hopper-config) |
| Previsão supervisionada/ML | Estimar alvo usando atributos e rótulos | Vazamento temporal, drift e previsão sem execução econômica | Método possível para produzir evidência; não substitui proposta. [[2]](https://docs.freqtrade.io/en/2026.7/freqai/) |
| LLM contextual/multiagente | Interpretar dados e confrontar argumentos | Informação futura, alucinação, consenso aparente e custo | Referência de organização/inteligência; experimento em ações não valida cripto. [[3]](https://arxiv.org/html/2412.20138v5) [[38]](https://arxiv.org/abs/2311.13743) |
| Aprendizado por reforço | Aprender ações orientadas a recompensa | Simulador inadequado, seleção excessiva de modelos e mudança de regime | Investigação metodológica; resultado relativo pode continuar negativo. [[4]](https://arxiv.org/html/2209.05559v6) |
| TWAP/DCA de execução | Dividir a execução de uma intenção já decidida | Fatias não executadas, liquidez, custódia e alterações de preço | Técnica de execução, não tese de retorno. [[31]](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders) [[30]](https://developers.jup.ag/docs/trigger) |

LP concentrada, estratégias de funding/cash-and-carry com derivativos, perpétuos, margem, venda a descoberto e alavancagem não devem ser incluídos como se fossem as quatro famílias direcionais spot já discutidas para BETTEX. A posição LP tem estrutura própria de inventário e remuneração. [[33]](https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity) Produtos que documentam spot e perpetuals separadamente reforçam a necessidade de verificar o instrumento, sem tornar a plataforma inteira elegível. [[28]](https://cloud.coinrule.com/docs/getting-started/introduction) A exclusão é do mandato deste trabalho, não um juízo universal sobre esses mercados.

## 4. O que a pesquisa quantitativa permite concluir

### 4.1 Momentum: evidências diferentes, não um veredito universal

O working paper NBER de Liu e Tsyvinski, iniciado em 2018 e publicado posteriormente em periódico em 2021, descreve momentum temporal e atenção como preditores em Bitcoin, Ripple e Ethereum. É uma referência histórica; não inclui SOL nem demonstra retorno atual em DEX. A página consultada fornece resumo e metadados, não uma reprodução do estudo. [[45]](https://www.nber.org/papers/w24877)

O artigo de março de 2026 *On survivor cryptocurrency momentum* examina dados de janeiro de 2017 a agosto de 2024. Diferencia um universo de nove moedas sobreviventes de um universo top-30, encontra dependência de amostra e alerta que seleção de sobreviventes e recortes feitos depois dos fatos não constituem estratégia negociável conhecida antecipadamente. Sua sensibilidade a custos enfraquece os resultados. [[5]](https://www.sciencedirect.com/science/article/pii/S1544612326001339)

O resumo acessível de *Cryptocurrency Momentum: Is It an Illusion?*, publicado online em agosto de 2025, também questiona a realização de prêmios observados e discute propriedades estatísticas das variâncias realizadas. Só resumo/metadados estavam disponíveis; não extraímos especificações de custo ou uma regra operacional do texto ausente. [[46]](https://onlinelibrary.wiley.com/doi/full/10.1002/ijfe.70036)

Em conjunto, as fontes justificam investigar momentum, mas não declarar que ele sempre funciona ou sempre falha. São universos, definições e períodos diferentes. **Conclusão da pesquisa:** o teste BETTEX precisa especificar a versão da estratégia, ativos disponíveis naquele momento, custos e regime; citar um artigo favorável não resolve essas diferenças.

### 4.2 Agente “melhor” pode apenas perder menos

O estudo DRL arquivado usa dez criptoativos, incluindo BTC, ETH e SOL, com treino entre fevereiro e abril de 2022 e teste entre maio e junho de 2022. Assume taxa fixa por operação e ignora slippage. Sua tabela comparativa de retorno acumulado mostra valores negativos em todos os métodos apresentados, inclusive o escolhido como superior. [[4]](https://arxiv.org/html/2209.05559v6) O resultado não é inútil: ensina sobre seleção e overfitting. Mas superioridade relativa não equivale a lucro absoluto.

TradingAgents enfrenta outro limite: seu experimento é de ações e a janela com poucos recuos é reconhecida pelos autores como possível influência sobre métricas altas. [[3]](https://arxiv.org/html/2412.20138v5) A documentação FreqAI, independentemente desse paper, explicita que seu exemplo não é uma estratégia pronta para produção. [[2]](https://docs.freqtrade.io/en/2026.7/freqai/) Portanto, “tem IA” não é critério suficiente para priorizar uma proposta, e nenhum desses resultados certifica os parâmetros BETTEX.

### 4.3 Custos e qualidade do teste precisam acompanhar o resultado

Freqtrade documenta hipóteses de preenchimento em velas, taxas nas operações e possibilidade de granularidade mais fina; o próprio manual diferencia backtest de execução posterior. [[6]](https://docs.freqtrade.io/en/2026.3/backtesting) O estudo de custos Uniswap v3 observa gás relativamente importante em operações pequenas e impacto/slippage relevantes nas maiores, dentro dos pools e período estudados em 2023. Não usamos esses resultados como tabela atual de custos BTC/ETH/SOL. [[34]](https://arxiv.org/html/2309.13648v2) O experimento DRL que ignora slippage demonstra por que “líquido de taxa” não significa “líquido de todos os custos de uma rota DEX”. [[4]](https://arxiv.org/html/2209.05559v6)

A referência original sobre probabilidade de overfitting em backtest foi consultada apenas por excerto e serve como indicação metodológica, não como implementação já verificada. [[47]](https://doi.org/10.21314/JCF.2016.322) A recomendação é registrar quantas configurações foram tentadas, preservar um teste realmente não visto e rejeitar estratégias que só funcionam após seleção retrospectiva. O estudo DRL e o artigo de sobrevivência dão exemplos concretos de por que esses cuidados importam, sem garantir que um único diagnóstico resolva todos os vieses. [[4]](https://arxiv.org/html/2209.05559v6) [[5]](https://www.sciencedirect.com/science/article/pii/S1544612326001339)

## 5. BTC, ETH e SOL: o instrumento precisa ser identificado

Para uma proposta on-chain, “BTC” não é identificação suficiente. Documentação WBTC descreve seu mecanismo de mint/burn e custódia; cbBTC é apresentado por seu emissor; tBTC descreve outro arranjo de representação. São declarações de modelos diferentes, não auditoria de reservas nem prova de equivalência entre tokens. [[48]](https://docs.wbtc.network/how-wbtc-works/mint-burn-mechanism) [[49]](https://www.coinbase.com/en-gb/cbbtc) [[50]](https://www.threshold.network/blog/august-2026-recap-tbtc-verifiable-bitcoin)

Para ETH e SOL, a recomendação análoga é declarar se a exposição é ao ativo nativo ou a uma representação, a rede e o contrato quando aplicável, além do par e do ativo de cotação. A documentação Uniswap alerta para deployment por cadeia. [[51]](https://developers.uniswap.org/docs/protocols/v4/deployments) A documentação de taxas Solana descreve componente base e prioridade, sem estabelecer o custo total de cada swap. [[52]](https://solana.com/docs/core/fees/fee-structure) Nada disso seleciona uma rede.

**Regra de avaliação proposta:** a unidade comparável deve ser ativo + representação + mercado/par + cotação + rota elegível + tamanho + horário da evidência. Antes de escolher infraestrutura, podemos definir os campos e os motivos de impedimento. Não podemos declarar que um produto “suporta BTC/ETH/SOL” e transformar isso em autorização universal.

## 6. Implicações para a lógica e os relatórios BETTEX

Esta seção é **síntese proposta**, derivada das comparações, não descrição de funcionalidades já implementadas. Mantém a BETTEX como agente principal, Cripto e especialistas BTC/ETH/SOL, com Risco e Tesouraria como entradas e controles independentes nos limites já documentados.

O percurso deve continuar distinguindo observação, interpretação, proposta, comparação, decisão, autorização, execução e apuração. A separação documentada entre controlador e executor ajuda a formular essa distinção. [[1]](https://hummingbot.org/strategies/v2-strategies/controllers) O aviso AgentKit mostra que disponibilizar ações não acrescenta automaticamente controles de gasto. [[40]](https://github.com/coinbase/agentkit) O toolkit IOSCO oferece uma referência de documentação e validação, sem definir a lei aplicável nem a governança interna da BETTEX. [[44]](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD823.pdf)

| Parte da lógica | Aprendizado a incorporar na especificação, ainda sem implementação |
|---|---|
| Proposta do especialista | Tese, regime, origem da estratégia, condições de entrada/saída, invalidação, prazos, tamanho, custos e evidências; sem termos inventados pelo comparador |
| Exposição e fila | Somar capital reservado e posições correlacionadas; compras futuras de uma mesma tese não viram oportunidades independentes |
| Comparação | Avaliar resultado líquido e risco na mesma janela e instrumento, permitindo aguardar; não premiar somente taxa de acerto ou ganho bruto |
| Execução | Separar ordem de negócio de cada tentativa, preenchimento parcial, saldo restante, cancelamento, falha e reconciliação |
| Mudança de parâmetros | Preservar versão original e motivo; alteração não apaga perdas, não cria investimento novo e não reinicia o histórico consolidado |
| Resultado | Separar realizado, não realizado, taxas, patrimônio e movimentações; não duplicar resultado da posição ao atravessar ciclos |
| Aprendizado | Registrar dados disponíveis à época, versão do modelo/prompt/memória, alternativas testadas e avaliação posterior sem reescrever a decisão original |
| Pesquisa versus operação | Identificar experimento, backtest, paper/dry-run e execução real como classes diferentes de evidência |

Para avaliar as quatro famílias direcionais discutidas, proponho um protocolo comum: fixar a definição antes de medir; conservar universo e dados disponíveis no momento; separar treino, validação e teste; registrar variações tentadas; modelar entrada e saída, custos, indisponibilidade e falhas; comparar com manutenção do ativo e com não realizar a operação na mesma janela; avaliar quedas, exposição e resultado líquido. Esses comparadores não são carteiras aprovadas nem promessa de estabilidade do ativo de caixa.

Um experimento deve ter identificador próprio, distinto do ciclo financeiro. Quando sua evidência sustentar uma proposta, o vínculo precisa ser consultável; ele não transforma o retorno histórico em lucro daquele ciclo. O [pacote de investimento](../../docs/trading-proposal-contract.md), a [lógica de decisão](../../docs/trading-decision-logic.md) e os [relatórios por ciclo](../../docs/trading-cycle-reports.md) continuam sendo os documentos de comportamento. A [síntese documental do benchmark](../../docs/trading-market-benchmark.md) organiza as implicações sem aprovar valores.

## 7. Contradições, atualidade e limites

| Questão | Resultado da conferência | Consequência |
|---|---|---|
| Jupiter com e sem preenchimentos parciais | A página atual distingue V1 e V2; V2 declara preenchimento parcial e custódia por vault | Divergência explicada por versão; não prometer output nem presumir o fluxo da V1. [[30]](https://developers.jup.ag/docs/trigger) |
| CoW TWAP Safe versus EOA | Documentação consultada exige Safe; recap oficial publicado em outubro relata EOA em setembro; comunicado distribuído também alega mudança | Lançamento anunciado, mas requisito técnico não reconciliado; não concluir “Safe-only atual” nem suporte EOA confirmado por teste. [[31]](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders) [[32]](https://cow.fi/learn/cow-dao-monthly-recap-september-2026) [[53]](https://www.prnewswire.com/apac/news-releases/cow-swap-opens-twap-orders-to-every-eoa-wallet-removing-the-safe-only-barrier-302894332.html) |
| Data do artigo sobre “ilusão” do momentum | Publicação online verificada em 13/08/2025, não 2026 | Registro corrigido; apenas resumo/metadados foram acessíveis. [[46]](https://onlinelibrary.wiley.com/doi/full/10.1002/ijfe.70036) |
| GOAT | README marca snapshot arquivado e não mantido | Referência estrutural histórica, não recomendação de adoção atual. [[41]](https://github.com/goat-sdk/goat/blob/main/README.md) |
| Alpha Arena | Link de projeto retornou página de erro; relato secundário não fornece auditoria comparável | Manter como caso divulgado de baixa força probatória nesta pesquisa. [[39]](https://www.kucoin.com/news/flash/nof1-s-alpha-arena-pits-ai-models-in-live-trading-backed-by-sui-group-and-karatage) |
| Mudança/delistagem de pares | Avisos localizados Binance/KuCoin mencionam encerramento de bots para determinados pares | Suporte de produto é mutável; não concluir encerramento de plataforma inteira. Evidência por excertos. [[54]](https://www.binance.com/en/support/announcement/detail/277c0e32800b40c3b8ed88a46ceac791) [[55]](https://www.kucoin.com/announcement/kucoin-trading-bot-will-delist-060902) |

Não foi encontrada nesta coleta uma comparação independente, padronizada e reproduzida de todas as referências em BTC/ETH/SOL spot long-only, no mesmo período e com custos DEX atuais. Isso é ausência de evidência suficiente nesta pesquisa, não prova de que nenhum produto seja lucrativo. Não foram medidos liquidez por tamanho, risco de bridge/emissor, taxa de preenchimento, MEV, saída em estresse ou restrições regionais/de conta.

Parte da cobertura comercial e de projetos vem apenas de excertos; esses itens não devem fundamentar uma seleção tecnológica. Trabalhos de 2018/2021, 2022/2023 e a publicação TradingAgents de março de 2025 são históricos. Notícias e documentação de 2026 não atualizam os experimentos antigos nem comprovam a versão em operação.

A orientação IOSCO é não vinculante e dirigida à supervisão de mercados de capitais; não é parecer sobre a estrutura jurídica BETTEX. [[44]](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD823.pdf) O projeto continua com demo visual. Nenhuma transação, integração financeira, mudança de homepage/Pitch ou escolha de stack foi feita por este trabalho.

## 8. Recomendação final

Usar o benchmark como referência de **requisitos e perguntas de avaliação**, não como catálogo de fornecedores aprovados. As quatro famílias direcionais atuais podem continuar como hipóteses de pesquisa, com definições e condições de falha mais claras. Grid, averaging, market making, arbitragem, ML e agentes contextuais devem permanecer distinguíveis: combiná-los sob um nome não resolve orçamento, risco ou contabilização.

Antes de alterar números do pacote, a etapa substantiva é uma especificação comparável das estratégias: o que constitui regime e entrada, como a tese é invalidada, o que medir e quais evidências levariam à rejeição. Alvos, duração, capacidade da fila, lote mínimo, prioridade e alocação dos rascunhos permanecem **hipóteses não validadas**. O benchmark não deve ser citado como aprovação desses valores.

A entrega documental inclui o panorama completo, a síntese para BETTEX, o registro de fontes, evidências salvas e conferência de alegações. O próximo trabalho lógico pode aproveitar essa base sem selecionar rede, biblioteca, fornecedor de IA ou executor.

## Fontes citadas

1. [Controllers - Hummingbot](https://hummingbot.org/strategies/v2-strategies/controllers) — Publicação/atualização: não informada; Tier 3; [página arquivada](sources/open-02-hummingbot-v2-controllers.md). Consulta: 14/10/2026.
2. [Introduction - Freqtrade](https://docs.freqtrade.io/en/2026.7/freqai/) — Publicação/atualização: 2026-07 (versão da documentação); Tier 3; [página arquivada](sources/ai-01-freqai-docs.md). Consulta: 14/10/2026.
3. [TradingAgents: Multi-Agents LLM Financial Trading Framework](https://arxiv.org/html/2412.20138v5) — Publicação/atualização: 2025-03-02; Tier 1; [página arquivada](sources/ai-02-tradingagents-paper.md). Consulta: 14/10/2026.
4. [Deep Reinforcement Learning for Cryptocurrency Trading: Practical Approach to Address Backtest Overfitting](https://arxiv.org/html/2209.05559v6) — Publicação/atualização: 2023-01-31 (versão v6); Tier 1; [página arquivada](sources/gap-eval-01-drl-crypto-overfit.md). Consulta: 14/10/2026.
5. [On survivor cryptocurrency momentum](https://www.sciencedirect.com/science/article/pii/S1544612326001339) — Publicação/atualização: 2026-03; Tier 1; [página arquivada](sources/gap-eval-03-survivor-momentum-2026.md). Consulta: 14/10/2026.
6. [Backtesting - Freqtrade](https://docs.freqtrade.io/en/2026.3/backtesting) — Publicação/atualização: não informada; Tier 3; [página arquivada](sources/open-01-freqtrade-backtesting.md). Consulta: 14/10/2026.
7. [Lookahead analysis - Freqtrade](https://www.freqtrade.io/en/stable/lookahead-analysis/) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/open-snippets.md). Consulta: 14/10/2026.
8. [Executors - Hummingbot](https://hummingbot.org/strategies/v2-strategies/executors) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/open-snippets.md). Consulta: 14/10/2026.
9. [Gateway DEX Middleware - Hummingbot](https://hummingbot.org/gateway) — Publicação/atualização: não informada; Tier 3; [página arquivada](sources/open-03-hummingbot-gateway.md). Consulta: 14/10/2026.
10. [Supported Exchanges | Jesse](https://docs.jesse.trade/docs/supported-exchanges/) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/open-snippets.md). Consulta: 14/10/2026.
11. [Jesse spot/futures docs](https://docs.jesse.trade/docs/strategies/futures-vs-spot) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/open-snippets.md). Consulta: 14/10/2026.
12. [Results | Jesse](https://docs.jesse.trade/docs/backtest/results) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/open-snippets.md). Consulta: 14/10/2026.
13. [LEAN Risk Management Key Concepts](https://www.quantconnect.com/docs/v2/writing-algorithms/algorithm-framework/risk-management/key-concepts) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/open-snippets.md). Consulta: 14/10/2026.
14. [lean backtest - QuantConnect](https://www.quantconnect.com/docs/v2/lean-cli/api-reference/lean-backtest) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/open-snippets.md). Consulta: 14/10/2026.
15. [QuantConnect LEAN Engine documentation](https://cdn.quantconnect.com/docs/i/Quantconnect-Lean-Engine-CSharp.pdf) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/open-snippets.md). Consulta: 14/10/2026.
16. [OctoBot architecture](https://www.octobot.cloud/en/guides/octobot-developers-environment/architecture) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/open-snippets.md). Consulta: 14/10/2026.
17. [Backtesting - OctoBot Cloud](https://www.octobot.cloud/en/guides/octobot-usage/backtesting) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/open-snippets.md). Consulta: 14/10/2026.
18. [Exchanges in OctoBot](https://www.octobot.cloud/en/guides/exchanges) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/open-snippets.md). Consulta: 14/10/2026.
19. [What Is Spot Grid Trading and How Does It Work? | Binance](https://www.binance.com/en/support/faq/what-is-spot-grid-trading-and-how-does-it-work-d5f441e8ab544a5b98241e00efb3a4ab) — Publicação/atualização: 2026-08-13 (atualizada; publicada 2022-01-06); Tier 3; [página arquivada](sources/commercial-02-binance-spot-grid.md). Consulta: 14/10/2026.
20. [What Is Spot DCA and How Does It Work? | Binance](https://www.binance.com/en/support/faq/detail/27713d3ddb3c406da52f36b9aaaa1360) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/commercial-snippets.md). Consulta: 14/10/2026.
21. [What's the Spot DCA bot and how do I use it? | OKX United States](https://www.okx.com/en-us/help/whats-the-spot-dca-bot-and-how-to-use-it) — Publicação/atualização: 2026-08-27 (atualizada; publicada 2025-10-03); Tier 3; [página arquivada](sources/commercial-01-okx-spot-dca.md). Consulta: 14/10/2026.
22. [Pionex Grid Trading Bot](https://www.pionex.com/blog/pionex-grid-trading-bot) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/commercial-snippets.md). Consulta: 14/10/2026.
23. [DCA Trading Bot | KuCoin Learn](https://www.kucoin.com/learn/trading-bot/dca-trading-bot) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/commercial-snippets.md). Consulta: 14/10/2026.
24. [Grid Bot: Statistics Page | 3Commas Help Center](https://help.3commas.io/en/articles/11388471-grid-bot-statistics-page) — Publicação/atualização: 2026-07-31; Tier 3; [página arquivada](sources/commercial-03-3commas-grid-reporting.md). Consulta: 14/10/2026.
25. [Introduction to Cryptohopper's Trading bot](https://docs.cryptohopper.com/docs/trading-bot/introduction-to-cryptohoppers-trading-bot) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/commercial-snippets.md). Consulta: 14/10/2026.
26. [Bot settings | Cryptohopper API documentation](https://www.cryptohopper.com/api-documentation/hopper-config) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/commercial-snippets.md). Consulta: 14/10/2026.
27. [Analyzing Your GRID Bot's Performance | Bitsgap](https://bitsgap.com/helpdesk/article/18010009838748-Analyzing-Your-GRID-Bot-s-Performance) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/commercial-snippets.md). Consulta: 14/10/2026.
28. [Introduction to Coinrule](https://cloud.coinrule.com/docs/getting-started/introduction) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/commercial-snippets.md). Consulta: 14/10/2026.
29. [Selecting the Right Spot Strategy for Gunbot](https://www.gunbot.com/support/docs/guides/trading-logic-and-optimization/selecting-spot-strategies) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/commercial-snippets.md). Consulta: 14/10/2026.
30. [Trigger Order API Overview - Jupiter Developers](https://developers.jup.ag/docs/trigger) — Publicação/atualização: não informada; Tier 3; [página arquivada](sources/onchain-1-jupiter-trigger.md). Consulta: 14/10/2026.
31. [TWAP orders | CoW Protocol Documentation](https://docs.cow.fi/cow-protocol/concepts/order-types/twap-orders) — Publicação/atualização: não informada; Tier 3; [página arquivada](sources/onchain-3-cow-twap.md). Consulta: 14/10/2026.
32. [CoW DAO Monthly Recap: September 2026](https://cow.fi/learn/cow-dao-monthly-recap-september-2026) — Publicação/atualização: 2026-10-05; Tier 3; [página arquivada](sources/gap-tools-03-cow-september-2026.md). Consulta: 14/10/2026.
33. [Concentrated Liquidity | Uniswap Developers](https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity) — Publicação/atualização: não informada; Tier 3; [página arquivada](sources/onchain-2-uniswap-range.md). Consulta: 14/10/2026.
34. [Don’t Let MEV Slip: The Costs of Swapping on the Uniswap Protocol](https://arxiv.org/html/2309.13648v2) — Publicação/atualização: 2023 (arXiv v2; dataset Jan–Aug 2023); Tier 1; [página arquivada](sources/validation-02-uniswap-mev-slippage.md). Consulta: 14/10/2026.
35. [Concentrated Liquidity Analysis in Uniswap V3](https://dl.acm.org/doi/abs/10.1145/3560832.3563438) — Publicação/atualização: 2022 (indicado na busca; snippet não informa data); Tier 1; [excerto arquivado](sources/onchain-snippets.md). Consulta: 14/10/2026.
36. [FinRL-Meta: A Universe of Near-Real Market Environments for Data-Driven Deep Reinforcement Learning in Quantitative Finance](https://arxiv.org/html/2112.06753v2) — Publicação/atualização: 2021 (identificador arXiv 2112); Tier 1; [excerto arquivado](sources/ai-snippets.md). Consulta: 14/10/2026.
37. [FinRL Contests: Benchmarking Data-driven Financial Reinforcement Learning Agents](https://arxiv.org/abs/2504.02281) — Publicação/atualização: 2025-04 (mês confirmado pelo identificador arXiv); Tier 1; [excerto arquivado](sources/ai-snippets.md). Consulta: 14/10/2026.
38. [FinMem: A Performance-Enhanced LLM Trading Agent with Layered Memory and Character Design](https://arxiv.org/abs/2311.13743) — Publicação/atualização: 2023-11 (identificador arXiv 2311); Tier 1; [excerto arquivado](sources/ai-snippets.md). Consulta: 14/10/2026.
39. [Nof1's Alpha Arena Pits AI Models in Live Trading, Backed by SUI Group and Karatage](https://www.kucoin.com/news/flash/nof1-s-alpha-arena-pits-ai-models-in-live-trading-backed-by-sui-group-and-karatage) — Publicação/atualização: 2026-05-15; Tier 3; [excerto arquivado](sources/ai-snippets.md). Consulta: 14/10/2026.
40. [Coinbase AgentKit — repositório oficial](https://github.com/coinbase/agentkit) — Publicação/atualização: não informada; Tier 3; [página arquivada](sources/main-agentkit-repository.md). Consulta: 14/10/2026.
41. [goat-sdk/goat README](https://github.com/goat-sdk/goat/blob/main/README.md) — Publicação/atualização: não informada; Tier 3; [página arquivada](sources/gap-tools-02-goat-toolkit-readme.md). Consulta: 14/10/2026.
42. [elizaos-plugins/plugin-solana README at 1.x](https://github.com/elizaos-plugins/plugin-solana/blob/1.x/README.md) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/gap-tools-snippets.md). Consulta: 14/10/2026.
43. [elizaOS News Daily Brief — 2026-05-30](https://elizaos.news/daily/2026-05-30) — Publicação/atualização: 2026-05-30; Tier 2; [excerto arquivado](sources/gap-tools-snippets.md). Consulta: 14/10/2026.
44. [FR/02/2026 Supervisory Toolkit for AI Use in Capital Markets](https://www.iosco.org/library/pubdocs/pdf/IOSCOPD823.pdf) — Publicação/atualização: 2026 (dia exato não confirmado no texto arquivado); Tier 1; [página arquivada](sources/ai-03-iosco-toolkit.md). Consulta: 14/10/2026.
45. [Risks and Returns of Cryptocurrency](https://www.nber.org/papers/w24877) — Publicação/atualização: 2018-08 (working paper; versão publicada em periódico em 2021); Tier 1; [página arquivada](sources/gap-eval-02-liu-tsyvinski.md). Consulta: 14/10/2026.
46. [Cryptocurrency Momentum: Is It an Illusion?](https://onlinelibrary.wiley.com/doi/full/10.1002/ijfe.70036) — Publicação/atualização: 2025-08-13 (publicação online verificada no texto arquivado); Tier 1; [página arquivada](sources/validation-01-crypto-momentum-2026.md). Consulta: 14/10/2026.
47. [The probability of backtest overfitting](https://doi.org/10.21314/JCF.2016.322) — Publicação/atualização: não informada; Tier 1; [excerto arquivado](sources/gap-eval-snippets.md). Consulta: 14/10/2026.
48. [Mint/Burn Mechanism - WBTC Docs](https://docs.wbtc.network/how-wbtc-works/mint-burn-mechanism) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/onchain-snippets.md). Consulta: 14/10/2026.
49. [Coinbase cbBTC](https://www.coinbase.com/en-gb/cbbtc) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/onchain-snippets.md). Consulta: 14/10/2026.
50. [August 2026 Recap: Securing the Next Phase of tBTC](https://www.threshold.network/blog/august-2026-recap-tbtc-verifiable-bitcoin) — Publicação/atualização: 2026-08 (dia não informado); Tier 3; [excerto arquivado](sources/onchain-snippets.md). Consulta: 14/10/2026.
51. [Uniswap v4 Deployments | Uniswap Developers](https://developers.uniswap.org/docs/protocols/v4/deployments) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/onchain-snippets.md). Consulta: 14/10/2026.
52. [Fee Structure - Solana](https://solana.com/docs/core/fees/fee-structure) — Publicação/atualização: não informada; Tier 3; [excerto arquivado](sources/onchain-snippets.md). Consulta: 14/10/2026.
53. [CoW Swap Opens TWAP Orders to Every EOA Wallet](https://www.prnewswire.com/apac/news-releases/cow-swap-opens-twap-orders-to-every-eoa-wallet-removing-the-safe-only-barrier-302894332.html) — Publicação/atualização: 2026-09-30; Tier 3; [excerto arquivado](sources/onchain-snippets.md). Consulta: 14/10/2026.
54. [Notice of Removal of Spot Trading Pairs](https://www.binance.com/en/support/announcement/detail/277c0e32800b40c3b8ed88a46ceac791) — Publicação/atualização: 2026-07-10; Tier 3; [excerto arquivado](sources/commercial-snippets.md). Consulta: 14/10/2026.
55. [KuCoin Trading Bot Will Delist These Trading Pairs](https://www.kucoin.com/announcement/kucoin-trading-bot-will-delist-060902) — Publicação/atualização: 2026-06-09; Tier 3; [excerto arquivado](sources/commercial-snippets.md). Consulta: 14/10/2026.
