# BETTEX — percurso completo de um investimento spot

## 1. Estado, alcance e documentos de referência

**Especificação documental, não implementação.** Este documento executa a revisão da lógica do demo/ALFA na documentação. Não altera telas, dados do aplicativo, agentes, carteiras, permissões ou operações.

O percurso é **análise → proposta → qualificação → comparação → decisão → autorização → execução → posição → relatório → apuração**. Cada etapa conserva seus próprios registros; nenhuma delas, isoladamente, prova que a seguinte aconteceu.

Referências de comportamento: [lógica de decisão](trading-decision-logic.md), [pacote unificado](trading-proposal-contract.md) e [relatórios por ciclo](trading-cycle-reports.md). O [benchmark](trading-market-benchmark.md) informa os critérios, mas não valida estratégias ou parâmetros. Este percurso não substitui regras financeiras aprovadas nem muda a autoridade de Risco/Tesouraria.

Mandato: BTC, ETH e SOL spot, sem alavancagem. Nenhuma rede, representação de ativo, plataforma, modelo ou fornecedor é escolhido aqui. Compra de cotas “Sim/Não” sobre o preço de BTC não é compra de BTC.

## 2. O que precisa estar representado

| Parte | Base existente no demo | Complemento especificado |
|---|---|---|
| Instrumentos | Exemplos de previsões e cotas | Exemplos spot com quantidade, moeda de pagamento, custo e identificação do instrumento; não apenas trocar o rótulo |
| Propostas | Pedidos com preço, recursos, riscos e validade | Estratégia, regime, entrada, alvo, invalidação/stop, relógios e alternativas de tamanho com economia própria |
| Comparação | Decisão, motivo e ranking | Lote completo, qualificadas/impedidas, planos alternativos, condições de Risco/Tesouraria e motivo de não investir |
| Capital | Saldos e compromissos ilustrativos | Retrato comum, exposição existente/correlacionada, intenção selecionada versus reserva autorizada |
| Execução | Ordens, eventos e preenchimentos parciais | Vínculo ao pacote spot, autorização, quantidade restante, incerteza e reconciliação |
| Posições | Abertas e encerradas | Plano original, mudanças, prazo restante, custos, realizado/não realizado e posição herdada |
| Histórico | Percursos e arquivos ilustrativos | Dossiê financeiro por ciclo, versões e continuidade sem duplicação |

No demo, essas leituras podem ser exemplos locais identificados como fictícios. Consultar e navegar não cria registros financeiros. Pedir uma operação, alteração persistida ou novo relatório continua sujeito ao aviso do demo; esta especificação não ativa essas ações.

Na ALFA, as mesmas leituras precisam derivar de evidências e estados efetivos. Código histórico ou uma tela preenchida não comprova que esse percurso operacional esteja pronto.

## 3. Responsáveis e passagem entre etapas

| Etapa | Responsável e entrega | Condição para avançar |
|---|---|---|
| Análise | Especialista BTC/ETH/SOL identifica regime, hipóteses, contrapontos e evidências disponíveis naquele instante | Dados suficientes; estratégia permitida; sem preencher ausência com narrativa inventada |
| Proposta | Especialista entrega o pacote completo, inclusive risco próprio e economia por tamanho | Entrada/saída, validade, tamanho, custos e condições verificáveis |
| Qualificação | Cripto verifica domínio, completude e coerência e encaminha à BETTEX | Corrigir/devolver incompletas; manter recibo e motivo; não selecionar favoritas no lugar da BETTEX |
| Controles | Risco avalia exposição conjunta e impedimentos; Tesouraria informa recursos/obrigações reconciliados | Retratos atuais e identificados; ausência ou veto impede seleção financeira |
| Comparação | BETTEX compara todas as qualificadas e alternativas de caixa/uma/duas posições | Mesma janela, tamanhos permitidos, dependências e incertezas consideradas |
| Decisão | BETTEX registra conjunto escolhido, descartes, razões e condições | Seleção não movimenta caixa nem substitui autorização |
| Autorização | Controles e responsáveis vigentes verificam autoridade, política, pausa, validade e recursos | Só aqui pode haver reserva formal; sem autoaprovação ou nova autoridade criada pelo exemplo |
| Execução | Camada de execução acompanha tentativas, efeitos e confirmação | Mandato/autorização válidos; sem confundir envio com preenchimento |
| Gestão | Especialista acompanha a tese; BETTEX decide dentro da autoridade existente, informada por Risco/Tesouraria | Proteção e reconciliação têm prioridade; mudança material exige revisão |
| Relatório/apuração | Leituras do mesmo histórico, por posição e por ciclo | Resultado reconciliado; lucro elegível e destinações obedecem às regras financeiras próprias |

