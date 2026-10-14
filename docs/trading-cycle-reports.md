# BETTEX — relatórios, gráficos e registro por ciclo

## 1. Escopo da revisão

Revisão da lógica dos relatórios existentes à luz do [pacote unificado de investimento](trading-proposal-contract.md). Não escolhe tecnologia, não ativa agentes, não altera o demo nem transforma as hipóteses numéricas em políticas aprovadas.

O registro completo relaciona **análise → proposta → qualificação → comparação → decisão → autorização → investimento → resultado → apuração do ciclo**.

Relatórios, gráficos, histórico do subagente, histórico da BETTEX e Tesouraria são leituras desse mesmo percurso. Não produzem números financeiros independentes.

O [benchmark de mercado](trading-market-benchmark.md) complementa a revisão com referências de resultado realizado/não realizado, alterações de parâmetros e distinção entre experimento e execução. Não altera os ciclos financeiros nem substitui esta lógica.

O [percurso completo spot](trading-spot-journey.md) fornece um caso documental com proposta, decisão, reserva, dois preenchimentos de entrada, saída e reconciliação econômica em dois ciclos, sem alterar o aplicativo.

## 2. Inventário: o que já existe e o que precisa mudar

| Registro existente | Capacidade observada | Revisão lógica necessária |
|---|---|---|
| Atividade/histórico dos agentes | Rodada, dependências, estado, achados e evidências; no demo visual, amostras escritas à mão | Separar atividade, análise e decisão financeira; relacionar a rodada de análise ao ciclo financeiro |
| Raciocínio/contexto | Resumo, observações, incertezas e próximos passos | Relacionar à proposta/versão e preservar o diagnóstico da época, sem chamar texto ilustrativo de inferência real |
| Pedidos/oportunidades | Preço, capital, retorno, perda, riscos, fontes, validade e percurso | Incorporar todo o pacote spot: estratégia, entrada, alvo, stop, durações e alternativas de tamanho com risco próprio |
| Decisões BETTEX | Pedido vinculado, estado, ranking, motivo e valor solicitado | Registrar lote completo, versões comparadas, condições de Risco/Tesouraria, capital escolhido e motivos de descarte |
| Ordens/movimentações | Pedido vinculado, pendência, quantidades e eventos | Separar autorização, envio, efeito, confirmação e incerteza; não tratar os exemplos antigos de cotas YES/NO como ativos spot |
| Posições/encerradas | Quantidade, custo, saída, situação e vínculo ao pedido | Adicionar plano original, mudanças autorizadas, tempo restante, resultado e continuidade entre ciclos |
| Tesouraria | Ciclo atual, retratos, carteiras, atividade, reservas e destinações | Explicitar qual retrato informou cada decisão, sem contar seleção como movimento de dinheiro |
| Histórico/arquivo de ciclos | Filtros, percursos correlacionados, rodadas financeiras e participação | Reunir a cadeia decisória no dossiê do ciclo, incluindo recusadas, pendentes e posições herdadas |

### Lacunas identificadas

- Os exemplos da Central usam contratos de previsão, não o novo mandato spot.
- O ciclo de atividade de um agente não estabelece, sozinho, o ciclo financeiro da decisão.
- O pedido atual não contém todos os campos do pacote novo.
- O registro de decisão não conserva o conjunto completo de alternativas e tamanhos avaliados.
- Os eventos ilustrativos da Central têm percurso correlacionado, mas não um vínculo financeiro de ciclo explícito em cada etapa.
- O estado genérico “confirmado” de uma decisão não pode significar capital autorizado, execução confirmada ou lucro disponível.

Essas são lacunas para a implementação futura; não foram corrigidas no aplicativo nesta revisão.

### Evidências consultadas

- `artifacts/bettex-site/src/components/interface-demo/central-data.ts`: amostras de atividade, raciocínio, pedidos, decisões, ordens e posições.
- `CentralRecords.tsx`, no mesmo diretório: filtros e percurso dessas amostras.
- `central-audit-data.ts`: projeção correlacionada no Histórico; não são movimentos adicionais de caixa.
- `history-demo-data.ts`: eventos ilustrativos, referências de participação e arquivo de rodadas.
- `CentralBettex.tsx` e `CentralInspector.tsx`: leituras da Central e seus registros.
- `MockTreasuryPanel.tsx` e `MockHistoryPanel.tsx`: composição das áreas atuais.
- [Manual histórico dos agentes](agents-operations.md): relatórios de observação e rodadas periódicas do runtime anterior; não prova atividade financeira do demo atual.
- [Auditoria do demo](demo/data-and-audit.md): provenance e limites dos dados modelados.

