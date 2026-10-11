---
name: Deslocamento das âncoras sob navegação fixa
description: Ao mudar a altura da navegação, conferir a rolagem JavaScript e o índice fixo, não apenas scroll-margin.
---

Aplicar o deslocamento das barras fixas apenas uma vez. `scroll-padding`
global e `scroll-margin` do destino são cumulativos; rolagem com comportamento
`auto` também pode herdar o `smooth` do site institucional.

**Why:** O submenu fixo parecia correto, mas as âncoras do Painel continuavam
terminando antes da seção esperada e o criador reiterou o problema.

**How to apply:** Conferir a posição final contra a borda inferior das barras
reais em desktop e mobile, incluindo cliques repetidos e links diretos.
Não presumir que a soma escrita no CSS corresponde à posição final no navegador.

No mobile, o menu principal do hambúrguer deve abrir diretamente abaixo da linha principal do header, sobre qualquer submenu da página, nunca abaixo dele.

**Why:** O criador explicou que as páginas acessadas pelo hambúrguer são primárias e o menu principal não pode parecer secundário.

**How to apply:** Preservar a altura e a seleção do submenu por trás do overlay, bloqueando sua interação enquanto o menu principal estiver aberto. Fechar o overlay restaura o submenu sem alterar fragmento, seção ou rolagem.

Quando uma opção do menu lateral navega para uma âncora, coordenar a
restauração do foco com a rolagem depois do fechamento do diálogo.

**Why:** O endereço já apontava para a Central na home, mas a restauração
automática do foco ao botão do header puxava o celular de volta ao topo.
O mesmo link funcionava como atalho fora do diálogo.

**How to apply:** Restaurar o foco sem induzir rolagem e chegar ao alvo após
o fechamento do overlay, em vez de depender de um atraso arbitrário.
Verificar posição real do conteúdo, não apenas o fragmento do endereço.

Ao verificar headers sticky, distinguir rolagem induzida pela automação de uma alteração causada pelo produto.

**Why:** O clique por seletor do Playwright rolou a página antes de acionar o botão; um clique de ponteiro nas coordenadas visíveis do mesmo botão não alterou a posição. O efeito parecia uma regressão de navegação.

**How to apply:** Para simular um toque num botão já visível do header, usar sua posição no viewport e comparar fragmento, seleção e rolagem antes de abrir, durante o overlay e depois de fechar.

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