Informações externas e respostas de modelos são dados a avaliar, não instruções autorizadoras. Parecer do “agente de risco” de uma biblioteca não substitui os controles BETTEX.

## 4. Estratégias: condições observáveis antes de propor

Estas condições refinam a lógica, sem declarar uma estratégia validada. Cada versão deve especificar janela de observação, cálculo, fontes e limiares antes de testar; valores ausentes impedem qualificá-la na ALFA.

| Família | Evidência mínima a definir | Invalidação e impedimentos |
|---|---|---|
| Tendência com correção | Estrutura ascendente identificada por regra; recuo que preserva essa estrutura; retomada confirmada por condição predefinida | Perda da estrutura; preço excessivamente estendido; “caiu” não é confirmação de compra |
| Rompimento | Faixa e bordas definidas com dados anteriores; saída e sustentação por critério predefinido; liquidez/custo compatíveis | Retorno que invalida o rompimento; gatilho identificado só depois de conhecer o resultado |
| Reversão à média | Regime lateral justificado; média/faixa de equilíbrio, desvio e recuperação definidos | Queda estrutural ou tendência forte; não presumir retorno porque o preço está abaixo da média |
| Rotação long-only | Tese completa da nova posição e comparação líquida com manter/reduzir a anterior, incluindo as duas operações | Caixa da venda ainda não confirmado; nova tese vencida; troca baseada apenas no último ativo que subiu |

Conflito entre estratégias vira contraponto ou revisão, não duas exposições independentes no mesmo ativo. Uma posição não troca retroativamente de estratégia para esconder a invalidação.

## 5. Registros, relógios e estados

Cada etapa conserva identificador, versão, responsável, instante do fato, instante de registro, origem da evidência e vínculos anteriores. A proposta vincula análise e retratos; a decisão vincula lote e versões; autorização vincula decisão; ordens e preenchimentos vinculam autorização e investimento; a posição atravessa ciclos com o mesmo identificador.

Os registros distinguem **amostra visual**, **experimento histórico**, **paper/dry-run** e **execução real**. Dado público real usado num exemplo não torna os outros valores reais.

| Entidade | Estados que a documentação deve distinguir |
|---|---|
| Proposta | Recebida, em correção, qualificada, impedida/vetada, selecionada, não selecionada, expirada e substituída por revisão |
| Autorização | Pendente, aprovada, recusada, expirada ou revogada; reserva efetiva registrada separadamente |
| Ordem | Não enviada, enviada, pendente, parcial, concluída, cancelamento solicitado, cancelada, falha sem efeito confirmado ou resultado incerto |
| Posição | Abertura parcial, ativa, saída pendente/parcial, encerrada ou em reconciliação; pendência não apaga exposição |

“Confirmado” sempre identifica **o que** foi confirmado: recebimento, autorização, preenchimento ou reconciliação. Uma proposta não selecionada não é necessariamente inválida; pode ter perdido a comparação ou não caber no conjunto.

