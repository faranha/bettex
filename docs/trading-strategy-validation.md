# BETTEX — definição e avaliação das estratégias spot

## 1. Estado e finalidade

**Regras candidatas para investigação, não estratégias aprovadas.** Este documento detalha as pendências do [percurso spot](trading-spot-journey.md): definições reproduzíveis, inferência, expectativa e avaliação. Não escolhe tecnologia, modelo, rede ou fornecedor, não executa testes de mercado e não altera o demo/ALFA.

Mantém BTC/ETH/SOL spot, sem alavancagem, e as quatro famílias da [lógica de decisão](trading-decision-logic.md). Alvos, prazos, capacidade e limites do [pacote unificado](trading-proposal-contract.md) continuam hipóteses. O [benchmark](trading-market-benchmark.md) fornece referências, não certificação.

Uma estratégia tem três estados de evidência distintos: **definida**, **avaliada** e **habilitada no ambiente por autoridade vigente**. Um exemplo aritmético não atende aos dois últimos.

## 2. Perfil de investigação obrigatório

Antes de avaliar qualquer regra, fixar o perfil e conservar suas versões:

| Bloco | Definição que deve constar do perfil |
|---|---|
| Universo | Ativo, representação, cotação, mercado elegível e período de disponibilidade; não selecionar apenas sobreviventes conhecidos depois |
| Dados | Fonte, instantes de origem/coleta, preços usados, precisão, tratamento de lacunas e critério de validade |
| Relógios | Intervalo de observação, janela de contexto, janela do sinal, confirmação e horizonte de avaliação |
| Parâmetros | Janelas N, limiares, tolerâncias, número de confirmações, tamanhos e método de cálculo; valores fixados antes do teste |
| Regime | Critério objetivo de tendência/lateralidade/transição e estado “informação insuficiente” |
| Negócio | Gatilho, entrada, alvo absoluto, invalidação, prazo máximo e situações de não operar |
| Economia | Custos/execução por tamanho, desfechos, expectativa quando sustentada e comparação com alternativas |
| Avaliação | Separação temporal, métricas, critérios de rejeição, amostra exigida e variantes que serão experimentadas |
| Controle | Responsável pelo perfil, revisão, evidência exigida para habilitar e condições de suspensão |

As fórmulas abaixo fixam a lógica candidata, mas **não aprovam valores universais de N ou dos limiares**. Cada perfil deve preenchê-los para BTC/ETH/SOL e justificar sua investigação. Perfil incompleto é “não avaliável”, não licença para usar valores silenciosos de biblioteca.

Preço de referência de sinal e preço executável são campos diferentes. Usar somente observações disponíveis até o instante da análise. Uma barra ainda aberta não é uma barra fechada; a confirmação posterior não autoriza retroativamente uma entrada anterior.

## 3. Convenções comuns e regime

Para um intervalo fixado no perfil, `P(t)` é o preço de referência observado no fechamento t. Retorno em k intervalos: `r(k,t) = P(t) / P(t−k) − 1`. Não comparar retornos de janelas diferentes como se fossem a mesma medição.

Se o perfil usar extremos locais, um máximo em i deve superar os máximos de a observações anteriores e atender à comparação com b posteriores; o mínimo usa a regra inversa. Empates, a e b são definidos no perfil. **O extremo só fica confirmado em i+b**, depois das observações necessárias; antes disso é hipótese, não informação conhecida.

Regra candidata de regime:

- **Tendência ascendente:** os dois últimos máximos confirmados e os dois últimos mínimos confirmados sobem, com retorno/contexto acima do limiar registrado.
- **Lateralidade:** retorno absoluto e largura da faixa ficam dentro dos limites registrados, sem estrutura direcional incompatível.
- **Transição:** mudança material ou conflito entre critérios; não forçar classificação lateral para permitir reversão.
- **Insuficiente:** faltam observações, confirmação, validade ou fontes coerentes; nenhuma entrada é qualificada.

