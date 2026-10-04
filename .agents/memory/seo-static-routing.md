---
name: SEO e roteamento estático
description: A publicação pode devolver o HTML da homepage mesmo quando o build gerou páginas próprias.
---

Validar o HTML entregue por HTTP de cada rota pública, não apenas o arquivo gerado nem o título visível depois de executar JavaScript.

**Why:** Na revisão da BETTEX, os componentes alteravam metadados no navegador, mas bots recebiam a homepage. Mesmo após pré-renderizar as páginas, uma reescrita genérica da publicação continuaria enviando todas as rotas ao mesmo HTML.

**How to apply:** Servir o HTML próprio de cada rota; em hospedagem estática, manter reescritas específicas para os arquivos de cada página. Não reintroduzir fallback genérico para a homepage. Em mudanças de SEO/publicação, conferir resposta inicial, título, canonical, H1/conteúdo, imagem social real e comportamento de rotas inexistentes no servidor usado pela publicação. Checagens locais não comprovam que a versão publicada foi atualizada.

A pré-renderização precisa de um template SPA vazio, não do HTML já pré-renderizado da homepage.

**Why:** Uma segunda execução isolada reaproveitou a homepage já preenchida; registrou renderização por rota, mas gravou o conteúdo da homepage em todas elas.

**How to apply:** Partir de build novo ou de template vazio preservado; falhar explicitamente quando o template não tiver o ponto de inserção. Auditar o conteúdo de cada arquivo, não somente os logs.