Dados, validade da proposta, duração da posição, rodada de comparação e ciclo financeiro têm relógios distintos. A entrada parcial inicia a duração na primeira quantidade confirmada; preenchimentos seguintes não reiniciam o prazo. O ciclo continua das **16h às 16h do dia seguinte, em São Paulo**, em intervalos que incluem a abertura e excluem o encerramento.

Após o primeiro preenchimento, vencimento/cancelamento do saldo não preenchido não desfaz a posição. Um efeito incerto conserva compromissos e vai à reconciliação, sem novo envio automático. Cancelamento solicitado não é cancelamento confirmado.

## 6. Exemplo encadeado — integralmente fictício

### 6.1 Premissas e análise

Os preços, fontes, probabilidades, pareceres e valores seguintes são **dados inventados para conferir a lógica e a aritmética**, não cotações, previsões ou estimativas calibradas. Custos simplificados não representam taxas de nenhuma rede. Nenhum identificador é hash de transação.

O roteiro pressupõe controles favoráveis para mostrar o percurso; não há autorização real. Na ALFA, sem comprovar instrumento/representação/rota, fontes, expectativa, liquidez e controles, esses mesmos pacotes seriam impedidos. “Exemplo qualificado” significa somente qualificado dentro do cenário fictício.

Às 15h58 do Dia 1:

- Orçamento de referência **B = 10.000,00 USDC**; recursos livres **F = 230,00 USDC**, já depois das reservas e obrigações do retrato `T-1`. B não é o saldo livre nem a Tesouraria inteira.
- Não há posições ou intenções abertas; o retrato `R-1` inclui exposição externa conhecida, concentração, perdas e pausas, todas fictícias.
- `AN-ETH-1`: cenário de tendência com correção e retomada definida no roteiro; entrada a 2.000,00, invalidação a 1.950,00 e alvo a 2.100,00.
- `AN-SOL-1`: outra tese da mesma família, entrada a 100,00, invalidação a 95,00 e alvo a 110,00; Risco registra dependência com ETH.
- `P-BTC-1` chega sem evidência temporal válida; fica em correção, visível no lote, sem disputar recursos.

`P-ETH-1` e `P-SOL-1` são emitidas às 15h58 e vencem às 16h03, sob as hipóteses de prazo do pacote atual. A faixa de entrada do exemplo é de 1.998,00 a 2.000,00 para ETH e de 99,90 a 100,00 para SOL. O gatilho é a retomada descrita na análise, não apenas tocar o preço.

Ambas conservam duração esperada de 8–24 horas, máximo de 48 horas e revisão conforme o contrato proposto. Stop, alvo e saída por tempo não garantem execução. A perda extrema não fica limitada ao stop; perda de valor do ativo, custos adicionais e falhas devem ter cenário próprio.

### 6.2 Tamanhos entregues pelos especialistas

Cada alternativa assume custo total de entrada de **0,10 USDC** e provisão de saída de **0,10 USDC**. O capital requerido inclui ambos; a provisão não é despesa até ser consumida.

| Alternativa | Quantidade | Capital requerido | Ganho líquido no alvo | Perda planejada no stop | Expectativa líquida ilustrativa |
|---|---:|---:|---:|---:|---:|
| ETH mínimo | 0,05 | 100,20 | 4,80 | 2,70 | 1,05 |
| ETH recomendado | 0,10 | 200,20 | 9,80 | 5,20 | 2,30 |
| ETH máximo | 0,20 | 400,20 | 19,80 | 10,20 | 4,80 |
| SOL mínimo | 0,50 | 50,20 | 4,80 | 2,70 | 0,675 |
| SOL recomendado/máximo | 1,00 | 100,20 | 9,80 | 5,20 | 1,55 |

Valores financeiros em USDC. Quantidades em ETH ou SOL. As expectativas usam somente dois desfechos fictícios, alvo/stop: probabilidade de alvo de 50% em ETH e 45% em SOL. Não são um modelo suficiente para a ALFA: omitem outros desfechos, precisam de calibração e não podem ser usados para qualificar dinheiro real.

