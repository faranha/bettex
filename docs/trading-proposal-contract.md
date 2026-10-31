# BETTEX — pacote de investimento, filas e decisão

> **Leitura:** [guia demo/ALFA](documentation-map.md) · **Anterior:** [percurso spot](trading-spot-journey.md) · **Próximo:** [funções determinísticas](trading-deterministic-functions.md)

## 1. Estado e alcance

Esta é uma **proposta inicial de regras de negócio**, sem escolha de tecnologia. Define números para discussão e teste, não autoriza operação nem altera políticas financeiras aprovadas. O demo continua visual.

Mandato atual: BTC/ETH/SOL spot, sem alavancagem. O formulário é o mesmo para qualquer ativo; a identificação do instrumento muda, não o significado dos campos. Outros mercados exigem mandato próprio antes de utilizar o formulário.

Este documento detalha a [lógica de decisão](trading-decision-logic.md) e prevalece sobre a ausência de limites operacionais nos rascunhos anteriores. Preços, métodos e estimativas precisam de evidência; completar o formulário com números inventados não qualifica um investimento.

O [benchmark de mercado](trading-market-benchmark.md) complementa os critérios de evidência, exposição, custos e preservação de versões. Seus exemplos externos não aprovam os números deste pacote nem qualificam automaticamente uma proposta.

O [percurso spot documentado](trading-spot-journey.md) mostra o pacote chegando à comparação, autorização, execução parcial e relatório por ciclo. Seus valores são fictícios e não alteram as hipóteses ou políticas deste contrato.

Os requisitos de evidência são detalhados em [estratégias e expectativa](trading-strategy-validation.md) e [custos, liquidez e execução](trading-execution-validation.md). Campos ausentes não são preenchidos com valores padrão ou probabilidades inventadas.

## 2. Cada estratégia entrega um negócio com começo e fim

O subagente não envia apenas “comprar ETH”. Envia preço/faixa de entrada, quantidade, alvo em preço, stop em preço, objetivo líquido, perda planejada, validade para entrar, duração esperada e prazo máximo de permanência.

Para as referências abaixo:

- **E** é o maior preço de entrada permitido.
- **S** é o preço que invalida a tese; para uma compra spot, S < E.
- **D = E − S** é distância de preço, não a perda financeira total.
- O alvo deve ser entregue como **preço absoluto**, além da regra usada para calculá-lo.
- **R** é a perda financeira planejada até o stop, incluindo custos e margens de execução estimados. Não é perda máxima garantida.

| Estratégia | Stop/invalidação entregue | Alvo inicial proposto | Duração esperada | Permanência máxima |
|---|---|---|---|---|
| Continuação após correção | Abaixo do ponto estrutural que invalida a retomada, identificado pelo especialista | E + 2 D, com evidência de que o movimento é plausível | 8–24 horas | 48 horas |
| Rompimento de faixa | Nível de retorno que invalida o rompimento, identificado pelo especialista | E + 3 D, sem comprar um movimento já estendido | 12–36 horas | 72 horas |
| Reversão à média | Ponto que invalida a recuperação da faixa lateral | Preço da média/faixa de equilíbrio identificada; só qualifica se o retorno líquido justificar o risco | 2–8 horas | 24 horas |
| Rotação por força relativa | Invalidação própria da nova posição; não apenas mudança de ranking | E + 2 D na nova posição, mais vantagem líquida demonstrada sobre manter a posição anterior | 24–48 horas na nova posição | 72 horas na nova posição |

Condição comum proposta: **ganho líquido no alvo / perda planejada no stop ≥ 1,5** e expectativa líquida conservadora ≥ 0,15 R. Alvo potencial não é expectativa: esta depende dos desfechos, probabilidades avaliadas e incerteza.

Se o alvo estrutural não comportar essas condições, recusar a tese. Não afastar o alvo ou aproximar artificialmente o stop apenas para melhorar uma razão.

Em rotação, a saída e a nova entrada são etapas condicionais: não contar a venda futura como caixa disponível, não assumir liberação de posição antes da confirmação e não reutilizar uma proposta vencida. Revalidar a entrada depois da saída, sob as autorizações vigentes.

