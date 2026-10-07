---
name: Tesouraria por rodada
description: Hierarquia de ativos, significado dos resultados, receita de serviços e escopo das projeções.
---

O criador exige visão hierárquica dos ativos: reserva é parte do total, assim como o capital operacional comprometido/disponível. Realizado deve representar investimentos reconciliados da rodada atual, não o acumulado histórico. A área precisa explicar cada métrica, mostrar compromissos e estimativas/target atuais e permitir consultar o estado salvo da tesouraria e as taxas das rodadas anteriores.

**Why:** O criador considerou os cartões independentes confusos e pediu planejar e executar a melhoria completa da Tesouraria.

**How to apply:** Usar “rodada / round / ronda” de forma consistente nas referências ao período financeiro, sem renomear protocolos nem ciclos macroeconômicos. Não inventar histórico factual ou uma meta aprovada inexistente. Receita de tarifas pertence à operadora privada conforme a política publicada: acompanhar à parte, sem somar aos ativos da Tesouraria nem ao lucro elegível. Não apresentar tarifas modeladas como recebimentos operacionais reais.

A projeção de capital em paper foi expressamente adiada para outro assunto.

Os blocos “Capital projection” e “Treasury policies” não devem aparecer na página da Tesouraria.

**Why:** O criador enviou uma imagem desses dois blocos e pediu removê-los da Tesouraria.

**How to apply:** Manter esses blocos fora da Tesouraria; o pedido não remove serviços ou funcionalidades de outras áreas.

**Why:** O criador disse que essa simulação pode ser discutida separadamente.

**How to apply:** Não usar esse pedido de clareza da Tesouraria como autorização para adicionar uma projeção de capital ou alterar regras econômicas.

O bloco da rodada atual deve integrar resumo e abas de tarifas da operadora, posições comprometidas, posições encerradas e histórico da rodada atual. Cada posição encerrada ocupa uma linha, com paginação para centenas de posições por dia.

**Why:** O criador pediu essas abas e essa escala diária; disse que o demo fracassa se os números não forem emulados suficientemente.

**How to apply:** Manter histórico durável separado do feed recente. A emulação deve produzir valores e eventos coerentes, persistentes e variáveis, não apenas números visuais. Uma base inicial modelada no demo é autorizada, desde que identificada como modelada, preserve o resultado e os ativos existentes e nunca seja apresentada como execução histórica real. Custos e lucro líquido precisam reconciliar com as posições; tarifas continuam fora do lucro da tesouraria. Preservar as fotos já salvas de rodadas encerradas.

O registro financeiro e o avanço do estado devem ser confirmados na mesma transação também nos percursos sem visitante.

**Why:** Salvar apenas o estado em uma execução de fundo pode deixar posições encerradas fora do arquivo paginado até a próxima visita. Isso viola a emulação independente e acumula uma fila desnecessária no estado.

**How to apply:** Verificar todos os percursos de retorno da execução, não apenas requisições da interface. O agendador interno não deve criar usuários fictícios adicionais nem aceitar comandos ou impersonar uma conta.

O topo do resumo da rodada deve mostrar um contador ao vivo, progresso do período e um ID explícito. Rodadas atuais e passadas precisam exibir seus IDs também no histórico.

**Why:** O criador pediu esses três elementos no resumo da Tesouraria para saber quando a rodada termina e identificar todas as rodadas.

**How to apply:** Usar o identificador persistido, sem criar uma segunda numeração só na interface nem renumerar registros antigos. O ID deve coincidir entre resumo, atividade e histórico. Contador e progresso seguem os instantes reais de abertura e encerramento, não o momento da visita nem os ticks do gráfico.

O histórico deve ser completo por rodada, com todos os detalhes registrados. O link ao lado da rodada na Tesouraria abre a página Histórico com essa rodada selecionada.

**Why:** O criador pediu “history per round full round history with all details, and this link will take to the history page”.

**How to apply:** Preservar a seleção ao navegar e recarregar. Reunir a foto financeira, distribuição, participação e atividades da mesma rodada; não misturar dados atuais com rodadas passadas. Uma fonte de resumo `seeded_demo` não prova ausência de registros individuais: pode existir um arquivo persistido do roteiro. A disponibilidade deve vir dos registros efetivamente retidos, nunca de uma suposição baseada na origem do resumo.
