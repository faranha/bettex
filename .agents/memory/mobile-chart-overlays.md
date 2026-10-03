---
name: Overlays de gráficos no mobile
description: Tooltips podem alargar a documentação quando gráficos ficam dentro de sanfonas.
---

Limitar a largura de um tooltip não basta: sua posição também precisa respeitar o espaço disponível no gráfico. Um overlay com `visibility: hidden` ainda pode aumentar a largura rolável da página.

**Why:** Ao introduzir sanfonas na documentação, seus espaçamentos reduziram a área do gráfico. O tooltip invisível extrapolava a página; corrigir apenas essa condição e limitar a largura ainda deixou o tooltip visível extrapolar ao seguir o cursor.

**How to apply:** Em alterações de leitura/layout, conferir a documentação estreita com todas as sanfonas abertas e também com um tooltip ativo próximo à borda. Conter o overlay no gráfico, sem esconder conteúdo ou cortar a página para mascarar rolagem lateral.