Exemplo ETH recomendado: capital = `0,10 × 2.000 + 0,10 + 0,10 = 200,20`; ganho = `0,10 × (2.100 − 2.000) − 0,20 = 9,80`; perda planejada = `0,10 × (2.000 − 1.950) + 0,20 = 5,20`. Expectativa didática = `0,50 × 9,80 − 0,50 × 5,20 = 2,30`.

As alternativas passam, apenas nesta conta fictícia, pelas razões de ganho/perda e expectativa propostas no contrato; isso não valida os limiares. ETH máximo não cabe em F. As duas propostas também declaram risco além do stop, liquidez de saída e dependência; dados ausentes impediriam a avaliação real.

### 6.3 Comparação e escolha

A rodada `L-1` conserva os três pacotes recebidos, sendo dois qualificados no cenário e BTC devolvido. Cripto não esconde SOL para encaminhar somente ETH. BETTEX compara caixa, cinco tamanhos individuais e seis pares, sempre na janela proposta de 72 horas, sem supor reinvestimento após a saída.

| Plano | Recursos requeridos | Resultado conservador ilustrativo | Tratamento |
|---|---:|---:|---|
| Caixa | 0,00 | 0,00 | Alternativa de não entrar; não significa ausência de risco da moeda |
| ETH mínimo | 100,20 | 0,85 | Elegível no cenário |
| ETH recomendado | 200,20 | 2,10 | Escolhido |
| ETH máximo | 400,20 | — | Impedido por F |
| SOL mínimo | 50,20 | 0,475 | Elegível, não selecionado |
| SOL recomendado/máximo | 100,20 | 1,15 | Elegível, não selecionado |
| ETH mínimo + SOL mínimo | 150,40 | 1,125 | Elegível, inferior ao escolhido |
| ETH mínimo + SOL recomendado | 200,40 | 1,80 | Elegível, inferior ao escolhido |
| ETH recomendado + SOL mínimo | 250,40 | — | Impedido por F |
| ETH recomendado + SOL recomendado | 300,40 | — | Impedido por F |
| ETH máximo + SOL mínimo | 450,40 | — | Impedido por F |
| ETH máximo + SOL recomendado | 500,40 | — | Impedido por F |

Resultado conservador = expectativa ilustrativa − margem de incerteza ilustrativa. Margens individuais do parecer `R-1`: ETH 0,20/0,20/0,40; SOL 0,20/0,40. Nos dois pares que cabem, margens conjuntas de 0,60 e 0,80 consideram a dependência, sem alegar nível estatístico de confiança. São insumos fictícios de avaliação, não números inventados pela BETTEX durante a escolha nem parâmetros aprovados.

O parecer fictício também verifica os outros limites propostos: por exemplo, ETH recomendado tem exposição de 200,00 e perda planejada de 5,20 contra B de 10.000,00; o choque ETH de −8%, mais custos simplificados, produziria perda de 16,20. Ausência de exposição/obrigações conhecidas não pode ser presumida num ambiente real.

`D-1` seleciona ETH recomendado por maior resultado conservador entre os planos permitidos, com 29,80 de folga planejada. Registra SOL como não selecionado, BTC em correção e ETH máximo impedido por recursos. A seleção ocupa uma intenção e afeta o planejamento, **não reserva dinheiro**.

### 6.4 Autorização, execução parcial e posição

