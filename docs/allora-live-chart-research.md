# Allora: inferências e gráficos para o painel BETTEX

Pesquisa de documentação oficial e consultas públicas realizadas em 5 de outubro de 2026. Este documento não implica que o dashboard já foi conectado à Allora.

## Conclusão

Allora é uma rede de inferência, não um chat e não uma bolsa. Consumir uma inferência não executa uma ordem. A visualização principal deve mostrar o mercado observado e a previsão correspondente, deixando decisões, risco, execução e resultados em camadas distintas.

A leitura pública da mainnet funcionou neste ambiente sem credenciais:

- GET `/emissions/v10/topics/14`: BTC/USD — Price Prediction — 8h.
- GET `/emissions/v10/is_topic_active/14`: retornou ativo.
- GET `/emissions/v10/latest_network_inferences/14`: retornou consenso, inferências individuais e bloco.
- RPC `/block?height=<bloco da inferência>`: retornou horário do bloco.

Essas consultas foram feitas nos domínios oficiais `allora-api.mainnet.allora.network` e `allora-rpc.mainnet.allora.network`. Não publicar endereços de workers nem transformar um preço previsto em recomendação automática de compra.

## Duas interfaces diferentes

### API de consumo com assinatura

Base oficial: `https://api.allora.network/v2`.

O quickstart usa `/allora/consumer/ethereum-11155111?allora_topic_id=69`, com `x-api-key`. A chave própria é obtida no portal do desenvolvedor. Checar uma integração disponível antes de solicitar configuração de segredo. Nunca expor a chave ao navegador.

Retorna `network_inference_normalized`, valor inteiro fixo, `token_decimals`, tópico, timestamp e assinatura. O único formato de assinatura enumerado na documentação TypeScript consultada é Ethereum Sepolia; isso não significa que a operação de trading BETTEX ocorra nessa rede.

SDK TypeScript: `@alloralabs/allora-sdk`, importado pela raiz, não pelo subpath `/v2`. Configurar explicitamente baseAPIUrl para o domínio atual: a documentação informa que o default ainda aponta para um host legado.

### Cosmos LCD / RPC públicos

O manifesto `/api/networks.json` da documentação informa v0.17.0, namespace `emissions/v10`, para mainnet e testnet. Uma frase na página geral da API ainda menciona v9 na mainnet; usar o manifesto atual e conferir o endpoint efetivo.

A inferência é um bundle rotulado: `combined_value` contém entradas `{label_id,label_name,value}`; a regressão de uma saída usa `y`. `inferer_values` e `forecaster_values` também são rotulados. Não tratar `combined_value` como escalar.

Não há timestamp diretamente nessa resposta; resolver o bloco informado e guardar horário de produção separado do horário de coleta. Polling bem-sucedido não torna uma inferência antiga nova.

## O que está documentado

A lista publicada de tópicos inclui preço, log-retorno e volatilidade para ativos como BTC, ETH e SOL; também existem tópicos de NEAR e XRP, entre outros. Os horizontes variam por tarefa e por rede. IDs não são intercambiáveis entre testnet e mainnet.

Exemplos da lista publicada:

- Mainnet: BTC/ETH/SOL com preço previsto em 8h.
- Mainnet: volatilidade BTC/ETH/XRP/SOL em 15 minutos.
- Testnet: preço em horizontes curtos e playground BTC, inclusive 5 minutos.

A lista é um snapshot editorial; checar atividade, metadata, unidade, horizonte e atualidade em cada tópico escolhido. Distinguir horizonte da previsão de frequência de atualização. Um tópico “8h” pode publicar novas inferências a cada epoch, não a cada oito horas.

Não foi encontrado nessa lista um serviço pronto de previsão esportiva nem de preço de qualquer meme coin arbitrária. Allora admite tarefas próprias, inclusive saídas múltiplas/classificação na versão documentada; criar uma tarefa esportiva exige modelo, participantes, rótulos, fonte de verdade e avaliação. Não enviar uma pergunta textual como se a API fosse um LLM genérico.

