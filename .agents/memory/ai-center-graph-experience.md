---
name: Central da IA como experiência em grafo
description: A Central inteira deve ser explorada dentro de uma rede espacial imersiva, não em um grafo opcional separado dos painéis.
---

Toda a Central da IA deve estar dentro do grafo, em uma experiência visual épica e bonita.

**Why:** O criador corrigiu a implementação de um grafo simples com uma aba separada de painéis: “toda AI center deve ser dentro desse grafo”. Depois forneceu uma referência de rede espacial densa, luminosa, sobre fundo escuro, com informações integradas ao ambiente.

**How to apply:** O grafo é a interface principal da Central, não uma ilustração da hierarquia. Configuração, mandatos, agentes, análises, históricos, pedidos, decisões, percursos, capital, risco, execução e mercados devem continuar acessíveis dentro desse ambiente. Não substituir funcionalidades completas por resumos decorativos. Preservar o escopo exclusivamente visual do demo.

## Revisões de legibilidade

Preservar a navegação espacial ao corrigir os rótulos. No celular, a vista inicial mostra parte da rede e o usuário pode deslocar a câmera; rótulos de nós fora do quadro não devem ser trazidos automaticamente para a área visível.

**Why:** A primeira tentativa de evitar sobreposições considerou também os nós fora da câmera. Isso deslocou seus rótulos para cima de agentes visíveis, sem mover os respectivos nós, criando associações visuais incorretas.

**How to apply:** Resolver colisões apenas entre rótulos no quadro atual, após a projeção da câmera. Conferir também rotação, zoom e telas estreitas; uma captura desktop em posição inicial não comprova essas situações.

Conferir a geometria vertical dos painéis com conteúdo longo, antes e depois de rolar ou expandir detalhes. Verificações de contraste e largura não garantem que cabeçalho, abas e conteúdo estejam separados e legíveis.

**Why:** O criador apontou telas se sobrepondo após a revisão anterior. Os testes de contraste passavam, mas o conteúdo longo comprimia a altura das abas; elas ganhavam rolagem vertical e seus botões eram cortados.

**How to apply:** Incluir telas baixas na revisão. Cabeçalho e abas não devem encolher para acomodar o histórico; a área de conteúdo precisa ter espaço útil e ser a responsável pela rolagem vertical.
