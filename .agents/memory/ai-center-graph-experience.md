---
name: Grafo exclusivo dos agentes da Central
description: Agentes e subagentes de Cripto ficam no grafo; controles e áreas do negócio ficam fora, sem navegação duplicada ou largura especial.
---

O grafo da Central da IA mostra apenas agentes e conexões entre agentes. O que não é agente fica fora do grafo, em áreas de apoio separadas.

**Why:** A orientação anterior de integrar toda a Central à rede foi substituída pela correção explícita: “o grafo mostra apenas os agentes [...] se nao eh agente, nao esta aqui, isso deveria estar fora daqui”.

**How to apply:** Manter a experiência espacial dos agentes, sem transformar controles ou temas do negócio em agentes. Governança, risco, tesouraria, execução, registros, capital, comunidade, token, jogos e participação continuam acessíveis fora da rede. A orientação posterior do criador inclui BTC, ETH e SOL no grafo como subagentes de Cripto, não como agentes setoriais independentes. Preservar painéis, atalhos, links antigos e a ausência de operações reais.

Não duplicar os breadcrumbs do header na Central da IA nem ampliar a Central além da largura padrão das páginas do app. Exibir também os agentes em desenvolvimento no topo, com links desativados.

**Why:** O criador corrigiu expressamente: “ja temos no header, nao faz isso”, “nao respeitou a largura da pagina, nao faca isso” e pediu os demais agentes, mesmo “em desenvolvimento, em breve”.

**How to apply:** Reutilizar a largura e navegação principal do aplicativo. BTC, ETH e SOL pertencem à hierarquia interna de Cripto; os demais setores previstos continuam visíveis e indisponíveis.

## Revisões de legibilidade

A faixa de indicadores da Central deve rolar lateralmente de forma contínua, como um painel Bloomberg.

**Why:** O criador mostrou a faixa com execuções, pedidos, tesouraria, exposição e previsões e pediu “rolando lateralmente estilo painel bloomberg”.

**How to apply:** Preservar a faixa horizontal fora do grafo dos agentes, com o conteúdo e os atalhos dos indicadores. Permitir interromper o movimento para leitura e navegação e respeitar a preferência por movimento reduzido.

A Central deve representar a visão atual do negócio, com percursos de leitura entre Central, painel, Tesouraria, Histórico e documentação, sem inserir essas áreas como nós de agentes.

**Why:** O criador pediu que essas áreas funcionem como uma demonstração coerente de toda a visão documentada, com informações e fluxos válidos, não apenas uma hierarquia de agentes.

**How to apply:** Conferir participação, apuração condicional, recompra, queima, administração e disponibilidade planejada nas áreas de apoio fora do grafo. Distinguir exemplos didáticos de execução de movimentos financeiros e capacidades comprovadas.

Preservar a navegação espacial ao corrigir os rótulos. No celular, a vista inicial mostra parte da rede e o usuário pode deslocar a câmera; rótulos de nós fora do quadro não devem ser trazidos automaticamente para a área visível.

**Why:** A primeira tentativa de evitar sobreposições considerou também os nós fora da câmera. Isso deslocou seus rótulos para cima de agentes visíveis, sem mover os respectivos nós, criando associações visuais incorretas.

**How to apply:** Resolver colisões apenas entre rótulos no quadro atual, após a projeção da câmera. Conferir também rotação, zoom e telas estreitas; uma captura desktop em posição inicial não comprova essas situações.

Conferir a geometria vertical dos painéis com conteúdo longo, antes e depois de rolar ou expandir detalhes. Verificações de contraste e largura não garantem que cabeçalho, abas e conteúdo estejam separados e legíveis.

**Why:** O criador apontou telas se sobrepondo após a revisão anterior. Os testes de contraste passavam, mas o conteúdo longo comprimia a altura das abas; elas ganhavam rolagem vertical e seus botões eram cortados.

**How to apply:** Incluir telas baixas na revisão. Cabeçalho e abas não devem encolher para acomodar o histórico; a área de conteúdo precisa ter espaço útil e ser a responsável pela rolagem vertical.

Conferir o contraste de parágrafos, listas e valores no contexto real do inspetor, não apenas o título ou o componente isolado.

**Why:** A adaptação escura do inspetor também estiliza os descendentes. Cartões claros novos mantiveram texto claro mesmo depois de corrigir a cor do contêiner e dos títulos.

**How to apply:** Inspecionar a leitura do corpo dos cartões nos painéis de regras, valores e conexões, em desktop e celular, inclusive depois de rolar.

Validar os links de percurso pelo conteúdo efetivamente filtrado no destino, não apenas pela URL ou pelo funcionamento isolado do filtro.

**Why:** O link e o filtro de correlação estavam corretos separadamente, mas a tela de destino não transferia o parâmetro para o estado da consulta; registros sem relação apareciam no percurso.

**How to apply:** Abrir um percurso pelo grafo e conferir que o Histórico mostra somente seus registros, mantendo os exemplos didáticos separados do extrato financeiro pessoal.
