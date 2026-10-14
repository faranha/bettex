# BETTEX — benchmark de mercado para a lógica dos agentes

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

A matriz e as fontes de cada item estão no relatório completo. A cobertura é representativa e muitas descrições são declarações de fonte única do fornecedor, não funcionamento reproduzido. FreqAI é módulo do Freqtrade; Uniswap LP é mecanismo de liquidez, não bot direcional. [@freqai] [@uniswap-concentrated-liquidity] AgentKit documenta ferramentas sem limites de gasto, destinos permitidos ou aprovação humana obrigatória embutidos. [@agentkit-repository]

## 3. Comparações que a BETTEX não deve confundir

**Automação não prova inteligência nem retorno.** Hummingbot documenta a separação controlador/executor. [@hummingbot-controllers] TradingAgents distribui análise, debate e risco, mas seu paper avalia ações em simulação histórica, não BTC/ETH/SOL produtivo. [@tradingagents] Um estudo DRL que inclui esses três ativos apresenta retornos acumulados negativos em todos os métodos da tabela examinada, apesar da vantagem relativa do agente escolhido. [@drl-crypto-overfit-2023]

**Previsão não é proposta completa.** FreqAI documenta modelos e retreinamento, mas avisa que a estratégia-exemplo não serve para produção. [@freqai] Para a BETTEX, o especialista continua responsável por entregar entrada, saída, invalidação, duração, tamanho, risco e evidência, não apenas uma direção prevista.

**Técnica de execução não é tese de investimento.** TWAP divide uma intenção já tomada; a proteção de preço pode impedir o preenchimento. [@cow-twap] A documentação Jupiter V2 descreve ordens condicionais, preenchimentos parciais e vault custodial por Privy. [@jupiter-trigger-v2] Priorizar execução on-chain não equivale a aprovar custódia, rede ou ausência de componentes off-chain.

## 4. Famílias de estratégia

Continuam como hipóteses direcionais: tendência com correção, rompimento, reversão à média e rotação long-only por força relativa. O benchmark não seleciona uma vencedora. O estudo NBER histórico descreve momentum em BTC/Ripple/ETH. [@nber-liu-tsyvinski-2018] A pesquisa de 2026 sobre sobreviventes mostra dependência de amostra, custos e seleção retrospectiva. [@survivor-crypto-momentum-2026] O experimento DRL tem outra janela e ignora slippage. [@drl-crypto-overfit-2023] Nenhum dos três certifica nossos alvos ou durações.

| Família adicional | Tratamento proposto na especificação |
|---|---|
| Acumulação periódica | Separar finalidade de acumular da tese de um trade com prazo |
| DCA condicionado à queda/averaging | Declarar orçamento máximo, reserva futura, exposição e encerramento; não chamar tudo de compra periódica |
| Grid | Avaliar faixa, inventário restante, perdas não realizadas, custos e cenário fora da faixa |
| Market making e arbitragem | Investigações próprias; não inserir automaticamente no pacote direcional |
| ML, LLM e reforço | Métodos para produzir análise ou decisão; não dispensam instrumento elegível, proposta e controles |
| TWAP | Método de execução, não fonte autônoma de vantagem econômica |
| LP e derivativos | Não importar para o mandato spot direcional; exigem escopo e regras próprios |

A distinção entre compra periódica e averaging é material: o Spot DCA OKX documenta multiplicadores e compras na queda, com capital reservado. [@okx-spot-dca] Grid tem regras de faixa e estoque, enquanto a posição LP tem estrutura própria. [@binance-spot-grid] [@uniswap-concentrated-liquidity] Os demais tratamentos da tabela são recomendações analíticas, não funcionalidades aprovadas.

## 5. Aprendizados para proposta, fila e decisão

As linhas abaixo são **propostas de refinamento**, sem substituir o contrato atual ou criar limites numéricos novos.

| Etapa | Refinamento proposto | Motivo/evidência |
|---|---|---|
| Identificar instrumento | Ativo, representação, cotação, mercado elegível, tamanho e data da evidência | WBTC/cbBTC/tBTC descrevem arranjos distintos; ticker não identifica risco. [@wbtc-mint-burn] [@cbbtc-issuer] [@tbtc-august-2026] |
| Qualificar tese | Regime permitido, condição observável, invalidação, prazos e definição fixa da estratégia | Evitar aplicar resultado de uma amostra a outra sem teste. [@survivor-crypto-momentum-2026] |
| Dimensionar | Somar exposição existente, compras condicionais e capital reservado | Averaging pode consumir capital ainda não aplicado. [@okx-spot-dca] |
| Comparar | Retorno líquido, risco, correlação, possibilidade de saída e alternativa de aguardar | Melhor resultado relativo pode continuar sendo prejuízo. [@drl-crypto-overfit-2023] |
| Separar autorização | Acesso a ferramenta não cria permissão; preservar controles independentes | AgentKit explicita controles não embutidos; IOSCO trata validação e governança como referências de supervisão. [@agentkit-repository] [@iosco-ai] |
| Acompanhar execução | Intenção, tentativa, preenchimento, restante, cancelamento, expiração, falha e reconciliação | Não presumir execução integral nem saída garantida. [@jupiter-trigger-v2] [@cow-twap] |