## 3. Não confundir os relógios

| Conceito | O que identifica |
|---|---|
| Ciclo financeiro | Período de apuração, foto financeira e direitos de participação |
| Rodada de análise/comparação | Avaliação de um lote de propostas dentro do ciclo; pode haver muitas |
| Validade da proposta | Prazo para considerar uma entrada nas condições da tese |
| Horizonte da inferência | Instante/período ao qual uma previsão se refere |
| Duração do investimento | Permanência da posição desde a entrada confirmada |

No roteiro visual vigente, o ciclo financeiro vai de **16h às 16h do dia seguinte, em São Paulo**, por 24 horas reais. Isso não muda instantes, períodos ou regras de registros/contratos nativos.

Cada intervalo inclui sua abertura e exclui seu encerramento: evento efetivo exatamente às 16h pertence ao novo ciclo.

Encerrar um ciclo não encerra posições, renova propostas, zera risco/drawdown, libera compromissos nem reinicia limites que seguem outra regra de vigência.

Os identificadores antigos continuam preservados. Uma rodada de análise e um ciclo financeiro têm vínculos, não recebem forçadamente o mesmo número.

## 4. Como cada registro se vincula ao ciclo

Todo fato conserva responsável, instante de ocorrência, instante de registro/coleta, origem, referências, versão, estado e motivo.

O percurso conserva separadamente:

- rodada e ciclo em que a análise foi produzida;
- ciclo de emissão da proposta;
- ciclo do primeiro recebimento pela Central;
- rodada e ciclo de cada decisão;
- ciclo de autorização/compromisso;
- ciclo de confirmação da entrada;
- ciclos de acompanhamento e mudanças;
- ciclo de confirmação da saída;
- ciclo da apuração que reconheceu o resultado;
- ciclo e referência de eventual retificação.

Uma decisão pertence ao ciclo em que efetivamente ocorreu, não ao ciclo da emissão da proposta. O pacote original mantém sua origem.

Para movimentos/resultados, o instante efetivo de reconhecimento segue a confirmação exigida pelos controles vigentes. Preservar o instante nativo do movimento separadamente; não substituir ocorrência por hora de coleta.

Informação tardia com efeito sobre período já encerrado exige retificação vinculada, sem reescrever silenciosamente o relatório. Retificação não concede autorização para novo pagamento, reenvio ou restauração de direito cancelado.

Um fato novo no ciclo B não é automaticamente um erro no ciclo A: pagamento, cancelamento ou encerramento posterior pertence ao B e se vincula à origem. O arquivo distingue **estado na época** e **situação atual**, sem trocar um pelo outro. Retificação serve para corrigir um fato do período anterior, não para levar todos os estados atuais para o passado.

**Exemplo de virada:** proposta emitida às 15h59 e recebida/decidida às 16h00 pode ter origem no ciclo anterior e decisão no novo. Continua sujeita ao vencimento original; retratos de Tesouraria/Risco precisam ser revalidados. Não executar usando obrigações antigas apenas para preservar a análise.

## 5. Oito famílias de relatório

| Família | Conteúdo | Responsabilidade |
|---|---|---|
| 1. Análise do subagente | Regime, estratégia avaliada, evidências, inferência, contrapontos, diagnóstico e risco próprio | Especialista que produziu a análise |
| 2. Proposta e qualificação | Pacote integral, versões, entrega/recebimento, devolução, qualificação e validade | Subagente + verificação de Cripto |
| 3. Consolidação Cripto | Propostas do domínio, conflitos, dependências, correlação e solicitações de revisão | Cripto; não decide investimentos |
| 4. Decisão BETTEX | Lote, alternativas, recursos/limites considerados, seleção/espera/recusa, capital e justificativa | BETTEX |
| 5. Risco e Governança | Pareceres independentes, vetos, mudanças, políticas vigentes e condições para prosseguir | Risco/Governança |
| 6. Tesouraria | Recursos reconciliados, disponibilidade, reservas, obrigações, compromissos e destinações | Tesouraria |
| 7. Investimento | Autorização, entrada, plano original, acompanhamento, saída, custos e resultado | Percurso do investimento, confirmado pelos controles |
| 8. Fechamento do ciclo | Consolidação financeira, decisões, pendências, apuração, distribuição/recomposição e avaliação | Dossiê agregado do ciclo |

