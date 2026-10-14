# Cripto — base inicial de trading spot

## 1. Estado da definição

**Etapa atual:** definir lógica e regras básicas, sem escolher tecnologia. A referência principal desta etapa é [lógica de análise, oportunidades e decisão](trading-decision-logic.md). Os parâmetros quantitativos abaixo são rascunhos de pesquisa, não decisões desta etapa; a investigação de DEXs fica como material para depois.

O [pacote unificado de propostas](trading-proposal-contract.md) contém os alvos/durações por estratégia e a hipótese atual de filas, comparação e alocação. As receitas quantitativas abaixo continuam como alternativas de pesquisa, não substituem esse contrato.

**Decisão do criador:** o mandato inicial é negociar BTC, ETH e SOL no mercado spot, sem alavancagem.

**Direção escolhida:** priorizar DEXs e negociação on-chain. Ver [infraestrutura e critérios on-chain](trading-spot-dex.md) para candidatos, representações, custos e regras específicas. Starknet e Arbitrum continuam alternativas; a escolha de DEX não aprova uma rede ou integração.

**Proposta para pesquisa:** as estratégias, números, modelos e procedimentos abaixo formam uma primeira hipótese testável. Não são parâmetros aprovados para dinheiro real nem evidência de vantagem de mercado.

**Estado do produto:** o aplicativo continua um demo visual. Este documento não ativa agentes, inferências, ordens, carteiras, persistência financeira ou uso da tesouraria. Uma oportunidade ilustrativa não é uma recomendação nem uma operação executada.

Os contratos YES/NO da Polymarket não são BTC, ETH ou SOL spot. Suas cotações e o runtime histórico de previsões não podem ser reutilizados como preços, estratégias ou execução deste mandato. Esportes, iGaming e o setor de Previsões permanecem como visão futura, fora deste trabalho.

## 2. O que negociamos

- Universo inicial: BTC, ETH e SOL; nenhum outro token por descoberta automática.
- Referência proposta: USDC. A cotação efetivamente disponível depende da plataforma escolhida; USDT, moeda fiduciária ou outro ativo exigem conversão e avaliação de risco explícitas.
- Comprar aumenta uma posição spot; vender reduz ou encerra uma posição existente. Não existe venda a descoberto.
- Não entram futuros, perpétuos, margem, empréstimos, pools de liquidez, staking, opções ou arbitragem entre redes.
- Em uma execução on-chain, BTC nativo não é automaticamente WBTC ou outro token representativo. Rede, contrato, custódia, resgate e risco do emissor precisam de aprovação separada. Não presumimos uma bridge nem uma exchange.
- O capital do mandato é somente o orçamento que a Tesouraria disponibiliza para Cripto, depois de reservas e obrigações. Nunca o saldo total do projeto, o peso do staking ou o dinheiro disponível para saques.

**Plataforma ainda não escolhida:** antes de fixar custos ou capacidade, precisamos decidir onde os três ativos serão negociados, como serão custodiados e quais pares existem de fato.

## 3. Organização e responsabilidades

| Responsável | Trabalho | Limite |
|---|---|---|
| Especialista BTC | Analisa BTC, regime do mercado e sua influência sobre as outras exposições. | Não compra sozinho nem distribui capital. |
| Especialista ETH | Analisa ETH e seu comportamento relativo a BTC; investiga divergências específicas. | Não presume independência de BTC. |
| Especialista SOL | Analisa SOL, volatilidade, liquidez e comportamento relativo a BTC/ETH. | Não extrapola parâmetros de BTC sem validação. |
| Subagente Cripto | Compara candidatos, identifica conflitos, solicita revisão e recomenda uma composição. | Não se autoriza e não altera limites. |
| Subagente Risco | Produz análise independente de perdas, liquidez, correlação e falhas dos modelos. | Pode bloquear; não inventa orçamento. |
| Subagente Tesouraria | Informa capital elegível, reservas, obrigações e disponibilidade. | Não troca regras econômicas pela previsão de um modelo. |
| Agente BETTEX | Orquestra, contesta hipóteses, compara propostas e decide dentro do mandato aprovado. | Não ultrapassa veto, orçamento ou instrumento permitido. |
| Serviço de execução | Aplica a decisão autorizada ao instrumento e reconcilia ordens e posições. | Não é a inteligência; no demo não envia ordens. |

