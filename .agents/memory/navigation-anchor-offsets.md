---
name: Deslocamento das âncoras sob navegação fixa
description: Ao mudar a altura da navegação, conferir a rolagem JavaScript e o índice fixo, não apenas scroll-margin.
---

Uma mudança na altura da navegação precisa ser refletida também no cálculo da rolagem por JavaScript e no espaço ocupado por índices fixos.

**Why:** A barra móvel em duas linhas deixou títulos da documentação escondidos mesmo depois de corrigir a variável de altura e o CSS. O cálculo JavaScript ainda descontava a altura antiga e não considerava o intervalo antes do índice.

**How to apply:** Em alterações futuras da navegação, conferir links diretos com fragmento e títulos visíveis em celular. Ajustes em scroll-margin não corrigem um scrollTo que calcula a posição por conta própria.

No mobile, Pitch, Documentação, Demo e o seletor de idioma devem ficar dentro do menu hambúrguer, sem uma segunda linha de botões sob o cabeçalho.

Pitch, Documentação e Demo ficam numa seção própria no fim do menu, após Roadmap, não no topo. O seletor de idioma continua dentro do menu.

**Why:** O usuário pediu expressamente retirar a linha adicional e mover a opção de língua para o menu. As três opções de páginas podem se diferenciar do restante do menu, mas devem compartilhar o mesmo estilo de cor.

**How to apply:** Manter o cabeçalho móvel em uma linha e preservar essa organização nos três idiomas. Considerar a altura reduzida ao posicionar índices fixos e rolar para âncoras.

No cabeçalho desktop, a página ativa entre Pitch, Documentação e Demo deve continuar com formato de botão e uma coloração sutil, sem destaque amarelo nem marcação por sublinhado.

**Why:** O criador rejeitou a marcação de Documentação como texto amarelo sublinhado e pediu preservar o botão com uma cor mais discreta.

**How to apply:** Manter as dimensões e o formato dos botões de páginas; diferenciar a página atual por um fundo discreto, sem alterar a organização do menu.