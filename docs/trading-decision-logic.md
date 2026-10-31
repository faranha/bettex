# BETTEX — lógica de análise, oportunidades e decisão

> **Leitura:** [guia demo/ALFA](documentation-map.md) · **Anterior:** [demo visual](demo/README.md) · **Próximo:** [percurso spot](trading-spot-journey.md)

## 1. Escopo

Esta etapa define lógica e regras básicas, **não tecnologia**. Não escolhe rede, plataforma, fornecedor de inferência, modelo, infraestrutura ou mecanismo de execução.

O [pacote único de investimento e as filas](trading-proposal-contract.md) detalham campos obrigatórios, risco entregue pelo subagente, alvos e durações por estratégia, capacidade de até 12 propostas, comparação, alocação e relatórios. Seus números são propostas iniciais de teste, não políticas aprovadas.

A [revisão de relatórios por ciclo](trading-cycle-reports.md) estabelece o dossiê histórico que liga análise, decisão, investimento e apuração, incluindo posições herdadas e gráficos sem dupla contagem.

O [benchmark de bots e agentes](trading-market-benchmark.md) reúne referências de mercado, estratégias e limites das evidências para aprimorar esta lógica. Não seleciona tecnologia nem valida os parâmetros propostos.

O [percurso completo de um investimento spot](trading-spot-journey.md) aplica essa lógica a um exemplo documental, da análise à apuração em dois ciclos, incluindo alternativas, estados e casos de impedimento. Não implementa o percurso no demo/ALFA.

Mandato definido: BTC, ETH e SOL spot, sem alavancagem, priorizando negociação on-chain. A BETTEX é o agente principal; Cripto coordena especialistas BTC/ETH/SOL. Risco e Tesouraria alimentam e limitam a decisão, mas não formam outra camada de seleção financeira.

As famílias de estratégia abaixo são propostas para organizar a avaliação. Não são estratégias validadas nem autorizações de operação. Rascunhos quantitativos anteriores não estabelecem uma estratégia preferida ou os parâmetros desta etapa.

A [especificação de avaliação](trading-strategy-validation.md) detalha regras candidatas reproduzíveis, perfis, inferência, expectativa, calibração e rejeição. A [validação de execução](trading-execution-validation.md) define o que demonstrar sobre instrumento, custos, liquidez e controles. Nenhum desses documentos habilita operação.

O [inventário das funções determinísticas](trading-deterministic-functions.md) explicita o apoio prestado aos atores sem substituir sua inteligência; a [geração de relatórios](trading-report-generation.md) liga fatos calculados, análises e apresentação.

## 2. Múltiplas estratégias

| Família | Situação procurada | Condição básica de entrada | Invalidação/saída | Quando não usar |
|---|---|---|---|---|
| Continuação de tendência com correção | Tendência de alta com recuo que preserva sua estrutura | Evidência de retomada após o recuo, sem perseguir preço excessivamente estendido | Perda da estrutura, objetivo atingido ou esgotamento do prazo da tese | Tendência indefinida, queda estrutural ou correção sem confirmação de retomada |
| Rompimento de faixa | Mercado que sai de uma faixa identificável | Rompimento confirmado e sustentado, com liquidez e custo compatíveis | Retorno à faixa, objetivo ou prazo | Movimento já excessivamente estendido, rompimento sem sustentação ou mercado ilíquido |
| Reversão à média | Mercado lateral, com desvio e recuperação | Evidência de retorno após afastamento da faixa habitual; não comprar apenas porque caiu | Falha da recuperação, perda da faixa ou chegada ao objetivo de retorno | Queda estrutural ou mudança para tendência forte |
| Rotação por força relativa | Posição existente perde atratividade e outro ativo apresenta tese própria melhor | Substituição com vantagem líquida incremental após custos e risco de ambas as operações | Vantagem desaparece ou a nova tese é invalidada | Troca baseada apenas no último ativo que subiu mais ou sem melhora do conjunto |

