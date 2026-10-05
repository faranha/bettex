---
name: Comparação de evidências JSONB
description: Por que igualdade baseada em ordem de chaves falha após reinício e persistência PostgreSQL.
---

Termos imutáveis e evidências recuperados de JSONB precisam de comparação estrutural/canônica, não de serialização sensível à ordem das chaves.

**Why:** PostgreSQL reorganiza chaves, inclusive em objetos aninhados. Uma evidência idêntica foi rejeitada como conflito somente após recuperação do banco, embora testes em memória passassem.

**How to apply:** Ao verificar idempotência e fingerprints após persistência, testar também um roundtrip PostgreSQL/reordenação recursiva. Preservar a ordem de arrays quando tiver significado e excluir da identidade apenas metadados que não renovam a evidência.