São famílias de informação, não novos serviços ou uma escolha de implementação.

### Um relatório de subagente não é apenas uma proposta

Registrar também “nenhuma oportunidade”, dados insuficientes, estratégia incompatível, fonte vencida e análise que pede investigação. Caso contrário, o histórico só mostra os momentos em que o agente quis operar.

Repetir observação não cria outra análise independente nem previsão nova. O relatório identifica as dependências utilizadas.

## 6. Registro obrigatório de cada decisão BETTEX

Além do pacote:

1. Referência da rodada e ciclo financeiro.
2. Propostas/versões recebidas, qualificadas, retiradas e efetivamente comparadas.
3. Tamanhos considerados e planos de nenhuma, uma ou duas entradas.
4. Posições e intenções de abertura já existentes, incluindo incertezas.
5. Retrato de Tesouraria e parecer de Risco usados, com atualidade e restrições.
6. Políticas vigentes e regras que permitiram/bloquearam alternativas.
7. Capital solicitado, tamanho recomendado, tamanho escolhido e necessidade de recursos.
8. Resultado conservador, incerteza e risco do plano escolhido; motivos dos descartes.
9. Decisão: selecionar, não escolher ainda, recusar, pedir revisão ou manter caixa.
10. Responsável, instante, validade e condições para reconsideração.

Conservar a comparação completa consultável, ainda que a leitura principal mostre apenas resumo. Ranking isolado não explica a decisão.

O capital depois de uma **seleção** muda no planejamento, não no caixa ou na reserva financeira. Autorização, reserva, entrada e efeitos posteriores têm eventos próprios.

## 7. Dossiê de cada ciclo financeiro

### Abertura

- Identificador e período do ciclo.
- Retrato de recursos, obrigações, reservas e políticas vigentes.
- Posições herdadas, com tese original e tempo restante.
- Propostas ainda válidas, autorizações pendentes e movimentos incertos herdados.
- Restrições que continuam vigentes.

### Durante o ciclo

- Análises dos especialistas e consolidações de Cripto.
- Pacotes novos, revisões, devoluções e recusas.
- Todas as rodadas e decisões da BETTEX.
- Mudanças de disponibilidade, obrigações, risco e política.
- Autorizações, movimentos, acompanhamento e saídas.
- Alertas, falhas, incertezas e reconciliações.

### Encerramento do período

- Foto final financeira e de posições.
- Resultado realizado no período, valorização não realizada e movimentações de capital separados.
- Capital/obrigações que continuam comprometidos.
- Propostas, posições e pendências levadas ao próximo ciclo.
- Estado da apuração e vínculo à distribuição/recomposição, quando cabível.
- Resumo por agente, ativo, estratégia e motivo de decisão.

Estados do dossiê distinguem: aberto; período encerrado com apuração pendente; apurado sem liberação; apurado com valores liberados; pagamentos pendentes; conciliado. Retificação é identificada separadamente por versão: um relatório retificado pode continuar com pagamentos ou reconciliação pendentes.

O novo período pode começar com pendências herdadas. Elas não viram recursos livres nem resultado zero. Incerteza que afete a apuração ou reservas impede a liberação correspondente.

## 8. Investimentos atravessam ciclos sem virar investimentos novos

Um investimento conserva sua identidade e a proposta/decisão de origem.

O ciclo seguinte recebe um **retrato de continuidade**, não outra entrada: quantidade remanescente, capital comprometido, valor observado com fonte/idade, resultado não realizado, alvo/stop vigentes, prazo restante, alterações e pendências.

