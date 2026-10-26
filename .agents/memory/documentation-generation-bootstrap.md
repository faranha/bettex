---
name: Bootstrap da navegação documental
description: Dependência circular entre o catálogo gerado e o render usado para regenerá-lo.
---

O catálogo gerado de navegação também é entrada do render que o reconstrói. Mudanças na lista de capítulos devem tolerar temporariamente um catálogo anterior, reconciliando os IDs estáveis antes de usar índices.

**Why:** A retirada de capítulos deixou o catálogo anterior com mais posições do que a estrutura atual; a geração falhou no próprio render, antes de conseguir atualizar o catálogo.

**How to apply:** Ao mudar a estrutura documental, regenerar os três idiomas e conferir atalhos antigos, numeração, capítulos recolhidos e propriedade das âncoras. Não preservar capítulos retirados apenas para satisfazer verificações históricas: atualizar essas verificações com exigências positivas para o produto atual e negativas para o conteúdo removido.