Rotação é long-only: reduzir uma posição e avaliar outra, podendo permanecer em caixa. Não implica venda a descoberto, arbitragem ou negociação de um par entre os ativos.

Cada família precisa de tese, regime permitido, condição de entrada, alvo absoluto, invalidação, duração esperada, prazo máximo e restrições. As hipóteses iniciais de alvo/duração estão no pacote unificado; condições de mercado e parâmetros de identificação ainda precisam de avaliação.

Duas estratégias favoráveis ao mesmo ativo não são duas oportunidades independentes. Reunir as evidências, indicar a tese principal e não duplicar capital ou exposição. Uma posição conserva sua tese de origem; não trocar de estratégia depois da perda apenas para evitar a saída.

## 3. Como o mercado é analisado

Cada especialista responde, na mesma sequência:

1. **Estado:** há tendência, lateralidade, transição ou informação insuficiente?
2. **Movimento:** o ativo acompanha o mercado ou há comportamento próprio?
3. **Qualidade:** os dados são atuais e coerentes? Há liquidez de entrada e saída? Os custos permitem a tese?
4. **Estratégias compatíveis:** quais famílias podem ser avaliadas nesse estado? Quais devem ficar de fora?
5. **Contradições:** o que enfraquece a tese e o que faria abandoná-la?
6. **Proposta:** aguardar, investigar, propor entrada, manter, reduzir ou sair.

BTC informa o contexto comum; ETH e SOL acrescentam comportamento relativo e fatores específicos. Cripto confronta o conjunto. Três análises que repetem o mesmo movimento geral não são três confirmações independentes.

Regime incerto significa incerteza, não lateralidade por conveniência. Uma evidência nova pode mudar o diagnóstico; a mudança precisa de motivo explícito.

## 4. Tipos de informação e inferência

| Camada | O que fornece | O que não prova |
|---|---|---|
| Observação de mercado | Preço, volume, liquidez, custos, movimentos e estado atual | Probabilidade de ganho |
| Inferência estatística | Estimativas de continuidade, reversão, volatilidade e desfechos da estratégia | Certeza ou autorização |
| Previsão externa | Evidência adicional produzida por uma fonte independente, com ativo e horizonte identificados | Que a previsão se aplica a qualquer estratégia |
| Análise contextual dos agentes | Interpretação, confronto de hipóteses, eventos relevantes e contraindicações | Probabilidades calibradas criadas por opinião |
| Estado interno | Capital disponível, obrigações, reservas, posições, restrições e resultados reconciliados | Que saldo disponível precise ser investido |

Uma previsão de preço, uma estimativa de volatilidade e uma probabilidade de sucesso são informações diferentes. Só comparar fontes compatíveis em ativo, unidade, horizonte, atualidade e método.

Classificar cada informação como observada, estimada ou ausente. Qualidade depende de histórico de avaliação, compatibilidade e independência, não de quantas fontes repetem a mesma previsão.

Fonte vencida, divergente ou incompleta gera investigação ou bloqueio conforme sua importância. Não preencher ausência com zero, certeza ou explicação inventada. Não transformar opinião do agente em expectativa numérica de lucro.

## 5. O que constitui uma oportunidade

Uma oportunidade deve dizer:

- ativo, estratégia e situação de mercado;
- evidências favoráveis, contrárias e ausentes;
- entrada pretendida, objetivo, invalidação e prazo;
- benefício líquido esperado, perda planejada e incerteza; ausentes, não qualifica para decisão financeira;
- capital necessário e liquidez/custo de entrada e saída;
- impacto sobre posições existentes e correlação;
- validade e acontecimentos que exigem revisão;
- responsável atual e motivo do estado.

Observação interessante não é oportunidade qualificada. Informação essencial ausente mantém o item em investigação; não entra na fila de alocação.

## 6. Organização, comunicação e fila

Fluxo:

**Especialista analisa → Cripto confronta e qualifica → Risco e Tesouraria informam limites → BETTEX compara e decide → autorização vigente → acompanhamento e avaliação.**

Tesouraria e Risco também enviam atualizações antes e durante a análise. Não são apenas uma checagem ao final.

Cripto pode devolver uma tese para revisão ou organizar candidatos do seu domínio. **A seleção financeira pertence à BETTEX.** Uma lista ordenada não é uma ordem de compra.

Separar:

1. **Investigação:** dados faltantes ou hipótese ainda insuficiente.
2. **Oportunidades qualificadas:** completas, válidas e compatíveis com o mandato.
3. **Selecionadas aguardando autorização:** decisão registrada, sem confundir com operação.
4. **Acompanhamento:** posições, saídas, resultados incertos e reconciliação.
5. **Encerradas:** recusadas, expiradas, canceladas ou concluídas, mantendo os motivos.

Comunicação deve ocorrer por alteração relevante: nova evidência, qualificação, invalidação, decisão, mudança de restrição ou de posição. Repetição não cria outra oportunidade nem renova validade.

BETTEX recebe a proposta, o contraponto, o parecer de Risco e a condição da Tesouraria. Pode selecionar, recusar, aguardar ou pedir revisão. A resposta identifica o motivo e o que precisa mudar para reconsiderar.

## 7. Regras de prioridade

### Primeiro: o que pode entrar na comparação

Mandato permitido, estratégia habilitada para o ambiente, evidências suficientes e atuais, plano de saída, custos completos e compatibilidade com capital, risco e obrigações.

Uma vantagem aparente não compensa veto. Informação financeira essencial indisponível impede seleção, não vira saldo/exposição zero.

### Segundo: prioridade de trabalho

1. Proteger posições e tratar violações ou eventos de risco.
2. Esclarecer resultados incertos e reconciliar recursos comprometidos.
3. Revisar posições e propostas afetadas por mudanças relevantes.
4. Comparar novas entradas qualificadas.

Proteção urgente não autoriza ultrapassar permissões, limites de gasto ou restrições de saída. Pausar compras e pausar todas as movimentações são estados distintos; a regra vigente de cada controle precisa ser respeitada.

### Terceiro: comparação econômica pela BETTEX

Entre candidatos permitidos:

1. Preferir maior benefício líquido esperado em relação à perda planejada e à incerteza, com evidências comparáveis.
2. Se a diferença não for material diante da incerteza, preferir menor risco adicional no conjunto e menor concentração/correlação.
3. Persistindo equivalência, preferir maior liquidez de saída e menor custo.
4. Depois, maior robustez e atualidade da evidência.
5. Empate restante: ordem de chegada, sem aumentar o valor econômico de uma tese por ela ter esperado.

Não usar confiança declarada pelo agente, popularidade ou urgência de expiração como pontuação de lucro. Não impor uma soma de pesos arbitrários nesta etapa.

Comparar o conjunto antes de adicionar outra posição. Uma oportunidade boa isoladamente pode piorar a carteira. Horizonte e tempo de comprometimento do capital precisam ser compatíveis com obrigações; não dividir retorno por hora automaticamente.

BETTEX pode rejeitar a primeira colocada por uma contradição demonstrável, pedir revisão ou não selecionar nenhuma. A justificativa não pode contornar veto ou inventar evidência faltante.

## 8. Tesouraria e Risco alimentam a decisão

### Tesouraria informa

Capital reconciliado; reservas exigidas; obrigações; valores comprometidos; recursos segregados; disponibilidade efetiva; estado de autorização e pausa.

Capital negociável não inclui recursos pessoais, obrigações, valores destinados à recompra ou dinheiro já comprometido. Valores alocados não são simultaneamente caixa livre. Incerteza de movimentação preserva o compromisso até reconciliação.

Uma projeção de lucro não paga uma obrigação. Falta de liquidez não justifica aumentar risco para tentar recuperar recursos.

### Risco informa

