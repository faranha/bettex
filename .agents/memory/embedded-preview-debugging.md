---
name: Preview embutido
description: Como interpretar diferenças entre o preview dentro do Replit e verificações em uma janela separada.
---

Não descartar erros relatados no preview embutido porque consultas diretas à API ou testes em uma janela separada passaram.

**Why:** O criador relatou falhas simultâneas nos históricos dentro do preview do Replit enquanto as verificações autenticadas em janela separada carregavam registros. Foi necessário corrigir a suposição sobre o ambiente.

**How to apply:** Confirmar o contexto de navegação e reproduzir o mesmo tipo de incorporação quando esse contexto importar. Considerar acesso ao armazenamento, inicialização da sessão e falhas anteriores ao envio da consulta; ausência de erro HTTP no servidor não demonstra ausência de falha no navegador.
