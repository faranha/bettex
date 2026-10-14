# Cripto spot on-chain — infraestrutura e critérios para o demo

## 1. Decisão e limites

O criador definiu BTC, ETH e SOL spot, sem alavancagem, e pediu **priorizar DEXs e negociação on-chain**.

Esta pesquisa complementa a [base de estratégias](trading-spot-base.md). Não escolhe definitivamente rede, contratos, representação de BTC, SDK ou provedor. Não ativa ordens, agentes, inferências, conexão de carteira ou financiamento. O demo permanece visual.

Consulta às fontes oficiais: **14 de outubro de 2026**. Suporte documentado não comprova liquidez, preço executável, segurança ou elegibilidade local.

## 2. Infraestrutura candidata

| Domínio | Candidato | Uso estudado | O que está comprovado pela documentação |
|---|---|---|---|
| Starknet | AVNU, com Ekubo como protocolo candidato | BTC representado e ETH contra USDC | Starknet documenta providers AVNU/Ekubo; AVNU oferece cotações, proteção de saída e dados de mercado; Ekubo documenta swaps. |
| Arbitrum | Uniswap | BTC representado e ETH/WETH contra USDC | A API Uniswap lista Arbitrum e diferencia rotas AMM, UniswapX e ações encadeadas. |
| Solana | Jupiter, inicialmente avaliando seu caminho Router | SOL/WSOL contra USDC | Jupiter documenta roteamento Metis entre DEXs da Solana, construção de instruções e proteção de execução. |

AVNU e Jupiter são agregadores/roteadores; não são uma única pool. Ekubo e Uniswap oferecem protocolos de liquidez. Uma interface comum no app não torna suas regras de transação iguais.

**Starknet e Arbitrum permanecem alternativas em avaliação.** O interesse em grants não escolhe rede nem comprova parceria. Não adotamos automaticamente o SDK ou o router mais recente.

Inventário local consultado: há `ethers` no projeto, mas não foi identificada uma instalação dos SDKs necessários de AVNU/Starknet/Jupiter. Existência de documentação não é integração instalada.

## 3. Ativo não é ticker

### BTC

Nas rotas candidatas, o swap não entrega BTC nativo da rede Bitcoin. Entrega uma representação cuja identidade e resgate precisam ser avaliados.

- **tBTC:** o registro oficial da Threshold publica contratos em Starknet, Arbitrum e Solana. A publicação não prova liquidez suficiente nem elimina os riscos do mecanismo de representação.
- **cbBTC:** a Coinbase publica representações em Arbitrum e Solana, entre outras redes, e declara lastro em BTC sob sua custódia. Isso acrescenta risco de custodiante e condições de resgate; não é BTC sem intermediários.
- Token com nome “BTC” não entra por semelhança de ticker. As alternativas não são intercambiáveis sem avaliação.

Antes de aprovar uma representação: verificar emissor, contrato/mint, rede, resgate, mecanismos de controle, dependências, liquidez de saída e desvio frente ao BTC de referência.

### ETH

ETH/WETH em um domínio EVM têm tratamento diferente de ETH representado em outra rede. Wrapping local de ETH para WETH não deve ser confundido com bridge entre redes.

Na Starknet, confirmar a identidade e o mecanismo do token ETH efetivamente negociado; não apresentá-lo como ETH nativo de Ethereum L1.

### SOL

Para o especialista SOL, a candidata mais direta é negociar SOL/WSOL na Solana, usando USDC da mesma rede.

WSOL é a representação local de SOL para interação com protocolos SPL; não é uma bridge para Ethereum. SOL em Starknet ou Arbitrum exigiria outra representação e avaliação, não realizada aqui.

Não afirmamos que essas representações externas inexistem; apenas não foram homologadas para este mandato.

### USDC

A Circle publica endereços de USDC em Starknet, Arbitrum e Solana. Verificar a identidade exata a partir do registro do emissor; USDC nativo e variantes bridged não são automaticamente equivalentes.

Esta pesquisa **não coloca nenhum endereço em uma allowlist executável**. Endereços devem ser conferidos com estado on-chain, controles do contrato e ambiente antes de uso.

## 4. Arquitetura recomendada para avaliação

Proposta:

- BTC e ETH em **uma** das duas alternativas L2: Starknet ou Arbitrum.
- SOL em um domínio Solana.
- Um mandato Cripto, uma comparação de oportunidades e um orçamento global.
- Adaptadores por domínio para cotações, simulação, transação e reconciliação.

Essa proposta preserva os três especialistas e evita inventar um único instrumento “nativo” para todos. Ela acrescenta complexidade operacional: redes diferentes, ativos de gas distintos, fontes de dados e confirmação próprias. Não apresentá-la como capacidade entregue.