| Momento, em São Paulo | Evento e registro | Efeito na subcarteira do exemplo |
|---|---|---|
| Dia 1, 15h59 | Controles vigentes revalidam dados/termos e emitem `A-1`; reservam 200,20 | Caixa 230,00; reserva 200,20; livre 29,80 |
| Dia 1, 15h59min30s | `O-1` confirma `F-1`: 0,06 ETH a 2.000,00, custo 0,06; nasce `I-1` | Caixa 109,94; reserva restante 80,14; livre 29,80; posição 0,06 ETH |
| Dia 1, 16h00 | Corte do ciclo, usando a marcação fictícia de 2.050,00 observada às 15h59min59s, antes do limite | Posição vale 123,00; custo carregado 120,06; não realizado +2,94 |
| Dia 1, 16h01 | Preço volta a 2.000,00; nova verificação confirma validade até 16h03 e condições; `F-2` preenche 0,04 ETH, custo 0,04 | Caixa 29,90; reserva de saída 0,10; livre 29,80; posição total 0,10 ETH com custo 200,10 |
| Dia 2, 10h00 | Alvo observado; saída autorizada conforme controles vigentes: venda de 0,10 ETH a 2.100,00, custo 0,10; reconciliação confirma encerramento | Recebimento líquido 209,90; caixa 239,80; reserva zero; posição zero |

O salto e a volta dos preços são parte do roteiro fictício. Não se preenche a segunda parcela a 2.050,00, fora da faixa autorizada. Ela não cria nova proposta/posição nem reinicia os relógios; sem revalidação, o saldo não poderia ser executado.

Na saída, observar o alvo não é confirmar a venda: antes da confirmação, a posição continua exposta. Se houver execução parcial, o restante permanece aberto com reserva/risco correspondentes. Se houver efeito incerto, reconciliar a mesma tentativa antes de qualquer novo envio.

### 6.5 Dois ciclos, um investimento

A subcarteira começa com 230,00 USDC e não recebe depósitos, retiradas ou outras operações. Ela não representa todo o patrimônio da Tesouraria. A reserva está dentro do caixa, não é um ativo adicional.

| Apuração econômica | Ciclo A: Dia 0, 16h → Dia 1, 16h | Ciclo B: Dia 1, 16h → Dia 2, 16h |
|---|---:|---:|
| Patrimônio de abertura da subcarteira | 230,00 | 232,94 |
| Caixa no encerramento | 109,94 | 239,80 |
| Valor da posição no encerramento | 123,00 | 0,00 |
| Patrimônio no encerramento | 232,94 | 239,80 |
| Resultado realizado reconhecido no ciclo | 0,00 | 9,80 |
| Variação do resultado não realizado | +2,94 | −2,94 |
| Variação patrimonial sem fluxos externos | +2,94 | +6,86 |

Resultado total do investimento: `210,00 − 200,00 − 0,10 − 0,10 = 9,80`. Resultado dos ciclos: `2,94 + 6,86 = 9,80`, e não `2,94 + 9,80`. O custo de entrada já integra o custo carregado; não deduzi-lo outra vez.

`I-1` é posição herdada no Ciclo B, não investimento novo. O segundo preenchimento aumenta a mesma posição. A ordem de entrada pode ter eventos em dois ciclos; cada fato pertence ao intervalo de seu próprio instante, mantendo os vínculos originais.

**Resultado econômico não é automaticamente lucro distribuível.** Os 2,94 não realizados do Ciclo A não ficam disponíveis para saque. Os 9,80 realizados também passam por reconciliação, despesas/impostos aplicáveis, obrigações, elegibilidade e apuração conforme regras vigentes. Não aplicar distribuição ou alterar direitos diretamente a partir desta tabela.

## 7. Relatórios e gráficos derivados

As [oito famílias de relatório](trading-cycle-reports.md) devem permitir consultar o mesmo percurso, não oito resultados independentes.

| Leitura | Conteúdo deste roteiro |
|---|---|
| Especialista | Regime, quatro famílias examináveis, tese escolhida, contrapontos, fontes e proposta/versão |
| Lote/decisão BETTEX | Todos os recebidos, qualificação, doze planos, restrições, pareceres e escolha |
| Risco/Tesouraria | Retratos usados, recursos livres, reservas, exposição conjunta e alterações posteriores |
| Execução | Autorização, ordem, dois preenchimentos de entrada, ordem de saída, custos e reconciliação |
| Investimento | Tese original, relógio desde a primeira entrada, custo, quantidade, atualizações e encerramento |
| Ciclo | Abertura/fechamento, eventos próprios, posição herdada e reconciliação de resultado |