### Quatro relógios distintos

1. **Dados:** quando a evidência foi produzida e até quando continua adequada.
2. **Proposta/entrada:** validade inicial de até **5 minutos desde a emissão da tese**, limitada também pela validade dos dados. Esse é o prazo para autorizar e iniciar uma entrada nas condições propostas, não uma promessa de execução.
3. **Negócio:** duração esperada e permanência máxima, contadas da entrada confirmada.
4. **Revisão:** acompanhamento ordinário a cada **5 minutos** e revisão imediata diante de stop, alvo, invalidação, risco ou perda relevante de informação.

Os cinco minutos da proposta não tornam uma cotação de cinco minutos executável. Revalidar preço e condições antes de qualquer movimento. Repetir uma mensagem ou renovar uma cotação não reinicia a validade da tese.

Alvo, stop ou prazo máximo acionam a saída. Se ela não puder ser concluída, o investimento permanece aberto, com alerta e risco explícitos. Não marcar encerramento por passagem de tempo nem ampliar o prazo para esconder perda.

## 3. Pacote único de proposta

Todos os subagentes usam os mesmos blocos. Campos financeiros usam moeda, unidade e instante de referência explícitos.

| Bloco | Conteúdo obrigatório |
|---|---|
| Identidade | Número da proposta, versão, versão do formulário, responsável, setor, ativo/instrumento, estratégia e versão da tese |
| Intenção | Abrir posição ou executar uma rotação; posição anterior vinculada quando aplicável |
| Contexto | Estado de mercado, tese resumida, sinais favoráveis, contrapontos e motivos para não operar |
| Evidências | Fontes, instante de origem e coleta, horizonte, método e condição observada/estimada/ausente; dependências entre fontes |
| Entrada | Faixa permitida, E, gatilho de entrada, quantidade, moeda de pagamento e condições de cancelamento |
| Saída | S, alvo absoluto, objetivo bruto e líquido, condição de invalidação, saída por tempo e procedimento de proteção |
| Tempo | Emissão, vencimento da proposta, duração esperada, permanência máxima e próxima revisão |
| Capital | Tamanhos mínimo, recomendado e máximo autorizáveis, necessidade total de recursos e restrições de redimensionamento |
| Economia por tamanho | Quantidade, capital, custos de entrada/saída, ganho no alvo, perda no stop, expectativa líquida e margem de incerteza |
| Risco próprio | Liquidez de saída, perda planejada, cenário adverso além do stop, possível perda extrema e fragilidades da tese/ativo |
| Risco no conjunto | Posições consideradas, correlação/concentração, exposição e perdas antes/depois da proposta, instante da avaliação |
| Controle | Mandato e políticas considerados, estado de autorização/pausa, restrições, condições de veto e parecer do subagente |
| Comunicação | Proposta/mensagem anterior vinculada, motivo da emissão/revisão, estado atual e confirmação de recebimento |

Regras:

- O risco vem **analisado pelo subagente antes do envio**. Não remeter uma sugestão vazia para a BETTEX calcular seu risco do zero.
- O parecer independente de Risco verifica o conjunto e pode vetar; não substitui a análise que faltou no pacote.
- Tesouraria fornece o retrato de recursos e obrigações usado na proposta. BETTEX atualiza essa condição antes de decidir.
- Informação essencial ausente impede qualificação. “Não aplicável” exige motivo; não disfarça dado desconhecido.
- A BETTEX não inventa um novo alvo, stop ou tamanho fora do pacote. Pode solicitar outra versão.
- Até três tamanhos distintos são comparados: mínimo, recomendado e máximo. Cada um precisa de economia e risco próprios. Se dois forem iguais, há menos alternativas.
- Sem custo/risco comprovado para um tamanho, esse tamanho não é autorizável. Não interpolar custos ou impacto cegamente.

## 4. Quantas propostas entram e quantas são comparadas

### Capacidade inicial proposta