Risco e Tesouraria continuam alimentando e limitando a decisão conforme sua autoridade existente; não são substituídos pelo “risk agent” de um exemplo externo. A BETTEX não deve preencher termos ausentes nem converter várias estratégias correlacionadas no mesmo ativo em capital independente.

## 6. Aprendizados para os relatórios

**Resultado da posição inteira.** A página de estatísticas Grid 3Commas distingue realizado e não realizado, taxas e períodos. [@3commas-grid-reporting] A consequência contábil proposta é mostrar também inventário, patrimônio e movimentações: vendas lucrativas não demonstram lucro total se o estoque restante perdeu mais.

**Histórico sem reinício financeiro.** A mesma documentação informa reinício de estatísticas de lucro após mudanças de configuração. [@3commas-grid-reporting] BETTEX deve preservar versões, momento e razão da alteração sem apagar o histórico consolidado ou criar outro investimento artificialmente.

**Experimento não é ciclo financeiro.** Backtest, teste fora da amostra, paper/dry-run e execução real devem ser tipos de evidência distintos. Freqtrade explicita hipóteses de simulação e limites do backtest. [@freqtrade-backtesting] Um experimento pode sustentar uma proposta por vínculo consultável, mas seu resultado não entra na apuração como lucro real.

**Continuidade.** O [documento de relatórios](trading-cycle-reports.md) mantém a posição através de ciclos, separa realizado/não realizado e evita dupla contagem. A pesquisa complementa a origem das evidências e a preservação de parâmetros; não muda o ciclo das 16h em São Paulo nem cria novos relógios financeiros.

## 7. Como avaliar as hipóteses antes de aprovar números

Proposta de protocolo, ainda sem execução:

1. Congelar a definição de estratégia, regime, entrada, saída e universo disponível em cada data.
2. Registrar dados, versão de modelo/prompt/memória quando houver, parâmetros e número de variantes experimentadas.
3. Separar treino, validação e teste não visto; não ajustar o método olhando o teste final.
4. Simular custos de ida e volta, tamanho, liquidez de saída, slippage, falhas e limitações da rota; documentar o que não foi modelado.
5. Comparar resultado líquido, exposição, perdas, estabilidade entre regimes e alternativas na mesma janela, incluindo não operar.
6. Preservar resultados ruins e razões de rejeição; separar a pesquisa de qualquer autorização futura.

O estudo DRL aborda overfitting, mas ignora slippage. [@drl-crypto-overfit-2023] O estudo Uniswap v3 mede custos em pools específicos e não fornece uma tabela universal atual. [@uniswap-mev-slippage-arxiv] O artigo de sobrevivência alerta sobre escolhas retrospectivas e sensibilidade a custos. [@survivor-crypto-momentum-2026] Essas limitações justificam o protocolo; não aprovam uma ferramenta de validação ou um valor mínimo de retorno.

## 8. Limites e pontos em aberto

Não há neste levantamento comparação independente suficiente para ordenar todos os produtos por retorno líquido atual em BTC/ETH/SOL spot on-chain. Não foram confirmados suporte por par/rede/região/conta, custos atuais, liquidez por tamanho, reservas, segurança de carteira ou execução em estresse. Excertos não equivalem a leitura integral.

Jupiter V1/V2 explica parte da aparente divergência de preenchimentos parciais. [@jupiter-trigger-v2] CoW permanece com divergência documental: página TWAP exige Safe, enquanto recap oficial anuncia EOA; não houve teste de suporte. [@cow-twap] [@cow-eoa-recap] GOAT foi consultado como snapshot marcado arquivado. [@goat-readme] Alpha Arena permanece caso divulgado sem auditoria comparável nesta coleta. [@alpha-arena-news]

O toolkit IOSCO é não vinculante e não determina sozinho obrigações legais BETTEX. [@iosco-ai] Pesquisa histórica, declaração de fornecedor, hipótese analítica e evidência operacional devem continuar identificadas separadamente.

**Efeito desta revisão:** acrescentar benchmark e critérios de avaliação. **Sem efeito:** aprovar parâmetros, implementar agentes, escolher infraestrutura, alterar receitas/governança ou ativar dinheiro e operações no demo.
