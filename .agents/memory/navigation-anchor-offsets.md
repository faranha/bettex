---
name: Deslocamento das âncoras sob navegação fixa
description: Ao mudar a altura da navegação, conferir a rolagem JavaScript e o índice fixo, não apenas scroll-margin.
---

Uma mudança na altura da navegação precisa ser refletida também no cálculo da rolagem por JavaScript e no espaço ocupado por índices fixos.

**Why:** A barra móvel em duas linhas deixou títulos da documentação escondidos mesmo depois de corrigir a variável de altura e o CSS. O cálculo JavaScript ainda descontava a altura antiga e não considerava o intervalo antes do índice.

**How to apply:** Em alterações futuras da navegação, conferir links diretos com fragmento e títulos visíveis em celular. Ajustes em scroll-margin não corrigem um scrollTo que calcula a posição por conta própria.

O espaço de `scroll-padding` do documento e o de `scroll-margin` do destino são cumulativos. A homepage deve descontar o cabeçalho uma única vez e alinhar o começo do bloco, preservando o padding interno da seção.

**Why:** O fim da seção anterior permanecia visível porque algumas âncoras compensavam duas vezes a mesma navegação fixa.

**How to apply:** Conferir as duas regras em conjunto, inclusive estilos próprios de Nova Economia e Roadmap. A documentação tem um índice fixo adicional no celular: compensar sua altura real, sem uma folga extra e sem contá-lo na abertura anterior ao índice.

Não medir o destino de uma âncora durante uma animação que translada o próprio elemento.

**Why:** A leitura pode capturar uma posição transitória; quando a animação termina, o destino fica parcialmente sob a navegação, apesar de o offset estar correto.

**How to apply:** Em capítulos revelados imediatamente antes da rolagem, preferir animação de opacidade sem deslocamento geométrico ou medir somente uma posição estável.

A altura persistente do cabeçalho não basta para validar a estabilidade da navegação durante a abertura do menu mobile.

**Why:** Foi observado deslocamento do alvo e mudança da seção destacada sem alteração do fragmento, mesmo com a altura persistente do cabeçalho constante. Conferir apenas o offset do cabeçalho pode ocultar esse problema.

**How to apply:** Conferir conjuntamente endereço, posição do alvo e seleção do submenu nos estados fechado, aberto e fechado novamente. A preservação da seleção e da posição precisa ser demonstrada no navegador, não presumida a partir da altura medida ou de uma guarda no rastreamento.

No cabeçalho desktop, a página ativa deve continuar com formato de botão e uma coloração sutil, sem destaque amarelo nem marcação por sublinhado.

**Why:** O criador rejeitou a marcação de Documentação como texto amarelo sublinhado e pediu preservar o botão com uma cor mais discreta.

**How to apply:** Manter as dimensões e o formato dos botões de páginas; diferenciar a página atual por um fundo discreto, sem alterar a organização do menu.
