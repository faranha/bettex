# Modelo de trading BETTEX: pesquisa das APIs oficiais

Documentação consultada em 5 de outubro de 2026. Esta é a especificação da próxima evolução do motor, não uma declaração de integrações já implementadas. O motor atual continua emulado e não envia ordens a plataformas externas.

## Direção do produto

- Esportes e previsões: Polymarket, com agentes especializados separados sobre o mesmo conector.
- Meme coins: Robinhood ou FOMO. Confirmar a identidade da FOMO antes de definir seu conector.
- Central da IA e Live Trading são uma única experiência, sem avatares ou chat com o usuário.
- Transparência entra nos detalhes e no percurso das operações; não constitui uma área de navegação.
- Navegação: Meu painel e Central da IA; Minha Conta como ícone à direita, ao lado da comunidade. Tesouraria, participação pessoal e resultados do projeto permanecem diretamente no painel, sem destinos ou abas alternativas.
- Não reescrever homepage, Pitch ou documentação comercial em consequência desta pesquisa.

## Polymarket

### Superfícies documentadas

- Gamma: eventos, mercados, regras, estado, resultados e identificadores dos tokens.
- CLOB REST: livros de ofertas, preços, ordens e restrições por mercado.
- Market WebSocket: livro, preços, negócios, mudança de tick e ciclo de vida do mercado.
- User WebSocket: ordens e execuções autenticadas de uma conta.
- Sports WebSocket: placar, período, andamento/fim da partida, slug e horário da atualização. Conectar não exige autenticação nem frame de inscrição. Responder ao ping do servidor com pong.
- Data API: posições e atividade. Conferir a versão e a forma de paginação antes de implementar; a documentação inclui migração v1 → v2.

### Modelo de domínio

Separar Event, Market, OutcomeToken, BookSnapshot, Order, Fill, Position e Resolution. Não confundir evento com mercado nem condição com token negociável. Guardar os identificadores externos originais e a versão do contrato consumido.

Cada resultado tem um token negociável. O preço é um preço por participação; sua interpretação como probabilidade de mercado não é a confiança do agente. A confiança/estimativa de um modelo precisa de origem, versão e avaliação própria.

Ordens são limitadas. GTC/GTD podem permanecer no livro; FOK exige execução integral ou cancelamento; FAK permite parcial e cancela o restante. Uma ordem post-only que atravessa o spread é rejeitada. Não completar uma ordem apenas porque decorreram seis segundos.

Guardar preço-limite, quantidade solicitada/executada/restante, validade, maker/taker, fills, custos, estado externo e estado normalizado. Cancelar apenas o saldo não executado; nunca desfazer fills já confirmados.

Não supor que bids/asks estão ordenados com o melhor preço primeiro: a documentação REST descreve bids ascendentes e asks descendentes. Normalizar e ordenar explicitamente antes de calcular melhor preço, profundidade e impacto.

Respeitar tick_size, min_order_size, neg_risk, disponibilidade do mercado e parâmetros de taxas. A documentação consultada inclui ticks 0.005 e 0.0025, além dos tamanhos mais comuns; não reduzir validação a número de casas decimais.

Alguns mercados esportivos têm atraso configurado de execução. Durante o atraso pendente, cancelamento pode não ser permitido. Não confundir esses casos com o atraso de 250 ms indicado para alguns mercados de cripto/finanças.

Ordens e negócios possuem estados diferentes:

- Ordem: live, matched, delayed, unmatched, além de rejeição/cancelamento conforme a superfície.
- Negócio: MATCHED → MINED → CONFIRMED, ou RETRYING/FAILED.
- Resultado do evento: proposto, contestado e resolvido, conforme regras/oráculo.

Placar final não equivale a resolução confirmada. Manter posição aberta até venda confirmada ou resgate válido após resolução. Posição vencedora normalmente resgata $1 por token; perdedora $0; a documentação prevê resolução excepcional 50/50. Não inventar resolução com base no título ou no relógio.

### Colateral e taxas

A documentação consultada identifica **pUSD** como colateral de trading e descreve wrapping/unwrapping de USDC.e na Polygon. Distinguir USDC da conta BETTEX, USDC.e e pUSD do provedor; conversão de apresentação não é transferência/conversão executada. Revalidar contratos, ativo aceito e rota de funding antes de qualquer integração autenticada.

Taxas variam por mercado. A página consultada apresenta `shares × feeRate × price × (1 − price)` para takers, com parâmetros por categoria, enquanto makers não pagam essa taxa. Ler os parâmetros efetivos do mercado e guardar sua origem/horário; não tratar a tabela editorial como taxa universal permanente.

Marcação de posição usa preço executável e custos estimados, não último preço arbitrário. Lucro realizado só surge de venda/resgate confirmado e conciliado. Manter exposição, reservas e resultados não realizados fora do resultado distribuível.

### Informações e gráficos possíveis

- Esportes: evento, placar/período quando disponíveis, preço de cada resultado, volume/liquidez, book, prazo/regras e estado da posição.
- Previsões: pergunta, resultados, preço histórico, liquidez, data e regras de resolução.
- Gráficos: preço/probabilidade por resultado; profundidade do livro; exposição por mercado; custo e valor líquido estimado da posição. Estimativa do agente não vem da API de preços e não deve ser fabricada.

## Robinhood Crypto Trading API

