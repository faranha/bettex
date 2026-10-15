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

No celular, os comandos da câmera devem aparecer sob demanda, sem cobrir
o mapa dos agentes. Manter acesso para abrir e recolher os comandos.

**Why:** O criador mostrou os ícones sobre o próprio grafo e disse que
“esses ícones tinham que desaparecer e aparecer”.

**How to apply:** Reservar espaço fora da área desenhada para os controles
mobile, inclusive quando expandidos. Preservar os gestos e a saída da tela
ampla; não substituir o problema por outro painel flutuante sobre os nós.

Não reintroduzir “Sobre esta demonstração” nem sua nota expansível acima do grafo. Preservar o título; a instrução posterior concentra a indicação DEMO no menu, sem selo repetido na Central.

**Why:** O criador apontou esse bloco e pediu “tire sobre esta demonstracao por favor”.

**How to apply:** Manter o cabeçalho compacto; os demais avisos existentes continuam identificando o caráter demonstrativo.

As cotações da Polymarket pertencem aos detalhes dos nós de Cripto e seus subagentes no grafo, inclusive quando apresentados em overlay. Não expor esse painel como um bloco separado abaixo do grafo. A orientação posterior restringe a Central à consulta, sem simuladores configuráveis pelo usuário.

**Why:** O criador apontou o bloco separado de cotações e simulação e corrigiu: “mesmo em overlay, isso deveria ficar dentro do grapho”.

**How to apply:** Manter a leitura dos mercados acessível pelos nós de Cripto, BTC, ETH e SOL, sem duplicar o painel fora dessa navegação. Essa regra não transforma controles de negócio em agentes.

Evitar uma grande lista simultânea de atalhos ou grades empilhadas de cartões nas áreas de apoio da Central. Manter categorias compactas e apresentar suas opções sob demanda, preservando o acesso a todos os destinos.

**Why:** O criador rejeitou a organização com todos os controles, registros e tópicos juntos: “a organizacao disso aqui esta pessima [...] uma bagunca visual”. Depois rejeitou também a grade por categoria: “esse empilhamento ainda esta pessimo nas opcoes”.

**How to apply:** Ao acrescentar áreas, preservar a hierarquia e a seleção por categoria, com rótulos legíveis também no celular. Não voltar à lista completa de botões ou cartões ocupando várias linhas.

Os detalhes da Central devem abrir em uma janela overlay ampla e bem definida, não em uma coluna estreita dividindo espaço com o grafo.

**Why:** O criador rejeitou o painel lateral: “fica estranho nao da pra ler tudo” e pediu “abrir em overlay uma janela bem definida”.

**How to apply:** Manter o conteúdo completo e as abas acessíveis, com rolagem própria, fechamento e retorno ao contexto anterior. Não restaurar a coluna estreita ou o painel parcialmente cortado no celular.

A faixa de indicadores da Central deve rolar lateralmente de forma contínua, como um painel Bloomberg.

**Why:** O criador mostrou a faixa com execuções, pedidos, tesouraria, exposição e previsões e pediu “rolando lateralmente estilo painel bloomberg”.

**How to apply:** Preservar a faixa horizontal fora do grafo dos agentes, com o conteúdo e os atalhos dos indicadores. Permitir interromper o movimento para leitura e navegação e respeitar a preferência por movimento reduzido. Não exibir a barra de rolagem nessa faixa: o criador indicou a barra inferior e pediu “aqui nao quero barra de rolagem”.

A Central deve representar a visão atual do negócio, com percursos de leitura entre Central, painel, Tesouraria, Histórico e documentação, sem inserir essas áreas como nós de agentes.

**Why:** O criador pediu que essas áreas funcionem como uma demonstração coerente de toda a visão documentada, com informações e fluxos válidos, não apenas uma hierarquia de agentes.

**How to apply:** Conferir participação, apuração condicional, recompra, queima, administração e disponibilidade planejada nas áreas de apoio fora do grafo. Distinguir exemplos didáticos de execução de movimentos financeiros e capacidades comprovadas.

