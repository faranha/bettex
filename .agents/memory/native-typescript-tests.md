---
name: Testes nativos de TypeScript
description: Diferença entre resolução ESM do Node e compilação empacotada do servidor.
---

Módulos do servidor usados pelos testes nativos de TypeScript precisam funcionar tanto com a resolução ESM estrita do Node quanto com a compilação empacotada da aplicação.

**Why:** Um import aceito pelo compilador e pelo empacotador não foi resolvido por `node --test`; corrigir a extensão para o Node também exigiu compatibilidade do compilador. Um servidor compilável, sozinho, não valida os testes executados diretamente das fontes.

**How to apply:** Ao extrair módulos usados por testes nativos, validar os testes diretos e a checagem TypeScript do artefato. Manter a solução restrita ao artefato em vez de mudar a configuração de todas as bibliotecas ou introduzir um novo executor sem necessidade.