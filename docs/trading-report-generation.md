# BETTEX — geração dos relatórios e dependências dos subagentes

> **Leitura:** [guia demo/ALFA](documentation-map.md) · **Anterior:** [relatórios por ciclo](trading-cycle-reports.md) · **Próximo:** [avaliação das estratégias](trading-strategy-validation.md)

## 1. Escopo e constatação da revisão

Este documento especifica **como gerar, vincular, revisar e verificar** as [oito famílias de relatório](trading-cycle-reports.md). Não apenas o que mostrar. Complementa o [inventário determinístico](trading-deterministic-functions.md) e o [percurso spot](trading-spot-journey.md), sem implementar ou ativar geração no aplicativo.

A leitura de código selecionado encontrou três mecanismos distintos:

1. Avaliações por regras e seus registros de rodadas técnicas.
2. Relatórios de interpretação por modelo, vinculados à evidência de uma execução.
3. Projeções de amostras locais em histórico/leituras do demo.

Esses mecanismos não comprovam uma cadeia integrada que gere todas as oito famílias do novo mandato spot. `cycleId` de execução técnica não é automaticamente ciclo financeiro; dados de previsões/cotas não são operações spot. Referências e limites da leitura estão no inventário, não constituem teste do runtime.

## 2. Três camadas do conteúdo

| Camada | Origem e responsabilidade | Regra |
|---|---|---|
| Fatos e métricas | Registros/cálculos determinísticos, com fonte, unidade, instante e versão | Modelo não inventa quantidade, custo, saldo, ranking calculado ou efeito |
| Análise/justificativa | Especialista, Cripto, BETTEX ou parecer responsável, com proveniência | Separar interpretação de observação; ausência de análise não é preenchida por texto fixo rotulado como IA |
| Apresentação | Tabelas, séries, idioma, filtros e formatação | Representar o mesmo conteúdo; tradução/consulta não cria outro fato financeiro |

Pode haver relatório factual sem narrativa, ou relatório de falha sem métricas. Não esconder essa condição sob “relatório completo”. Um relatório favorável não aprova proposta, movimenta fundos ou torna lucro disponível.

## 3. Contrato comum de relatório

| Campo/bloco | Conteúdo exigido |
|---|---|
| Identidade | Relatório, família, responsável, escopo/ativo e versão do formato |
| Classificação | Amostra visual, experimento, paper/dry-run ou operação real; nunca inferida só pela presença de uma cotação pública |
| Período/corte | Intervalo analisado, instante do corte, fuso de apresentação e instante de geração |
| Vínculos | Análises, propostas/versões, lote/decisão, autorizações, ordens, posição e ciclos financeiros pertinentes |
| Retrato de entrada | Fontes, versões, instantes do fato/registro, políticas, posição, recursos e obrigações usados |
| Conteúdo factual | Valores, unidades, bases, precisão, fórmulas/versões e estado de disponibilidade |
| Conteúdo analítico | Diagnóstico/justificativa, responsável ou proveniência do modelo quando houver, horizonte e limites |
| Completude | Entradas esperadas/recebidas/ausentes, inconsistências e blocos afetados |
| Revisão | Relatório anterior, motivo, responsável, correções e períodos atingidos |
| Consulta | Escopo de acesso; referência a anexos/evidências sem segredos ou dados não autorizados |

Identidade financeira e versão de apresentação são distintas. Reabrir, filtrar, traduzir ou formatar o mesmo relatório não cria novo investimento, decisão ou resultado.

## 4. Geração de cada família

“Disparador” é evento lógico de atualização, não criação de novo serviço, agenda aprovada ou botão para o usuário.