Novas revisões são eventos vinculados. Não reiniciar duração, alterar retroativamente a tese, contar capital novamente como recém-alocado ou contar a posição herdada como uma nova posição aberta.

### Exemplo financeiro ilustrativo em dois ciclos

- Ciclo A: posição entra; termina aberta com valorização não realizada de **30 USDC**.
- Ciclo B: a posição encerra com resultado líquido total confirmado de **100 USDC**.
- Resultado realizado reconhecido no B: **100 USDC**, sujeito à apuração existente.
- Variação econômica por avaliação: A = **30**; B = **100 − 30 = 70**; total = **100**, não 130.
- A parcela não realizada remanescente no encerramento da posição é zero, não outros 30.

Não somar fluxo de resultado realizado a estoques históricos de valorização como se fossem lucros diferentes.

Esses valores são fictícios. Posição aberta, preço defasado ou efeito não conciliado não fornecem lucro distribuível confirmado.

## 9. Contagens, comparação histórica e aprendizado

Separar **estoques** de **eventos do período**:

- Ativas no início/fim do ciclo versus entradas/encerramentos confirmados no ciclo.
- Propostas correntes versus propostas novas, revisões e mensagens repetidas.
- Seleções versus autorizações e entradas.
- Rejeição versus expiração, cancelamento e espera.
- Análise produzida versus proposta emitida.

Exemplo de continuidade de posições: **ativas finais = ativas iniciais + entradas confirmadas − encerramentos totais confirmados**. Uma redução parcial não remove uma posição nem cria outra.

Um ciclo pode decidir propostas recebidas no anterior. Por isso, não calcular “selecionadas / recebidas no ciclo” como taxa de seleção sem explicar os grupos. Para conversão, acompanhar o mesmo grupo de propostas pelo primeiro recebimento, até seus desfechos.

No relatório por subagente/estratégia:

- cobertura e impedimentos da análise;
- propostas completas versus devolvidas;
- decisões e motivos da BETTEX;
- expectativa e risco originais versus resultados observados;
- custos, duração e saídas por alvo/stop/prazo;
- investimentos ainda abertos e movimentos incertos;
- comparações de inferência no horizonte correto, quando houver dados suficientes.

Não atribuir sucesso ao especialista apenas porque sua proposta foi escolhida. Não atribuir lucro à BETTEX por uma posição ainda valorizada. Taxa de trades positivos usa somente encerrados e reconciliados, com quantidade da amostra explícita.

Rejeitadas podem ter acompanhamento posterior identificado como contrafactual. Não registrar “lucro perdido” como se a entrada/saída fossem executáveis pelos melhores preços.

## 10. Gráficos: significado e origem

Esta seção define o que representar; não cria gráficos nem escolhe biblioteca.

| Gráfico | Deve representar | Fonte lógica | Cuidado principal |
|---|---|---|---|
| Mercado e tese | Preço observado, entrada, alvo, stop, previsão com horizonte e eventos da posição | Evidências e pacote/versão | Não confundir preço de contrato de previsão com preço spot nem desenhar intervalo de confiança inexistente |
| Fila e decisões | Propostas por estado e evolução, com origem/continuidade de ciclos | Propostas e decisões | Não tratar revisões como novos investimentos ou sugerir que espera aumenta vantagem |
| Recursos da Tesouraria | Disponibilidade, reservas, obrigações e compromissos, na mesma base financeira | Retratos reconciliados | Categorias sem sobreposição; seleção não é reserva; exposição em ativos não é caixa |
| Exposição e risco | Posições, concentração, perda planejada e estresse versus limites aplicáveis | Investimentos e pareceres | Bases iguais para percentuais; stop não é limite garantido de perda |
| Resultados | Realizado, variação de não realizado, resultado econômico e custos conforme apuração | Investimentos/apuração | Não somar fluxo a estoque nem contar ganho duas vezes |
| Desempenho por estratégia | Expectativa versus resultado, amostra, duração e motivos de saída | Pacotes e encerramentos reconciliados | Não esconder abertas/incertas nem comparar fontes/horizontes incompatíveis |
| Destino do lucro | Recomposição ou split autorizado, pagamentos pendentes/confirmados e recompra segregada | Apuração e movimentos confirmados | Liberado não é pago; transferência entre carteiras não é lucro novo |