Especialização por ativo não significa uma estratégia diferente para cada moeda. Inicialmente, os três avaliam a mesma família de estratégias, com dados e avaliações próprios.

Diferenças concretas de análise:

- **BTC:** identifica o regime de referência, volatilidade e rompimentos de BTC; informa às outras especialidades quando o movimento parece comum ao mercado.
- **ETH:** acrescenta retornos relativos de ETH/BTC e sensibilidade histórica a BTC. Uma alta de ETH junto com BTC não é automaticamente um sinal específico de ETH.
- **SOL:** acrescenta retornos relativos de SOL/BTC e SOL/ETH, mudanças de liquidez executável, impacto de preço e volatilidade; spread/profundidade quando houver livro. Um movimento maior em preço pode significar mais risco, não mais vantagem.
- **Cripto:** usa as mesmas janelas temporais para comparar as propostas e confronta a exposição conjunta. Relações e sensibilidades são estimadas com dados anteriores, não fixadas como verdades permanentes.

Os agentes apresentam raciocínio e evidências. Controles determinísticos verificam permissões, contas e limites. Um não substitui o outro.

## 4. Estratégias iniciais

### 4.1. Principal: rompimento a favor da tendência

**Hipótese:** em um regime de tendência, um rompimento confirmado pode apresentar continuidade suficiente para superar perdas e custos. Essa hipótese precisa de teste; não estamos afirmando que funciona.

Condições propostas, usando somente candles encerrados:

1. No período de 4 horas, EMA de 20 períodos acima da EMA de 50.
2. A EMA de 50 está acima de seu valor no candle anterior e o fechamento de 4 horas está acima dela.
3. O fechamento de 1 hora supera a maior máxima dos **20 candles anteriores**, excluindo o candle que produz o sinal.
4. Esse fechamento não fica mais de 0,75 ATR acima do nível rompido, para não perseguir uma extensão excessiva.
5. Cotação da rota, impacto e custos suportam a quantidade pretendida; se houver livro, verificar também spread e profundidade. Preço observado não equivale a preço executável.
6. O modelo quantitativo validado estima expectativa líquida suficiente e a análise dos agentes não encontra uma contradição não resolvida.

**ATR:** média de amplitude verdadeira de 14 períodos, com suavização de Wilder, em candles de 1 hora. **EMA:** média móvel exponencial. Todos os cálculos devem ter fórmula, fonte e versão registradas.

Plano inicial de uma posição:

- Entrada após o candle de confirmação, ao preço realmente disponível; nunca retroativamente no fechamento.
- Stop inicial a 2 ATR abaixo da entrada.
- Alvo inicial a 3 ATR acima da entrada.
- Prazo máximo de 72 horas.
- Não afastar o stop para aceitar mais perda; não fazer preço médio em uma posição perdedora.
- Venda na ocorrência de stop, alvo ou prazo. Suspensão de novas compras não impede saídas de redução de risco.
- Acompanhamento de posições é contínuo; não espera o próximo candle de 1 hora para tratar um stop.
- Em DEX, o stop é inicialmente um gatilho de saída monitorado, não uma ordem nativa garantida. A saída depende de cotação, gas, liquidez e confirmação, conforme a especificação on-chain.
- Stops não garantem o preço de saída. Gaps, indisponibilidade, latência e derrapagem entram no risco e no teste.

O alvo bruto equivale a 1,5 vezes a distância do stop. Isso não prova rentabilidade: frequência dos desfechos, saídas por prazo e custos determinam o resultado.

### 4.2. Comparação: reversão à média em regime lateral

**Hipótese:** um desvio extremo, seguido de recuperação, pode retornar à média quando não há tendência forte.

Rascunho para comparação:

- ADX de 14 períodos em 4 horas abaixo de 20.
- Em 1 hora, fechamento anterior abaixo da banda inferior de Bollinger de 20 períodos e 2 desvios-padrão populacionais; candle atual encerra novamente dentro das bandas.
- Compra somente após recuperação confirmada, nunca apenas porque “caiu muito”.
- Stop a 1,5 ATR; alvo na média de 20 períodos; prazo máximo de 24 horas.
- O alvo precisa continuar acima da entrada e oferecer retorno líquido compatível com o risco.

**Estado inicial:** apenas pesquisa comparativa, sem competir por capital com a estratégia principal. Sua ativação depende de validação própria. Se a classificação de regime for ambígua, a decisão é aguardar.

Arbitragem, market making e outras estratégias não entram por nome: cada uma precisa de mandato, fontes, infraestrutura, custos e validação próprios.

## 5. Inteligência e dados

### 5.1. Dados mínimos

Candles OHLCV de 1 hora e 4 horas; negócios recentes; cotações de swap para a quantidade exata, rotas, impacto e liquidez de saída; taxas efetivas e gas; precisão e quantidades mínimas; posições, transações pendentes e orçamento do mandato. Onde houver livro, incluir melhor compra/venda e profundidade. Não exigir um livro inexistente de uma AMM.

Cada observação registra instrumento, plataforma, instante de origem, instante de coleta, atraso e completude. Um livro truncado não demonstra capacidade de execução.

Dados faltantes, desencontrados ou vencidos impedem seleção. Não substituir preços reais indisponíveis por dados fictícios sem aviso.

### 5.2. Modelo quantitativo inicial

Proposta: **regressão logística multinomial regularizada**, como primeiro modelo auditável para os desfechos “alvo primeiro”, “stop primeiro” e “saída por prazo”, condicionados à estratégia.

Entradas propostas: distância às médias, inclinação, distância ao rompimento, ATR/preço, volume relativo, liquidez executável, impacto/custos da quantidade proposta, retornos recentes e comportamento relativo entre os ativos; spread/profundidade onde houver livro. Características e normalização são ajustadas somente no conjunto de treinamento. Não preencher métricas ausentes de AMMs com números fictícios.

As probabilidades exigem calibração fora do treinamento. A classe “prazo” exige estimativa própria de retorno, também obtida apenas de dados anteriores. Não tratá-la como vitória nem omiti-la.

Com distribuições de ganhos e perdas líquidas:

**Expectativa líquida = soma, por desfecho, de probabilidade calibrada × retorno líquido esperado.**

No retorno entram taxas de entrada e saída, spread, derrapagem, impactos de execução e, quando aplicável, gas. A estratégia não ganha elegibilidade porque o gráfico parece bom.

Se não houver amostra suficiente, modelo validado ou custos completos, a expectativa é **indisponível**, não zero e não uma estimativa inventada pela IA.

### 5.3. Raciocínio dos agentes

O modelo de linguagem recebe dados estruturados, resultado quantitativo, contexto, limitações e posições existentes. Sua saída contém:

- hipótese e evidências;
- argumentos contrários;
- informação ausente;
- condições de invalidação;
- ação proposta: investigar, aguardar, propor compra, manter ou propor saída;
- justificativa e referências aos dados usados.

Ele não cria preços, taxas, probabilidades calibradas ou autorização financeira. Sua “confiança de 90%” não vira critério de compra.

BTC, ETH e SOL produzem análises independentes de sua especialidade; Cripto faz crítica cruzada. BETTEX pode pedir investigação adicional e rejeitar até uma proposta tecnicamente elegível.

O modelo de linguagem e sua versão precisam ser fixados antes da avaliação. A contribuição dessa análise deve ser comparada com o mesmo sistema sem ela; não presumimos que acrescenta vantagem.

### 5.4. Aprendizado e memória

Cada hipótese é confrontada com o desfecho: custos previstos versus observados, alvo/stop/prazo, expectativa versus resultado, motivo de rejeição e diferenças entre os especialistas.

Monitorar calibração, distribuição dos dados, custos e resultados por ativo e regime. Guardar previsões produzidas **antes** do desfecho; reescrever uma análise depois da operação destrói a evidência.

Os agentes podem propor novas características, parâmetros ou estratégias, acompanhados de evidências e contra-exemplos. Uma sequência de perdas não autoriza mudar limites ou treinar novamente de forma invisível.

