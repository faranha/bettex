---
name: Tesouraria por rodada
description: Hierarquia de ativos, significado dos resultados, receita de serviços e escopo das projeções.
---

Helpers explicativos devem cobrir a Tesouraria tanto dentro da home quanto na página própria, não apenas as carteiras pessoais.

**Why:** O criador reforçou: “faltam helpers na treasury area dentro da home e tambem na area de treasury”.

**How to apply:** Cada novo indicador da Tesouraria deve ter uma explicação acessível por toque e teclado nas duas apresentações, quando aparecer em ambas. Não basta nomear a métrica ou deixar a explicação disponível apenas no desktop.

Não deve haver rolagem lateral na Tesouraria, em hipótese alguma: nem na home do app nem na página própria, no desktop ou no mobile. No slider, usar uma carteira por item quando necessário.

**Why:** O criador proibiu expressamente a rolagem lateral e mostrou a barra de rolagem interna das carteiras como problema.

**How to apply:** Fazer cartões, valores e controles caberem na largura disponível; manter todas as carteiras e ações acessíveis. Não apenas esconder uma barra de rolagem ou cortar conteúdo.

O criador exige visão hierárquica dos ativos: reserva é parte do total, assim como o capital operacional comprometido/disponível. Realizado deve representar investimentos reconciliados da rodada atual, não o acumulado histórico. A área precisa explicar cada métrica, mostrar compromissos e estimativas/target atuais e permitir consultar o estado salvo da tesouraria e as taxas das rodadas anteriores.

**Why:** O criador considerou os cartões independentes confusos e pediu planejar e executar a melhoria completa da Tesouraria.

**How to apply:** Usar “rodada / round / ronda” de forma consistente nas referências ao período financeiro, sem renomear protocolos nem ciclos macroeconômicos. Não inventar histórico factual ou uma meta aprovada inexistente. Receita de tarifas pertence à operadora privada conforme a política publicada: acompanhar à parte, sem somar aos ativos da Tesouraria nem ao lucro elegível. Não apresentar tarifas modeladas como recebimentos operacionais reais.

A projeção de capital em paper foi expressamente adiada para outro assunto.

A área Tesouraria deve apresentar o dinheiro dentro de carteiras claramente identificadas: carteira operacional da tesouraria, carteira de reserva distinta e carteira específica de recompra. Cada uma precisa oferecer seu endereço em um helper acessível e mostrar os saldos correspondentes.

**Why:** O criador pediu explicitamente que a reserva e a recompra sejam carteiras distintas e disse “nós temos que ver o dinheiro dentro de carteiras”.

**How to apply:** Não tratar a reserva apenas como um indicador dentro do saldo operacional. Preservar a composição do total sem dupla contagem e distinguir saldos simulados do aplicativo de fundos efetivamente existentes na blockchain.

Treasury wallets should be presented vertically on the dedicated Treasury page and horizontally on the app homepage. Remove repeated “Simulated” badges and prominent button labels; wallet details belong in helpers.

**Why:** The creator asked to improve distribution, remove repeated labels and use helpers, then specified “vertical presentation ... keep it horizontal on the homepage tho”.

**How to apply:** Preserve actual values, accounting and action behavior. Use icon-only actions with accessible names, retain addresses and details in touch/keyboard-accessible helpers, and keep one clear test-only notice rather than labeling every card.

Do not display the two numeric asset-composition equations alongside the Treasury wallets, including inside helpers.

**Why:** The creator showed the two numeric breakdown lines and asked to remove them as well.

**How to apply:** Keep wallet balances and accounting intact; explain composition in words without repeating those numeric equations.

O criador escolheu criar três carteiras de teste, não cadastrar endereços existentes nem movimentar dinheiro real.

**Why:** Na escolha entre carteiras existentes e novas, respondeu “Criar três carteiras de teste”.

**How to apply:** Tratar os endereços atribuídos como carteiras de teste. Essa escolha não aprova custódia de produção, financiamento on-chain ou operações com ativos reais.