| Item | Regra |
|---|---|
| Especialistas | 3: BTC, ETH e SOL |
| Famílias de estratégia por especialista | Até 4 |
| Propostas correntes por ativo + estratégia | 1 |
| Capacidade de propostas correntes de nova entrada | Até **12**, incluindo as que aguardam revisão/decisão/autorização |
| Propostas qualificadas comparadas numa rodada | De **1 a 12** |
| Mínimo para considerar uma decisão | **1** pacote completo + retratos atuais de Risco e Tesouraria + posições/compromissos conhecidos |
| Alternativas obrigatórias | Investir em nenhuma, em uma, ou em duas propostas, respeitando os limites |
| Posições ou intenções de abertura simultâneas | Até **2**, contando selecionadas aguardando autorização, autorizadas, aberturas pendentes, ativas e resultados incertos que possam representar posição |
| Posição por ativo | Até **1**, independentemente da estratégia |

Não se exige uma proposta de cada especialista nem completar 12. Não havendo nenhuma qualificada, registrar “nenhuma entrada elegível”.

Todas as propostas emitidas recebem registro visível à BETTEX, inclusive incompletas e recusadas na qualificação. **A BETTEX compara todas as qualificadas da rodada**, não apenas as três favoritas de Cripto. Cripto organiza, confronta e verifica o domínio; não pré-escolhe os investimentos.

Para ativo já em carteira, uma nova tese não abre uma segunda posição: torna-se pedido de revisão vinculado à posição, sem aumentar exposição automaticamente.

O limite 12 é de propostas correntes, não do histórico. Reenvio idêntico recebe o mesmo recibo; revisão substitui a versão corrente sem apagar a anterior. Uma estratégia/ativo fora do mandato não expulsa um pacote válido: é registrada e devolvida por escopo. Expansão do universo ou catálogo exige revisar a capacidade.

## 5. Filas e cadência

| Fila | Conteúdo | Tratamento |
|---|---|---|
| Proteção | Stop, alvo, invalidação, vencimento de posição, veto urgente | Imediato; não espera rodada de novas entradas |
| Reconciliação | Movimentação incerta, diferença de posição/recursos | Prioridade sobre novas entradas; compromissos continuam indisponíveis |
| Gestão | Revisão ordinária de investimento ativo | A cada 5 minutos ou por mudança relevante |
| Qualificação/correção | Pacote incompleto ou que precisa de nova evidência | Devolvido com campos/motivos; não disputa capital |
| Decisão | Pacotes completos, atuais e permitidos | Rodada a cada **1 minuto**, sem esperar encher |
| Autorização/entrada | Seleções ainda não executadas | Revalidação antes de autorização e movimento; expiração não renova tese |
| Histórico | Decisões e trajetórias encerradas | Sem limite de 12 e sem exclusão por rejeição |

Prazo lógico inicial para concluir uma comparação: **até 30 segundos após fechar a rodada**. Se não houver decisão válida nesse prazo, registrar pendência e reavaliar a rodada seguinte; não comprar por pressão do relógio.

O lote tem um retrato de propostas, posições, obrigações e políticas. Alteração material retira a versão afetada e exige recompor a decisão. Não usar um retrato antigo para contornar uma restrição nova.

Proteção/reconciliação não disputam as 12 vagas. Há um caso principal de gestão por posição, até dois no total neste limite inicial, com eventos adicionais vinculados; alertas não são descartados por lotação. Atualizações do mesmo caso não criam saídas duplicadas.

## 6. Comunicação e retorno

Fluxo:

**Subagente produz pacote completo, inclusive risco → Cripto verifica e encaminha → Risco/Tesouraria atualizam pareceres → BETTEX compara o lote → decisão registrada → autorização vigente → acompanhamento.**

Cada envio deve retornar:

1. Confirmação de recebimento, número e versão reconhecidos.
2. Resultado da qualificação e motivo.
3. Estado da fila ou rodada de comparação.
4. Decisão da BETTEX, capital/tamanho escolhido e justificativa, quando houver.
5. Condição para reconsiderar ou expiração, quando não houver seleção.

Na decisão, registrar também quais alternativas foram comparadas e por que perderam. “Não escolhido nesta rodada” não é automaticamente “tese inválida”: pode permanecer em espera enquanto válido; rejeição definitiva exige motivo.

