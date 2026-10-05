---
name: Política de embeds em produção
description: O preview Vite não valida a CSP do servidor publicado; embeds exigem cobertura específica no servidor de produção.
---

Não considerar uma captura funcional do preview como prova de que um iframe externo funciona no site publicado. A política de segurança do servidor publicado não é aplicada pelo Vite.

**Why:** Um player do Pitch carregava normalmente no preview, enquanto a CSP publicada bloqueava seu domínio. O erro só ficou comprovado ao consultar os headers HTTP reais.

**How to apply:** Ao alterar CSP ou incorporar mídia externa, verificar o domínio usado pelo componente contra `frame-src` no servidor publicado e manter uma regressão que confira essa compatibilidade. Liberar apenas o domínio necessário, sem flexibilizar todos os iframes ou scripts externos.