When reflecting new Treasury wallets in history, distinguish recorded settlements from saved allocation snapshots. Missing allocations in older rounds remain unknown; current wallet values must not fill historical gaps.

**Why:** The creator asked to review all history so the new Treasury wallets are reflected there. Those wallets were introduced after some existing rounds, and allocation ownership is not evidence of an executed cash transfer.

**How to apply:** Scope statement records and downloads to the selected wallet, preserve the consolidated view, and show saved allocations separately from cash movements. Never relabel consolidated Treasury opening/closing balances as independently reconciled balances of its partitions.

Keep the detailed current-round summary out of the homepage Treasury slider; retain it on the full Treasury page.

**Why:** The creator showed the current-round, Crypto-allocation and results slide and said it is not needed in the homepage slider.

**How to apply:** Preserve the other homepage Treasury slides and its full-page link; do not remove the underlying calculations or the dedicated Treasury summary.

A Tesouraria também deve apresentar uma carteira do agente Cripto e o valor alocado na rodada. O criador escolheu usar o capital reservado nas operações aprovadas, não definir um orçamento separado.

**Why:** Pediu “uma carteira para o agente” com “o valor alocado aquele agente ... no round” e selecionou “Capital das operações aprovadas”.

**How to apply:** A alocação acompanha as posições aprovadas e deixa de estar reservada ao encerrar ou cancelar. Não confundir o limite de exposição com saldo; separar essa parcela da carteira operacional sem dupla contagem. Não inventar a alocação de rodadas antigas sem registro nem ativar agentes futuros.

Os blocos “Capital projection” e “Treasury policies” não devem aparecer na página da Tesouraria.

**Why:** O criador enviou uma imagem desses dois blocos e pediu removê-los da Tesouraria.

**How to apply:** Manter esses blocos fora da Tesouraria; o pedido não remove serviços ou funcionalidades de outras áreas.

**Why:** O criador disse que essa simulação pode ser discutida separadamente.

**How to apply:** Não usar esse pedido de clareza da Tesouraria como autorização para adicionar uma projeção de capital ou alterar regras econômicas.

O bloco da rodada atual na Tesouraria deve mostrar apenas indicadores consolidados e grandes números, sem abas ou listas de operações. Detalhes das posições, tarifas e rodadas anteriores ficam na área Histórico, com paginação para centenas de posições por dia.

A oferta de compra de BETTEX pelo site deve ter uma carteira e/ou uma pool de swapping de BETTEX apresentada também na Tesouraria.

**Why:** O criador afirmou que, se vamos oferecer a oportunidade de comprar BETTEX no site, essa estrutura precisa existir e estar na Tesouraria.

**How to apply:** Definir a estrutura de venda/conversão conforme o modelo escolhido, sem tratar a carteira de recompra e queima como substituta nem apresentar uma pool inexistente como operacional.

O criador selecionou “Pool BETTEX/USDC”, com o escopo inicial de implementação no demo, sem dinheiro real.

**Why:** A escolha foi feita no formulário que distinguia a pool de liquidez de uma carteira de venda e explicitava esse escopo.

**How to apply:** Preservar a distinção entre a pool simulada e um AMM implantado. Essa escolha não autoriza movimentar dinheiro real nem afirmar que há contrato público de liquidez.

Essa separação vale também para contas com permissões especiais; elas não devem ganhar painéis extras de histórico dentro da Tesouraria.

**Why:** O criador voltou a apontar uma lista de rodadas na Tesouraria e pediu que fosse removida.

**How to apply:** Preservar as permissões de consulta na página Histórico, sem usá-las como exceção à apresentação consolidada da Tesouraria.

O extrato da Tesouraria deve cobrir todas as entradas, saídas e transações financeiras, inclusive rendimentos de outros investimentos da própria Tesouraria.

**Why:** O criador explicitou “treasury statements, all that moved in and out, all financial transactions, including yield from other investments from the treasury”.

**How to apply:** Não limitar o extrato a posições de trading ou ao extrato pessoal das carteiras. Preservar a distinção entre a visão consolidada da Tesouraria e os registros detalhados do Histórico.