Ausência de retorno não significa aprovação. Repetir a entrega não cria outra proposta, autorização ou investimento.

Mudança de entrada, alvo, stop, prazo, tamanho fora das alternativas, evidência material ou risco gera versão nova e reavaliação. Não substituir os termos usados numa decisão já tomada. Um investimento ativo mantém a tese original e recebe atualizações vinculadas.

## 7. Alocação do capital

### Limites iniciais para teste, não política aprovada

- Referência **B**: orçamento de Cripto efetivamente autorizado, ajustado conforme os controles vigentes; nunca a Tesouraria inteira.
- **F**: recursos livres reconciliados que podem financiar novas posições, depois de reservas, obrigações, compromissos e destinações.
- Perda planejada por posição: até **0,25% de B**.
- Perda planejada agregada do grupo BTC/ETH/SOL: até **0,50% de B**.
- Capital exposto por ativo: até **20% de B**; conjunto: até **40% de B**.
- Até duas posições/intenções de abertura, no máximo uma por ativo.
- Cenário conjunto inicial: BTC −5%, ETH −8%, SOL −12%, com custos estressados; perda acima de **2% de B** impede nova entrada.
- Bloqueio de novas compras por perda diária de **2%** ou drawdown de **5%**, calculados com as bases ajustadas por movimentações previstas nos controles.
- Os limites superiores vigentes de Risco/Tesouraria prevalecem se forem mais restritivos.

Sem orçamento aprovado ou sem retrato confiável de recursos/exposição, não há seleção financeira.

### Dimensionamento

Para cada um dos até três tamanhos:

**Capital requerido = quantidade × E + custo de entrada + recursos necessários para a saída.**

**Perda planejada = quantidade × (E − S) + custos no cenário de stop + margens de execução.**

**Ganho líquido no alvo = quantidade × (alvo − E) − custos no cenário de alvo.**

Despesas já incluídas não são somadas outra vez. Valores equivalentes em uma moeda não criam saldo na moeda de pagamento.

O tamanho precisa caber simultaneamente no capital F, risco remanescente, exposição, liquidez, prazo das obrigações e tamanho mínimo útil da estratégia. Não dividir o dinheiro igualmente entre propostas nem aplicar o máximo apenas porque está livre.

Se só couber tamanho inferior ao mínimo qualificado, não entrar. Reduzir pode piorar a relação ganho/perda por causa dos custos fixos; recalcular, não presumir.

Seleção ocupa uma vaga e entra no **planejamento do conjunto**, mas não é reserva financeira nem autorização. A reserva formal continua na aprovação/autorização dos controles vigentes. Compromissos já reservados não são descontados novamente como se fossem um segundo plano.

## 8. Como a BETTEX compara o lote

1. Retirar incompletas, vencidas, vetadas ou sem estratégia habilitada para o ambiente.
2. Incluir posições, aprovações pendentes e recursos já comprometidos.
3. Considerar os tamanhos qualificados de cada pacote.
4. Comparar planos de caixa, uma proposta ou duas propostas de ativos distintos, dentro de todas as restrições.
5. Escolher o conjunto com maior expectativa líquida conservadora, não simplesmente os primeiros itens de uma lista.

**Valor conservador do plano = expectativa líquida do conjunto − margem de incerteza documentada.** A margem vem da avaliação das fontes/modelos, não de um número de “confiança” inventado pela BETTEX.

Usar uma janela comum de avaliação de **72 horas**, cobrindo os prazos máximos propostos. Posições que encerrem antes deixam o valor em caixa até o fim dessa comparação, sem inventar oportunidades de reinvestimento. Não dividir retorno por hora automaticamente.

Expectativas podem ser somadas com métodos compatíveis; riscos e incertezas precisam considerar dependência/correlação. Somar margens por prudência não cria automaticamente um nível estatístico de confiança.

Empate ou diferença não material diante da incerteza: menor perda no cenário conjunto; depois menor capital comprometido, melhor liquidez/custo de saída, evidência mais robusta/atual e ordem de chegada.