O gráfico de preço marca entrada, alvo e invalidação; não apresenta uma linha prevista como fato. Quantidade/exposição muda nos preenchimentos, não na seleção. Caixa, reservado e livre são leituras relacionadas, não parcelas a somar indiscriminadamente. Resultado realizado, não realizado e patrimônio mantêm suas bases e eventos; contagens distinguem proposta, decisão, ordem, preenchimento e investimento.

Modelo/prompt/memória, dados e parâmetros usados ficam vinculados à análise. Revisões não apagam o estado da época nem usam o resultado futuro como se fosse evidência disponível na decisão.

## 8. Casos de consistência e critérios de aceite

| Caso | Resultado exigido na documentação e em futura implementação |
|---|---|
| Fonte ausente, atrasada ou contraditória | Mostrar pendência; não completar com número inventado nem promover amostra a cotação real |
| Pacote sem stop, alvo, prazo, custos ou risco próprio | Devolver com motivo; não disputar capital |
| Risco/Tesouraria indisponíveis, pausa ou veto | Impedir seleção/autorização correspondente; proteção e reconciliação continuam prioritárias |
| Duas teses do mesmo ativo | Uma exposição; revisão vinculada, sem duplicação de posição |
| Correlação e reservas futuras | Avaliar conjunto e capital comprometido; não somar confirmações como independentes |
| Nenhum plano com vantagem sustentada | Registrar caixa/aguardar, sem obrigação de investir |
| Proposta vence antes da entrada | Não iniciar; atualização exige versão e nova avaliação, não renovação silenciosa |
| Proposta vence após preenchimento parcial | Não iniciar o saldo vencido; confirmar cancelamento quando necessário e gerir a posição já existente |
| Ordem enviada, falha ou efeito incerto | Não presumir compra nem ausência de efeito; reconciliar antes de liberar recursos/repetir |
| Saída parcial ou inviável no stop/prazo | Posição restante continua aberta, com alerta; perda planejada não vira garantia |
| Mudança de alvo, stop, prazo ou tamanho | Nova versão e autorização conforme autoridade vigente; sem reescrever plano/decisão anteriores |
| Cancelar, substituir ou corrigir registro | Conservar versão, motivo e vínculos; não apagar fatos financeiros |
| Resultado positivo só nas vendas fechadas | Mostrar também inventário, não realizado e custos; admitir resultado total negativo |
| Investimento atravessa 16h | Herdar posição; não duplicar contagem, custos ou resultado |
| Depósito/retirada entre cortes | Distinguir fluxo externo de desempenho; não usar variação bruta de saldo como retorno |
| Ação solicitada no demo visual | Aviso do demo; nenhuma operação, mutação financeira ou agente real ativado |

## 9. Separação entre documento, demo e ALFA

| Entrega | Estado após esta revisão |
|---|---|
| Percurso completo, exemplo spot, estados, comparação e apuração | Especificados neste documento |
| Representação do novo percurso na interface | Não implementada por esta revisão |
| Estratégias e parâmetros economicamente validados | Não; permanecem hipóteses |
| Inferência real e evidências reproduzíveis | Requisito de ALFA, não ativado |
| Controles operacionais, execução e reconciliação do novo fluxo | Exigem implementação/validação próprias; código histórico não basta |
| Rede, ativo representado, plataforma, modelo e fornecedor | Não escolhidos |

Para avançar à ALFA, primeiro fixar definições e método de avaliação, registrar variantes testadas, separar treino/validação/teste não visto e medir custos/saída/falhas por tamanho. Demonstrar depois que controles e reconciliação suportam o percurso, sem confundir esse trabalho com autorização de fundos reais.

Esta revisão não altera os números do pacote, não concede autoridade nova, não aprova negociação nem modifica homepage/Pitch. O demo permanece exclusivamente visual.