Cada ponto relevante deve permitir identificar o registro de origem, ciclo, proposta/decisão e fonte. Os gráficos e tabelas devem usar o mesmo recorte e os mesmos números.

Histórico de ciclo fechado não pode ser desenhado com saldo, posição ou alvo atuais. Falta de dado gera lacuna/indisponibilidade, não zero ou interpolação apresentada como observação.

Dados ilustrativos, observados, estimados e nativos permanecem identificados e não são misturados em indicadores de performance real.

## 11. Relação com Tesouraria e apuração

Preservar [regras do projeto](../replit.md), [controle da Tesouraria](treasury-governance.md) e [compatibilidade econômica](trading-decision-logic.md#9-compatibilidade-com-as-regras-existentes).

- Capital retornado não é lucro. Entradas/saídas de capital não são desempenho da estratégia.
- Resultado de uma venda não dispara distribuição direta.
- Lucro líquido confirmado entra na apuração aplicável, considerando os demais resultados e condições.
- Se as reservas exigidas não estiverem atendidas, 100% do lucro líquido daquela apuração recompõe a Tesouraria, sem divisão de um suposto restante.
- Somente com reservas e condições atendidas aplica-se 50% Tesouraria, 25% staking e 25% carteira exclusiva de recompra.
- Registro distingue calculado, autorizado, pendente, pago e cancelado.
- Qualquer saída de BETTEX cancela direitos não pagos conforme a regra vigente; relatório ou autorização antigos não os restauram. USDC já recebido e saque de USDC mantêm seu tratamento existente.
- Frações não executáveis retornam à Tesouraria no cálculo, sem acumulação. Recompra não utilizada permanece segregada.
- Histórico conserva cancelamentos e não inventa redistribuição.

Relatório coletivo não expõe dados pessoais dos participantes. Detalhes individuais seguem as permissões existentes.

## 12. Consulta, arquivo e correções

- Na Central: investigação do agente, propostas e decisões, com ligação ao percurso.
- Na Tesouraria: condição atual, ciclo corrente e atalho ao arquivo; não reintroduzir lista extensa de ciclos passados.
- No Histórico: dossiê completo por ciclo, filtros por agente/ativo/estratégia/estado e percurso de proposta/investimento.
- No percurso: todos os ciclos atravessados, sem perder a identidade de origem.
- No arquivo: pelo menos um ano de ciclos diários consultável com paginação; limite da tela não limita o histórico.

O dossiê fechado conserva sua versão publicada. Correção acrescenta versão, motivo, fatos afetados e referência anterior; não apaga a decisão original nem reescreve os dados usados pelo agente.

Abrir a tela, atualizar, trocar idioma ou exportar relatório não produz análise, proposta, decisão, movimento ou apuração.

## 13. Casos mínimos de verificação

1. Proposta emitida antes do corte e decidida depois: ciclos distintos, validade original preservada.
2. Investimento ativo por mais de um ciclo: uma posição, retratos sucessivos, prazo sem reinício.
3. Ganho não realizado seguido de encerramento: resultado sem dupla contagem.
4. Proposta do ciclo anterior selecionada no atual: contagens e grupo de conversão corretos.
5. Fonte defasada: gráfico/histórico indica ausência; não cria resultado.
6. Movimento incerto na virada: compromisso e estado herdados, sem reenvio.
7. Ciclo sem oportunidade: análise e decisão de caixa registradas.
8. Veto após seleção: mudança registrada; nenhuma autorização presumida.
9. Capital retirado/depositado: não classificado como perda/lucro.
10. Créditos autorizados cancelados antes do pagamento: histórico preservado, sem restauração automática.
11. Retificação tardia: versão anterior preservada, sem novo pagamento automático.
12. Relatório fechado aberto meses depois: dados da época, não os saldos atuais.

**Próxima implementação:** unificar a narrativa e os registros ilustrativos do demo com este contrato, após revisão das regras propostas. Isso não autoriza inferência real, conexão de carteira, execução, reativação dos runtimes financeiros históricos ou nova integração. Arquivar o relato ilustrativo não cria outro livro de saldos ou movimentos.