Uma alteração gera uma versão candidata, comparada fora da amostra com a versão anterior. Mudanças exigem revisão antes de aplicação; histórico e posições existentes preservam a versão que lhes deu origem.

### 5.5. Allora

Inferências da Allora podem compor evidência adicional quando ativo, unidade, horizonte, tópico, versão e atualidade estiverem verificados. Uma previsão de preço para 8 horas não é probabilidade de alvo antes do stop em 72 horas.

Não interpolar previsões para criar intervalos inexistentes nem atribuir à Allora valores ilustrativos. A fonte não substitui o modelo de desfechos da estratégia. Sua indispensabilidade ou uso auxiliar precisa de teste comparativo.

## 6. Parâmetros iniciais propostos

Todos os números desta tabela são **hipóteses de pesquisa**, subordinadas aos limites superiores da Tesouraria e de Risco. Não representam aprovação econômica.

| Parâmetro | Hipótese inicial |
|---|---|
| Avaliação de novas entradas | Após cada fechamento de 1 hora; contexto de 4 horas |
| Risco planejado por posição | Até 0,25% do capital elegível de Cripto |
| Risco planejado agregado | Até 0,50%, tratando os três ativos como um grupo correlacionado |
| Posições simultâneas | Até 2; no máximo uma por ativo |
| Exposição por ativo | Até 20% do capital do mandato |
| Exposição bruta conjunta | Até 40%; restante não é forçado a entrar |
| Perda diária para bloquear compras | 2% da base diária do mandato, incluindo resultado realizado, não realizado e custos |
| Drawdown para revisão da estratégia | 5% em relação ao pico de patrimônio ajustado |
| Spread máximo, onde houver livro | 10 pontos-base em BTC/ETH; 20 em SOL; em AMMs usar a avaliação de preço efetivo/impacto da especificação on-chain |
| Derrapagem máxima estimada por lado | 15 pontos-base; avaliar na quantidade proposta |
| Idade máxima de cotação para decidir | Teto de 15 segundos, subordinado à validade mais curta do provedor/bloco/slot; renovar antes de qualquer execução |
| Janela de validade de nova proposta | Até 5 minutos depois do fechamento que gerou o sinal |
| Expectativa líquida mínima | 0,15 R, com estimativa fora da amostra e incerteza reportada |

Um ponto-base é 0,01%. **R** é o risco planejado da posição até o stop, acrescido dos custos estimados relevantes; não é perda máxima garantida.

Dimensionamento:

**Quantidade = menor valor permitido pelo orçamento de risco, limite por ativo, limite conjunto, liquidez executável e capital disponível.**

O orçamento de risco dividido pela perda por unidade, incluindo custos, fornece o primeiro limite de quantidade. Arredondar para baixo conforme o lote; se o lote mínimo exceder o risco, não operar.

Depósitos, retiradas e reservas não são lucro, perda nem recuperação de drawdown. Ajustar a base de patrimônio e preservar as regras de saques e distribuição existentes.

Risco também testa choques conjuntos. Como cenário hipotético inicial: BTC −5%, ETH −8%, SOL −12%, mais custos de saída estressados; perda conjunta acima de 2% do capital do mandato bloqueia a nova compra. Esses choques são cenários, não previsão nem garantia de cobertura de eventos extremos.

## 7. Critérios de seleção

Primeiro verificar elegibilidade: instrumento permitido, estratégia aprovada para pesquisa/ambiente, dados atuais, custos completos, plano de saída, modelo validado e orçamento disponível.

Depois comparar:

1. Expectativa líquida por unidade de risco e sua incerteza.
2. Liquidez e custo da quantidade pretendida.
3. Exposição e perda conjunta após a entrada.
4. Qualidade das evidências e divergências entre análises.
5. Compatibilidade entre horizonte, posição e obrigações da Tesouraria.

A prioridade quantitativa usa expectativa líquida em R; valores empatados favorecem menor custo, depois evidência mais recente e identificador estável. BETTEX faz a decisão fundamentada, não um simples encaminhamento dessa ordenação.