Essas condições podem ser rejeitadas pela avaliação. Não adaptar a classificação depois de ver qual estratégia ganhou.

## 4. Definição candidata das quatro famílias

### 4.1 Tendência com correção

1. Confirmar tendência ascendente pela regra do perfil, usando somente extremos já confirmados.
2. Identificar recuo desde o último máximo H; medir a profundidade pela fórmula fixada no perfil e exigir que fique na faixa investigada.
3. Exigir preservação do mínimo estrutural L, incluindo a tolerância previamente definida.
4. Confirmar retomada pelo rompimento do nível do recuo definido antes da confirmação, durante o número de observações previsto.
5. Emitir faixa de entrada executável, stop estrutural abaixo da invalidação, alvo absoluto e prazos; não comprar acima da faixa para perseguir a confirmação.

Não qualificar quando o recuo rompe L, a retomada não é confirmada, a entrada já está excessivamente distante ou custos/risco invalidam o tamanho. O método de identificar o nível de retomada e as tolerâncias pertence à versão do perfil.

### 4.2 Rompimento de faixa

Antes da primeira observação candidata, congelar a faixa: `U = máximo das máximas` e `L = mínimo das mínimas` das N observações anteriores encerradas. A observação que rompe não entra no cálculo da faixa que pretende romper.

Investigar entrada após c confirmações encerradas acima de `U + buffer`, com largura de faixa, extensão do movimento e liquidez nos limites registrados. O perfil define se exige retorno/teste da borda ou entrada após confirmação; não escolher entre essas duas variantes depois do resultado.

A invalidação usa retorno à faixa/nível estrutural definido. Se o novo preço ultrapassa a faixa de entrada, devolver ou expirar a proposta. Um rompimento identificado apenas olhando o máximo posterior não é sinal disponível à época.

### 4.3 Reversão à média

Exigir regime lateral. Definir `M` como média dos preços das N observações anteriores encerradas e `s` como dispersão pelo método registrado; se usar desvio padrão, registrar divisor e tratamento de s igual a zero.

Regra candidata: observar desvio abaixo de `M − z × s` e depois recuperação pelo gatilho predefinido. O perfil decide se M/s são congelados no início do desvio ou atualizados a cada observação anterior; essa escolha não pode mudar dentro do teste sem nova versão.

O alvo é o nível de equilíbrio entregue no pacote, não uma linha que muda para justificar manter a posição. Stop e prazo vêm de invalidação própria. Tendência de queda, dispersão indisponível ou s igual a zero sem tratamento definido impedem a proposta.

### 4.4 Rotação por força relativa

Comparar ativos na mesma janela, cotação e instante: `força relativa = r(candidato) − r(posição atual)`. Isso é um filtro de investigação, não expectativa de lucro.

Exigir tese completa da nova posição e comparar, no horizonte comum, **manter**, **reduzir e permanecer em caixa** e **sair e entrar no candidato**. Vantagem incremental = valor econômico do plano de rotação − valor do plano de manutenção, considerando custos, risco e dependência das duas etapas.

Venda ainda não confirmada não financia compra. Preenchimento parcial da saída exige recalcular quantidade disponível, exposição e tamanho; proposta vencida não é reutilizada. Um candidato que apenas subiu mais, mas não sustenta vantagem líquida, não qualifica a rotação.

## 5. Inferência: função e limites

| Tipo | Entrega admissível | Impedimento |
|---|---|---|
| Cálculo determinístico | Retorno, faixa, custo, quantidade e indicadores com fórmula/dados identificados | Não chamar cálculo fixo de previsão de IA |
| Modelo preditivo | Alvo/horizonte, versão, dados, estimativa e avaliação correspondente | Não converter qualquer previsão de preço em probabilidade de alcançar o alvo antes do stop |
| Análise contextual | Tese, contrapontos, eventos, limitações e justificativa verificável | Opinião/confiança textual não fornece probabilidade calibrada |
| Confronto multiagente | Concordâncias, divergências e fontes/dependências | Repetição da mesma fonte não é confirmação independente |