Alternativa: concentrar tudo em uma rede com ativos representados. Isso pode simplificar transações, mas acrescenta riscos de emissor/bridge e exige comprovar a liquidez de cada ativo. Não é a escolha automática.

Capital disponibilizado a um domínio não fica disponível simultaneamente em outro. A Tesouraria define envelopes de capital por rede; Cripto compara globalmente sem gastar o mesmo orçamento duas vezes.

**Não fazer bridge por oportunidade.** Funding ou rebalanceamento entre redes é uma operação separada, com política, prazo, custo e autorização próprios. Uma proposta sem capital na rede correta espera ou é recusada; não dispara bridge.

## 5. Quais rotas considerar

Proposta inicial de pesquisa: swaps na mesma rede, em pools/protocolos homologados, sem empréstimo, posição LP, derivativo ou ação cross-chain.

- **Uniswap:** selecionar protocolos AMM aprovados. Sua documentação informa que a configuração padrão pode considerar UniswapX; o nome “Uniswap” não prova rota AMM. Rejeitar rotas `CHAINED` no mandato inicial.
- **Jupiter:** avaliar primeiro o caminho Router, que documenta Metis on-chain. O Meta-Aggregator também considera RFQ e outros engines. Não usar “gasless” ou taxa zero para inferir ausência de custos.
- **AVNU:** identifica liquidez de AMMs, CLOBs e market makers. Antes da adoção, comprovar que os dados da rota permitem restringir/verificar os tipos e contratos aprovados. Se isso não puder ser demonstrado, o candidato não fica elegível; Ekubo direto é outra alternativa para estudar, não um fallback silencioso.

RFQ/intent pode liquidar on-chain; isso não é o mesmo que origem de liquidez exclusivamente em pools. A preferência inicial por pools é uma proposta de auditabilidade, não uma proibição já aprovada pelo criador.

Nenhum especialista escolhe tokens intermediários, contratos ou redes por conta própria. Toda a rota precisa respeitar o mandato, não somente o ativo final.

## 6. Estratégia e execução são duas avaliações

O sinal de tendência ou reversão trabalha com dados temporais e hipóteses sobre o ativo. A execução verifica se podemos entrar e sair naquele instrumento, naquela rede e naquela quantidade.

Um rompimento BTC não é suficiente se o token representativo estiver descolado do BTC de referência. Um bom sinal SOL não justifica comprar em uma rota sem liquidez de saída.

Registrar separadamente:

1. Preço de referência do ativo e sua fonte.
2. Preço e série do instrumento efetivamente negociado.
3. Cotação da rota para a quantidade exata.
4. Impacto de preço, custos e saída estimada.

Um preço de mercado ou USD indicado pelo agregador não é garantia de preenchimento. A documentação AVNU distingue preços/metricas de mercado, com atualização por minuto, das cotações de swap que precisam ser renovadas por bloco.

## 7. Custos e proteção de preço

Para AMMs, não exigir um livro de ofertas inexistente nem calcular spread como se toda DEX fosse CLOB.

Comparar o preço efetivo da quantidade proposta com referência independente e registrar impacto de preço e perda econômica estimada na entrada e saída. Quando houver livro, avaliar bid/ask e profundidade de forma apropriada.

Mapear os componentes do provedor:

- taxa de pool/protocolo;
- taxa do agregador ou integrador, se houver;
- impacto de preço da quantidade;
- slippage adicional permitido;
- gas, priority fee, tips ou paymaster;
- custo de transações de aprovação e de saída;
- gas perdido em reversões/falhas.

Uma cotação pode já descontar taxas e impacto no `amountOut`. Não somar o mesmo custo novamente. Documentar unidades e quais custos cada campo inclui.

Hipóteses adicionais para teste, sem aprovação financeira:

- impacto de preço estimado máximo de 15 pontos-base por lado, com definição homogênea e taxas discriminadas;
- slippage adicional permitido até 15 pontos-base, sujeito a limite superior mais estrito;
- custo de rede previsto para entrada e saída até 0,20 R;
- expectativa líquida mínima da estratégia ainda calculada depois de **todos** os custos;
- se a quantidade mínima economicamente viável exceder o orçamento de risco, recusar, não aumentar capital.

O teto de 15 segundos da base de estratégias não basta como regra universal. A documentação AVNU orienta renovar a cotação a cada bloco. Para cada domínio, respeitar também bloco/slot, validade do provedor e validade da transação. A regra mais estrita prevalece.

Separar **impacto esperado** de **tolerância de slippage**. A tolerância não é um gasto obrigatório e não garante execução pelo valor originalmente cotado.