Preservar a navegação espacial ao corrigir os rótulos. No celular, a vista inicial mostra parte da rede e o usuário pode deslocar a câmera; rótulos de nós fora do quadro não devem ser trazidos automaticamente para a área visível.

**Why:** A primeira tentativa de evitar sobreposições considerou também os nós fora da câmera. Isso deslocou seus rótulos para cima de agentes visíveis, sem mover os respectivos nós, criando associações visuais incorretas.

**How to apply:** Resolver colisões apenas entre rótulos no quadro atual, após a projeção da câmera. Conferir também rotação, zoom e telas estreitas; uma captura desktop em posição inicial não comprova essas situações.

Conferir a geometria vertical dos painéis com conteúdo longo, antes e depois de rolar ou expandir detalhes. Verificações de contraste e largura não garantem que cabeçalho, abas e conteúdo estejam separados e legíveis.

**Why:** O criador apontou telas se sobrepondo após a revisão anterior. Os testes de contraste passavam, mas o conteúdo longo comprimia a altura das abas; elas ganhavam rolagem vertical e seus botões eram cortados.

**How to apply:** Incluir telas baixas na revisão. Cabeçalho e abas não devem encolher para acomodar o histórico; a área de conteúdo precisa ter espaço útil e ser a responsável pela rolagem vertical.

Nos overlays, separar os blocos internos com espaços reais e hierarquia; evitar cartões encostados e todo o conteúdo empilhado em largura integral quando o desktop permite uma organização melhor.

**Why:** Mesmo depois da janela overlay, o criador reiterou: “reveja o layout dos overlays esta tudo empiljado sem espacos cara olha bem”, mostrando resumo, configuração, mandatos e limites colados.

**How to apply:** Revisar a composição interna, não apenas o tamanho da janela. Preservar informações e ações; organizar blocos relacionados no desktop e manter espaçamento entre seções na coluna do celular.

Conferir o contraste de parágrafos, listas e valores no contexto real do inspetor, não apenas o título ou o componente isolado.

**Why:** A adaptação escura do inspetor também estiliza os descendentes. Cartões claros novos mantiveram texto claro mesmo depois de corrigir a cor do contêiner e dos títulos.

**How to apply:** Inspecionar a leitura do corpo dos cartões nos painéis de regras, valores e conexões, em desktop e celular, inclusive depois de rolar.

Validar os links de percurso pelo conteúdo efetivamente filtrado no destino, não apenas pela URL ou pelo funcionamento isolado do filtro.

**Why:** O link e o filtro de correlação estavam corretos separadamente, mas a tela de destino não transferia o parâmetro para o estado da consulta; registros sem relação apareciam no percurso.

**How to apply:** Abrir um percurso pelo grafo e conferir que o Histórico mostra somente seus registros, mantendo os exemplos didáticos separados do extrato financeiro pessoal.

Não reintroduzir as abas Controles, Registros e Comunidade acima do grafo.

**Why:** O criador mostrou essas três abas e pediu: “essas 3 abas podem sumir amigo”.

**How to apply:** O grafo fica direto na home, abaixo das carteiras, sem uma
aba Agentes redundante. Retirar os botões não autoriza apagar os painéis
existentes nem quebrar seus links.

## Pacotes consultáveis no grafo existente

O criador quer pacotes em movimento no próprio grafo, nos dois sentidos entre BTC/ETH/SOL, Cripto e BETTEX: análises e propostas indo, decisões e orientações voltando. Clicar no pacote abre seus dados; expandir permite consultar os detalhes do histórico relacionado. O pacote e o registro completo da proposta devem permitir navegação direta nos dois sentidos, preservando a proposta selecionada ao voltar.

**Why:** O criador confirmou esse percurso e acrescentou: “se a pessoa quiser ver mais detalhes pode expandir e ver os detalhes do historico”. Ao comparar o pacote com o painel de pedidos, confirmou a ligação direta entre as duas telas: “sim o ideal é elas estarem conectadas”.

**How to apply:** Melhorar o grafo existente, sem recriar a Central. Vincular os pacotes aos registros demonstrativos e correlacionar envios e respostas; não tratar o movimento visual como prova de agentes ou operações reais.