Uma proposta BTC e outra ETH podem ser individualmente boas e, juntas, inadequadas. Não somar votos dos três especialistas como se fossem confirmações independentes.

Não havendo proposta suficientemente sustentada, manter USDC é uma decisão registrada.

## 8. Comunicação e fila

Fluxo lógico:

**Dados → especialista → Cripto → Risco/Tesouraria → BETTEX → decisão → execução autorizada → reconciliação → avaliação.**

A revisão pode retornar a qualquer responsável. Não presumimos um novo broker ou uma mudança para outra arquitetura física por este documento.

Mensagem mínima de proposta:

| Grupo | Campos necessários |
|---|---|
| Identidade | proposal_id, correlation_id, causation_id, emissor, destinatário |
| Mercado | ativo, instrumento, plataforma, lado, instante do candle encerrado |
| Evidência | referências e hashes dos dados, timestamps, condições observadas |
| Estratégia/modelos | versões, resultado quantitativo, hipóteses, contra-argumentos |
| Economia | preço de referência, quantidade pretendida, custos, expectativa e incerteza |
| Risco | entrada, stop, alvo, prazo, exposição e invalidação |
| Controle | versão da política, estado, created_at, expires_at, motivo de transição |

Chave de deduplicação: instrumento + plataforma + estratégia/versão + lado + candle de sinal. Repetir uma mensagem não cria outra proposta ou renova sua validade.

Estados separados:

**Recebida → em análise → aguardando evidência / aguardando revisão → elegível → selecionada → aguardando autorização de execução → autorizada.**

Saídas alternativas: **recusada, expirada, cancelada**. Para DEX, distinguir **simulação aprovada, enviada, resultado desconhecido, revertida, executada com sucesso, confirmação pendente, finalizada e reconciliada**, além do estado da posição e de sua saída. Onde o instrumento tiver ordens com preenchimento parcial, manter essa informação separada. Uma seleção não é uma compra; envio, execução e finalização são eventos diferentes.

Prioridade da fila:

1. Saídas urgentes e redução de risco.
2. Reconciliação e gestão de posições existentes.
3. Revisões de propostas ainda válidas.
4. Novas entradas elegíveis.

Mensagens de risco interrompem a consideração de novas entradas. Tempo de espera não aumenta prioridade econômica nem faz preço vencido ficar válido.

Selecionar não reserva nem autoriza movimentação. Na aprovação/autorização prevista pelos controles vigentes, reservar recursos sem dupla utilização; antes de executar, revalidar preços, custos, risco, versão e validade. O conjunto proposto pela BETTEX também não pode recomendar o mesmo capital duas vezes.

Repetição após falha usa a mesma identidade. Resultado desconhecido exige reconciliação antes de novo envio. Onde houver preenchimento parcial, atualizar quantidade, reserva, exposição e plano de saída; nunca marcar como preenchimento integral. Para o desenho DEX inicial, distinguir swap atômico, reversão com gas consumido, envio, execução e finalização. Dividir uma rota entre pools não implica preenchimento parcial.

Horários de evidência ficam em UTC; a apresentação do produto segue seu padrão de horário de São Paulo.

## 9. Como validar

1. Fixar plataforma, dados, estratégia e custos antes de medir resultados.
2. Proposta de janela: 24 meses, com treinamento de 12 meses, validação de 3 e teste de 3, avançando 3 meses por rodada. Se dados íntegros não cobrirem a janela, registrar a limitação; não declarar cobertura.
3. Separar períodos cronologicamente para os três ativos juntos. Excluir dos limites de treinamento/validação operações cujos desfechos ultrapassem a fronteira.
4. Simular entrada somente após o sinal, com preço efetivo, taxas, impacto, gas, atraso e liquidez da rota; usar bid/ask quando houver livro. Séries OHLCV sozinhas não reconstituem custos e estado histórico de pools. Se faltarem esses dados, reportar a limitação, não inventar uma validação DEX. Se stop e alvo forem tocados no mesmo candle e não houver dados para ordenar os eventos, usar o desfecho conservador.
5. Reportar expectativa líquida, drawdown, exposição, quantidade de operações, perdas extremas, resultado por ativo/regime e incerteza. Não escolher estratégia somente pela taxa de acerto.
6. Hipótese de aprovação para avançar à avaliação em papel: ao menos 100 operações fora da amostra, expectativa líquida positiva com limite inferior de confiança de 95% acima de zero, controles de drawdown respeitados e resultado não concentrado em um único período. A estimativa de incerteza deve preservar dependência temporal, não embaralhar trades correlacionados.
7. Testar custos maiores, atrasos, gaps, falta de dados e indisponibilidade. Duplicar um custo não testa sozinho todos esses riscos.
8. Comparar a regra sem IA, o modelo quantitativo e a composição com raciocínio dos agentes nas mesmas condições. Só atribuir benefício à inteligência se a comparação sustentá-lo.