| Família | Disparador e entradas | Cálculo/verificação e entrega |
|---|---|---|
| 1. Análise do subagente | Rodada concluída, nova evidência relevante ou falha; dados, perfil, posição e inferência quando usada | Janela/validade, medidas e proveniência; análise/contrapontos ou impedimento explícito; vínculo à proposta quando emitida |
| 2. Proposta e qualificação | Recepção, correção, nova versão, vencimento ou resposta; pacote e recibos | Completude, unidades, termos, risco próprio e validade; resultado da qualificação por versão sem apagar devoluções |
| 3. Consolidação Cripto | Mudança material no conjunto dos especialistas; todas as análises/pacotes e pendências | Agrupar por ativo/estratégia, identificar dependências, correlação e lacunas; não escolher só favoritas nem ocultar bloqueadas |
| 4. Decisão BETTEX | Fechamento/revisão de lote ou impossibilidade de decidir; qualificadas, posições e retratos | Planos/tamanhos, resultados calculáveis, impedimentos e escolha justificada; caixa/espera/pendência também geram registro |
| 5. Risco e Governança | Parecer, veto, mudança de política/pausa/autoridade; exposição, cenários e regras | Bases/limites efetivos, diferenças, violações, condições e impacto nas ações futuras; não substituir risco próprio ausente |
| 6. Tesouraria | Retrato, reserva, obrigação, efeito ou divergência; recursos e compromissos | Caixa/ativo/reservado/livre reconciliados, disponibilidade por moeda e pendências; seleção não é débito |
| 7. Investimento | Autorização, preenchimento, revisão, proteção ou saída; pacote original e eventos | Quantidade/custo/resultado, prazos, mudanças autorizadas e exposição restante; um investimento atravessa ciclos |
| 8. Fechamento do ciclo | Corte financeiro, conferência ou correção; retratos e eventos das demais famílias | Consolidar estoque/fluxos/resultado, herdadas e pendências; encaminhar apuração/direitos conforme regras próprias, sem pagamento por gerar relatório |

Se um especialista não tem análise, Cripto registra ausência em vez de inventar consenso. BETTEX conserva essa ausência e registra se ela impede a comparação. Falha de análise não autoriza ocultar ordens, posições ou obrigações existentes.

## 5. Sequência de montagem e consistência

1. Fixar família, escopo, intervalo/corte e versões que serão usados.
2. Reunir os registros ligados ao corte, incluindo pendências, rejeitadas e herdadas relevantes.
3. Conferir identidade, classificação da evidência, unidades e instantes; distinguir o que ocorreu do que era conhecido à época.
4. Calcular métricas determinísticas e reconciliar suas bases; registrar falhas por bloco.
5. Associar análises/justificativas existentes e suas versões, sem atualizar o passado com conhecimento futuro.
6. Conferir vínculos cruzados entre proposta, decisão, autorização, efeito, posição e apuração.
7. Emitir versão com estado de completude, corte e dependências; preservar original se houver revisão.
8. Derivar gráficos/tabelas e leitura por idioma/filtro da mesma versão.

Não montar um lote com proposta antiga e parecer atual sem informar/revalidar a diferença, nem misturar posição de um instante com caixa de outro como se fossem um retrato reconciliado. Reconsulta de fonte posterior não “melhora” silenciosamente o corte original.

Uma nova versão pode atualizar o conhecimento, mas deve distinguir **fato no período**, **conhecido na decisão** e **correção posterior**. Nenhum gráfico apaga a versão usada pela decisão original.

## 6. Estados, falhas e atualizações

| Estado do documento | Significado |
|---|---|
| Em preparação | Reunião/conferência não concluídas; não declarar fechamento |
| Parcial | Conteúdo utilizável identificado, com blocos ausentes/afetados explícitos |
| Impedido/inconsistente | Falta dependência essencial ou há divergência que impede a conclusão correspondente |
| Conferido no escopo | Vínculos e verificações declarados foram satisfeitos para o corte, com seus limites |
| Revisado | Versão nova com motivo, diferenças e ligação à anterior |

“Conferido” não significa modelo calibrado, auditoria independente, autorização financeira ou ALFA pronta. Essas evidências têm seus próprios estados.

Falha de inferência preserva números verificáveis, com narrativa indisponível. Falha de reconciliação preserva o registro da divergência e impede apresentar saldo livre/lucro como conhecido. Sem nova evidência, repetição da geração não converte parcial em completo.

O mesmo disparador/registro não deve duplicar documento financeiro ou contador de eventos. Idiomas e filtros podem gerar apresentações distintas do mesmo relatório, mantendo identidade e bases. Consultar não dispara nova análise nem nova operação.

## 7. Relógios e fechamento financeiro

