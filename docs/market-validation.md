# Validação de mercado — ferramentas de pesquisa

Estas ferramentas são independentes do runtime financeiro. Não publicam modelos, não alteram políticas, não geram oportunidades na aplicação e não concedem orçamento. Fixtures só existem nos testes.

## Modelo candidato, ainda não validado

`tools/market-validation/event_model.py` implementa uma hipótese estatística explícita: erro logarítmico entre previsão Allora e preço final, distribuição normal ajustada somente na amostra de treino; probabilidade de **preço final estritamente acima de um limiar** no horizonte exato de oito horas.

Não atende eventos de tocar uma barreira durante o período, esportes, intervalos de preço ou outros horizontes. Não mistura BTC/ETH/SOL nem regras de resolução diferentes. A hipótese de estabilidade/normalidade do erro ainda exige pesquisa e avaliação independente.

O dataset JSON deve conter um registro por evento: `eventId`, `eventRuleId`, `asset`, `eventKind: terminal_price_above`, `forecastAt`, `targetAt`, `resolvedAt`, `forecastUsd`, `resolvedPriceUsd`, `thresholdUsd`, `outcome` (0/1), `forecastSource`, `resolutionSource`. Preços são strings decimais; horários incluem fuso. Fontes precisam ser verificadas independentemente: fornecer uma URL não atesta sua evidência.

```sh
python tools/market-validation/event_model.py --dataset /caminho/dataset-real.json --split-at 2026-10-01T00:00:00Z
python -m unittest discover -s tools/market-validation -p 'test_*.py'
```

A fronteira de teste deve ser declarada antes da avaliação, não escolhida para melhorar o resultado. Rótulos de treino ainda não conhecidos nessa fronteira são expurgados. Eventos repetidos e múltiplos registros do mesmo preço de fechamento são rejeitados. O relatório identifica o dataset por hash, parâmetros de treino, tamanhos das amostras, Brier, Brier de referência pela prevalência de treino, log loss e tabela de confiabilidade/ECE.

Um ajuste com dois registros é apenas matematicamente possível, **não estatisticamente suficiente**. Não há um tamanho mínimo econômico ou critério de aprovação inventado: mesmo com métricas, o resultado é `research_only`, com `financiallyApproved: false`. Sem dataset real resolvido, o resultado é bloqueado e as métricas ficam ausentes. A conclusão “modelo calibrado” permanece pendente.

## Profundidade e impacto por tamanho

```sh
node tools/market-validation/book_probe.mjs --asset btc --shares 10
node --test tools/market-validation/book_probe.test.mjs
```

`--shares` é um tamanho exploratório explicitamente fornecido, não sizing aprovado nem intenção de ordem. A consulta pública limitada lê Gamma, livro CLOB e parâmetros de taxa por condition ID quando disponíveis. Confere ativo, hash e idade do livro, ordena níveis, soma profundidade e calcula principal/impacto por quantidade com BigInt e arredondamento conservador.

Livro insuficiente/vencido/incompatível bloqueia a análise. Ausência de bids conserva spread ausente. Falha na consulta de taxas não vira taxa zero. A soma por níveis não garante preenchimento: o mercado pode mudar, e cancelamento/execução estão fora da ferramenta.

O resultado continua **book-only**, não cotação executável completa. Custos de conversão/rede, denominação e fórmula de taxa precisam de atestação específica do mercado e protocolo; não basta aplicar uma tabela geral.

## Fontes técnicas e incompatibilidade observada

- [CLOB market info](https://docs.polymarket.com/api-reference/markets/get-clob-market-info): parâmetros de taxa, tokens, lote/tick.
- [Fees](https://docs.polymarket.com/trading/fees): fórmula/tabelas gerais e precisão.
- [Trading quickstart](https://docs.polymarket.com/trading/quickstart): distingue token ID/position ID e versões; o exemplo atual usa pUSD.

As referências consultadas não são inteiramente uniformes: quickstart usa pUSD; exemplos de taxas e analytics ainda usam USDC. Não substituir automaticamente USDC das políticas por pUSD, assumir conversão 1:1 ou adaptar identificadores v2 como se fossem tokens legados. A leitura pública é pesquisa; integração financeira requer confirmar versão, colateral e rede do mercado exato.

## Bloqueios externos

Não foi fornecido dataset pareado real suficiente, metodologia aprovada ou critérios de aceitação. A infraestrutura de avaliação foi executada em fixtures isoladas; não há aprovação econômica.

Busca no catálogo de integrações por Robinhood, FOMO e bônus não encontrou conectores correspondentes. Isso não comprova inexistência de APIs externas: falta identificar a FOMO exata e confirmar acesso oficial/escopo dos demais provedores antes de solicitar credenciais ou contratar serviços.

Publicação/ativação de políticas e autorização de orçamento exigem atores legítimos e aprovação independente. Uma ordem genérica para concluir pendências não substitui esses controles nem a aprovação de seus parâmetros. Operação pública continua bloqueada por modelo, custos, governança/custódia, mandato, validação regulatória e auditoria independente.