## Limites de incerteza e avaliação

O SDK declara campos de intervalos, mas sua documentação informa que os endpoints consumidores atualmente não os populam. O LCD de latest inference também não retorna intervalos ou pesos individuais.

Não desenhar uma faixa de confiança oficial se a resposta não a contiver. Pode-se mostrar a dispersão das inferências individuais disponíveis, rotulada como dispersão dos modelos, nunca como probabilidade de acerto ou intervalo calibrado do preço futuro. Não confundir consenso com garantia.

Para avaliar previsão versus resultado, preservar cada previsão com origem, rede, tópico, bloco, horário, horizonte, unidades e valor alvo. Quando o horizonte vencer, confrontar com uma fonte de preço observada adequada. Não substituir retrospectivamente a previsão antiga pela nova.

## Gráficos possíveis

### 1. Mercado versus Allora

- Preço observado em linha ou candles, a partir de uma fonte de mercado identificada.
- Inferência como ponto/linha tracejada no horizonte correto.
- Marca de chegada de uma nova inferência apenas quando o bloco/epoch realmente mudar.
- Dispersão dos modelos, se exibida, com rótulo próprio.
- Evento de decisão/entrada/saída apenas quando existir registro correspondente; preço previsto não é ordem executada.
- Abrir a Central da IA mantendo o ativo/tópico de contexto.

Allora não é a fonte de candles pelo simples fato de retornar uma previsão. O SDK Go documenta OHLC, mas o cliente TypeScript não apresenta essa capacidade. Candles exigem fonte de mercado ou dados Atlas apropriados; uma consulta de preço isolada não produz volume/OHLC.

### 2. Probabilidades da Polymarket

- Preço por resultado ao longo do tempo e unidades de 0–100%.
- Mercado/pergunta/evento e regras de resolução identificados.
- Spreads e liquidez/depth em contexto, sem chamar preço de probabilidade objetiva.
- Para esportes, placar/período do feed esportivo são contexto; não equivalem a resolução do mercado.
- Curva de estimativa própria somente se existir um modelo real compatível. Allora BTC/USD não prevê um jogo de futebol.

### 3. Risco/volatilidade e atuação

- Volatilidade prevista da Allora, respeitando unidade e horizonte.
- Exposição e restrições reais do executor paper como informações separadas.
- Ajuda a mostrar por que a IA operou ou ficou de fora; não aplicar uma previsão de SOL/USD como se fosse previsão de uma meme coin específica.

### Composição recomendada

Uma área “IA em ação”, sem quatro cartões de resumo como conteúdo principal. Visões compactas dos três mercados com um gráfico em destaque: cripto/Allora, esportes/Polymarket e previsões/Polymarket. Atualizações suaves ligadas a dados novos, variação positiva e negativa, horário/origem e clique para aprofundar na Central. Não forçar movimento aleatório para parecer ativo.

## FOMO

Nesta pesquisa a plataforma considerada foi fomo.family, ainda sem confirmação explícita do endereço pelo criador. A central oficial de ajuda foi encontrada e lida em suas coleções Trading e Features. Ela documenta taxas, PnL, histórico, descoberta de tokens, redes e feed social.

Não foi localizada documentação oficial pública de uma API de dados/execução. A interface visual e artigos de ajuda não constituem um contrato de API. Não usar um serviço independente de scraping/social como se fosse conector oficial. Para candles de meme coins, confirmar o provedor e a fonte de mercado antes de conectar.

## Fontes

- https://docs.allora.network/get-started/quickstart-consume
- https://docs.allora.network/consume/api
- https://docs.allora.network/consume/sdk-ts
- https://docs.allora.network/consume/sdk-overview
- https://docs.allora.network/build/forge/topics
- https://docs.allora.network/reference/networks
- https://docs.allora.network/api/networks.json
- https://docs.allora.network/learn/confidence-intervals
- https://docs.polymarket.com/market-data/prices-order-books
- https://help.fomo.family/en/collections/19292780-trading
- https://help.fomo.family/en/collections/19294006-features