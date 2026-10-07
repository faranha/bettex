---
name: Extrato completo das carteiras
description: Escopo solicitado para histórico, exportações e referências em reais.
---

O Histórico deve reunir transações e operações relacionadas às carteiras do usuário, inclusive rendimento, com tags por tipo, filtros por carteira e tipo e uma área de download. A referência em BRL precisa ficar claramente associada ao valor principal; taxas ficam separadas.

**Why:** O criador pediu esses recursos, corrigiu a posição do valor em reais e retirou a opção “View illustrative examples” do Histórico.

**How to apply:** Exportar o arquivo histórico armazenado, não apenas as últimas movimentações exibidas. Preservar a origem dos registros e distinguir solicitações de créditos concluídos. Não reintroduzir a opção de exemplos ilustrativos: a tela e seus downloads usam os registros armazenados da fonte selecionada. A cotação simulada não é preço de mercado do token nativo nem preço histórico de execução.

A leitura do extrato salvo não deve depender da disponibilidade da sincronização ao vivo da blockchain.

**Why:** Os runtimes da blockchain podem ficar offline independentemente do banco do histórico; tratar falta de atualização como perda do arquivo provocou falhas recorrentes no extrato.

**How to apply:** Separar disponibilidade dos registros e atualização ao vivo. Exibir registros salvos com aviso de que atividades recentes podem faltar, sem inventar confirmações. Falhas reais de leitura ou de paginação continuam sendo erros e não podem gerar uma exportação parcial apresentada como completa.

Os atalhos de histórico de todas as áreas usam apenas o ícone, sem rótulo visível, seguindo o botão do sorteio diário.

**Why:** O criador preferiu o padrão mais simples do sorteio diário e pediu aplicá-lo aos outros botões de histórico.

**How to apply:** Manter os destinos e ações existentes, nomes acessíveis e dicas traduzidas. A regra é para atalhos de histórico, não para remover títulos de páginas ou nomes de áreas na navegação.

No cartão da Loteria de queima, os acessos à Tesouraria e ao Histórico devem ser compactos, sem atalhos de histórico duplicados nem uma área extra só para esses acessos.

**Why:** O criador apontou o espaço excessivo ocupado pelos acessos e corrigiu: “history is duplicated”.

**How to apply:** Agrupar os atalhos na área do cabeçalho, preservar nomes acessíveis e não remover saldo, timer, participação ou informações da loteria para reduzir a altura.

O histórico da Loteria de queima deve existir apenas dentro do histórico por rodada, sem um segundo bloco independente na página Histórico.

**Why:** O criador apontou o bloco duplicado e disse “this is already inside the round history area”.

**How to apply:** O atalho da loteria abre a aba Loteria da rodada correspondente. Preservar os registros e filtros por rodada; remover apenas a apresentação duplicada.

O diário de recompra e queima também deve ser agregado ao histórico por rodada, sem um bloco independente.

**Why:** O criador apontou esse diário e pediu “this must be aggregated into the round history”.

**How to apply:** Usar a aba Queima para os eventos da rodada selecionada, preservando filtros, paginação e exportação CSV. Os atalhos abrem essa aba, não um segundo diário.

Não exibir uma seção independente de detalhes da rodada anterior na página Histórico.

**Why:** O criador disse “this is not needed, previous rounds are inside the round history”.

**How to apply:** Consultar rodadas anteriores pelo arquivo de rodadas, preservando seus detalhes e registros; não reintroduzir o resumo duplicado abaixo do extrato.

No Histórico, o arquivo de rodadas deve ficar depois da apresentação da rodada atual, não antes dela.

**Why:** O criador mostrou a lista do arquivo e pediu “isso pode ser depois do current no history”.

**How to apply:** Priorizar os detalhes da rodada selecionada acima do arquivo. Preservar busca e paginação; selecionar uma rodada leva aos detalhes, paginar mantém o foco no arquivo.