Ausência de inferência válida pode permitir consultar o mercado, mas não preencher a expectativa exigida para uma nova entrada. Registrar indisponibilidade sem trocar o método por texto fixo rotulado como IA. Não escolher aqui modelo, provedor ou arquitetura.

Em avaliação histórica, filtrar entradas por data é necessário, mas não comprova sozinho ausência de conhecimento futuro no treinamento/memória do modelo. Registrar versão, período conhecido de treinamento quando disponível e limites de verificação; usar avaliação prospectiva controlada quando o teste histórico não puder ser defendido.

## 6. Expectativa econômica e incerteza

Para desfechos mutuamente exclusivos e completos, `E = Σ p(i) × Rlíquido(i)`, com probabilidades não negativas que somam 1, mesma moeda e mesmo horizonte. Custos já embutidos nos resultados não são subtraídos novamente.

O modelo deve contemplar, conforme o negócio: alvo, stop com execução plausível, saída por prazo, entrada não realizada/cancelada com custos, preenchimentos parciais e desfechos adversos além do stop. Desfechos agregados precisam explicar o que incluem; não omitir perdas extremas para melhorar E.

Se a distribuição não estiver sustentada, a expectativa é **indisponível**, não zero nem um percentual decidido pela BETTEX. Cenários e testes de sensibilidade são análises condicionais; não recebem probabilidades fictícias para parecerem previsões.

### Exemplo aritmético, não previsão

| Desfecho fictício | Probabilidade | Resultado líquido em USDC |
|---|---:|---:|
| Alvo | 0,40 | +9,80 |
| Stop executado nas condições planejadas | 0,35 | −5,20 |
| Saída por prazo | 0,10 | +1,00 |
| Sem entrada, com custo incorrido | 0,10 | −0,10 |
| Execução adversa além do stop | 0,05 | −12,20 |

Probabilidades somam 1. Expectativa didática: `3,92 − 1,82 + 0,10 − 0,01 − 0,61 = 1,58`. Esses números não possuem calibração ou validade de mercado.

Sensibilidade: aumentar custo em 1,00 nos desfechos executados, que somam probabilidade 0,90, reduz E a 0,68. Transferir mais 0,05 de probabilidade do alvo para o desfecho adverso reduz outros 1,10: E passa a **−0,42**. Esse cenário mostra fragilidade; não mede a probabilidade de que isso aconteça.

O valor conservador do plano deve declarar método, evidência e o que a margem já inclui. Não descontar duas vezes a mesma incerteza nem somar expectativas dependentes com uma margem de “confiança” arbitrária. Os limiares do pacote existente continuam sujeitos à avaliação.

## 7. Calibração e avaliação posterior

Definir precisamente o evento previsto: por exemplo, “alvo atingido e executável antes do stop e do prazo”, não apenas “preço subiu”. Registrar como classificar parcial, saída por tempo, ausência de entrada e evento sem observação suficiente.

Separar previsão emitida da observação posterior. Para um evento binário bem definido, erro de Brier = média de `(probabilidade − resultado observado)²`, com resultado 0/1. Mostrar também frequência observada por faixas de previsão, tamanho da amostra, horizonte e cobertura; uma média boa não basta para demonstrar calibração em cada regime.

Exemplo fictício: previsões 0,80/0,60/0,40/0,20 e resultados 1/0/1/0 dão Brier `(0,04 + 0,36 + 0,36 + 0,04) / 4 = 0,20`. Média prevista e frequência observada são ambas 50%, mas isso não comprova calibração; quatro observações não aprovam um modelo.