**Why:** O criador refinou a separação: “treasury se preocupa com grandes numeros, nao detalhes”. Pediu os indicadores principais da rodada atual, não a mesma apresentação detalhada do Histórico.

**How to apply:** Manter histórico durável separado do feed recente. A emulação deve produzir valores e eventos coerentes, persistentes e variáveis, não apenas números visuais. Uma base inicial modelada no demo é autorizada, desde que identificada como modelada, preserve o resultado e os ativos existentes e nunca seja apresentada como execução histórica real. Custos e lucro líquido precisam reconciliar com as posições; tarifas continuam fora do lucro da tesouraria. Preservar as fotos já salvas de rodadas encerradas.


O registro financeiro e o avanço do estado devem ser confirmados na mesma transação também nos percursos sem visitante.

**Why:** Salvar apenas o estado em uma execução de fundo pode deixar posições encerradas fora do arquivo paginado até a próxima visita. Isso viola a emulação independente e acumula uma fila desnecessária no estado.

**How to apply:** Verificar todos os percursos de retorno da execução, não apenas requisições da interface. O agendador interno não deve criar usuários fictícios adicionais nem aceitar comandos ou impersonar uma conta.

O topo do resumo da rodada deve mostrar um contador ao vivo, progresso do período e um ID explícito. Rodadas atuais e passadas precisam exibir seus IDs também no histórico.

Na área Histórico, a rodada atual deve usar o mesmo formato de cabeçalho da Tesouraria, com ID, período, contador e progresso.

**Why:** O criador mostrou esse cabeçalho e pediu “esse formato aqui pode ter no history tambem, atualmente tem no treasury”.

**How to apply:** Compartilhar a apresentação e a leitura do relógio para manter consistência, sem exibir uma rodada encerrada como atual ou reintroduzir histórico na Tesouraria.

**Why:** O criador pediu esses três elementos no resumo da Tesouraria para saber quando a rodada termina e identificar todas as rodadas.

**How to apply:** Usar o identificador persistido, sem criar uma segunda numeração só na interface nem renumerar registros antigos. O ID deve coincidir entre resumo, atividade e histórico. Contador e progresso seguem os instantes reais de abertura e encerramento, não o momento da visita nem os ticks do gráfico.

O histórico deve ser completo por rodada, com todos os detalhes registrados, consultável pela página Histórico. Não reintroduzir uma lista de rodadas passadas na Tesouraria apenas para fornecer links.

A Tesouraria deve ter um botão para o arquivo de rodadas no Histórico, onde a pessoa pesquisa rodadas anteriores.

**Why:** O criador pediu “no treasury os rounds aneriores a gente poe botao pro history e a pessoa vai pesquisar no history”.

**How to apply:** Usar um atalho compacto para a busca do arquivo, sem listar rodadas anteriores ou seus detalhes na Tesouraria.

**Why:** O criador pediu “history per round full round history with all details, and this link will take to the history page”.

**How to apply:** Preservar a seleção ao navegar e recarregar. Reunir a foto financeira, distribuição, participação e atividades da mesma rodada; não misturar dados atuais com rodadas passadas. Uma fonte de resumo `seeded_demo` não prova ausência de registros individuais: pode existir um arquivo persistido do roteiro. A disponibilidade deve vir dos registros efetivamente retidos, nunca de uma suposição baseada na origem do resumo.

O repositório de rodadas deve ser paginado e preparado para pelo menos um ano de rodadas diárias, sem excluir o histórico ao limitar os dados recentes do dashboard.

**Why:** O criador pediu “a paginated repository for the rounds” e apontou o cenário de “365 rounds” após um ano.

**How to apply:** Arquivar fotos e participação por conta antes de reduzir o estado recente, na mesma transação de encerramento, inclusive em execução sem visitante. Buscar rodadas antigas no arquivo persistido; não reconstruir valores usando saldos atuais nem criar histórico fictício para completar o ano.