Existe documentação oficial de versões v1 e v2. A documentação e o suporte consultados informam disponibilidade para clientes Robinhood Crypto nos Estados Unidos, conforme elegibilidade da conta/jurisdição.

As consultas de mercado também exigem autenticação. Não existe, nesta pesquisa, fundamento para tratar sua API de quotes como fonte pública anônima. Não solicitar nem criar chaves para esta prototipação.

### Modelo e diferenças relevantes

- Pares: `symbol`, `asset_code`, `quote_code`, incrementos, máximo, mínimo, estado e `is_api_tradable`. Na v2, os endpoints consultados aceitam pares USD habilitados. Não inferir suporte a qualquer meme coin nem usar BTC/USDC como se fosse um par Robinhood confirmado.
- Quote v2: bid/ask não incluem necessariamente tamanho e taxa. Consultar estimated_price para quantidade específica; ainda é estimativa, não garantia.
- Quote v1: campos descrevem spread embutido. Não somar novamente um spread já incluído.
- Conta: buying power, moeda, estado, elegibilidade e, na v2, tier de taxa.
- Ordem: `client_order_id` para idempotência, buy/sell, market/limit/stop_loss/stop_limit, configurações correspondentes, fills, preço médio, quantidade executada e taxa efetiva.
- Holdings: total e disponível para negociação; não vender quantidades já comprometidas.
- Estados de ordem documentados incluem open, pending, filled, canceled e failed. Guardar execuções separadas; quantidade parcial não se torna zero porque o restante foi cancelado.

Usar uma interface comum de execução não significa nivelar todas as plataformas: conta Robinhood em USD não é carteira pUSD na Polygon. Funding, preços, taxas, restrições, liquidação e reconciliação precisam de adaptadores próprios.

Gráficos sustentáveis: série de quotes próprios com data/origem; entrada/saída; quantidade e exposição por ativo; resultado realizado/não realizado; preço estimado × preço médio efetivo. OHLC/volume não devem ser inventados a partir de um único bid/ask: exigir fonte apropriada e sua identificação.

## FOMO: ponto ainda não confirmado

Foi encontrado o produto de trading `fomo.family`, cuja página oficial descreve negociação de meme coins e tokens, plataforma multichain e funções sociais. Não foi localizada nesta pesquisa documentação oficial pública que autorize inferir uma API de execução.

Resultados como fomoapi.io e getfomoapi.fun se identificam como serviços independentes/não oficiais de dados sociais. Não os apresentar como API oficial da FOMO nem como autorização para executar trades.

`fomo.com` e sua documentação pertencem a outro produto de marketing/social proof; não usar essa API para modelar negociação de criptomoedas.

Confirmar o endereço da FOMO pretendida. Se for fomo.family, manter execução como capacidade não verificada até obter documentação oficial ou confirmação do provedor. Não automatizar app/web privado, capturar sessões ou contornar controles de acesso para criar um conector.

## Banco e comunicação

Guardar histórico durável em tabelas de instrumentos, snapshots, propostas, decisões, ordens, fills, posições, conciliações e mensagens. A janela curta do painel não deve excluir a trilha financeira histórica. Não substituir a estrutura de contas/movimentações atual nem apagar dados ao evoluir o motor.

Mensagem entre agentes: id, correlationId da operação, causationId, origem/destino, tipo, payload validado, createdAt, deadline, estado e tentativas. Exemplos: oportunidade detectada → avaliação de risco → reserva → ordem → fill → confirmação → conciliação.

Consumidores idempotentes, transições condicionais, prazo para cotação e bloqueio de dados vencidos. Repetição de mensagem não repete débito, reserva ou execução. Ordem enviada com resultado desconhecido exige conciliação antes de nova tentativa.

Conservar mandatos limitados aprovados por humanos. Aprovação operacional da IA dentro do mandato não é aprovação humana de cada ordem. Exibir bloqueios, rejeições, perdas e tempos sem oportunidades; não produzir apenas histórias positivas.

## Prototipação e promoção ao aplicativo

Primeiro implementar adaptadores de leitura, contratos validados e execução paper. Dados devem carregar `sourceMode` (live/replay/emulated), provider, horário de origem, horário de coleta e estado de atualização. Não misturar lucro simulado com posição real nem esconder falhas com números fabricados.

Separar propostas estratégicas, risk/treasury gating e executor. O executor do protótipo não possui credenciais nem caminho para submissão real. Conexão autenticada, acesso financeiro e trading real exigem etapa explícita posterior, além de conta/jurisdição, termos, segurança, reconciliação e teste de falhas.

Não copiar SDK antigo de memória: a documentação Polymarket consultada inclui clientes unificados e páginas de migração. Verificar interfaces efetivas e contrato HTTP antes de instalar dependências.

## Fontes consultadas

- https://docs.polymarket.com/getting-started/api
- https://docs.polymarket.com/market-data/overview
- https://docs.polymarket.com/market-data/prices-order-books
- https://docs.polymarket.com/concepts/order-lifecycle
- https://docs.polymarket.com/trading/place-orders
- https://docs.polymarket.com/concepts/resolution
- https://docs.polymarket.com/concepts/pusd
- https://docs.polymarket.com/trading/fees
- https://docs.polymarket.com/asyncapi-sports.json
- https://docs.robinhood.com/crypto/trading/
- https://robinhood.com/us/en/support/articles/crypto-api/
- https://production.fomo.family/