Separar também a validade da análise da validade da cotação. O raciocínio sobre o candle não precisa ser refeito a cada bloco: a decisão define um envelope de preço, custo, risco, contratos e prazo. Renovar a cotação e repetir os controles de execução dentro desse envelope é uma verificação rápida; sair dele exige recusa ou nova análise. Não renovar a validade da proposta apenas porque chegou uma cotação nova.

## 8. Transação e controles

Pacote de execução proposto:

- chain/network e contrato/mint do ativo de entrada e saída;
- quantidade em unidades mínimas e precisão;
- router e contratos intermediários permitidos;
- destinatário final e carteira do mandato;
- identificador/hash da cotação e bloco/slot;
- saída mínima aceitável, validade e orçamento máximo de gas;
- versões do mandato, estratégia e decisão;
- referência da reserva de capital e risco.

A saída mínima deriva da cotação e da tolerância aprovadas. Não confiar cegamente em calldata ou transação retornada por um agregador: conferir destinatário, ativos, gastos, approvals, chamadas e programa/contrato.

Approvals e contas com autorização permanente são superfície de risco. Preferir escopo de gasto limitado e comprovar o mecanismo do ambiente; não afirmar que sessões/restrições de carteira já existem no projeto.

Simular a transação na rede correspondente antes de qualquer execução futura, comparar alterações esperadas e custos, e renovar a simulação se condições relevantes mudarem.

**Recebida pelo RPC não significa executada. Executada não significa finalizada.** Definir política de confirmação por rede a partir das fontes oficiais; não usar um número único de confirmações para Starknet, Arbitrum e Solana.

Verificar receipts/eventos e quantidades efetivamente recebidas. Resultado desconhecido exige reconciliação antes de reenvio. Reversão pode consumir gas sem produzir posição.

Swaps atômicos em uma única transação não devem ser descritos como preenchimentos parciais de ordens CEX. Divisão entre pools pode continuar atômica. Execução em múltiplas transações acrescenta estados próprios e fica fora do desenho inicial.

## 9. Stop em DEX

O stop descrito na estratégia é inicialmente **uma condição de saída monitorada**, não uma ordem nativa garantida pela rede ou uma proteção já implementada.

Quando o gatilho ocorre, um executor autorizado ainda precisa:

1. Obter cotação de saída atual.
2. Verificar liquidez, gas, restrições e quantidade da posição.
3. Simular/construir a saída.
4. Enviar e confirmar a transação.

Se a rede estiver indisponível, a liquidez desaparecer ou o preço ultrapassar o nível, a perda pode superar o stop. Estratégias de proteção/ordens condicionais de protocolos específicos exigem pesquisa própria; não atribuímos essa capacidade automaticamente a AVNU, Ekubo, Uniswap ou Jupiter.

Aumentar slippage indefinidamente não é uma política de emergência. Saídas de risco usam uma faixa de emergência previamente limitada; esgotar a faixa gera alerta, estado explícito e revisão, não assinatura sem limite.

Manter capital de gas reservado por domínio, além de USDC. Paymaster altera a forma de pagamento, não elimina o custo nem suas dependências.

## 10. Fila e risco global

Preservar a hierarquia especialista → Cripto → BETTEX, com revisões independentes de Risco e Tesouraria.

Acrescentar a cada proposta rede, representação do ativo, rota/protocolos, cotação por bloco/slot, custos de rede e motivo de inadequação da execução.

Somar exposição pelo ativo subjacente, mas registrar também riscos por representação, emissor, bridge, rede e protocolo. Duas posições em tokens BTC diferentes não são independentes.

Uma alteração da rota que afete custos, contratos, representação ou risco exige reavaliação. A aprovação da ideia de compra não autoriza qualquer caminho para realizá-la.

Estados de execução on-chain a distinguir: simulação aprovada, pronta para assinatura, enviada, resultado desconhecido, executada com sucesso, revertida, confirmação pendente, finalizada e reconciliada.

Fila, reserva e idempotência permanecem globais; observadores e adaptadores de transação são específicos do domínio. Essa descrição não autoriza criar outro runtime, broker ou banco.

## 11. Verificação necessária antes de escolher

Para cada candidato, evidência mínima:

1. Registro oficial e estado on-chain do token/router; rede e ambiente corretos.
2. Cotações de entrada e saída para três tamanhos de ordem, relacionados ao capital e ao risco propostos — não valores escolhidos para fazer a rota parecer boa.
3. Repetição em horários/regimes diferentes, registrando bloco/slot, custos, impacto e validade. Uma consulta não comprova capacidade permanente.
4. Custos completos e confirmação de como taxas estão incluídas na cotação.
5. Disponibilidade de série histórica compatível com a estratégia e o instrumento.
6. Simulação segura e evidência de proteção de saída mínima, gastos e destinatário.
7. Avaliação de liquidez de saída, desvio do ativo representado, controles do emissor e falhas da rede.
8. Compatibilidade do SDK/versionamento, limites de API e credenciais necessárias.