Esses critérios também são propostos; passar um teste não autoriza produção nem garante desempenho futuro. Falha mantém a estratégia em pesquisa.

## 10. O que levar ao demo

Depois de revisar esta base, a Central deve representar:

- Mandato spot e instrumentos, sem confundir com contratos Polymarket.
- Candles, regime, estratégia avaliada e condições presentes/ausentes.
- Proposta de cada especialista, sua evidência e contra-argumento.
- Comparação do Cripto; avaliações de Risco e Tesouraria; decisão do BETTEX.
- Fila com responsável, estado, validade e motivo.
- Entrada/stop/alvo ilustrativos, custos e posição hipotética.
- Rejeição por risco, espera por dados, expiração e ausência de oportunidade.
- Acompanhamento e saída, inclusive um exemplo de perda; não apenas trades vencedores.

Sem inferência executada, o painel diz **“raciocínio ilustrativo”**. Sem fonte spot conectada, diz **“preços ilustrativos”**. Nunca rotular dados Polymarket como spot. Não criar saldo, receita distribuível ou lucro real a partir desses exemplos.

A autorização anterior para consultar preços públicos da Polymarket não autoriza outra conexão ou execução. Escolher spot também não autoriza ativar o backend histórico.

### Exemplo de decisão para o demo

Este caso usa **avaliações inventadas para explicar o fluxo**, não preços ou inferências reais:

1. BTC apresenta um rompimento elegível e expectativa ilustrativa de 0,22 R.
2. ETH apresenta 0,18 R, mas sua cotação excede a idade permitida: fica aguardando evidência atualizada, não é comprado.
3. SOL apresenta 0,30 R, mas impacto de preço de 30 pontos-base supera o limite on-chain proposto de 15: a proposta é recusada apesar do número de retorno maior.
4. Risco informa exposição planejada existente de 0,20%. A proposta BTC acrescenta 0,25%; o conjunto chega a 0,45%, dentro do teto hipotético de 0,50%.
5. Tesouraria confirma orçamento e reservas compatíveis; isso não dispensa a avaliação dos demais limites.
6. Cripto recomenda somente BTC; BETTEX compara evidências e registra a seleção ou pede revisão.
7. No demo, aparece uma **seleção ilustrativa**, sem envio de ordem. Em execução autorizada futura, ainda seria necessário renovar a cotação e verificar os controles antes do envio.

Outro caso obrigatório: os modelos não estão validados ou os dados estão incompletos. A decisão é **não selecionar nenhuma compra**, com o motivo visível. Depois de uma entrada hipotética, mostrar também o stop e a perda líquida, não apenas o alvo.

## 11. Decisões ainda abertas

1. Plataforma, custódia, rede e instrumentos efetivos.
2. Fonte spot e permissões necessárias para consultar dados.
3. Aprovação ou revisão das estratégias e parâmetros propostos, incluindo adequação às rotas on-chain.
4. Modelo de linguagem e versão para avaliação; disponibilidade de dados para treinar e calibrar o modelo quantitativo.
5. Custos verificados, capacidade por ordem e regras de execução da plataforma.
6. Aprovação da representação no demo, mantendo-a distinta de avaliação em papel e de execução real.

**Próximo passo:** revisar primeiro este mandato e suas hipóteses; escolher a plataforma para substituir custos e restrições genéricas por condições verificáveis. Depois adaptar a documentação pública e o demo, preservando idiomas, páginas individuais, homepage e Pitch.