Com 12 pacotes, até três tamanhos cada e até duas posições de ativos distintos, há no máximo **36 alternativas individuais e 432 combinações em pares**, além de caixa: **469 planos teóricos**. No caso real haverá menos por duplicidade de tamanhos, posições já abertas, dependências de rotação e vetos.

Não é necessário atingir esse número para decidir. BETTEX recebe até 12 pacotes de investimento, não 469 mensagens. A comparação de conjuntos evita escolher duas propostas boas isoladamente e ruins juntas.

BETTEX pode pedir revisão ou manter caixa se houver contradição relevante. Deve explicar o motivo sem ultrapassar veto ou alterar os termos do pacote.

## 9. Registro de propostas, investimentos e estados

Não confundir três registros vinculados:

1. **Proposta:** o que foi sugerido e com qual evidência.
2. **Decisão:** o lote, as alternativas, pareceres, escolha, tamanho e motivo.
3. **Investimento:** o que efetivamente aconteceu após autorização e entrada confirmada.

Trajetória normal:

**Recebida → qualificação → qualificada/na fila → em comparação → selecionada → aguardando autorização → autorizada/aguardando entrada → entrada pendente → investimento ativo → saída pendente → encerrado e reconciliado.**

Desvios explícitos: incompleta/aguardando revisão, não escolhida/em espera, rejeitada, expirada, cancelada, versão substituída e resultado incerto.

Recusa identifica quem recusou e a razão: falha do pacote, veto, falta de capital, tamanho inviável, concentração, custo, tese inferior ou invalidação. Recusa na qualificação não é uma decisão de investimento da BETTEX.

Movimento incerto fica destacado e preserva recursos comprometidos. Não marcar ativo por seleção, nem encerrado por emissão de uma saída. Redução confirmada mantém o saldo residual ativo.

### Listas que a BETTEX deve manter

- Todas as propostas recebidas e versões.
- Em qualificação/correção.
- Na fila e em comparação.
- Não escolhidas ainda válidas.
- Selecionadas e aguardando autorização/entrada.
- Investimentos ativos, com quantidade, capital, preço, alvo, stop e tempo restante.
- Gestão/saídas pendentes.
- Movimentações incertas.
- Rejeitadas, expiradas e canceladas, em categorias separadas.
- Encerradas e reconciliadas, com resultado efetivo.

## 10. O pacote alimenta o relatório

A [revisão dos relatórios e registros por ciclo](trading-cycle-reports.md) define famílias de relatório, vínculos entre rodadas de análise e ciclos financeiros, continuidade de posições e significado dos gráficos.

O relatório preserva o pacote original e acrescenta decisão, autorizações, entrada, revisões, saída e resultado. Não reescrever o alvo ou o risco original para parecer que o desfecho foi previsto.

Por proposta/investimento, apresentar:

- responsável, ativo, estratégia, versão e datas;
- entrada/alvo/stop/prazos propostos versus executados;
- capital mínimo/recomendado/máximo versus escolhido, reservado e utilizado;
- risco próprio, efeito no conjunto, pareceres e motivos;
- alternativas comparadas, decisão, espera ou rejeição;
- custos previstos versus efetivos;
- tempo esperado versus permanência observada;
- resultado realizado e não realizado separados;
- motivo da saída e divergências;
- situação de reconciliação e encaminhamento à apuração existente.

No consolidado: quantidades recebidas, qualificadas, selecionadas, rejeitadas, expiradas e ativas; capital planejado, reservado, comprometido e livre sem dupla contagem; exposição, perdas e resultados por estratégia/ativo.

Esses totais distinguem estoque e eventos do período. Proposta recebida em um ciclo pode ser decidida em outro; posição pode atravessar ciclos sem virar nova entrada. Cada etapa conserva seu ciclo efetivo e a identidade original.

Rejeitada não gera “lucro perdido” presumido. Acompanhamento posterior é contrafactual identificado, não resultado executável.