**Ainda não realizado:** cotação ao vivo, teste de pool, simulação de swap, validação de contratos ou integração de SDK. A pesquisa confirma candidatos e requisitos, não aprova sua execução.

A API Jupiter documentada exige chave. Quando uma integração for autorizada, verificar primeiro a disponibilidade da conexão gerenciada e usar o fluxo de secrets; nunca inserir credenciais neste documento.

## 12. Representação no demo

Representar os três especialistas desde o início, sem fingir disponibilidade de negociação:

- BTC: ativo analisado, representação candidata, rede em avaliação e aprovação pendente.
- ETH: instrumento, domínio e custos candidatos.
- SOL: domínio Solana e roteador candidato.
- Proposta: estratégia, evidências, nível de entrada/saída e adequação de execução.
- Risco: exposição conjunta, representação e problemas de rota.
- Tesouraria: envelope por rede e reserva de gas, sempre ilustrativos.
- BETTEX: comparação, seleção ilustrativa, espera ou recusa.

Exemplos essenciais: sinal bom sem rota adequada; sinal bom sem capital na rede; cotação vencida; custo que elimina a vantagem; representação fora da lista; saída impossibilitada; nenhuma oportunidade selecionada.

Sem cotação spot conectada, mostrar **preços ilustrativos**. Sem inferência executada, mostrar **raciocínio ilustrativo**. Sem execução, não mostrar transação real, posição financiada ou resultado distribuível.

Escolher DEX não autoriza substituir as cotações Polymarket do demo por outra API nem conectar carteiras. A incorporação desses exemplos ao app depende da etapa de implementação, mantendo os três idiomas e o escopo visual.

## 13. Fontes e limites de evidência

Fontes oficiais consultadas, todas em 14/10/2026:

1. [Starknet / Starkzap — swaps, referência no repositório oficial](https://github.com/starknet-io/starknet-docs/blob/c1fb35198225d7c439b521e28d37181248ff755f/build/starkzap/swap.mdx), consultada pela base técnica local. Não confundir commit da captura com versão adotada de SDK.
2. [AVNU — introdução e tipos de liquidez](https://docs.avnu.fi/introduction).
3. [AVNU — execução, slippage e renovação de cotação](https://docs.avnu.fi/docs/swap/execute-swap).
4. [AVNU — metadados de tokens](https://docs.avnu.fi/docs/tokens/index).
5. [AVNU — dados de mercado e metodologia de preço](https://docs.avnu.fi/docs/markets/index).
6. [Ekubo — integração de swaps](https://docs.ekubo.org/integration-guides/swapping/).
7. [Uniswap — redes e tokens suportados](https://developers.uniswap.org/docs/trading/swapping-api/supported-chains.md).
8. [Uniswap — roteamento e ações encadeadas](https://developers.uniswap.org/docs/trading/swapping-api/concepts/swap-routing).
9. [Jupiter — Swap API e diferenças entre Router e Meta-Aggregator](https://developers.jup.ag/docs/swap/index.md).
10. [Jupiter — riscos de slippage, MEV, tokens e gasless](https://docs.jup.ag/user-docs/trade/spot/risks-and-limitations).
11. [Threshold — registro de contratos tBTC](https://docs.threshold.network/contract-addresses/tbtc).
12. [Coinbase — cbBTC, custódia e redes publicadas](https://www.coinbase.com/en-gb/blog/coinbase-wrapped-btc-cbbtc-is-now-live). O texto de lançamento e a lista atualizada de endereços têm tempos distintos; a lista não elimina condições de resgate.
13. [Circle — registro oficial de USDC](https://developers.circle.com/stablecoins/usdc-contract-addresses).
14. [Arbitrum — referência consultada sobre custos e parâmetros de cadeia](https://docs.arbitrum.io/launch-arbitrum-chain/overview/faq), pela base técnica local. A consulta não definiu uma política de confirmação para a BETTEX.

Inventário e consultas locais executados: `pnpm docs:inventory`; consultas Starknet sobre swaps/execução e Arbitrum sobre fees/finality. A presença de `ethers` não garante compatibilidade com Cairo ou Solana.

Hashes das representações Markdown extraídas estão em [registro das fontes](reference/dex-spot-sources.json). Não são hashes dos bytes HTTP originais nem comprovação do estado de contratos. Endpoints, versões, rotas e permissões devem ser revalidados quando houver implementação.