Exposição atual e proposta; correlação; concentração; perdas e drawdown; liquidez de saída; cenários adversos; qualidade dos dados; risco da representação do ativo; restrições e vetos.

Risco não escolhe qual ativo comprar. Pode impedir uma proposta, pedir redução ou revisão, e desencadear proteção de posições.

### BETTEX usa esses dados continuamente

Capital menor pode reduzir o conjunto de candidatos ou levar a não investir. Correlação elevada pode impedir uma segunda posição. Liquidez pior pode invalidar uma tese ainda favorável em preço. Mudança de obrigações pode tornar um prazo inadequado.

Atualização relevante provoca revisão de oportunidades afetadas e posições, não uma repetição cega da decisão anterior.

## 9. Compatibilidade com as regras existentes

Esta revisão preserva:

| Regra existente | Consequência para a lógica |
|---|---|
| Selecionar não autoriza movimentar nem reserva recursos | A reserva formal ocorre na aprovação/autorização prevista pelos controles vigentes. O conjunto proposto não pode recomendar o mesmo capital duas vezes. |
| Permissões e aprovações segregadas | A BETTEX não concede a si mesma novos poderes nem muda políticas ao selecionar. |
| Resultado incerto conserva compromisso | Não reenviar ou liberar capital por ausência de confirmação; reconciliar primeiro. |
| Capital não é lucro | Venda de posição, saldo recebido ou valorização não viram automaticamente resultado distribuível. Apurar custo, resultado líquido e confirmação. |
| Reserva da Tesouraria abaixo da exigida | 100% do lucro líquido da apuração recompõe a Tesouraria; sem distribuição ou divisão de um suposto restante nessa mesma apuração. Não aumenta automaticamente o risco permitido. |
| Reservas atendidas e demais condições cumpridas | Aplicar o split aprovado: 50% Tesouraria, 25% staking e 25% carteira exclusiva de recompra, sobre lucro líquido, não capital. |
| Direitos de participação existentes | Preservar elegibilidade por rodada, cancelamento de créditos não pagos após qualquer saída de BETTEX e retorno de frações não executáveis à Tesouraria, sem acumulação. |
| Separação de carteiras e destinações | Recompra não utilizada permanece segregada; não vira nova receita, crédito do participante ou orçamento livre de trading. |

Referências: [regras do projeto](../PROJECT.md), [controle da Tesouraria](treasury-governance.md) e [hierarquia histórica](agent-hierarchy.md). A hierarquia histórica inclui previsões; não redefine o mandato spot atual. Seus limites de autoridade e segregação continuam relevantes.

Os pequenos valores e limites do controlador local são fixtures históricas, não parâmetros econômicos desta lógica. Nenhum novo percentual de risco ou reserva é aprovado aqui.

## 10. Aprendizado e exemplo

Avaliar depois: tese original, alternativa descartada, custos previstos/observados, decisão, motivo de rejeição e desfecho. Registrar também oportunidades recusadas, sem tratá-las como trades executáveis pelo preço ideal.

Resultado bom não valida sozinho um processo; resultado ruim não autoriza mudar regras. Estratégias e fontes podem ser revistas com evidência, preservando a versão da tese e as aprovações exigidas.

**Exemplo ilustrativo:** BTC tem tese de continuação; ETH tem rompimento com benefício parecido, mas eleva a mesma exposição; SOL tem recuperação de faixa, porém faltam evidências de saída. SOL permanece em investigação. Cripto encaminha BTC/ETH com contrapontos. Risco aponta concentração; Tesouraria permite apenas parte do capital solicitado. BETTEX compara o conjunto, pode escolher somente BTC, reduzir a proposta dentro das condições ou manter caixa. A escolha não é uma compra nem uma autorização.

**Ordem do trabalho:** fechar essa lógica; definir critérios mensuráveis e parâmetros; verificar a compatibilidade detalhada dos controles; só então escolher tecnologia e representar no demo.