Lucro de um investimento não é automaticamente lucro distribuível do ciclo. Continuam as regras de apuração, reservas, direitos e split descritas na [lógica de decisão](trading-decision-logic.md#9-compatibilidade-com-as-regras-existentes).

## 11. Exemplo de pacote — exclusivamente ilustrativo

**Preços, probabilidades, custos e capital fictícios; não são cotações ou inferências reais.** A conta demonstra o contrato; não qualifica uma operação.

| Campo | Exemplo |
|---|---|
| Número / responsável | EXEMPLO-001 / especialista ETH, coordenado por Cripto |
| Estratégia | Continuação após correção |
| Tese / contraponto | Retomada de tendência; perde validade se romper o nível de proteção; movimento pode ser apenas alta geral de mercado |
| Entrada permitida | 99,90 a 100 USDC por unidade; E = 100 |
| Stop / alvo | S = 98; D = 2; alvo = 104 |
| Validade | Emissão às 12h00, vencimento às 12h05; horários ilustrativos de São Paulo |
| Duração | Esperada 8–24h, máxima 48h desde a entrada confirmada |
| Orçamento hipotético | B = 10.000 USDC; risco individual permitido = 25 USDC |
| Quantidades | Mínima 10; recomendada/máxima 10,5 |
| Custos hipotéticos | 2 USDC de entrada + 2 USDC de saída; mesmos custos no alvo/stop neste exemplo |
| Capital requerido no recomendado | 10,5 × 100 + 2 + 2 = 1.054 USDC, incluindo recursos de saída |
| Perda planejada | 10,5 × 2 + 4 = 25 USDC |
| Ganho líquido no alvo | 10,5 × 4 − 4 = 38 USDC |
| Relação líquida alvo/stop | 38 / 25 = 1,52 |
| Desfechos fictícios no recomendado | Alvo: 50% e +38; stop: 40% e −25; prazo: 10% e −10 USDC |
| Expectativa fictícia | 0,50 × 38 − 0,40 × 25 − 0,10 × 10 = 8 USDC |
| Incerteza fictícia | Margem 2 USDC; expectativa conservadora = 6 = 0,24 R |
| Tamanho mínimo | 10 unidades: capital 1.004; perda 24; alvo líquido 36; razão 1,50; expectativa 7,40 e margem 2 USDC, exclusivamente neste exemplo |
| Tamanho abaixo do mínimo | 8 unidades: perda 20; ganho líquido 28; razão 1,40; não qualifica |
| Estresse hipotético | Preço de saída 92: perda de 10,5 × 8 + 4 = 88 USDC; pode ultrapassar o stop |
| Estado | Ilustrativo, sem autorização e sem investimento ativo |

Em um pacote real ainda seriam necessárias evidências verificadas, avaliação das probabilidades/uncerteza, liquidez, recursos, posições, políticas e risco conjunto atuais. Não atribuir essas estimativas fictícias a qualquer fonte externa.

## 12. Casos mínimos de consistência

- Só uma qualificada: pode ser analisada sem aguardar outras.
- Doze qualificadas: todas entram no lote; máximo de duas posições/intenções de abertura no conjunto.
- Capital insuficiente: testar apenas tamanhos qualificados; abaixo do mínimo, não entrar.
- Duas estratégias para o mesmo ativo: comparar e escolher no máximo uma; não somar como confirmações independentes.
- Proposta expira durante comparação/autorização: não entrar sob a versão vencida.
- Parecer novo veta proposta selecionada: rever antes de movimentar; não tratar seleção como autorização.
- Saída urgente com fila cheia: proteção não aguarda vaga.
- Envio repetido: mesmo registro, sem outra posição.
- Movimento incerto: reconciliar, sem liberar capital ou repetir operação.
- Prazo máximo atingido sem saída concluída: permanece ativo/em saída, com risco explícito.
- Posição encerrada com lucro: encaminhar à apuração; não distribuir diretamente.

Referências de autoridade preservadas: [hierarquia e separação entre seleção/autorização](agent-hierarchy.md), [Tesouraria](treasury-governance.md) e [regras do projeto](../PROJECT.md). Nenhuma parte deste contrato ativa os fluxos históricos ou muda permissões.