Mínimo de amostra, tolerâncias de erro e degradação precisam estar no plano de avaliação antes do teste, com justificativa. Sem esses critérios ou sem amostra suficiente, concluir **inconclusivo**, não aprovado. Eventos ausentes são ausentes; não convertê-los em falhas/acertos convenientes.

## 8. Protocolo de investigação e rejeição

| Etapa | Regra e saída exigida |
|---|---|
| Preparar | Fixar perfis, hipóteses, universo, dados disponíveis à época, métricas e critérios; guardar versão antes de medir |
| Separar períodos | Treino, validação e teste final em ordem temporal; impedir que rótulos/janelas ultrapassem fronteiras e contaminem o teste |
| Experimentar | Registrar todas as variantes e tentativas, inclusive ruins; seleção ocorre na validação, não no teste final |
| Simular execução | Custos e quantidades por tamanho; confirmação do sinal antes da entrada; granularidade e hipóteses explícitas |
| Tratar ambiguidade | Se alvo e stop aparecem na mesma barra e não há sequência verificável, não escolher o melhor resultado; testar hipóteses conservadoras e declarar a ambiguidade |
| Comparar | Caixa/não entrar, manter ativo e regra candidata sob mesmo período, disponibilidade e custos; não comparar investimentos com tamanhos diferentes sem normalização |
| Medir | Resultado líquido, risco/drawdown, exposição, giro, custos, cobertura, prazo, falhas, concentração e desempenho por ativo/regime |
| Estressar | Quedas/transições, custos maiores, liquidez menor, atraso, ausência de fonte, saída parcial e dados perturbados |
| Concluir | Rejeitado, inconclusivo ou elegível a próxima avaliação; explicar evidência, limitações e escopo |

Retorno histórico positivo não basta. Rejeitar a alegação de vantagem quando ela depende de informação futura, seleção de sobreviventes, preços não executáveis ou custos omitidos. Resultado frágil/insuficiente permanece inconclusivo. Não exigir um número universal de trades ou Sharpe sem justificar o critério no perfil.

Uma avaliação prospectiva sem fundos reais exige escopo/autorização próprios antes de implementação. Não é ativada por esta documentação. Habilitação futura também depende dos controles e da [validação de execução](trading-execution-validation.md).

## 9. Casos documentais mínimos

| Caso | Resultado exigido |
|---|---|
| Pivô usa observações futuras | Sinal somente após confirmação; nenhuma compra retroativa |
| Rompimento redefine U com a barra que rompe | Perfil/teste inválido; corrigir a referência antes de medir |
| Lateralidade insuficiente ou s igual a zero | Reversão impedida até definição/tratamento válido |
| Duas estratégias repetem a mesma fonte | Registrar dependência; não duplicar força da evidência |
| Vantagem bruta some após custos | Não declarar vantagem líquida |
| Modelo prevê preço, sem evento/ordem temporal | Não inferir probabilidade de atingir alvo antes do stop |
| Probabilidades não somam 1 ou faltam desfechos | Expectativa não qualificável |
| Teste final orienta escolha de parâmetros | Resultado deixa de ser teste não visto; nova investigação |
| Vencedora funciona só no ativo/período escolhido depois | Não generalizar para BTC/ETH/SOL ou outros regimes |
| Rotação depende de venda incerta | Manter compromisso/exposição; não usar caixa futuro |

## 10. Dossiê e pendências que permanecem

Cada avaliação conserva perfil, dados/períodos, instantes, variantes tentadas, premissas de execução, resultados, limitações, conclusão e responsável pela revisão. Vincula-se às propostas que a utilizaram, sem entrar como lucro nos ciclos financeiros.

**Detalhado aqui:** fórmulas candidatas, convenções temporais, definição de evento, expectativa, calibração, protocolo e motivos de rejeição. **Ainda não feito:** preencher/justificar perfis por instrumento, executar avaliações, medir amostra/custos, sustentar probabilidades e aprovar qualquer estratégia/parâmetro. Não apresentar essas pendências como resolvidas.