Relatórios de análise identificam rodada técnica; decisões identificam lote; fatos financeiros identificam o ciclo pelo instante aplicável. Manter os identificadores separados, mesmo quando uma interface agrupa sua consulta.

No roteiro visual do demo e nos exemplos documentais, o corte financeiro de 16h a 16h, em São Paulo, inclui abertura e exclui encerramento. Isso não altera instantes, períodos ou regras de registros/contratos nativos; a ALFA deve identificar as regras vigentes de cada relógio. Marcação do fechamento identifica o instante da observação utilizada; não usar preço futuro para completar o período anterior.

Posição herdada conserva identidade/custo e referencia os ciclos de origem. Autorizações/reservas incertas aparecem como pendências, não como caixa liberado. Resultado realizado, variação de não realizado e fluxos externos seguem as bases do relatório de ciclos.

Um relatório de ciclo com pendência pode descrever os fatos conhecidos, mas não declarar apuração/distribuição final onde a incerteza impede essa conclusão. Direitos, tributos, retenções e pagamentos não são criados pelo processo de montagem.

## 8. Gráficos, filtros e consulta

Os [gráficos definidos por ciclo](trading-cycle-reports.md#10-gráficos-significado-e-origem) recebem séries com fonte, unidade, corte, classificação e versão. Previsão/horizonte e observação posterior ficam distinguíveis; sem intervalo sustentado, não desenhar faixa de confiança.

Aplicar filtro deixa claro o denominador e se a visão é parcial. Totais devem indicar o que excluem. Não comparar expectativa de todas as propostas com resultado somente das vencedoras sem explicar universos e vieses.

Taxa de acerto usa encerradas/reconciliadas conforme definição e informa amostra. Seleção não é sucesso do especialista; posição valorizada não é lucro realizado. Rejeitadas acompanhadas depois são contrafactuais.

Central permanece somente consulta, com navegação entre famílias, versões e evidências. Exportação, quando prevista em seu escopo próprio, conserva filtros/corte e proteção de acesso; não reintroduz botões de download na documentação pública.

## 9. Casos de verificação da geração

| Caso | Resultado exigido |
|---|---|
| Sem proposta emitida pelo especialista | Relatório de análise pode existir; não inventar proposta |
| Proposta incompleta/rejeitada | Relatório conserva devolução, origem e versão; não desaparece do consolidado |
| Dois especialistas repetem mesma fonte | Consolidado registra dependência; não apresenta duas confirmações independentes |
| Lote escolhe não entrar | Decisão justificada e relatada, sem ordem/posição fictícias |
| Cálculo correto e modelo indisponível | Fatos preservados, análise indisponível; sem resumo fixo apresentado como inferência |
| Modelo produz narrativa incompatível com registros | Não publicar o fato inventado; registrar inconsistência e tratar a análise |
| Reserva/ordem incerta | Relatórios mostram compromisso/pendência; não liberam recursos |
| Duas parcelas e dois ciclos | Mesmo investimento; custos/eventos atribuídos uma vez e herdados corretamente |
| Preço não realizado positivo com saldo sem saída | Identificar marcação e limitação de liquidez; não tornar valor disponível |
| Mesma geração repetida | Mesma origem/efeito; sem duplicação de decisões, lucros ou contadores |
| Correção de dado antigo | Versão corretiva e ciclos atingidos, preservando relatório/decisão anteriores |
| Idioma/filtro diferente | Mesmas bases financeiras; escopo/denominador explícitos |
| Relatório de fechamento com divergência | Pendência relatada; apuração final afetada não é declarada concluída |

## 10. Critério de aceite e estado real

Uma futura geração integrada precisa demonstrar, para cada família: disparador, entradas/versionamento, cálculo responsável, análise responsável, estado de falha, vínculos, consulta e caso de verificação. A evidência deve mostrar que relatórios e gráficos reproduzem os mesmos registros sem efeitos financeiros adicionais.

**Esta entrega revisa a especificação de geração e dependências.** Não implementa o gerador das oito famílias nem afirma que funções legadas satisfazem o mandato spot. Também não certifica todas as funções determinísticas do produto. Testes operacionais e adaptação continuam trabalhos separados sob autorização própria.
