---
name: Idioma de entrada do site
description: Detecção automática de idioma e precedência das escolhas do visitante.
---

O criador determinou: “devemos aplicar a lingua do site de acordo com browser e local do usuario”.

**Why:** O idioma não deve depender de um padrão fixo em português para todos os visitantes.

**How to apply:** Usar as preferências de idioma do navegador. Se nenhuma for suportada, usar a região aproximada indicada pelo fuso horário; não solicitar localização precisa nem adicionar serviços externos de rastreamento para essa finalidade.

Links com idioma explícito prevalecem; em páginas sem idioma explícito, uma escolha manual salva prevalece sobre a detecção automática.

**Why:** A detecção não deve desfazer uma escolha consciente do visitante nem mudar o idioma de links compartilhados.

**How to apply:** Preservar a página, os parâmetros e a âncora ao mudar o idioma. Não persistir a detecção automática como se fosse uma escolha manual.
